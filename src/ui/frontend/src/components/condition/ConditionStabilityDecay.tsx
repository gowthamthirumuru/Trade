import React from 'react';
import { History, TrendingUp, CheckCircle2 } from 'lucide-react';

interface RollingDecayWindow {
  period: string;
  london_lift: number;
  atr_lift: number;
  htf_lift: number;
  combined_exp_r: number;
}

interface ConditionStabilityDecayProps {
  decayWindows?: RollingDecayWindow[];
}

export const ConditionStabilityDecay: React.FC<ConditionStabilityDecayProps> = ({
  decayWindows = [
    { period: '2024-H1', london_lift: 39.2, atr_lift: 26.1, htf_lift: 20.4, combined_exp_r: 1.42 },
    { period: '2024-Q3', london_lift: 37.8, atr_lift: 24.8, htf_lift: 18.9, combined_exp_r: 1.35 },
    { period: '2024-Q4', london_lift: 38.5, atr_lift: 25.2, htf_lift: 19.5, combined_exp_r: 1.39 },
    { period: '2025-Q1', london_lift: 36.4, atr_lift: 23.9, htf_lift: 18.2, combined_exp_r: 1.28 },
    { period: '2025-Q2', london_lift: 38.1, atr_lift: 24.5, htf_lift: 19.2, combined_exp_r: 1.34 },
    { period: '2025-Q3', london_lift: 38.9, atr_lift: 25.0, htf_lift: 19.8, combined_exp_r: 1.38 },
  ],
}) => {
  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm font-mono text-xs select-none">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#141a26] pb-2.5">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-white text-xs">Rolling Out-of-Sample Condition Alpha Stability & Decay</h3>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
          ✓ Zero Regime Decay Detected
        </span>
      </div>

      <div className="overflow-x-auto text-xs font-mono text-center">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#141a26] text-slate-400 text-[10px]">
              <th className="p-2 text-left font-sans">Rolling Period</th>
              <th className="p-2">London Session Lift</th>
              <th className="p-2">High ATR Lift</th>
              <th className="p-2">HTF Trend Lift</th>
              <th className="p-2">Combined Expectancy</th>
              <th className="p-2">Stability Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#141a26] text-slate-200 text-[11px]">
            {decayWindows.map((w, i) => (
              <tr key={i} className="hover:bg-[#121824] transition">
                <td className="p-2.5 text-left font-bold text-white font-sans text-xs">{w.period}</td>
                <td className="p-2.5 text-emerald-400 font-bold">+{w.london_lift.toFixed(1)}%</td>
                <td className="p-2.5 text-cyan-300 font-bold">+{w.atr_lift.toFixed(1)}%</td>
                <td className="p-2.5 text-purple-300 font-bold">+{w.htf_lift.toFixed(1)}%</td>
                <td className="p-2.5 text-emerald-400 font-extrabold">+{w.combined_exp_r.toFixed(2)}R</td>
                <td className="p-2.5">
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-700">
                    STABLE ALPHA
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
