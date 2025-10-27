import { MousePointer2, Hand, Square, Circle, Diamond, ArrowRight, Minus, Type, Pencil, Eraser, Image as ImageIcon } from "lucide-react";
import { Tool } from "@/types/canvas";

interface ToolbarProps {
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
}

export const Toolbar = ({ activeTool, onToolChange }: ToolbarProps) => {
  const tools: { id: Tool; icon: React.ReactNode; label: string }[] = [
    { id: "select", icon: <MousePointer2 size={18} />, label: "Selection (V)" },
    { id: "hand", icon: <Hand size={18} />, label: "Hand" },
    { id: "rectangle", icon: <Square size={18} />, label: "Rectangle" },
    { id: "ellipse", icon: <Circle size={18} />, label: "Ellipse" },
    { id: "diamond", icon: <Diamond size={18} />, label: "Diamond" },
    { id: "arrow", icon: <ArrowRight size={18} />, label: "Arrow" },
    { id: "line", icon: <Minus size={18} />, label: "Line" },
    { id: "pen", icon: <Pencil size={18} />, label: "Pen" },
    { id: "text", icon: <Type size={18} />, label: "Text" },
    { id: "image", icon: <ImageIcon size={18} />, label: "Image" },
    { id: "eraser", icon: <Eraser size={18} />, label: "Eraser" },
  ];

  return (
    <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1 shadow-lg">
      {tools.map((tool, index) => (
        <div key={tool.id} className="flex items-center">
          <button
            onClick={() => onToolChange(tool.id)}
            className={`p-2.5 rounded-md transition-all ${
              activeTool === tool.id
                ? "bg-primary/10 text-primary"
                : "hover:bg-muted text-muted-foreground"
            }`}
            title={tool.label}
          >
            {tool.icon}
          </button>
          {index === 1 && (
            <div className="w-px h-6 bg-border mx-1" />
          )}
          {index === 6 && (
            <div className="w-px h-6 bg-border mx-1" />
          )}
          {index === 8 && (
            <div className="w-px h-6 bg-border mx-1" />
          )}
        </div>
      ))}
    </div>
  );
};
