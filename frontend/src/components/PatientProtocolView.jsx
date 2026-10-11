import { useState } from 'react';
import { 
  FileCheck, 
  Stethoscope, 
  Dna, 
  Microscope, 
  Users, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';

export default function PatientProtocolView() {
  const [completedSteps, setCompletedSteps] = useState({
    1: true,
    2: true,
    3: false,
    4: false,
  });

  const toggleStep = (id) => {
    setCompletedSteps(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const protocols = [
    {
      id: 1,
      title: 'Phase I: Histopathology & Immunohistochemistry (IHC)',
      category: 'Diagnostic Pathology',
      icon: Microscope,
      items: [
        'Perform baseline H&E core-needle biopsy staining to establish tumor lineage (carcinoma vs. lymphoma/sarcoma/melanoma).',
        'Screen primary cytokeratin sub-panel: CK7 / CK20 discrimination for upper GI, lower GI, pulmonary, and urothelial origins.',
        'Targeted organ markers: TTF-1/Napsin-A (Lung), CDX2 (Colorectal), GATA3/ER/PR (Breast), PSA/NKX3.1 (Prostate), PAX8 (Gynecologic/Renal).',
      ],
      recommendation: 'If IHC remains inconclusive after 2 rounds (equivocal CUP), proceed immediately to comprehensive genomic profiling.',
    },
    {
      id: 2,
      title: 'Phase II: Targeted Next-Generation Sequencing (NGS)',
      category: 'Molecular Diagnostics',
      icon: Dna,
      items: [
        'MSK-IMPACT or broad-panel hybrid-capture NGS (minimum 50-gene hot-spot coverage including TP53, KRAS, EGFR, APC, BRAF, PTEN).',
        'Quantify Fraction Genome Altered (FGA) to determine chromosomal instability (CIN) index.',
        'Assess Tumor Mutational Burden (TMB) and Microsatellite Instability (MSI-H / dMMR status) for immunotherapy triage.',
      ],
      recommendation: 'DNA input requires >50ng with >20% tumor purity for high-fidelity somatic variant calling.',
    },
    {
      id: 3,
      title: 'Phase III: AI-Driven Tumor of Origin (TOO) Classification',
      category: 'In Silico Informatics',
      icon: Stethoscope,
      items: [
        'Execute Clinova Ensemble classifier to compute 58-class posterior probability distribution.',
        'Evaluate differential diagnosis probability cutoff: primary diagnosis should exceed 70% confidence threshold.',
        'Verify TreeSHAP feature attributions: ensure top pathognomonic drivers (e.g. APC mutation, EGFR activating mutation) correspond with candidate organ system.',
      ],
      recommendation: 'Discordant or ambiguous classifications (p < 0.40) warrant re-examination of sample quality and CNA profile.',
    },
    {
      id: 4,
      title: 'Phase IV: Molecular Tumor Board (MTB) Treatment Selection',
      category: 'Therapeutic Staging',
      icon: Users,
      items: [
        'Review predicted lineage with treating medical oncologist, pathologist, and surgical oncology team.',
        'Match targetable alterations with FDA-approved therapies: EGFR (Osimertinib), BRAF V600E (Dabrafenib/Trametinib), KRAS G12C (Sotorasib/Adagrasib).',
        'Enroll in prospective CUP biomarker basket trials (e.g. NCI-MATCH, CUPISCO) if no site-specific regimen is indicated.',
      ],
      recommendation: 'Document consensus diagnosis in electronic health record (EHR) as provisional Tumor of Origin.',
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            CUP Clinical Protocol & SOP Guidelines
          </h2>
          <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
            Standard Operating Procedure for Cancer of Unknown Primary (CUP) Workup & Genomic Triage
          </p>
        </div>

        <div className="inline-flex items-center space-x-2 bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)] text-xs font-semibold px-3 py-1.5 rounded-full border border-teal-200/60 shadow-2xs">
          <FileCheck className="w-3.5 h-3.5" />
          <span>NCCN / ESMO CUP Standard 2026</span>
        </div>
      </div>

      {/* Protocol Checklist Steps */}
      <div className="grid grid-cols-1 gap-4">
        {protocols.map((step) => {
          const Icon = step.icon;
          const isDone = completedSteps[step.id];

          return (
            <div
              key={step.id}
              className={`bg-[var(--card)] rounded-xl p-4 sm:p-5 border transition-all ${
                isDone 
                  ? 'border-teal-200/80 dark:border-teal-800/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]' 
                  : 'border-[var(--border)] shadow-[0_1px_2px_rgba(0,0,0,0.02)]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border border-teal-200/60 dark:border-teal-700/60"
                    style={{ backgroundColor: 'var(--sidebar-accent)', color: 'var(--sidebar-accent-foreground)' }}
                  >
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-[var(--foreground)] tracking-tight">
                      {step.title}
                    </h3>
                    <span className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                      {step.category}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleStep(step.id)}
                  className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isDone
                      ? 'bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)] border border-teal-200 dark:border-teal-700'
                      : 'bg-[var(--muted)] text-[var(--foreground)] hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 ${isDone ? 'text-teal-700 dark:text-teal-400' : 'text-[var(--muted-foreground)]'}`} />
                  <span>{isDone ? 'Phase Completed' : 'Mark as Complete'}</span>
                </button>
              </div>

              {/* Items List */}
              <div className="pt-3 space-y-2">
                <ul className="space-y-1.5 list-disc list-inside text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {step.items.map((item) => (
                    <li key={item} className="pl-1">
                      {item}
                    </li>
                  ))}
                </ul>

                {/* Clinical Recommendation Callout */}
                <div className="mt-3 p-3 rounded-lg bg-[var(--muted)]/50 border border-[var(--border)] flex items-start space-x-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    <strong className="text-[var(--foreground)]">Clinical Recommendation:</strong> {step.recommendation}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
