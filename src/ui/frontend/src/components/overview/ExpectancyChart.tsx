import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { ChevronDown } from 'lucide-react';
import { ExpectancyPoint } from '../../types';

interface ExpectancyChartProps {
  data: ExpectancyPoint[];
  onStrategyChange?: (strat: string) => void;
}

export const ExpectancyChart: React.FC<ExpectancyChartProps> = ({ data, onStrategyChange }) => {
  const [selectedStrategy, setSelectedStrategy] = useState('All Strategies');
  const [chartData, setChartData] = useState<ExpectancyPoint[]>(data);

  useEffect(() => {
    setChartData(data);
  }, [data]);

  const handleSelectChange = (strat: string) => {
    setSelectedStrategy(strat);
    if (onStrategyChange) {
      onStrategyChange(strat);
    } else {
      // Dynamic local computation fallback
      const dates = ["Nov '24", "Dec '24", "Jan '25", "Feb '25", "Mar '25", "Apr '25", "May '25"];
      let vals = [0.15, 0.38, 0.58, 0.68, 0.82, 0.88, 0.92];
      if (strat === 'BB Reversion v4') vals = [0.42, 0.55, 0.71, 0.79, 0.85, 0.88, 0.91];
      if (strat === 'Order Block v4') vals = [0.35, 0.48, 0.62, 0.70, 0.74, 0.76, 0.78];
      if (strat === 'Liquidity Sweep v3') vals = [0.28, 0.41, 0.52, 0.59, 0.61, 0.64, 0.66];
      if (strat === 'London Breakout v2') vals = [0.31, 0.39, 0.44, 0.51, 0.55, 0.58, 0.59];
      setChartData(dates.map((d, i) => ({ date: d, expectancy: vals[i], strategy: strat })));
    }
  };

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#101426',
      borderColor: '#2A365E',
      textStyle: { color: '#F1F5F9', fontSize: 11 },
      formatter: (params: any) => {
        const item = params[0];
        const val = item.value;
        const color = val >= 0 ? '#10B981' : '#F43F5E';
        return `
          <div style="font-weight: bold; margin-bottom: 2px;">${item.axisValue}</div>
          <div style="color: ${color}; font-family: monospace;">
            Expectancy: ${val >= 0 ? '+' : ''}${val.toFixed(2)}R
          </div>
        `;
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      top: '12%',
      bottom: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: chartData.map((d) => d.date),
      axisLine: { lineStyle: { color: '#161F38' } },
      axisTick: { show: false },
      axisLabel: { color: '#64748B', fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      min: -1.0,
      max: 1.5,
      interval: 0.5,
      axisLabel: {
        color: '#64748B',
        fontSize: 10,
        fontFamily: 'monospace',
        formatter: (val: number) => val.toFixed(2),
      },
      splitLine: {
        lineStyle: { color: '#161F38', type: 'dashed' },
      },
    },
    series: [
      {
        name: 'Expectancy (R)',
        type: 'line',
        smooth: true,
        showSymbol: false,
        symbolSize: 6,
        data: chartData.map((d) => d.expectancy),
        lineStyle: {
          color: '#8B5CF6',
          width: 2.5,
          shadowColor: 'rgba(139, 92, 246, 0.4)',
          shadowBlur: 10,
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(139, 92, 246, 0.25)' },
              { offset: 1, color: 'rgba(139, 92, 246, 0.0)' },
            ],
          },
        },
      },
    ],
  };

  return (
    <div className="quant-card p-4 flex flex-col h-full">
      {/* Header with dropdown */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold text-white tracking-tight">
          Expectancy Over Time <span className="text-slate-400 font-normal text-xs">({selectedStrategy})</span>
        </h2>
        <div className="relative">
          <select
            value={selectedStrategy}
            onChange={(e) => handleSelectChange(e.target.value)}
            className="appearance-none bg-[#0B0E17] border border-[#161F38] rounded-md px-2.5 py-1 pr-7 text-xs text-slate-300 hover:border-slate-700 outline-none cursor-pointer font-medium"
          >
            <option value="All Strategies">All Strategies</option>
            <option value="BB Reversion v4">BB Reversion v4</option>
            <option value="Order Block v4">Order Block v4</option>
            <option value="Liquidity Sweep v3">Liquidity Sweep v3</option>
            <option value="London Breakout v2">London Breakout v2</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2 top-2 pointer-events-none" />
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-[190px]">
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
      </div>
    </div>
  );
};
