import { 
  LayoutDashboard, 
  FolderGit2, 
  FileSpreadsheet, 
  Database, 
  Settings, 
  UserRound, 
  ChevronRight, 
  ChevronLeft,
  Dna,
  X 
} from 'lucide-react';
import { PRESET_CASES } from '../data/mockModel';

const CASE_CODES = {
  case_luad: 'LU',
  case_crc: 'CR',
  case_melanoma: 'ME',
  case_pdac: 'PD',
  case_endometrial: 'EN',
};

export default function Sidebar({ 
  currentPresetId, 
  onSelectPreset, 
  onOpenModelInfo,
  activeTab = 'dashboard',
  setActiveTab,
  collapsed = false,
  onToggleCollapse,
  isMobile = false,
  onCloseMobile
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
      className={`${isMobile ? 'flex' : 'hidden lg:flex'} ${
        collapsed 
          ? 'w-[68px] min-w-[68px] max-w-[68px]' 
          : 'w-[260px] min-w-[260px] max-w-[260px]'
      } shrink-0 bg-[var(--sidebar)] border-r border-[var(--sidebar-border)] min-h-screen flex flex-col select-none relative transition-all duration-300 ease-in-out`}
    >
      
      {/* Desktop Collapse / Expand Toggle Button */}
      {!isMobile && onToggleCollapse && (
        <button
          type="button"
          onClick={onToggleCollapse}
          className="absolute top-16 -right-3.5 z-40 w-7 h-7 rounded-full bg-[var(--card)] border border-[var(--sidebar-border)] shadow-xs flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors cursor-pointer"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5" />
          )}
        </button>
      )}

      {/* 1. Logo Header: h-[72px] (matching new 72px header) */}
      <div className={`h-[72px] border-b border-[var(--sidebar-border)] flex items-center shrink-0 ${
        collapsed ? 'justify-center px-2' : 'justify-between px-4 gap-3'
      }`}>
        <div className="flex items-center gap-3 min-w-0">
          <div 
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-2xs border border-teal-200/50"
            style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
            title="OncoLocate • Tumor Origin Classifier"
          >
            <Dna className="w-5 h-5 text-white" />
          </div>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap block truncate">
                OncoLocate
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                Tumor Origin Decision Support
              </span>
            </div>
          )}
        </div>

        {/* Mobile Close Button */}
        {isMobile && onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
            aria-label="Close mobile navigation"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 2. Main Navigation Links */}
      <div className={`py-4 space-y-1 ${collapsed ? 'px-2' : 'px-3'}`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              title={collapsed ? item.label : undefined}
              onClick={() => {
                if (item.action) {
                  item.action();
                } else if (setActiveTab) {
                  setActiveTab(item.id);
                }
              }}
              className={`w-full flex items-center rounded-lg text-sm transition-all duration-150 cursor-pointer ${
                collapsed 
                  ? 'h-10 justify-center p-0' 
                  : 'space-x-3 px-3 py-2'
              } ${
                isActive
                  ? 'bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)] font-semibold border border-teal-200/60 dark:border-teal-700/60 shadow-2xs'
                  : 'text-[var(--sidebar-foreground)] hover:bg-slate-200/50 dark:hover:bg-slate-800/50 font-medium'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left truncate">{item.label}</span>
                  {isActive && (
                    <span 
                      className="w-1.5 h-1.5 rounded-full shadow-xs" 
                      style={{ backgroundColor: 'var(--primary)' }}
                    />
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Case Cohort Quick Queue */}
      <div className={`flex-1 overflow-y-auto pt-2 ${collapsed ? 'px-2' : 'px-3'}`}>
        {!collapsed ? (
          <div className="flex items-center justify-between mb-2 px-2">
            <span className="text-[10px] font-semibold tracking-wider text-[var(--muted-foreground)] uppercase">
              Active Cohort
            </span>
            <span className="text-[10px] font-mono text-[var(--sidebar-accent-foreground)] bg-[var(--sidebar-accent)] px-1.5 py-0.2 rounded-md font-medium border border-teal-200/60 dark:border-teal-700/60">
              {PRESET_CASES.length} Cases
            </span>
          </div>
        ) : (
          <div className="w-8 mx-auto my-2 border-t border-[var(--sidebar-border)]" />
        )}

        <div className="space-y-1">
          {PRESET_CASES.map((preset, idx) => {
            const isActive = currentPresetId === preset.id;
            const shortCode = CASE_CODES[preset.id] || `C${idx + 1}`;

            if (collapsed) {
              return (
                <button
                  key={preset.id}
                  type="button"
                  title={`${preset.label} • ${preset.data.fga.toFixed(2)} FGA, ${preset.data.mutationCount} muts`}
                  onClick={() => onSelectPreset(preset.id)}
                  className={`w-10 h-10 mx-auto rounded-lg flex items-center justify-center font-mono text-xs font-bold transition-all border cursor-pointer ${
                    isActive
                      ? 'bg-[var(--card)] border-teal-200/80 dark:border-teal-700/80 text-[var(--sidebar-accent-foreground)] shadow-2xs'
                      : 'border-transparent text-[var(--sidebar-foreground)] hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {shortCode}
                </button>
              );
            }

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
      <div className={`border-t border-[var(--sidebar-border)] bg-white/40 dark:bg-slate-900/40 ${
        collapsed ? 'p-2' : 'p-3'
      }`}>
        <div 
          className={`flex items-center bg-[var(--card)] rounded-lg border border-[var(--sidebar-border)] shadow-2xs ${
            collapsed ? 'p-1.5 justify-center' : 'p-2 space-x-2.5'
          }`}
          title={collapsed ? "Dr. Specialist • OncoLocate Oncology Lab" : undefined}
        >
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border border-teal-200/60 dark:border-teal-700/60"
            style={{ backgroundColor: 'var(--sidebar-accent)', color: 'var(--sidebar-accent-foreground)' }}
          >
            <UserRound className="w-4 h-4" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <span className="font-semibold text-slate-800 dark:text-slate-100 text-xs block leading-tight truncate">
                Dr. Specialist
              </span>
              <span className="text-[10px] text-[var(--muted-foreground)] block truncate mt-0.5">
                OncoLocate Oncology Lab
              </span>
            </div>
          )}
        </div>
      </div>

    </aside>
  );
}
