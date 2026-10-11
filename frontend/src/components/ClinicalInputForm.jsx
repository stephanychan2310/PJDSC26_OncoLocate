import { useState } from 'react';
import { 
  Play, 
  RotateCcw, 
  Search 
} from 'lucide-react';
import Tooltip from './Tooltip';
import { GENE_DEFINITIONS } from '../data/mockModel';

export default function ClinicalInputForm({ 
  inputs, 
  onChange, 
  onRunInference, 
  isCalculating,
  liveInference,
  setLiveInference 
}) {
  const [geneSearch, setGeneSearch] = useState('');

  const handleSexChange = (val) => {
    onChange({ ...inputs, sex: Number(val) });
  };

  const handleSampleTypeChange = (val) => {
    onChange({ ...inputs, sampleType: Number(val) });
  };

  const handleFgaChange = (val) => {
    const num = Math.min(1.0, Math.max(0.0, parseFloat(val) || 0));
    onChange({ ...inputs, fga: parseFloat(num.toFixed(2)) });
  };

  const handleMutationCountChange = (val) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    onChange({ ...inputs, mutationCount: num });
  };

  const toggleGene = (geneSymbol) => {
    const current = inputs.mutations[geneSymbol] || 0;
    onChange({
      ...inputs,
      mutations: {
        ...inputs.mutations,
        [geneSymbol]: current === 1 ? 0 : 1,
      },
    });
  };

  const handleClearAllGenes = () => {
    const cleared = {};
    Object.keys(inputs.mutations).forEach((k) => {
      cleared[k] = 0;
    });
    onChange({ ...inputs, mutations: cleared });
  };

  const handleSetCommonDrivers = () => {
    onChange({
      ...inputs,
      mutations: {
        ...inputs.mutations,
        TP53: 1,
        KRAS: 1,
      },
    });
  };

  const mutatedCount = Object.values(inputs.mutations).filter((v) => v === 1).length;

  const filteredGenes = GENE_DEFINITIONS.filter((g) => 
    g.symbol.toLowerCase().includes(geneSearch.toLowerCase()) ||
    g.name.toLowerCase().includes(geneSearch.toLowerCase()) ||
    g.pathway.toLowerCase().includes(geneSearch.toLowerCase())
  );

  return (
    <div className="bg-[var(--card)] rounded-xl p-4 border border-[var(--border)] shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-4">
      
      {/* Header bar with Auto-calc */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
        <div>
          <h2 className="text-sm sm:text-base font-semibold text-[var(--foreground)] tracking-tight">
            Diagnostic Inputs
          </h2>
          <p className="text-xs text-[var(--muted-foreground)]">
            Patient clinical priors & NGS genomic profile
          </p>
        </div>

        <label className="flex items-center space-x-1.5 cursor-pointer text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] select-none">
          <input
            type="checkbox"
            checked={liveInference}
            onChange={(e) => setLiveInference(e.target.checked)}
            className="rounded border-[var(--border)] text-teal-700 focus:ring-teal-600 h-3.5 w-3.5 accent-[#0f766e]"
          />
          <span className="font-medium text-xs">Live Auto-calc</span>
        </label>
      </div>

      {/* SECTION 1: CLINICAL BASELINE */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">
          Clinical Baseline
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          {/* Patient Sex */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)] flex items-center">
                Patient Sex
                <Tooltip text="Biological sex encoded as Female [0] or Male [1]." />
              </span>
              <span className="font-mono text-xs text-[var(--muted-foreground)]">[{inputs.sex}]</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 bg-[var(--muted)] p-1 rounded-xl border border-[var(--border)]">
              <button
                type="button"
                onClick={() => handleSexChange(0)}
                className={`py-1.5 text-xs font-medium rounded-lg transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                  inputs.sex === 0
                    ? 'shadow-xs font-semibold'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
                style={inputs.sex === 0 ? { backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' } : {}}
              >
                <span>Female</span>
                <span className="font-mono text-xs opacity-75">[0]</span>
              </button>
              <button
                type="button"
                onClick={() => handleSexChange(1)}
                className={`py-1.5 text-xs font-medium rounded-lg transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                  inputs.sex === 1
                    ? 'shadow-xs font-semibold'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
                style={inputs.sex === 1 ? { backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' } : {}}
              >
                <span>Male</span>
                <span className="font-mono text-xs opacity-75">[1]</span>
              </button>
            </div>
          </div>

          {/* Sample Type */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)] flex items-center">
                Sample Origin
                <Tooltip text="Primary tumor site [0] vs Metastatic lesion [1]." />
              </span>
              <span className="font-mono text-xs text-[var(--muted-foreground)]">[{inputs.sampleType}]</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 bg-[var(--muted)] p-1 rounded-xl border border-[var(--border)]">
              <button
                type="button"
                onClick={() => handleSampleTypeChange(0)}
                className={`py-1.5 text-xs font-medium rounded-lg transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                  inputs.sampleType === 0
                    ? 'shadow-xs font-semibold'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
                style={inputs.sampleType === 0 ? { backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' } : {}}
              >
                <span>Primary</span>
                <span className="font-mono text-xs opacity-75">[0]</span>
              </button>
              <button
                type="button"
                onClick={() => handleSampleTypeChange(1)}
                className={`py-1.5 text-xs font-medium rounded-lg transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                  inputs.sampleType === 1
                    ? 'shadow-xs font-semibold'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
                style={inputs.sampleType === 1 ? { backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' } : {}}
              >
                <span>Metastatic</span>
                <span className="font-mono text-xs opacity-75">[1]</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* SECTION 2: GENOMIC BURDEN METRICS */}
      <div className="space-y-3 pt-1">
        <h3 className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">
          Genomic Instability & Mutational Burden
        </h3>

        {/* FGA input and slider */}
        <div className="bg-[var(--muted)]/50 p-3.5 rounded-xl border border-[var(--border)] space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="fga-token-input" className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)] flex items-center">
              Fraction Genome Altered (FGA)
              <Tooltip text="Fraction of sequenced tumor genome affected by somatic copy number alterations." />
            </label>

            <div className="flex items-center space-x-2">
              <span className={`font-mono text-xs font-bold px-2.5 py-0.5 rounded-full ${
                inputs.fga < 0.20 
                  ? 'bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300' 
                  : inputs.fga <= 0.45 
                  ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300' 
                  : 'bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300'
              }`}>
                {inputs.fga < 0.20 ? 'Low CIN' : inputs.fga <= 0.45 ? 'Moderate CIN' : 'High CIN'}
              </span>

              <div className="flex items-center space-x-1 bg-[var(--card)] px-2 py-0.5 rounded-lg border border-[var(--border)] shadow-2xs">
                <input
                  id="fga-token-input"
                  type="number"
                  min="0.00"
                  max="1.00"
                  step="0.01"
                  aria-label="Fraction Genome Altered value"
                  value={inputs.fga}
                  onChange={(e) => handleFgaChange(e.target.value)}
                  className="w-12 text-xs text-right font-mono font-bold text-[var(--foreground)] bg-transparent focus:outline-none"
                />
                <span className="text-[var(--muted-foreground)] font-mono text-xs">/1</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 pt-1">
            <span className="font-mono text-xs text-[var(--muted-foreground)]">0.00</span>
            <input
              type="range"
              min="0.00"
              max="1.00"
              step="0.01"
              aria-label="Fraction Genome Altered range slider"
              value={inputs.fga}
              onChange={(e) => handleFgaChange(e.target.value)}
              className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#0f766e]"
            />
            <span className="font-mono text-xs text-[var(--muted-foreground)]">1.00</span>
          </div>
        </div>

        {/* TMB / Mutation count */}
        <div className="bg-[var(--muted)]/50 p-3.5 rounded-xl border border-[var(--border)] space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="tmb-token-input" className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)] flex items-center">
              Mutation Count / TMB
              <Tooltip text="Non-synonymous somatic mutation count across MSK-IMPACT target capture panel." />
            </label>

            <div className="flex items-center space-x-2">
              <span className={`font-mono text-xs font-bold px-2.5 py-0.5 rounded-full ${
                inputs.mutationCount < 10 
                  ? 'bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300' 
                  : inputs.mutationCount <= 20 
                  ? 'bg-teal-100 dark:bg-teal-950/50 text-teal-800 dark:text-teal-300' 
                  : 'bg-purple-100 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300'
              }`}>
                {inputs.mutationCount < 10 ? 'TMB-Low' : inputs.mutationCount <= 20 ? 'TMB-Int' : 'TMB-High'}
              </span>

              <div className="flex items-center space-x-1 bg-[var(--card)] px-2 py-0.5 rounded-lg border border-[var(--border)] shadow-2xs">
                <input
                  id="tmb-token-input"
                  type="number"
                  min="0"
                  max="500"
                  step="1"
                  aria-label="Mutation count value"
                  value={inputs.mutationCount}
                  onChange={(e) => handleMutationCountChange(e.target.value)}
                  className="w-14 text-xs text-right font-mono font-bold text-[var(--foreground)] bg-transparent focus:outline-none"
                />
                <span className="text-[var(--muted-foreground)] font-mono text-xs">muts</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <span className="text-xs font-mono text-[var(--muted-foreground)] mr-1">Presets:</span>
            {[2, 8, 15, 30, 60].map((presetVal) => (
              <button
                key={presetVal}
                type="button"
                onClick={() => handleMutationCountChange(presetVal)}
                className={`px-2 py-0.5 text-xs font-mono rounded-lg transition-colors cursor-pointer ${
                  inputs.mutationCount === presetVal
                    ? 'font-bold shadow-2xs'
                    : 'bg-[var(--card)] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-[var(--border)]'
                }`}
                style={inputs.mutationCount === presetVal ? { backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' } : {}}
              >
                {presetVal}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* SECTION 3: SOMATIC GENE CHECKLIST */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">
              Somatic Gene Checklist
            </h3>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)] border border-teal-200/60 dark:border-teal-700/60">
              {mutatedCount}/{GENE_DEFINITIONS.length} Mutated
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              onClick={handleSetCommonDrivers}
              className="px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-[var(--border)] rounded-lg transition-colors cursor-pointer"
            >
              TP53+KRAS
            </button>
            <button
              type="button"
              onClick={handleClearAllGenes}
              className="px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-[var(--border)] rounded-lg transition-colors cursor-pointer"
            >
              All WT
            </button>
          </div>
        </div>

        {/* Filter input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <input
            type="text"
            placeholder="Search gene symbol or pathway..."
            value={geneSearch}
            onChange={(e) => setGeneSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-[var(--muted)] border border-[var(--border)] rounded-lg focus:bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-teal-600 font-sans"
          />
        </div>

        {/* Gene Chips */}
        <div className="grid grid-cols-2 gap-2 max-h-[250px] overflow-y-auto pr-1">
          {filteredGenes.map((gene) => {
            const isMutated = (inputs.mutations[gene.symbol] || 0) === 1;

            return (
              <button
                key={gene.symbol}
                type="button"
                onClick={() => toggleGene(gene.symbol)}
                className={`p-2.5 rounded-lg border transition-all text-left flex items-center justify-between cursor-pointer ${
                  isMutated
                    ? 'bg-[var(--sidebar-accent)] border-teal-200/80 dark:border-teal-700/80 text-[var(--sidebar-accent-foreground)] shadow-2xs'
                    : 'bg-[var(--card)] border-[var(--border)] hover:bg-[var(--muted)] text-slate-700 dark:text-slate-200'
                }`}
              >
                <div className="min-w-0 pr-1">
                  <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-100 block">
                    {gene.symbol}
                  </span>
                  <p className="text-[10px] text-[var(--muted-foreground)] truncate leading-tight mt-0.5">
                    {gene.pathway}
                  </p>
                </div>

                <span className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded-full ${
                  isMutated
                    ? 'shadow-2xs text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
                style={isMutated ? { backgroundColor: 'var(--primary)' } : {}}
                >
                  {isMutated ? 'MUT' : 'WT'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* PRIMARY ACTION: bg-[var(--primary)] hover:opacity-95 text-[var(--primary-foreground)] rounded-xl font-medium px-4 py-2.5 */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onRunInference}
          disabled={isCalculating}
          className="w-full inline-flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl font-medium text-sm transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-1 disabled:opacity-50 cursor-pointer hover:opacity-95"
          style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
        >
          {isCalculating ? (
            <>
              <RotateCcw className="w-4 h-4 animate-spin" />
              <span>Executing Model Inference...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Run Diagnostic Inference</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}
