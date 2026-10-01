"use client";

import {
  useEffect,
  useState,
} from "react";

import Placeholder from "@tiptap/extension-placeholder";

import {
  EditorContent,
  useEditor,
} from "@tiptap/react";

import StarterKit from "@tiptap/starter-kit";

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
  const [showLinkInput, setShowLinkInput] =
    useState(false);

  const [linkUrl, setLinkUrl] =
    useState("");

  const [linkSelection, setLinkSelection] =
    useState<{
      from: number;
      to: number;
    } | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
        },
      }),

      Placeholder.configure({
        placeholder:
          "Start writing your story...",
      }),
    ],

    content: "",

    immediatelyRender: false,

    editorProps: {
      attributes: {
        class:
          "min-h-[400px] px-5 py-4 outline-none",
      },
    },

    onUpdate({ editor }) {
      onChange(
        editor.getJSON()
      );
    },
  });

  useEffect(() => {
    if (editor) {
      onChange(
        editor.getJSON()
      );
    }
  }, [editor, onChange]);

  if (!editor) {
    return null;
  }

  // Stable non-null editor reference
  const currentEditor = editor;

  function openLinkInput() {
    const selection =
      currentEditor.state.selection;

    if (!selection) {
      return;
    }

    const from =
      selection.from;

    const to =
      selection.to;

    setLinkSelection({
      from,
      to,
    });

    const attributes =
      currentEditor.getAttributes(
        "link"
      );

    const existingUrl =
      typeof attributes.href ===
      "string"
        ? attributes.href
        : "";

    setLinkUrl(
      existingUrl
    );

    setShowLinkInput(
      true
    );
  }

  function applyLink() {
    const url =
      linkUrl.trim();

    if (!linkSelection) {
      setShowLinkInput(
        false
      );

      setLinkUrl("");

      return;
    }

    /*
     * Restore the text selection because
     * clicking the URL input moves focus
     * away from the editor.
     */
    currentEditor.commands.setTextSelection({
      from:
        linkSelection.from,
      to:
        linkSelection.to,
    });

    if (!url) {
      currentEditor.commands.extendMarkRange(
        "link"
      );

      currentEditor.commands.unsetLink();
    } else {
      currentEditor.commands.setLink({
        href: url,
      });
    }

    currentEditor.commands.focus();

    setShowLinkInput(
      false
    );

    setLinkUrl("");

    setLinkSelection(
      null
    );
  }

  function cancelLink() {
    setShowLinkInput(
      false
    );

    setLinkUrl("");

    setLinkSelection(
      null
    );

    currentEditor.commands.focus();
  }

  const buttonClass =
    "theme-text rounded-md px-2 py-2 transition hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-40";

  const activeClass =
    "theme-accent-bg text-white";

  return (
    <div className="theme-border overflow-hidden rounded-2xl border">

      <div className="theme-surface theme-border flex flex-wrap gap-1 border-b p-3">

        <button
          type="button"
          title="Bold"
          onClick={() =>
            currentEditor
              .chain()
              .focus()
              .toggleBold()
              .run()
          }
          className={`${buttonClass} ${
            currentEditor.isActive(
              "bold"
            )
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
            currentEditor
              .chain()
              .focus()
              .toggleItalic()
              .run()
          }
          className={`${buttonClass} ${
            currentEditor.isActive(
              "italic"
            )
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
            currentEditor
              .chain()
              .focus()
              .toggleHeading({
                level: 2,
              })
              .run()
          }
          className={`${buttonClass} ${
            currentEditor.isActive(
              "heading",
              {
                level: 2,
              }
            )
              ? activeClass
              : ""
          }`}
        >
          <Heading2
            size={18}
          />
        </button>

        <button
          type="button"
          title="Bullet List"
          onClick={() =>
            currentEditor
              .chain()
              .focus()
              .toggleBulletList()
              .run()
          }
          className={`${buttonClass} ${
            currentEditor.isActive(
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
            currentEditor
              .chain()
              .focus()
              .toggleOrderedList()
              .run()
          }
          className={`${buttonClass} ${
            currentEditor.isActive(
              "orderedList"
            )
              ? activeClass
              : ""
          }`}
        >
          <ListOrdered
            size={18}
          />
        </button>

        <button
          type="button"
          title="Quote"
          onClick={() =>
            currentEditor
              .chain()
              .focus()
              .toggleBlockquote()
              .run()
          }
          className={`${buttonClass} ${
            currentEditor.isActive(
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
          onClick={
            openLinkInput
          }
          className={`${buttonClass} ${
            currentEditor.isActive(
              "link"
            )
              ? activeClass
              : ""
          }`}
        >
          <LinkIcon
            size={18}
          />
        </button>

        <div className="mx-1 w-px bg-current opacity-10" />

        <button
          type="button"
          title="Undo"
          disabled={
            !currentEditor
              .can()
              .undo()
          }
          onClick={() =>
            currentEditor
              .chain()
              .focus()
              .undo()
              .run()
          }
          className={
            buttonClass
          }
        >
          <Undo2 size={18} />
        </button>

        <button
          type="button"
          title="Redo"
          disabled={
            !currentEditor
              .can()
              .redo()
          }
          onClick={() =>
            currentEditor
              .chain()
              .focus()
              .redo()
              .run()
          }
          className={
            buttonClass
          }
        >
          <Redo2 size={18} />
        </button>

      </div>

      {showLinkInput && (
        <div className="theme-surface theme-border flex flex-col gap-2 border-b p-3 sm:flex-row">

          <input
            type="url"
            value={linkUrl}
            onChange={(
              event
            ) =>
              setLinkUrl(
                event.target
                  .value
              )
            }
            onKeyDown={(
              event
            ) => {
              if (
                event.key ===
                "Enter"
              ) {
                event.preventDefault();

                applyLink();
              }

              if (
                event.key ===
                "Escape"
              ) {
                event.preventDefault();

                cancelLink();
              }
            }}
            placeholder="https://example.com"
            autoFocus
            className="theme-bg theme-text theme-border min-w-0 flex-1 rounded-md border px-3 py-2 outline-none"
          />

          <button
            type="button"
            onClick={
              applyLink
            }
            className="theme-accent-bg rounded-md px-4 py-2 text-white"
          >
            Apply
          </button>

          <button
            type="button"
            onClick={
              cancelLink
            }
            className="theme-text theme-border rounded-md border px-4 py-2"
          >
            Cancel
          </button>

        </div>
      )}

      <EditorContent
        editor={
          currentEditor
        }
      />

    </div>
  );
}