import { 
  Search, 
  Printer, 
  RefreshCw, 
  ChevronDown,
  Moon,
  Sun
} from 'lucide-react';
import { PRESET_CASES } from '../data/mockModel';

export default function Header({ 
  onSelectPreset, 
  onResetBaseline, 
  isCalculating, 
  currentPresetId,
  onPrint,
  isDark,
  onToggleDark
}) {
  return (
    <header className="h-16 px-6 border-b border-[var(--border)] bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-between sticky top-0 z-30 select-none">
      
      {/* Search Input: subtle rounded container with command badge */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 flex items-center gap-2 w-72 sm:w-80 shadow-2xs">
        <Search className="w-3.5 h-3.5 text-[var(--muted-foreground)] shrink-0 pointer-events-none" />
        <input
          type="text"
          placeholder="Search patient, gene, or cohort..."
          className="bg-transparent text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none flex-1 min-w-0"
        />
        <kbd className="text-[10px] font-mono bg-slate-200/60 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded">
          ⌘K
        </kbd>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2.5">
        
        {/* Status Badge */}
        <div className="hidden sm:inline-flex items-center space-x-2 bg-teal-50 dark:bg-teal-950/40 text-[var(--primary)] text-xs font-semibold px-3 py-1.5 rounded-full border border-teal-200/60 dark:border-teal-800/60 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse" />
          <span>{isCalculating ? 'Evaluating...' : 'System Online / Model Ready'}</span>
        </div>

        {/* Preset Selector */}
        <div className="relative">
          <select
            aria-label="Select clinical benchmark case"
            value={currentPresetId || ''}
            onChange={(e) => {
              if (e.target.value) {
                onSelectPreset(e.target.value);
              }
            }}
            className="appearance-none bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-[var(--border)] text-slate-700 dark:text-slate-200 text-xs rounded-lg pl-3 pr-8 py-1.5 font-medium transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-600 shadow-2xs"
          >
            <option value="">Case Benchmark...</option>
            {PRESET_CASES.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.label}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Export Report Action */}
        <button
          type="button"
          onClick={onPrint}
          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-[var(--border)] rounded-lg transition-colors shadow-2xs cursor-pointer"
          title="Print or export clinical report"
        >
          <Printer className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
          <span className="hidden sm:inline">Export</span>
        </button>

        {/* Reset Baseline Action */}
        <button
          type="button"
          onClick={onResetBaseline}
          className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-[var(--border)] rounded-lg transition-colors shadow-2xs cursor-pointer"
          title="Reset baseline values"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-400 sm:mr-1.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>

        {/* Dark Mode Toggle Button */}
        <button
          type="button"
          onClick={onToggleDark}
          className="inline-flex items-center justify-center p-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-[var(--border)] rounded-lg transition-colors shadow-2xs cursor-pointer"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-500" />
          )}
        </button>

      </div>

    </header>
  );
}
