import { Plus, Minus, RotateCcw } from "lucide-react";

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

export const ZoomControls = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}: ZoomControlsProps) => {
  return (
    <div className="absolute bottom-6 left-6 flex items-center gap-2 bg-card border border-border rounded-lg p-1 shadow-lg">
      <button
        onClick={onZoomOut}
        className="p-2 hover:bg-muted rounded transition-colors"
        title="Zoom out"
      >
        <Minus size={18} />
      </button>
      
      <button
        onClick={onResetZoom}
        className="px-3 py-1 hover:bg-muted rounded transition-colors min-w-[60px] text-sm font-medium"
        title="Reset zoom"
      >
        {zoom}%
      </button>
      
      <button
        onClick={onZoomIn}
        className="p-2 hover:bg-muted rounded transition-colors"
        title="Zoom in"
      >
        <Plus size={18} />
      </button>

      <div className="w-px h-6 bg-border mx-1" />

      <button
        onClick={onResetZoom}
        className="p-2 hover:bg-muted rounded transition-colors"
        title="Reset view"
      >
        <RotateCcw size={18} />
      </button>
    </div>
  );
};
