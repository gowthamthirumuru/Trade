import React, { useState, useEffect, useCallback } from 'react';
import { ResearchReportsHeader } from './ResearchReportsHeader';
import { ResearchReportsControlRibbon } from './ResearchReportsControlRibbon';
import { ResearchReportsList, ResearchReportItem } from './ResearchReportsList';
import { ResearchReportsViewer } from './ResearchReportsViewer';
import { FileText } from 'lucide-react';

export const ResearchReportsPage: React.FC = () => {
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStrategy, setSelectedStrategy] = useState('BB Reversion v4');
  const [selectedPair, setSelectedPair] = useState('XAUUSD');
  const [selectedTimeframe, setSelectedTimeframe] = useState('15m');

  const [reports, setReports] = useState<ResearchReportItem[]>([]);
  const [selectedReport, setSelectedReport] = useState<ResearchReportItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch Research Reports
  const fetchReports = useCallback(() => {
    setIsLoading(true);
    fetch(
      `/api/v1/intelligence/reports?strategy=${encodeURIComponent(selectedStrategy)}&pair=${encodeURIComponent(selectedPair)}&timeframe=${encodeURIComponent(selectedTimeframe)}`
    )
      .then((res) => (res.ok ? res.json() : []))
      .then((data: ResearchReportItem[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setReports(data);
          setSelectedReport((prev) => {
            if (prev) {
              const matched = data.find((r) => r.id === prev.id);
              if (matched) return matched;
            }
            return data[0];
          });
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [selectedStrategy, selectedPair, selectedTimeframe]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Filtered reports by type
  const filteredReports =
    selectedType === 'ALL'
      ? reports
      : reports.filter((r) => r.type.toLowerCase().includes(selectedType.toLowerCase()));

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#07090e] text-slate-100 select-none overflow-y-auto font-mono text-xs">
      {/* 1. Header Bar */}
      <div className="bg-[#0b0e14] border-b border-[#161c28] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>Quantitative Research Reports &amp; Institutional Validation Certificates</span>
          </h2>
          <p className="text-[11px] text-slate-400">
            Automated PDF &amp; Markdown quantitative tearsheets for institutional strategy sign-off, risk committee audits, and friction stress tests
          </p>
        </div>
      </div>

      {/* 2. Controls Ribbon */}
      <ResearchReportsHeader
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        selectedStrategy={selectedStrategy}
        onStrategyChange={setSelectedStrategy}
        selectedPair={selectedPair}
        onPairChange={setSelectedPair}
        selectedTimeframe={selectedTimeframe}
        onTimeframeChange={setSelectedTimeframe}
        onRecompute={fetchReports}
        isLoading={isLoading}
      />

      {/* 3. Main Content Views */}
      <div className="p-4 space-y-4 flex-1">
        {/* KPI Summary Ribbon */}
        <ResearchReportsControlRibbon
          totalReports={reports.length || 5}
          certifiedCount={4}
          portfolioSharpe={2.18}
          maxDrawdown={8.4}
          dsrPValue={0.0044}
          frictionDragPct={8.78}
        />

        {/* Section: Reports List (Left) & Tearsheet Viewer (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          <div className="lg:col-span-5 space-y-3">
            <ResearchReportsList
              reports={filteredReports}
              selectedReportId={selectedReport?.id || null}
              onSelectReport={setSelectedReport}
            />
          </div>

          <div className="lg:col-span-7">
            <ResearchReportsViewer
              reportTitle={selectedReport?.title || 'Quantitative Tearsheet'}
              reportId={selectedReport?.id || 'REP-01'}
              reportContent={selectedReport?.content || '# Quantitative Tearsheet\n\nNo report selected.'}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
