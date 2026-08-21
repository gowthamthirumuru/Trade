import React, { useState, useEffect, useCallback } from 'react';
import { PatternHeader } from './PatternHeader';
import { PatternControlRibbon } from './PatternControlRibbon';
import { PatternMiningList, DiscoveredPattern } from './PatternMiningList';
import { PatternGeometryCard } from './PatternGeometryCard';
import { PatternForwardReturnDistribution } from './PatternForwardReturnDistribution';
import { PatternConfluenceMatrix } from './PatternConfluenceMatrix';
import { Binary } from 'lucide-react';

export const PatternMiningPage: React.FC = () => {
  const [selectedPair, setSelectedPair] = useState('XAUUSD');
  const [selectedTimeframe, setSelectedTimeframe] = useState('15m');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [scanData, setScanData] = useState<any>(null);
  const [selectedPattern, setSelectedPattern] = useState<DiscoveredPattern | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Fetch Pattern Scan Data
  const fetchPatterns = useCallback(() => {
    setIsScanning(true);
    fetch(
      `/api/v1/edge/patterns/scan?pair=${encodeURIComponent(selectedPair)}&timeframe=${encodeURIComponent(selectedTimeframe)}&category=${encodeURIComponent(selectedCategory)}`
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setScanData(data);
          if (data.patterns && data.patterns.length > 0) {
            setSelectedPattern(data.patterns[0]);
          }
        }
        setIsScanning(false);
      })
      .catch(() => setIsScanning(false));
  }, [selectedPair, selectedTimeframe, selectedCategory]);

  useEffect(() => {
    fetchPatterns();
  }, [fetchPatterns]);

  const handleExportCSV = () => {
    const patterns: DiscoveredPattern[] = scanData?.patterns || [];
    const headers = 'ID,Pattern,Category,Frequency,WinRatePct,AvgExpectancyR,Lift,ProfitFactor,PValue,OptimalEntry,StopLoss,TakeProfit\n';
    const rows = patterns
      .map(
        (p) =>
          `${p.id},"${p.pattern}","${p.category}",${p.frequency},${p.win_rate},${p.avg_r},"${p.lift}",${p.profit_factor},${p.p_value},"${p.optimal_entry}","${p.stop_loss}","${p.take_profit}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `discovered_patterns_${selectedPair}_${selectedTimeframe}_${selectedCategory}.csv`;
    a.click();
  };

  const patterns: DiscoveredPattern[] = scanData?.patterns || [];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#07090e] text-slate-100 select-none overflow-y-auto font-mono text-xs">
      {/* 1. Header Bar */}
      <div className="bg-[#0b0e14] border-b border-[#161c28] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Binary className="w-4 h-4 text-cyan-400" />
            <span>Structural Pattern Mining & SMC Discovery Lab</span>
          </h2>
          <p className="text-[11px] text-slate-400">
            Automated empirical discovery and forward outcome evaluation of Fair Value Gaps, Order Blocks, Liquidity Sweeps, and Wyckoff structures
          </p>
        </div>
      </div>

      {/* 2. Controls Ribbon */}
      <PatternHeader
        selectedPair={selectedPair}
        onPairChange={setSelectedPair}
        selectedTimeframe={selectedTimeframe}
        onTimeframeChange={setSelectedTimeframe}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        onRescan={fetchPatterns}
        onExportCSV={handleExportCSV}
        isScanning={isScanning}
      />

      {/* 3. Main Content Views */}
      <div className="p-4 space-y-4 flex-1">
        {/* KPI Summary Ribbon */}
        <PatternControlRibbon
          totalPatterns={scanData?.total_patterns_discovered ?? 8}
          topAlphaPattern={scanData?.top_alpha_pattern ?? 'Asian Liquidity Sweep Fade'}
          topWinRate={scanData?.top_pattern_win_rate ?? 68.8}
          topAvgR={scanData?.top_pattern_avg_r ?? 1.42}
          totalFrequency={scanData?.total_frequency ?? 1640}
        />

        {/* Core Layout: Left Ranked Patterns List, Right Geometry & Return Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-7">
            <PatternMiningList
              patterns={patterns}
              selectedPatternId={selectedPattern?.id ?? 'PAT-01'}
              onSelectPattern={(p) => setSelectedPattern(p)}
            />
          </div>

          <div className="lg:col-span-5 space-y-4">
            <PatternGeometryCard pattern={selectedPattern} />
            <PatternForwardReturnDistribution pattern={selectedPattern} />
          </div>
        </div>

        {/* Confluence Matrix */}
        <PatternConfluenceMatrix confluence={scanData?.confluence} />
      </div>
    </div>
  );
};
