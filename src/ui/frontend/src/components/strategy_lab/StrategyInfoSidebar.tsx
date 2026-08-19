import React, { useState } from 'react';
import {
  Search,
  Plus,
  Minus,
  Check,
  TrendingUp,
  Activity,
  Zap,
  Clock,
  Layers,
  Sparkles,
  ShieldAlert,
  BarChart2,
  Calendar,
  Tag,
  Info,
} from 'lucide-react';

export interface StrategyMetadata {
  name: string;
  family: string;
  description: string;
  assetClass: string;
  primaryAssets: string[];
  timeframes: string[];
  selectedTimeframe: string;
  marketType: string;
  tags: string[];
  status: 'Active' | 'Paper Trading' | 'Backtesting' | 'Deprecated';
  createdDate: string;
  lastModified: string;
  version: string;
}

interface StrategyInfoSidebarProps {
  metadata: StrategyMetadata;
  onUpdateMetadata: (updated: Partial<StrategyMetadata>) => void;
  onAddCondition: (conditionTemplate: {
    field: string;
    operator: string;
    target: string;
    params: string;
    timeframe: string;
  }) => void;
}

type ConditionCategory =
  | 'Price Action'
  | 'Trend'
  | 'Momentum'
  | 'Volatility'
  | 'Volume'
  | 'Indicators'
  | 'Market Structure'
  | 'Session & Time'
  | 'Custom';

export const StrategyInfoSidebar: React.FC<StrategyInfoSidebarProps> = ({
  metadata,
  onUpdateMetadata,
  onAddCondition,
}) => {
  const [activeCategory, setActiveCategory] = useState<ConditionCategory>('Price Action');
  const [searchQuery, setSearchQuery] = useState('');
  const [newTagInput, setNewTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [isAddingAsset, setIsAddingAsset] = useState(false);
  const [newAssetInput, setNewAssetInput] = useState('');

  // 9 Categories of Quant Conditions with institutional templates
  const conditionLibrary: Record<ConditionCategory, Array<{ name: string; template: any }>> = {
    'Price Action': [
      { name: 'Price Crosses Above', template: { field: 'Price', operator: 'crosses above', target: '20 EMA', params: '(20)', timeframe: metadata.selectedTimeframe } },
      { name: 'Price Crosses Below', template: { field: 'Price', operator: 'crosses below', target: '20 EMA', params: '(20)', timeframe: metadata.selectedTimeframe } },
      { name: 'Price Touches', template: { field: 'Price', operator: 'touches', target: 'Lower Bollinger Band', params: '(20, 2)', timeframe: metadata.selectedTimeframe } },
      { name: 'Price Breaks Above', template: { field: 'Price', operator: 'breaks above', target: 'Session High', params: '()', timeframe: metadata.selectedTimeframe } },
      { name: 'Price Breaks Below', template: { field: 'Price', operator: 'breaks below', target: 'Session Low', params: '()', timeframe: metadata.selectedTimeframe } },
      { name: 'Inside Bar', template: { field: 'Bar Pattern', operator: 'equals', target: 'Inside Bar', params: '()', timeframe: metadata.selectedTimeframe } },
      { name: 'Outside Bar', template: { field: 'Bar Pattern', operator: 'equals', target: 'Outside Bar', params: '()', timeframe: metadata.selectedTimeframe } },
      { name: 'Bullish Engulfing', template: { field: 'Candle Pattern', operator: 'equals', target: 'Bullish Engulfing', params: '()', timeframe: metadata.selectedTimeframe } },
      { name: 'Bearish Engulfing', template: { field: 'Candle Pattern', operator: 'equals', target: 'Bearish Engulfing', params: '()', timeframe: metadata.selectedTimeframe } },
      { name: 'Higher High', template: { field: 'Swing Structure', operator: 'equals', target: 'Higher High', params: '(5)', timeframe: metadata.selectedTimeframe } },
    ],
    'Trend': [
      { name: 'EMA Fast > EMA Slow', template: { field: 'EMA', operator: 'greater than', target: 'EMA 200', params: '50, 200', timeframe: '1H' } },
      { name: 'SMA Cross 50/200', template: { field: 'SMA 50', operator: 'crosses above', target: 'SMA 200', params: 'Golden Cross', timeframe: '1D' } },
      { name: 'SuperTrend Bullish', template: { field: 'SuperTrend', operator: 'equals', target: 'BULLISH', params: '(10, 3.0)', timeframe: metadata.selectedTimeframe } },
      { name: 'ADX Trend Strength > 25', template: { field: 'ADX', operator: 'greater than', target: '25', params: '(14)', timeframe: metadata.selectedTimeframe } },
    ],
    'Momentum': [
      { name: 'RSI Oversold (<35)', template: { field: 'RSI', operator: 'less than', target: '35', params: '(14)', timeframe: metadata.selectedTimeframe } },
      { name: 'RSI Overbought (>65)', template: { field: 'RSI', operator: 'greater than', target: '65', params: '(14)', timeframe: metadata.selectedTimeframe } },
      { name: 'RSI Bullish Divergence', template: { field: 'RSI Divergence', operator: 'equals', target: 'Bullish Regular', params: '(14, 20)', timeframe: metadata.selectedTimeframe } },
      { name: 'MACD Histogram Positive', template: { field: 'MACD Hist', operator: 'greater than', target: '0', params: '(12, 26, 9)', timeframe: metadata.selectedTimeframe } },
    ],
    'Volatility': [
      { name: 'ATR Expansion (>18)', template: { field: 'ATR', operator: 'greater than', target: '18', params: '(14)', timeframe: metadata.selectedTimeframe } },
      { name: 'Bollinger Band Squeeze', template: { field: 'BB Width', operator: 'less than', target: '0.015', params: '(20, 2)', timeframe: metadata.selectedTimeframe } },
      { name: 'Historical Volatility Spike', template: { field: 'HV (20)', operator: 'greater than', target: '1.5x Mean', params: '(20)', timeframe: metadata.selectedTimeframe } },
      { name: 'Keltner Breakout', template: { field: 'Price', operator: 'crosses above', target: 'Upper Keltner', params: '(20, 1.5)', timeframe: metadata.selectedTimeframe } },
    ],
    'Volume': [
      { name: 'Volume > 1.2x 20-SMA', template: { field: 'Volume', operator: 'greater than', target: '1.2 x 20 SMA', params: '20 SMA', timeframe: metadata.selectedTimeframe } },
      { name: 'Volume Climax Spike', template: { field: 'Volume', operator: 'greater than', target: '3.0x 50 SMA', params: '50 SMA', timeframe: metadata.selectedTimeframe } },
      { name: 'VWAP Bounce / Retest', template: { field: 'Price', operator: 'touches', target: 'VWAP', params: 'Session', timeframe: metadata.selectedTimeframe } },
    ],
    'Indicators': [
      { name: 'Stochastic %K Cross %D', template: { field: 'Stoch %K', operator: 'crosses above', target: 'Stoch %D', params: '(14, 3, 3)', timeframe: metadata.selectedTimeframe } },
      { name: 'Ichimoku Cloud Bullish', template: { field: 'Price', operator: 'greater than', target: 'Kumo Cloud Top', params: '(9, 26, 52)', timeframe: '1H' } },
      { name: 'CCI Oversold (<-100)', template: { field: 'CCI', operator: 'less than', target: '-100', params: '(20)', timeframe: metadata.selectedTimeframe } },
    ],
    'Market Structure': [
      { name: 'Fair Value Gap (FVG) Tap', template: { field: 'Price', operator: 'touches', target: 'Bullish FVG Zone', params: '(15m)', timeframe: metadata.selectedTimeframe } },
      { name: 'Order Block (OB) Retest', template: { field: 'Price', operator: 'touches', target: 'Bullish OB Zone', params: '(15m)', timeframe: metadata.selectedTimeframe } },
      { name: 'Liquidity Sweep (Asian High)', template: { field: 'Price', operator: 'sweeps', target: 'Asian Session High', params: 'Sweep & Reject', timeframe: metadata.selectedTimeframe } },
      { name: 'Change of Character (CHoCH)', template: { field: 'Market Structure', operator: 'equals', target: 'Bullish CHoCH', params: '15m / 1H', timeframe: metadata.selectedTimeframe } },
    ],
    'Session & Time': [
      { name: 'London Session Active', template: { field: 'Session', operator: 'equals', target: 'London', params: '08:00-16:00 UTC', timeframe: metadata.selectedTimeframe } },
      { name: 'New York Session Active', template: { field: 'Session', operator: 'equals', target: 'New York', params: '13:00-21:00 UTC', timeframe: metadata.selectedTimeframe } },
      { name: 'London / NY Overlap', template: { field: 'Session', operator: 'equals', target: 'London / NY Overlap', params: '13:00-16:00 UTC', timeframe: metadata.selectedTimeframe } },
      { name: 'Asian Session Range', template: { field: 'Session', operator: 'equals', target: 'Asian Session', params: '00:00-08:00 UTC', timeframe: metadata.selectedTimeframe } },
    ],
    'Custom': [
      { name: 'Custom Mathematical Ratio', template: { field: 'Custom Formula', operator: 'greater than', target: '1.0', params: 'Close / VWAP', timeframe: metadata.selectedTimeframe } },
      { name: 'Multi-Asset Correlation Spread', template: { field: 'Gold/DXY Spread', operator: 'less than', target: '-2.0σ', params: 'Z-Score 60', timeframe: '1H' } },
    ],
  };

  const currentConditions = conditionLibrary[activeCategory] || [];
  const filteredConditions = currentConditions.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddAsset = () => {
    if (newAssetInput.trim() && !metadata.primaryAssets.includes(newAssetInput.trim().toUpperCase())) {
      onUpdateMetadata({
        primaryAssets: [...metadata.primaryAssets, newAssetInput.trim().toUpperCase()],
      });
      setNewAssetInput('');
      setIsAddingAsset(false);
    }
  };

  const handleRemoveAsset = (asset: string) => {
    onUpdateMetadata({
      primaryAssets: metadata.primaryAssets.filter((a) => a !== asset),
    });
  };

  const handleAddTag = () => {
    if (newTagInput.trim() && !metadata.tags.includes(newTagInput.trim())) {
      onUpdateMetadata({
        tags: [...metadata.tags, newTagInput.trim()],
      });
      setNewTagInput('');
      setIsAddingTag(false);
    }
  };

  const handleRemoveTag = (tag: string) => {
    onUpdateMetadata({
      tags: metadata.tags.filter((t) => t !== tag),
    });
  };

  return (
    <div className="space-y-4 font-mono text-xs select-none">
      {/* 1. STRATEGY INFO CARD */}
      <div className="quant-card p-4 space-y-3.5 border border-[#161c28] bg-[#0b0e14]">
        <div className="flex items-center justify-between border-b border-[#151a24] pb-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Strategy Info</span>
          </h3>
          <span className="text-[10px] text-slate-500">APEX Core Layer 4</span>
        </div>

        {/* Strategy Name */}
        <div>
          <label className="text-slate-400 block mb-1 text-[11px] font-semibold">Strategy Name</label>
          <input
            type="text"
            value={metadata.name}
            onChange={(e) => onUpdateMetadata({ name: e.target.value })}
            className="w-full bg-[#0e121a] border border-[#1c2436] rounded-lg px-2.5 py-1.5 text-white font-bold outline-none focus:border-cyan-500 transition"
          />
        </div>

        {/* Strategy Family */}
        <div>
          <label className="text-slate-400 block mb-1 text-[11px] font-semibold">Strategy Family</label>
          <select
            value={metadata.family}
            onChange={(e) => onUpdateMetadata({ family: e.target.value })}
            className="w-full bg-[#0e121a] border border-[#1c2436] rounded-lg px-2.5 py-1.5 text-slate-200 outline-none focus:border-cyan-500 transition cursor-pointer"
          >
            <option value="Mean Reversion">Mean Reversion</option>
            <option value="SMC Structure">SMC Structure (Order Flow & Imbalance)</option>
            <option value="Trend Following">Trend Following / Momentum</option>
            <option value="Breakout Momentum">Breakout Momentum / Session Open</option>
            <option value="Volatility Expansion">Volatility Expansion (Squeeze Break)</option>
            <option value="Multi-Asset Arbitrage">Multi-Asset / Statistical Arbitrage</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="text-slate-400 block mb-1 text-[11px] font-semibold">Description</label>
          <textarea
            rows={2}
            value={metadata.description}
            onChange={(e) => onUpdateMetadata({ description: e.target.value })}
            className="w-full bg-[#0e121a] border border-[#1c2436] rounded-lg p-2 text-slate-300 text-[11px] outline-none focus:border-cyan-500 transition resize-none"
          />
        </div>

        {/* Asset Class */}
        <div>
          <label className="text-slate-400 block mb-1 text-[11px] font-semibold">Asset Class</label>
          <select
            value={metadata.assetClass}
            onChange={(e) => onUpdateMetadata({ assetClass: e.target.value })}
            className="w-full bg-[#0e121a] border border-[#1c2436] rounded-lg px-2.5 py-1.5 text-slate-200 outline-none focus:border-cyan-500 transition cursor-pointer"
          >
            <option value="Forex / Metals">Forex / Metals (Dukascopy Lake)</option>
            <option value="Crypto">Crypto (Binance Futures Lake)</option>
            <option value="Equities / Indices">Equities / Indices</option>
            <option value="Multi-Asset">Multi-Asset Global Macro</option>
          </select>
        </div>

        {/* Primary Assets Chips */}
        <div>
          <label className="text-slate-400 block mb-1 text-[11px] font-semibold">Primary Assets</label>
          <div className="flex flex-wrap items-center gap-1.5">
            {metadata.primaryAssets.map((asset) => (
              <span
                key={asset}
                className="bg-cyan-950/60 text-cyan-300 border border-cyan-800/80 px-2 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1 shadow-sm"
              >
                <span>{asset}</span>
                <button
                  onClick={() => handleRemoveAsset(asset)}
                  className="text-cyan-400 hover:text-white transition"
                >
                  <Minus className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}

            {isAddingAsset ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  placeholder="SYMBOL"
                  value={newAssetInput}
                  onChange={(e) => setNewAssetInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddAsset()}
                  autoFocus
                  className="bg-[#0e121a] border border-cyan-500 rounded px-1.5 py-0.5 text-[11px] text-white w-20 outline-none"
                />
                <button
                  onClick={handleAddAsset}
                  className="p-1 bg-cyan-600 rounded text-black font-bold hover:bg-cyan-500"
                >
                  <Check className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingAsset(true)}
                className="p-1 bg-[#101522] hover:bg-[#182030] border border-[#1e273a] text-slate-400 hover:text-white rounded-md transition"
                title="Add Asset"
              >
                <Plus className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Timeframes Selector */}
        <div>
          <label className="text-slate-400 block mb-1 text-[11px] font-semibold">Timeframes</label>
          <div className="flex items-center gap-1.5">
            {['15m', '1H', '4H', '1D'].map((tf) => {
              const isSelected = metadata.selectedTimeframe === tf;
              return (
                <button
                  key={tf}
                  onClick={() => onUpdateMetadata({ selectedTimeframe: tf })}
                  className={`flex-1 py-1 rounded-lg text-center font-bold text-xs transition ${
                    isSelected
                      ? 'bg-cyan-500 text-black font-extrabold shadow-md shadow-cyan-500/25'
                      : 'bg-[#0e121a] hover:bg-[#151c2a] text-slate-400 border border-[#1c2436]'
                  }`}
                >
                  {tf}
                </button>
              );
            })}
          </div>
        </div>

        {/* Market Type */}
        <div>
          <label className="text-slate-400 block mb-1 text-[11px] font-semibold">Market Type</label>
          <select
            value={metadata.marketType}
            onChange={(e) => onUpdateMetadata({ marketType: e.target.value })}
            className="w-full bg-[#0e121a] border border-[#1c2436] rounded-lg px-2.5 py-1.5 text-slate-200 outline-none focus:border-cyan-500 transition cursor-pointer"
          >
            <option value="All Market Conditions">All Market Conditions</option>
            <option value="Trending Bull / Bear Only">Trending Bull / Bear Only</option>
            <option value="High Volatility Regime Only">High Volatility Regime Only</option>
            <option value="Ranging / Mean Reverting Only">Ranging / Mean Reverting Only</option>
            <option value="Session Open Expansion Only">Session Open Expansion Only</option>
          </select>
        </div>

        {/* Tags */}
        <div>
          <label className="text-slate-400 block mb-1 text-[11px] font-semibold">Tags</label>
          <div className="flex flex-wrap items-center gap-1.5">
            {metadata.tags.map((t) => (
              <span
                key={t}
                className="bg-[#121824] text-cyan-300 border border-[#1e2a40] px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1"
              >
                <span>{t}</span>
                <button onClick={() => handleRemoveTag(t)} className="text-slate-500 hover:text-white">
                  <Minus className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
            {isAddingTag ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  placeholder="tag"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                  autoFocus
                  className="bg-[#0e121a] border border-cyan-500 rounded px-1.5 py-0.5 text-[10px] text-white w-16 outline-none"
                />
                <button onClick={handleAddTag} className="p-0.5 bg-cyan-600 rounded text-black font-bold">
                  <Check className="w-2.5 h-2.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingTag(true)}
                className="p-1 bg-[#101522] hover:bg-[#182030] border border-[#1e273a] text-slate-400 hover:text-white rounded transition"
              >
                <Plus className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
        </div>

        {/* Strategy Status & Metadata Timestamps */}
        <div className="pt-2 border-t border-[#151a24] space-y-2 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Strategy Status</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <select
                value={metadata.status}
                onChange={(e) => onUpdateMetadata({ status: e.target.value as any })}
                className="bg-transparent text-emerald-400 font-bold outline-none cursor-pointer"
              >
                <option value="Active" className="bg-[#0e121a] text-emerald-400">Active</option>
                <option value="Paper Trading" className="bg-[#0e121a] text-cyan-400">Paper Trading</option>
                <option value="Backtesting" className="bg-[#0e121a] text-amber-400">Backtesting</option>
                <option value="Deprecated" className="bg-[#0e121a] text-rose-400">Deprecated</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between text-slate-400">
            <span>Created</span>
            <span className="text-slate-200">{metadata.createdDate}</span>
          </div>

          <div className="flex items-center justify-between text-slate-400">
            <span>Last Modified</span>
            <span className="text-slate-200">{metadata.lastModified}</span>
          </div>

          <div className="flex items-center justify-between text-slate-400">
            <span>Version</span>
            <span className="text-cyan-400 font-bold">{metadata.version}</span>
          </div>
        </div>
      </div>

      {/* 2. CONDITIONS LIBRARY CARD */}
      <div className="quant-card p-4 space-y-3 border border-[#161c28] bg-[#0b0e14]">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Conditions Library</span>
          </h3>
          <span className="text-[10px] text-slate-500">1-Click Insert</span>
        </div>

        {/* Search Conditions Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search conditions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0e121a] border border-[#1c2436] rounded-lg pl-8 pr-3 py-1.5 text-white placeholder-slate-500 text-xs outline-none focus:border-cyan-500 transition"
          />
        </div>

        {/* Category Selector Tabs */}
        <div className="flex flex-wrap gap-1 border-b border-[#151a24] pb-2">
          {(Object.keys(conditionLibrary) as ConditionCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition ${
                activeCategory === cat
                  ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-700 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#121722]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Condition Items List */}
        <div className="space-y-1 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
          {filteredConditions.length > 0 ? (
            filteredConditions.map((cond) => (
              <div
                key={cond.name}
                className="flex items-center justify-between p-1.5 rounded-lg bg-[#0e121a] hover:bg-[#141b26] border border-[#1a2232] transition group"
              >
                <div className="flex items-center gap-2 text-slate-300 text-xs">
                  <Activity className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 transition" />
                  <span className="font-medium group-hover:text-white transition">{cond.name}</span>
                </div>
                <button
                  onClick={() => onAddCondition(cond.template)}
                  title="Add to Visual Rule Composer"
                  className="p-1 rounded bg-[#182030] hover:bg-cyan-500 hover:text-black text-slate-300 transition shadow-sm font-bold"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-slate-500 text-xs">
              No matching conditions in this category.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
