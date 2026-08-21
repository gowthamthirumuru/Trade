import React, { useState } from 'react';
import { X, Sparkles, Plus, FlaskConical } from 'lucide-react';

interface NewExperimentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (payload: {
    title: string;
    strategy: string;
    pair: string;
    timeframe: string;
    target_metric: string;
    hypothesis: string;
  }) => void;
}

export const NewExperimentModal: React.FC<NewExperimentModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [title, setTitle] = useState('');
  const [strategy, setStrategy] = useState('BB Reversion v4');
  const [pair, setPair] = useState('XAUUSD');
  const [timeframe, setTimeframe] = useState('15m');
  const [targetMetric, setTargetMetric] = useState('Expectancy R');
  const [hypothesis, setHypothesis] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreate({
      title,
      strategy,
      pair,
      timeframe,
      target_metric: targetMetric,
      hypothesis: hypothesis || `Hypothesis testing for ${strategy} parameter modifications on ${pair}.`,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-mono text-xs select-none">
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl animate-in zoom-in-95">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#141a26] pb-3">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-purple-400" />
            <h3 className="font-bold text-white text-sm">Formulate New Hypothesis Experiment</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">
              Experiment Title / Hypothesis Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Does 4h EMA trend filter reduce drawdown on EURUSD?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#07090e] border border-[#1a2232] rounded-lg p-2.5 text-white outline-none focus:border-purple-500 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">
                Target Strategy
              </label>
              <select
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                className="w-full bg-[#07090e] border border-[#1a2232] rounded-lg p-2 text-white outline-none text-xs"
              >
                <option value="BB Reversion v4">BB Reversion v4</option>
                <option value="Order Block v4">Order Block v4</option>
                <option value="London Breakout v2">London Breakout v2</option>
                <option value="Liquidity Sweep v3">Liquidity Sweep v3</option>
                <option value="strategy_T04_F02">strategy_T04_F02</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">
                Instrument & Timeframe
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <select
                  value={pair}
                  onChange={(e) => setPair(e.target.value)}
                  className="bg-[#07090e] border border-[#1a2232] rounded-lg p-2 text-cyan-300 font-bold outline-none text-xs"
                >
                  <option value="XAUUSD">XAUUSD</option>
                  <option value="EURUSD">EURUSD</option>
                  <option value="GBPUSD">GBPUSD</option>
                  <option value="USDJPY">USDJPY</option>
                  <option value="BTCUSDT">BTCUSDT</option>
                </select>
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="bg-[#07090e] border border-[#1a2232] rounded-lg p-2 text-slate-300 font-bold outline-none text-xs"
                >
                  <option value="15m">15m</option>
                  <option value="1h">1h</option>
                  <option value="5m">5m</option>
                  <option value="4h">4h</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">
              Primary Target Metric (For Alpha Lift & p-Value)
            </label>
            <select
              value={targetMetric}
              onChange={(e) => setTargetMetric(e.target.value)}
              className="w-full bg-[#07090e] border border-[#1a2232] rounded-lg p-2 text-emerald-400 font-bold outline-none text-xs"
            >
              <option value="Expectancy R">Expectancy R (Higher is Better)</option>
              <option value="Sharpe Ratio">Sharpe Ratio (Higher is Better)</option>
              <option value="Max Drawdown %">Max Drawdown % (Lower is Better)</option>
              <option value="Profit Factor">Profit Factor (Higher is Better)</option>
              <option value="Win Rate %">Win Rate % (Higher is Better)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">
              Quantitative Hypothesis Thesis Statement
            </label>
            <textarea
              rows={3}
              placeholder="State the underlying market inefficiency or mathematical rationale for this test..."
              value={hypothesis}
              onChange={(e) => setHypothesis(e.target.value)}
              className="w-full bg-[#07090e] border border-[#1a2232] rounded-lg p-2.5 text-slate-200 outline-none focus:border-purple-500 text-xs leading-relaxed"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#141a26]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 bg-[#07090e] hover:bg-[#121824] border border-[#1a2232] rounded-lg text-slate-300 text-xs font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold rounded-lg text-xs shadow-lg shadow-purple-600/30 transition active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Queue Experiment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
