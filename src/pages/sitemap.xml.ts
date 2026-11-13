import type { APIRoute } from "astro";
import { renderSitemap } from "../lib/sitemap";

export const GET: APIRoute = () =>
  new Response(renderSitemap(), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
