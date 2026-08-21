import React, { useState, useEffect, useCallback } from 'react';
import { TradeAnalyticsHeader } from './TradeAnalyticsHeader';
import { TradeAnalyticsControlRibbon } from './TradeAnalyticsControlRibbon';
import { TradeRDistributionHistogram } from './TradeRDistributionHistogram';
import { TradeMaeMfeScatterLab } from './TradeMaeMfeScatterLab';
import { TradeCostDragAuditCard } from './TradeCostDragAuditCard';
import { TradeDurationAndExitBreakdown } from './TradeDurationAndExitBreakdown';
import { TradeExecutionLedgerTable } from './TradeExecutionLedgerTable';
import { PieChart } from 'lucide-react';

export const TradeAnalyticsPage: React.FC = () => {
  const [selectedStrategy, setSelectedStrategy] = useState('ALL STRATEGIES');
  const [selectedPair, setSelectedPair] = useState('ALL PORTFOLIO');
  const [selectedTimeframe, setSelectedTimeframe] = useState('15m');
  const [selectedDirection, setSelectedDirection] = useState('ALL');

  const [tradeData, setTradeData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch Trade Analytics Data
  const fetchTradeAnalytics = useCallback(() => {
    setIsLoading(true);
    fetch(
      `/api/v1/analysis/trades?strategy=${encodeURIComponent(selectedStrategy)}&pair=${encodeURIComponent(selectedPair)}&timeframe=${encodeURIComponent(selectedTimeframe)}&direction=${encodeURIComponent(selectedDirection)}`
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setTradeData(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [selectedStrategy, selectedPair, selectedTimeframe, selectedDirection]);

  useEffect(() => {
    fetchTradeAnalytics();
  }, [fetchTradeAnalytics]);

  const handleExportCSV = () => {
    const trades = tradeData?.trade_ledger || [];
    const headers = 'TradeID,Strategy,Pair,Timeframe,Direction,EntryPrice,ExitPrice,PnLQuote,PnLR,MAEPct,MFEPct,BarsHeld,ExitReason,Status\n';
    const rows = trades
      .map(
        (t: any) =>
          `${t.trade_id},"${t.strategy}","${t.pair}","${t.timeframe}","${t.direction}",${t.entry_price},${t.exit_price},${t.pnl_quote},${t.pnl_r},${t.mae_pct},${t.mfe_pct},${t.bars_held},"${t.exit_reason}","${t.status}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trade_analytics_${selectedStrategy}_${selectedPair}.csv`;
    a.click();
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#07090e] text-slate-100 select-none overflow-y-auto font-mono text-xs">
      {/* 1. Header Bar */}
      <div className="bg-[#0b0e14] border-b border-[#161c28] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <PieChart className="w-4 h-4 text-cyan-400" />
            <span>Trade Analytics, R-Distribution &amp; Execution Friction Drag Suite</span>
          </h2>
          <p className="text-[11px] text-slate-400">
            Empirical R-multiple distribution histograms, Maximum Adverse/Favorable Excursion (MAE/MFE) efficiency, and taker fee friction audits
          </p>
        </div>
      </div>

      {/* 2. Controls Ribbon */}
      <TradeAnalyticsHeader
        selectedStrategy={selectedStrategy}
        onStrategyChange={setSelectedStrategy}
        selectedPair={selectedPair}
        onPairChange={setSelectedPair}
        selectedTimeframe={selectedTimeframe}
        onTimeframeChange={setSelectedTimeframe}
        selectedDirection={selectedDirection}
        onDirectionChange={setSelectedDirection}
        onRecompute={fetchTradeAnalytics}
        onExportCSV={handleExportCSV}
        isLoading={isLoading}
      />

      {/* 3. Main Content Views */}
      <div className="p-4 space-y-4 flex-1">
        {/* KPI Summary Ribbon */}
        <TradeAnalyticsControlRibbon
          totalTrades={tradeData?.total_trades ?? 1840}
          expectancyR={tradeData?.expectancy_r ?? 0.88}
          winRatePct={tradeData?.win_rate_pct ?? 64.2}
          skewness={tradeData?.skewness ?? 1.24}
          kurtosis={tradeData?.kurtosis ?? 4.82}
          dragPct={tradeData?.cost_audit?.drag_pct_of_gross ?? 8.78}
        />

        {/* Section 1: R-Distribution Histogram & MAE/MFE Scatter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-6">
            <TradeRDistributionHistogram
              distribution={tradeData?.r_distribution}
              expectancyR={tradeData?.expectancy_r ?? 0.88}
            />
          </div>

          <div className="lg:col-span-6">
            <TradeMaeMfeScatterLab points={tradeData?.mae_mfe_scatter} />
          </div>
        </div>

        {/* Section 2: Execution Cost Drag Audit & Duration / Exits Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-5">
            <TradeCostDragAuditCard costAudit={tradeData?.cost_audit} />
          </div>

          <div className="lg:col-span-7">
            <TradeDurationAndExitBreakdown
              durationBins={tradeData?.duration_distribution}
              exitReasons={tradeData?.exit_reasons}
            />
          </div>
        </div>

        {/* Section 3: Detailed Trade Execution Ledger */}
        <TradeExecutionLedgerTable trades={tradeData?.trade_ledger} />
      </div>
    </div>
  );
};
