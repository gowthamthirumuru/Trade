import React from 'react';
import {
  TrendingUp,
  Shield,
  FileText,
  Clock,
  Target,
  Percent,
  Sliders,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';
import { StrategyLabTab } from './StrategyHeader';

interface SecondaryTabsProps {
  activeTab: StrategyLabTab;
  strategyName: string;
}

export const SecondaryTabs: React.FC<SecondaryTabsProps> = ({ activeTab, strategyName }) => {
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
                    defaultValue={1.5}
                    step={0.1}
                    className="w-16 bg-[#141b2a] border border-[#222e44] rounded px-2 py-1 text-right text-emerald-400 font-bold outline-none"
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
                    defaultValue={3.0}
                    step={0.5}
                    className="w-16 bg-[#141b2a] border border-[#222e44] rounded px-2 py-1 text-right text-emerald-400 font-bold outline-none"
                  />
                  <span className="text-slate-400">R</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-300">Opposite Bollinger Band Exit:</span>
                <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-bold">
                  Enabled (Upper BB 20, 2)
                </span>
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
                <select className="bg-[#141b2a] border border-[#222e44] rounded px-2 py-1 text-slate-200 outline-none">
                  <option>Structure Swing Low - (0.5 * ATR)</option>
                  <option>Fixed ATR Multiple (1.5x ATR)</option>
                  <option>Order Block Low (Imbalance Base)</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-300">Breakeven Migration Trigger:</span>
                <div className="flex items-center gap-1">
                  <span className="text-slate-400">At +</span>
                  <input
                    type="number"
                    defaultValue={1.0}
                    step={0.1}
                    className="w-16 bg-[#141b2a] border border-[#222e44] rounded px-2 py-1 text-right text-cyan-300 font-bold outline-none"
                  />
                  <span className="text-slate-400">R (Move SL to Entry)</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-300">Trailing Stop Model:</span>
                <select className="bg-[#141b2a] border border-[#222e44] rounded px-2 py-1 text-slate-200 outline-none">
                  <option>Chandelier 2.0x ATR Trailing</option>
                  <option>Parabolic SAR (0.02, 0.2)</option>
                  <option>20 EMA Step Trailing</option>
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
                <div className="text-sm font-bold text-white mt-1">24 Bars (6.0 Hours)</div>
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
                <div className="text-[10px] text-slate-500 mt-0.5">Avoids Asian low-liquidity rollover</div>
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
                defaultValue={0.5}
                step={0.1}
                className="w-20 bg-[#141b2a] border border-[#222e44] rounded px-3 py-1.5 text-right text-cyan-300 font-bold outline-none"
              />
              <span className="text-slate-300">% Equity</span>
            </div>
          </div>

          <div className="bg-[#0e121a] p-4 rounded-xl border border-[#1c2436] space-y-3">
            <h4 className="font-bold text-cyan-400 flex items-center gap-1.5">
              <Sliders className="w-4 h-4" /> Sizing Algorithm
            </h4>
            <p className="text-[11px] text-slate-400">Mathematical sizing formula dynamically adjusting lots by stop distance.</p>
            <select className="w-full bg-[#141b2a] border border-[#222e44] rounded px-3 py-1.5 text-slate-200 outline-none">
              <option>Fixed Fractional (Risk $ / ATR Distance)</option>
              <option>Volatility Normalized (Kelly Fraction 0.25)</option>
              <option>Equal Cash Allocation ($10,000)</option>
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
                defaultValue={2.0}
                step={0.5}
                className="w-20 bg-[#141b2a] border border-[#222e44] rounded px-3 py-1.5 text-right text-rose-400 font-bold outline-none"
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
              defaultValue="This strategy exploits mean-reverting liquidity rebalances in Gold (XAUUSD) and EURUSD following extended deviations outside Bollinger Bands during the high-liquidity London Open. Commercial dealers re-absorb retail momentum orders when ATR expands above 18.0."
              className="w-full bg-[#0e121a] border border-[#1c2436] rounded-lg p-3 text-slate-200 outline-none leading-relaxed focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-bold">2. Counterparty Identification (Who Pays Us?)</label>
            <textarea
              rows={2}
              defaultValue="Counterparties: Late retail breakout traders chasing momentum below Lower BB at the end of the Asian session, whose sell stops provide the requisite buy liquidity for mean reversion."
              className="w-full bg-[#0e121a] border border-[#1c2436] rounded-lg p-3 text-slate-200 outline-none leading-relaxed focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-bold">3. Invalidation & Regime Failure Conditions</label>
            <textarea
              rows={2}
              defaultValue="Strategy should be automatically throttled during high-impact FOMC / NFP releases and when 1H ATR exceeds 35.0 (unbounded runaway trend regimes)."
              className="w-full bg-[#0e121a] border border-[#1c2436] rounded-lg p-3 text-slate-200 outline-none leading-relaxed focus:border-cyan-500"
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
};
