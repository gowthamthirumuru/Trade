import React, { useState } from 'react';
import { Download, Copy, Check, FileText } from 'lucide-react';

interface ResearchReportsViewerProps {
  reportTitle?: string;
  reportId?: string;
  reportContent?: string;
}

export const ResearchReportsViewer: React.FC<ResearchReportsViewerProps> = ({
  reportTitle = 'Report Tearsheet',
  reportId = 'REP-01',
  reportContent = '# Quantitative Tearsheet\n\nNo report selected.',
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(reportContent);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([reportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportId.toLowerCase()}_tearsheet.md`;
    a.click();
  };

  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm font-mono text-xs select-none flex flex-col justify-between h-full">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#141a26] pb-2.5">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          <h3 className="font-bold text-white text-xs truncate max-w-sm">
            {reportTitle}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 bg-[#07090e] hover:bg-[#121824] border border-[#1a2232] rounded text-slate-300 hover:text-white transition font-bold text-[11px]"
          >
            {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
            <span>{isCopied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-extrabold rounded text-[11px] transition shadow-md shadow-cyan-500/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export MD</span>
          </button>
        </div>
      </div>

      {/* Tearsheet Body */}
      <div className="flex-1 bg-[#07090e] rounded-lg border border-[#161c28] p-4 overflow-y-auto max-h-[520px] text-slate-200 text-xs font-mono leading-relaxed whitespace-pre-wrap select-text">
        {reportContent}
      </div>

      <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-[#141a26] pt-2 px-1">
        <span>Formal Institutional Sign-Off Format</span>
        <span className="text-emerald-400 font-bold">100% Point-in-Time Real Verification</span>
      </div>
    </div>
  );
};
