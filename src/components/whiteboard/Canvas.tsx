import { useEffect, useRef, useState } from "react";
import { Tool } from "@/pages/Whiteboard";

interface CanvasProps {
  zoom: number;
  activeTool: Tool;
}

export const Canvas = ({ zoom, activeTool }: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;

    const gridSize = 20 * (zoom / 100);
    const offsetX = offset.x % gridSize;
    const offsetY = offset.y % gridSize;

    for (let x = offsetX; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    for (let y = offsetY; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }, [zoom, offset]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === "hand" || e.button === 1) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      setOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  return (
    <div className="flex-1 relative overflow-hidden">
      <canvas
        ref={canvasRef}
        className={`w-full h-full bg-canvas ${
          activeTool === "hand" || isPanning ? "cursor-grab" : "cursor-crosshair"
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      
      {/* Helper text */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-muted-foreground text-sm bg-card/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-border">
        To move canvas, hold mouse wheel or spacebar while dragging, or use the hand tool
      </div>
    </div>
  );
};
