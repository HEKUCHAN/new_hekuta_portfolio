import type { APIRoute } from "astro";
import { renderSkillsIndex } from "../../../lib/discovery";

export const GET: APIRoute = () =>
  new Response(JSON.stringify(renderSkillsIndex(), null, 2), {
    headers: { "Content-Type": "application/json" },
  });
