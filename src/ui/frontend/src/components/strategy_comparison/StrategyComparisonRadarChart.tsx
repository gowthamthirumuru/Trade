import React from 'react';
import ReactECharts from 'echarts-for-react';
import { GitCompare } from 'lucide-react';

export interface RadarIndicator {
  name: string;
  max: number;
}

export interface RadarSeriesItem {
  name: string;
  value: number[];
  itemStyle?: { color: string };
}

interface StrategyComparisonRadarChartProps {
  indicators?: RadarIndicator[];
  series?: RadarSeriesItem[];
}

export const StrategyComparisonRadarChart: React.FC<StrategyComparisonRadarChartProps> = ({
  indicators,
  series,
}) => {
  const safeIndicators = indicators || [
    { name: 'Sharpe Ratio', max: 3.0 },
    { name: 'Profit Factor', max: 3.0 },
    { name: 'Win Rate (%)', max: 100 },
    { name: 'Drawdown Resilience', max: 100 },
    { name: 'WFER (%)', max: 100 },
    { name: 'Smoothness (R²)', max: 100 },
  ];

  const safeSeries = series || [
    { name: 'BB Reversion v4', value: [2.18, 2.18, 62.4, 91.6, 81.4, 88.5], itemStyle: { color: '#10B981' } },
    { name: 'Order Block v4', value: [1.92, 1.92, 64.4, 90.9, 78.2, 84.0], itemStyle: { color: '#06B6D4' } },
    { name: 'London Breakout v2', value: [1.72, 1.72, 54.1, 92.4, 83.1, 86.2], itemStyle: { color: '#8B5CF6' } },
    { name: 'Liquidity Sweep v3', value: [1.81, 1.81, 58.7, 89.8, 75.6, 81.5], itemStyle: { color: '#F59E0B' } },
  ];

  const radarOption = {
    backgroundColor: 'transparent',
    tooltip: {
      backgroundColor: '#0b0e14',
      borderColor: '#1e293b',
      textStyle: { color: '#f8fafc', fontFamily: 'monospace', fontSize: 11 },
    },
    legend: {
      data: safeSeries.map((s) => s.name),
      textStyle: { color: '#94A3B8', fontFamily: 'monospace', fontSize: 10 },
      bottom: '0%',
    },
    radar: {
      indicator: safeIndicators,
      splitLine: { lineStyle: { color: '#161c28' } },
      splitArea: { show: true, areaStyle: { color: ['#07090e', '#0b0e14'] } },
      axisLine: { lineStyle: { color: '#1a2232' } },
      axisName: { color: '#94A3B8', fontFamily: 'monospace', fontSize: 10 },
      radius: '65%',
      center: ['50%', '45%'],
    },
    series: [
      {
        name: 'Strategy Comparison',
        type: 'radar',
        data: safeSeries.map((s) => ({
          name: s.name,
          value: s.value,
          itemStyle: s.itemStyle,
          lineStyle: { width: 2 },
          areaStyle: { opacity: 0.15 },
        })),
      },
    ],
  };

  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm font-mono text-xs select-none flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-[#141a26] pb-2.5">
        <div className="flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-indigo-400" />
          <h3 className="font-bold text-white text-xs">
            Multi-Strategy Attribute Radar
          </h3>
        </div>
        <span className="text-[10px] text-slate-400">6-Dimensional Quant Profiles</span>
      </div>

      <div className="h-[300px] w-full">
        <ReactECharts option={radarOption} style={{ height: '100%', width: '100%' }} />
      </div>

      <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-[#141a26] pt-2 px-1">
        <span>Drawdown Resilience = 100 - MaxDD%</span>
        <span className="text-indigo-400 font-bold">Comprehensive Multi-Factor Edge</span>
      </div>
    </div>
  );
};
