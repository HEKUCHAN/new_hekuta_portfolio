/**
 * WebMCP (https://webmachinelearning.github.io/webmcp/): exposes the site's
 * read-only content to in-browser agents via document.modelContext.
 */

export interface WebMcpTool {
  name: string;
  title?: string;
  description: string;
  inputSchema?: Record<string, unknown>;
  annotations?: { readOnlyHint?: boolean };
  execute: (input: Record<string, unknown>) => Promise<string>;
}

export interface ModelContextLike {
  registerTool(tool: WebMcpTool, options?: { signal?: AbortSignal }): Promise<unknown> | unknown;
}

type FetchLike = (input: string, init?: { headers?: Record<string, string> }) => Promise<{
  ok: boolean;
  status: number;
  text(): Promise<string>;
}>;

const PROFILE_PATHS = { en: "/en.md", ja: "/index.md" } as const;
const PAGE_PATHS = { about: "/about.md", contact: "/contact.md", privacy: "/privacy.md" } as const;

async function fetchMarkdown(fetchFn: FetchLike, path: string): Promise<string> {
  const res = await fetchFn(path, { headers: { Accept: "text/markdown" } });
  if (!res.ok) throw new Error(`GET ${path} failed with HTTP ${res.status}`);
  return res.text();
}

export function createSiteTools(fetchFn: FetchLike): WebMcpTool[] {
  return [
    {
      name: "get_profile",
      title: "Get Heitor Hirose's profile",
      description:
        "Returns Heitor Hirose's (広瀬 エイトル) full profile as Markdown: about, career history, interests, works, latest articles, and social links.",
      inputSchema: {
        type: "object",
        properties: {
          lang: { type: "string", enum: ["en", "ja"], description: "Language of the profile. Defaults to en." },
        },
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true },
      execute: async (input) => {
        const lang = input?.lang === "ja" ? "ja" : "en";
        return fetchMarkdown(fetchFn, PROFILE_PATHS[lang]);
      },
    },
    {
      name: "get_site_page",
      title: "Get an information page",
      description:
        "Returns one of hekuta.net's information pages as Markdown (Japanese and English): about, contact (how to reach Heitor), or privacy (privacy policy).",
      inputSchema: {
        type: "object",
        properties: {
          page: { type: "string", enum: ["about", "contact", "privacy"], description: "Which page to return." },
        },
        required: ["page"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true },
      execute: async (input) => {
        const page = input?.page;
        if (page !== "about" && page !== "contact" && page !== "privacy") {
          throw new Error('page must be one of "about", "contact", "privacy"');
        }
        return fetchMarkdown(fetchFn, PAGE_PATHS[page]);
      },
    },
  ];
}

/** Registers the tools if the browser supports WebMCP. Returns how many were registered. */
export async function registerSiteTools(
  modelContext: ModelContextLike | undefined,
  fetchFn: FetchLike,
  signal?: AbortSignal,
): Promise<number> {
  if (!modelContext || typeof modelContext.registerTool !== "function") return 0;
  let registered = 0;
  for (const tool of createSiteTools(fetchFn)) {
    try {
      await modelContext.registerTool(tool, signal ? { signal } : undefined);
      registered++;
    } catch {
      // Registration can be refused (permissions policy, duplicate name); the page works without it.
    }
  }
  return registered;
}
