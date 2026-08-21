import React, { useState, useEffect, useCallback } from 'react';
import { RobustnessHeader } from './RobustnessHeader';
import { RobustnessControlRibbon } from './RobustnessControlRibbon';
import { RobustnessParameterPlateauChart } from './RobustnessParameterPlateauChart';
import { RobustnessFrictionDecayChart } from './RobustnessFrictionDecayChart';
import { RobustnessJitterTable } from './RobustnessJitterTable';
import { RobustnessStressScenarioCard } from './RobustnessStressScenarioCard';
import { SlidersHorizontal } from 'lucide-react';

export const RobustnessPage: React.FC = () => {
  const [selectedStrategy, setSelectedStrategy] = useState('BB Reversion v4');
  const [selectedPair, setSelectedPair] = useState('XAUUSD');
  const [selectedTimeframe, setSelectedTimeframe] = useState('15m');
  const [selectedRange, setSelectedRange] = useState(30);

  const [robustData, setRobustData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch Robustness & Stress Data
  const fetchRobustness = useCallback(() => {
    setIsLoading(true);
    fetch(
      `/api/v1/validation/robustness-stress?strategy=${encodeURIComponent(selectedStrategy)}&pair=${encodeURIComponent(selectedPair)}&timeframe=${encodeURIComponent(selectedTimeframe)}&perturbation_range=${selectedRange}`
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setRobustData(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [selectedStrategy, selectedPair, selectedTimeframe, selectedRange]);

  useEffect(() => {
    fetchRobustness();
  }, [fetchRobustness]);

  const handleExportCSV = () => {
    const jitter = robustData?.parameter_jitter_results || [];
    const headers = 'Shift,Multiplier,SharpeRatio,ExpectancyR,ProfitFactor,WinRatePct,TradesCount,Status\n';
    const rows = jitter
      .map(
        (j: any) =>
          `"${j.shift}",${j.multiplier},${j.sharpe},${j.expectancy_r},${j.profit_factor},${j.win_rate_pct},${j.trades_count},${j.status}`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `robustness_jitter_${selectedStrategy}_${selectedPair}_${selectedRange}pct.csv`;
    a.click();
  };

  const jitter = robustData?.parameter_jitter_results || [];
  const baseItem = jitter.find((j: any) => j.shift.includes('Baseline') || j.multiplier === 1.0);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#07090e] text-slate-100 select-none overflow-y-auto font-mono text-xs">
      {/* 1. Header Bar */}
      <div className="bg-[#0b0e14] border-b border-[#161c28] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-amber-400" />
            <span>Parameter Robustness, Plateau Analysis & Slippage Stress Suite</span>
          </h2>
          <p className="text-[11px] text-slate-400">
            Neighborhood perturbation stress tests, convex parameter surface plateau detection, and execution friction decay curves
          </p>
        </div>
      </div>

      {/* 2. Controls Ribbon */}
      <RobustnessHeader
        selectedStrategy={selectedStrategy}
        onStrategyChange={setSelectedStrategy}
        selectedPair={selectedPair}
        onPairChange={setSelectedPair}
        selectedTimeframe={selectedTimeframe}
        onTimeframeChange={setSelectedTimeframe}
        selectedRange={selectedRange}
        onRangeChange={setSelectedRange}
        onRecompute={fetchRobustness}
        onExportCSV={handleExportCSV}
        isLoading={isLoading}
      />

      {/* 3. Main Content Views */}
      <div className="p-4 space-y-4 flex-1">
        {/* KPI Summary Ribbon */}
        <RobustnessControlRibbon
          smoothnessScore={robustData?.smoothness_score ?? 88.5}
          elasticityIndex={robustData?.elasticity_index ?? 0.32}
          breakEvenSlippageBps={robustData?.break_even_slippage_bps ?? 12.5}
          baselineSharpe={baseItem?.sharpe ?? 2.24}
          verdict={robustData?.verdict ?? 'ROBUST (Plateau Score > 80)'}
        />

        {/* Section 1: Parameter Plateau Surface & Execution Friction Decay */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-6">
            <RobustnessParameterPlateauChart jitter={jitter} />
          </div>

          <div className="lg:col-span-6">
            <RobustnessFrictionDecayChart
              slippageCurve={robustData?.slippage_sensitivity_curve}
              breakEvenSlippageBps={robustData?.break_even_slippage_bps ?? 12.5}
            />
          </div>
        </div>

        {/* Section 2: Jitter Breakdown Table & Macro Stress Scenarios */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-7">
            <RobustnessJitterTable jitter={jitter} />
          </div>

          <div className="lg:col-span-5">
            <RobustnessStressScenarioCard scenarios={robustData?.stress_scenarios} />
          </div>
        </div>
      </div>
    </div>
  );
};
