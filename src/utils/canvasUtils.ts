import { Shape, Point } from "@/types/canvas";

// Store loaded images to avoid reloading
const imageCache: Map<string, HTMLImageElement> = new Map();

export const drawShape = (
  ctx: CanvasRenderingContext2D,
  shape: Shape,
  isSelected: boolean = false
) => {
  ctx.save();
  
  // Apply opacity
  ctx.globalAlpha = shape.style.opacity;

  // Apply rotation
  if (shape.rotation !== 0) {
    const centerX = shape.x + shape.width / 2;
    const centerY = shape.y + shape.height / 2;
    ctx.translate(centerX, centerY);
    ctx.rotate((shape.rotation * Math.PI) / 180);
    ctx.translate(-centerX, -centerY);
  }

  // Set style
  ctx.strokeStyle = shape.style.strokeColor;
  ctx.fillStyle = shape.style.backgroundColor;
  ctx.lineWidth = shape.style.strokeWidth;

  // Set line dash
  if (shape.style.strokeStyle === "dashed") {
    ctx.setLineDash([10, 5]);
  } else if (shape.style.strokeStyle === "dotted") {
    ctx.setLineDash([2, 3]);
  } else {
    ctx.setLineDash([]);
  }

  // Draw based on type
  switch (shape.type) {
    case "rectangle":
      if (shape.style.backgroundColor !== "transparent") {
        if (shape.style.roundEdges) {
          drawRoundedRect(ctx, shape.x, shape.y, shape.width, shape.height, 8);
          ctx.fill();
        } else {
          ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
        }
      }
      if (shape.style.roundEdges) {
        drawRoundedRect(ctx, shape.x, shape.y, shape.width, shape.height, 8);
        ctx.stroke();
      } else {
        ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      }
      break;

    case "ellipse":
      ctx.beginPath();
      ctx.ellipse(
        shape.x + shape.width / 2,
        shape.y + shape.height / 2,
        Math.abs(shape.width / 2),
        Math.abs(shape.height / 2),
        0,
        0,
        2 * Math.PI
      );
      if (shape.style.backgroundColor !== "transparent") {
        ctx.fill();
      }
      ctx.stroke();
      break;

    case "diamond":
      ctx.beginPath();
      ctx.moveTo(shape.x + shape.width / 2, shape.y);
      ctx.lineTo(shape.x + shape.width, shape.y + shape.height / 2);
      ctx.lineTo(shape.x + shape.width / 2, shape.y + shape.height);
      ctx.lineTo(shape.x, shape.y + shape.height / 2);
      ctx.closePath();
      if (shape.style.backgroundColor !== "transparent") {
        ctx.fill();
      }
      ctx.stroke();
      break;

    case "line":
    case "arrow":
      if ("points" in shape && shape.points.length >= 2) {
        ctx.beginPath();
        ctx.moveTo(shape.points[0].x, shape.points[0].y);
        for (let i = 1; i < shape.points.length; i++) {
          ctx.lineTo(shape.points[i].x, shape.points[i].y);
        }
        ctx.stroke();

        // Draw arrow head
        if (shape.type === "arrow" && shape.points.length >= 2) {
          const lastPoint = shape.points[shape.points.length - 1];
          const secondLastPoint = shape.points[shape.points.length - 2];
          drawArrowHead(ctx, secondLastPoint, lastPoint, 10);
        }
      }
      break;

    case "text":
      if ("text" in shape) {
        // Ensure readable text rendering
        ctx.font = `${shape.fontSize}px ${shape.fontFamily}`;
        ctx.textBaseline = "top";
        ctx.textAlign = shape.textAlign as CanvasTextAlign;

        // Fallback color if strokeColor is transparent/invalid
        const color = shape.style.strokeColor && shape.style.strokeColor !== "transparent"
          ? shape.style.strokeColor
          : "#1e1e1e";
        ctx.fillStyle = color;

        // Support multi-line text (Shift+Enter)
        const lines = String(shape.text || "").split(/\r?\n/);
        const lineHeight = Math.round(shape.fontSize * 1.2);

        // Compute x based on alignment within the shape bounds
        let x = shape.x;
        if (shape.textAlign === "center") x = shape.x + shape.width / 2;
        if (shape.textAlign === "right") x = shape.x + shape.width;

        lines.forEach((line, i) => {
          ctx.fillText(line, x, shape.y + i * lineHeight);
        });
      }
      break;

    case "pen":
      if ("points" in shape && shape.points.length > 1) {
        ctx.beginPath();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.moveTo(shape.points[0].x, shape.points[0].y);
        for (let i = 1; i < shape.points.length; i++) {
          ctx.lineTo(shape.points[i].x, shape.points[i].y);
        }
        ctx.stroke();
      }
      break;

    case "image":
      if ("src" in shape && shape.src) {
        let img = imageCache.get(shape.src);
        if (!img) {
          img = new Image();
          img.src = shape.src;
          imageCache.set(shape.src, img);
        }
        if (img.complete) {
          ctx.drawImage(img, shape.x, shape.y, shape.width, shape.height);
        }
      }
      break;
  }

  // Draw selection handles
  if (isSelected) {
    drawSelectionHandles(ctx, shape);
  }

  ctx.restore();
};

const drawRoundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
};

const drawArrowHead = (
  ctx: CanvasRenderingContext2D,
  from: Point,
  to: Point,
  size: number
) => {
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  ctx.beginPath();
  ctx.moveTo(to.x, to.y);
  ctx.lineTo(
    to.x - size * Math.cos(angle - Math.PI / 6),
    to.y - size * Math.sin(angle - Math.PI / 6)
  );
  ctx.moveTo(to.x, to.y);
  ctx.lineTo(
    to.x - size * Math.cos(angle + Math.PI / 6),
    to.y - size * Math.sin(angle + Math.PI / 6)
  );
  ctx.stroke();
};

const drawSelectionHandles = (ctx: CanvasRenderingContext2D, shape: Shape) => {
  const handleSize = 8;
  ctx.fillStyle = "#6366f1";
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;

  const handles = [
    { x: shape.x, y: shape.y }, // Top-left
    { x: shape.x + shape.width / 2, y: shape.y }, // Top-center
    { x: shape.x + shape.width, y: shape.y }, // Top-right
    { x: shape.x + shape.width, y: shape.y + shape.height / 2 }, // Right-center
    { x: shape.x + shape.width, y: shape.y + shape.height }, // Bottom-right
    { x: shape.x + shape.width / 2, y: shape.y + shape.height }, // Bottom-center
    { x: shape.x, y: shape.y + shape.height }, // Bottom-left
    { x: shape.x, y: shape.y + shape.height / 2 }, // Left-center
  ];

  handles.forEach(handle => {
    ctx.fillRect(
      handle.x - handleSize / 2,
      handle.y - handleSize / 2,
      handleSize,
      handleSize
    );
    ctx.strokeRect(
      handle.x - handleSize / 2,
      handle.y - handleSize / 2,
      handleSize,
      handleSize
    );
  });

  // Draw bounding box
  ctx.setLineDash([5, 5]);
  ctx.strokeStyle = "#6366f1";
  ctx.lineWidth = 1;
  ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
  ctx.setLineDash([]);
};

export const isPointInShape = (point: Point, shape: Shape): boolean => {
  return (
    point.x >= shape.x &&
    point.x <= shape.x + shape.width &&
    point.y >= shape.y &&
    point.y <= shape.y + shape.height
  );
};

export const getShapeAtPoint = (
  point: Point,
  shapes: Shape[]
): Shape | null => {
  // Check from top to bottom (reverse order)
  for (let i = shapes.length - 1; i >= 0; i--) {
    if (isPointInShape(point, shapes[i])) {
      return shapes[i];
    }
  }
  return null;
};

export const getResizeHandle = (
  point: Point,
  shape: Shape
): string | null => {
  const handleSize = 8;
  const handles = [
    { name: "nw", x: shape.x, y: shape.y },
    { name: "n", x: shape.x + shape.width / 2, y: shape.y },
    { name: "ne", x: shape.x + shape.width, y: shape.y },
    { name: "e", x: shape.x + shape.width, y: shape.y + shape.height / 2 },
    { name: "se", x: shape.x + shape.width, y: shape.y + shape.height },
    { name: "s", x: shape.x + shape.width / 2, y: shape.y + shape.height },
    { name: "sw", x: shape.x, y: shape.y + shape.height },
    { name: "w", x: shape.x, y: shape.y + shape.height / 2 },
  ];

  for (const handle of handles) {
    if (
      point.x >= handle.x - handleSize &&
      point.x <= handle.x + handleSize &&
      point.y >= handle.y - handleSize &&
      point.y <= handle.y + handleSize
    ) {
      return handle.name;
    }
  }
  return null;
};
