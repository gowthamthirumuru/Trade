import React, { useState } from 'react';
import { Search, Filter, GitCompare, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { ExperimentItem } from './ExperimentsKanban';

interface HypothesisRegistryTableProps {
  experiments: ExperimentItem[];
  onInspectAB: (exp: ExperimentItem) => void;
  onAdvanceStage: (id: string) => void;
  onPromoteEdge: (id: string) => void;
}

export const HypothesisRegistryTable: React.FC<HypothesisRegistryTableProps> = ({
  experiments,
  onInspectAB,
  onAdvanceStage,
  onPromoteEdge,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');

  const filtered = experiments.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.strategy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = stageFilter === 'ALL' || e.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 font-mono text-xs select-none shadow-sm">
      {/* Header & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#141a26] pb-3">
        <div>
          <h3 className="font-bold text-white text-xs">Quantitative Hypothesis Registry (DuckDB Persisted)</h3>
          <p className="text-[11px] text-slate-400">Complete institutional record of all formulated, validated, and promoted edges.</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3 h-3 text-slate-500 absolute left-2.5 top-2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search experiments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#07090e] border border-[#1a2232] rounded-lg pl-7 pr-2 py-1 text-white text-[11px] outline-none w-52"
            />
          </div>

          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="bg-[#07090e] border border-[#1a2232] rounded-lg px-2 py-1 text-slate-300 font-bold outline-none text-[11px] cursor-pointer"
          >
            <option value="ALL">All Stages</option>
            <option value="DESIGN">Design</option>
            <option value="BACKTESTING">Backtesting</option>
            <option value="OOS VALIDATION">OOS Validation</option>
            <option value="MONTE CARLO">Monte Carlo</option>
            <option value="PROMOTED">Promoted</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-[#07090e] z-10 text-[10px] text-slate-400 border-b border-[#141a26]">
            <tr>
              <th className="py-2.5 px-3">ID</th>
              <th className="py-2.5 px-3">Experiment Title</th>
              <th className="py-2.5 px-3">Target Model</th>
              <th className="py-2.5 px-3">Stage</th>
              <th className="py-2.5 px-3 text-right">Baseline</th>
              <th className="py-2.5 px-3 text-right">Variant Lift</th>
              <th className="py-2.5 px-3 text-right">p-Value</th>
              <th className="py-2.5 px-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#141a26]">
            {filtered.map((e) => {
              const isSig = e.p_value < 0.05;
              const isPromoted = e.stage === 'PROMOTED';

              return (
                <tr key={e.id} className="hover:bg-[#121824] transition text-[11px]">
                  <td className="py-2.5 px-3 font-extrabold text-purple-400 font-mono">{e.id}</td>
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-white">{e.title}</div>
                    <div className="text-[9px] text-slate-500 truncate max-w-[280px]">"{e.hypothesis}"</div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 font-bold">
                    <div>{e.strategy}</div>
                    <div className="text-[9px] text-cyan-400">{e.pair || 'XAUUSD'}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                        isPromoted
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                          : 'bg-[#121824] text-slate-300 border border-[#1a2232]'
                      }`}
                    >
                      {e.stage}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-400">{e.baseline_val}</td>
                  <td className="py-2.5 px-3 text-right font-extrabold text-emerald-400">{e.variant_val}</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className={`font-bold ${isSig ? 'text-emerald-400' : 'text-rose-400'}`}>
                      p = {e.p_value.toFixed(4)}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onInspectAB(e)}
                        className="px-2 py-1 bg-[#07090e] hover:bg-[#121824] border border-[#1a2232] rounded text-cyan-300 hover:text-white transition font-bold text-[10px] flex items-center gap-1"
                      >
                        <GitCompare className="w-2.5 h-2.5" />
                        <span>A/B</span>
                      </button>

                      {!isPromoted && (
                        <button
                          onClick={() => onAdvanceStage(e.id)}
                          className="px-2 py-1 bg-purple-950/60 hover:bg-purple-900 border border-purple-700/60 rounded text-purple-300 hover:text-white transition font-bold text-[10px] flex items-center gap-1"
                        >
                          <span>Advance</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      )}

                      {!isPromoted && isSig && (
                        <button
                          onClick={() => onPromoteEdge(e.id)}
                          className="px-2 py-1 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-700/60 rounded text-emerald-300 hover:text-white transition font-bold text-[10px] flex items-center gap-1"
                        >
                          <ShieldCheck className="w-2.5 h-2.5" />
                          <span>Promote</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
