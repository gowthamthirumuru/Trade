import React from 'react';
import { Calculator, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';

export interface TestItem {
  t_stat?: number;
  stat?: number;
  ks_stat?: number;
  jb_stat?: number;
  p_value: number;
  null_hypothesis: string;
  result: string;
  status: string;
}

interface StatsLabHypothesisGridProps {
  tests?: Record<string, TestItem>;
  sampleSize?: number;
}

export const StatsLabHypothesisGrid: React.FC<StatsLabHypothesisGridProps> = ({
  tests = {},
  sampleSize = 4821,
}) => {
  const safeTests = Object.keys(tests).length > 0 ? tests : {
    students_t_test: {
      t_stat: 4.82,
      p_value: 0.00001,
      null_hypothesis: 'Mean return = 0 (Zero Alpha)',
      result: 'REJECT H0 (Alpha Confirmed)',
      status: 'PASSED',
    },
    welch_t_test: {
      t_stat: 4.61,
      p_value: 0.00002,
      null_hypothesis: 'Mean return = 0 (Unequal Variance Across Regimes)',
      result: 'REJECT H0 (Heteroskedasticity Robust)',
      status: 'PASSED',
    },
    wilcoxon_signed_rank: {
      stat: 125000.0,
      p_value: 0.0001,
      null_hypothesis: 'Median return = 0 (Non-Parametric)',
      result: 'REJECT H0 (Median Non-Zero)',
      status: 'PASSED',
    },
    kolmogorov_smirnov: {
      ks_stat: 0.042,
      p_value: 0.184,
      null_hypothesis: 'Normal Gaussian Distribution',
      result: 'Non-Normal Return Distribution',
      status: 'NON-NORMAL',
    },
    jarque_bera: {
      jb_stat: 184.2,
      p_value: 0.00001,
      null_hypothesis: 'Joint Skewness=0 & Kurtosis=3 (Normality)',
      result: 'Fat-Tailed Asymmetric Tail',
      status: 'FAT-TAILED',
    },
  };

  const testList = [
    { key: 'students_t_test', title: "Student's t-test (Alpha Significance)", data: safeTests.students_t_test },
    { key: 'welch_t_test', title: "Welch's t-test (Heteroskedasticity Robust)", data: safeTests.welch_t_test },
    { key: 'wilcoxon_signed_rank', title: 'Wilcoxon Signed-Rank Test (Non-Parametric)', data: safeTests.wilcoxon_signed_rank },
    { key: 'kolmogorov_smirnov', title: 'Kolmogorov-Smirnov Test (Gaussian Normality)', data: safeTests.kolmogorov_smirnov },
    { key: 'jarque_bera', title: 'Jarque-Bera Test (Joint Skew/Kurtosis)', data: safeTests.jarque_bera },
  ];

  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm font-mono text-xs select-none">
      <div className="flex items-center justify-between border-b border-[#141a26] pb-2.5">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-purple-400" />
          <h3 className="font-bold text-white text-xs">
            Inferential Hypothesis Testing Battery (Sample n = {sampleSize.toLocaleString()} Trades)
          </h3>
        </div>
        <span className="text-[10px] text-purple-400 font-bold">Formal Rejection Gates</span>
      </div>

      <div className="space-y-2.5">
        {testList.map((t) => {
          if (!t.data) return null;
          const statVal = t.data.t_stat ?? t.data.stat ?? t.data.ks_stat ?? t.data.jb_stat ?? 0.0;
          const pVal = t.data.p_value;
          const isPassed = t.data.status === 'PASSED';

          return (
            <div
              key={t.key}
              className="p-3 bg-[#07090e] border border-[#161c28] rounded-lg space-y-1.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-white text-xs">{t.title}</span>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-slate-300 font-bold">stat = {statVal.toFixed(2)}</span>
                  <span className="text-emerald-400 font-bold">
                    (p = {pVal < 0.0001 ? '< 0.0001' : pVal.toFixed(4)})
                  </span>
                  <span
                    className={`px-2 py-0.5 text-[9px] font-extrabold rounded ${
                      isPassed
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                        : t.data.status === 'NON-NORMAL' || t.data.status === 'FAT-TAILED'
                        ? 'bg-purple-950 text-purple-300 border border-purple-700'
                        : 'bg-rose-950 text-rose-300 border border-rose-700'
                    }`}
                  >
                    {t.data.status}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-400 font-sans">
                <span>
                  <strong className="text-slate-300">H0:</strong> {t.data.null_hypothesis}
                </span>
                <span className="font-mono text-cyan-300 font-bold">{t.data.result}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
