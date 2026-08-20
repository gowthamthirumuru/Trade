import React from 'react';
import {
  FileCode2,
  CheckCircle2,
  AlertTriangle,
  Flame,
  GitBranch,
  Dice5,
  BarChart3,
  Check,
} from 'lucide-react';

export interface DataSplitInfo {
  train?: { range: string; pct: number; days: number };
  validate?: { range: string; pct: number; days: number };
  oos?: { range: string; pct: number; days: number };
}

interface BacktestResearchContractProps {
  strategyName: string;
  instrument: string;
  timeframe: string;
  startDate: string;
  endDate: string;
  totalCandles: number;
  totalTrades: number;
  engineTime: string;
  completedTime: string;
  integrityScore?: number;
  dataSplit?: DataSplitInfo;
}

export const BacktestResearchContract: React.FC<BacktestResearchContractProps> = ({
  strategyName,
  instrument,
  timeframe,
  startDate,
  endDate,
  totalCandles = 8421264,
  totalTrades = 4821,
  engineTime = '00:03:42',
  completedTime = 'May 26, 2025 10:42',
  integrityScore = 97,
  dataSplit = {
    train: { range: '2004-01-01 → 2018-12-31', pct: 60, days: 8671 },
    validate: { range: '2019-01-01 → 2022-12-31', pct: 20, days: 1460 },
    oos: { range: '2023-01-01 → 2026-08-19', pct: 20, days: 1320 },
  },
}) => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-3.5 font-mono text-xs select-none">
      {/* ========================================================================= */}
      {/* 1. RESEARCH CONTRACT CARD (5 Cols) */}
      {/* ========================================================================= */}
      <div className="xl:col-span-5 bg-[#0b0e14] border border-[#161c28] rounded-xl p-3.5 space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#141a26] pb-2">
          <h3 className="font-bold text-white flex items-center gap-1.5 text-xs">
            <FileCode2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Research Contract</span>
          </h3>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400">Research Integrity Score:</span>
            <span className="text-emerald-400 font-extrabold text-xs">{integrityScore} / 100</span>
          </div>
        </div>

        {/* 2-Column Key/Value Grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px]">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Strategy:</span>
            <span className="text-white font-bold">{strategyName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Commission:</span>
            <span className="text-slate-200">$7.00 / lot / side</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Dataset:</span>
            <span className="text-cyan-300 font-bold">{instrument} {timeframe}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Risk Model:</span>
            <span className="text-slate-200">0.50% Fixed Fractional</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Data Range:</span>
            <span className="text-slate-300 font-mono">{startDate} → {endDate}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Compounding:</span>
            <span className="text-emerald-400 font-bold">Enabled</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Train / Validate / OOS:</span>
            <span className="text-slate-200">60% / 20% / 20%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Intrabar Model:</span>
            <span className="text-cyan-300">1m Lower TF</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Execution Model:</span>
            <span className="text-slate-200">Realistic (Variable Spread)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Lookahead Check:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-0.5">
              <Check className="w-2.5 h-2.5" /> Passed
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Slippage Model:</span>
            <span className="text-slate-200">Volatility-Based</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Data Leakage Check:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-0.5">
              <Check className="w-2.5 h-2.5" /> Passed
            </span>
          </div>
        </div>

        {/* Visual Progress Bar for Integrity */}
        <div className="space-y-1 border-t border-[#141a26] pt-2">
          <div className="w-full bg-[#07090e] h-1.5 rounded-full overflow-hidden border border-[#1a2232]">
            <div
              style={{ width: `${integrityScore}%` }}
              className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full shadow-sm"
            ></div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DATA SPLIT CARD (3 Cols) */}
      {/* ========================================================================= */}
      <div className="xl:col-span-3 bg-[#0b0e14] border border-[#161c28] rounded-xl p-3.5 space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#141a26] pb-2">
          <h3 className="font-bold text-white flex items-center gap-1.5 text-xs">
            <span>Data Split</span>
          </h3>
          <span className="text-[10px] text-cyan-400 font-bold">3-Way Protocol</span>
        </div>

        {/* 3-Segment Progress Bar */}
        <div className="flex items-center h-5 w-full rounded-md overflow-hidden font-bold text-[10px] text-black">
          <div
            style={{ width: `${dataSplit.train?.pct || 60}%` }}
            className="bg-cyan-400 h-full flex items-center justify-center"
          >
            {dataSplit.train?.pct || 60}%
          </div>
          <div
            style={{ width: `${dataSplit.validate?.pct || 20}%` }}
            className="bg-indigo-400 h-full flex items-center justify-center text-white"
          >
            {dataSplit.validate?.pct || 20}%
          </div>
          <div
            style={{ width: `${dataSplit.oos?.pct || 20}%` }}
            className="bg-rose-500 h-full flex items-center justify-center text-white"
          >
            {dataSplit.oos?.pct || 20}%
          </div>
        </div>

        {/* Detail Breakdown */}
        <div className="space-y-1 text-[10px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span className="text-cyan-300 font-bold">Train ({dataSplit.train?.range || '2004-01-01 → 2018-12-31'})</span>
            <span className="text-slate-500 ml-auto">60% ({(dataSplit.train?.days || 8671).toLocaleString()} days)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
            <span className="text-indigo-300 font-bold">Validate ({dataSplit.validate?.range || '2019-01-01 → 2022-12-31'})</span>
            <span className="text-slate-500 ml-auto">20% ({(dataSplit.validate?.days || 1460).toLocaleString()} days)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span className="text-rose-300 font-bold">Out-of-Sample ({dataSplit.oos?.range || '2023-01-01 → 2026-08-19'})</span>
            <span className="text-slate-500 ml-auto">20% ({(dataSplit.oos?.days || 1320).toLocaleString()} days)</span>
          </div>
        </div>

        {/* OOS Alert Badge */}
        <div className="bg-amber-950/40 border border-amber-800/60 rounded-lg p-2 text-[9px] text-amber-300 flex items-start gap-1.5">
          <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
          <span>OOS data has not been used for optimization.</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. QUICK ACTIONS CARD (2 Cols) */}
      {/* ========================================================================= */}
      <div className="xl:col-span-2 bg-[#0b0e14] border border-[#161c28] rounded-xl p-3.5 space-y-2 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#141a26] pb-2">
          <h3 className="font-bold text-white text-xs">Quick Actions</h3>
        </div>

        <div className="space-y-1.5">
          <a
            href="#robustness"
            className="flex items-center gap-2 p-1.5 bg-[#0e121a] hover:bg-[#151c2a] border border-[#1c2436] rounded-lg text-slate-300 hover:text-white transition text-[10px]"
          >
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <div>
              <div className="font-bold text-slate-200">Try To Break It</div>
              <div className="text-[8px] text-slate-500">Run full robustness suite</div>
            </div>
          </a>

          <a
            href="#walk_forward"
            className="flex items-center gap-2 p-1.5 bg-[#0e121a] hover:bg-[#151c2a] border border-[#1c2436] rounded-lg text-slate-300 hover:text-white transition text-[10px]"
          >
            <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
            <div>
              <div className="font-bold text-slate-200">Run Walk-Forward</div>
              <div className="text-[8px] text-slate-500">Generate WF analysis</div>
            </div>
          </a>

          <a
            href="#monte_carlo"
            className="flex items-center gap-2 p-1.5 bg-[#0e121a] hover:bg-[#151c2a] border border-[#1c2436] rounded-lg text-slate-300 hover:text-white transition text-[10px]"
          >
            <Dice5 className="w-3.5 h-3.5 text-amber-400" />
            <div>
              <div className="font-bold text-slate-200">Monte Carlo</div>
              <div className="text-[8px] text-slate-500">Run MC simulations</div>
            </div>
          </a>

          <a
            href="#strategy_comparison"
            className="flex items-center gap-2 p-1.5 bg-[#0e121a] hover:bg-[#151c2a] border border-[#1c2436] rounded-lg text-slate-300 hover:text-white transition text-[10px]"
          >
            <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
            <div>
              <div className="font-bold text-slate-200">Compare Strategies</div>
              <div className="text-[8px] text-slate-500">Compare performance</div>
            </div>
          </a>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. BACKTEST RUN SUMMARY CARD (2 Cols) */}
      {/* ========================================================================= */}
      <div className="xl:col-span-2 bg-[#0b0e14] border border-[#161c28] rounded-xl p-3.5 space-y-2.5 shadow-sm">
        <div className="flex items-center gap-1.5 text-emerald-400 font-extrabold text-xs border-b border-[#141a26] pb-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Backtest Completed</span>
        </div>

        <div className="space-y-1.5 text-[10px]">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Completed on</span>
            <span className="text-slate-200 font-bold">{completedTime}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Engine Time</span>
            <span className="text-slate-200 font-bold font-mono">{engineTime}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Total Candles</span>
            <span className="text-cyan-300 font-bold font-mono">{totalCandles.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Total Trades</span>
            <span className="text-emerald-400 font-extrabold font-mono">{totalTrades.toLocaleString()}</span>
          </div>
        </div>

        <div className="border-t border-[#141a26] pt-1.5 text-center">
          <a href="#trades" className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold">
            View Run Log &rarr;
          </a>
        </div>
      </div>
    </div>
  );
};
