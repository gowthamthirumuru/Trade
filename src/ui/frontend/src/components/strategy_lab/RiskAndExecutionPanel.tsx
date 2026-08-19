import React from 'react';
import {
  Shield,
  Zap,
  Sliders,
  DollarSign,
  Activity,
  Layers,
  AlertTriangle,
  Info,
} from 'lucide-react';

export interface RiskSettings {
  riskPerTradePct: number;
  positionSizing: string;
  maxRiskPerDayPct: number;
  maxRiskPerWeekPct: number;
  maxOpenTrades: number;
  correlationLimit: number;
  usePortfolioRisk: boolean;
  positionComment: string;
}

export interface ExecutionAssumptions {
  slippagePips: number;
  commission: number;
  spreadModel: string;
  spreadOverridePips: number;
  entryType: string;
  fillModel: string;
  useRealisticSpread: boolean;
  useVariableSlippage: boolean;
}

interface RiskAndExecutionPanelProps {
  risk: RiskSettings;
  onUpdateRisk: (updated: Partial<RiskSettings>) => void;
  execution: ExecutionAssumptions;
  onUpdateExecution: (updated: Partial<ExecutionAssumptions>) => void;
}

export const RiskAndExecutionPanel: React.FC<RiskAndExecutionPanelProps> = ({
  risk,
  onUpdateRisk,
  execution,
  onUpdateExecution,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs select-none">
      {/* 1. Risk & Positioning Card */}
      <div className="quant-card p-4 border border-[#161c28] bg-[#0b0e14] space-y-3">
        <div className="flex items-center justify-between border-b border-[#151a24] pb-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Risk & Positioning</h3>
          </div>
          <span className="text-[10px] text-slate-500">APEX Layer 5</span>
        </div>

        <div className="space-y-2.5">
          {/* Risk Per Trade */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-400">Risk Per Trade</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                step={0.1}
                min={0.1}
                max={5.0}
                value={risk.riskPerTradePct}
                onChange={(e) =>
                  onUpdateRisk({ riskPerTradePct: parseFloat(e.target.value) || 0.5 })
                }
                className="w-20 bg-[#0e121a] border border-[#1c2436] rounded px-2 py-1 text-right font-bold text-cyan-300 text-xs outline-none focus:border-cyan-500"
              />
              <span className="text-slate-400 font-bold">%</span>
            </div>
          </div>

          {/* Position Sizing Model */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-400">Position Sizing</span>
            <select
              value={risk.positionSizing}
              onChange={(e) => onUpdateRisk({ positionSizing: e.target.value })}
              className="bg-[#0e121a] border border-[#1c2436] rounded px-2 py-1 text-slate-200 text-xs outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="Fixed Fractional">Fixed Fractional</option>
              <option value="Kelly Criterion (Half)">Kelly Criterion (Half)</option>
              <option value="ATR Volatility Parity">ATR Volatility Parity</option>
              <option value="Risk Parity">Risk Parity Multi-Asset</option>
            </select>
          </div>

          {/* Max Risk Per Day */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-400">Max Risk Per Day</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                step={0.5}
                min={0.5}
                max={10.0}
                value={risk.maxRiskPerDayPct}
                onChange={(e) =>
                  onUpdateRisk({ maxRiskPerDayPct: parseFloat(e.target.value) || 2.0 })
                }
                className="w-20 bg-[#0e121a] border border-[#1c2436] rounded px-2 py-1 text-right font-bold text-slate-100 text-xs outline-none focus:border-cyan-500"
              />
              <span className="text-slate-400 font-bold">%</span>
            </div>
          </div>

          {/* Max Risk Per Week */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-400">Max Risk Per Week</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                step={0.5}
                min={1.0}
                max={20.0}
                value={risk.maxRiskPerWeekPct}
                onChange={(e) =>
                  onUpdateRisk({ maxRiskPerWeekPct: parseFloat(e.target.value) || 5.0 })
                }
                className="w-20 bg-[#0e121a] border border-[#1c2436] rounded px-2 py-1 text-right font-bold text-slate-100 text-xs outline-none focus:border-cyan-500"
              />
              <span className="text-slate-400 font-bold">%</span>
            </div>
          </div>

          {/* Max Open Trades */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-400">Max Open Trades</span>
            <input
              type="number"
              min={1}
              max={10}
              value={risk.maxOpenTrades}
              onChange={(e) =>
                onUpdateRisk({ maxOpenTrades: parseInt(e.target.value, 10) || 3 })
              }
              className="w-20 bg-[#0e121a] border border-[#1c2436] rounded px-2 py-1 text-right font-bold text-slate-100 text-xs outline-none focus:border-cyan-500"
            />
          </div>

          {/* Correlation Limit */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-400">Correlation Limit</span>
            <input
              type="number"
              step={0.05}
              min={0.1}
              max={1.0}
              value={risk.correlationLimit}
              onChange={(e) =>
                onUpdateRisk({ correlationLimit: parseFloat(e.target.value) || 0.75 })
              }
              className="w-20 bg-[#0e121a] border border-[#1c2436] rounded px-2 py-1 text-right font-bold text-slate-100 text-xs outline-none focus:border-cyan-500"
            />
          </div>

          {/* Use Portfolio Risk Toggle */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <span className="text-slate-300 font-bold">Use Portfolio Risk</span>
            <button
              onClick={() => onUpdateRisk({ usePortfolioRisk: !risk.usePortfolioRisk })}
              className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
                risk.usePortfolioRisk ? 'bg-cyan-500' : 'bg-neutral-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-black transition-transform ${
                  risk.usePortfolioRisk ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Position Comment */}
          <div>
            <label className="text-slate-500 block mb-1 text-[10px]">Position Comment</label>
            <textarea
              rows={2}
              value={risk.positionComment}
              onChange={(e) => onUpdateRisk({ positionComment: e.target.value })}
              className="w-full bg-[#0e121a] border border-[#1c2436] rounded p-2 text-slate-300 text-[11px] outline-none resize-none"
            />
          </div>
        </div>
      </div>

      {/* 2. Execution Assumptions Card */}
      <div className="quant-card p-4 border border-[#161c28] bg-[#0b0e14] space-y-3">
        <div className="flex items-center justify-between border-b border-[#151a24] pb-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Execution Assumptions</h3>
          </div>
          <span className="text-[10px] text-slate-500">Institutional Fills</span>
        </div>

        <div className="space-y-2.5">
          {/* Slippage (Pips) */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-400">Slippage (Pips)</span>
            <input
              type="number"
              step={0.1}
              min={0.0}
              max={5.0}
              value={execution.slippagePips}
              onChange={(e) =>
                onUpdateExecution({ slippagePips: parseFloat(e.target.value) || 0.2 })
              }
              className="w-20 bg-[#0e121a] border border-[#1c2436] rounded px-2 py-1 text-right font-bold text-cyan-300 text-xs outline-none focus:border-cyan-500"
            />
          </div>

          {/* Commission */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-400">Commission ($ / Lot)</span>
            <input
              type="number"
              step={0.5}
              min={0.0}
              max={10.0}
              value={execution.commission}
              onChange={(e) =>
                onUpdateExecution({ commission: parseFloat(e.target.value) || 0.0 })
              }
              className="w-20 bg-[#0e121a] border border-[#1c2436] rounded px-2 py-1 text-right font-bold text-slate-100 text-xs outline-none focus:border-cyan-500"
            />
          </div>

          {/* Spread Model */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-400">Spread Model</span>
            <select
              value={execution.spreadModel}
              onChange={(e) => onUpdateExecution({ spreadModel: e.target.value })}
              className="bg-[#0e121a] border border-[#1c2436] rounded px-2 py-1 text-slate-200 text-xs outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="Average Spread">Average Spread (0.4 pips)</option>
              <option value="Historical Tick Spread">Historical Tick Spread (Dukascopy)</option>
              <option value="Fixed Spread">Fixed Spread</option>
              <option value="Zero Spread">Zero Spread (Raw Analysis)</option>
            </select>
          </div>

          {/* Spread Override (Pips) */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-400">Spread Override (Pips)</span>
            <input
              type="number"
              step={0.1}
              min={0.0}
              max={10.0}
              value={execution.spreadOverridePips}
              onChange={(e) =>
                onUpdateExecution({ spreadOverridePips: parseFloat(e.target.value) || 0.0 })
              }
              className="w-20 bg-[#0e121a] border border-[#1c2436] rounded px-2 py-1 text-right font-bold text-slate-100 text-xs outline-none focus:border-cyan-500"
            />
          </div>

          {/* Entry Type */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-400">Entry Type</span>
            <select
              value={execution.entryType}
              onChange={(e) => onUpdateExecution({ entryType: e.target.value })}
              className="bg-[#0e121a] border border-[#1c2436] rounded px-2 py-1 text-slate-200 text-xs outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="Market">Market (Taker)</option>
              <option value="Limit">Limit (Maker at Price)</option>
              <option value="Stop">Stop (Breakout Trigger)</option>
            </select>
          </div>

          {/* Fill Model */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-400">Fill Model</span>
            <select
              value={execution.fillModel}
              onChange={(e) => onUpdateExecution({ fillModel: e.target.value })}
              className="bg-[#0e121a] border border-[#1c2436] rounded px-2 py-1 text-slate-200 text-xs outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="Next Candle Open">Next Candle Open (Pessimistic)</option>
              <option value="Tick Best Bid/Ask">Tick Best Bid/Ask</option>
              <option value="Intrabar Worst Case">Intrabar Worst Case (SL First)</option>
            </select>
          </div>

          {/* Use Realistic Spread Toggle */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#151a24]">
            <span className="text-slate-300 font-bold">Use Realistic Spread</span>
            <button
              onClick={() =>
                onUpdateExecution({ useRealisticSpread: !execution.useRealisticSpread })
              }
              className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
                execution.useRealisticSpread ? 'bg-cyan-500' : 'bg-neutral-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-black transition-transform ${
                  execution.useRealisticSpread ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Use Variable Slippage Toggle */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-300 font-bold">Use Variable Slippage</span>
            <button
              onClick={() =>
                onUpdateExecution({ useVariableSlippage: !execution.useVariableSlippage })
              }
              className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
                execution.useVariableSlippage ? 'bg-cyan-500' : 'bg-neutral-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-black transition-transform ${
                  execution.useVariableSlippage ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
