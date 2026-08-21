import React, { useState } from 'react';
import { Binary, Sparkles, Filter, CheckCircle2 } from 'lucide-react';

interface PatternItem {
  id: string;
  pattern: string;
  category: string;
  frequency: number;
  win_rate: number;
  avg_r: number;
  lift: string;
  optimal_entry: string;
  stop_loss: string;
  take_profit: string;
}

interface PatternMiningCardProps {
  patterns?: PatternItem[];
}

export const PatternMiningCard: React.FC<PatternMiningCardProps> = ({
  patterns = [
    {
      id: 'PAT-01',
      pattern: 'Order Block (Bullish 15m Retest)',
      category: 'SMC Structural',
      frequency: 1420,
      win_rate: 64.2,
      avg_r: 1.15,
      lift: '+24.0%',
      optimal_entry: 'Limit order at 50% OB equilibrium',
      stop_loss: '0.5 ATR below OB low',
      take_profit: 'Next opposing swing liquidity pool (3R)',
    },
    {
      id: 'PAT-02',
      pattern: 'Asian High Liquidity Sweep Fade',
      category: 'SMC Liquidity',
      frequency: 890,
      win_rate: 68.8,
      avg_r: 1.42,
      lift: '+38.5%',
      optimal_entry: 'Market order upon 15m candle close back inside range',
      stop_loss: 'High of sweep wick + 2 pips',
      take_profit: 'Asian Range Equilibrium & Asian Low',
    },
    {
      id: 'PAT-03',
      pattern: 'Fair Value Gap (FVG 15m Fade)',
      category: 'Imbalance',
      frequency: 1120,
      win_rate: 58.5,
      avg_r: 0.78,
      lift: '+15.2%',
      optimal_entry: 'Consequent Encroachment (50% FVG)',
      stop_loss: 'Candle 1 high/low boundary',
      take_profit: 'Liquidity pool or 2.0R target',
    },
    {
      id: 'PAT-04',
      pattern: 'Break of Structure (BOS + Retest)',
      category: 'Trend Continuation',
      frequency: 2100,
      win_rate: 54.1,
      avg_r: 0.52,
      lift: '+8.4%',
      optimal_entry: 'Retest of broken swing high/low',
      stop_loss: 'Prior higher low',
      take_profit: '1.618 Fibonacci extension',
    },
    {
      id: 'PAT-05',
      pattern: 'Wyckoff Spring (Accumulation Phase C)',
      category: 'Wyckoff',
      frequency: 640,
      win_rate: 71.4,
      avg_r: 1.85,
      lift: '+46.2%',
      optimal_entry: 'Test of Spring low with decreasing volume',
      stop_loss: 'Below Spring low wick',
      take_profit: 'Sign of Strength (SOS) & Range High',
    },
  ],
}) => {
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const categories = ['ALL', 'SMC Structural', 'SMC Liquidity', 'Imbalance', 'Trend Continuation', 'Wyckoff'];

  const filteredPatterns = patterns.filter(
    (p) => selectedCategory === 'ALL' || p.category === selectedCategory
  );

  return (
    <div className="space-y-4 font-mono text-xs select-none">
      {/* Filter Category Bar */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center gap-2">
          <Binary className="w-4 h-4 text-purple-400" />
          <h3 className="font-bold text-white text-xs">Automated Structural Pattern Mining Scanner</h3>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-purple-950 text-purple-300 border border-purple-700 font-extrabold'
                  : 'bg-[#07090e] border border-[#1a2232] text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Discovered Patterns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPatterns.map((p) => (
          <div
            key={p.id}
            className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm hover:border-purple-500/40 transition group"
          >
            <div className="flex justify-between items-center">
              <span className="font-mono text-purple-400 font-bold text-xs">
                {p.id} • {p.category}
              </span>
              <span className="px-2 py-0.5 text-[10px] font-extrabold bg-emerald-950 text-emerald-400 border border-emerald-800 rounded font-mono">
                {p.lift} Alpha Lift
              </span>
            </div>

            <h4 className="font-bold text-white text-sm group-hover:text-purple-300 transition">
              {p.pattern}
            </h4>

            <div className="grid grid-cols-3 gap-2 font-mono text-center pt-1 border-t border-[#141a26]">
              <div className="p-2 bg-[#07090e] rounded-lg">
                <span className="text-[9px] text-slate-400 block">Frequency</span>
                <span className="text-white font-bold text-xs">{p.frequency} Bars</span>
              </div>
              <div className="p-2 bg-[#07090e] rounded-lg">
                <span className="text-[9px] text-slate-400 block">Win Rate</span>
                <span className="text-emerald-400 font-extrabold text-xs">{p.win_rate}%</span>
              </div>
              <div className="p-2 bg-[#07090e] rounded-lg">
                <span className="text-[9px] text-slate-400 block">Avg Expectancy</span>
                <span className="text-purple-300 font-bold text-xs">+{p.avg_r}R</span>
              </div>
            </div>

            <div className="space-y-1.5 text-[11px] p-3 bg-[#07090e] rounded-lg border border-[#141a26] text-slate-300 font-mono">
              <div>
                <span className="text-slate-500 font-sans font-bold">Optimal Entry: </span>
                <span className="text-slate-200">{p.optimal_entry}</span>
              </div>
              <div>
                <span className="text-slate-500 font-sans font-bold">Stop Loss: </span>
                <span className="text-rose-400">{p.stop_loss}</span>
              </div>
              <div>
                <span className="text-slate-500 font-sans font-bold">Take Profit: </span>
                <span className="text-emerald-400">{p.take_profit}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
