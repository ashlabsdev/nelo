"use client";

import {
  EditorContent,
  useEditor,
} from "@tiptap/react";

import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";

type BlogContentProps = {
  content: object;
};

export default function BlogContent({
  content,
}: BlogContentProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,

      Link.configure({
        openOnClick: true,
        autolink: true,
        defaultProtocol: "https",
      }),
    ],

    content,

    editable: false,

    immediatelyRender: false,
  });

  if (!editor) {
    return null;
  }

  return (
    <EditorContent
      editor={editor}
      className="blog-reader"
    />
  );
}