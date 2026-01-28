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
      return;
    }
    // Enter commits text, Shift+Enter inserts newline
    if (e.key === "Enter" && !e.shiftKey && !e.altKey) {
      e.preventDefault();
      if (text.trim()) {
        onComplete(text);
      } else {
        onCancel();
      }
    }
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
    <div
      className="absolute"
      style={{
        left: `${left}px`,
        top: `${top}px`,
        zIndex: 50,
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        autoFocus
        className="bg-background resize-both outline-none"
        placeholder="Type text..."
        spellCheck={false}
        style={{
          width: `${Math.max(shape.width * scale, 150)}px`,
          minHeight: `${Math.max(shape.fontSize * scale + 16, 40)}px`,
          fontSize: `${shape.fontSize * scale}px`,
          fontFamily: shape.fontFamily,
          textAlign: shape.textAlign,
          color: shape.style?.strokeColor && shape.style.strokeColor !== "transparent" ? shape.style.strokeColor : "hsl(var(--foreground))",
          padding: "8px",
          lineHeight: 1.2,
          whiteSpace: "pre-wrap",
          border: "2px solid hsl(var(--primary))",
          borderRadius: "4px",
        }}
      />
    </div>
  );
};
