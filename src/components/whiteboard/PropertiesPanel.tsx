import { Tool, ShapeStyle, StrokeStyle } from "@/pages/Whiteboard";

interface PropertiesPanelProps {
  activeTool: Tool;
  style: ShapeStyle;
  onStyleChange: (style: ShapeStyle) => void;
}

export const PropertiesPanel = ({
  activeTool,
  style,
  onStyleChange,
}: PropertiesPanelProps) => {
  const showPanel = ["rectangle", "ellipse", "diamond", "line", "arrow", "pen"].includes(
    activeTool
  );

  if (!showPanel) return null;

  const strokeColors = [
    { color: "#1e1e1e", label: "Black" },
    { color: "#e03131", label: "Red" },
    { color: "#2f9e44", label: "Green" },
    { color: "#1971c2", label: "Blue" },
    { color: "#f08c00", label: "Orange" },
  ];

  const backgroundColors = [
    { color: "transparent", label: "Transparent" },
    { color: "#ffc9c9", label: "Light Red" },
    { color: "#b2f2bb", label: "Light Green" },
    { color: "#a5d8ff", label: "Light Blue" },
    { color: "#ffe066", label: "Light Yellow" },
  ];

  const strokeWidths = [
    { value: 1, label: "Thin" },
    { value: 2, label: "Medium" },
    { value: 3, label: "Bold" },
  ];

  const strokeStyles: { value: StrokeStyle; label: string }[] = [
    { value: "solid", label: "Solid" },
    { value: "dashed", label: "Dashed" },
    { value: "dotted", label: "Dotted" },
  ];

  return (
    <div className="w-60 border-r border-border bg-panel-bg overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* Stroke Color */}
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Stroke
          </label>
          <div className="flex gap-2">
            {strokeColors.map((c) => (
              <button
                key={c.color}
                onClick={() => onStyleChange({ ...style, strokeColor: c.color })}
                className={`w-8 h-8 rounded border-2 transition-all ${
                  style.strokeColor === c.color
                    ? "border-primary scale-110"
                    : "border-border hover:scale-105"
                }`}
                style={{ backgroundColor: c.color }}
                title={c.label}
              />
            ))}
            <button
              className="w-8 h-8 rounded border-2 border-border hover:scale-105 bg-card flex items-center justify-center text-muted-foreground"
              title="Custom color"
            >
              <input
                type="color"
                value={style.strokeColor}
                onChange={(e) =>
                  onStyleChange({ ...style, strokeColor: e.target.value })
                }
                className="w-full h-full opacity-0 cursor-pointer"
              />
              <span className="absolute pointer-events-none">+</span>
            </button>
          </div>
        </div>

        {/* Background */}
        {activeTool !== "line" && activeTool !== "arrow" && (
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Background
            </label>
            <div className="flex gap-2">
              {backgroundColors.map((c) => (
                <button
                  key={c.color}
                  onClick={() =>
                    onStyleChange({ ...style, backgroundColor: c.color })
                  }
                  className={`w-8 h-8 rounded border-2 transition-all ${
                    style.backgroundColor === c.color
                      ? "border-primary scale-110"
                      : "border-border hover:scale-105"
                  }`}
                  style={{
                    backgroundColor: c.color === "transparent" ? "#fff" : c.color,
                  }}
                  title={c.label}
                >
                  {c.color === "transparent" && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-4 h-0.5 bg-red-500 rotate-45" />
                    </div>
                  )}
                </button>
              ))}
              <button
                className="w-8 h-8 rounded border-2 border-border hover:scale-105 bg-card flex items-center justify-center text-muted-foreground relative"
                title="Custom color"
              >
                <input
                  type="color"
                  value={
                    style.backgroundColor === "transparent"
                      ? "#ffffff"
                      : style.backgroundColor
                  }
                  onChange={(e) =>
                    onStyleChange({ ...style, backgroundColor: e.target.value })
                  }
                  className="w-full h-full opacity-0 cursor-pointer"
                />
                <span className="absolute pointer-events-none">+</span>
              </button>
            </div>
          </div>
        )}

        {/* Stroke width */}
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Stroke width
          </label>
          <div className="flex gap-2">
            {strokeWidths.map((w) => (
              <button
                key={w.value}
                onClick={() => onStyleChange({ ...style, strokeWidth: w.value })}
                className={`flex-1 px-3 py-2 rounded border transition-all ${
                  style.strokeWidth === w.value
                    ? "border-primary bg-primary/10"
                    : "border-border hover:bg-muted"
                }`}
              >
                <div
                  className="w-full bg-foreground rounded"
                  style={{ height: `${w.value * 2}px` }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Stroke style */}
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Stroke style
          </label>
          <div className="flex gap-2">
            {strokeStyles.map((s) => (
              <button
                key={s.value}
                onClick={() => onStyleChange({ ...style, strokeStyle: s.value })}
                className={`flex-1 px-3 py-3 rounded border transition-all ${
                  style.strokeStyle === s.value
                    ? "border-primary bg-primary/10"
                    : "border-border hover:bg-muted"
                }`}
                title={s.label}
              >
                <div className="w-full h-0.5 bg-foreground" />
              </button>
            ))}
          </div>
        </div>

        {/* Sloppiness */}
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Sloppiness
          </label>
          <div className="flex gap-2">
            {[0, 1, 2].map((level) => (
              <button
                key={level}
                onClick={() => onStyleChange({ ...style, sloppiness: level })}
                className={`flex-1 px-3 py-3 rounded border transition-all ${
                  style.sloppiness === level
                    ? "border-primary bg-primary/10"
                    : "border-border hover:bg-muted"
                }`}
              >
                <svg
                  width="100%"
                  height="20"
                  viewBox="0 0 50 20"
                  className="text-foreground"
                >
                  <path
                    d={
                      level === 0
                        ? "M 5 10 L 45 10"
                        : level === 1
                        ? "M 5 10 Q 15 8, 25 10 T 45 10"
                        : "M 5 10 Q 12 6, 18 11 Q 25 15, 32 9 Q 39 5, 45 10"
                    }
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Edges */}
        {activeTool === "rectangle" && (
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Edges
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => onStyleChange({ ...style, roundEdges: false })}
                className={`flex-1 px-3 py-3 rounded border transition-all ${
                  !style.roundEdges
                    ? "border-primary bg-primary/10"
                    : "border-border hover:bg-muted"
                }`}
              >
                <div className="w-full h-8 border-2 border-foreground" />
              </button>
              <button
                onClick={() => onStyleChange({ ...style, roundEdges: true })}
                className={`flex-1 px-3 py-3 rounded border transition-all ${
                  style.roundEdges
                    ? "border-primary bg-primary/10"
                    : "border-border hover:bg-muted"
                }`}
              >
                <div className="w-full h-8 border-2 border-foreground rounded-lg" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
