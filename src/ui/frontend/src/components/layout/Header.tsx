import React from 'react';
import {
  Menu,
  Search,
  Sparkles,
  Sun,
  Bell,
  SlidersHorizontal,
} from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle: string;
  onOpenSearch: () => void;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onOpenSearch,
  onToggleSidebar,
}) => {
  return (
    <header className="h-16 bg-black border-b border-[#1a1a1a] px-6 flex items-center justify-between shrink-0 z-10 select-none">
      {/* Left: Hamburger & Page Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-[#121212] transition"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            {title}
          </h1>
          <p className="text-xs text-slate-400 font-normal">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Center/Right: Search Bar & Utility Actions */}
      <div className="flex items-center gap-3">
        {/* Global Search Bar */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-3 px-3.5 py-1.5 rounded-lg bg-[#080808] border border-[#1c1c1c] text-slate-400 text-xs hover:border-neutral-700 hover:text-slate-200 transition w-64 justify-between shadow-inner"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span>Search...</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[#141414] text-slate-400 rounded border border-neutral-800">
            ⌘ K
          </kbd>
        </button>

        {/* AI Quant Sparkle */}
        <button
          className="p-2 rounded-lg bg-[#080808] border border-[#1c1c1c] text-purple-400 hover:text-purple-300 hover:border-purple-500/40 hover:bg-purple-950/20 transition relative shadow-sm"
          title="AI Quant Assistant"
        >
          <Sparkles className="w-4 h-4" />
        </button>

        {/* Theme Toggle */}
        <button
          className="p-2 rounded-lg bg-[#080808] border border-[#1c1c1c] text-slate-400 hover:text-slate-200 hover:border-neutral-700 transition"
          title="Pure Black OLED Theme Active"
        >
          <Sun className="w-4 h-4" />
        </button>

        {/* Notifications with Badge 12 */}
        <button
          className="p-2 rounded-lg bg-[#080808] border border-[#1c1c1c] text-slate-400 hover:text-slate-200 hover:border-neutral-700 transition relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 px-1.5 py-0.2 text-[9px] font-bold bg-purple-600 text-white rounded-full border border-black">
            12
          </span>
        </button>

        {/* System Settings Pill */}
        <button
          className="p-2 rounded-lg bg-[#080808] border border-[#1c1c1c] text-slate-400 hover:text-slate-200 hover:border-neutral-700 transition"
          title="System Filter Defaults"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
