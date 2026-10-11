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
    <div className="bg-white rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_1px_2px_rgba(0,0,0,0.03)] flex flex-col">
      
      {/* Panel Header */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-1.5 h-1.5 rounded-full bg-teal-600" />
          <h2 className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase">
            Diagnostic Parameters
          </h2>
        </div>

        {/* Live Calculation Checkbox */}
        <label className="flex items-center space-x-1.5 cursor-pointer text-xs text-slate-500 hover:text-slate-800 select-none">
          <input
            type="checkbox"
            checked={liveInference}
            onChange={(e) => setLiveInference(e.target.checked)}
            className="rounded border-slate-300 text-teal-700 focus:ring-teal-600 h-3.5 w-3.5 accent-teal-700"
          />
          <span className="font-mono text-[11px] text-slate-500">Auto-calc</span>
        </label>
      </div>

      <div className="p-4 space-y-4">
        
        {/* SECTION 1: CLINICAL DEMOGRAPHICS & BIOPSY (Soft shaded background block) */}
        <div className="bg-slate-50/60 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase">
              1. Baseline Prior
            </span>
            <span className="font-mono text-[10px] text-slate-400">Clinical context</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Patient Sex */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-slate-700 flex items-center font-medium">
                  Patient Sex
                  <Tooltip text="Biological sex encoded as Female [0] or Male [1]. Informs lineage prior probabilities." />
                </span>
                <span className="font-mono text-[10px] text-slate-400">[{inputs.sex}]</span>
              </div>
              <div className="bg-slate-200/60 p-0.5 rounded-lg inline-flex w-full">
                <button
                  type="button"
                  onClick={() => handleSexChange(0)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center space-x-1.5 ${
                    inputs.sex === 0
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Female</span>
                  <span className="font-mono text-[10px] text-slate-400">[0]</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSexChange(1)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center space-x-1.5 ${
                    inputs.sex === 1
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Male</span>
                  <span className="font-mono text-[10px] text-slate-400">[1]</span>
                </button>
              </div>
            </div>

            {/* Sample Origin */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-slate-700 flex items-center font-medium">
                  Sample Origin
                  <Tooltip text="Primary tumor resection site [0] vs distant metastatic biopsy [1]." />
                </span>
                <span className="font-mono text-[10px] text-slate-400">[{inputs.sampleType}]</span>
              </div>
              <div className="bg-slate-200/60 p-0.5 rounded-lg inline-flex w-full">
                <button
                  type="button"
                  onClick={() => handleSampleTypeChange(0)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center space-x-1.5 ${
                    inputs.sampleType === 0
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Primary</span>
                  <span className="font-mono text-[10px] text-slate-400">[0]</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSampleTypeChange(1)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center space-x-1.5 ${
                    inputs.sampleType === 1
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Metastatic</span>
                  <span className="font-mono text-[10px] text-slate-400">[1]</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* SECTION 2: GENOMIC BURDEN METRICS (Soft shaded background block) */}
        <div className="bg-slate-50/60 rounded-xl p-3.5 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase">
              2. Genomic Burden
            </span>
            <span className="font-mono text-[10px] text-slate-400">FGA & TMB</span>
          </div>

          {/* FRACTION GENOME ALTERED (FGA) INLINE MERGED ROW */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="fga-modern-input" className="text-xs text-slate-700 font-medium flex items-center">
                Fraction Genome Altered (FGA)
                <Tooltip text="Percentage of tumor genome with somatic copy number alterations (0.00 to 1.00)." />
              </label>

              <div className="flex items-center space-x-2">
                <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full ${
                  inputs.fga < 0.20 
                    ? 'bg-slate-100 text-slate-600' 
                    : inputs.fga <= 0.45 
                    ? 'bg-amber-50 text-amber-800' 
                    : 'bg-rose-50 text-rose-800'
                }`}>
                  {inputs.fga < 0.20 ? 'Low CIN' : inputs.fga <= 0.45 ? 'Mod CIN' : 'High CIN'}
                </span>

                <div className="flex items-center space-x-1 bg-white px-2 py-0.5 rounded-lg border border-slate-200/80 shadow-2xs">
                  <input
                    id="fga-modern-input"
                    type="number"
                    min="0.00"
                    max="1.00"
                    step="0.01"
                    aria-label="Fraction Genome Altered value"
                    value={inputs.fga}
                    onChange={(e) => handleFgaChange(e.target.value)}
                    className="w-12 text-xs text-right font-mono font-semibold text-slate-900 bg-transparent focus:outline-none"
                  />
                  <span className="text-slate-400 font-mono text-xs">/1</span>
                </div>
              </div>
            </div>

            {/* Modern narrow sliding track with high-contrast accent dot */}
            <div className="flex items-center space-x-2.5 pt-1">
              <span className="font-mono text-[10px] text-slate-400">0.00</span>
              <div className="relative flex-1 flex items-center">
                <input
                  type="range"
                  min="0.00"
                  max="1.00"
                  step="0.01"
                  aria-label="Fraction Genome Altered range slider"
                  value={inputs.fga}
                  onChange={(e) => handleFgaChange(e.target.value)}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-700"
                />
              </div>
              <span className="font-mono text-[10px] text-slate-400">1.00</span>
            </div>
          </div>

          {/* MUTATION COUNT / TMB INLINE ROW */}
          <div className="border-t border-slate-200/40 pt-3">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="tmb-modern-input" className="text-xs text-slate-700 font-medium flex items-center">
                Mutation Count / TMB
                <Tooltip text="Non-synonymous somatic mutation count across MSK-IMPACT target capture panel." />
              </label>

              <div className="flex items-center space-x-2">
                <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full ${
                  inputs.mutationCount < 10 
                    ? 'bg-slate-100 text-slate-600' 
                    : inputs.mutationCount <= 20 
                    ? 'bg-teal-50 text-teal-800' 
                    : 'bg-amber-50 text-amber-800'
                }`}>
                  {inputs.mutationCount < 10 ? 'TMB-Low' : inputs.mutationCount <= 20 ? 'TMB-Intermediate' : 'TMB-High'}
                </span>

                <div className="flex items-center space-x-1 bg-white px-2 py-0.5 rounded-lg border border-slate-200/80 shadow-2xs">
                  <input
                    id="tmb-modern-input"
                    type="number"
                    min="0"
                    max="500"
                    step="1"
                    aria-label="Mutation count value"
                    value={inputs.mutationCount}
                    onChange={(e) => handleMutationCountChange(e.target.value)}
                    className="w-14 text-xs text-right font-mono font-semibold text-slate-900 bg-transparent focus:outline-none"
                  />
                  <span className="text-slate-400 font-mono text-[11px]">muts</span>
                </div>
              </div>
            </div>

            {/* Quick preset chips */}
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] font-mono text-slate-400 mr-0.5">Presets:</span>
              {[2, 8, 15, 30, 60].map((presetVal) => (
                <button
                  key={presetVal}
                  type="button"
                  onClick={() => handleMutationCountChange(presetVal)}
                  className={`px-2 py-0.5 text-[10px] font-mono rounded-md transition-colors ${
                    inputs.mutationCount === presetVal
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                  }`}
                >
                  {presetVal}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* SECTION 3: SOMATIC GENES SELECTION (Compact Modern Inline Pills) */}
        <div className="bg-slate-50/60 rounded-xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase">
                3. Somatic Alterations
              </span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-md bg-white text-slate-500 border border-slate-200/60">
                {mutatedCount}/{GENE_DEFINITIONS.length} Altered
              </span>
            </div>

            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={handleSetCommonDrivers}
                className="px-2 py-0.5 text-[10px] font-medium text-slate-600 bg-white hover:bg-slate-100 border border-slate-200/60 rounded-md transition-colors"
                title="Common drivers TP53+KRAS"
              >
                TP53+KRAS
              </button>
              <button
                type="button"
                onClick={handleClearAllGenes}
                className="px-2 py-0.5 text-[10px] font-medium text-slate-600 bg-white hover:bg-slate-100 border border-slate-200/60 rounded-md transition-colors"
                title="Reset all to wild-type"
              >
                All WT
              </button>
            </div>
          </div>

          {/* Search filter input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search gene or pathway..."
              value={geneSearch}
              onChange={(e) => setGeneSearch(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1 text-xs bg-white border border-slate-200/80 rounded-lg focus:outline-none focus:border-teal-600 font-sans"
            />
          </div>

          {/* COMPACT INLINE PILL GRID */}
          <div className="grid grid-cols-2 gap-1.5 max-h-[250px] overflow-y-auto pr-0.5">
            {filteredGenes.map((gene) => {
              const isMutated = (inputs.mutations[gene.symbol] || 0) === 1;

              return (
                <button
                  key={gene.symbol}
                  type="button"
                  onClick={() => toggleGene(gene.symbol)}
                  className={`px-2.5 py-1.5 rounded-lg border transition-all text-left flex items-center justify-between group ${
                    isMutated
                      ? 'bg-teal-50/70 border-teal-200 text-teal-900 shadow-2xs'
                      : 'bg-white border-slate-200/60 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-2 min-w-0 pr-1">
                    {/* Status dot: subtle glowing emerald for MUT, muted gray for WT */}
                    <span 
                      className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${
                        isMutated ? 'bg-teal-600 shadow-xs' : 'bg-slate-300'
                      }`} 
                    />
                    <span className="font-mono text-xs font-semibold tracking-tight">
                      {gene.symbol}
                    </span>
                  </div>

                  <span className={`font-mono text-[9px] shrink-0 font-medium px-1 py-0.2 rounded ${
                    isMutated 
                      ? 'bg-teal-100/80 text-teal-800' 
                      : 'text-slate-400'
                  }`}>
                    {isMutated ? 'MUT' : 'WT'}
                  </span>
                </button>
              );
            })}
          </div>

          {filteredGenes.length === 0 && (
            <div className="text-center py-3 text-xs text-slate-400">
              No matching genes.
            </div>
          )}

        </div>

      </div>

      {/* FOOTER TRIGGER */}
      <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
        <div className="text-[11px] font-mono text-slate-400 flex items-center space-x-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
          <span>74-gene MSK panel</span>
        </div>

        <button
          type="button"
          onClick={onRunInference}
          disabled={isCalculating}
          className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 active:bg-teal-950 rounded-lg shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-teal-700 focus:ring-offset-1 disabled:opacity-50 cursor-pointer"
        >
          {isCalculating ? (
            <>
              <RotateCcw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              <span>Evaluating...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
              <span>Run Inference</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}
