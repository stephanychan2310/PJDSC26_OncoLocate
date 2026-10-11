import { 
  Activity, 
  Layers, 
  Dna, 
  ShieldCheck 
} from 'lucide-react';

export default function TopMetricCards({ prediction, inputs }) {
  if (!prediction) return null;

  const mutatedCount = Object.values(inputs.mutations || {}).filter((v) => v === 1).length;

  const cinCategory = inputs.fga < 0.20 ? 'Low CIN' : inputs.fga <= 0.45 ? 'Moderate CIN' : 'High CIN';
  const tmbCategory = inputs.mutationCount < 10 ? 'TMB-Low' : inputs.mutationCount <= 20 ? 'TMB-Intermediate' : 'TMB-High';

  const hasTargetable = (inputs.mutations.EGFR === 1) || (inputs.mutations.BRAF === 1) || (inputs.mutations.PIK3CA === 1);
  const actionabilityVal = hasTargetable ? 'Category 1' : 'Category 2';
  const actionabilityTag = hasTargetable ? 'FDA Targeted' : 'Standard Care';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* Card 1: Top Predicted Origin (No text truncation / break-words) */}
      <div className="bg-[var(--card)] rounded-xl p-4 border border-[var(--border)] shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex items-start justify-between min-h-[110px]">
        <div className="space-y-1.5 flex-1 pr-2">
          <span className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)] block">
            Top Predicted Origin
          </span>
          <div className="text-lg sm:text-xl font-bold text-[var(--foreground)] leading-tight break-words">
            {prediction.name}
          </div>
          <span className="inline-flex items-center text-[10px] font-bold text-[var(--sidebar-accent-foreground)] bg-[var(--sidebar-accent)] px-2 py-0.5 rounded-full border border-teal-200/60 dark:border-teal-700/60 font-mono">
            {prediction.probability.toFixed(1)}% Conf
          </span>
        </div>
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs mt-1 border border-teal-200/60 dark:border-teal-700/60"
          style={{ backgroundColor: 'var(--sidebar-accent)', color: 'var(--sidebar-accent-foreground)' }}
        >
          <Activity className="w-5 h-5" />
        </div>
      </div>

      {/* Card 2: Genomic Burden */}
      <div className="bg-[var(--card)] rounded-xl p-4 border border-[var(--border)] shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex items-start justify-between min-h-[110px]">
        <div className="space-y-1.5 flex-1 pr-2">
          <span className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)] block">
            Genomic Burden
          </span>
          <div className="text-2xl font-bold font-mono text-[var(--foreground)] tracking-tight">
            {inputs.fga.toFixed(2)} FGA
          </div>
          <span className="inline-flex items-center text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-200/60 dark:border-amber-800/60 font-mono">
            {cinCategory}
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/60 dark:border-amber-800/60 flex items-center justify-center text-amber-700 dark:text-amber-300 shrink-0 shadow-2xs mt-1">
          <Layers className="w-5 h-5" />
        </div>
      </div>

      {/* Card 3: Somatic Mutations */}
      <div className="bg-[var(--card)] rounded-xl p-4 border border-[var(--border)] shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex items-start justify-between min-h-[110px]">
        <div className="space-y-1.5 flex-1 pr-2">
          <span className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)] block">
            Somatic Mutations
          </span>
          <div className="text-2xl font-bold font-mono text-[var(--foreground)] tracking-tight">
            {mutatedCount} / 16 Mut
          </div>
          <span className="inline-flex items-center text-[10px] font-bold text-purple-800 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded-full border border-purple-200/60 dark:border-purple-800/60 font-mono">
            {tmbCategory}
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200/60 dark:border-purple-800/60 flex items-center justify-center text-purple-700 dark:text-purple-300 shrink-0 shadow-2xs mt-1">
          <Dna className="w-5 h-5" />
        </div>
      </div>

      {/* Card 4: Actionability */}
      <div className="bg-[var(--card)] rounded-xl p-4 border border-[var(--border)] shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex items-start justify-between min-h-[110px]">
        <div className="space-y-1.5 flex-1 pr-2">
          <span className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)] block">
            Actionability
          </span>
          <div className="text-2xl font-bold text-[var(--foreground)] tracking-tight">
            {actionabilityVal}
          </div>
          <span className="inline-flex items-center text-[10px] font-bold text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-full border border-rose-200/60 dark:border-rose-800/60 font-mono">
            {actionabilityTag}
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200/60 dark:border-rose-800/60 flex items-center justify-center text-rose-700 dark:text-rose-300 shrink-0 shadow-2xs mt-1">
          <ShieldCheck className="w-5 h-5" />
        </div>
      </div>

    </div>
  );
}
