import { FolderOpen, Download, Trash2, Sun, Moon, Monitor, FileJson, FileImage } from "lucide-react";
import { useTheme } from "next-themes";

interface MenuSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onResetCanvas: () => void;
  onExportPNG: () => void;
  onExportJPEG: () => void;
  onExportJSON: () => void;
  onLoadJSON: () => void;
}

export const MenuSidebar = ({ isOpen, onClose, onResetCanvas, onExportPNG, onExportJPEG, onExportJSON, onLoadJSON }: MenuSidebarProps) => {
  const { theme, setTheme } = useTheme();

  const menuItems = [
    { icon: <FolderOpen size={18} />, label: "Open", shortcut: "Ctrl+O", action: onLoadJSON },
    { icon: <FileJson size={18} />, label: "Save as JSON", shortcut: "Ctrl+S", action: onExportJSON },
    { icon: <Download size={18} />, label: "Export as PNG", shortcut: "Ctrl+Shift+E", action: onExportPNG },
    { icon: <FileImage size={18} />, label: "Export as JPEG", shortcut: "", action: onExportJPEG },
  ];

  const bottomItems = [
    { icon: <Trash2 size={18} />, label: "Reset the canvas", shortcut: "", action: onResetCanvas },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed left-0 top-14 bottom-0 w-64 bg-white dark:bg-sidebar-bg border-r border-border z-50 flex flex-col">
        <div className="flex-1 overflow-y-auto p-2">
          {/* Main menu items */}
          <div className="space-y-1 mb-4">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground group-hover:text-foreground">
                    {item.icon}
                  </span>
                  <span className="text-sm text-foreground">{item.label}</span>
                </div>
                {item.shortcut && (
                  <span className="text-xs text-muted-foreground">
                    {item.shortcut}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Bottom items */}
          <div className="space-y-1 mb-4">
            {bottomItems.map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground group-hover:text-foreground">
                    {item.icon}
                  </span>
                  <span className="text-sm text-foreground">{item.label}</span>
                </div>
                {item.shortcut && (
                  <span className="text-xs text-muted-foreground">
                    {item.shortcut}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Theme selector */}
        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground mb-2">Theme</div>
          <div className="flex gap-2">
            <button 
              onClick={() => setTheme("light")}
              className={`flex-1 p-2 rounded-lg transition-colors ${theme === "light" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            >
              <Sun size={18} className="mx-auto" />
            </button>
            <button 
              onClick={() => setTheme("dark")}
              className={`flex-1 p-2 rounded-lg transition-colors ${theme === "dark" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            >
              <Moon size={18} className="mx-auto" />
            </button>
            <button 
              onClick={() => setTheme("system")}
              className={`flex-1 p-2 rounded-lg transition-colors ${theme === "system" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            >
              <Monitor size={18} className="mx-auto" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
