import { SITE } from "@config";
import type { CollectionEntry } from "astro:content";

export default (post: CollectionEntry<"blog">) => {
  return (
    <div
      style={{
        background: "#111",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "12px 24px",
      }}
    >
      <p
        style={{
          color: "#fff",
          fontSize: 30,
          fontWeight: "bold",
          maxHeight: "84%",
          overflow: "hidden",
        }}
      >
        {post.data.title}
      </p>

      <div
        style={{
          display: "flex",
          gap: "12px",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "24px",
            height: "24px",
            backgroundColor: "#fff",
          }}
        />
        <p
          style={{
            color: "#fff",
            fontSize: 24,
            fontWeight: "bold",
          }}
        >
          {SITE.title}
        </p>
      </div>
    </div>
  );
};
