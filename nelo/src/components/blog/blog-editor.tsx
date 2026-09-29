"use client";

import {
  EditorContent,
  useEditor,
} from "@tiptap/react";

import StarterKit from "@tiptap/starter-kit";

export default function BlogEditor() {
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],

    content:
      "<p>Start writing your story...</p>",

    immediatelyRender: false,
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="theme-border overflow-hidden rounded-xl border">

      <div className="theme-surface theme-border border-b p-3">

        <button
          type="button"
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleBold()
              .run()
          }
          className="mr-2 rounded px-3 py-1 text-sm font-bold"
        >
          B
        </button>

        <button
          type="button"
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleItalic()
              .run()
          }
          className="rounded px-3 py-1 text-sm italic"
        >
          I
        </button>

      </div>

      <EditorContent
        editor={editor}
        className="min-h-87.5 p-5"
      />

    </div>
  );
}