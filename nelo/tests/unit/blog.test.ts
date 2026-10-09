import { describe, expect, it } from "vitest";

import { createBlogPreview, extractTextFromTiptap } from "@/lib/blog";

describe("blog utilities", () => {
  it("extracts text from TipTap JSON", () => {
    const json = {
      type: "doc",

      content: [
        {
          type: "paragraph",

          content: [
            {
              type: "text",
              text: "Hello",
            },

            {
              type: "text",
              text: "NELO",
            },
          ],
        },
      ],
    };

    expect(extractTextFromTiptap(json)).toBe("Hello NELO");
  });

  it("returns empty text for invalid content", () => {
    expect(extractTextFromTiptap(null)).toBe("");

    expect(extractTextFromTiptap(undefined)).toBe("");
  });

  it("returns full preview when text is short", () => {
    const json = {
      type: "doc",

      content: [
        {
          type: "paragraph",

          content: [
            {
              type: "text",
              text: "Short NELO post",
            },
          ],
        },
      ],
    };

    expect(createBlogPreview(json, 50)).toBe("Short NELO post");
  });

  it("truncates long previews", () => {
    const json = {
      type: "doc",

      content: [
        {
          type: "paragraph",

          content: [
            {
              type: "text",
              text: "This is a very long NELO blog post for testing.",
            },
          ],
        },
      ],
    };

    const result = createBlogPreview(json, 20);

    expect(result.endsWith("...")).toBe(true);

    expect(result.length).toBeLessThanOrEqual(23);
  });
});
