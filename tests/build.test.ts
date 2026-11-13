/**
 * Checks the built `dist/` output and the vercel.json routing behaviour.
 * Run `pnpm build` first (`pnpm test` does both).
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { loadRoutes, simulate } from "./vercel-routes.ts";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = join(root, "dist");
assert.ok(existsSync(join(dist, "index.html")), "dist/ is missing; run `pnpm build` first");

const routes = loadRoutes(join(root, "vercel.json"));
const read = (file: string) => readFileSync(join(dist, file), "utf8");
const MD = { Accept: "text/markdown" };
const HTML = { Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" };
const header = (headers: Record<string, string>, name: string) =>
  Object.entries(headers).find(([k]) => k.toLowerCase() === name.toLowerCase())?.[1];
const textContent = (html: string) =>
  html
    .replace(/<head>[\s\S]*?<\/head>/, "")
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

describe("Markdown content negotiation", () => {
  it("serves Markdown for the homepage when Accept: text/markdown", () => {
    const res = simulate(routes, dist, "/", MD);
    assert.equal(res.status, 200);
    assert.equal(header(res.headers, "content-type"), "text/markdown; charset=utf-8");
    assert.match(header(res.headers, "vary") ?? "", /\bAccept\b/);
    assert.ok(res.file.endsWith("index.md"));
    assert.match(res.body, /^# 広瀬 エイトル/);
  });

  it("still serves HTML for browsers, with Vary: Accept", () => {
    const res = simulate(routes, dist, "/", HTML);
    assert.equal(res.status, 200);
    assert.match(header(res.headers, "content-type") ?? "", /^text\/html/);
    assert.match(header(res.headers, "vary") ?? "", /\bAccept\b/);
    assert.match(res.body, /^<!DOCTYPE html>/i);
  });

  it("matches text/markdown inside a list of media types", () => {
    const res = simulate(routes, dist, "/", { Accept: "text/markdown, text/html;q=0.5" });
    assert.ok(res.file.endsWith("index.md"));
  });

  for (const [path, file] of [
    ["/en", "en.md"],
    ["/en/", "en.md"],
    ["/about", "about.md"],
    ["/contact/", "contact.md"],
    ["/privacy", "privacy.md"],
  ] as const) {
    it(`negotiates ${path} -> ${file}`, () => {
      const md = simulate(routes, dist, path, MD);
      assert.equal(md.status, 200);
      assert.ok(md.file.endsWith(file));
      assert.equal(header(md.headers, "content-type"), "text/markdown; charset=utf-8");
      const html = simulate(routes, dist, path, HTML);
      assert.equal(html.status, 200);
      assert.ok(html.file.endsWith("index.html"));
    });
  }

  it("serves direct .md URLs as text/markdown", () => {
    const res = simulate(routes, dist, "/index.md");
    assert.equal(res.status, 200);
    assert.equal(header(res.headers, "content-type"), "text/markdown; charset=utf-8");
  });

  it("does not add Vary: Accept to hashed assets", () => {
    const asset = read("index.html").match(/\/_astro\/[^"]+\.css/)?.[0];
    assert.ok(asset);
    const res = simulate(routes, dist, asset, HTML);
    assert.equal(res.status, 200);
    assert.equal(header(res.headers, "vary"), undefined);
  });
});

describe("404 handling", () => {
  const probe = "/__ora-404-probe-test";

  it("returns 404 with a Markdown body for agents", () => {
    const res = simulate(routes, dist, probe, MD);
    assert.equal(res.status, 404);
    assert.equal(header(res.headers, "content-type"), "text/markdown; charset=utf-8");
    assert.ok(res.body.length >= 20);
    assert.ok(res.body.includes("https://hekuta.net/llms.txt"));
  });

  it("returns 404 with the HTML page for browsers", () => {
    const res = simulate(routes, dist, probe, HTML);
    assert.equal(res.status, 404);
    assert.ok(res.file.endsWith("404.html"));
    assert.match(res.body, /<meta name="robots" content="noindex">/);
  });

  it("returns 404 for unknown nested paths even with a known prefix", () => {
    assert.equal(simulate(routes, dist, "/en/missing", MD).status, 404);
    assert.equal(simulate(routes, dist, "/about.md/x", MD).status, 404);
  });
});

describe("HTML metadata", () => {
  const pages = [
    ["index.html", "https://hekuta.net/", "ja", "ProfilePage"],
    ["en/index.html", "https://hekuta.net/en", "en", "ProfilePage"],
    ["about/index.html", "https://hekuta.net/about", "ja", "AboutPage"],
    ["contact/index.html", "https://hekuta.net/contact", "ja", "ContactPage"],
    ["privacy/index.html", "https://hekuta.net/privacy", "ja", "WebPage"],
  ] as const;

  for (const [file, canonical, lang, type] of pages) {
    it(`${file} has canonical, lang, og:type, og:image and valid JSON-LD`, () => {
      const html = read(file);
      assert.ok(html.includes(`<html lang="${lang}">`));
      assert.ok(html.includes(`<link rel="canonical" href="${canonical}">`));
      assert.match(html, /<meta property="og:type" content="(profile|website)">/);
      const ogImage = html.match(/<meta property="og:image" content="([^"]+)">/)?.[1];
      assert.ok(ogImage?.startsWith("https://hekuta.net/_astro/"), "og:image must be absolute");
      assert.ok(existsSync(join(dist, new URL(ogImage).pathname)), "og:image file must exist");
      const jsonLd = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
      assert.ok(jsonLd, "JSON-LD script missing");
      const graph = JSON.parse(jsonLd)["@graph"] as Record<string, unknown>[];
      assert.ok(graph.some((n) => n["@type"] === "Person" && n.name === "Heitor Hirose"));
      assert.ok(graph.some((n) => n["@type"] === type && n.url === canonical));
    });
  }

  it("trust pages each have at least 500 characters of visible content", () => {
    for (const file of ["about/index.html", "contact/index.html", "privacy/index.html"]) {
      assert.ok(textContent(read(file)).length >= 500, `${file} is too short`);
    }
  });

  it("the homepage links to the trust pages", () => {
    const html = read("index.html");
    for (const path of ["/about", "/contact", "/privacy"]) assert.ok(html.includes(`href="${path}"`));
  });
});

describe("Machine-readable files", () => {
  it("emits llms.txt, sitemap.xml and robots.txt", () => {
    assert.match(read("llms.txt"), /^# Heitor Hirose/);
    assert.match(read("sitemap.xml"), /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
    assert.match(read("robots.txt"), /^Sitemap: https:\/\/hekuta\.net\/sitemap\.xml$/m);
  });

  it("every URL in the sitemap resolves to a 200 HTML page", () => {
    const locs = [...read("sitemap.xml").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
    assert.ok(locs.length >= 5);
    for (const path of locs) {
      const res = simulate(routes, dist, path, HTML);
      assert.equal(res.status, 200, path);
      assert.ok(res.file.endsWith(".html"), path);
    }
  });

  it("every hekuta.net link in llms.txt resolves to a 200 response", () => {
    const urls = [...read("llms.txt").matchAll(/\((https:\/\/hekuta\.net\/[^)]*)\)/g)].map((m) => new URL(m[1]).pathname);
    assert.ok(urls.length >= 5);
    for (const path of urls) assert.equal(simulate(routes, dist, path).status, 200, path);
  });
});
