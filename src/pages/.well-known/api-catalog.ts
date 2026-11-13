import type { APIRoute } from "astro";
import { API_CATALOG_CONTENT_TYPE, renderApiCatalog } from "../../lib/discovery";

export const GET: APIRoute = () =>
  new Response(JSON.stringify(renderApiCatalog(), null, 2), {
    headers: { "Content-Type": API_CATALOG_CONTENT_TYPE },
  });
