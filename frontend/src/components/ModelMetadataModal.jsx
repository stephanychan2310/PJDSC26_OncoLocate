import { X, Database } from 'lucide-react';

export default function ModelMetadataModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl border border-slate-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] max-w-2xl w-full overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-teal-800 flex items-center justify-center text-white">
              <Database className="w-3.5 h-3.5 text-teal-200" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-900 tracking-tight uppercase">
                Model Specification & Reference Architecture
              </h3>
              <p className="text-[10px] font-mono text-slate-400">
                MSK-IMPACT Pan-Cancer Tumor of Origin Classifier
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs text-slate-700 max-h-[75vh] overflow-y-auto">
          
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest block">
                Target Entities
              </span>
              <span className="font-mono text-lg font-bold text-slate-900 mt-0.5 block">
                58 Classes
              </span>
              <span className="text-[10px] font-mono text-slate-400 block mt-0.5">MSK OncoTree</span>
            </div>

            <div className="p-3 rounded-xl bg-teal-50/60 border border-teal-100">
              <span className="text-[10px] text-teal-800 font-semibold uppercase tracking-widest block">
                Validation AUC
              </span>
              <span className="font-mono text-lg font-bold text-teal-900 mt-0.5 block">
                0.941
              </span>
              <span className="text-[10px] font-mono text-teal-700 block mt-0.5">Macro Stratified</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest block">
                Cohort Size
              </span>
              <span className="font-mono text-lg font-bold text-slate-900 mt-0.5 block">
                10,945
              </span>
              <span className="text-[10px] font-mono text-slate-400 block mt-0.5">MSK-IMPACT 2017</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest block">
                Feature Space
              </span>
              <span className="font-mono text-lg font-bold text-slate-900 mt-0.5 block">
                74 Features
              </span>
              <span className="text-[10px] font-mono text-slate-400 block mt-0.5">Clin + Somatic + CNA</span>
            </div>
          </div>

          {/* Pipeline Details */}
          <div className="bg-slate-50/50 rounded-xl p-3.5 space-y-1.5 border border-slate-100">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block">
              1. Training Pipeline & Cross-Validation Strategy
            </span>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Trained on patient-stratified 5-fold cross-validation (<code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200/60 text-slate-800">StratifiedGroupKFold</code>) to prevent data leakage between longitudinal metastases and primary resections from the same subject.
            </p>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Features are scaled with <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200/60 text-slate-800">StandardScaler</code> (<code className="font-mono">feature_scaler.joblib</code>) and class-imbalanced frequencies balanced with inverse sample weighting.
            </p>
          </div>

          {/* Algorithmic Architecture */}
          <div className="bg-slate-50/50 rounded-xl p-3.5 space-y-1.5 border border-slate-100">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block">
              2. Algorithmic Architecture
            </span>
            <ul className="space-y-1 list-disc list-inside text-slate-600 text-[11px]">
              <li>
                <strong className="text-slate-800">Primary Classifier:</strong> Multiclass Gradient-Boosted Decision Trees (GBDT) with calibrated logit output.
              </li>
              <li>
                <strong className="text-slate-800">Probability Calibration:</strong> Isotonic and Platt sigmoid scaling ensuring differential diagnostic probabilities sum to 1.0.
              </li>
              <li>
                <strong className="text-slate-800">Explainability Engine:</strong> TreeSHAP local attribution providing additive feature attributions for top differential lineages.
              </li>
            </ul>
          </div>

          {/* Clinical Decision Support Notice */}
          <div className="p-3 bg-amber-50/60 border border-amber-200/50 rounded-xl text-amber-900 text-[11px] leading-relaxed">
            <strong className="text-amber-950">Clinical Decision Support Notice:</strong> Investigational prototype for tumors of unknown primary (CUP) and atypical metastatic presentations. Results must be correlated with immunohistochemistry (IHC) and formal histological pathology.
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200/70 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
