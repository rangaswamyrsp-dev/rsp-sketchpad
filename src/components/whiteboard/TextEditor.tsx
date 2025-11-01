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
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onCancel();
    }
    // Enter works without shift - just adds new line naturally
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
      className="absolute bg-transparent resize-none outline-none border-none"
      style={{
        left: `${left}px`,
        top: `${top}px`,
        width: `${Math.max(shape.width * scale, 100)}px`,
        minHeight: `${shape.fontSize * scale}px`,
        fontSize: `${shape.fontSize * scale}px`,
        fontFamily: shape.fontFamily,
        textAlign: shape.textAlign,
        color: shape.style.strokeColor,
        padding: "2px 4px",
        lineHeight: 1.2,
      }}
    />
  );
};
