import { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Check 
} from 'lucide-react';
import { CANCER_CODE_MAPPING } from '../data/mockModel';

export default function HeroResultCard({ prediction, inputs, isCalculating }) {
  const [copied, setCopied] = useState(false);

  if (!prediction) return null;

  const mapping = CANCER_CODE_MAPPING[prediction.name] || {
    code: 'UNK',
    oncoTree: 'TUMOR',
    icdO3: '8000/3',
    system: 'Undetermined Lineage',
  };

  const prob = prediction.probability;
  const isHighConfidence = prob >= 70;
  const isModerateConfidence = prob >= 40 && prob < 70;

  const handleCopySummary = () => {
    const text = `Predicted Tumor Origin: ${prediction.name} (${prob}% confidence, OncoTree: ${mapping.oncoTree}, ICD-O-3: ${mapping.icdO3})`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`bg-[var(--card)] rounded-xl p-4 border border-[var(--border)] shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-opacity duration-150 ${
      isCalculating ? 'opacity-60' : 'opacity-100'
    }`}>
      
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full shadow-xs" style={{ backgroundColor: 'var(--primary)' }} />
          <span className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">
            Primary Predicted Cancer Classification
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono text-[var(--sidebar-accent-foreground)] bg-[var(--sidebar-accent)] px-2.5 py-0.5 rounded-full border border-teal-200/60 dark:border-teal-700/60 font-semibold">
            OncoTree: {mapping.oncoTree}
          </span>
          <button
            type="button"
            onClick={handleCopySummary}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Copy diagnostic summary"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Left: Disease Title & Pathology details */}
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[var(--muted-foreground)]">
            <span className="bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)] px-2.5 py-0.5 rounded-full font-bold border border-teal-200/60 dark:border-teal-700/60">
              {mapping.code}
            </span>
            <span>•</span>
            <span>ICD-O-3: {mapping.icdO3}</span>
            <span>•</span>
            <span>{mapping.system}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] tracking-tight font-sans break-words whitespace-normal leading-snug">
            {prediction.name}
          </h2>

          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed max-w-xl">
            Somatic mutation profile and chromosomal copy-number metrics align primary lineage origin to <strong className="text-[var(--foreground)] font-semibold">{prediction.name}</strong>.
          </p>
        </div>

        {/* Right: Confidence Score Badge */}
        <div className="bg-[var(--sidebar-accent)]/50 border border-teal-200/70 dark:border-teal-800/70 rounded-xl p-3.5 sm:w-48 shrink-0 flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--sidebar-accent-foreground)]">
            Model Confidence
          </span>

          <div className="my-1">
            <span className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-[var(--sidebar-accent-foreground)]">
              {prob.toFixed(1)}%
            </span>
          </div>

          <div className="flex items-center space-x-1">
            {isHighConfidence ? (
              <span className="inline-flex items-center text-teal-900 dark:text-teal-200 bg-white dark:bg-slate-800 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold border border-teal-200 dark:border-teal-700 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" style={{ color: 'var(--primary)' }} />
                High Certainty
              </span>
            ) : isModerateConfidence ? (
              <span className="inline-flex items-center text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold border border-slate-300 dark:border-slate-700">
                Moderate
              </span>
            ) : (
              <span className="inline-flex items-center text-amber-800 dark:text-amber-200 bg-white dark:bg-slate-800 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold border border-amber-200 dark:border-amber-700">
                <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600" />
                Equivocal
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Footer Info */}
      <div className="mt-3 pt-2.5 border-t border-[var(--border)] flex flex-wrap items-center justify-between text-xs text-[var(--muted-foreground)] font-mono gap-2">
        <div className="flex items-center space-x-2">
          <span>Biopsy: {inputs.sampleType === 1 ? 'Metastasis' : 'Primary Site'}</span>
          <span className="text-[var(--border)]">•</span>
          <span>Patient: {inputs.sex === 1 ? 'Male' : 'Female'}</span>
        </div>

        <div className="text-xs text-[var(--muted-foreground)]">
          Ensemble TreeSHAP + Platt Scaled Logit
        </div>
      </div>

    </div>
  );
}
