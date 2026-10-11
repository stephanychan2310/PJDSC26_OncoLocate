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

  // Maximum absolute score to scale the bar lengths proportionally
  const maxScore = Math.max(
    ...positive.map((p) => Math.abs(p.score)),
    ...negative.map((n) => Math.abs(n.score)),
    0.5
  );

  return (
    <div className={`bg-white rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_1px_2px_rgba(0,0,0,0.03)] transition-opacity duration-150 ${
      isCalculating ? 'opacity-60' : 'opacity-100'
    }`}>
      {/* Header */}
      <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          <h2 className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase flex items-center">
            Feature Attribution & Explainability (SHAP)
            <Tooltip text="Additive Shapley contributions quantifying marginal log-odds impacts of clinical and somatic features toward the consensus diagnosis." />
          </h2>
        </div>

        {/* Segmented Filter Pills */}
        <div className="bg-slate-100/70 p-0.5 rounded-lg inline-flex text-[11px]">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-2.5 py-1 rounded-md transition-all font-medium ${
              activeTab === 'all'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            All 6
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('positive')}
            className={`px-2.5 py-1 rounded-md transition-all font-medium ${
              activeTab === 'positive'
                ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Positive (+3)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('negative')}
            className={`px-2.5 py-1 rounded-md transition-all font-medium ${
              activeTab === 'negative'
                ? 'bg-white text-rose-800 shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Negative (-3)
          </button>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Baseline Reference Strip */}
        <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-100 font-mono">
          <span className="font-sans text-slate-600">
            Target Lineage: <strong className="text-slate-900 font-semibold">{topPredictionName}</strong>
          </span>
          <span className="text-[11px] text-slate-400">
            Cohort Prior E[f(x)] = 0.082
          </span>
        </div>

        {/* POSITIVE DRIVERS: ELEGANT BUILT-IN INLINE METERS */}
        {(activeTab === 'all' || activeTab === 'positive') && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase flex items-center">
                <TrendingUp className="w-3 h-3 mr-1 text-emerald-600" />
                Positive Drivers (+ Supporting Lineage)
              </span>
              <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
                Top 3 Positive SHAP
              </span>
            </div>

            <div className="space-y-1 divide-y divide-slate-100/80">
              {positive.map((item) => {
                const barWidth = Math.min(100, Math.round((Math.abs(item.score) / maxScore) * 100));

                return (
                  <div
                    key={item.feature}
                    className="pt-2 pb-1.5 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/50 px-2 -mx-2 rounded-lg transition-colors"
                  >
                    {/* Left: Identity and Clinical Rationale */}
                    <div className="space-y-0.5 flex-1 min-w-0 pr-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-slate-800">
                          {item.feature}
                        </span>
                        <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-100 text-slate-500 uppercase">
                          {item.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate" title={item.interpretation}>
                        {item.interpretation}
                      </p>
                    </div>

                    {/* Right: Inline Proportional Meter & Delta Value */}
                    <div className="flex items-center space-x-3 shrink-0 sm:w-48">
                      <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs font-bold text-emerald-800 w-12 text-right">
                        {item.value}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* NEGATIVE DRIVERS: ELEGANT BUILT-IN INLINE METERS */}
        {(activeTab === 'all' || activeTab === 'negative') && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase flex items-center">
                <TrendingDown className="w-3 h-3 mr-1 text-rose-500" />
                Negative Drivers (- Suppressing Alternate Sites)
              </span>
              <span className="text-[10px] font-mono text-rose-800 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/50">
                Top 3 Negative SHAP
              </span>
            </div>

            <div className="space-y-1 divide-y divide-slate-100/80">
              {negative.map((item) => {
                const barWidth = Math.min(100, Math.round((Math.abs(item.score) / maxScore) * 100));

                return (
                  <div
                    key={item.feature}
                    className="pt-2 pb-1.5 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/50 px-2 -mx-2 rounded-lg transition-colors"
                  >
                    {/* Left: Identity and Clinical Rationale */}
                    <div className="space-y-0.5 flex-1 min-w-0 pr-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-slate-800">
                          {item.feature}
                        </span>
                        <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-100 text-slate-500 uppercase">
                          {item.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate" title={item.interpretation}>
                        {item.interpretation}
                      </p>
                    </div>

                    {/* Right: Inline Proportional Meter & Delta Value */}
                    <div className="flex items-center space-x-3 shrink-0 sm:w-48">
                      <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-rose-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs font-bold text-rose-700 w-12 text-right">
                        {item.value}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Micro Rationale Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center space-x-2 text-[11px] text-slate-400">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <p className="leading-snug">
            SHAP scores reflect TreeSHAP local additive log-odds deltas relative to background cohort distribution.
          </p>
        </div>

      </div>

    </div>
  );
}
