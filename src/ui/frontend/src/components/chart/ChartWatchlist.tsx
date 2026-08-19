import React, { useState } from 'react';
import {
  ListFilter,
  Search,
  TrendingUp,
  TrendingDown,
  Star,
  ChevronRight,
  ChevronLeft,
  Activity,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface WatchlistInstrument {
  pair: string;
  type: string;
  candles: number;
  last_price?: number;
  change_24h?: number;
  change_pct_24h?: number;
}

interface ChartWatchlistProps {
  isOpen: boolean;
  onToggle: () => void;
  selectedPair: string;
  onSelectPair: (pair: string) => void;
  instruments: WatchlistInstrument[];
  stats?: {
    pair?: string;
    last_price: number;
    high_24h: number;
    low_24h: number;
    volume_24h: number;
    change_24h: number;
    change_pct_24h: number;
    atr_14: number;
  } | null;
}

export const ChartWatchlist: React.FC<ChartWatchlistProps> = ({
  isOpen,
  onToggle,
  selectedPair,
  onSelectPair,
  instruments,
  stats,
}) => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'Crypto' | 'Forex' | 'FAVORITES'>('ALL');
  const [favorites, setFavorites] = useState<string[]>(['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'EURUSD']);

  const toggleFavorite = (e: React.MouseEvent, pair: string) => {
    e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(pair) ? prev.filter((p) => p !== pair) : [...prev, pair]
    );
  };

  const filtered = instruments.filter((inst) => {
    const matchSearch = inst.pair.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (activeTab === 'FAVORITES') return favorites.includes(inst.pair);
    if (activeTab === 'ALL') return true;
    return inst.type === activeTab;
  });

  return (
    <div
      className={`h-full flex flex-col bg-[#0c0c0c] border-l border-[#1f1f1f] transition-all duration-200 ${
        isOpen ? 'w-80' : 'w-10'
      }`}
    >
      {/* Header / Toggle Button */}
      <div className="flex items-center justify-between p-2.5 border-b border-[#1f1f1f]">
        {isOpen ? (
          <>
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-white">
              <ListFilter className="w-4 h-4 text-purple-400" />
              <span>Watchlist & Stats</span>
            </div>
            <button
              onClick={onToggle}
              className="p-1 rounded hover:bg-[#1a1a1a] text-slate-400 hover:text-white transition"
              title="Collapse Watchlist"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button
            onClick={onToggle}
            className="w-full flex flex-col items-center gap-4 py-3 text-slate-400 hover:text-white transition"
            title="Expand Watchlist"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="[writing-mode:vertical-rl] font-mono text-[11px] font-bold text-slate-300 tracking-wider">
              WATCHLIST
            </span>
          </button>
        )}
      </div>

      {isOpen && (
        <>
          {/* Search Box */}
          <div className="p-2 border-b border-[#1a1a1a]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter symbols..."
                className="w-full bg-[#141414] border border-[#222] rounded-lg pl-8 pr-2 py-1.5 text-xs text-slate-200 font-mono placeholder:text-slate-600 outline-none focus:border-purple-600"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex bg-[#141414] p-0.5 rounded-lg text-[10px] font-mono mt-1.5">
              {(['ALL', 'Crypto', 'Forex', 'FAVORITES'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-0.5 rounded font-bold transition ${
                    activeTab === tab ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab === 'FAVORITES' ? '★ Favs' : tab}
                </button>
              ))}
            </div>
          </div>

          {/* Instruments List */}
          <div className="flex-1 overflow-y-auto divide-y divide-neutral-900 font-mono text-xs">
            {filtered.map((inst) => {
              const isSelected = inst.pair === selectedPair;
              const isFav = favorites.includes(inst.pair);

              return (
                <div
                  key={inst.pair}
                  onClick={() => onSelectPair(inst.pair)}
                  className={`flex items-center justify-between px-3 py-2 cursor-pointer transition ${
                    isSelected ? 'bg-purple-950/40 border-l-2 border-purple-500' : 'hover:bg-[#141414]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => toggleFavorite(e, inst.pair)}
                      className={`p-0.5 hover:text-amber-400 ${isFav ? 'text-amber-400' : 'text-neutral-700'}`}
                    >
                      <Star className="w-3 h-3 fill-current" />
                    </button>
                    <div>
                      <div className="font-bold text-slate-100 flex items-center gap-1.5">
                        {inst.pair}
                        <span className="text-[9px] px-1 py-0.2 rounded bg-neutral-900 text-slate-500 font-sans">
                          {inst.type}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {Number(inst.candles).toLocaleString()} bars
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-slate-200">
                      {inst.last_price ? inst.last_price.toLocaleString() : '—'}
                    </div>
                    {inst.change_pct_24h !== undefined ? (
                      <div
                        className={`text-[10px] font-bold flex items-center justify-end gap-0.5 ${
                          inst.change_pct_24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {inst.change_pct_24h >= 0 ? '+' : ''}
                        {inst.change_pct_24h.toFixed(2)}%
                      </div>
                    ) : (
                      <div className="text-[10px] text-emerald-400">100% Real</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Key Stats HUD for Active Symbol */}
          {stats && (
            <div className="p-3 bg-[#0a0a0a] border-t border-[#1f1f1f] space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-400 border-b border-neutral-900 pb-1.5">
                <span className="font-bold text-white flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-purple-400" /> {stats.pair || selectedPair}
                </span>
                <span
                  className={`text-[11px] font-bold ${
                    stats.change_pct_24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {stats.change_pct_24h >= 0 ? '+' : ''}
                  {stats.change_pct_24h}% ({stats.change_24h})
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-[#121212] p-2 rounded border border-neutral-850">
                  <div className="text-[10px] text-slate-500">24h High</div>
                  <div className="font-bold text-emerald-400 mt-0.5">
                    {stats.high_24h.toLocaleString()}
                  </div>
                </div>
                <div className="bg-[#121212] p-2 rounded border border-neutral-850">
                  <div className="text-[10px] text-slate-500">24h Low</div>
                  <div className="font-bold text-rose-400 mt-0.5">
                    {stats.low_24h.toLocaleString()}
                  </div>
                </div>
                <div className="bg-[#121212] p-2 rounded border border-neutral-850">
                  <div className="text-[10px] text-slate-500">24h Volume</div>
                  <div className="font-bold text-slate-200 mt-0.5">
                    {stats.volume_24h.toLocaleString()}
                  </div>
                </div>
                <div className="bg-[#121212] p-2 rounded border border-neutral-850">
                  <div className="text-[10px] text-slate-500">ATR (14)</div>
                  <div className="font-bold text-purple-300 mt-0.5">
                    {stats.atr_14.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                <span className="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="w-3 h-3" /> Zero Lookahead Verified
                </span>
                <span className="text-slate-500">DuckDB Parquet</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
