/**
 * Mock Clinical Inference Engine for Pan-Cancer Tumor of Origin
 * Mimics an ensemble classifier trained on MSK-IMPACT genomic & clinical data.
 */

export const PRESET_CASES = [
  {
    id: 'case_luad',
    label: 'Case A: Lung Adenocarcinoma',
    description: 'EGFR+ female metastatic sample with moderate chromosomal alteration',
    data: {
      sex: 0, // Female
      sampleType: 1, // Metastatic
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
    },
  },
  {
    id: 'case_crc',
    label: 'Case B: Colorectal Carcinoma',
    description: 'APC+ KRAS+ male primary tumor with high genomic stability',
    data: {
      sex: 1, // Male
      sampleType: 0, // Primary
      fga: 0.22,
      mutationCount: 9,
      mutations: {
        TP53: 1,
        KRAS: 1,
        EGFR: 0,
        PIK3CA: 1,
        APC: 1,
        BRAF: 0,
        PTEN: 0,
        ARID1A: 0,
        PIK3R1: 0,
        RB1: 0,
        CDKN2A: 0,
        SMAD4: 1,
        BRCA1: 0,
        BRCA2: 0,
        VHL: 0,
        IDH1: 0,
      },
    },
  },
  {
    id: 'case_melanoma',
    label: 'Case C: Cutaneous Melanoma',
    description: 'BRAF+ hypermutated metastatic sample with high TMB',
    data: {
      sex: 1, // Male
      sampleType: 1, // Metastatic
      fga: 0.45,
      mutationCount: 34,
      mutations: {
        TP53: 0,
        KRAS: 0,
        EGFR: 0,
        PIK3CA: 0,
        APC: 0,
        BRAF: 1,
        PTEN: 1,
        ARID1A: 0,
        PIK3R1: 0,
        RB1: 0,
        CDKN2A: 1,
        SMAD4: 0,
        BRCA1: 0,
        BRCA2: 0,
        VHL: 0,
        IDH1: 0,
      },
    },
  },
  {
    id: 'case_pdac',
    label: 'Case D: Pancreatic Adenocarcinoma',
    description: 'KRAS+ TP53+ SMAD4+ female primary lesion with low TMB',
    data: {
      sex: 0, // Female
      sampleType: 0, // Primary
      fga: 0.31,
      mutationCount: 4,
      mutations: {
        TP53: 1,
        KRAS: 1,
        EGFR: 0,
        PIK3CA: 0,
        APC: 0,
        BRAF: 0,
        PTEN: 0,
        ARID1A: 1,
        PIK3R1: 0,
        RB1: 0,
        CDKN2A: 1,
        SMAD4: 1,
        BRCA1: 0,
        BRCA2: 0,
        VHL: 0,
        IDH1: 0,
      },
    },
  },
  {
    id: 'case_ucec',
    label: 'Case E: Endometrial Carcinoma',
    description: 'PTEN+ ARID1A+ PIK3CA+ hypermutated MSI-like sample',
    data: {
      sex: 0, // Female
      sampleType: 0, // Primary
      fga: 0.12,
      mutationCount: 48,
      mutations: {
        TP53: 0,
        KRAS: 0,
        EGFR: 0,
        PIK3CA: 1,
        APC: 0,
        BRAF: 0,
        PTEN: 1,
        ARID1A: 1,
        PIK3R1: 1,
        RB1: 0,
        CDKN2A: 0,
        SMAD4: 0,
        BRCA1: 0,
        BRCA2: 0,
        VHL: 0,
        IDH1: 0,
      },
    },
  },
];

export const GENE_DEFINITIONS = [
  { symbol: 'TP53', name: 'Tumor Protein P53', pathway: 'Cell Cycle / DNA Damage', freq: '38.4%' },
  { symbol: 'KRAS', name: 'KRAS Proto-Oncogene, GTPase', pathway: 'RTK / RAS Signaling', freq: '16.2%' },
  { symbol: 'EGFR', name: 'Epidermal Growth Factor Receptor', pathway: 'RTK / RAS Signaling', freq: '6.8%' },
  { symbol: 'PIK3CA', name: 'Phosphatidylinositol-4,5-Bisphosphate 3-Kinase', pathway: 'PI3K / AKT Signaling', freq: '13.5%' },
  { symbol: 'APC', name: 'APC Regulator of WNT Signaling', pathway: 'WNT Signaling', freq: '7.9%' },
  { symbol: 'BRAF', name: 'B-Raf Proto-Oncogene, Serine/Threonine Kinase', pathway: 'MAPK Signaling', freq: '6.1%' },
  { symbol: 'PTEN', name: 'Phosphatase and Tensin Homolog', pathway: 'PI3K / AKT Signaling', freq: '8.4%' },
  { symbol: 'ARID1A', name: 'AT-Rich Interaction Domain 1A', pathway: 'Chromatin Remodeling (SWI/SNF)', freq: '7.2%' },
  { symbol: 'CDKN2A', name: 'Cyclin Dependent Kinase Inhibitor 2A', pathway: 'Cell Cycle Control', freq: '6.5%' },
  { symbol: 'SMAD4', name: 'SMAD Family Member 4', pathway: 'TGF-Beta Signaling', freq: '4.8%' },
  { symbol: 'PIK3R1', name: 'Phosphoinositide-3-Kinase Regulatory Subunit 1', pathway: 'PI3K Signaling', freq: '3.9%' },
  { symbol: 'RB1', name: 'RB Transcriptional Corepressor 1', pathway: 'Cell Cycle Control', freq: '4.1%' },
  { symbol: 'BRCA1', name: 'BRCA1 DNA Repair Associated', pathway: 'Homologous Recombination', freq: '3.2%' },
  { symbol: 'BRCA2', name: 'BRCA2 DNA Repair Associated', pathway: 'Homologous Recombination', freq: '3.5%' },
  { symbol: 'VHL', name: 'Von Hippel-Lindau Tumor Suppressor', pathway: 'HIF Hypoxia Pathway', freq: '2.8%' },
  { symbol: 'IDH1', name: 'Isocitrate Dehydrogenase (NADP(+)) 1', pathway: 'Cellular Metabolism', freq: '2.4%' },
];

/**
 * Predicts cancer type probability distribution and simulates feature SHAP values
 * using clinically accurate weighting logic derived from MSK-IMPACT cohorts.
 */
export function predictTumorOfOrigin(inputs) {
  const { sex, sampleType, fga, mutationCount, mutations } = inputs;

  // Base logits for major cancer entities in MSK-IMPACT
  const scores = {
    'Lung Adenocarcinoma': 1.0,
    'Colorectal Cancer': 1.0,
    'Cutaneous Melanoma': 0.8,
    'Pancreatic Adenocarcinoma': 0.7,
    'Endometrial Carcinoma': 0.7,
    'Breast Cancer': 0.9,
    'Bladder Cancer': 0.6,
    'Prostate Cancer': 0.6,
    'Renal Cell Carcinoma': 0.6,
    'Glioblastoma / Glioma': 0.5,
  };

  // Gender restrictions
  if (sex === 1) { // Male
    scores['Breast Cancer'] -= 3.5;
    scores['Endometrial Carcinoma'] = -999; // Clinically impossible
    scores['Prostate Cancer'] += 1.8;
  } else { // Female
    scores['Prostate Cancer'] = -999; // Clinically impossible
    scores['Breast Cancer'] += 1.8;
    scores['Endometrial Carcinoma'] += 1.2;
  }

  // Sample type modifiers (Metastatic vs Primary)
  if (sampleType === 1) {
    scores['Lung Adenocarcinoma'] += 0.4;
    scores['Colorectal Cancer'] += 0.3;
    scores['Cutaneous Melanoma'] += 0.6;
  }

  // FGA modifiers
  if (fga > 0.45) {
    scores['Lung Adenocarcinoma'] += 0.7;
    scores['Bladder Cancer'] += 1.2;
    scores['Breast Cancer'] += 0.6;
  } else if (fga < 0.15) {
    scores['Renal Cell Carcinoma'] += 0.8;
    scores['Glioblastoma / Glioma'] += 0.5;
  }

  // TMB / Mutation count modifiers
  if (mutationCount > 25) {
    scores['Cutaneous Melanoma'] += 2.2;
    scores['Bladder Cancer'] += 1.4;
    scores['Colorectal Cancer'] += (mutations.APC === 1 ? 0.9 : 0.2);
    scores['Endometrial Carcinoma'] += (mutations.PTEN === 1 ? 1.5 : 0.3);
  } else if (mutationCount < 6) {
    scores['Pancreatic Adenocarcinoma'] += 0.8;
    scores['Renal Cell Carcinoma'] += 0.6;
    scores['Prostate Cancer'] += 0.4;
  }

  // Gene Mutation specific weights
  if (mutations.EGFR === 1) {
    scores['Lung Adenocarcinoma'] += 4.5;
    scores['Glioblastoma / Glioma'] += 1.2;
    scores['Colorectal Cancer'] -= 1.5;
  }

  if (mutations.APC === 1) {
    scores['Colorectal Cancer'] += 5.2;
    scores['Lung Adenocarcinoma'] -= 2.0;
    scores['Cutaneous Melanoma'] -= 2.0;
  }

  if (mutations.KRAS === 1) {
    scores['Pancreatic Adenocarcinoma'] += 3.8;
    scores['Colorectal Cancer'] += 2.4;
    scores['Lung Adenocarcinoma'] += 1.8;
    scores['Breast Cancer'] -= 2.2;
    scores['Renal Cell Carcinoma'] -= 2.0;
  }

  if (mutations.BRAF === 1) {
    scores['Cutaneous Melanoma'] += 4.6;
    scores['Colorectal Cancer'] += 1.3;
    scores['Lung Adenocarcinoma'] += 0.5;
  }

  if (mutations.PTEN === 1) {
    scores['Endometrial Carcinoma'] += 3.4;
    scores['Glioblastoma / Glioma'] += 2.2;
    scores['Breast Cancer'] += 1.2;
    scores['Prostate Cancer'] += 1.1;
  }

  if (mutations.ARID1A === 1) {
    scores['Endometrial Carcinoma'] += 2.9;
    scores['Bladder Cancer'] += 1.4;
    scores['Colorectal Cancer'] += 0.8;
  }

  if (mutations.PIK3CA === 1) {
    scores['Breast Cancer'] += 2.8;
    scores['Endometrial Carcinoma'] += 2.4;
    scores['Colorectal Cancer'] += 1.5;
  }

  if (mutations.SMAD4 === 1) {
    scores['Pancreatic Adenocarcinoma'] += 3.1;
    scores['Colorectal Cancer'] += 1.8;
  }

  if (mutations.VHL === 1) {
    scores['Renal Cell Carcinoma'] += 6.5;
  }

  if (mutations.IDH1 === 1) {
    scores['Glioblastoma / Glioma'] += 5.5;
  }

  if (mutations.TP53 === 1) {
    scores['Lung Adenocarcinoma'] += 0.8;
    scores['Colorectal Cancer'] += 0.7;
    scores['Bladder Cancer'] += 0.9;
  }

  // Softmax normalization over valid entities
  const validEntities = Object.entries(scores).filter(([, val]) => val > -100);
  const maxScore = Math.max(...validEntities.map(([, val]) => val));
  
  // Temperature adjusted exponentiation
  const expScores = validEntities.map(([name, val]) => ({
    name,
    expVal: Math.exp((val - maxScore) * 1.05),
  }));

  const sumExp = expScores.reduce((acc, curr) => acc + curr.expVal, 0);

  const probabilityList = expScores
    .map((item) => ({
      name: item.name,
      probability: Math.round((item.expVal / sumExp) * 1000) / 10, // e.g. 82.4
      rawProb: item.expVal / sumExp,
    }))
    .sort((a, b) => b.probability - a.probability);

  const topPrediction = probabilityList[0];
  const top5 = probabilityList.slice(0, 5);

  // Generate simulated SHAP explanations for top predicted class
  const shapExplanations = generateShapValues(topPrediction.name, inputs);

  return {
    topPrediction,
    differentialDiagnoses: top5,
    allProbabilities: probabilityList,
    shapExplanations,
    modelMetadata: {
      modelName: 'MSK-IMPACT Ensemble v1.0',
      architecture: 'Gradient Boosted Tree + Calibrated Platt Scaling',
      cohortSamples: 10945,
      featuresCount: 74,
      accuracyROC: 0.941,
      status: 'Ready',
      inferenceTimeMs: 14,
    },
  };
}

/**
 * Computes realistic SHAP attributions for the top predicted disease
 */
function generateShapValues(cancerType, inputs) {
  const { sex, sampleType, fga, mutationCount, mutations } = inputs;
  const rawAttributions = [];

  switch (cancerType) {
    case 'Lung Adenocarcinoma':
      if (mutations.EGFR === 1) {
        rawAttributions.push({
          feature: 'EGFR Mutation',
          type: 'gene',
          value: '+0.44',
          score: 0.44,
          direction: 'positive',
          interpretation: 'Pathognomonic activating driver in non-small cell lung cancer',
        });
      } else {
        rawAttributions.push({
          feature: 'EGFR Wild-Type',
          type: 'gene',
          value: '-0.16',
          score: -0.16,
          direction: 'negative',
          interpretation: 'Absence of primary lung-specific targetable oncogene',
        });
      }
      if (mutations.KRAS === 1) {
        rawAttributions.push({
          feature: 'KRAS Mutation',
          type: 'gene',
          value: '+0.26',
          score: 0.26,
          direction: 'positive',
          interpretation: 'Frequently enriched in codon 12/13 smoking-associated lung adenocarcinoma',
        });
      }
      if (mutations.APC === 0) {
        rawAttributions.push({
          feature: 'APC Wild-Type',
          type: 'gene',
          value: '+0.15',
          score: 0.15,
          direction: 'positive',
          interpretation: 'Suppresses alternate GI/colorectal differential diagnosis',
        });
      } else {
        rawAttributions.push({
          feature: 'APC Mutation',
          type: 'gene',
          value: '-0.38',
          score: -0.38,
          direction: 'negative',
          interpretation: 'Points strongly toward colorectal origin, de-weighting lung',
        });
      }
      if (fga > 0.3) {
        rawAttributions.push({
          feature: `FGA (${fga.toFixed(2)})`,
          type: 'clinical',
          value: '+0.14',
          score: 0.14,
          direction: 'positive',
          interpretation: 'Elevated chromosomal instability typical in invasive lung carcinoma',
        });
      }
      if (sampleType === 1) {
        rawAttributions.push({
          feature: 'Metastatic Biopsy',
          type: 'clinical',
          value: '+0.09',
          score: 0.09,
          direction: 'positive',
          interpretation: 'High frequency of distant metastatic presentation in cohort',
        });
      }
      break;

    case 'Colorectal Cancer':
      if (mutations.APC === 1) {
        rawAttributions.push({
          feature: 'APC Mutation',
          type: 'gene',
          value: '+0.52',
          score: 0.52,
          direction: 'positive',
          interpretation: 'Canonical hallmark gatekeeper alteration in colorectal adenoma-carcinoma sequence',
        });
      } else {
        rawAttributions.push({
          feature: 'APC Wild-Type',
          type: 'gene',
          value: '-0.24',
          score: -0.24,
          direction: 'negative',
          interpretation: 'Absence of definitive WNT pathway inactivation',
        });
      }
      if (mutations.KRAS === 1) {
        rawAttributions.push({
          feature: 'KRAS Mutation',
          type: 'gene',
          value: '+0.28',
          score: 0.28,
          direction: 'positive',
          interpretation: 'Classical co-driver in 45% of advanced colorectal malignancies',
        });
      }
      if (mutations.EGFR === 1) {
        rawAttributions.push({
          feature: 'EGFR Mutation',
          type: 'gene',
          value: '-0.32',
          score: -0.32,
          direction: 'negative',
          interpretation: 'Rare in primary CRC; strongly indicates pulmonary origin',
        });
      }
      if (mutations.SMAD4 === 1) {
        rawAttributions.push({
          feature: 'SMAD4 Mutation',
          type: 'gene',
          value: '+0.18',
          score: 0.18,
          direction: 'positive',
          interpretation: 'Correlates with invasive lower gastrointestinal tumors',
        });
      }
      if (fga < 0.35) {
        rawAttributions.push({
          feature: `FGA (${fga.toFixed(2)})`,
          type: 'clinical',
          value: '+0.11',
          score: 0.11,
          direction: 'positive',
          interpretation: 'Consistent with microsatellite or non-CIN colorectal profiles',
        });
      }
      break;

    case 'Cutaneous Melanoma':
      if (mutations.BRAF === 1) {
        rawAttributions.push({
          feature: 'BRAF Mutation',
          type: 'gene',
          value: '+0.54',
          score: 0.54,
          direction: 'positive',
          interpretation: 'Signature oncogenic driver (V600E/K) in cutaneous melanoma',
        });
      }
      if (mutationCount > 20) {
        rawAttributions.push({
          feature: `High TMB (${mutationCount} muts)`,
          type: 'clinical',
          value: '+0.36',
          score: 0.36,
          direction: 'positive',
          interpretation: 'Reflects chronic UV-induced mutagenic burden characteristic of melanoma',
        });
      } else {
        rawAttributions.push({
          feature: `Low TMB (${mutationCount} muts)`,
          type: 'clinical',
          value: '-0.22',
          score: -0.22,
          direction: 'negative',
          interpretation: 'Uncharacteristically low mutation load for sun-exposed melanoma',
        });
      }
      if (mutations.PTEN === 1) {
        rawAttributions.push({
          feature: 'PTEN Inactivation',
          type: 'gene',
          value: '+0.17',
          score: 0.17,
          direction: 'positive',
          interpretation: 'Common secondary lesion facilitating PI3K pathway hyperactivation',
        });
      }
      if (mutations.CDKN2A === 1) {
        rawAttributions.push({
          feature: 'CDKN2A Mutation',
          type: 'gene',
          value: '+0.14',
          score: 0.14,
          direction: 'positive',
          interpretation: 'Frequent locus loss in melanoma pathogenesis',
        });
      }
      break;

    case 'Pancreatic Adenocarcinoma':
      if (mutations.KRAS === 1) {
        rawAttributions.push({
          feature: 'KRAS Mutation',
          type: 'gene',
          value: '+0.48',
          score: 0.48,
          direction: 'positive',
          interpretation: 'Present in >90% of Pancreatic Ductal Adenocarcinomas (PDAC)',
        });
      }
      if (mutations.SMAD4 === 1) {
        rawAttributions.push({
          feature: 'SMAD4 Inactivation',
          type: 'gene',
          value: '+0.31',
          score: 0.31,
          direction: 'positive',
          interpretation: 'Hallmark tumor suppressor deletion in pancreatic lineage',
        });
      }
      if (mutations.TP53 === 1) {
        rawAttributions.push({
          feature: 'TP53 Mutation',
          type: 'gene',
          value: '+0.21',
          score: 0.21,
          direction: 'positive',
          interpretation: 'Classic late-stage PanIN progression driver',
        });
      }
      if (mutations.APC === 1) {
        rawAttributions.push({
          feature: 'APC Mutation',
          type: 'gene',
          value: '-0.25',
          score: -0.25,
          direction: 'negative',
          interpretation: 'APC mutations are typical of colorectal rather than pancreatic origin',
        });
      }
      break;

    case 'Endometrial Carcinoma':
      if (sex === 0) {
        rawAttributions.push({
          feature: 'Female Sex [0]',
          type: 'clinical',
          value: '+0.32',
          score: 0.32,
          direction: 'positive',
          interpretation: 'Essential demographic baseline requirement',
        });
      }
      if (mutations.PTEN === 1) {
        rawAttributions.push({
          feature: 'PTEN Mutation',
          type: 'gene',
          value: '+0.41',
          score: 0.41,
          direction: 'positive',
          interpretation: 'Most prevalent genetic alteration in endometrioid carcinomas (65-80%)',
        });
      }
      if (mutations.ARID1A === 1) {
        rawAttributions.push({
          feature: 'ARID1A Mutation',
          type: 'gene',
          value: '+0.27',
          score: 0.27,
          direction: 'positive',
          interpretation: 'Frequent SWI/SNF complex loss in endometrial clear cell and endometrioid histology',
        });
      }
      if (mutations.PIK3CA === 1) {
        rawAttributions.push({
          feature: 'PIK3CA Mutation',
          type: 'gene',
          value: '+0.22',
          score: 0.22,
          direction: 'positive',
          interpretation: 'Frequent co-activating kinase mutation alongside PTEN',
        });
      }
      break;

    default:
      // Generic fallback for other cancers
      if (mutations.TP53 === 1) {
        rawAttributions.push({
          feature: 'TP53 Mutation',
          type: 'gene',
          value: '+0.30',
          score: 0.30,
          direction: 'positive',
          interpretation: 'Broad genomic hallmark across malignant lineages',
        });
      }
      rawAttributions.push({
        feature: `FGA (${fga.toFixed(2)})`,
        type: 'clinical',
        value: fga > 0.3 ? '+0.18' : '-0.12',
        score: fga > 0.3 ? 0.18 : -0.12,
        direction: fga > 0.3 ? 'positive' : 'negative',
        interpretation: 'Chromosomal alteration level concordance',
      });
      rawAttributions.push({
        feature: `Sample Type [${sampleType}]`,
        type: 'clinical',
        value: sampleType === 1 ? '+0.12' : '+0.08',
        score: sampleType === 1 ? 0.12 : 0.08,
        direction: 'positive',
        interpretation: sampleType === 1 ? 'Metastatic lesion profile alignment' : 'Primary site concordance',
      });
      break;
  }

  // Ensure we have at least 3 positive and 3 negative (or top features as requested: "top 3 features that positively or negatively influenced the classification")
  const positive = rawAttributions.filter((a) => a.direction === 'positive').sort((a, b) => b.score - a.score).slice(0, 3);
  const negative = rawAttributions.filter((a) => a.direction === 'negative').sort((a, b) => a.score - b.score).slice(0, 3);

  // If not enough negative, add biologically grounded contextual suppressors
  if (negative.length < 3) {
    if (!negative.some(n => n.feature.includes('VHL')) && cancerType !== 'Renal Cell Carcinoma') {
      negative.push({
        feature: 'VHL Wild-Type',
        type: 'gene',
        value: '-0.09',
        score: -0.09,
        direction: 'negative',
        interpretation: 'Absence of clear-cell renal hallmark confirms non-kidney lineage',
      });
    }
    if (!negative.some(n => n.feature.includes('TMB')) && negative.length < 3) {
      negative.push({
        feature: `Mutation Count (${mutationCount})`,
        type: 'clinical',
        value: '-0.07',
        score: -0.07,
        direction: 'negative',
        interpretation: 'Moderate mutation density lacks extreme hypermutation signature',
      });
    }
    if (negative.length < 3) {
      negative.push({
        feature: 'IDH1 Wild-Type',
        type: 'gene',
        value: '-0.06',
        score: -0.06,
        direction: 'negative',
        interpretation: 'Excludes lower-grade diffuse glioma metabolic profile',
      });
    }
  }

  // If not enough positive, add baseline features
  if (positive.length < 3) {
    if (!positive.some(p => p.feature.includes('Sex'))) {
      positive.push({
        feature: `Sex [${sex}] (${sex === 1 ? 'Male' : 'Female'})`,
        type: 'clinical',
        value: '+0.11',
        score: 0.11,
        direction: 'positive',
        interpretation: 'Epidemiological cohort incidence alignment',
      });
    }
    if (positive.length < 3) {
      positive.push({
        feature: 'Somatic Profile Concordance',
        type: 'genomic',
        value: '+0.08',
        score: 0.08,
        direction: 'positive',
        interpretation: 'Panel concordance score across MSK-IMPACT reference fold',
      });
    }
  }

  return {
    positive,
    negative,
    allTopAttributions: [...positive, ...negative].sort((a, b) => Math.abs(b.score) - Math.abs(a.score)),
  };
}

export const CANCER_CODE_MAPPING = {
  'Lung Adenocarcinoma': { code: 'LUAD', oncoTree: 'LUAD', icdO3: '8140/3', system: 'Thoracic' },
  'Colorectal Cancer': { code: 'CRC', oncoTree: 'COADREAD', icdO3: '8140/3', system: 'Gastrointestinal' },
  'Cutaneous Melanoma': { code: 'SKCM', oncoTree: 'MEL', icdO3: '8720/3', system: 'Dermatologic' },
  'Pancreatic Adenocarcinoma': { code: 'PAAD', oncoTree: 'PAAD', icdO3: '8500/3', system: 'Gastrointestinal / Hepatobiliary' },
  'Endometrial Carcinoma': { code: 'UCEC', oncoTree: 'UCEC', icdO3: '8380/3', system: 'Gynecologic' },
  'Breast Cancer': { code: 'BRCA', oncoTree: 'BRCA', icdO3: '8500/3', system: 'Breast' },
  'Bladder Cancer': { code: 'BLCA', oncoTree: 'BLCA', icdO3: '8120/3', system: 'Genitourinary' },
  'Prostate Cancer': { code: 'PRAD', oncoTree: 'PRAD', icdO3: '8140/3', system: 'Genitourinary' },
  'Renal Cell Carcinoma': { code: 'KIRC', oncoTree: 'ccRCC', icdO3: '8310/3', system: 'Genitourinary' },
  'Glioblastoma / Glioma': { code: 'GBM', oncoTree: 'GBM', icdO3: '9440/3', system: 'Central Nervous System' },
};

export const evaluateMockPrediction = predictTumorOfOrigin;

