import { useState, useCallback, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import TopMetricCards from './components/TopMetricCards';
import ClinicalInputForm from './components/ClinicalInputForm';
import HeroResultCard from './components/HeroResultCard';
import DifferentialBarChart from './components/DifferentialBarChart';
import ExplainabilityCard from './components/ExplainabilityCard';
import CaseCohortView from './components/CaseCohortView';
import PatientProtocolView from './components/PatientProtocolView';
import SettingsView from './components/SettingsView';
import ModelMetadataModal from './components/ModelMetadataModal';
import { 
  predictTumorOfOrigin, 
  PRESET_CASES 
} from './data/mockModel';
import { predictCase, getProfiles } from './api/apiClient';
import { Stethoscope } from 'lucide-react';

const INITIAL_STATE = {
  sex: 0, // Female [0]
  sampleType: 1, // Metastatic [1]
  fga: 0.38,
  mutationCount: 7,
  mutations: {
    TP53: 1,
    KRAS: 0,
    EGFR: 1,
    PIK3CA: 0,
    APC: 0,
    BRAF: 0,
    PTEN: 0,
    ARID1A: 0,
    PIK3R1: 0,
    RB1: 0,
    CDKN2A: 0,
    SMAD4: 0,
    BRCA1: 0,
    BRCA2: 0,
    VHL: 0,
    IDH1: 0,
  },
};

export default function App() {
  const [inputs, setInputs] = useState(INITIAL_STATE);
  const [currentPresetId, setCurrentPresetId] = useState('case_luad');
  const [isCalculating, setIsCalculating] = useState(false);
  const [isLiveModel, setIsLiveModel] = useState(false);
  const [liveInference, setLiveInference] = useState(true);
  const [isSpecsOpen, setIsSpecsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'cohort' | 'protocol' | 'settings'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentPresetIdRef = useRef(currentPresetId);
  const inferenceTimeoutRef = useRef(null);

  const [isDark, setIsDark] = useState(() => {
    // Check if the user's OS is set to dark mode
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    currentPresetIdRef.current = currentPresetId;
  }, [currentPresetId]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Results state
  const [predictionResult, setPredictionResult] = useState(() => 
    predictTumorOfOrigin(INITIAL_STATE)
  );

  // Trigger inference calculation (supports live Flask backend with automatic mock fallback)
  const executeInference = useCallback((currentInputs, profileId, immediate = false) => {
    const targetProfileId = profileId || currentPresetIdRef.current || 'case_luad';
    
    if (inferenceTimeoutRef.current) {
      clearTimeout(inferenceTimeoutRef.current);
    }

    const run = async () => {
      setIsCalculating(true);
      try {
        const result = await predictCase(targetProfileId, currentInputs);
        setPredictionResult(result);
        setIsLiveModel(Boolean(result.isLive));
      } catch (err) {
        console.error('Inference execution error:', err);
      } finally {
        setIsCalculating(false);
      }
    };

    if (immediate) {
      run();
    } else {
      inferenceTimeoutRef.current = setTimeout(run, 140);
    }
  }, []);

  // Clean up inference timer on unmount
  useEffect(() => {
    return () => {
      if (inferenceTimeoutRef.current) {
        clearTimeout(inferenceTimeoutRef.current);
      }
    };
  }, []);

  // Probe live Flask model on initial mount
  useEffect(() => {
    let isMounted = true;
    getProfiles()
      .then((profiles) => {
        if (isMounted && profiles && profiles.length > 0) {
          executeInference(INITIAL_STATE, 'case_luad', true);
        }
      })
      .catch(() => {
        // Fallback already handled
      });

    return () => {
      isMounted = false;
    };
  }, [executeInference]);

  // Handle inputs modification
  const handleInputChange = (newInputs) => {
    setInputs(newInputs);
    setCurrentPresetId(''); // custom configuration
    if (liveInference) {
      executeInference(newInputs, currentPresetId || 'case_luad');
    }
  };

  // Handle preset selection
  const handleSelectPreset = (presetId) => {
    const found = PRESET_CASES.find((p) => p.id === presetId);
    if (found) {
      setInputs(found.data);
      setCurrentPresetId(presetId);
      executeInference(found.data, presetId, true);
    }
  };

  // Handle baseline reset
  const handleResetBaseline = () => {
    setInputs(INITIAL_STATE);
    setCurrentPresetId('case_luad');
    executeInference(INITIAL_STATE, 'case_luad', true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      
      {/* 1. OncoLocate Collapsible Desktop Sidebar */}
      <Sidebar
        currentPresetId={currentPresetId}
        onSelectPreset={handleSelectPreset}
        onOpenModelInfo={() => setIsSpecsOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
      />

      {/* Mobile Navigation Drawer Backdrop & Slider */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-[280px] max-w-[85vw] bg-[var(--sidebar)] border-r border-[var(--sidebar-border)] h-full flex flex-col z-10 shadow-2xl">
            <Sidebar
              currentPresetId={currentPresetId}
              onSelectPreset={(id) => {
                handleSelectPreset(id);
                setMobileMenuOpen(false);
              }}
              onOpenModelInfo={() => {
                setIsSpecsOpen(true);
                setMobileMenuOpen(false);
              }}
              activeTab={activeTab}
              setActiveTab={(tab) => {
                setActiveTab(tab);
                setMobileMenuOpen(false);
              }}
              collapsed={false}
              isMobile={true}
              onCloseMobile={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* 2. Main content shell */}
      <div className="flex-1 min-w-0 flex flex-col transition-all duration-300 ease-in-out">
        
        {/* Top Bar Header */}
        <Header
          onSelectPreset={handleSelectPreset}
          onResetBaseline={handleResetBaseline}
          isCalculating={isCalculating}
          isLiveModel={isLiveModel}
          currentPresetId={currentPresetId}
          onPrint={handlePrint}
          isDark={isDark}
          onToggleDark={() => setIsDark((prev) => !prev)}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        {/* Canvas container with comfortable pb-16 bottom padding */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 pb-16 max-w-[1580px] w-full mx-auto">
          
          {/* STATE-DRIVEN MULTI-VIEW RENDERING */}
          {activeTab === 'dashboard' && (
            <div>
              {/* 3. Top Metric Cards (OncoLocate 4-Card Grid) */}
              <TopMetricCards
                prediction={predictionResult.topPrediction}
                inputs={inputs}
              />

              {/* 4. Diagnostic Workbench (Responsive 12-Column Grid) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Panel: Clinical Inputs & Somatic Chips */}
                <div className="w-full lg:col-span-5 shrink-0">
                  <ClinicalInputForm
                    inputs={inputs}
                    onChange={handleInputChange}
                    onRunInference={() => executeInference(inputs, currentPresetId, true)}
                    isCalculating={isCalculating}
                    liveInference={liveInference}
                    setLiveInference={setLiveInference}
                  />
                </div>

                {/* Right Panel: Differential Diagnosis & SHAP Attributions */}
                <div className="w-full lg:col-span-7 min-w-0 space-y-6">
                  
                  {/* Primary Consensus Prediction Card */}
                  <HeroResultCard
                    prediction={predictionResult.topPrediction}
                    inputs={inputs}
                    isCalculating={isCalculating}
                  />

                  {/* Recharts Horizontal Bar Chart */}
                  <DifferentialBarChart
                    differentialDiagnoses={predictionResult.differentialDiagnoses}
                    isCalculating={isCalculating}
                  />

                  {/* SHAP Feature Impact Timeline */}
                  <ExplainabilityCard
                    shapExplanations={predictionResult.shapExplanations}
                    topPredictionName={predictionResult.topPrediction?.name}
                    isCalculating={isCalculating}
                  />

                </div>

              </div>
            </div>
          )}

          {activeTab === 'cohort' && (
            <CaseCohortView
              currentPresetId={currentPresetId}
              onSelectPreset={handleSelectPreset}
              onSwitchToDashboard={() => setActiveTab('dashboard')}
            />
          )}

          {activeTab === 'protocol' && (
            <PatientProtocolView />
          )}

          {activeTab === 'settings' && (
            <SettingsView />
          )}

        </div>

        {/* Institutional Micro-Footer */}
        <footer className="mt-auto border-t border-[var(--border)] bg-white/80 dark:bg-slate-900/80 py-4 px-6 lg:px-8 text-xs text-[var(--muted-foreground)]">
          <div className="max-w-[1580px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center space-x-2 text-xs">
              <Stethoscope className="w-4 h-4 text-[#0f766e]" />
              <span className="font-bold text-[var(--foreground)]">OncoLocate Diagnostic Platform</span>
              <span className="text-[var(--border)]">•</span>
              <span>Pan-Cancer Somatic Tumor of Origin NGS Panel</span>
            </div>

            <div className="flex items-center space-x-3 font-mono text-[11px] text-[var(--muted-foreground)]">
              <span>MSK-IMPACT n=10,945</span>
              <span>AUC: 0.941</span>
              <span>OncoLocate v3.1</span>
            </div>
          </div>
        </footer>

      </div>

      {/* Model Specs Modal */}
      <ModelMetadataModal
        isOpen={isSpecsOpen}
        onClose={() => setIsSpecsOpen(false)}
      />

    </div>
  );
}
