import type { APIRoute, GetStaticPaths } from "astro";
import type { InfoPage } from "../data/pages";
import { infoPages } from "../data/pages";
import { MARKDOWN_CONTENT_TYPE, renderInfoPageMarkdown } from "../lib/markdown";

export const getStaticPaths = (() =>
  infoPages.map((page) => ({ params: { slug: page.slug }, props: { page } }))) satisfies GetStaticPaths;

export const GET: APIRoute<{ page: InfoPage }> = ({ props }) =>
  new Response(renderInfoPageMarkdown(props.page), {
    headers: { "Content-Type": MARKDOWN_CONTENT_TYPE },
  });
