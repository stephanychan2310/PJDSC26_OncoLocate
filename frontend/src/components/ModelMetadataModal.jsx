import { X, Database } from 'lucide-react';

export default function ModelMetadataModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] max-w-2xl w-full overflow-hidden text-[var(--foreground)]"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--muted)]/40">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200/60 dark:border-teal-800/60 flex items-center justify-center text-[#0f766e] dark:text-teal-400 shadow-xs">
              <Database className="w-4 h-4 text-[#0f766e] dark:text-teal-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--foreground)] tracking-tight uppercase">
                Model Specification & Reference Architecture
              </h3>
              <p className="text-[11px] font-mono text-[var(--muted-foreground)]">
                MSK-IMPACT Pan-Cancer Tumor of Origin Classifier
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] p-1.5 rounded-lg hover:bg-[var(--muted)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs text-[var(--foreground)] max-h-[75vh] overflow-y-auto">
          
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-[var(--muted)]/40 border border-[var(--border)]">
              <span className="text-[10px] text-[var(--muted-foreground)] font-semibold uppercase tracking-widest block">
                Target Entities
              </span>
              <span className="font-mono text-lg font-bold text-[var(--foreground)] mt-0.5 block">
                58 Classes
              </span>
              <span className="text-[10px] font-mono text-[var(--muted-foreground)] block mt-0.5">MSK OncoTree</span>
            </div>

            <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-100 dark:border-teal-800/60">
              <span className="text-[10px] text-teal-800 dark:text-teal-300 font-semibold uppercase tracking-widest block">
                Validation AUC
              </span>
              <span className="font-mono text-lg font-bold text-[#0f766e] dark:text-teal-400 mt-0.5 block">
                0.941
              </span>
              <span className="text-[10px] font-mono text-teal-700 dark:text-teal-400 block mt-0.5">Macro Stratified</span>
            </div>

            <div className="p-3 rounded-xl bg-[var(--muted)]/40 border border-[var(--border)]">
              <span className="text-[10px] text-[var(--muted-foreground)] font-semibold uppercase tracking-widest block">
                Cohort Size
              </span>
              <span className="font-mono text-lg font-bold text-[var(--foreground)] mt-0.5 block">
                10,945
              </span>
              <span className="text-[10px] font-mono text-[var(--muted-foreground)] block mt-0.5">MSK-IMPACT 2017</span>
            </div>

            <div className="p-3 rounded-xl bg-[var(--muted)]/40 border border-[var(--border)]">
              <span className="text-[10px] text-[var(--muted-foreground)] font-semibold uppercase tracking-widest block">
                Feature Space
              </span>
              <span className="font-mono text-lg font-bold text-[var(--foreground)] mt-0.5 block">
                74 Features
              </span>
              <span className="text-[10px] font-mono text-[var(--muted-foreground)] block mt-0.5">Clin + Somatic + CNA</span>
            </div>
          </div>

          {/* Pipeline Details */}
          <div className="bg-[var(--muted)]/30 rounded-xl p-3.5 space-y-1.5 border border-[var(--border)]">
            <span className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-widest block">
              1. Training Pipeline & Cross-Validation Strategy
            </span>
            <p className="text-[var(--muted-foreground)] leading-relaxed text-[11px]">
              Trained on patient-stratified 5-fold cross-validation (<code className="font-mono bg-[var(--card)] px-1.5 py-0.5 rounded border border-[var(--border)] text-[var(--foreground)]">StratifiedGroupKFold</code>) to prevent data leakage between longitudinal metastases and primary resections from the same subject.
            </p>
            <p className="text-[var(--muted-foreground)] leading-relaxed text-[11px]">
              Features are scaled with <code className="font-mono bg-[var(--card)] px-1.5 py-0.5 rounded border border-[var(--border)] text-[var(--foreground)]">StandardScaler</code> (<code className="font-mono">feature_scaler.joblib</code>) and class-imbalanced frequencies balanced with inverse sample weighting.
            </p>
          </div>

          {/* Algorithmic Architecture */}
          <div className="bg-[var(--muted)]/30 rounded-xl p-3.5 space-y-1.5 border border-[var(--border)]">
            <span className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-widest block">
              2. Algorithmic Architecture
            </span>
            <ul className="space-y-1 list-disc list-inside text-[var(--muted-foreground)] text-[11px]">
              <li>
                <strong className="text-[var(--foreground)]">Primary Classifier:</strong> Multiclass Gradient-Boosted Decision Trees (GBDT) with calibrated logit output.
              </li>
              <li>
                <strong className="text-[var(--foreground)]">Probability Calibration:</strong> Isotonic and Platt sigmoid scaling ensuring differential diagnostic probabilities sum to 1.0.
              </li>
              <li>
                <strong className="text-[var(--foreground)]">Explainability Engine:</strong> TreeSHAP local attribution providing additive feature attributions for top differential lineages.
              </li>
            </ul>
          </div>

          {/* Clinical Decision Support Notice */}
          <div className="p-3 bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200/50 dark:border-amber-800/50 rounded-xl text-amber-900 dark:text-amber-200 text-[11px] leading-relaxed">
            <strong className="text-amber-950 dark:text-amber-100">Clinical Decision Support Notice:</strong> Investigational prototype for tumors of unknown primary (CUP) and atypical metastatic presentations. Results must be correlated with immunohistochemistry (IHC) and formal histological pathology.
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[var(--border)] bg-[var(--muted)]/40 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-[var(--foreground)] bg-[var(--card)] border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors shadow-2xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
