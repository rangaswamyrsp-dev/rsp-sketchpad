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

export interface Point {
  x: number;
  y: number;
}

export interface ShapeStyle {
  strokeColor: string;
  backgroundColor: string;
  strokeWidth: number;
  strokeStyle: StrokeStyle;
  sloppiness: number;
  roundEdges: boolean;
  opacity: number;
}

export interface BaseShape {
  id: string;
  type: Tool;
  x: number;
  y: number;
  width: number;
  height: number;
  style: ShapeStyle;
  rotation: number;
}

export interface RectangleShape extends BaseShape {
  type: "rectangle";
}

export interface EllipseShape extends BaseShape {
  type: "ellipse";
}

export interface DiamondShape extends BaseShape {
  type: "diamond";
}

export interface LineShape extends BaseShape {
  type: "line";
  points: Point[];
}

export interface ArrowShape extends BaseShape {
  type: "arrow";
  points: Point[];
}

export interface TextShape extends BaseShape {
  type: "text";
  text: string;
  fontSize: number;
  fontFamily: string;
  textAlign: "left" | "center" | "right";
}

export interface PenShape extends BaseShape {
  type: "pen";
  points: Point[];
}

export interface ImageShape extends BaseShape {
  type: "image";
  src: string;
}

export type Shape = 
  | RectangleShape 
  | EllipseShape 
  | DiamondShape 
  | LineShape 
  | ArrowShape
  | TextShape 
  | PenShape
  | ImageShape;

export interface CanvasState {
  shapes: Shape[];
  selectedIds: string[];
  clipboard: Shape[];
}
