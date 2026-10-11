import { useState, useCallback, useEffect } from 'react';
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
  const [liveInference, setLiveInference] = useState(true);
  const [isSpecsOpen, setIsSpecsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'cohort' | 'protocol' | 'settings'
  const [isDark, setIsDark] = useState(false);

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

  // Trigger inference calculation
  const executeInference = useCallback((currentInputs) => {
    setIsCalculating(true);
    const timer = setTimeout(() => {
      const result = predictTumorOfOrigin(currentInputs);
      setPredictionResult(result);
      setIsCalculating(false);
    }, 120);

    return () => clearTimeout(timer);
  }, []);

  // Handle inputs modification
  const handleInputChange = (newInputs) => {
    setInputs(newInputs);
    setCurrentPresetId(''); // custom configuration
    if (liveInference) {
      executeInference(newInputs);
    }
  };

  // Handle preset selection
  const handleSelectPreset = (presetId) => {
    const found = PRESET_CASES.find((p) => p.id === presetId);
    if (found) {
      setInputs(found.data);
      setCurrentPresetId(presetId);
      executeInference(found.data);
    }
  };

  // Handle baseline reset
  const handleResetBaseline = () => {
    setInputs(INITIAL_STATE);
    setCurrentPresetId('case_luad');
    executeInference(INITIAL_STATE);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      
      {/* 1. Clinova Fixed Navigation Spine (260px) */}
      <Sidebar
        currentPresetId={currentPresetId}
        onSelectPreset={handleSelectPreset}
        onOpenModelInfo={() => setIsSpecsOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* 2. Main content shell */}
      <div className="flex-1 min-w-0 flex flex-col">
        
        {/* Top Bar Header */}
        <Header
          onSelectPreset={handleSelectPreset}
          onResetBaseline={handleResetBaseline}
          isCalculating={isCalculating}
          currentPresetId={currentPresetId}
          onPrint={handlePrint}
          isDark={isDark}
          onToggleDark={() => setIsDark((prev) => !prev)}
        />

        {/* Canvas container with comfortable pb-16 bottom padding */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 pb-16 max-w-[1580px] w-full mx-auto">
          
          {/* STATE-DRIVEN MULTI-VIEW RENDERING */}
          {activeTab === 'dashboard' && (
            <div>
              {/* 3. Top Metric Cards (Clinova 4-Card Grid) */}
              <TopMetricCards
                prediction={predictionResult.topPrediction}
                inputs={inputs}
              />

              {/* 4. Two-Column Diagnostic Workbench */}
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                
                {/* Left Panel: Clinical Inputs & Somatic Chips */}
                <div className="w-full lg:w-[42%] shrink-0">
                  <ClinicalInputForm
                    inputs={inputs}
                    onChange={handleInputChange}
                    onRunInference={() => executeInference(inputs)}
                    isCalculating={isCalculating}
                    liveInference={liveInference}
                    setLiveInference={setLiveInference}
                  />
                </div>

                {/* Right Panel: Differential Diagnosis & SHAP Attributions */}
                <div className="w-full lg:w-[58%] min-w-0 flex-1 space-y-6">
                  
                  {/* Primary Consensus Prediction Card */}
                  <HeroResultCard
                    prediction={predictionResult.topPrediction}
                    inputs={inputs}
                    isCalculating={isCalculating}
                  />

                  {/* Recharts Horizontal Bar Chart with Clinova Color Scheme */}
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
              <span className="font-bold text-[var(--foreground)]">Clinova Hospital Diagnostic Platform</span>
              <span className="text-[var(--border)]">•</span>
              <span>Pan-Cancer Somatic Tumor of Origin NGS Panel</span>
            </div>

            <div className="flex items-center space-x-3 font-mono text-[11px] text-[var(--muted-foreground)]">
              <span>MSK-IMPACT n=10,945</span>
              <span>AUC: 0.941</span>
              <span>Clinova v3.1</span>
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
