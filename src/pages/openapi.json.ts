import type { APIRoute } from "astro";
import { renderOpenApi } from "../lib/discovery";

export const GET: APIRoute = () =>
  new Response(JSON.stringify(renderOpenApi(), null, 2), {
    headers: { "Content-Type": "application/json" },
  });
