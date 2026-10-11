import { 
  LayoutDashboard, 
  FolderGit2, 
  FileSpreadsheet, 
  Database, 
  Settings, 
  UserRound,
  ChevronRight,
  Dna
} from 'lucide-react';
import { PRESET_CASES } from '../data/mockModel';

export default function Sidebar({ 
  currentPresetId, 
  onSelectPreset, 
  onOpenModelInfo,
  activeTab = 'dashboard',
  setActiveTab 
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'cohort', label: 'Case Cohort', icon: FolderGit2 },
    { id: 'protocol', label: 'Patient Protocol', icon: FileSpreadsheet },
    { id: 'specs', label: 'Specs', icon: Database, action: onOpenModelInfo },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside 
      className="w-[260px] min-w-[260px] max-w-[260px] shrink-0 bg-[var(--sidebar)] border-r border-[var(--sidebar-border)] min-h-screen flex flex-col select-none"
    >
      
      {/* 1. Logo Header: h-16 (64px) with border-b border-[var(--sidebar-border)] px-4 flex items-center gap-3 */}
      <div className="h-16 px-4 border-b border-[var(--sidebar-border)] flex items-center gap-3 shrink-0">
        <div 
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-2xs border border-teal-200/50"
          style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
        >
          <Dna className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap block truncate">
            Pan-Cancer Project
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
            Tumor Origin Classifier
          </span>
        </div>
      </div>

      {/* 2. Main Navigation Links */}
      <div className="px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.action) {
                  item.action();
                } else if (setActiveTab) {
                  setActiveTab(item.id);
                }
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)] font-semibold border border-teal-200/60 dark:border-teal-700/60 shadow-2xs'
                  : 'text-[var(--sidebar-foreground)] hover:bg-slate-200/50 dark:hover:bg-slate-800/50 font-medium'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left truncate">{item.label}</span>
              {isActive && (
                <span 
                  className="w-1.5 h-1.5 rounded-full shadow-xs" 
                  style={{ backgroundColor: 'var(--primary)' }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Case Cohort Quick Queue */}
      <div className="px-3 flex-1 overflow-y-auto pt-2">
        <div className="flex items-center justify-between mb-2 px-2">
          <span className="text-[10px] font-semibold tracking-wider text-[var(--muted-foreground)] uppercase">
            Active Cohort
          </span>
          <span className="text-[10px] font-mono text-[var(--sidebar-accent-foreground)] bg-[var(--sidebar-accent)] px-1.5 py-0.2 rounded-md font-medium border border-teal-200/60 dark:border-teal-700/60">
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
                className={`w-full text-left p-2.5 rounded-lg transition-all text-xs border cursor-pointer ${
                  isActive
                    ? 'bg-[var(--card)] border-teal-200/80 dark:border-teal-700/80 text-[var(--sidebar-accent-foreground)] font-semibold shadow-2xs'
                    : 'border-transparent text-[var(--sidebar-foreground)] hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate">
                    {preset.label.replace('Case ', '')}
                  </span>
                  {isActive && (
                    <ChevronRight className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--primary)' }} />
                  )}
                </div>
                <div className="text-[10px] truncate mt-0.5 font-mono text-[var(--muted-foreground)]">
                  {preset.data.fga.toFixed(2)} FGA • {preset.data.mutationCount} muts
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. User Profile Badge Pinned at Bottom */}
      <div className="p-3 border-t border-[var(--sidebar-border)] bg-white/40 dark:bg-slate-900/40">
        <div className="flex items-center space-x-2.5 bg-[var(--card)] p-2 rounded-lg border border-[var(--sidebar-border)] shadow-2xs">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border border-teal-200/60 dark:border-teal-700/60"
            style={{ backgroundColor: 'var(--sidebar-accent)', color: 'var(--sidebar-accent-foreground)' }}
          >
            <UserRound className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-semibold text-slate-800 dark:text-slate-100 text-xs block leading-tight truncate">
              Dr. Specialist
            </span>
            <span className="text-[10px] text-[var(--muted-foreground)] block truncate mt-0.5">
              Clinova Oncology Lab
            </span>
          </div>
        </div>
      </div>

    </aside>
  );
}
