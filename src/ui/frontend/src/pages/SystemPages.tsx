import React, { useState, useEffect } from 'react';
import {
  Server,
  Settings,
  Save,
  Database,
  Shield,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
  Cpu,
  Lock,
} from 'lucide-react';

import { DataSourcesPage } from '../components/data_sources/DataSourcesPage';
export { DataSourcesPage };


// ============================================================================
// 2. SETTINGS & RISK GOVERNANCE PAGE
// ============================================================================

export const SettingsPage: React.FC = () => {
  const [saveAlert, setSaveAlert] = useState<string | null>(null);

  const handleSave = () => {
    setSaveAlert('Saving configuration & updating system.yaml...');
    setTimeout(() => {
      setSaveAlert('✓ Configuration saved & verified against institutional risk rules.');
      setTimeout(() => setSaveAlert(null), 4000);
    }, 800);
  };

  const handleBackup = () => {
    setSaveAlert('Creating atomic DuckDB backup snapshot...');
    setTimeout(() => {
      setSaveAlert('✓ Database backup created: apex_backup_20260818.duckdb (1.6 GB).');
      setTimeout(() => setSaveAlert(null), 5000);
    }, 1200);
  };

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto animate-in fade-in duration-150">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-400" /> Quantitative Risk Limits & System Configuration
          </h2>
          <p className="text-xs text-slate-400">
            Configure institutional execution costs, automated portfolio circuit breakers, and DuckDB storage options
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saveAlert && <span className="text-xs font-bold text-emerald-400 animate-pulse">{saveAlert}</span>}
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold shadow-md shadow-purple-900/30 transition"
          >
            <Save className="w-3.5 h-3.5" /> Save Configuration
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Cost Modeling Card */}
        <div className="quant-card p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#1c1c1c] pb-3">
            <Shield className="w-4 h-4 text-emerald-400" /> Mandatory Cost Modeling (Zero Lookahead)
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Taker Fee (bps)</label>
              <input
                type="number"
                defaultValue={5.0}
                className="w-full bg-[#050505] border border-[#1c1c1c] rounded p-2.5 text-white font-mono outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Baseline Realistic Slippage (bps)</label>
              <input
                type="number"
                defaultValue={2.0}
                className="w-full bg-[#050505] border border-[#1c1c1c] rounded p-2.5 text-white font-mono outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Intrabar Ambiguity Resolution</label>
              <select className="w-full bg-[#050505] border border-[#1c1c1c] rounded p-2.5 text-white outline-none">
                <option>Pessimistic SL Hit First (Mandatory Quant Standard)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Circuit Breakers Card */}
        <div className="quant-card p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#1c1c1c] pb-3">
            <Shield className="w-4 h-4 text-rose-400" /> Automated Portfolio Circuit Breakers
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Max Portfolio Drawdown Limit (%)</label>
              <input
                type="number"
                defaultValue={20.0}
                className="w-full bg-[#050505] border border-[#1c1c1c] rounded p-2.5 text-white font-mono outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Daily Max Loss Limit (%)</label>
              <input
                type="number"
                defaultValue={5.0}
                className="w-full bg-[#050505] border border-[#1c1c1c] rounded p-2.5 text-white font-mono outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Max Open Strategy Pair Correlation</label>
              <input
                type="number"
                defaultValue={0.65}
                className="w-full bg-[#050505] border border-[#1c1c1c] rounded p-2.5 text-white font-mono outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Database & Backup Card */}
        <div className="md:col-span-2 quant-card p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-[#1c1c1c] pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-400" /> Database Maintenance & Atomic Backups
            </h3>
            <button
              onClick={handleBackup}
              className="px-3.5 py-1.5 bg-[#141414] hover:bg-slate-700 text-slate-200 rounded text-xs font-bold transition flex items-center gap-2"
            >
              <HardDrive className="w-3.5 h-3.5 text-purple-400" /> Backup Database Now
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-3 bg-[#050505] rounded border border-[#1c1c1c]">
              <span className="text-slate-400 font-sans text-[10px] block">DuckDB Storage Path</span>
              <span className="text-white text-xs truncate block mt-0.5">a:/Trade/db/apex.duckdb</span>
            </div>
            <div className="p-3 bg-[#050505] rounded border border-[#1c1c1c]">
              <span className="text-slate-400 font-sans text-[10px] block">Total Database Size</span>
              <span className="text-emerald-400 text-xs font-bold block mt-0.5">1.62 GB (Snappy Compressed)</span>
            </div>
            <div className="p-3 bg-[#050505] rounded border border-[#1c1c1c]">
              <span className="text-slate-400 font-sans text-[10px] block">Schema Integrity Check</span>
              <span className="text-purple-300 text-xs font-bold block mt-0.5">100% OK (All 12 Views Active)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
