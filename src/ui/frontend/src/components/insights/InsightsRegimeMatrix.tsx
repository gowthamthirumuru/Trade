import React from 'react';
import { Layers, ShieldCheck, Activity } from 'lucide-react';

export const InsightsRegimeMatrix: React.FC = () => {
  const regimes = [
    {
      asset: 'XAUUSD',
      regime: 'High-Vol Mean Reverting',
      atr: '3.99 pts (+29.8%)',
      dominant_factor: 'Bollinger 2.5σ Channel Reversion',
      optimal_model: 'BB Reversion v4',
      status: 'OVERWEIGHT',
      status_color: 'bg-emerald-950 text-emerald-300 border-emerald-700',
    },
    {
      asset: 'EURUSD',
      regime: 'Consolidation / Range Squeeze',
      atr: '0.0042 (Compressed)',
      dominant_factor: 'Institutional Order Block Retest',
      optimal_model: 'Order Block v4',
      status: 'NEUTRAL',
      status_color: 'bg-cyan-950 text-cyan-300 border-cyan-700',
    },
    {
      asset: 'GBPUSD',
      regime: 'Session Breakout Expansion',
      atr: '0.0078 (Expanded)',
      dominant_factor: 'London Open Range Expansion',
      optimal_model: 'London Breakout v2',
      status: 'OVERWEIGHT',
      status_color: 'bg-emerald-950 text-emerald-300 border-emerald-700',
    },
    {
      asset: 'BTCUSDT',
      regime: 'High-Vol Bullish Trend',
      atr: '1,420 pts (48.2% Ann. Vol)',
      dominant_factor: 'HTF Liquidity Sweep & Stop Run',
      optimal_model: 'Liquidity Sweep v3',
      status: 'OVERWEIGHT',
      status_color: 'bg-emerald-950 text-emerald-300 border-emerald-700',
    },
    {
      asset: 'USDJPY',
      regime: 'Macro Carry / Low Volatility',
      atr: '0.62 pts (Normal)',
      dominant_factor: 'Trend Following Moving Average',
      optimal_model: 'EMA Trend Tracker v2',
      status: 'THROTTLED',
      status_color: 'bg-amber-950 text-amber-300 border-amber-700',
    },
  ];

  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm font-mono text-xs select-none">
      <div className="flex items-center justify-between border-b border-[#141a26] pb-2.5">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <h3 className="font-bold text-white text-xs">
            Cross-Asset Market Regime &amp; Strategy Allocation Matrix
          </h3>
        </div>
        <span className="text-[10px] text-slate-400">Point-in-Time Regime Classifier (Layer 11)</span>
      </div>

      <div className="overflow-x-auto text-xs font-mono">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#141a26] text-slate-400 text-[10px] bg-[#07090e]">
              <th className="py-2.5 px-3">Asset</th>
              <th className="py-2.5 px-3">Active Market Regime</th>
              <th className="py-2.5 px-3">Volatility State</th>
              <th className="py-2.5 px-3">Dominant Alpha Factor</th>
              <th className="py-2.5 px-3">Optimal Model Deployment</th>
              <th className="py-2.5 px-3 text-center">Capital Allocation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#141a26] text-slate-200 text-[11px]">
            {regimes.map((r) => (
              <tr key={r.asset} className="hover:bg-[#121824] transition">
                <td className="py-2.5 px-3 font-bold text-white">{r.asset}</td>
                <td className="py-2.5 px-3 text-amber-300 font-bold">{r.regime}</td>
                <td className="py-2.5 px-3 text-slate-300">{r.atr}</td>
                <td className="py-2.5 px-3 text-slate-400 font-sans">{r.dominant_factor}</td>
                <td className="py-2.5 px-3 font-bold text-cyan-400">{r.optimal_model}</td>
                <td className="py-2.5 px-3 text-center">
                  <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded border ${r.status_color}`}>
                    {r.status}
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
