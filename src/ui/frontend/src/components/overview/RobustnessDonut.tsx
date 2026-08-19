import React from 'react';
import ReactECharts from 'echarts-for-react';
import { RobustnessDistribution } from '../../types';

interface RobustnessDonutProps {
  data: RobustnessDistribution;
}

export const RobustnessDonut: React.FC<RobustnessDonutProps> = ({ data }) => {
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: '#050505',
      borderColor: '#262626',
      textStyle: { color: '#F1F5F9', fontSize: 11 },
      formatter: '{b}: <b>{c} ({d}%)</b>',
    },

    series: [
      {
        name: 'Robustness',
        type: 'pie',
        radius: ['58%', '78%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
        },
        labelLine: {
          show: false,
        },
        data: [
          { value: data.high_count, name: 'High (80-100)', itemStyle: { color: '#10B981' } },
          { value: data.medium_count, name: 'Medium (50-80)', itemStyle: { color: '#F59E0B' } },
          { value: data.low_count, name: 'Low (0-50)', itemStyle: { color: '#F43F5E' } },
        ],
      },
    ],
  };

  return (
    <div className="quant-card p-4 flex flex-col h-full">
      {/* Header */}
      <h2 className="text-sm font-bold text-white tracking-tight mb-2">
        Strategy Robustness Distribution
      </h2>

      {/* Donut Chart with Center Label & Legend */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-36 h-36 shrink-0">
          <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-lg font-extrabold text-white font-mono leading-tight">
              {data.total_strategies}
            </span>
            <span className="text-[9px] text-slate-400 font-medium">Strategies</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2 text-xs w-full">
          <div className="flex items-center justify-between text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-400">High (80-100)</span>
            </div>
            <span className="font-mono font-semibold text-white">
              {data.high_count} ({data.high_pct}%)
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-slate-400">Medium (50-80)</span>
            </div>
            <span className="font-mono font-semibold text-white">
              {data.medium_count} ({data.medium_pct}%)
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-slate-400">Low (0-50)</span>
            </div>
            <span className="font-mono font-semibold text-white">
              {data.low_count} ({data.low_pct}%)
            </span>
          </div>

          <div className="pt-2 border-t border-[#1a1a1a] text-[11px] text-slate-400 flex justify-between">
            <span>Average Robustness</span>
            <span className="font-bold text-emerald-400 font-mono">
              {data.average_robustness} / 100
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};
