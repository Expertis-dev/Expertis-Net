"use client"

import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, List, ListOrdered } from "lucide-react";

type TiptapEditorProps = {
  /** Valor HTML para uso controlado. Deja undefined para usar estado interno. */
  value?: string;
  /** Callback que se ejecuta cuando cambia el HTML del editor. */
  onChange?: (html: string) => void;
  /** Callback que se ejecuta cuando el editor pierde el foco. */
  onBlur?: () => void;
  /** Nombre de campo de formulario. Si existe, se renderiza un input hidden. */
  name?: string;
  /** id usado para el editor y el label htmlFor. Usa name como fallback. */
  id?: string;
  /** Texto del label mostrado sobre el editor. */
  label?: string;
  /** Placeholder mostrado cuando el editor esta vacio. */
  placeholder?: string;
  /** Texto de ayuda mostrado abajo cuando no hay error. */
  helperText?: string;
  /** Texto de error mostrado abajo del editor. */
  error?: string;
  /** Muestra indicador de requerido junto al label. */
  required?: boolean;
  /** Deshabilita el editor y las acciones de la barra. */
  disabled?: boolean;
  /** Clases extra para el contenedor externo. */
  className?: string;
  /** Clases extra para el contenedor principal. */
  containerClassName?: string;
  /** Clases extra para el contenedor de la barra. */
  toolbarClassName?: string;
  /** Clases extra para cada boton de la barra. */
  buttonClassName?: string;
  /** Clases extra para el contenedor del contenido. */
  editorClassName?: string;
};

export default function TiptapEditor({
  value,
  onChange,
  onBlur,
  name,
  id,
  label,
  placeholder,
  helperText,
  error,
  required,
  disabled,
  className,
  containerClassName,
  toolbarClassName,
  buttonClassName,
  editorClassName,
}: TiptapEditorProps) {
  const [html, setHtml] = useState(value ?? "");
  const [, forceRerender] = useState(0);

  const editor = useEditor({
    editable: !disabled,
    immediatelyRender: true,
    extensions: [
      StarterKit.configure({
        blockquote: false,
        code: false,
        codeBlock: false,
        heading: false,
        horizontalRule: false,
        strike: false,
        hardBreak: false,
      }),
    ],
    content: html,
    onUpdate: ({ editor }) => {
      const next = editor.getHTML();
      const isContentEmpty =
        editor.isEmpty || editor.getText().trim().length === 0;
      const normalized = isContentEmpty ? "" : next;
      setHtml(normalized);
      onChange?.(normalized);
    },
  });

  useEffect(() => {
    if (!editor || value === undefined) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
      setHtml(value);
    }
  }, [editor, value]);

  if (!editor) return null;

  useEffect(() => {
    const update = () => forceRerender((prev) => prev + 1);
    const handleBlur = () => {
      update();
      onBlur?.();
    };
    editor.on("transaction", update);
    editor.on("selectionUpdate", update);
    editor.on("focus", update);
    editor.on("blur", handleBlur);
    return () => {
      editor.off("transaction", update);
      editor.off("selectionUpdate", update);
      editor.off("focus", update);
      editor.off("blur", handleBlur);
    };
  }, [editor, onBlur]);

  const isMarkActive = (mark: string) =>
    editor.isActive(mark) ||
    !!editor.state.storedMarks?.some((item) => item.type.name === mark);

  const canBullet = editor.can().chain().focus().toggleBulletList().run();
  const canOrdered = editor.can().chain().focus().toggleOrderedList().run();
  const canBold = editor.can().chain().focus().toggleBold().run();
  const canItalic = editor.can().chain().focus().toggleItalic().run();

  const isBoldActive = isMarkActive("bold");
  const isItalicActive = isMarkActive("italic");
  const isBulletActive = editor.isActive("bulletList");
  const isOrderedActive = editor.isActive("orderedList");
  const isEmpty =
    editor.isEmpty || editor.getText().trim().length === 0;

  const labelId = id ?? name ?? "tiptap-editor";

  return (
    <div className={`w-full ${className ?? ""}`.trim()}>
      {label ? (
        <label
          htmlFor={labelId}
          className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-100"
        >
          <span>{label}</span>
          {required ? (
            <span className="text-xs font-semibold text-rose-500">*</span>
          ) : null}
        </label>
      ) : null}

      <div
        className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-200 dark:border-slate-700 dark:bg-slate-900/80 dark:focus-within:border-slate-500 dark:focus-within:ring-slate-700 ${
          containerClassName ?? ""
        }`.trim()}
      >
        <div
          className={`flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50/70 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/70 ${
            toolbarClassName ?? ""
          }`.trim()}
        >
          <button
            type="button"
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/60 ${
              isBulletActive
                ? "border-slate-800 bg-slate-900 text-white dark:border-slate-200 dark:bg-slate-50 dark:text-slate-900"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500"
            } ${buttonClassName ?? ""}`.trim()}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            disabled={!canBullet || disabled}
            aria-pressed={isBulletActive}
            aria-label="Lista con vinetas"
            title="Lista con vinetas"
          >
            <List className="h-4 w-4" />
          </button>

          <button
            type="button"
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/60 ${
              isOrderedActive
                ? "border-slate-800 bg-slate-900 text-white dark:border-slate-200 dark:bg-slate-50 dark:text-slate-900"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500"
            } ${buttonClassName ?? ""}`.trim()}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            disabled={!canOrdered || disabled}
            aria-pressed={isOrderedActive}
            aria-label="Lista numerada"
            title="Lista numerada"
          >
            <ListOrdered className="h-4 w-4" />
          </button>

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-700" />

          <button
            type="button"
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/60 ${
              isBoldActive
                ? "border-slate-800 bg-slate-900 text-white dark:border-slate-200 dark:bg-slate-50 dark:text-slate-900"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500"
            } ${buttonClassName ?? ""}`.trim()}
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!canBold || disabled}
            aria-pressed={isBoldActive}
            aria-label="Negrita"
            title="Negrita"
          >
            <Bold className="h-4 w-4" />
          </button>

          <button
            type="button"
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/60 ${
              isItalicActive
                ? "border-slate-800 bg-slate-900 text-white dark:border-slate-200 dark:bg-slate-50 dark:text-slate-900"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500"
            } ${buttonClassName ?? ""}`.trim()}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!canItalic || disabled}
            aria-pressed={isItalicActive}
            aria-label="Italica"
            title="Italica"
          >
            <Italic className="h-4 w-4" />
          </button>
        </div>

        <div className="relative px-4 py-3">
          {placeholder && isEmpty ? (
            <span className="pointer-events-none absolute left-4 top-3 text-[13px] text-slate-400 dark:text-zinc-400">
              {placeholder}
            </span>
          ) : null}
          <EditorContent
            editor={editor}
            id={labelId}
            className={`tiptap-content text-[15px] leading-5 text-slate-800 dark:text-slate-100 ${
              editorClassName ?? ""
            }`.trim()}
          />
          {name ? <input type="hidden" name={name} value={html} /> : null}
        </div>
      </div>

      {error ? (
        <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{error}</p>
      ) : helperText ? (
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
