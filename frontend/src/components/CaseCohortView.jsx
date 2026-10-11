import { FolderGit2, CheckCircle2, ArrowRight } from 'lucide-react';
import { PRESET_CASES } from '../data/mockModel';

export default function CaseCohortView({ currentPresetId, onSelectPreset, onSwitchToDashboard }) {
  return (
    <div className="space-y-6">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            Case Cohort Directory
          </h2>
          <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
            MSK-IMPACT reference genomic profiles with clinical ground-truth pathology
          </p>
        </div>

        <div className="inline-flex items-center space-x-2 bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)] text-xs font-semibold px-3 py-1.5 rounded-full border border-teal-200/60 shadow-2xs">
          <FolderGit2 className="w-3.5 h-3.5" />
          <span>5 Reference Benchmark Cases</span>
        </div>
      </div>

      {/* Cohort Table Card */}
      <div className="bg-[var(--card)] rounded-xl p-4 sm:p-5 border border-[var(--border)] shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-[var(--foreground)] tracking-tight">
              Standardized Diagnostic Benchmark Samples
            </h3>
            <p className="text-xs text-[var(--muted-foreground)]">
              Select any benchmark profile to immediately load all somatic mutations and evaluate differential consensus
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[var(--border)] text-xs">
            <thead className="bg-[var(--muted)]/50 rounded-lg">
              <tr>
                <th scope="col" className="px-4 py-3 text-left font-semibold text-[var(--muted-foreground)] uppercase tracking-wider text-[11px]">
                  Case Identifier & Lineage
                </th>
                <th scope="col" className="px-4 py-3 text-left font-semibold text-[var(--muted-foreground)] uppercase tracking-wider text-[11px]">
                  Clinical Baseline
                </th>
                <th scope="col" className="px-4 py-3 text-left font-semibold text-[var(--muted-foreground)] uppercase tracking-wider text-[11px]">
                  Genomic Instability
                </th>
                <th scope="col" className="px-4 py-3 text-left font-semibold text-[var(--muted-foreground)] uppercase tracking-wider text-[11px]">
                  Key Somatic Alterations
                </th>
                <th scope="col" className="px-4 py-3 text-right font-semibold text-[var(--muted-foreground)] uppercase tracking-wider text-[11px]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] bg-[var(--card)]">
              {PRESET_CASES.map((preset) => {
                const isActive = currentPresetId === preset.id;
                const mutatedGenes = Object.entries(preset.data.mutations)
                  .filter(([, val]) => val === 1)
                  .map(([gene]) => gene);

                return (
                  <tr
                    key={preset.id}
                    className={`transition-colors ${
                      isActive ? 'bg-[var(--sidebar-accent)]/40' : 'hover:bg-[var(--muted)]/50'
                    }`}
                  >
                    {/* Identifier */}
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-sm text-[var(--foreground)]">
                        {preset.label}
                      </div>
                      <div className="text-xs text-[var(--muted-foreground)] mt-0.5 leading-snug max-w-sm">
                        {preset.description}
                      </div>
                      {isActive && (
                        <span className="inline-flex items-center text-[10px] font-bold text-[var(--sidebar-accent-foreground)] bg-[var(--card)] px-2 py-0.5 rounded-full mt-1.5 border border-teal-200 dark:border-teal-700 shadow-2xs">
                          <CheckCircle2 className="w-3 h-3 mr-1" style={{ color: 'var(--primary)' }} />
                          Currently Active in Workbench
                        </span>
                      )}
                    </td>

                    {/* Baseline Demographics */}
                    <td className="px-4 py-3.5 font-medium text-[var(--foreground)]">
                      <div>{preset.data.sex === 0 ? 'Female [0]' : 'Male [1]'}</div>
                      <div className="text-[var(--muted-foreground)] text-[11px] mt-0.5">
                        {preset.data.sampleType === 1 ? 'Metastatic [1]' : 'Primary [0]'}
                      </div>
                    </td>

                    {/* Genomic Instability */}
                    <td className="px-4 py-3.5 font-mono text-[var(--foreground)]">
                      <div className="font-bold">{preset.data.fga.toFixed(2)} FGA</div>
                      <div className="text-[11px] text-[var(--muted-foreground)] font-sans mt-0.5">
                        {preset.data.mutationCount} somatic muts
                      </div>
                    </td>

                    {/* Key Alterations */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {mutatedGenes.map((gene) => (
                          <span
                            key={gene}
                            className="inline-flex items-center px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)] border border-teal-200/60 dark:border-teal-700/60"
                          >
                            {gene}
                          </span>
                        ))}
                        {mutatedGenes.length === 0 && (
                          <span className="text-[var(--muted-foreground)] text-[11px]">All Wild-Type</span>
                        )}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectPreset(preset.id);
                          if (onSwitchToDashboard) {
                            onSwitchToDashboard();
                          }
                        }}
                        className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-2xs cursor-pointer ${
                          isActive
                            ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700'
                            : 'hover:opacity-95'
                        }`}
                        style={!isActive ? { backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' } : {}}
                      >
                        <span>{isActive ? 'View Diagnosis' : 'Activate Case'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
