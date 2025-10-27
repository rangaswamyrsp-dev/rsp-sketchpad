import { useEffect, useRef, useState, useCallback } from "react";
import { Tool, Shape, Point, ShapeStyle } from "@/types/canvas";
import { drawShape, getShapeAtPoint } from "@/utils/canvasUtils";

interface CanvasProps {
  zoom: number;
  activeTool: Tool;
  shapes: Shape[];
  selectedIds: string[];
  currentStyle: ShapeStyle;
  onAddShape: (shape: Shape) => void;
  onSelectShape: (id: string, multi: boolean) => void;
  onClearSelection: () => void;
  onMoveSelected: (dx: number, dy: number) => void;
  onUpdateShape: (id: string, updates: Partial<Shape>) => void;
  onCreateShape: (type: Tool, start: Point, end: Point, style: ShapeStyle) => Shape | null;
}

export const Canvas = ({
  zoom,
  activeTool,
  shapes,
  selectedIds,
  currentStyle,
  onAddShape,
  onSelectShape,
  onClearSelection,
  onMoveSelected,
  onUpdateShape,
  onCreateShape,
}: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [drawStart, setDrawStart] = useState<Point | null>(null);
  const [currentShape, setCurrentShape] = useState<Shape | null>(null);
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [penPoints, setPenPoints] = useState<Point[]>([]);

  // Get canvas coordinates from mouse event
  const getCanvasPoint = useCallback((e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - offset.x) / (zoom / 100),
      y: (e.clientY - rect.top - offset.y) / (zoom / 100),
    };
  }, [zoom, offset]);

  // Render all shapes
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Clean white canvas - no grid

    // Apply zoom and offset
    ctx.save();
    ctx.scale(zoom / 100, zoom / 100);
    ctx.translate(offset.x / (zoom / 100), offset.y / (zoom / 100));

    // Draw all shapes
    shapes.forEach(shape => {
      drawShape(ctx, shape, selectedIds.includes(shape.id));
    });

    // Draw current shape being created
    if (currentShape) {
      drawShape(ctx, currentShape, false);
    }

    ctx.restore();
  }, [shapes, selectedIds, currentShape, zoom, offset]);

  // Initialize and resize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      renderCanvas();
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [renderCanvas]);

  // Render when anything changes
  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCanvasPoint(e);

    // Pan with hand tool or middle mouse
    if (activeTool === "hand" || e.button === 1) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
      return;
    }

    // Selection tool
    if (activeTool === "select") {
      const clickedShape = getShapeAtPoint(point, shapes);
      if (clickedShape) {
        onSelectShape(clickedShape.id, e.shiftKey);
        setIsDragging(true);
        setDragStart(point);
      } else {
        onClearSelection();
      }
      return;
    }

    // Drawing tools
    if (["rectangle", "ellipse", "diamond", "line", "arrow"].includes(activeTool)) {
      setIsDrawing(true);
      setDrawStart(point);
    }

    // Pen tool
    if (activeTool === "pen") {
      setIsDrawing(true);
      setPenPoints([point]);
    }

    // Text tool - inline editing handled by selected text
    if (activeTool === "text") {
      const textShape = onCreateShape("text", point, { x: point.x + 100, y: point.y + 30 }, currentStyle);
      if (textShape && "text" in textShape) {
        const text = prompt("Enter text:");
        if (text) {
          onAddShape({ ...textShape, text });
        }
      }
    }

    // Eraser tool
    if (activeTool === "eraser") {
      const clickedShape = getShapeAtPoint(point, shapes);
      if (clickedShape) {
        onUpdateShape(clickedShape.id, { deleted: true } as any);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCanvasPoint(e);

    // Panning
    if (isPanning) {
      setOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    // Dragging selected shapes
    if (isDragging && dragStart) {
      const dx = point.x - dragStart.x;
      const dy = point.y - dragStart.y;
      onMoveSelected(dx, dy);
      setDragStart(point);
      return;
    }

    // Drawing shapes
    if (isDrawing && drawStart) {
      if (activeTool === "pen") {
        setPenPoints(prev => [...prev, point]);
        if (penPoints.length > 0) {
          const shape = onCreateShape(activeTool, penPoints[0], point, currentStyle);
          if (shape && "points" in shape) {
            setCurrentShape({ ...shape, points: penPoints });
          }
        }
      } else {
        const shape = onCreateShape(activeTool as Tool, drawStart, point, currentStyle);
        if (shape) {
          setCurrentShape(shape);
        }
      }
    }
  };

  const handleMouseUp = () => {
    // End panning
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    // End dragging
    if (isDragging) {
      setIsDragging(false);
      setDragStart(null);
      return;
    }

    // Complete drawing
    if (isDrawing && currentShape) {
      if (currentShape.width > 5 || currentShape.height > 5 || 
          (activeTool === "pen" && penPoints.length > 2)) {
        onAddShape(currentShape);
      }
      setIsDrawing(false);
      setDrawStart(null);
      setCurrentShape(null);
      setPenPoints([]);
    }
  };

  const getCursor = () => {
    if (activeTool === "hand" || isPanning) return "cursor-grab active:cursor-grabbing";
    if (activeTool === "select") return "cursor-default";
    if (activeTool === "text") return "cursor-text";
    return "cursor-crosshair";
  };

  return (
    <div className="flex-1 relative overflow-hidden bg-background">
      <canvas
        ref={canvasRef}
        className={`w-full h-full ${getCursor()}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      
      {/* Helper text */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-muted-foreground text-sm bg-card/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-border pointer-events-none">
        {activeTool === "select" && "Click shapes to select, drag to move"}
        {["rectangle", "ellipse", "diamond"].includes(activeTool) && "Click and drag to draw"}
        {activeTool === "pen" && "Click and drag to draw freehand"}
        {activeTool === "text" && "Click to add text"}
        {activeTool === "eraser" && "Click shapes to erase"}
        {activeTool === "hand" && "Drag to pan the canvas"}
      </div>
    </div>
  );
};
