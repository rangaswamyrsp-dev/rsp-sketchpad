import { FolderOpen, Save, Download, Users, Search, HelpCircle, Trash2, Github, MessageSquare, UserPlus, Sun, Moon, Monitor } from "lucide-react";

interface MenuSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onResetCanvas: () => void;
}

export const MenuSidebar = ({ isOpen, onClose, onResetCanvas }: MenuSidebarProps) => {
  const menuItems = [
    { icon: <FolderOpen size={18} />, label: "Open", shortcut: "Ctrl+O" },
    { icon: <Save size={18} />, label: "Save to...", shortcut: "" },
    { icon: <Download size={18} />, label: "Export image...", shortcut: "Ctrl+Shift+E" },
    { icon: <Users size={18} />, label: "Live collaboration...", shortcut: "" },
  ];

  const bottomItems = [
    { icon: <Search size={18} />, label: "Find on canvas", shortcut: "Ctrl+F" },
    { icon: <HelpCircle size={18} />, label: "Help", shortcut: "?" },
    { icon: <Trash2 size={18} />, label: "Reset the canvas", shortcut: "" },
  ];

  const socialItems = [
    { icon: <Github size={18} />, label: "GitHub" },
    { icon: <MessageSquare size={18} />, label: "Discord chat" },
    { icon: <UserPlus size={18} />, label: "Sign up" },
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
      <div className="fixed left-0 top-14 bottom-0 w-64 bg-sidebar-bg border-r border-border z-50 flex flex-col">
        <div className="flex-1 overflow-y-auto p-2">
          {/* Main menu items */}
          <div className="space-y-1 mb-4">
            {menuItems.map((item) => (
              <button
                key={item.label}
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

          {/* Command palette highlight */}
          <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors text-left mb-4 border border-primary/20">
            <div className="flex items-center gap-3">
              <span className="text-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M8 6L14 12L8 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="text-sm text-primary font-medium">Command palette</span>
            </div>
            <span className="text-xs text-primary">Ctrl+/</span>
          </button>

          {/* Bottom items */}
          <div className="space-y-1 mb-4">
            {bottomItems.map((item) => (
              <button
                key={item.label}
                onClick={item.label === "Reset the canvas" ? onResetCanvas : undefined}
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

          <div className="h-px bg-border my-4" />

          {/* Social items */}
          <div className="space-y-1">
            {socialItems.map((item) => (
              <button
                key={item.label}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-left group"
              >
                <span className="text-muted-foreground group-hover:text-foreground">
                  {item.icon}
                </span>
                <span className="text-sm text-foreground">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Theme selector */}
        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground mb-2">Theme</div>
          <div className="flex gap-2">
            <button className="flex-1 p-2 rounded-lg bg-primary text-primary-foreground">
              <Sun size={18} className="mx-auto" />
            </button>
            <button className="flex-1 p-2 rounded-lg hover:bg-muted">
              <Moon size={18} className="mx-auto" />
            </button>
            <button className="flex-1 p-2 rounded-lg hover:bg-muted">
              <Monitor size={18} className="mx-auto" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
