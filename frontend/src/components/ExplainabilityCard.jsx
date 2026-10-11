import { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Info 
} from 'lucide-react';
import Tooltip from './Tooltip';

export default function ExplainabilityCard({ shapExplanations, topPredictionName, isCalculating }) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'positive' | 'negative'

  if (!shapExplanations) return null;

  const { positive, negative } = shapExplanations;

  const maxScore = Math.max(
    ...positive.map((p) => Math.abs(p.score)),
    ...negative.map((n) => Math.abs(n.score)),
    0.5
  );

  return (
    <div className={`bg-[var(--card)] rounded-xl p-4 border border-[var(--border)] shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-opacity duration-150 ${
      isCalculating ? 'opacity-60' : 'opacity-100'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
        <div>
          <h3 className="text-sm sm:text-base font-semibold text-[var(--foreground)] tracking-tight flex items-center">
            Feature Attribution & Biomarker Impact (SHAP)
            <Tooltip text="Additive Shapley values quantifying the positive support and negative suppression on the target diagnosis." />
          </h3>
          <p className="text-xs text-[var(--muted-foreground)]">
            Explainable AI feature importance for <strong className="text-[var(--foreground)]">{topPredictionName}</strong>
          </p>
        </div>

        {/* Segmented Filter Pills */}
        <div className="bg-[var(--muted)] p-1 rounded-xl inline-flex space-x-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-lg transition-all font-semibold cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[var(--card)] text-[var(--sidebar-accent-foreground)] shadow-xs'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            All 6 Features
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('positive')}
            className={`px-3 py-1 rounded-lg transition-all font-semibold cursor-pointer ${
              activeTab === 'positive'
                ? 'bg-[var(--card)] text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            Positive (+3)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('negative')}
            className={`px-3 py-1 rounded-lg transition-all font-semibold cursor-pointer ${
              activeTab === 'negative'
                ? 'bg-[var(--card)] text-rose-700 dark:text-rose-400 shadow-xs'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            Negative (-3)
          </button>
        </div>
      </div>

      <div className="pt-3 space-y-4">
        
        {/* POSITIVE DRIVERS TIMELINE */}
        {(activeTab === 'all' || activeTab === 'positive') && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Positive Drivers (+ Supporting Lineage)</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
                Top 3 Positive SHAP
              </span>
            </div>

            <div className="space-y-2">
              {positive.map((item) => {
                const barWidth = Math.min(100, Math.round((Math.abs(item.score) / maxScore) * 100));

                return (
                  <div
                    key={item.feature}
                    className="p-3 rounded-lg border border-[var(--border)] bg-[var(--muted)]/30 hover:bg-[var(--muted)]/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start space-x-2.5 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200/60 dark:border-emerald-800/60 mt-0.5">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-[var(--foreground)]">
                            {item.feature}
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-md bg-[var(--card)] text-[var(--muted-foreground)] border border-[var(--border)] uppercase font-semibold">
                            {item.type}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)] leading-snug">
                          {item.interpretation}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0 sm:w-44 pl-10 sm:pl-0">
                      <div className="flex-1 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 w-12 text-right">
                        {item.value}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* NEGATIVE SUPPRESSORS TIMELINE */}
        {(activeTab === 'all' || activeTab === 'negative') && (
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Negative Suppressors (- De-weighting Alternative Sites)</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 px-2.5 py-0.5 rounded-full border border-rose-200/60 dark:border-rose-800/60">
                Top 3 Negative SHAP
              </span>
            </div>

            <div className="space-y-2">
              {negative.map((item) => {
                const barWidth = Math.min(100, Math.round((Math.abs(item.score) / maxScore) * 100));

                return (
                  <div
                    key={item.feature}
                    className="p-3 rounded-lg border border-[var(--border)] bg-[var(--muted)]/30 hover:bg-[var(--muted)]/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start space-x-2.5 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200/60 dark:border-rose-800/60 mt-0.5">
                        <TrendingDown className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-[var(--foreground)]">
                            {item.feature}
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-md bg-[var(--card)] text-[var(--muted-foreground)] border border-[var(--border)] uppercase font-semibold">
                            {item.type}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)] leading-snug">
                          {item.interpretation}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0 sm:w-44 pl-10 sm:pl-0">
                      <div className="flex-1 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-rose-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs font-bold text-rose-700 dark:text-rose-400 w-12 text-right">
                        {item.value}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Rationale */}
        <div className="pt-2.5 border-t border-[var(--border)] flex items-center space-x-2 text-xs text-[var(--muted-foreground)]">
          <Info className="w-4 h-4 text-[var(--muted-foreground)] shrink-0" />
          <p className="leading-relaxed">
            Additive SHAP contributions reveal the causal weights learned by the tree ensemble. Drivers directly modulate class log-odds against the baseline cohort prior.
          </p>
        </div>

      </div>

    </div>
  );
}
