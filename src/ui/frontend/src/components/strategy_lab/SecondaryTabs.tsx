import React from 'react';
import {
  TrendingUp,
  Shield,
  FileText,
  Clock,
  Target,
  Percent,
  Sliders,
  AlertTriangle,
} from 'lucide-react';
import { StrategyLabTab } from './StrategyHeader';
import { RiskSettings } from './RiskAndExecutionPanel';

export interface ExitSettings {
  tp_tier1_r: number;
  tp_tier2_r: number;
  use_bb_exit: boolean;
  sl_model: string;
  be_trigger_r: number;
  trailing_model: string;
  max_hold_bars: number;
  weekend_flatten: boolean;
  session_end_exit: boolean;
}

export interface StrategyNotes {
  rationale: string;
  counterparty: string;
  invalidation: string;
}

interface SecondaryTabsProps {
  activeTab: StrategyLabTab;
  strategyName: string;
  notes?: StrategyNotes;
  onUpdateNotes?: (notes: Partial<StrategyNotes>) => void;
  risk?: RiskSettings;
  onUpdateRisk?: (risk: Partial<RiskSettings>) => void;
  exits?: ExitSettings;
  onUpdateExits?: (exits: Partial<ExitSettings>) => void;
}

export const SecondaryTabs: React.FC<SecondaryTabsProps> = ({
  activeTab,
  strategyName,
  notes = {
    rationale: "This strategy exploits mean-reverting liquidity rebalances in Gold (XAUUSD) and EURUSD following extended deviations outside Bollinger Bands during the high-liquidity London Open. Commercial dealers re-absorb retail momentum orders when ATR expands above 18.0.",
    counterparty: "Counterparties: Late retail breakout traders chasing momentum below Lower BB at the end of the Asian session, whose sell stops provide the requisite buy liquidity for mean reversion.",
    invalidation: "Strategy should be automatically throttled during high-impact FOMC / NFP releases and when 1H ATR exceeds 35.0 (unbounded runaway trend regimes).",
  },
  onUpdateNotes,
  risk,
  onUpdateRisk,
  exits = {
    tp_tier1_r: 1.5,
    tp_tier2_r: 3.0,
    use_bb_exit: true,
    sl_model: "Structure Swing Low - (0.5 * ATR)",
    be_trigger_r: 1.0,
    trailing_model: "Chandelier 2.0x ATR Trailing",
    max_hold_bars: 24,
    weekend_flatten: true,
    session_end_exit: true,
  },
  onUpdateExits,
}) => {
  if (activeTab === 'exits') {
    return (
      <div className="quant-card p-6 border border-[#161c28] bg-[#0b0e14] font-mono text-xs select-none space-y-5 animate-in fade-in duration-150">
        <div className="flex items-center justify-between border-b border-[#151a24] pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Exit, Scale-Out & Trailing Stop Engine</h3>
          </div>
          <span className="text-[11px] text-slate-500">APEX Layer 6 (Asymmetric Payoff)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Take Profit & Scale-Out Targets */}
          <div className="bg-[#0e121a] border border-[#1a2232] p-4 rounded-xl space-y-3">
            <h4 className="font-bold text-cyan-400 flex items-center gap-2">
              <Target className="w-4 h-4" /> Take Profit (Multi-Tier Scale Out)
            </h4>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Tier 1 Target (Scale 50%):</span>
                <div className="flex items-center gap-1">
                  <span className="text-slate-400">+</span>
                  <input
                    type="number"
                    value={exits.tp_tier1_r}
                    step={0.1}
                    onChange={(e) => onUpdateExits?.({ tp_tier1_r: parseFloat(e.target.value) || 1.0 })}
                    className="w-16 bg-[#141b2a] border border-[#222e44] rounded px-2 py-1 text-right text-emerald-400 font-bold outline-none focus:border-cyan-500"
                  />
                  <span className="text-slate-400">R</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-300">Tier 2 Target (Runner 50%):</span>
                <div className="flex items-center gap-1">
                  <span className="text-slate-400">+</span>
                  <input
                    type="number"
                    value={exits.tp_tier2_r}
                    step={0.5}
                    onChange={(e) => onUpdateExits?.({ tp_tier2_r: parseFloat(e.target.value) || 2.0 })}
                    className="w-16 bg-[#141b2a] border border-[#222e44] rounded px-2 py-1 text-right text-emerald-400 font-bold outline-none focus:border-cyan-500"
                  />
                  <span className="text-slate-400">R</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-300">Opposite Bollinger Band Exit:</span>
                <button
                  onClick={() => onUpdateExits?.({ use_bb_exit: !exits.use_bb_exit })}
                  className={`px-2 py-0.5 rounded font-bold transition border ${
                    exits.use_bb_exit
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                      : 'bg-slate-900 text-slate-500 border-slate-700'
                  }`}
                >
                  {exits.use_bb_exit ? 'Enabled (Upper BB 20, 2)' : 'Disabled'}
                </button>
              </div>
            </div>
          </div>

          {/* Stop Loss & Invalidation Rules */}
          <div className="bg-[#0e121a] border border-[#1a2232] p-4 rounded-xl space-y-3">
            <h4 className="font-bold text-rose-400 flex items-center gap-2">
              <Shield className="w-4 h-4" /> Stop Loss & Structural Invalidation
            </h4>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Initial Stop Loss Placement:</span>
                <select
                  value={exits.sl_model}
                  onChange={(e) => onUpdateExits?.({ sl_model: e.target.value })}
                  className="bg-[#141b2a] border border-[#222e44] rounded px-2 py-1 text-slate-200 outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="Structure Swing Low - (0.5 * ATR)">Structure Swing Low - (0.5 * ATR)</option>
                  <option value="Fixed ATR Multiple (1.5x ATR)">Fixed ATR Multiple (1.5x ATR)</option>
                  <option value="Order Block Low (Imbalance Base)">Order Block Low (Imbalance Base)</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-300">Breakeven Migration Trigger:</span>
                <div className="flex items-center gap-1">
                  <span className="text-slate-400">At +</span>
                  <input
                    type="number"
                    value={exits.be_trigger_r}
                    step={0.1}
                    onChange={(e) => onUpdateExits?.({ be_trigger_r: parseFloat(e.target.value) || 1.0 })}
                    className="w-16 bg-[#141b2a] border border-[#222e44] rounded px-2 py-1 text-right text-cyan-300 font-bold outline-none focus:border-cyan-500"
                  />
                  <span className="text-slate-400">R (Move SL to Entry)</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-300">Trailing Stop Model:</span>
                <select
                  value={exits.trailing_model}
                  onChange={(e) => onUpdateExits?.({ trailing_model: e.target.value })}
                  className="bg-[#141b2a] border border-[#222e44] rounded px-2 py-1 text-slate-200 outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="Chandelier 2.0x ATR Trailing">Chandelier 2.0x ATR Trailing</option>
                  <option value="Parabolic SAR (0.02, 0.2)">Parabolic SAR (0.02, 0.2)</option>
                  <option value="20 EMA Step Trailing">20 EMA Step Trailing</option>
                </select>
              </div>
            </div>
          </div>

          {/* Time & Session Exits */}
          <div className="bg-[#0e121a] border border-[#1a2232] p-4 rounded-xl space-y-3 md:col-span-2">
            <h4 className="font-bold text-amber-400 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Time Decay & Session Close Rules
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
              <div className="bg-[#141b2a] p-2.5 rounded-lg border border-[#222e44]">
                <div className="text-slate-400">Max Hold Duration</div>
                <div className="text-sm font-bold text-white mt-1 flex items-center gap-1.5">
                  <input
                    type="number"
                    value={exits.max_hold_bars}
                    onChange={(e) => onUpdateExits?.({ max_hold_bars: parseInt(e.target.value) || 24 })}
                    className="w-14 bg-[#0e121a] border border-[#222e44] rounded px-1 text-cyan-300 font-bold"
                  />
                  <span>Bars</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Closes trade if no expansion</div>
              </div>

              <div className="bg-[#141b2a] p-2.5 rounded-lg border border-[#222e44]">
                <div className="text-slate-400">Weekend Flatten</div>
                <div className="text-sm font-bold text-emerald-400 mt-1">Friday 21:00 UTC</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Avoids weekend gap risk</div>
              </div>

              <div className="bg-[#141b2a] p-2.5 rounded-lg border border-[#222e44]">
                <div className="text-slate-400">Session End Exit</div>
                <div className="text-sm font-bold text-cyan-400 mt-1">End of NY Session</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Avoids Asian rollover</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'risk') {
    return (
      <div className="quant-card p-6 border border-[#161c28] bg-[#0b0e14] font-mono text-xs select-none space-y-5 animate-in fade-in duration-150">
        <div className="flex items-center justify-between border-b border-[#151a24] pb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Strategy Risk Budgeting & Position Sizing</h3>
          </div>
          <span className="text-[11px] text-slate-500">APEX Layer 5 (Risk Architecture)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#0e121a] p-4 rounded-xl border border-[#1c2436] space-y-3">
            <h4 className="font-bold text-cyan-400 flex items-center gap-1.5">
              <Percent className="w-4 h-4" /> Risk Per Trade
            </h4>
            <p className="text-[11px] text-slate-400">Maximum account equity risked on a single entry execution.</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={risk?.riskPerTradePct ?? 0.5}
                step={0.1}
                onChange={(e) => onUpdateRisk?.({ riskPerTradePct: parseFloat(e.target.value) || 0.5 })}
                className="w-20 bg-[#141b2a] border border-[#222e44] rounded px-3 py-1.5 text-right text-cyan-300 font-bold outline-none focus:border-cyan-500"
              />
              <span className="text-slate-300">% Equity</span>
            </div>
          </div>

          <div className="bg-[#0e121a] p-4 rounded-xl border border-[#1c2436] space-y-3">
            <h4 className="font-bold text-cyan-400 flex items-center gap-1.5">
              <Sliders className="w-4 h-4" /> Sizing Algorithm
            </h4>
            <p className="text-[11px] text-slate-400">Mathematical sizing formula dynamically adjusting lots by stop distance.</p>
            <select
              value={risk?.positionSizing ?? 'Fixed Fractional'}
              onChange={(e) => onUpdateRisk?.({ positionSizing: e.target.value as any })}
              className="w-full bg-[#141b2a] border border-[#222e44] rounded px-3 py-1.5 text-slate-200 outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="Fixed Fractional">Fixed Fractional (Risk $ / ATR Distance)</option>
              <option value="Volatility Normalized">Volatility Normalized (Kelly Fraction 0.25)</option>
              <option value="Equal Cash">Equal Cash Allocation ($10,000)</option>
            </select>
          </div>

          <div className="bg-[#0e121a] p-4 rounded-xl border border-[#1c2436] space-y-3">
            <h4 className="font-bold text-rose-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> Daily Loss Circuit Breaker
            </h4>
            <p className="text-[11px] text-slate-400">Halts new orders if daily realized drawdown threshold is crossed.</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={risk?.maxRiskPerDayPct ?? 2.0}
                step={0.5}
                onChange={(e) => onUpdateRisk?.({ maxRiskPerDayPct: parseFloat(e.target.value) || 2.0 })}
                className="w-20 bg-[#141b2a] border border-[#222e44] rounded px-3 py-1.5 text-right text-rose-400 font-bold outline-none focus:border-cyan-500"
              />
              <span className="text-slate-300">% Max Daily DD</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'notes') {
    return (
      <div className="quant-card p-6 border border-[#161c28] bg-[#0b0e14] font-mono text-xs select-none space-y-4 animate-in fade-in duration-150">
        <div className="flex items-center justify-between border-b border-[#151a24] pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Edge Hypothesis & Institutional Documentation</h3>
          </div>
          <span className="text-[11px] text-slate-500">APEX Layer 1 (Economic Rationale)</span>
        </div>

        <div className="space-y-3 text-slate-300">
          <div>
            <label className="text-slate-400 block mb-1 font-bold">1. Economic Rationale & Alpha Source</label>
            <textarea
              rows={3}
              value={notes.rationale}
              onChange={(e) => onUpdateNotes?.({ rationale: e.target.value })}
              className="w-full bg-[#0e121a] border border-[#1c2436] rounded-lg p-3 text-slate-200 outline-none leading-relaxed focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-bold">2. Counterparty Identification (Who Pays Us?)</label>
            <textarea
              rows={2}
              value={notes.counterparty}
              onChange={(e) => onUpdateNotes?.({ counterparty: e.target.value })}
              className="w-full bg-[#0e121a] border border-[#1c2436] rounded-lg p-3 text-slate-200 outline-none leading-relaxed focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-bold">3. Invalidation & Regime Failure Conditions</label>
            <textarea
              rows={2}
              value={notes.invalidation}
              onChange={(e) => onUpdateNotes?.({ invalidation: e.target.value })}
              className="w-full bg-[#0e121a] border border-[#1c2436] rounded-lg p-3 text-slate-200 outline-none leading-relaxed focus:border-cyan-500"
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
};
