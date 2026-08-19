import React, { useState, useEffect } from 'react';
import { Search, X, Compass, FlaskConical, LineChart, ShieldCheck, ArrowRight } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (pageId: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onOpenModal();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const onOpenModal = () => {
    // handled by parent
  };

  if (!isOpen) return null;

  const quickItems = [
    { title: 'BB Reversion v4', type: 'Strategy', page: 'strategy_lab', icon: FlaskConical },
    { title: 'XAUUSD • BB Reversion (London)', type: 'Validated Edge', page: 'edge_explorer', icon: Compass },
    { title: 'Walk-Forward Analysis', type: 'Tool', page: 'walk_forward', icon: LineChart },
    { title: 'Monte Carlo 10k Paths', type: 'Validation', page: 'monte_carlo', icon: ShieldCheck },
    { title: 'Deflated Sharpe Ratio (DSR)', type: 'Overfitting', page: 'overfitting_detector', icon: ShieldCheck },
    { title: 'QuantStats Performance Tearsheet', type: 'Analytics', page: 'performance', icon: LineChart },
  ].filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.type.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-start justify-center pt-24 px-4">
      <div className="bg-[#080808] border border-[#262626] rounded-xl w-full max-w-xl shadow-2xl shadow-purple-950/30 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-3.5 border-b border-[#1c1c1c] flex items-center gap-3">
          <Search className="w-5 h-5 text-purple-400" />
          <input
            autoFocus
            type="text"
            placeholder="Search strategies, edges, backtests, tools (e.g. 'BB Reversion', 'Monte Carlo')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-slate-500"
          />
          <button onClick={onClose} className="p-1 text-slate-500 hover:text-slate-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {quickItems.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">No results found for "{query}"</div>
          ) : (
            quickItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    onNavigate(item.page);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-[#141414] transition text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded bg-purple-950/40 border border-purple-800/40 flex items-center justify-center text-purple-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-purple-300 transition">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-slate-500">{item.type}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-purple-400 transition" />
                </button>
              );
            })
          )}
        </div>

        <div className="p-2.5 bg-black border-t border-[#1c1c1c] text-[10px] text-slate-500 flex justify-between">
          <span>Navigate with ⌘K / ESC to close</span>
          <span className="text-purple-400 font-medium">Project APEX Zero-Lookahead Engine</span>
        </div>
      </div>
    </div>
  );
};
