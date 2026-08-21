import React from 'react';
import { GitCompare, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface CorrelationHeatmapProps {
  strategies: string[];
  matrix: number[][];
  selectedPairIndices: [number, number];
  onSelectPair: (i: number, j: number) => void;
}

export const CorrelationHeatmap: React.FC<CorrelationHeatmapProps> = ({
  strategies,
  matrix,
  selectedPairIndices,
  onSelectPair,
}) => {
  const strats = strategies.length > 0 ? strategies : [
    'BB Reversion v4',
    'Order Block v4',
    'Liquidity Sweep v3',
    'London Breakout v2',
    'EMA Trend v2',
    'FVG Fade v1',
  ];

  const mat = matrix.length > 0 ? matrix : [
    [1.00, 0.18, 0.12, 0.08, 0.24, 0.15],
    [0.18, 1.00, 0.42, 0.15, 0.31, 0.22],
    [0.12, 0.42, 1.00, 0.22, 0.09, 0.18],
    [0.08, 0.15, 0.22, 1.00, 0.14, 0.07],
    [0.24, 0.31, 0.09, 0.14, 1.00, 0.19],
    [0.15, 0.22, 0.18, 0.07, 0.19, 1.00],
  ];

  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm font-mono text-xs select-none flex flex-col justify-between">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#141a26] pb-2.5">
        <div className="flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-purple-400" />
          <h3 className="font-bold text-white text-xs">Cross-Strategy Pairwise Correlation Heatmap</h3>
        </div>
        <span className="text-[10px] text-slate-400">Click any pair cell to inspect return scatter</span>
      </div>

      <div className="overflow-x-auto text-xs font-mono text-center py-1">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#141a26] text-slate-400 text-[10px]">
              <th className="p-2 text-left">Strategy Model</th>
              {strats.map((s, idx) => (
                <th key={s} className="p-2 text-purple-300 font-bold max-w-[80px] truncate" title={s}>
                  M{idx + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#141a26] text-slate-200 text-[11px]">
            {strats.map((sName, i) => (
              <tr key={sName} className="hover:bg-[#121824] transition">
                <td className="p-2.5 text-left font-bold text-white text-xs flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-[#161f30] text-purple-300 font-extrabold text-[10px] flex items-center justify-center border border-[#233148]">
                    M{i + 1}
                  </span>
                  <span className="truncate max-w-[160px]" title={sName}>
                    {sName}
                  </span>
                </td>
                {mat[i] &&
                  mat[i].map((corrVal, j) => {
                    const isDiagonal = i === j;
                    const isSelected =
                      (selectedPairIndices[0] === i && selectedPairIndices[1] === j) ||
                      (selectedPairIndices[0] === j && selectedPairIndices[1] === i);

                    return (
                      <td
                        key={j}
                        onClick={() => onSelectPair(i, j)}
                        className={`p-2.5 font-bold cursor-pointer transition ${
                          isSelected
                            ? 'ring-2 ring-purple-500 bg-purple-950/40'
                            : isDiagonal
                            ? 'text-emerald-400 bg-emerald-950/20 font-extrabold'
                            : corrVal >= 0.65
                            ? 'text-rose-400 bg-rose-950/30'
                            : corrVal >= 0.35
                            ? 'text-amber-300 bg-amber-950/15'
                            : 'text-cyan-300 hover:bg-[#161f30]'
                        }`}
                        title={`${strats[i]} vs ${strats[j]}: r = ${corrVal}`}
                      >
                        {corrVal.toFixed(2)}
                      </td>
                    );
                  })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-400 border-t border-[#141a26] pt-2 px-1 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded bg-emerald-500/80"></span>
          <span>r &le; 0.20 (Orthogonal Alpha)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded bg-amber-500/80"></span>
          <span>0.20 &lt; r &lt; 0.65 (Moderate)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded bg-rose-500/80"></span>
          <span>r &ge; 0.65 (Redundancy Warning)</span>
        </div>
      </div>
    </div>
  );
};
