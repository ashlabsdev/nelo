type TiptapNode = {
  type?: string;
  text?: string;
  content?: TiptapNode[];
};

export function extractTextFromTiptap(json: unknown): string {
  if (!json || typeof json !== "object") {
    return "";
  }

  function walk(node: TiptapNode): string {
    let text = node.text ?? "";

    if (Array.isArray(node.content)) {
      text += node.content.map((child) => walk(child)).join(" ");
    }

    return text;
  }

  return walk(json as TiptapNode)
    .replace(/\s+/g, " ")
    .trim();
}

export function createBlogPreview(json: unknown, maxLength = 220) {
  const text = extractTextFromTiptap(json);

  if (text.length <= maxLength) {
    return text;
  }

  return text.slice(0, maxLength).trim() + "...";
}
