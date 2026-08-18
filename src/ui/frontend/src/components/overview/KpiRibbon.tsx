import React from 'react';
import {
  Activity,
  FlaskConical,
  Target,
  Sparkles,
  ShieldCheck,
  Database,
} from 'lucide-react';
import { KpiMetric } from '../../types';

interface KpiRibbonProps {
  kpis: KpiMetric[];
}

export const KpiRibbon: React.FC<KpiRibbonProps> = ({ kpis }) => {
  const getIcon = (id: string) => {
    switch (id) {
      case 'kpi-health':
        return <Activity className="w-4 h-4 text-purple-400" />;
      case 'kpi-backtests':
        return <FlaskConical className="w-4 h-4 text-cyan-400" />;
      case 'kpi-strategies':
        return <Target className="w-4 h-4 text-emerald-400" />;
      case 'kpi-experiments':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'kpi-edges':
        return <ShieldCheck className="w-4 h-4 text-cyan-400" />;
      case 'kpi-trades':
        return <Database className="w-4 h-4 text-blue-400" />;
      default:
        return <Activity className="w-4 h-4 text-purple-400" />;
    }
  };

  const renderSparklineSvg = (values: number[], id: string) => {
    if (!values || values.length === 0) return null;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const width = 80;
    const height = 26;

    if (id === 'kpi-trades') {
      // Render mini vertical bars for trades analyzed
      const barWidth = width / values.length - 2;
      return (
        <svg width={width} height={height} className="overflow-visible">
          {values.map((v, i) => {
            const barH = Math.max(4, ((v - min) / range) * (height - 4));
            const x = i * (barWidth + 2);
            const y = height - barH;
            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={barWidth}
                height={barH}
                rx={1}
                className="fill-blue-500/70"
              />
            );
          })}
        </svg>
      );
    }

    const points = values
      .map((val, idx) => {
        const x = (idx / (values.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 6) - 3;
        return `${x},${y}`;
      })
      .join(' ');

    let strokeColor = '#8B5CF6'; // purple
    if (id === 'kpi-backtests' || id === 'kpi-edges') strokeColor = '#06B6D4'; // cyan
    if (id === 'kpi-strategies') strokeColor = '#10B981'; // emerald
    if (id === 'kpi-experiments') strokeColor = '#F59E0B'; // amber

    return (
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
      {kpis.map((kpi) => (
        <div
          key={kpi.id}
          className="quant-card p-3.5 flex flex-col justify-between relative overflow-hidden group hover:border-[#2A365E] transition shadow-sm"
        >
          {/* Header & Icon */}
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-medium truncate">{kpi.title}</span>
            <div className="p-1 rounded bg-[#161F38]/60">{getIcon(kpi.id)}</div>
          </div>

          {/* Value & Sparkline Row */}
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-white tracking-tight font-mono">
              {kpi.value}
            </span>
            <div className="opacity-90">{renderSparklineSvg(kpi.sparkline, kpi.id)}</div>
          </div>

          {/* Subtext Badge */}
          <div className="mt-2 text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
            {kpi.subtext.startsWith('●') ? (
              <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                {kpi.subtext.replace('●', '').trim()}
              </span>
            ) : kpi.subtext.startsWith('▲') ? (
              <span className="text-emerald-400 font-semibold">{kpi.subtext}</span>
            ) : (
              <span className="text-slate-400">{kpi.subtext}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
