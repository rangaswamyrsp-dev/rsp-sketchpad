import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TextInputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (value: string) => void;
  placeholder?: string;
  title?: string;
  description?: string;
}

export const TextInputDialog = ({
  open,
  onOpenChange,
  onSubmit,
  placeholder = "Type your text...",
  title = "Add Text",
  description = "Enter the text to add to the canvas. You can move it after adding.",
}: TextInputDialogProps) => {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setValue("");
      // focus after open
      requestAnimationFrame(() => textareaRef.current?.focus());
    }
  }, [open]);

  const handleConfirm = () => {
    const trimmed = value.trim();
    if (!trimmed) return onOpenChange(false);
    onSubmit(trimmed);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              // prevent global shortcuts while typing
              e.stopPropagation();
              // Submit with Ctrl/Cmd+Enter
              if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                e.preventDefault();
                handleConfirm();
              }
            }}
            className="min-h-[120px] w-full rounded-md border border-border bg-background p-3 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            placeholder={placeholder}
            spellCheck={false}
          />
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirm}>
              Add Text
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
