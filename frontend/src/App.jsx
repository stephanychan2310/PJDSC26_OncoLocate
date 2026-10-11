import { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ClinicalInputForm from './components/ClinicalInputForm';
import HeroResultCard from './components/HeroResultCard';
import DifferentialBarChart from './components/DifferentialBarChart';
import ExplainabilityCard from './components/ExplainabilityCard';
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
  const [activeTab, setActiveTab] = useState('dashboard');

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
    }, 100);

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
    <div className="min-h-screen bg-[#f8f9fa] flex font-sans text-slate-900 antialiased selection:bg-teal-100 selection:text-teal-900">
      
      {/* 1. Persistent Left Sidebar (240px Desktop) */}
      <div className="hidden lg:block shrink-0">
        <Sidebar
          currentPresetId={currentPresetId}
          onSelectPreset={handleSelectPreset}
          onOpenModelInfo={() => setIsSpecsOpen(true)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>

      {/* 2. Main Workbench Workspace */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1560px] w-full mx-auto">
          
          {/* Inline Modern Header */}
          <Header
            onSelectPreset={handleSelectPreset}
            onResetBaseline={handleResetBaseline}
            isCalculating={isCalculating}
            currentPresetId={currentPresetId}
            onPrint={handlePrint}
          />

          {/* ASYMMETRIC WORKBENCH LAYOUT: 38% Left Input Panel, 62% Right Canvas */}
          <div className="flex flex-col lg:flex-row gap-5 lg:gap-6 items-start mt-2">
            
            {/* LEFT INPUT PANEL (38% Width, Utilitarian & Dense) */}
            <div className="w-full lg:w-[38%] shrink-0">
              <ClinicalInputForm
                inputs={inputs}
                onChange={handleInputChange}
                onRunInference={() => executeInference(inputs)}
                isCalculating={isCalculating}
                liveInference={liveInference}
                setLiveInference={setLiveInference}
              />
            </div>

            {/* RIGHT DIAGNOSTIC & EXPLAINABILITY CANVAS (62% Width) */}
            <div className="w-full lg:w-[62%] min-w-0 flex-1 space-y-5">
              
              {/* 1. Primary Consensus Lineage Hero Card */}
              <HeroResultCard
                prediction={predictionResult.topPrediction}
                inputs={inputs}
                isCalculating={isCalculating}
              />

              {/* 2. Differential Diagnoses Horizontal Bar Chart */}
              <DifferentialBarChart
                differentialDiagnoses={predictionResult.differentialDiagnoses}
                isCalculating={isCalculating}
              />

              {/* 3. Built-in SHAP Feature Attribution Waterfall */}
              <ExplainabilityCard
                shapExplanations={predictionResult.shapExplanations}
                topPredictionName={predictionResult.topPrediction?.name}
                isCalculating={isCalculating}
              />

            </div>

          </div>

        </div>

        {/* Institutional Micro-Footer */}
        <footer className="mt-auto border-t border-slate-200/50 bg-white/70 py-3.5 px-6 lg:px-8 text-xs text-slate-400">
          <div className="max-w-[1560px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center space-x-2 text-[11px]">
              <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-700">MSK-IMPACT Clinical Genomics Workbench</span>
              <span className="text-slate-300">•</span>
              <span>Tumor of Origin Decision Support System</span>
            </div>

            <div className="flex items-center space-x-3 font-mono text-[10px] text-slate-400">
              <span>Cohort n=10,945</span>
              <span>AUC: 0.941</span>
              <span>Ensemble v1.0.4</span>
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
