import React, { useState } from 'react';
import {
  Download,
  Save,
  FileText,
  GitCompare,
  Play,
  Sparkles,
  GitBranch,
  Check,
} from 'lucide-react';

interface ExportActionsCardProps {
  onExport?: (format: 'CSV' | 'JSON' | 'Excel') => void;
  onSave?: () => void;
  onCreateReport?: () => void;
  onCompareBaseline?: () => void;
  onNavigateAction?: (target: 'backtest' | 'experiment' | 'validation') => void;
}

export const ExportActionsCard: React.FC<ExportActionsCardProps> = ({
  onExport,
  onSave,
  onCreateReport,
  onCompareBaseline,
  onNavigateAction,
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleExportClick = () => {
    if (onExport) onExport('CSV');
    showToast('Exported optimization results (CSV)');
  };

  const handleSaveClick = () => {
    if (onSave) onSave();
    showToast('Optimization run stored to DuckDB');
  };

  const handleReportClick = () => {
    if (onCreateReport) onCreateReport();
    showToast('Generating institutional PDF tearsheet...');
  };

  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm font-mono text-xs select-none flex flex-col justify-between">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-purple-950/90 border border-purple-600 text-purple-200 px-2.5 py-1 rounded text-[10px] font-bold animate-in fade-in flex items-center gap-1.5">
          <Check className="w-3 h-3 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Export & Actions Section */}
      <div className="space-y-1.5">
        <div className="border-b border-[#141a26] pb-1.5 font-bold text-white text-xs">
          Export & Actions
        </div>

        <div className="space-y-1 text-[11px]">
          <button
            onClick={handleExportClick}
            className="w-full py-1.5 px-2 bg-[#07090e] hover:bg-[#121824] border border-[#1a2232] rounded-lg text-left text-slate-300 hover:text-white transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-2">
              <Download className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition" />
              <div>
                <div className="font-bold">Export Results</div>
                <div className="text-[9px] text-slate-500">CSV, JSON, Excel</div>
              </div>
            </div>
          </button>

          <button
            onClick={handleSaveClick}
            className="w-full py-1.5 px-2 bg-[#07090e] hover:bg-[#121824] border border-[#1a2232] rounded-lg text-left text-slate-300 hover:text-white transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-2">
              <Save className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition" />
              <div>
                <div className="font-bold">Save Optimization</div>
                <div className="text-[9px] text-slate-500">Store optimization run</div>
              </div>
            </div>
          </button>

          <button
            onClick={handleReportClick}
            className="w-full py-1.5 px-2 bg-[#07090e] hover:bg-[#121824] border border-[#1a2232] rounded-lg text-left text-slate-300 hover:text-white transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition" />
              <div>
                <div className="font-bold">Create Heatmap Report</div>
                <div className="text-[9px] text-slate-500">PDF with all visualizations</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => onCompareBaseline && onCompareBaseline()}
            className="w-full py-1.5 px-2 bg-[#07090e] hover:bg-[#121824] border border-[#1a2232] rounded-lg text-left text-slate-300 hover:text-white transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-2">
              <GitCompare className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition" />
              <div>
                <div className="font-bold">Compare with Baseline</div>
                <div className="text-[9px] text-slate-500">Analyze improvement</div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* 2. What's Next Section */}
      <div className="space-y-1.5 pt-2 border-t border-[#141a26]">
        <div className="font-bold text-white text-xs">What's Next?</div>
        <div className="text-[10px] text-slate-500">Use these optimal parameters for:</div>

        <div className="space-y-1 text-[11px]">
          <button
            onClick={() => onNavigateAction && onNavigateAction('backtest')}
            className="w-full py-1 px-2 bg-[#07090e] hover:bg-[#121824] border border-[#1a2232] rounded-lg text-left text-cyan-300 hover:text-cyan-200 transition flex items-center gap-2 font-bold"
          >
            <Play className="w-3 h-3 fill-cyan-400 text-cyan-400" />
            <span>Run Backtest</span>
          </button>

          <button
            onClick={() => onNavigateAction && onNavigateAction('experiment')}
            className="w-full py-1 px-2 bg-[#07090e] hover:bg-[#121824] border border-[#1a2232] rounded-lg text-left text-purple-300 hover:text-purple-200 transition flex items-center gap-2 font-bold"
          >
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>Create Experiment</span>
          </button>

          <button
            onClick={() => onNavigateAction && onNavigateAction('validation')}
            className="w-full py-1 px-2 bg-[#07090e] hover:bg-[#121824] border border-[#1a2232] rounded-lg text-left text-emerald-300 hover:text-emerald-200 transition flex items-center gap-2 font-bold"
          >
            <GitBranch className="w-3 h-3 text-emerald-400" />
            <span>Walk-Forward Validation</span>
          </button>
        </div>
      </div>
    </div>
  );
};
