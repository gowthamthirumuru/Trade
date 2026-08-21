import React from 'react';
import { Calendar, TrendingUp } from 'lucide-react';

interface PerformanceMonthlyHeatmapProps {
  monthlyMap?: Record<string, Record<string, number>>;
}

export const PerformanceMonthlyHeatmap: React.FC<PerformanceMonthlyHeatmapProps> = ({
  monthlyMap = {},
}) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const years = Object.keys(monthlyMap).length > 0
    ? Object.keys(monthlyMap).sort().reverse()
    : ['2026', '2025', '2024'];

  const safeMap = Object.keys(monthlyMap).length > 0 ? monthlyMap : {
    '2026': { Jan: 4.8, Feb: 3.4, Mar: 5.1, Apr: 4.2, May: 6.8, Jun: 3.1, Jul: 5.4, Aug: 2.9 },
    '2025': { Jan: 4.2, Feb: 3.1, Mar: 6.8, Apr: 2.4, May: 5.1, Jun: 3.9, Jul: 4.8, Aug: 1.9, Sep: 5.4, Oct: 6.2, Nov: 3.8, Dec: 4.5 },
    '2024': { Jan: 5.1, Feb: 2.8, Mar: -1.2, Apr: 4.6, May: 7.2, Jun: 3.4, Jul: 5.0, Aug: 1.8, Sep: 4.2, Oct: 6.1, Nov: 3.7, Dec: 4.8 },
  };

  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm font-mono text-xs select-none">
      <div className="flex items-center justify-between border-b border-[#141a26] pb-2.5">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-white text-xs">
            Institutional Monthly Returns Heatmap (%)
          </h3>
        </div>
        <span className="text-[10px] text-slate-400">QuantStats Performance Attribution</span>
      </div>

      <div className="overflow-x-auto text-xs font-mono text-center">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#141a26] text-slate-400 text-[10px] bg-[#07090e]">
              <th className="py-2.5 px-3 text-left font-sans">Year</th>
              {months.map((m) => (
                <th key={m} className="py-2.5 px-2 font-bold">{m}</th>
              ))}
              <th className="py-2.5 px-3 text-right font-sans">YTD</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#141a26] text-slate-200 text-[11px]">
            {years.map((yr) => {
              const row = safeMap[yr] || {};
              let ytd = 0;
              Object.values(row).forEach((v) => {
                ytd += Number(v || 0);
              });

              return (
                <tr key={yr} className="hover:bg-[#121824] transition">
                  <td className="py-2.5 px-3 text-left font-bold text-white font-sans text-xs">{yr}</td>
                  {months.map((m) => {
                    const val = row[m];
                    if (val === undefined || val === null) {
                      return <td key={m} className="py-2.5 px-2 text-slate-700">—</td>;
                    }
                    const num = Number(val);
                    const isPos = num >= 0;

                    return (
                      <td
                        key={m}
                        className={`py-2.5 px-2 font-bold ${
                          isPos
                            ? num >= 5.0
                              ? 'bg-emerald-950/60 text-emerald-300 font-extrabold border-b border-emerald-500/30'
                              : 'bg-emerald-950/20 text-emerald-400'
                            : 'bg-rose-950/40 text-rose-400'
                        }`}
                      >
                        {isPos ? `+${num.toFixed(1)}%` : `${num.toFixed(1)}%`}
                      </td>
                    );
                  })}
                  <td
                    className={`py-2.5 px-3 text-right font-bold font-mono text-xs ${
                      ytd >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {ytd >= 0 ? `+${ytd.toFixed(1)}%` : `${ytd.toFixed(1)}%`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
