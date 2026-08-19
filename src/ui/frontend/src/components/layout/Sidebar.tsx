import React from 'react';
import {
  LayoutDashboard,
  Database,
  FlaskConical,
  LineChart,
  Sliders,
  Sparkles,
  Compass,
  Layers,
  Activity,
  Binary,
  GitCompare,
  FastForward,
  ShieldCheck,
  Dices,
  BarChart3,
  AlertOctagon,
  PieChart,
  ListOrdered,
  Sigma,
  BookOpen,
  Brain,
  XCircle,
  PlaySquare,
  Bot,
  FileText,
  Lightbulb,
  Server,
  Settings,
  ChevronDown,
  Hexagon,
} from 'lucide-react';

interface SidebarProps {
  activePage: string;
  onSelectPage: (pageId: string) => void;
}

interface NavSection {
  title?: string;
  items: {
    id: string;
    label: string;
    icon: React.ElementType;
    badge?: string;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onSelectPage }) => {
  const navigation: NavSection[] = [
    {
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'RESEARCH',
      items: [
        { id: 'data_lab', label: 'Data Lab', icon: Database },
        { id: 'strategy_lab', label: 'Strategy Lab', icon: FlaskConical },
        { id: 'backtesting', label: 'Backtesting', icon: LineChart },
        { id: 'optimization', label: 'Optimization', icon: Sliders },
        { id: 'experiments', label: 'Experiments', icon: Sparkles },
      ],
    },
    {
      title: 'EDGE DISCOVERY',
      items: [
        { id: 'edge_explorer', label: 'Edge Explorer', icon: Compass },
        { id: 'condition_analysis', label: 'Condition Analysis', icon: Layers },
        { id: 'regime_analysis', label: 'Regime Analysis', icon: Activity },
        { id: 'pattern_mining', label: 'Pattern Mining', icon: Binary },
        { id: 'correlation', label: 'Correlation', icon: GitCompare },
      ],
    },
    {
      title: 'VALIDATION',
      items: [
        { id: 'walk_forward', label: 'Walk-Forward', icon: FastForward },
        { id: 'out_of_sample', label: 'Out-of-Sample', icon: ShieldCheck },
        { id: 'monte_carlo', label: 'Monte Carlo', icon: Dices },
        { id: 'robustness', label: 'Robustness', icon: BarChart3 },
        { id: 'overfitting_detector', label: 'Overfitting Detector', icon: AlertOctagon },
      ],
    },
    {
      title: 'ANALYSIS',
      items: [
        { id: 'performance', label: 'Performance', icon: PieChart },
        { id: 'trade_analytics', label: 'Trade Analytics', icon: ListOrdered },
        { id: 'statistical_lab', label: 'Statistical Lab', icon: Sigma },
        { id: 'strategy_comparison', label: 'Strategy Comparison', icon: GitCompare },
      ],
    },
    {
      title: 'TRADER DEVELOPMENT',
      items: [
        { id: 'journal', label: 'Journal', icon: BookOpen },
        { id: 'psychology', label: 'Psychology', icon: Brain },
        { id: 'mistake_analysis', label: 'Mistake Analysis', icon: XCircle },
        { id: 'replay', label: 'Replay', icon: PlaySquare },
      ],
    },
    {
      title: 'INTELLIGENCE',
      items: [
        { id: 'ai_quant_analyst', label: 'AI Quant Analyst', icon: Bot },
        { id: 'research_reports', label: 'Research Reports', icon: FileText },
        { id: 'insights', label: 'Insights', icon: Lightbulb },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'data_sources', label: 'Data Sources', icon: Server },
        { id: 'settings', label: 'Settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-[#06070a] border-r border-[#151a24] flex flex-col h-screen select-none shrink-0 z-20">
      {/* Brand Header */}
      <div className="p-4 border-b border-[#151a24] flex items-center gap-3 bg-[#06070a]">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-600 to-teal-400 flex items-center justify-center shadow-lg shadow-cyan-950/50 text-white">
          <Hexagon className="w-5 h-5 fill-white/20 stroke-white stroke-[2.2]" />
        </div>
        <div>
          <div className="font-bold text-sm tracking-wider text-white flex items-center gap-1.5 font-mono">
            QUANT EDGE
          </div>
          <div className="text-[10px] text-cyan-400/80 font-medium tracking-tight">
            Research. Backtest. Discover Edge.
          </div>
        </div>
      </div>

      {/* Navigation Links (Scrollable) */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 text-xs bg-[#06070a]">
        {navigation.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            {section.title && (
              <div className="px-3 py-1 text-[10px] font-semibold tracking-wider text-slate-400">
                {section.title}
              </div>
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectPage(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-all duration-150 text-left group ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-950/40 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#0e121a]'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-300'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto px-1.5 py-0.5 text-[9px] font-semibold bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-[#151a24] bg-[#06070a]">
        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-[#0b0e14] border border-[#161c28] hover:border-cyan-800/60 cursor-pointer transition">
          <div className="w-7 h-7 rounded bg-cyan-600/20 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center justify-center font-mono">
            QT
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate">Quant Trader</div>
            <div className="text-[10px] text-cyan-400/70 truncate font-mono">Professional Plan</div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
        </div>
      </div>
    </aside>
  );
};
