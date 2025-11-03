import { useState, useEffect, useCallback, useRef } from "react";
import { Toolbar } from "@/components/whiteboard/Toolbar";
import { Canvas } from "@/components/whiteboard/Canvas";
import { MenuSidebar } from "@/components/whiteboard/MenuSidebar";
import { PropertiesPanel } from "@/components/whiteboard/PropertiesPanel";
import { ZoomControls } from "@/components/whiteboard/ZoomControls";
import { useCanvas } from "@/hooks/useCanvas";
import { Tool, ShapeStyle } from "@/types/canvas";
import { toast } from "sonner";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Whiteboard = () => {
  const [activeTool, setActiveTool] = useState<Tool>("select");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [eraserSize, setEraserSize] = useState(20);
  const [shapeStyle, setShapeStyle] = useState<ShapeStyle>({
    strokeColor: "#1e1e1e",
    backgroundColor: "transparent",
    strokeWidth: 1,
    strokeStyle: "solid",
    sloppiness: 0,
    roundEdges: false,
    opacity: 1,
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
    getSelectedShapes,
    undo,
    redo,
    resetCanvas,
    canUndo,
    canRedo,
  } = useCanvas(shapeStyle);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't interfere with text editing
      if ((e.target as HTMLElement).tagName === 'TEXTAREA') {
        return;
      }

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

      // Number-based tool shortcuts
      if (e.key === "1") setActiveTool("hand");
      if (e.key === "2") setActiveTool("rectangle");
      if (e.key === "3") setActiveTool("ellipse");
      if (e.key === "4") setActiveTool("diamond");
      if (e.key === "5") setActiveTool("arrow");
      if (e.key === "6") setActiveTool("line");
      if (e.key === "7") setActiveTool("pen");
      if (e.key === "8") setActiveTool("text");
      if (e.key === "9") setActiveTool("image");
      if (e.key === "0") setActiveTool("eraser");
      
      // V for select (keep this one)
      if (e.key === "v") setActiveTool("select");

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

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleExportPNG = useCallback(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `whiteboard-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Exported as PNG");
    });
  }, []);

  const handleExportJPEG = useCallback(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `whiteboard-${Date.now()}.jpeg`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Exported as JPEG");
    }, 'image/jpeg', 0.95);
  }, []);

  const handleExportJSON = useCallback(() => {
    const data = JSON.stringify(shapes, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `whiteboard-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Saved as JSON");
  }, [shapes]);

  const handleLoadJSON = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const loadedShapes = JSON.parse(event.target?.result as string);
          localStorage.setItem('rsp-whiteboard-shapes', JSON.stringify(loadedShapes));
          window.location.reload();
          toast.success("Canvas loaded");
        } catch (error) {
          toast.error("Failed to load canvas");
        }
      };
      reader.readAsText(file);
    };
    input.click();
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
          onResetCanvas={() => setShowResetDialog(true)}
          onExportPNG={handleExportPNG}
          onExportJPEG={handleExportJPEG}
          onExportJSON={handleExportJSON}
          onLoadJSON={handleLoadJSON}
        />
        
        <PropertiesPanel
          activeTool={activeTool}
          currentStyle={shapeStyle}
          selectedShapes={getSelectedShapes()}
          onStyleChange={(updates) => setShapeStyle({ ...shapeStyle, ...updates })}
        />

        <Canvas
          zoom={zoom}
          activeTool={activeTool}
          shapes={shapes}
          selectedIds={selectedIds}
          currentStyle={shapeStyle}
          eraserSize={eraserSize}
          onAddShape={addShape}
          onSelectShape={selectShape}
          onClearSelection={clearSelection}
          onMoveSelected={moveSelected}
          onUpdateShape={updateShape}
          onCreateShape={createShape}
          onEraserSizeChange={setEraserSize}
        />

        <ZoomControls
          zoom={zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetZoom={handleResetZoom}
        />
      </div>

      {/* Reset canvas confirmation dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear canvas</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear the whole canvas. Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                resetCanvas();
                toast.success("Canvas reset");
                setShowResetDialog(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Whiteboard;
