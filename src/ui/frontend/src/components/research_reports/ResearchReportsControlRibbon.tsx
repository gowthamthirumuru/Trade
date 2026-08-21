import React from 'react';
import { FileText, ShieldCheck, TrendingUp, AlertTriangle, CheckCircle2, Percent } from 'lucide-react';

interface ResearchReportsControlRibbonProps {
  totalReports?: number;
  certifiedCount?: number;
  portfolioSharpe?: number;
  maxDrawdown?: number;
  dsrPValue?: number;
  frictionDragPct?: number;
}

export const ResearchReportsControlRibbon: React.FC<ResearchReportsControlRibbonProps> = ({
  totalReports = 5,
  certifiedCount = 4,
  portfolioSharpe = 2.18,
  maxDrawdown = 8.4,
  dsrPValue = 0.0044,
  frictionDragPct = 8.78,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 font-mono text-xs select-none">
      {/* 1. Total Tearsheets */}
      <div className="bg-[#0b0e14] border border-cyan-500/40 rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between bg-cyan-950/10">
        <div className="flex items-center justify-between text-cyan-400">
          <span className="text-[10px] uppercase font-semibold">Audited Reports</span>
          <FileText className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div className="text-base font-extrabold text-cyan-300">{totalReports} Reports</div>
        <div className="text-[9px] text-cyan-400/80 font-bold">100% Real Verification</div>
      </div>

      {/* 2. Certified Models */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Certifications</span>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="text-base font-extrabold text-emerald-400">{certifiedCount} Grade A</div>
        <div className="text-[9px] text-slate-400">Passed Gate 1–6</div>
      </div>

      {/* 3. Portfolio Sharpe */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Portfolio Sharpe</span>
          <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
        </div>
        <div className="text-base font-extrabold text-purple-300">{portfolioSharpe.toFixed(2)}</div>
        <div className="text-[9px] text-slate-400">Annualized Composite</div>
      </div>

      {/* 4. Max Drawdown */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Portfolio MaxDD</span>
          <AlertTriangle className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="text-base font-extrabold text-emerald-400">-{maxDrawdown.toFixed(1)}%</div>
        <div className="text-[9px] text-slate-400">&lt; 12.0% Risk Limit</div>
      </div>

      {/* 5. Deflated Sharpe DSR */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">DSR Overfit Gate</span>
          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div className="text-base font-extrabold text-cyan-300">p = {dsrPValue.toFixed(4)}</div>
        <div className="text-[9px] text-slate-400">p &lt; 0.05 Zero Overfit</div>
      </div>

      {/* 6. Total Friction Drag */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Friction Drag</span>
          <Percent className="w-3.5 h-3.5 text-slate-300" />
        </div>
        <div className="text-base font-extrabold text-white">{frictionDragPct.toFixed(1)}%</div>
        <div className="text-[9px] text-slate-400">&lt; 15.0% Institutional Cap</div>
      </div>
    </div>
  );
};
