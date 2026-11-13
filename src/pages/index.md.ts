import type { APIRoute } from "astro";
import { profileJa } from "../data/profile";
import { MARKDOWN_CONTENT_TYPE, renderProfileMarkdown } from "../lib/markdown";
import { getZennRssFeed } from "../lib/zenn";

export const GET: APIRoute = async () =>
  new Response(renderProfileMarkdown(profileJa, await getZennRssFeed()), {
    headers: { "Content-Type": MARKDOWN_CONTENT_TYPE },
  });
