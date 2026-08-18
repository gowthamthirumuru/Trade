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
    <header className="h-16 bg-[#07090E] border-b border-[#161F38] px-6 flex items-center justify-between shrink-0 z-10 select-none">
      {/* Left: Hamburger & Page Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-[#101426] transition"
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
          className="flex items-center gap-3 px-3.5 py-1.5 rounded-lg bg-[#101426] border border-[#161F38] text-slate-400 text-xs hover:border-slate-700 hover:text-slate-200 transition w-64 justify-between shadow-inner"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span>Search...</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[#161F38] text-slate-400 rounded border border-slate-700">
            ⌘ K
          </kbd>
        </button>

        {/* AI Quant Sparkle */}
        <button
          className="p-2 rounded-lg bg-[#101426] border border-[#161F38] text-purple-400 hover:text-purple-300 hover:border-purple-500/40 hover:bg-purple-950/30 transition relative shadow-sm"
          title="AI Quant Assistant"
        >
          <Sparkles className="w-4 h-4" />
        </button>

        {/* Theme Toggle (Light/Dark) */}
        <button
          className="p-2 rounded-lg bg-[#101426] border border-[#161F38] text-slate-400 hover:text-slate-200 hover:border-slate-700 transition"
          title="Theme Toggle"
        >
          <Sun className="w-4 h-4" />
        </button>

        {/* Notifications with Badge 12 */}
        <button
          className="p-2 rounded-lg bg-[#101426] border border-[#161F38] text-slate-400 hover:text-slate-200 hover:border-slate-700 transition relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 px-1.5 py-0.2 text-[9px] font-bold bg-purple-600 text-white rounded-full border border-[#07090E]">
            12
          </span>
        </button>

        {/* System Settings Pill */}
        <button
          className="p-2 rounded-lg bg-[#101426] border border-[#161F38] text-slate-400 hover:text-slate-200 hover:border-slate-700 transition"
          title="System Filter Defaults"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
