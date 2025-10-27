import { Tool, ShapeStyle, Shape } from "@/types/canvas";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { AlignLeft, AlignCenter, AlignRight } from "lucide-react";

interface PropertiesPanelProps {
  activeTool: Tool;
  currentStyle: ShapeStyle;
  selectedShapes: Shape[];
  onStyleChange: (style: Partial<ShapeStyle>) => void;
}

export const PropertiesPanel = ({ activeTool, currentStyle, selectedShapes, onStyleChange }: PropertiesPanelProps) => {
  const selectedShape = selectedShapes.length === 1 ? selectedShapes[0] : null;
  const isTextSelected = selectedShape?.type === "text";
  
  const showStrokeColor = !["select", "hand", "eraser"].includes(activeTool) || isTextSelected;
  const showBackgroundColor = ["rectangle", "ellipse", "diamond"].includes(activeTool);
  const showStrokeWidth = !["select", "hand", "text", "eraser"].includes(activeTool);
  const showStrokeStyle = !["select", "hand", "text", "eraser", "pen"].includes(activeTool);
  const showSloppiness = !["select", "hand", "text", "eraser", "image"].includes(activeTool);
  const showRoundEdges = activeTool === "rectangle";
  const showTextOptions = activeTool === "text" || isTextSelected;
  const showOpacity = !["select", "hand", "eraser"].includes(activeTool);

  const showPanel = showStrokeColor || showBackgroundColor || showStrokeWidth || showTextOptions;

  if (!showPanel) return null;

  const colors = [
    { value: "#1e1e1e", label: "Black" },
    { value: "#e03131", label: "Red" },
    { value: "#2f9e44", label: "Green" },
    { value: "#1971c2", label: "Blue" },
    { value: "#f08c00", label: "Orange" },
    { value: "#e64980", label: "Pink" },
  ];

  const fontFamilies = ["Arial", "Helvetica", "Times New Roman", "Courier New", "Georgia"];
  const fontSizes = [12, 16, 20, 24, 32, 48];

  return (
    <div className="w-60 border-r border-border bg-panel-bg overflow-y-auto">
      <div className="p-4 space-y-4">
        {showStrokeColor && (
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">
              {showTextOptions ? "Text Color" : "Stroke Color"}
            </label>
            <div className="flex gap-2 flex-wrap">
              {colors.map((c) => (
                <button
                  key={c.value}
                  onClick={() => onStyleChange({ strokeColor: c.value })}
                  className={`w-7 h-7 rounded border-2 transition-all ${
                    currentStyle.strokeColor === c.value
                      ? "border-primary scale-110"
                      : "border-border hover:scale-105"
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
            </div>
          </div>
        )}

        {showBackgroundColor && (
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Background</label>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => onStyleChange({ backgroundColor: "transparent" })}
                className={`w-7 h-7 rounded border-2 transition-all ${
                  currentStyle.backgroundColor === "transparent"
                    ? "border-primary scale-110"
                    : "border-border hover:scale-105"
                }`}
                style={{ backgroundColor: "#fff" }}
                title="Transparent"
              >
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-4 h-0.5 bg-red-500 rotate-45" />
                </div>
              </button>
              {colors.map((c) => (
                <button
                  key={c.value}
                  onClick={() => onStyleChange({ backgroundColor: c.value })}
                  className={`w-7 h-7 rounded border-2 transition-all ${
                    currentStyle.backgroundColor === c.value
                      ? "border-primary scale-110"
                      : "border-border hover:scale-105"
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
            </div>
          </div>
        )}

        {showStrokeWidth && (
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">
              Stroke Width: {currentStyle.strokeWidth}px
            </label>
            <Slider
              value={[currentStyle.strokeWidth]}
              onValueChange={(value) => onStyleChange({ strokeWidth: value[0] })}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
          </div>
        )}

        {showStrokeStyle && (
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Stroke Style</label>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={currentStyle.strokeStyle === "solid" ? "default" : "outline"}
                onClick={() => onStyleChange({ strokeStyle: "solid" })}
                className="flex-1"
              >
                Solid
              </Button>
              <Button
                size="sm"
                variant={currentStyle.strokeStyle === "dashed" ? "default" : "outline"}
                onClick={() => onStyleChange({ strokeStyle: "dashed" })}
                className="flex-1"
              >
                Dash
              </Button>
              <Button
                size="sm"
                variant={currentStyle.strokeStyle === "dotted" ? "default" : "outline"}
                onClick={() => onStyleChange({ strokeStyle: "dotted" })}
                className="flex-1"
              >
                Dot
              </Button>
            </div>
          </div>
        )}

        {showSloppiness && (
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">
              Sloppiness: {currentStyle.sloppiness}
            </label>
            <Slider
              value={[currentStyle.sloppiness]}
              onValueChange={(value) => onStyleChange({ sloppiness: value[0] })}
              min={0}
              max={3}
              step={1}
              className="w-full"
            />
          </div>
        )}

        {showRoundEdges && (
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Edges</label>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={currentStyle.roundEdges ? "default" : "outline"}
                onClick={() => onStyleChange({ roundEdges: true })}
                className="flex-1"
              >
                Round
              </Button>
              <Button
                size="sm"
                variant={!currentStyle.roundEdges ? "default" : "outline"}
                onClick={() => onStyleChange({ roundEdges: false })}
                className="flex-1"
              >
                Sharp
              </Button>
            </div>
          </div>
        )}

        {showTextOptions && (
          <>
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Font Family</label>
              <div className="grid grid-cols-2 gap-2">
                {fontFamilies.map((font) => (
                  <Button
                    key={font}
                    size="sm"
                    variant="outline"
                    onClick={() => onStyleChange({ fontFamily: font } as any)}
                    className="text-xs truncate"
                    style={{ fontFamily: font }}
                  >
                    {font.split(" ")[0]}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Font Size</label>
              <div className="grid grid-cols-3 gap-2">
                {fontSizes.map((size) => (
                  <Button
                    key={size}
                    size="sm"
                    variant="outline"
                    onClick={() => onStyleChange({ fontSize: size } as any)}
                    className="text-xs"
                  >
                    {size}px
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Text Align</label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onStyleChange({ textAlign: "left" } as any)}
                  className="flex-1"
                >
                  <AlignLeft size={16} />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onStyleChange({ textAlign: "center" } as any)}
                  className="flex-1"
                >
                  <AlignCenter size={16} />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onStyleChange({ textAlign: "right" } as any)}
                  className="flex-1"
                >
                  <AlignRight size={16} />
                </Button>
              </div>
            </div>
          </>
        )}

        {showOpacity && (
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">
              Opacity: {Math.round(currentStyle.opacity * 100)}%
            </label>
            <Slider
              value={[currentStyle.opacity * 100]}
              onValueChange={(value) => onStyleChange({ opacity: value[0] / 100 })}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
        )}
      </div>
    </div>
  );
};
