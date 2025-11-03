import { useEffect, useRef, useState } from "react";
import { TextShape } from "@/types/canvas";

interface TextEditorProps {
  shape: TextShape;
  zoom: number;
  offset: { x: number; y: number };
  onComplete: (text: string) => void;
  onCancel: () => void;
}

export const TextEditor = ({ shape, zoom, offset, onComplete, onCancel }: TextEditorProps) => {
  const [text, setText] = useState(shape.text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      // Delay focus to ensure element is mounted and visible
      requestAnimationFrame(() => {
        el.focus();
        el.select();
      });
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
    // Enter key adds new line - don't prevent default
  };

  const handleBlur = () => {
    if (text.trim()) {
      onComplete(text);
    } else {
      onCancel();
    }
  };

  const scale = zoom / 100;
  const left = shape.x * scale + offset.x;
  const top = shape.y * scale + offset.y;

  return (
    <textarea
      ref={textareaRef}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      onMouseDown={(e) => e.stopPropagation()}
      autoFocus
      className="absolute bg-transparent resize-none outline-none border-none"
      placeholder="Type text..."
      spellCheck={false}
      style={{
        left: `${left}px`,
        top: `${top}px`,
        width: `${Math.max(shape.width * scale, 100)}px`,
        minHeight: `${shape.fontSize * scale}px`,
        fontSize: `${shape.fontSize * scale}px`,
        fontFamily: shape.fontFamily,
        textAlign: shape.textAlign,
        color: shape.style?.strokeColor && shape.style.strokeColor !== "transparent" ? shape.style.strokeColor : "hsl(var(--foreground))",
        padding: "2px 4px",
        lineHeight: 1.2,
        whiteSpace: "pre-wrap",
        zIndex: 50,
      }}
    />
  );
};
