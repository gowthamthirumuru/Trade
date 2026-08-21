import React from 'react';
import { ShieldCheck, AlertTriangle, Zap, CheckCircle2 } from 'lucide-react';

export interface StressScenarioItem {
  scenario: string;
  description: string;
  expectancy_r: number;
  profit_factor: number;
  status: string;
  risk_tolerance: string;
}

interface RobustnessStressScenarioCardProps {
  scenarios?: StressScenarioItem[];
}

export const RobustnessStressScenarioCard: React.FC<RobustnessStressScenarioCardProps> = ({
  scenarios = [],
}) => {
  const safeScenarios = scenarios.length > 0 ? scenarios : [
    {
      scenario: 'Volatility Expansion (+50% ATR Shock)',
      description: 'Widened intrabar range during macro rate announcements',
      expectancy_r: 1.05,
      profit_factor: 2.65,
      status: 'RESILIENT',
      risk_tolerance: 'PASS',
    },
    {
      scenario: 'Liquidity Vacuum (3x Spread Spike)',
      description: 'Widened bid-ask spread during off-hours rollovers',
      expectancy_r: 0.72,
      profit_factor: 2.15,
      status: 'CONTROLLED',
      risk_tolerance: 'PASS',
    },
    {
      scenario: 'Flash Gap Entry (-2.0% Adverse Gap)',
      description: 'Execution fill slippage on weekend/news market open',
      expectancy_r: 0.58,
      profit_factor: 1.92,
      status: 'TOLERABLE',
      risk_tolerance: 'PASS',
    },
    {
      scenario: 'Noise Inversion (Adverse Market Regime)',
      description: 'Mean-reversion breakdown during strong institutional trending regime',
      expectancy_r: -0.15,
      profit_factor: 0.85,
      status: 'CIRCUIT BREAKER',
      risk_tolerance: 'PAUSED',
    },
  ];

  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm font-mono text-xs select-none">
      <div className="flex items-center justify-between border-b border-[#141a26] pb-2.5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <h3 className="font-bold text-white text-xs">
            Macro Shock & Tail Risk Stress Scenarios
          </h3>
        </div>
        <span className="text-[10px] text-slate-400">Black Swan & Crisis Simulation</span>
      </div>

      <div className="space-y-2.5">
        {safeScenarios.map((s, idx) => {
          const isPaused = s.risk_tolerance === 'PAUSED';

          return (
            <div
              key={idx}
              className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-3 ${
                isPaused
                  ? 'bg-slate-900/30 border-[#1a2232]'
                  : 'bg-[#07090e] border-[#161c28]'
              }`}
            >
              <div className="space-y-0.5 max-w-[65%]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-xs">{s.scenario}</span>
                </div>
                <p className="text-[10px] text-slate-400 font-sans">{s.description}</p>
              </div>

              <div className="flex items-center gap-3 font-mono">
                <div className="text-right">
                  <span className="text-[9px] text-slate-500 block uppercase">Expectancy</span>
                  <span
                    className={`font-bold text-xs ${
                      s.expectancy_r > 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {s.expectancy_r > 0 ? `+${s.expectancy_r.toFixed(2)}` : s.expectancy_r.toFixed(2)}R
                  </span>
                </div>

                <span
                  className={`px-2 py-0.5 text-[9px] font-extrabold rounded uppercase ${
                    s.status === 'RESILIENT' || s.status === 'CONTROLLED'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                      : s.status === 'TOLERABLE'
                      ? 'bg-amber-950 text-amber-300 border border-amber-700'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {s.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
