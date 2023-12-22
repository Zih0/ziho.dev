import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import partytown from "@astrojs/partytown";
import { SITE } from "./src/config";
import mdx from "@astrojs/mdx";
import remarkToc from "remark-toc";
import rehypeExternalLinks from "rehype-external-links";
import rehypeSlug from "rehype-slug";
import rehypeAutoLinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import moonlightTheme from "./public/code-block-theme/moonlight-ii.json";

// https://astro.build/config
export default defineConfig({
  site: SITE.website,
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    react(),
    sitemap(),
    partytown({
      config: {
        forward: ["dataLayer.push"],
      },
    }),
    mdx(),
  ],
  markdown: {
    syntaxHighlight: false,
    remarkPlugins: [remarkToc],
    rehypePlugins: [
      [
        rehypePrettyCode as RehypePrettyCodeType,
        {
          theme: moonlightTheme,
        },
      ],
      rehypeSlug,
      rehypeAutoLinkHeadings,
      [rehypeExternalLinks, { target: "_blank", rel: "noopener noreferrer" }],
    ],
  },
  vite: {
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
  },
  scopedStyleStrategy: "where",
});

// FIXME: astro v4 rehypePlugin type이 변경되면서 깨지는 현상 발생
type RehypePrettyCodeType = (
  options?: Parameters<typeof rehypePrettyCode>[0]
) => undefined;
