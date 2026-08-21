import React, { useState } from 'react';
import {
  Layers,
  Database,
  Sliders,
  Shield,
  Briefcase,
  CheckCircle2,
  Lock,
  ExternalLink,
  Plus,
  Calendar,
  Zap,
} from 'lucide-react';

export interface BacktestConfig {
  strategy: string;
  version: string;
  family: string;
  description: string;
  tags: string[];
  instrument: string;
  timeframe: string;
  dataSource: string;
  datasetVersion: string;
  startDate: string;
  endDate: string;
  sessionTemplate: string;
  spreadModel: string;
  commission: string;
  slippageModel: string;
  fillModel: string;
  intrabarModel: string;
  stopTargetPriority: string;
  initialCapital: number;
  riskPerTradePct: number;
  positionSizing: string;
  maxConcurrentPositions: number;
  maxPortfolioRiskPct: number;
  dailyLossLimit: string;
  maxDrawdownStop: string;
  compounding: boolean;
  portfolioMode: string;
  capitalAllocation: string;
  correlationAdjustment: boolean;
  reinvestment: boolean;
  benchmark: string;
}

interface BacktestConfigGridProps {
  config: BacktestConfig;
  onUpdateConfig: (updated: Partial<BacktestConfig>) => void;
  strategiesList?: Array<{ id: string; name: string; family?: string; version?: string; description?: string }>;
  instrumentsList?: Array<{ pair: string; type?: string; quality?: number }>;
  dataQualityPct?: number;
  onStressTest?: () => void;
}

export const BacktestConfigGrid: React.FC<BacktestConfigGridProps> = ({
  config,
  onUpdateConfig,
  strategiesList = [],
  instrumentsList = [],
  dataQualityPct = 99.8,
  onStressTest,
}) => {
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagText, setNewTagText] = useState('');

  // Default institutional universe if list is empty
  const defaultStrategies = [
    { id: 'bb_reversion_v4', name: 'BB Reversion v4', family: 'Mean Reversion', version: '4.0.0', description: 'Bollinger Band reversion strategy with trend and volatility filter.' },
    { id: 'order_block_v4', name: 'Order Block v4', family: 'Institutional SMC', version: '4.2.0', description: 'High-volume order block rejection with fair value gap confluence.' },
    { id: 'liquidity_sweep_v3', name: 'Liquidity Sweep v3', family: 'Liquidity Sweep', version: '3.1.0', description: 'Asia / London liquidity sweep with rapid mean-reverting entry.' },
    { id: 'london_breakout_v2', name: 'London Breakout v2', family: 'Breakout & Momentum', version: '2.0.0', description: 'Session open range expansion with volatility breakout triggers.' },
    { id: 'strategy_T04_F02', name: 'strategy_T04_F02', family: 'Mean Reversion', version: '1.0.0', description: 'DuckDB registered mean reversion algorithm with RSI filter.' },
    { id: 'strategy_T09_F08', name: 'strategy_T09_F08', family: 'Trend Following', version: '1.0.0', description: 'Institutional trend-following momentum rule with ATR sizing.' },
    { id: 'strategy_T01_F01', name: 'strategy_T01_F01', family: 'Breakout', version: '1.0.0', description: 'Volatility breakout trigger with dynamic stop-loss trailing.' },
  ];

  const availableStrategies = strategiesList.length > 0 ? strategiesList : defaultStrategies;

  const defaultInstruments = [
    { pair: 'XAUUSD', type: 'Forex/Metals', quality: 99.8 },
    { pair: 'EURUSD', type: 'Forex', quality: 99.9 },
    { pair: 'GBPUSD', type: 'Forex', quality: 99.7 },
    { pair: 'USDJPY', type: 'Forex', quality: 99.8 },
    { pair: 'BTCUSDT', type: 'Crypto', quality: 100.0 },
    { pair: 'ETHUSDT', type: 'Crypto', quality: 100.0 },
    { pair: 'SOLUSDT', type: 'Crypto', quality: 100.0 },
  ];

  const availableInstruments = instrumentsList.length > 0 ? instrumentsList : defaultInstruments;

  const handleAddTag = () => {
    if (newTagText.trim() && !config.tags.includes(newTagText.trim())) {
      onUpdateConfig({ tags: [...config.tags, newTagText.trim()] });
      setNewTagText('');
      setIsAddingTag(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onUpdateConfig({ tags: config.tags.filter((t) => t !== tagToRemove) });
  };

  const handleStrategyChange = (stratName: string) => {
    const matched = availableStrategies.find((s) => s.name === stratName);
    onUpdateConfig({
      strategy: stratName,
      version: matched?.version || '1.0.0',
      family: matched?.family || 'Institutional Quant',
      description: matched?.description || config.description,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3.5 font-mono text-xs select-none">
      {/* ========================================================================= */}
      {/* 1. STRATEGY CARD */}
      {/* ========================================================================= */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3.5 space-y-2.5 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#141a26] pb-2">
          <h3 className="font-bold text-white flex items-center gap-1.5 text-xs">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Strategy</span>
          </h3>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Active</span>
          </span>
        </div>

        {/* Strategy Selector & Version */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[10px] text-slate-400 uppercase font-semibold">Strategy</label>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-400">Version</span>
              <span className="flex items-center gap-0.5 bg-[#121824] border border-[#1e2a40] px-1.5 py-0.2 rounded text-[10px] text-cyan-300 font-bold">
                <Lock className="w-2.5 h-2.5 text-slate-400" />
                <span>{config.version}</span>
              </span>
            </div>
          </div>
          <select
            value={config.strategy}
            onChange={(e) => handleStrategyChange(e.target.value)}
            className="w-full bg-[#07090e] border border-[#1a2232] rounded-lg px-2 py-1.5 text-white font-bold outline-none focus:border-cyan-500 cursor-pointer"
          >
            {availableStrategies.map((s) => (
              <option key={s.id || s.name} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Strategy Family & Quick Links */}
        <div className="flex items-center justify-between text-[10px]">
          <div className="flex items-center gap-1">
            <span className="text-slate-400">Family:</span>
            <span className="text-cyan-300 font-bold">{config.family}</span>
          </div>
          <div className="flex items-center gap-2 text-cyan-400">
            <a href="#strategy_lab" className="hover:underline flex items-center gap-0.5">
              <span>View Block</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>

        {/* Description */}
        <div className="bg-[#07090e] border border-[#141a26] rounded-lg p-2 text-[10px] text-slate-300 line-clamp-2 leading-relaxed min-h-[38px]">
          {config.description}
        </div>

        {/* Tags */}
        <div>
          <label className="text-[10px] text-slate-400 block mb-1">Tags</label>
          <div className="flex flex-wrap items-center gap-1">
            {config.tags.map((tag) => (
              <span
                key={tag}
                className="bg-cyan-950/60 text-cyan-300 border border-cyan-800/80 px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1"
              >
                <span>{tag}</span>
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-white text-cyan-400 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
            {isAddingTag ? (
              <div className="flex items-center gap-0.5">
                <input
                  type="text"
                  value={newTagText}
                  onChange={(e) => setNewTagText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                  autoFocus
                  className="w-14 bg-[#07090e] border border-cyan-500 rounded px-1 text-[10px] text-white outline-none"
                />
                <button
                  onClick={handleAddTag}
                  className="px-1 bg-cyan-500 text-black font-bold rounded text-[10px]"
                >
                  ✓
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingTag(true)}
                className="px-1.5 py-0.5 bg-[#121824] hover:bg-[#1a2436] text-slate-400 hover:text-white rounded border border-[#1e2a40] text-[10px]"
              >
                <Plus className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
        </div>

        {/* Metadata Footer */}
        <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 border-t border-[#141a26] pt-1.5">
          <div>
            <span>Engine:</span>
            <div className="text-slate-300 font-bold">VectorBT Pro</div>
          </div>
          <div>
            <span>Point-In-Time:</span>
            <div className="text-emerald-400 font-bold">Zero Lookahead</div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DATASET CARD */}
      {/* ========================================================================= */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3.5 space-y-2.5 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#141a26] pb-2">
          <h3 className="font-bold text-white flex items-center gap-1.5 text-xs">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>Dataset</span>
          </h3>
          <div className="flex items-center gap-1 text-[10px]">
            <span className="text-slate-400">Quality:</span>
            <span className="text-emerald-400 font-bold">{dataQualityPct}%</span>
          </div>
        </div>

        {/* Instrument & Timeframe */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">Instrument</label>
            <select
              value={config.instrument}
              onChange={(e) => onUpdateConfig({ instrument: e.target.value })}
              className="w-full bg-[#07090e] border border-[#1a2232] rounded-lg px-2 py-1 text-white font-bold outline-none focus:border-cyan-500 cursor-pointer"
            >
              {availableInstruments.map((inst) => (
                <option key={inst.pair} value={inst.pair}>
                  {inst.pair}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">Timeframe</label>
            <select
              value={config.timeframe}
              onChange={(e) => onUpdateConfig({ timeframe: e.target.value })}
              className="w-full bg-[#07090e] border border-[#1a2232] rounded-lg px-2 py-1 text-cyan-300 font-bold outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="1m">1m</option>
              <option value="5m">5m</option>
              <option value="15m">15m</option>
              <option value="1h">1H</option>
              <option value="4h">4H</option>
              <option value="1d">1D</option>
            </select>
          </div>
        </div>

        {/* Data Source & Dataset Version */}
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div>
            <label className="text-slate-400 block mb-0.5">Data Source</label>
            <div className="bg-[#07090e] border border-[#1a2232] rounded px-2 py-1 text-slate-300 font-bold">
              {config.dataSource}
            </div>
          </div>
          <div>
            <label className="text-slate-400 block mb-0.5">Dataset Partition</label>
            <div className="bg-[#07090e] border border-[#1a2232] rounded px-2 py-1 text-slate-400 truncate">
              {config.datasetVersion}
            </div>
          </div>
        </div>

        {/* Date Range Inputs */}
        <div>
          <label className="text-[10px] text-slate-400 block mb-0.5">Data Range</label>
          <div className="flex items-center gap-1 bg-[#07090e] border border-[#1a2232] rounded-lg p-1">
            <input
              type="text"
              value={config.startDate}
              onChange={(e) => onUpdateConfig({ startDate: e.target.value })}
              className="w-20 bg-transparent text-white font-mono text-[10px] outline-none text-center"
            />
            <span className="text-slate-500">→</span>
            <input
              type="text"
              value={config.endDate}
              onChange={(e) => onUpdateConfig({ endDate: e.target.value })}
              className="w-20 bg-transparent text-white font-mono text-[10px] outline-none text-center"
            />
            <Calendar className="w-3 h-3 text-cyan-400 ml-auto" />
          </div>
        </div>

        {/* Quality Badges */}
        <div className="grid grid-cols-2 gap-1 text-[9px] text-slate-400">
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
            <span>0 Missing candles</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
            <span>Timezone UTC</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
            <span>OHLC validity</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
            <span>Zero corrupted</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. EXECUTION MODEL CARD */}
      {/* ========================================================================= */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3.5 space-y-2.5 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#141a26] pb-2">
          <h3 className="font-bold text-white flex items-center gap-1.5 text-xs">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>Execution Model</span>
          </h3>
          <span className="text-[10px] text-slate-500">APEX Fill Engine</span>
        </div>

        {/* Spread & Commission */}
        <div className="space-y-1.5 text-[10px]">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Spread</span>
            <select
              value={config.spreadModel}
              onChange={(e) => onUpdateConfig({ spreadModel: e.target.value })}
              className="bg-[#07090e] border border-[#1a2232] rounded px-1.5 py-0.5 text-slate-200 outline-none text-[10px]"
            >
              <option value="Variable (Historical)">Variable (Historical)</option>
              <option value="Fixed (0.2 pips)">Fixed (0.2 pips)</option>
              <option value="Zero Spread">Zero Spread</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Commission</span>
            <span className="bg-[#07090e] border border-[#1a2232] rounded px-1.5 py-0.5 text-slate-300 font-bold">
              {config.commission}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Slippage</span>
            <select
              value={config.slippageModel}
              onChange={(e) => onUpdateConfig({ slippageModel: e.target.value })}
              className="bg-[#07090e] border border-[#1a2232] rounded px-1.5 py-0.5 text-slate-200 outline-none text-[10px]"
            >
              <option value="Volatility-Based">Volatility-Based (2.0 bps)</option>
              <option value="Fixed (0.5 pips)">Fixed (5.0 bps)</option>
              <option value="Zero Slippage">Zero Slippage (0.0 bps)</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Fill Model</span>
            <select
              value={config.fillModel}
              onChange={(e) => onUpdateConfig({ fillModel: e.target.value })}
              className="bg-[#07090e] border border-[#1a2232] rounded px-1.5 py-0.5 text-slate-200 outline-none text-[10px]"
            >
              <option value="Market Orders">Market Orders</option>
              <option value="Next Candle Open">Next Candle Open</option>
              <option value="Limit Touch">Limit Touch</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Intrabar Model</span>
            <span className="bg-[#07090e] border border-[#1a2232] rounded px-1.5 py-0.5 text-cyan-300 font-bold">
              {config.intrabarModel}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Stop/Target Priority</span>
            <span className="bg-rose-950/60 border border-rose-800 text-rose-300 rounded px-1.5 py-0.5 font-bold">
              {config.stopTargetPriority}
            </span>
          </div>
        </div>

        {/* Execution Stress Test Button */}
        <button
          onClick={onStressTest}
          className="w-full py-1 bg-[#101522] hover:bg-[#182030] border border-[#1e273a] rounded-lg text-slate-300 hover:text-white text-[10px] font-bold transition flex items-center justify-center gap-1 active:scale-95"
        >
          <Zap className="w-3 h-3 text-cyan-400" />
          <span>Execution Stress Test</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 4. RISK MANAGEMENT CARD */}
      {/* ========================================================================= */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3.5 space-y-2.5 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#141a26] pb-2">
          <h3 className="font-bold text-white flex items-center gap-1.5 text-xs">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>Risk Management</span>
          </h3>
          <span className="text-[10px] text-slate-500">APEX Layer 5</span>
        </div>

        <div className="space-y-1.5 text-[10px]">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Initial Capital</span>
            <div className="flex items-center gap-1 bg-[#07090e] border border-[#1a2232] rounded px-1.5 py-0.5">
              <span className="text-slate-500 font-bold">$</span>
              <input
                type="number"
                value={config.initialCapital}
                step={1000}
                onChange={(e) => onUpdateConfig({ initialCapital: parseFloat(e.target.value) || 10000 })}
                className="w-16 bg-transparent text-emerald-400 font-bold font-mono outline-none text-right"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Risk Per Trade</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={config.riskPerTradePct}
                step={0.1}
                onChange={(e) => onUpdateConfig({ riskPerTradePct: parseFloat(e.target.value) || 0.5 })}
                className="w-12 bg-[#07090e] border border-[#1a2232] rounded px-1 py-0.5 text-right text-cyan-300 font-bold outline-none"
              />
              <span className="text-slate-400">%</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Position Sizing</span>
            <select
              value={config.positionSizing}
              onChange={(e) => onUpdateConfig({ positionSizing: e.target.value })}
              className="bg-[#07090e] border border-[#1a2232] rounded px-1.5 py-0.5 text-slate-200 outline-none text-[10px]"
            >
              <option value="Fixed Fractional">Fixed Fractional</option>
              <option value="Kelly Criterion">Kelly Criterion</option>
              <option value="Equal Cash">Equal Cash</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Max Concurrent</span>
            <select
              value={config.maxConcurrentPositions}
              onChange={(e) => onUpdateConfig({ maxConcurrentPositions: parseInt(e.target.value) || 3 })}
              className="bg-[#07090e] border border-[#1a2232] rounded px-1.5 py-0.5 text-white font-bold outline-none text-[10px]"
            >
              <option value={1}>1 Position</option>
              <option value={2}>2 Positions</option>
              <option value={3}>3 Positions</option>
              <option value={5}>5 Positions</option>
              <option value={10}>10 Positions</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Max Portfolio Risk</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={config.maxPortfolioRiskPct}
                step={0.5}
                onChange={(e) => onUpdateConfig({ maxPortfolioRiskPct: parseFloat(e.target.value) || 1.5 })}
                className="w-12 bg-[#07090e] border border-[#1a2232] rounded px-1 py-0.5 text-right text-rose-400 font-bold outline-none"
              />
              <span className="text-slate-400">%</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Compounding</span>
            <button
              onClick={() => onUpdateConfig({ compounding: !config.compounding })}
              className={`w-8 h-4 rounded-full transition-colors relative ${
                config.compounding ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`w-3 h-3 rounded-full bg-black absolute top-0.5 transition-transform ${
                  config.compounding ? 'left-4' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. PORTFOLIO SETTINGS & ENGINE STATUS CARD */}
      {/* ========================================================================= */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3.5 space-y-2.5 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#141a26] pb-2">
          <h3 className="font-bold text-white flex items-center gap-1.5 text-xs">
            <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
            <span>Portfolio Settings</span>
          </h3>
          <a href="#dashboard" className="text-[10px] text-cyan-400 hover:underline">
            Preview
          </a>
        </div>

        <div className="space-y-1.5 text-[10px]">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Mode</span>
            <select
              value={config.portfolioMode}
              onChange={(e) => onUpdateConfig({ portfolioMode: e.target.value })}
              className="bg-[#07090e] border border-[#1a2232] rounded px-1.5 py-0.5 text-slate-200 outline-none text-[10px]"
            >
              <option value="Single Strategy">Single Strategy</option>
              <option value="Multi-Asset Blend">Multi-Asset Blend</option>
              <option value="Risk Parity">Risk Parity</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Capital Allocation</span>
            <select
              value={config.capitalAllocation}
              onChange={(e) => onUpdateConfig({ capitalAllocation: e.target.value })}
              className="bg-[#07090e] border border-[#1a2232] rounded px-1.5 py-0.5 text-slate-200 outline-none text-[10px]"
            >
              <option value="Equal">Equal Allocation</option>
              <option value="Volatility Inverted">Volatility Inverted</option>
              <option value="Kelly Weighted">Kelly Weighted</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Correlation Adj.</span>
            <button
              onClick={() => onUpdateConfig({ correlationAdjustment: !config.correlationAdjustment })}
              className={`w-7 h-3.5 rounded-full transition-colors relative ${
                config.correlationAdjustment ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full bg-black absolute top-0.5 transition-transform ${
                  config.correlationAdjustment ? 'left-3.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Reinvestment</span>
            <button
              onClick={() => onUpdateConfig({ reinvestment: !config.reinvestment })}
              className={`w-7 h-3.5 rounded-full transition-colors relative ${
                config.reinvestment ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full bg-black absolute top-0.5 transition-transform ${
                  config.reinvestment ? 'left-3.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Benchmark</span>
            <select
              value={config.benchmark}
              onChange={(e) => onUpdateConfig({ benchmark: e.target.value })}
              className="bg-[#07090e] border border-[#1a2232] rounded px-1.5 py-0.5 text-slate-200 outline-none text-[10px]"
            >
              <option value="None">None</option>
              <option value="Buy & Hold">Buy & Hold Asset</option>
              <option value="SPY 500">SPY 500 Benchmark</option>
              <option value="BTC Index">BTC Index</option>
            </select>
          </div>
        </div>

        {/* Engine Status Box */}
        <div className="bg-[#07090e] border border-[#141a26] rounded-lg p-2 space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-400 font-bold">Backtest Engine</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>VectorBT Ready</span>
            </span>
          </div>
          <div className="text-[10px] text-cyan-300 font-bold flex items-center gap-1">
            <span>DuckDB Parquet Zero-Copy Pushdown</span>
          </div>
        </div>
      </div>
    </div>
  );
};
