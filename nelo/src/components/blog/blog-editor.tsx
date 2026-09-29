"use client";

import { useEffect } from "react";

import {
  EditorContent,
  useEditor,
} from "@tiptap/react";

import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";

import {
  Bold,
  Italic,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Undo2,
  Redo2,
  Link as LinkIcon,
} from "lucide-react";

type BlogEditorProps = {
  onChange: (json: object) => void;
};

export default function BlogEditor({
  onChange,
}: BlogEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,

      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
      }),
    ],

    content: "",

    immediatelyRender: false,

    editorProps: {
      attributes: {
        class:
          "min-h-[400px] px-5 py-4 outline-none prose max-w-none",
      },
    },

    onUpdate({ editor }) {
      onChange(editor.getJSON());
    },
  });

  useEffect(() => {
    if (editor) {
      onChange(editor.getJSON());
    }
  }, [editor, onChange]);

  if (!editor) {
    return null;
  }

  function addLink() {
    const existingUrl =
      editor?.getAttributes("link").href;

    const url = window.prompt(
      "Enter URL",
      existingUrl ?? ""
    );

    if (url === null) {
      return;
    }

    if (url === "") {
      editor?.chain()
        .focus()
        .extendMarkRange("link")
        .unsetLink()
        .run();

      return;
    }

    editor?.chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  }

  const buttonClass =
    "theme-text rounded-md px-2 py-2 transition hover:opacity-70";

  const activeClass =
    "theme-accent-bg text-white";

  return (
    <div className="theme-border overflow-hidden rounded-2xl border">

      <div className="theme-surface theme-border flex flex-wrap gap-1 border-b p-3">

        <button
          type="button"
          title="Bold"
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleBold()
              .run()
          }
          className={`${buttonClass} ${
            editor.isActive("bold")
              ? activeClass
              : ""
          }`}
        >
          <Bold size={18} />
        </button>

        <button
          type="button"
          title="Italic"
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleItalic()
              .run()
          }
          className={`${buttonClass} ${
            editor.isActive("italic")
              ? activeClass
              : ""
          }`}
        >
          <Italic size={18} />
        </button>

        <button
          type="button"
          title="Heading"
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({
                level: 2,
              })
              .run()
          }
          className={`${buttonClass} ${
            editor.isActive(
              "heading",
              {
                level: 2,
              }
            )
              ? activeClass
              : ""
          }`}
        >
          <Heading2 size={18} />
        </button>

        <button
          type="button"
          title="Bullet List"
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleBulletList()
              .run()
          }
          className={`${buttonClass} ${
            editor.isActive(
              "bulletList"
            )
              ? activeClass
              : ""
          }`}
        >
          <List size={18} />
        </button>

        <button
          type="button"
          title="Numbered List"
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleOrderedList()
              .run()
          }
          className={`${buttonClass} ${
            editor.isActive(
              "orderedList"
            )
              ? activeClass
              : ""
          }`}
        >
          <ListOrdered size={18} />
        </button>

        <button
          type="button"
          title="Quote"
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleBlockquote()
              .run()
          }
          className={`${buttonClass} ${
            editor.isActive(
              "blockquote"
            )
              ? activeClass
              : ""
          }`}
        >
          <Quote size={18} />
        </button>

        <button
          type="button"
          title="Link"
          onClick={addLink}
          className={`${buttonClass} ${
            editor.isActive("link")
              ? activeClass
              : ""
          }`}
        >
          <LinkIcon size={18} />
        </button>

        <div className="mx-1 w-px bg-current opacity-10" />

        <button
          type="button"
          title="Undo"
          disabled={
            !editor.can().undo()
          }
          onClick={() =>
            editor
              .chain()
              .focus()
              .undo()
              .run()
          }
          className={buttonClass}
        >
          <Undo2 size={18} />
        </button>

        <button
          type="button"
          title="Redo"
          disabled={
            !editor.can().redo()
          }
          onClick={() =>
            editor
              .chain()
              .focus()
              .redo()
              .run()
          }
          className={buttonClass}
        >
          <Redo2 size={18} />
        </button>

      </div>

      <EditorContent editor={editor} />

    </div>
  );
}