import { useState } from "react";
import { Toolbar } from "@/components/whiteboard/Toolbar";
import { Canvas } from "@/components/whiteboard/Canvas";
import { MenuSidebar } from "@/components/whiteboard/MenuSidebar";
import { PropertiesPanel } from "@/components/whiteboard/PropertiesPanel";
import { ZoomControls } from "@/components/whiteboard/ZoomControls";

export type Tool = 
  | "select"
  | "hand"
  | "rectangle"
  | "ellipse"
  | "diamond"
  | "line"
  | "arrow"
  | "text"
  | "pen"
  | "eraser"
  | "image";

export type StrokeStyle = "solid" | "dashed" | "dotted";

export interface ShapeStyle {
  strokeColor: string;
  backgroundColor: string;
  strokeWidth: number;
  strokeStyle: StrokeStyle;
  sloppiness: number;
  roundEdges: boolean;
}

const Whiteboard = () => {
  const [activeTool, setActiveTool] = useState<Tool>("select");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [shapeStyle, setShapeStyle] = useState<ShapeStyle>({
    strokeColor: "#1e1e1e",
    backgroundColor: "transparent",
    strokeWidth: 1,
    strokeStyle: "solid",
    sloppiness: 0,
    roundEdges: false,
  });

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 10, 300));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 10, 10));
  };

  const handleResetZoom = () => {
    setZoom(100);
  };

  return (
    <div className="h-screen w-full flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              className="text-foreground"
            >
              <path
                d="M2 4h16M2 10h16M2 16h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-foreground">
            RSP Whiteboard
          </h1>
        </div>

        <Toolbar activeTool={activeTool} onToolChange={setActiveTool} />

        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium">
            Share
          </button>
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              className="text-foreground"
            >
              <rect
                x="3"
                y="3"
                width="14"
                height="14"
                rx="2"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M3 8h14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex relative">
        <MenuSidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        
        <PropertiesPanel
          activeTool={activeTool}
          style={shapeStyle}
          onStyleChange={setShapeStyle}
        />

        <Canvas zoom={zoom} activeTool={activeTool} />

        <ZoomControls
          zoom={zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetZoom={handleResetZoom}
        />
      </div>
    </div>
  );
};

export default Whiteboard;
