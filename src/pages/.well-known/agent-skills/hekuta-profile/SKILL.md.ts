import type { APIRoute } from "astro";
import { renderProfileSkillMd } from "../../../../lib/discovery";
import { MARKDOWN_CONTENT_TYPE } from "../../../../lib/markdown";

export const GET: APIRoute = () =>
  new Response(renderProfileSkillMd(), {
    headers: { "Content-Type": MARKDOWN_CONTENT_TYPE },
  });
