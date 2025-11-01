import { useEffect, useRef, useState, useCallback } from "react";
import { Tool, Shape, Point, ShapeStyle, TextShape } from "@/types/canvas";
import { drawShape, getShapeAtPoint } from "@/utils/canvasUtils";
import { TextEditor } from "./TextEditor";
import { EraserPanel } from "./EraserPanel";

interface CanvasProps {
  zoom: number;
  activeTool: Tool;
  shapes: Shape[];
  selectedIds: string[];
  currentStyle: ShapeStyle;
  eraserSize: number;
  onAddShape: (shape: Shape) => void;
  onSelectShape: (id: string, multi: boolean) => void;
  onClearSelection: () => void;
  onMoveSelected: (dx: number, dy: number) => void;
  onUpdateShape: (id: string, updates: Partial<Shape>) => void;
  onCreateShape: (type: Tool, start: Point, end: Point, style: ShapeStyle) => Shape | null;
  onEraserSizeChange: (size: number) => void;
}

export const Canvas = ({
  zoom,
  activeTool,
  shapes,
  selectedIds,
  currentStyle,
  eraserSize,
  onAddShape,
  onSelectShape,
  onClearSelection,
  onMoveSelected,
  onUpdateShape,
  onCreateShape,
  onEraserSizeChange,
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
  const [editingText, setEditingText] = useState<TextShape | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setDrawStart(point);
      setPenPoints([point]);
    }

    // Text tool - create text and start editing
    if (activeTool === "text") {
      const textShape = onCreateShape("text", point, { x: point.x + 200, y: point.y + 30 }, currentStyle);
      if (textShape && "text" in textShape) {
        setEditingText(textShape as TextShape);
      }
    }

    // Image tool - trigger file input
    if (activeTool === "image") {
      setDrawStart(point);
      fileInputRef.current?.click();
    }

    // Eraser tool
    if (activeTool === "eraser") {
      setIsDrawing(true);
      const clickedShape = getShapeAtPoint(point, shapes);
      if (clickedShape) {
        onUpdateShape(clickedShape.id, { width: 0, height: 0 } as any);
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
        const shape = onCreateShape(activeTool, penPoints[0] || point, point, currentStyle);
        if (shape && "points" in shape) {
          setCurrentShape({ ...shape, points: [...penPoints, point] });
        }
      } else {
        const shape = onCreateShape(activeTool as Tool, drawStart, point, currentStyle);
        if (shape) {
          setCurrentShape(shape);
        }
      }
    }

    // Eraser tool - continuous erasing
    if (activeTool === "eraser" && isDrawing && !isPanning) {
      const clickedShape = getShapeAtPoint(point, shapes);
      if (clickedShape) {
        onUpdateShape(clickedShape.id, { width: 0, height: 0 } as any);
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
    
    // End eraser
    if (isDrawing && activeTool === "eraser") {
      setIsDrawing(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && drawStart) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Default to smaller size (max 300px width/height)
          const maxSize = 300;
          let width = img.width;
          let height = img.height;
          
          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = (height / width) * maxSize;
              width = maxSize;
            } else {
              width = (width / height) * maxSize;
              height = maxSize;
            }
          }
          
          const imageShape = onCreateShape(
            "image",
            drawStart,
            { x: drawStart.x + width, y: drawStart.y + height },
            currentStyle
          );
          if (imageShape && "src" in imageShape) {
            onAddShape({ ...imageShape, src: event.target?.result as string });
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleTextComplete = (text: string) => {
    if (editingText && text.trim()) {
      onAddShape({ ...editingText, text });
    }
    setEditingText(null);
  };

  const handleTextCancel = () => {
    setEditingText(null);
  };

  const getCursor = () => {
    if (activeTool === "hand" || isPanning) return "cursor-grab active:cursor-grabbing";
    if (activeTool === "select") return "cursor-default";
    if (activeTool === "text") return "cursor-text";
    if (activeTool === "eraser") return "cursor-not-allowed";
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
      
      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Text editor */}
      {editingText && (
        <TextEditor
          shape={editingText}
          zoom={zoom}
          offset={offset}
          onComplete={handleTextComplete}
          onCancel={handleTextCancel}
        />
      )}

      {/* Eraser panel */}
      {activeTool === "eraser" && (
        <EraserPanel
          eraserSize={eraserSize}
          onEraserSizeChange={onEraserSizeChange}
        />
      )}
      
      {/* Helper text */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-muted-foreground text-sm bg-card/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-border pointer-events-none">
        {activeTool === "select" && "Click shapes to select, drag to move"}
        {["rectangle", "ellipse", "diamond", "line", "arrow"].includes(activeTool) && "Click and drag to draw"}
        {activeTool === "pen" && "Click and drag to draw freehand"}
        {activeTool === "text" && "Click anywhere to add text"}
        {activeTool === "image" && "Click to upload and place an image"}
        {activeTool === "eraser" && "Click or drag over shapes to erase"}
        {activeTool === "hand" && "Drag to pan the canvas"}
      </div>
    </div>
  );
};
