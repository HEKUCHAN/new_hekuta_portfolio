import type { APIRoute } from "astro";
import { MARKDOWN_CONTENT_TYPE, renderNotFoundMarkdown } from "../lib/markdown";

export const GET: APIRoute = () =>
  new Response(renderNotFoundMarkdown(), {
    headers: { "Content-Type": MARKDOWN_CONTENT_TYPE },
  });
