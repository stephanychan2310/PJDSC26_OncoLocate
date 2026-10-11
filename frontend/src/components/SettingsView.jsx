import { useState } from 'react';
import { 
  Sliders, 
  RotateCcw, 
  Check, 
  Cpu 
} from 'lucide-react';

export default function SettingsView() {
  const [actionabilityThreshold, setActionabilityThreshold] = useState(20);
  const [confidenceFloor, setConfidenceFloor] = useState(70);
  const [calibrationMethod, setCalibrationMethod] = useState('platt'); // 'platt' | 'isotonic'
  const [varianceFilter, setVarianceFilter] = useState(2.0);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setActionabilityThreshold(20);
    setConfidenceFloor(70);
    setCalibrationMethod('platt');
    setVarianceFilter(2.0);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            System Settings & Model Hyperparameters
          </h2>
          <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
            Calibrate decision cutoffs, confidence floors, and genomic filtering parameters
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 bg-[var(--card)] hover:bg-[var(--muted)] border border-[var(--border)] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
            <span>Restore Defaults</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-colors shadow-2xs cursor-pointer hover:opacity-95"
            style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            {saved ? <Check className="w-3.5 h-3.5" /> : null}
            <span>{saved ? 'Settings Saved' : 'Save Configuration'}</span>
          </button>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Card 1: Decision Thresholds */}
        <div className="bg-[var(--card)] rounded-xl p-4 sm:p-5 border border-[var(--border)] shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-[var(--border)]">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold border border-teal-200/60 dark:border-teal-700/60"
              style={{ backgroundColor: 'var(--sidebar-accent)', color: 'var(--sidebar-accent-foreground)' }}
            >
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-[var(--foreground)] tracking-tight">
                Clinical Decision Thresholds
              </h3>
              <p className="text-[11px] text-[var(--muted-foreground)]">
                Actionability and diagnostic certainty boundaries
              </p>
            </div>
          </div>

          {/* Actionability Threshold Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="actionability-range" className="font-semibold text-[var(--foreground)]">
                Actionability Cut-off Threshold
              </label>
              <span className="font-mono font-bold text-[var(--sidebar-accent-foreground)] bg-[var(--sidebar-accent)] px-2 py-0.5 rounded-md border border-teal-200/60 dark:border-teal-700/60">
                {actionabilityThreshold}% Probability
              </span>
            </div>
            <p className="text-[11px] text-[var(--muted-foreground)]">
              Draws the clinical reference line in the Differential Diagnoses bar chart.
            </p>
            <input
              id="actionability-range"
              type="range"
              min="10"
              max="50"
              step="1"
              value={actionabilityThreshold}
              onChange={(e) => setActionabilityThreshold(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#0f766e]"
            />
          </div>

          {/* Confidence Floor Slider */}
          <div className="space-y-1.5 pt-2 border-t border-[var(--border)]">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="confidence-floor-range" className="font-semibold text-[var(--foreground)]">
                High Consensus Confidence Floor
              </label>
              <span className="font-mono font-bold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 px-2 py-0.5 rounded-md border border-teal-200/60 dark:border-teal-800/60">
                {confidenceFloor}% Threshold
              </span>
            </div>
            <p className="text-[11px] text-[var(--muted-foreground)]">
              Minimum posterior probability required to trigger the "High Certainty" clinical badge.
            </p>
            <input
              id="confidence-floor-range"
              type="range"
              min="50"
              max="90"
              step="5"
              value={confidenceFloor}
              onChange={(e) => setConfidenceFloor(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#0f766e]"
            />
          </div>
        </div>

        {/* Card 2: Algorithm & Pipeline */}
        <div className="bg-[var(--card)] rounded-xl p-4 sm:p-5 border border-[var(--border)] shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-[var(--border)]">
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold border border-purple-200/60 dark:border-purple-800/60">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-[var(--foreground)] tracking-tight">
                Model Pipeline & Calibration
              </h3>
              <p className="text-[11px] text-[var(--muted-foreground)]">
                Probability scaling and genomic filtering engines
              </p>
            </div>
          </div>

          {/* Calibration Method */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--foreground)] block">
              Probability Calibration Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCalibrationMethod('platt')}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                  calibrationMethod === 'platt'
                    ? 'bg-[var(--sidebar-accent)] border-teal-200 dark:border-teal-700 text-[var(--sidebar-accent-foreground)] font-bold shadow-2xs'
                    : 'bg-[var(--muted)]/40 border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--card)]'
                }`}
              >
                <div className="font-bold">Platt Sigmoid</div>
                <div className="text-[10px] text-[var(--muted-foreground)] mt-0.5">Smooth logit scaling</div>
              </button>
              <button
                type="button"
                onClick={() => setCalibrationMethod('isotonic')}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                  calibrationMethod === 'isotonic'
                    ? 'bg-[var(--sidebar-accent)] border-teal-200 dark:border-teal-700 text-[var(--sidebar-accent-foreground)] font-bold shadow-2xs'
                    : 'bg-[var(--muted)]/40 border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--card)]'
                }`}
              >
                <div className="font-bold">Isotonic Regression</div>
                <div className="text-[10px] text-[var(--muted-foreground)] mt-0.5">Non-parametric fit</div>
              </button>
            </div>
          </div>

          {/* Genomic Variant Variance Filter */}
          <div className="space-y-1.5 pt-2 border-t border-[var(--border)]">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="variance-filter-range" className="font-semibold text-[var(--foreground)]">
                Cohort Genomic Variance Filter
              </label>
              <span className="font-mono font-bold text-[var(--foreground)] bg-[var(--muted)] px-2 py-0.5 rounded-md">
                {varianceFilter.toFixed(1)}% Sample Frequency
              </span>
            </div>
            <p className="text-[11px] text-[var(--muted-foreground)]">
              Filters rare variants across the MSK-IMPACT cohort below this threshold.
            </p>
            <input
              id="variance-filter-range"
              type="range"
              min="1.0"
              max="5.0"
              step="0.5"
              value={varianceFilter}
              onChange={(e) => setVarianceFilter(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#0f766e]"
            />
          </div>
        </div>

      </div>

    </div>
  );
}
