/**
 * Agent discovery: Link headers (RFC 8288), API catalog (RFC 9727),
 * OpenAPI, Agent Skills index (discovery RFC v0.2.0), ARD/ai-catalog,
 * Content Signals in robots.txt, and WebMCP tool registration.
 * Build-output checks need `dist/` (run via `pnpm test`).
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { sitePages } from "../src/data/pages.ts";
import {
  homeLinkHeader,
  PROFILE_SKILL_PATH,
  renderAiCatalog,
  renderApiCatalog,
  renderOpenApi,
  renderProfileSkillMd,
  renderSkillsIndex,
  SKILLS_SCHEMA,
} from "../src/lib/discovery.ts";
import { createSiteTools, registerSiteTools, type WebMcpTool } from "../src/lib/webmcp.ts";
import { loadRoutes, simulate } from "./vercel-routes.ts";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = join(root, "dist");
const routes = loadRoutes(join(root, "vercel.json"));
const header = (headers: Record<string, string>, name: string) =>
  Object.entries(headers).find(([k]) => k.toLowerCase() === name.toLowerCase())?.[1];

/** Minimal RFC 8288 parser: returns [{ target, params }]. */
function parseLinkHeader(value: string) {
  const re = /<([^>]*)>((?:\s*;\s*[a-zA-Z*-]+\s*=\s*(?:"[^"]*"|[^;,\s]+))*)\s*(?:,|$)/g;
  const out: { target: string; params: Record<string, string> }[] = [];
  for (const m of value.matchAll(re)) {
    const params: Record<string, string> = {};
    for (const p of m[2].matchAll(/;\s*([a-zA-Z*-]+)\s*=\s*(?:"([^"]*)"|([^;,\s]+))/g)) {
      params[p[1].toLowerCase()] = p[2] ?? p[3];
    }
    out.push({ target: m[1], params });
  }
  assert.equal(out.length, value.split(/,\s*(?=<)/).length, "every link-value must parse");
  for (const l of out) assert.ok(l.params.rel, `${l.target} needs a rel`);
  return out;
}

describe("Link response headers (RFC 8288)", () => {
  for (const [path, md] of [
    ["/", "/index.md"],
    ["/en", "/en.md"],
  ] as const) {
    it(`${path} advertises api-catalog, service-desc, service-doc, describedby and Markdown`, () => {
      const res = simulate(routes, dist, path, { Accept: "text/html" });
      assert.equal(res.status, 200);
      const value = header(res.headers, "link");
      assert.ok(value, "Link header missing");
      assert.equal(value, homeLinkHeader(md), "vercel.json must match src/lib/discovery.ts");
      const links = parseLinkHeader(value);
      const rels = links.map((l) => l.params.rel);
      for (const rel of ["api-catalog", "service-desc", "service-doc", "describedby", "alternate"]) {
        assert.ok(rels.includes(rel), `missing rel=${rel}`);
      }
      for (const link of links) {
        assert.equal(simulate(routes, dist, link.target).status, 200, `${link.target} must resolve`);
      }
    });
  }

  it("keeps the Link header on Markdown-negotiated responses", () => {
    const res = simulate(routes, dist, "/", { Accept: "text/markdown" });
    assert.ok(res.file.endsWith("index.md"));
    assert.ok(header(res.headers, "link")?.includes('rel="api-catalog"'));
  });
});

describe("API catalog (RFC 9727)", () => {
  it("is a linkset with an anchor and service-desc/service-doc targets", () => {
    const catalog = renderApiCatalog() as { linkset: Record<string, unknown>[] };
    assert.ok(Array.isArray(catalog.linkset) && catalog.linkset.length > 0);
    for (const entry of catalog.linkset) {
      assert.match(String(entry.anchor), /^https:\/\/hekuta\.net\//);
      for (const rel of ["service-desc", "service-doc"]) {
        const targets = entry[rel] as { href: string; type?: string }[];
        assert.ok(Array.isArray(targets) && targets.length > 0, `${rel} must be an array of link targets`);
        for (const t of targets) assert.match(t.href, /^https:\/\/hekuta\.net\//);
      }
    }
  });

  it("is served at /.well-known/api-catalog as application/linkset+json with the RFC 9727 profile", () => {
    const res = simulate(routes, dist, "/.well-known/api-catalog");
    assert.equal(res.status, 200);
    assert.equal(
      header(res.headers, "content-type"),
      'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"',
    );
    assert.equal(header(res.headers, "link"), '</.well-known/api-catalog>; rel="api-catalog"');
    assert.deepEqual(JSON.parse(res.body), renderApiCatalog());
  });
});

describe("OpenAPI description", () => {
  const spec = renderOpenApi() as {
    openapi: string;
    info: { title: string; version: string };
    paths: Record<string, { get: { operationId: string; responses: Record<string, unknown> } }>;
  };

  it("is OpenAPI 3.1 and documents every page plus llms.txt and the sitemap", () => {
    assert.equal(spec.openapi, "3.1.0");
    assert.ok(spec.info.title && spec.info.version);
    const expected = [...sitePages.map((p) => p.path), "/llms.txt", "/sitemap.xml"];
    assert.deepEqual(Object.keys(spec.paths).sort(), expected.sort());
    const ids = Object.values(spec.paths).map((p) => p.get.operationId);
    assert.equal(new Set(ids).size, ids.length, "operationIds must be unique");
    for (const path of Object.keys(spec.paths)) {
      assert.equal(simulate(routes, dist, path).status, 200, path);
      assert.ok(spec.paths[path].get.responses["200"]);
    }
  });

  it("is served at /openapi.json", () => {
    const res = simulate(routes, dist, "/openapi.json");
    assert.equal(res.status, 200);
    assert.match(header(res.headers, "content-type") ?? "", /^application\/json/);
    assert.deepEqual(JSON.parse(res.body), spec);
  });
});

describe("Agent Skills discovery index (v0.2.0)", () => {
  const index = renderSkillsIndex() as {
    $schema: string;
    skills: { name: string; type: string; description: string; url: string; digest: string }[];
  };

  it("has the v0.2.0 schema and valid skill entries", () => {
    assert.equal(index.$schema, SKILLS_SCHEMA);
    assert.ok(index.skills.length > 0);
    for (const skill of index.skills) {
      assert.match(skill.name, /^(?!-)(?!.*--)[a-z0-9-]{1,64}(?<!-)$/);
      assert.ok(["skill-md", "archive"].includes(skill.type));
      assert.ok(skill.description.length > 0 && skill.description.length <= 1024);
      assert.match(skill.digest, /^sha256:[0-9a-f]{64}$/);
    }
  });

  it("digest matches the raw bytes of the served SKILL.md", () => {
    const [skill] = index.skills;
    assert.equal(skill.url, PROFILE_SKILL_PATH);
    const res = simulate(routes, dist, skill.url);
    assert.equal(res.status, 200);
    assert.match(header(res.headers, "content-type") ?? "", /^text\/markdown/);
    const bytes = readFileSync(res.file);
    assert.equal(`sha256:${createHash("sha256").update(bytes).digest("hex")}`, skill.digest);
  });

  it("SKILL.md has YAML frontmatter whose name/description match the index", () => {
    const md = renderProfileSkillMd();
    const fm = md.match(/^---\n([\s\S]*?)\n---\n/);
    assert.ok(fm, "frontmatter missing");
    const fields = Object.fromEntries(
      fm[1].split("\n").map((line) => {
        const i = line.indexOf(": ");
        return [line.slice(0, i), line.slice(i + 2)];
      }),
    );
    assert.equal(fields.name, index.skills[0].name);
    assert.equal(fields.description, index.skills[0].description);
    assert.ok(!/: /.test(fields.description), "description must stay a plain YAML scalar");
    assert.match(md, /^## When to use$/m);
  });

  it("is served at /.well-known/agent-skills/index.json", () => {
    const res = simulate(routes, dist, "/.well-known/agent-skills/index.json");
    assert.equal(res.status, 200);
    assert.match(header(res.headers, "content-type") ?? "", /^application\/json/);
    assert.deepEqual(JSON.parse(res.body), index);
  });
});

describe("ARD / ai-catalog manifest", () => {
  const catalog = renderAiCatalog() as {
    specVersion: string;
    host: { displayName: string; identifier: string };
    entries: Record<string, unknown>[];
  };

  it("has specVersion, host and well-formed entries", () => {
    assert.ok(catalog.specVersion.length > 0);
    assert.ok(catalog.host.displayName && catalog.host.identifier);
    assert.ok(catalog.entries.length > 0);
    const ids = new Set<string>();
    for (const entry of catalog.entries) {
      assert.match(String(entry.identifier), /^urn:air:hekuta\.net:[a-z0-9-]+:[a-z0-9-]+$/);
      ids.add(String(entry.identifier));
      assert.ok(entry.displayName);
      assert.match(String(entry.type), /^[a-z]+\/[a-z0-9.+-]+$/);
      assert.equal(("url" in entry ? 1 : 0) + ("data" in entry ? 1 : 0), 1, "exactly one of url or data");
      const queries = entry.representativeQueries as string[];
      assert.ok(queries.length >= 2 && queries.length <= 5);
      const path = new URL(String(entry.url)).pathname;
      assert.equal(simulate(routes, dist, path).status, 200, `${path} must resolve`);
    }
    assert.equal(ids.size, catalog.entries.length, "identifiers must be unique");
  });

  for (const path of ["/.well-known/ai-catalog.json", "/.well-known/ard.json"]) {
    it(`is served at ${path} with CORS`, () => {
      const res = simulate(routes, dist, path);
      assert.equal(res.status, 200);
      assert.match(header(res.headers, "content-type") ?? "", /^application\/json/);
      assert.equal(header(res.headers, "access-control-allow-origin"), "*");
      assert.deepEqual(JSON.parse(res.body), catalog);
    });
  }
});

describe("Content Signals in robots.txt", () => {
  it("declares search/ai-input/ai-train under User-agent: *", () => {
    const robots = readFileSync(join(dist, "robots.txt"), "utf8");
    const group = robots.split(/\n\s*\n/).find((g) => /^User-agent: \*$/m.test(g));
    assert.ok(group);
    const line = group.split("\n").find((l) => l.startsWith("Content-Signal:"));
    assert.ok(line, "Content-Signal missing");
    const signals = Object.fromEntries(
      line
        .slice("Content-Signal:".length)
        .split(",")
        .map((kv) => kv.trim().split("=")),
    );
    assert.deepEqual(signals, { search: "yes", "ai-input": "yes", "ai-train": "no" });
  });
});

describe("WebMCP tools", () => {
  const makeFetch = (status = 200) => {
    const calls: { url: string; accept?: string }[] = [];
    const fetchFn = async (url: string, init?: { headers?: Record<string, string> }) => {
      calls.push({ url, accept: init?.headers?.Accept });
      return { ok: status === 200, status, text: async () => `# body of ${url}` };
    };
    return { calls, fetchFn };
  };

  it("defines spec-valid read-only tools", () => {
    for (const tool of createSiteTools(makeFetch().fetchFn)) {
      assert.match(tool.name, /^[A-Za-z0-9_.-]{1,128}$/);
      assert.ok(tool.description.length > 0);
      assert.equal((tool.inputSchema as { type: string }).type, "object");
      assert.equal(tool.annotations?.readOnlyHint, true);
      assert.equal(typeof tool.execute, "function");
    }
  });

  it("get_profile and get_site_page fetch the Markdown pages", async () => {
    const { calls, fetchFn } = makeFetch();
    const [profile, page] = createSiteTools(fetchFn);
    assert.equal(await profile.execute({}), "# body of /en.md");
    assert.equal(await profile.execute({ lang: "ja" }), "# body of /index.md");
    assert.equal(await page.execute({ page: "contact" }), "# body of /contact.md");
    assert.ok(calls.every((c) => c.accept === "text/markdown"));
    for (const c of calls) assert.ok(existsSync(join(dist, c.url)), `${c.url} must exist in dist`);
    await assert.rejects(page.execute({ page: "admin" }));
  });

  it("surfaces HTTP errors from execute", async () => {
    const [profile] = createSiteTools(makeFetch(404).fetchFn);
    await assert.rejects(profile.execute({}), /HTTP 404/);
  });

  it("registers every tool, tolerates refusals, and is a no-op without WebMCP", async () => {
    const registered: WebMcpTool[] = [];
    const ctx = {
      registerTool: async (tool: WebMcpTool) => {
        if (tool.name === "get_site_page") throw new DOMException("denied", "NotAllowedError");
        registered.push(tool);
      },
    };
    assert.equal(await registerSiteTools(ctx, makeFetch().fetchFn), 1);
    assert.deepEqual(registered.map((t) => t.name), ["get_profile"]);
    assert.equal(await registerSiteTools(undefined, makeFetch().fetchFn), 0);
  });

  it("is wired into every page via the layout", () => {
    const html = readFileSync(join(dist, "index.html"), "utf8");
    assert.match(html, /<script type="module"/);
    assert.ok(html.includes("get_profile") || /src="\/_astro\/[^"]+\.js"/.test(html), "WebMCP script missing");
  });
});
