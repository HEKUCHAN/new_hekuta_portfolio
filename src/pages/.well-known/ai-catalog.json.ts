import type { APIRoute } from "astro";
import { renderAiCatalog } from "../../lib/discovery";

export const GET: APIRoute = () =>
  new Response(JSON.stringify(renderAiCatalog(), null, 2), {
    headers: { "Content-Type": "application/json" },
  });
