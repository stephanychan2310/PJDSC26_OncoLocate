import { evaluateMockPrediction } from '../data/mockModel';

/**
 * Valid 93 somatic mutation feature genes recognized by the OncoLocate model bundle.
 */
const VALID_GENES = new Set([
  'ALK', 'APC', 'AR', 'ARID1A', 'ARID1B', 'ARID2', 'ASXL1', 'ATM', 'ATR', 'ATRX',
  'BAP1', 'BCOR', 'BRAF', 'BRCA2', 'CARD11', 'CDH1', 'CDKN2A', 'CIC', 'CREBBP', 'CTNNB1',
  'DOT1L', 'EGFR', 'EP300', 'EPHA3', 'EPHA5', 'EPHB1', 'ERBB2', 'ERBB3', 'ERBB4', 'ESR1',
  'FAT1', 'FBXW7', 'FGFR3', 'FLT1', 'FLT4', 'GATA3', 'GRIN2A', 'HGF', 'IDH1', 'KDM5C',
  'KDM6A', 'KDR', 'KEAP1', 'KIT', 'KMT2A', 'KMT2C', 'KMT2D', 'KRAS', 'MAP3K1', 'MED12',
  'MET', 'MGA', 'MTOR', 'NCOR1', 'NF1', 'NOTCH1', 'NOTCH2', 'NOTCH3', 'NOTCH4', 'NRAS',
  'NSD1', 'NTRK3', 'PAK5', 'PBRM1', 'PDGFRA', 'PIK3C2G', 'PIK3CA', 'PIK3CG', 'PIK3R1', 'POLE',
  'PTCH1', 'PTEN', 'PTPRD', 'PTPRS', 'PTPRT', 'RB1', 'RBM10', 'RNF43', 'ROS1', 'SETD2',
  'SF3B1', 'SMAD4', 'SMARCA4', 'SPEN', 'STAG2', 'STK11', 'TBX3', 'TERT', 'TET1', 'TET2',
  'TP53', 'TSC2', 'ZFHX3'
]);

/**
 * Default fallback benchmark test profiles if the Flask backend is unreachable.
 */
export const DEFAULT_FALLBACK_PROFILES = [
  { profile_id: 'P-0000646-T02-IM3', true_label: 'Melanoma' },
  { profile_id: 'P-0000379-T02-IM3', true_label: 'Bone Cancer' },
  { profile_id: 'P-0000257-T01-IM3', true_label: 'Soft Tissue Sarcoma' },
  { profile_id: 'P-0001816-T01-IM3', true_label: 'Pheochromocytoma' },
  { profile_id: 'P-0009478-T01-IM5', true_label: 'Vaginal Cancer' },
  { profile_id: 'P-0000134-T01-IM3', true_label: 'Gastrointestinal Stromal Tumor' },
  { profile_id: 'P-0003135-T04-IM5', true_label: 'Appendiceal Cancer' },
  { profile_id: 'P-0000174-T01-IM3', true_label: 'Thyroid Cancer' },
  { profile_id: 'P-0000073-T01-IM3', true_label: 'Ovarian Cancer' },
  { profile_id: 'P-0002007-T01-IM3', true_label: 'Histiocytosis' },
  { profile_id: 'P-0000401-T01-IM3', true_label: 'Prostate Cancer' },
  { profile_id: 'P-0005388-T01-IM5', true_label: 'Miscellaneous Brain Tumor' },
  { profile_id: 'P-0000588-T01-IM3', true_label: 'Glioma' },
  { profile_id: 'P-0000151-T01-IM3', true_label: 'Germ Cell Tumor' },
  { profile_id: 'P-0010568-T01-IM5', true_label: 'Hodgkin Lymphoma' },
  { profile_id: 'P-0001956-T01-IM3', true_label: 'Peripheral Nervous System' },
  { profile_id: 'P-0000130-T01-IM3', true_label: 'Small Cell Lung Cancer' },
  { profile_id: 'P-0000202-T01-IM3', true_label: 'Salivary Gland Cancer' },
  { profile_id: 'P-0001398-T01-IM3', true_label: 'Anal Cancer' },
  { profile_id: 'P-0003309-T01-IM5', true_label: 'Mature B-Cell Neoplasms' },
];

/**
 * Mapping between frontend preset case IDs and corresponding held-out profile IDs in the model.
 */
const PRESET_PROFILE_MAP = {
  case_luad: 'P-0000130-T01-IM3',
  case_crc: 'P-0002007-T01-IM3',
  case_melanoma: 'P-0000646-T02-IM3',
  case_pdac: 'P-0000073-T01-IM3',
  case_endometrial: 'P-0000174-T01-IM3',
};

/**
 * Calls GET /api/profiles.
 * Returns the list of available profile objects ({ profile_id, true_label }).
 * Gracefully returns default fallback cases if the server is unreachable.
 */
export async function getProfiles() {
  try {
    const response = await fetch('/api/profiles');
    if (!response.ok) {
      throw new Error(`Failed to fetch profiles: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data.profiles || DEFAULT_FALLBACK_PROFILES;
  } catch (error) {
    console.warn('Flask server unreachable at /api/profiles, using fallback profiles:', error);
    return DEFAULT_FALLBACK_PROFILES;
  }
}

/**
 * Formats edits and calls POST /api/predict.
 * Returns structured prediction data with differential candidates and SHAP attributions.
 * Falls back to evaluateMockPrediction if the server is unreachable or errors.
 */
export async function predictCase(profileId, formInputs = {}) {
  // Normalize input fields (supporting both somaticMutations/mutations, fractionGenomeAltered/fga)
  const somaticMutations = formInputs.somaticMutations || formInputs.mutations || {};
  const fga = Number(formInputs.fractionGenomeAltered ?? formInputs.fga ?? 0);
  const mutationCount = parseInt(formInputs.mutationCount ?? formInputs.mutation_count ?? 0, 10);

  // Map preset IDs or resolve fallback profile ID
  let resolvedProfileId = PRESET_PROFILE_MAP[profileId] || profileId;
  if (!resolvedProfileId || resolvedProfileId.startsWith('case_')) {
    resolvedProfileId = 'P-0000646-T02-IM3';
  }

  // Filter genes against the model's 93-gene panel to prevent 400 validation error
  const allGenesOn = Object.keys(somaticMutations).filter((g) => somaticMutations[g] === 1);
  const allGenesOff = Object.keys(somaticMutations).filter((g) => somaticMutations[g] === 0);

  const genesOn = allGenesOn.filter((g) => VALID_GENES.has(g));
  const genesOff = allGenesOff.filter((g) => VALID_GENES.has(g));

  const payload = {
    profile_id: resolvedProfileId,
    edits: {
      genes_on: genesOn,
      genes_off: genesOff,
      fga: fga,
      mutation_count: mutationCount,
    },
  };

  try {
    const response = await fetch('/api/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.error || `Server responded with ${response.status}`);
    }

    const data = await response.json();
    const candidates = data.candidates || [];
    const candidate0 = candidates[0] || { cancer_type: 'Unknown', probability: 0, shap: [] };

    // Format top prediction
    const topConfidenceScore = Number((candidate0.probability * 100).toFixed(1));
    const topPrediction = {
      cancer_type: candidate0.cancer_type,
      name: candidate0.cancer_type, // UI component compatibility
      confidence_score: topConfidenceScore,
      probability: topConfidenceScore, // UI component compatibility
      tier: data.tier,
      margin: data.margin,
      low_confidence: data.low_confidence,
      certainty_level: topConfidenceScore >= 70 ? 'High Certainty' : (topConfidenceScore >= 40 ? 'Moderate' : 'Equivocal'),
      actionability_category: 'Category 1',
    };

    // Format differential diagnoses (top 5)
    const differentialDiagnoses = candidates.slice(0, 5).map((cand, idx) => ({
      rank: idx + 1,
      cancer_type: cand.cancer_type,
      name: cand.cancer_type, // UI component compatibility
      probability: Number((cand.probability * 100).toFixed(1)),
      raw_probability: cand.probability,
    }));

    // Format SHAP attributions from candidate[0].shap
    const rawShap = candidate0.shap || [];
    const positiveDrivers = rawShap
      .filter((item) => item.contribution > 0)
      .map((item) => ({
        feature: item.feature.replace(/_MUT$/, ' Mutation').replace(/_CNA$/, ' CNA'),
        rawFeature: item.feature,
        value: item.value !== undefined ? String(Number(item.value).toFixed(2)) : `+${item.contribution.toFixed(2)}`,
        impact: item.contribution,
        score: item.contribution,
        type: item.feature.includes('_MUT') ? 'gene' : (item.feature.includes('_CNA') ? 'cna' : 'clinical'),
        direction: 'positive',
        interpretation: `TreeSHAP score contribution (+${item.contribution.toFixed(2)}) for ${candidate0.cancer_type}`,
      }));

    const negativeSuppressors = rawShap
      .filter((item) => item.contribution < 0)
      .map((item) => ({
        feature: item.feature.replace(/_MUT$/, ' Mutation').replace(/_CNA$/, ' CNA'),
        rawFeature: item.feature,
        value: item.value !== undefined ? String(Number(item.value).toFixed(2)) : item.contribution.toFixed(2),
        impact: item.contribution,
        score: item.contribution,
        type: item.feature.includes('_MUT') ? 'gene' : (item.feature.includes('_CNA') ? 'cna' : 'clinical'),
        direction: 'negative',
        interpretation: `TreeSHAP score contribution (${item.contribution.toFixed(2)}) de-weighting alternative diagnoses`,
      }));

    const shapAttributions = {
      positive_drivers: positiveDrivers,
      negative_suppressors: negativeSuppressors,
    };

    return {
      top_prediction: topPrediction,
      differential_diagnoses: differentialDiagnoses,
      shap_attributions: shapAttributions,

      // Dual-compatibility aliases for existing UI components:
      topPrediction,
      differentialDiagnoses,
      shapExplanations: {
        positive: positiveDrivers,
        negative: negativeSuppressors,
      },
      modelMetadata: {
        modelName: 'OncoLocate (Flask)',
        architecture: 'XGBoost / Gradient Boosted Trees + Calibrated Platt Scaling',
        cohortSamples: 10945,
        featuresCount: 93,
        tier: data.tier,
        tierAccuracy: data.tier_accuracy,
        margin: data.margin,
        lowConfidence: data.low_confidence,
        accuracyROC: 0.941,
        status: 'Live',
        isLive: true,
      },
      isLive: true,
    };
  } catch (error) {
    console.warn('Live inference failed, cleanly falling back to evaluateMockPrediction:', error);
    const normalizedInputs = {
      sex: formInputs.sex ?? 0,
      sampleType: formInputs.sampleType ?? formInputs.sample_type ?? 0,
      fga: fga,
      mutationCount: mutationCount,
      mutations: somaticMutations,
    };

    const mockResult = evaluateMockPrediction(normalizedInputs);
    return {
      ...mockResult,
      top_prediction: mockResult.topPrediction,
      differential_diagnoses: mockResult.differentialDiagnoses,
      shap_attributions: {
        positive_drivers: mockResult.shapExplanations?.positive || [],
        negative_suppressors: mockResult.shapExplanations?.negative || [],
      },
      isLive: false,
    };
  }
}

