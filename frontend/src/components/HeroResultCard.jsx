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
    const text = `Predicted Tumor of Origin: ${prediction.name} (${prob}% confidence, OncoTree: ${mapping.oncoTree}, ICD-O-3: ${mapping.icdO3})`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`bg-white rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_1px_2px_rgba(0,0,0,0.03)] transition-opacity duration-150 ${
      isCalculating ? 'opacity-60' : 'opacity-100'
    }`}>
      
      {/* Header Bar */}
      <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-teal-600 inline-block shadow-xs" />
          <span className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase">
            Top Consensus Lineage
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono text-slate-400">
            Rank #1 (58-Class Model)
          </span>
          <button
            type="button"
            onClick={handleCopySummary}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
            title="Copy clinical report"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          
          {/* Identity & Nomenclature */}
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-slate-400">
              <span className="bg-teal-50/70 text-teal-900 px-2 py-0.5 rounded-md font-semibold border border-teal-200/50">
                {mapping.oncoTree}
              </span>
              <span>•</span>
              <span>ICD-O-3: {mapping.icdO3}</span>
              <span>•</span>
              <span>{mapping.system}</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-sans">
              {prediction.name}
            </h3>

            <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
              Multivariate somatic vector aligns primary neoplasm to <strong className="text-slate-800 font-medium">{prediction.name}</strong> based on targeted genomic sequence alterations.
            </p>
          </div>

          {/* Seamless Confidence Card */}
          <div className="bg-slate-50/60 rounded-xl p-4 sm:w-48 shrink-0 flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center border border-slate-100">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Diagnostic Confidence
            </span>

            <div className="my-1">
              <span className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-slate-900">
                {prob.toFixed(1)}%
              </span>
            </div>

            <div className="flex items-center space-x-1">
              {isHighConfidence ? (
                <span className="inline-flex items-center text-teal-900 bg-teal-100/70 px-2 py-0.5 rounded-full font-mono text-[10px] font-medium border border-teal-200/50">
                  <CheckCircle2 className="w-3 h-3 mr-1 text-teal-700" />
                  High Consensus
                </span>
              ) : isModerateConfidence ? (
                <span className="inline-flex items-center text-slate-700 bg-slate-200/70 px-2 py-0.5 rounded-full font-mono text-[10px] font-medium">
                  Moderate
                </span>
              ) : (
                <span className="inline-flex items-center text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-full font-mono text-[10px] font-medium border border-amber-200/50">
                  <AlertTriangle className="w-3 h-3 mr-1 text-amber-700" />
                  Equivocal
                </span>
              )}
            </div>
          </div>

        </div>

        {/* Diagnostic Metadata Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-400 font-mono gap-2">
          <div className="flex items-center space-x-2">
            <span>Tissue: {inputs.sampleType === 1 ? 'Metastatic' : 'Primary'}</span>
            <span className="text-slate-300">/</span>
            <span>Sex: {inputs.sex === 1 ? 'Male' : 'Female'}</span>
            <span className="text-slate-300">/</span>
            <span>FGA: {inputs.fga.toFixed(2)}</span>
            <span className="text-slate-300">/</span>
            <span>TMB: {inputs.mutationCount}</span>
          </div>

          <div className="text-[10px] text-slate-400">
            Calibrated Platt Softmax
          </div>
        </div>

      </div>

    </div>
  );
}
