import { useState, useEffect, useCallback } from "react";
import { Toolbar } from "@/components/whiteboard/Toolbar";
import { Canvas } from "@/components/whiteboard/Canvas";
import { MenuSidebar } from "@/components/whiteboard/MenuSidebar";
import { PropertiesPanel } from "@/components/whiteboard/PropertiesPanel";
import { ZoomControls } from "@/components/whiteboard/ZoomControls";
import { useCanvas } from "@/hooks/useCanvas";
import { Tool, ShapeStyle } from "@/types/canvas";
import { toast } from "sonner";

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

  const {
    shapes,
    selectedIds,
    createShape,
    addShape,
    updateShape,
    deleteSelected,
    selectShape,
    clearSelection,
    moveSelected,
    undo,
    redo,
    resetCanvas,
    canUndo,
    canRedo,
  } = useCanvas(shapeStyle);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo/Redo
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
        toast.success("Undo");
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        redo();
        toast.success("Redo");
      }

      // Delete
      if ((e.key === "Delete" || e.key === "Backspace") && selectedIds.length > 0) {
        e.preventDefault();
        deleteSelected();
        toast.success(`Deleted ${selectedIds.length} shape(s)`);
      }

      // Escape
      if (e.key === "Escape") {
        clearSelection();
        setActiveTool("select");
      }

      // Tool shortcuts
      if (e.key === "v") setActiveTool("select");
      if (e.key === "h") setActiveTool("hand");
      if (e.key === "r") setActiveTool("rectangle");
      if (e.key === "o") setActiveTool("ellipse");
      if (e.key === "d") setActiveTool("diamond");
      if (e.key === "l") setActiveTool("line");
      if (e.key === "a") setActiveTool("arrow");
      if (e.key === "t") setActiveTool("text");
      if (e.key === "p") setActiveTool("pen");

      // Arrow keys to move selected
      if (selectedIds.length > 0) {
        if (e.key === "ArrowUp") {
          e.preventDefault();
          moveSelected(0, e.shiftKey ? -10 : -1);
        }
        if (e.key === "ArrowDown") {
          e.preventDefault();
          moveSelected(0, e.shiftKey ? 10 : 1);
        }
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          moveSelected(e.shiftKey ? -10 : -1, 0);
        }
        if (e.key === "ArrowRight") {
          e.preventDefault();
          moveSelected(e.shiftKey ? 10 : 1, 0);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, deleteSelected, selectedIds, clearSelection, moveSelected]);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 10, 300));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 10, 10));
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoom(100);
  }, []);

  return (
    <div className="h-screen w-full flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 relative z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Menu"
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
          <span className="text-xs text-muted-foreground">
            {shapes.length} shape{shapes.length !== 1 ? "s" : ""}
          </span>
        </div>

        <Toolbar activeTool={activeTool} onToolChange={setActiveTool} />

        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium text-sm">
            Share
          </button>
          <button 
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Library"
          >
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
        <MenuSidebar 
          isOpen={isMenuOpen} 
          onClose={() => setIsMenuOpen(false)}
          onResetCanvas={() => {
            if (window.confirm("Are you sure you want to reset the canvas? This will delete all shapes.")) {
              resetCanvas();
              toast.success("Canvas reset");
            }
          }}
        />
        
        <PropertiesPanel
          activeTool={activeTool}
          style={shapeStyle}
          onStyleChange={setShapeStyle}
        />

        <Canvas
          zoom={zoom}
          activeTool={activeTool}
          shapes={shapes}
          selectedIds={selectedIds}
          currentStyle={shapeStyle}
          onAddShape={addShape}
          onSelectShape={selectShape}
          onClearSelection={clearSelection}
          onMoveSelected={moveSelected}
          onUpdateShape={updateShape}
          onCreateShape={createShape}
        />

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
