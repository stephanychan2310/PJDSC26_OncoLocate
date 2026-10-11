import { 
  RefreshCw, 
  ChevronDown, 
  Printer 
} from 'lucide-react';
import { PRESET_CASES } from '../data/mockModel';

export default function Header({ 
  onSelectPreset, 
  onResetBaseline, 
  isCalculating, 
  currentPresetId,
  onPrint 
}) {

  return (
    <header className="bg-transparent pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 select-none">
      
      {/* Title & Active Preset Breadcrumb */}
      <div className="flex items-center space-x-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-bold tracking-tight text-slate-900 font-sans">
              Diagnostic Decision Workbench
            </h1>
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-teal-50/80 text-teal-800 border border-teal-200/50">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-600 inline-block animate-pulse" />
              <span>MSK-IMPACT NGS</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Pan-Cancer Somatic Biomarker & Lineage Consensus System
          </p>
        </div>
      </div>

      {/* Inline Controls Strip */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        
        {/* Status Indicator */}
        <div className="flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-white border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_1px_2px_rgba(0,0,0,0.03)] text-xs">
          <span className="relative flex h-2 w-2">
            <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isCalculating ? 'animate-ping bg-amber-400' : 'bg-teal-400'
            }`} />
            <span className={`relative inline-flex rounded-full h-2 w-2 ${
              isCalculating ? 'bg-amber-500' : 'bg-teal-600'
            }`} />
          </span>
          <span className="text-slate-500 font-mono text-[11px]">
            {isCalculating ? 'Evaluating...' : 'Engine Ready'}
          </span>
        </div>

        {/* Borderless Elegant Case Dropdown */}
        <div className="relative">
          <select
            aria-label="Select benchmark clinical case"
            value={currentPresetId || ''}
            onChange={(e) => {
              if (e.target.value) {
                onSelectPreset(e.target.value);
              }
            }}
            className="appearance-none bg-white hover:bg-slate-50 border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_1px_2px_rgba(0,0,0,0.03)] text-slate-700 text-xs rounded-lg pl-3 pr-8 py-1.5 font-medium transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-teal-600"
          >
            <option value="">Select Clinical Case...</option>
            {PRESET_CASES.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.label}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Print / Export Report */}
        <button
          type="button"
          onClick={onPrint}
          className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-white hover:bg-slate-50 border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_1px_2px_rgba(0,0,0,0.03)] rounded-lg transition-colors"
          title="Print or export clinical pathology summary"
        >
          <Printer className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
          <span className="hidden sm:inline">Export</span>
        </button>

        {/* Reset Button */}
        <button
          type="button"
          onClick={onResetBaseline}
          className="inline-flex items-center px-2 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_1px_2px_rgba(0,0,0,0.03)] rounded-lg transition-colors"
          title="Reset to default baseline"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-400 sm:mr-1" />
          <span className="hidden sm:inline">Reset</span>
        </button>

      </div>

    </header>
  );
}
