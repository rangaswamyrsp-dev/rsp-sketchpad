import { useState, useCallback, useRef } from "react";
import { Shape, Point, ShapeStyle, Tool } from "@/types/canvas";
import { v4 as uuidv4 } from "uuid";

export const useCanvas = (initialStyle: ShapeStyle) => {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [history, setHistory] = useState<Shape[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const historyRef = useRef({ shapes: [], index: 0 });

  const addToHistory = useCallback((newShapes: Shape[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newShapes);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    historyRef.current = { shapes: newShapes, index: newHistory.length - 1 };
  }, [history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setShapes(history[newIndex]);
      setSelectedIds([]);
    }
  }, [historyIndex, history]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setShapes(history[newIndex]);
      setSelectedIds([]);
    }
  }, [historyIndex, history]);

  const createShape = useCallback((
    type: Tool,
    start: Point,
    end: Point,
    style: ShapeStyle
  ): Shape | null => {
    const width = Math.abs(end.x - start.x);
    const height = Math.abs(end.y - start.y);
    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);

    const baseShape = {
      id: uuidv4(),
      x,
      y,
      width,
      height,
      style,
      rotation: 0,
    };

    switch (type) {
      case "rectangle":
        return { ...baseShape, type: "rectangle" };
      case "ellipse":
        return { ...baseShape, type: "ellipse" };
      case "diamond":
        return { ...baseShape, type: "diamond" };
      case "line":
        return {
          ...baseShape,
          type: "line",
          points: [
            { x: start.x, y: start.y },
            { x: end.x, y: end.y },
          ],
        };
      case "arrow":
        return {
          ...baseShape,
          type: "arrow",
          points: [
            { x: start.x, y: start.y },
            { x: end.x, y: end.y },
          ],
        };
      case "text":
        return {
          ...baseShape,
          type: "text",
          text: "",
          fontSize: 16,
          fontFamily: "Arial",
          textAlign: "left",
        };
      case "pen":
        return {
          ...baseShape,
          type: "pen",
          points: [start],
        };
      default:
        return null;
    }
  }, []);

  const addShape = useCallback((shape: Shape) => {
    const newShapes = [...shapes, shape];
    setShapes(newShapes);
    addToHistory(newShapes);
  }, [shapes, addToHistory]);

  const updateShape = useCallback((id: string, updates: Partial<Shape>) => {
    const newShapes = shapes.map(shape => {
      if (shape.id === id) {
        return { ...shape, ...updates } as Shape;
      }
      return shape;
    });
    setShapes(newShapes);
    addToHistory(newShapes);
  }, [shapes, addToHistory]);

  const deleteSelected = useCallback(() => {
    const newShapes = shapes.filter(shape => !selectedIds.includes(shape.id));
    setShapes(newShapes);
    setSelectedIds([]);
    addToHistory(newShapes);
  }, [shapes, selectedIds, addToHistory]);

  const selectShape = useCallback((id: string, multi: boolean = false) => {
    if (multi) {
      setSelectedIds(prev => 
        prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
      );
    } else {
      setSelectedIds([id]);
    }
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const moveSelected = useCallback((dx: number, dy: number) => {
    const newShapes = shapes.map(shape => {
      if (selectedIds.includes(shape.id)) {
        return { ...shape, x: shape.x + dx, y: shape.y + dy };
      }
      return shape;
    });
    setShapes(newShapes);
  }, [shapes, selectedIds]);

  const getSelectedShapes = useCallback(() => {
    return shapes.filter(shape => selectedIds.includes(shape.id));
  }, [shapes, selectedIds]);

  return {
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
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
  };
};
