/**
 * Minimal simulator for Vercel's Build Output API v3 routing, enough to
 * exercise the routes in vercel.json against the static `dist/` output.
 *
 * The framework preset routes are the ones `vercel build` emits for an
 * Astro static site (verified with `vercel build` on this project): an
 * immutable cache header for /_astro, then the 404.html error handler.
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";

interface HasCondition {
  type: "header";
  key: string;
  value?: string;
}

export interface Route {
  src?: string;
  dest?: string;
  headers?: Record<string, string>;
  status?: number;
  continue?: boolean;
  has?: HasCondition[];
  handle?: "filesystem" | "error";
}

export interface SimResponse {
  status: number;
  headers: Record<string, string>;
  file: string;
  body: string;
}

const presetBefore: Route[] = [
  {
    src: "^/_astro/(.*)$",
    headers: { "cache-control": "public, max-age=31536000, immutable" },
    continue: true,
  },
];
const presetError: Route[] = [
  { handle: "error" },
  { status: 404, src: "^(?!/api).*$", dest: "/404.html" },
];

const mimeTypes: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".md": "text/markdown",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
  ".png": "image/png",
  ".js": "application/javascript",
};

export function loadRoutes(vercelJsonPath: string): Route[] {
  const config = JSON.parse(readFileSync(vercelJsonPath, "utf8")) as { routes: Route[] };
  return [...presetBefore, ...config.routes, ...presetError];
}

function matches(route: Route, path: string, reqHeaders: Record<string, string>): RegExpExecArray | null {
  if (!route.src) return null;
  const m = new RegExp(route.src).exec(path);
  if (!m) return null;
  for (const cond of route.has ?? []) {
    const actual = reqHeaders[cond.key.toLowerCase()];
    if (actual === undefined) return null;
    if (cond.value !== undefined && !new RegExp(`^(?:${cond.value})$`).test(actual)) return null;
  }
  return m;
}

const substitute = (dest: string, m: RegExpExecArray) =>
  dest.replace(/\$(\d+)/g, (_, i: string) => m[Number(i)] ?? "");

function resolveFile(distDir: string, path: string): string | null {
  const candidates = [path, join(path, "index.html")];
  for (const candidate of candidates) {
    const full = join(distDir, decodeURIComponent(candidate));
    if (existsSync(full) && statSync(full).isFile()) return full;
  }
  return null;
}

export function simulate(
  routes: Route[],
  distDir: string,
  path: string,
  reqHeaders: Record<string, string> = {},
): SimResponse {
  const lowered = Object.fromEntries(Object.entries(reqHeaders).map(([k, v]) => [k.toLowerCase(), v]));
  const headers: Record<string, string> = {};
  const phases: Route[][] = [[]];
  for (const route of routes) {
    if (route.handle) phases.push([route]);
    else phases[phases.length - 1].push(route);
  }

  const respond = (file: string, status: number): SimResponse => {
    const lowerKeys = Object.keys(headers).map((k) => k.toLowerCase());
    if (!lowerKeys.includes("content-type")) {
      headers["Content-Type"] = mimeTypes[extname(file)] ?? "application/octet-stream";
    }
    return { status, headers, file, body: readFileSync(file, "utf8") };
  };

  let current = path;
  let status: number | undefined;
  for (const phase of phases) {
    const handle = phase[0]?.handle;
    const rules = handle ? phase.slice(1) : phase;

    if (handle === "filesystem" || handle === "error") {
      const found = resolveFile(distDir, current);
      if (found) return respond(found, status ?? 200);
    }

    for (const route of rules) {
      const m = matches(route, current, lowered);
      if (!m) continue;
      Object.assign(headers, route.headers ?? {});
      if (route.status) status = route.status;
      if (route.dest) current = substitute(route.dest, m);
      if (!route.continue) {
        const found = resolveFile(distDir, current);
        if (found && (route.dest || handle)) return respond(found, status ?? 200);
        break;
      }
    }
  }
  return { status: 404, headers, file: "", body: "" };
}
