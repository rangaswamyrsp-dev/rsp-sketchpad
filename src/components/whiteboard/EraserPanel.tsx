import { Slider } from "@/components/ui/slider";

interface EraserPanelProps {
  eraserSize: number;
  onEraserSizeChange: (size: number) => void;
}

export const EraserPanel = ({ eraserSize, onEraserSizeChange }: EraserPanelProps) => {
  return (
    <div className="absolute left-16 top-20 w-64 bg-card border border-border rounded-lg shadow-lg p-4 z-10">
      <h3 className="text-sm font-medium mb-4">Eraser Settings</h3>
      
      <div className="space-y-4">
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">
            Eraser Size: {eraserSize}px
          </label>
          <Slider
            value={[eraserSize]}
            onValueChange={(value) => onEraserSizeChange(value[0])}
            min={5}
            max={50}
            step={1}
            className="w-full"
          />
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <div 
            className="border-2 border-muted-foreground rounded-full bg-background"
            style={{
              width: `${eraserSize}px`,
              height: `${eraserSize}px`,
            }}
          />
          <span className="text-xs text-muted-foreground">Preview</span>
        </div>
      </div>
    </div>
  );
};
