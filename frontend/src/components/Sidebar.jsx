import { 
  Activity, 
  Layers, 
  FlaskConical, 
  Database, 
  Search 
} from 'lucide-react';
import { PRESET_CASES } from '../data/mockModel';

export default function Sidebar({ 
  currentPresetId, 
  onSelectPreset, 
  onOpenModelInfo,
  activeTab = 'dashboard',
  setActiveTab 
}) {
  return (
    <aside className="w-60 shrink-0 bg-[#fbfcfd] border-r border-slate-200/70 flex flex-col h-screen sticky top-0 z-30 select-none">
      
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-slate-200/60 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-teal-800 flex items-center justify-center text-white shadow-xs">
            <Activity className="w-4 h-4 text-teal-200" />
          </div>
          <div>
            <span className="font-semibold text-slate-900 tracking-tight text-xs block leading-none">
              MSK-IMPACT
            </span>
            <span className="text-[10px] text-slate-400 font-mono tracking-normal block mt-1">
              Tumor of Origin
            </span>
          </div>
        </div>

        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-medium bg-teal-50 text-teal-800 border border-teal-200/60">
          v1.0
        </span>
      </div>

      {/* Search Input */}
      <div className="px-3.5 pt-3.5 pb-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search patient or case..."
            className="w-full bg-slate-100/70 hover:bg-slate-100 focus:bg-white text-slate-700 text-xs rounded-lg pl-8 pr-2.5 py-1.5 border border-transparent focus:border-slate-200 focus:outline-none transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="px-2.5 py-2 space-y-0.5">
        <button
          type="button"
          onClick={() => setActiveTab?.('dashboard')}
          className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'dashboard'
              ? 'bg-slate-200/70 text-slate-900 font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          }`}
        >
          <Layers className="w-4 h-4 text-teal-700" />
          <span>Inference Canvas</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenModelInfo()}
          className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 transition-colors"
        >
          <Database className="w-4 h-4 text-slate-400" />
          <span>Cohort & Specs</span>
        </button>

        <button
          type="button"
          onClick={() => {}}
          className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 transition-colors"
        >
          <FlaskConical className="w-4 h-4 text-slate-400" />
          <span>Clinical Protocols</span>
        </button>
      </div>

      {/* Case Queue Section */}
      <div className="px-3.5 pt-4 pb-2 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-2 px-1.5">
          <span className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase">
            Benchmark Cohort
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            {PRESET_CASES.length} Cases
          </span>
        </div>

        <div className="space-y-1">
          {PRESET_CASES.map((preset) => {
            const isActive = currentPresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectPreset(preset.id)}
                className={`w-full text-left p-2 rounded-lg transition-all text-xs border ${
                  isActive
                    ? 'bg-white border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_1px_2px_rgba(0,0,0,0.03)]'
                    : 'border-transparent hover:bg-slate-100/60 text-slate-600 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-medium truncate ${isActive ? 'text-slate-900 font-semibold' : 'text-slate-700'}`}>
                    {preset.label.replace('Case ', 'C-')}
                  </span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-600 shrink-0 shadow-xs" />
                  )}
                </div>
                <p className="text-[10px] text-slate-400 truncate mt-0.5 leading-tight font-mono">
                  {preset.data.fga.toFixed(2)} FGA • {preset.data.mutationCount} muts
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sidebar Footer telemetry */}
      <div className="p-3.5 border-t border-slate-200/60 bg-white/60">
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/50">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-600" />
            </span>
            <span className="text-[11px] font-medium text-slate-700">
              Ensemble Classifier
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-mono">
            AUC: 0.941 • 58 Entities
          </p>
        </div>
      </div>

    </aside>
  );
}
