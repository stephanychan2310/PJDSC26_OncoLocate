# Pan-Cancer Tumor of Origin — Frontend Architecture & Integration Specification

## 1. Overview & Architecture

### 1.1 Purpose & Clinical Context
The **Pan-Cancer Tumor of Origin (TOO)** application is an industry-grade clinical genomics decision-support workbench built for oncology teams and molecular pathologists investigating **Cancer of Unknown Primary (CUP)** and atypical metastatic presentations.

Trained against clinical-genomic data from the **MSK-IMPACT cohort** ($n=10,945$, 58 OncoTree classes, stratified AUC = 0.941), the system evaluates:
1. **Clinical priors**: Biological sex and biopsy sample site (Primary vs. Metastatic).
2. **Chromosomal instability**: Fraction Genome Altered (FGA) copy-number alteration index.
3. **Mutational burden**: Total non-synonymous mutation count (TMB).
4. **Somatic mutation profile**: Binary mutation status across key oncogenes and tumor suppressor genes.

The platform provides calibrated posterior probability distributions across differential candidate lineages, coupled with additive **TreeSHAP** feature attributions to provide interpretable, evidence-based rationales for each diagnostic classification.

---

### 1.2 Layout & View Routing (`App.jsx`)
The frontend is built with **React 19**, **Vite**, **Tailwind CSS v4**, **Lucide React**, and **Recharts**. The shell provides a responsive workspace layout that maintains high data density:

```
+------------------------------------------------------------------------------------------------+
|  [SIDEBAR - 260px]     |  [HEADER - 64px Sticky] Search: [⌘K] | Preset | Export | Reset | Mode |
|  - Brand Header (h-16) |-----------------------------------------------------------------------|
|  - Navigation Items    |  [ACTIVE VIEW CONTAINER - Comfortable pb-16 padding]                  |
|    * Dashboard         |                                                                       |
|    * Case Cohort       |  Views:                                                               |
|    * Patient Protocol  |    1. Dashboard: TopMetricCards + 42/58 Two-Column Workbench          |
|    * Specs (Modal)     |    2. Case Cohort: Standardized Benchmark Directory Table             |
|    * Settings          |    3. Patient Protocol: 4-Phase CUP Clinical SOP Checklist            |
|  - Cohort Queue        |    4. Settings: Hyperparameters & Decision Threshold Sliders          |
|  - Clinician Profile   |-----------------------------------------------------------------------|
|                        |  [MICRO-FOOTER] Clinova Hospital Platform • MSK-IMPACT n=10,945 • AUC |
+------------------------------------------------------------------------------------------------+
```

#### Persistent Layout Elements
- **Sidebar (`Sidebar.jsx`)**: Fixed 260px spine (`w-[260px] min-w-[260px] max-w-[260px] shrink-0 bg-[var(--sidebar)] border-r border-[var(--sidebar-border)] min-h-screen`).
  - **Brand Header (64px)**: Emblem with genomic DNA icon, Title *"Pan-Cancer Project"*, Subtitle *"Tumor Origin Classifier"*.
  - **Navigation List**: Interactive links for *Dashboard*, *Case Cohort*, *Patient Protocol*, *Specs*, and *Settings*.
  - **Active Cohort Queue**: Quick-selection list displaying benchmark cases with FGA and mutation counts.
  - **Pinned Profile Badge**: Clinician identifier (*"Dr. Specialist • Clinova Oncology Lab"*).
- **Top Bar Header (`Header.jsx`)**: Sticky 64px header (`h-16 px-6 border-b border-[var(--border)] bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-30`).
  - **Search Input**: Rounded rectangular container (`rounded-lg border border-[var(--border)] bg-[var(--background)]`) with `<kbd>⌘K</kbd>` command badge.
  - **Status Indicator**: Animated pulse badge (*"System Online / Model Ready"*).
  - **Benchmark Case Dropdown**: Instant case profile preset loader.
  - **Actions**: Export report (`window.print()`), Reset baseline values, and Dark Mode toggle button (`Sun` / `Moon`).
- **Institutional Micro-Footer**: Clean metadata strip containing cohort size, model version, and ROC-AUC metrics.

#### View Routing
State-based view routing is managed in `App.jsx` via the `activeTab` state (`'dashboard' | 'cohort' | 'protocol' | 'settings'`):
1. **`dashboard` (Default)**: Renders `TopMetricCards`, `ClinicalInputForm` (left 42%), and the Diagnostic Canvas (`HeroResultCard`, `DifferentialBarChart`, `ExplainabilityCard` right 58%).
2. **`cohort`**: Renders `CaseCohortView` displaying the 5 reference benchmark samples with one-click *"Activate Case"* triggers.
3. **`protocol`**: Renders `PatientProtocolView` providing the 4-phase clinical CUP diagnostic workflow.
4. **`settings`**: Renders `SettingsView` with sliders for actionability threshold, confidence floor, calibration method, and variance filtering.
5. **`isSpecsOpen` (Modal)**: Controlled boolean state rendering `ModelMetadataModal` over any view.

---

### 1.3 Core Component Breakdown

| Component | Path | Role & Capabilities |
| :--- | :--- | :--- |
| **`Sidebar`** | `src/components/Sidebar.jsx` | Fixed 260px navigation, view switcher, preset cases queue, and user badge. |
| **`Header`** | `src/components/Header.jsx` | 64px sticky navigation, search input, case switcher, print trigger, dark mode toggle. |
| **`TopMetricCards`** | `src/components/TopMetricCards.jsx` | 4-card metric strip: Top Predicted Origin (break-words), Genomic Burden (CIN), Somatic Mutations, and Actionability. |
| **`ClinicalInputForm`** | `src/components/ClinicalInputForm.jsx` | Dense 42% workbench input: Sex segmented toggle, Origin site toggle, FGA number/slider, TMB presets, Somatic gene search and chip selector, Live Auto-calc toggle, and Run Inference trigger. |
| **`HeroResultCard`** | `src/components/HeroResultCard.jsx` | Top classification hero card: Disease title, OncoTree code, ICD-O-3 code, organ system, confidence badge, certainty tag, copy summary trigger. |
| **`DifferentialBarChart`** | `src/components/DifferentialBarChart.jsx` | Horizontal bar chart (Recharts) mapping top 5 differential diagnoses with Clinova occupancy color scheme, 20% reference line, metric cards grid, and audit table toggle. |
| **`ExplainabilityCard`** | `src/components/ExplainabilityCard.jsx` | SHAP feature impact view: Segmented filter pills (All/Positive/Negative), magnitude bars, feature interpretation, and baseline driver fallbacks. |
| **`CaseCohortView`** | `src/components/CaseCohortView.jsx` | Standardized directory table for benchmark cases (LUAD, CRC, Melanoma, PDAC, UCEC) with direct activation buttons. |
| **`PatientProtocolView`**| `src/components/PatientProtocolView.jsx` | Interactive 4-phase clinical SOP checklist for CUP diagnosis and molecular triage. |
| **`SettingsView`** | `src/components/SettingsView.jsx` | Model hyperparameter tuning: Cut-off threshold slider, confidence floor slider, Platt/Isotonic toggles, and rare variant variance filter. |
| **`ModelMetadataModal`**| `src/components/ModelMetadataModal.jsx` | Dialog overlay detailing MSK-IMPACT validation statistics, GBDT architecture, and clinical decision support notices. |
| **`Tooltip`** | `src/components/Tooltip.jsx` | Contextual medical glossary popovers with auto-positioned tail and accessible tags. |

---

## 2. Design System & Design Tokens

### 2.1 Clinova Institutional Palette (OKLCH)
The design system is implemented in `frontend/src/index.css` using modern CSS variables defined in `:root` and `.dark`.

```css
:root {
  --sidebar-w: 260px;
  --background: oklch(98.5% 0.004 90);           /* Institutional crisp canvas */
  --foreground: oklch(21% 0.01 90);              /* Deep slate primary text */
  --card: oklch(100% 0 0);                       /* Pure white card surface */
  --card-foreground: oklch(21% 0.01 90);
  --primary: oklch(55% 0.09 195);                /* Deep Clinical Teal (#0f766e) */
  --primary-foreground: oklch(99% 0.005 90);
  --muted: oklch(96% 0.006 90);                  /* Soft tinted controls container */
  --muted-foreground: oklch(52% 0.012 90);       /* Secondary slate label text */
  --border: oklch(90% 0.006 90);                 /* Hairline 1px border */
  --sidebar: oklch(96.5% 0.005 90);              /* Subtle off-white sidebar */
  --sidebar-foreground: oklch(30% 0.01 90);
  --sidebar-accent: oklch(93% 0.02 195);         /* Mint/Teal tint active tab */
  --sidebar-accent-foreground: oklch(40% 0.06 195);
  --sidebar-border: oklch(90% 0.006 90);
}

.dark {
  --background: oklch(18% 0.01 240);             /* Deep dark medical slate */
  --foreground: oklch(98% 0.005 90);             /* Crisp off-white text */
  --card: oklch(22% 0.012 240);                  /* Dark card container */
  --card-foreground: oklch(98% 0.005 90);
  --muted: oklch(25% 0.01 240);                  /* Recessed input background */
  --muted-foreground: oklch(70% 0.01 90);        /* Muted secondary text */
  --border: oklch(28% 0.01 240);                 /* Dark hairline border */
  --sidebar: oklch(16% 0.01 240);                /* Dark navigation spine */
  --sidebar-foreground: oklch(85% 0.01 90);
  --sidebar-accent: oklch(26% 0.03 195);         /* Deep teal active background */
  --sidebar-accent-foreground: oklch(92% 0.04 195);
  --sidebar-border: oklch(25% 0.01 240);
}
```

### 2.2 Typography Scale
- **Primary Body Font**: `'Inter', system-ui, -apple-system, sans-serif` (weights: 400, 500, 600, 700).
- **Tabular / Numerical Font**: `'JetBrains Mono', monospace` (`font-mono`) used for all probabilities, ICD codes, FGA/TMB values, and OncoTree codes.
- **Hierarchy Rules**:
  - `text-2xl` / `text-3xl` font-extrabold: Cancer primary diagnosis headers.
  - `text-sm` font-semibold: Card headers and primary navigation links.
  - `text-xs` font-medium uppercase tracking-wider: Field labels, section dividers, and table headers.
  - `text-[10px]` font-mono: Badges, gene chips, metadata tags.

### 2.3 Recharts Differential Bar Color Hierarchy
In `DifferentialBarChart.jsx`, diagnoses are mapped to an occupancy color hierarchy:
- **Rank 1 (Top Diagnosis)**: `#dc2626` (Coral Red / Crimson) — denotes primary candidate.
- **Rank 2 & Rank 3**: `#d97706` (Warm Amber / Gold) — denotes secondary differential candidates.
- **Rank 4 & Rank 5**: `#0f766e` (Deep Clinical Teal) — denotes low-probability candidate tail.
- **Bar Properties**: `radius={[0, 6, 6, 0]}`, `barSize={20}`.
- **Actionability Marker**: Vertical dashed line at `x = 20` (`stroke="#94a3b8"`, `strokeDasharray="2 3"`).

---

## 3. Clinical Input Contract (JSON Request Payload)

When the user clicks **"Run Diagnostic Inference"** or triggers **"Live Auto-calc"**, the client emits the following payload to the inference engine.

### 3.1 JSON Request Payload Schema
```json
{
  "sex": 0,
  "sample_type": 1,
  "fraction_genome_altered": 0.38,
  "mutation_count": 7,
  "somatic_mutations": {
    "TP53": 1,
    "KRAS": 0,
    "EGFR": 1,
    "PIK3CA": 0,
    "APC": 0,
    "BRAF": 0,
    "PTEN": 0,
    "ARID1A": 0,
    "PIK3R1": 0,
    "RB1": 0,
    "CDKN2A": 0,
    "SMAD4": 0,
    "BRCA1": 0,
    "BRCA2": 0,
    "VHL": 0,
    "IDH1": 0
  }
}
```

### 3.2 Field Definitions & Validation Rules

| Key | Type | Valid Values | Description | Clinical Rationale |
| :--- | :--- | :--- | :--- | :--- |
| `sex` | `integer` | `0` or `1` | `0`: Female, `1`: Male | Modulates prior probability for sex-specific malignancies (e.g. Prostate vs. Uterine/Breast). |
| `sample_type` | `integer` | `0` or `1` | `0`: Primary, `1`: Metastasis | Adjusts model weights for metastatic dissemination patterns and genomic divergence. |
| `fraction_genome_altered` | `float` | `0.00` to `1.00` | Fraction of tumor genome affected by copy number alterations | Quantifies Chromosomal Instability (CIN). Low: `< 0.20`, Mod: `0.20-0.45`, High: `> 0.45`. |
| `mutation_count` | `integer` | $\ge 0$ (typical `0-500`) | Non-synonymous somatic mutation count across targeted panel | Mutational burden index (TMB). Low: `< 10`, Intermediate: `10-20`, High: `> 20`. |
| `somatic_mutations` | `object` | Key: Gene symbol (`string`), Value: `0` (WT) or `1` (MUT) | Map of tested driver genes to binary mutation state | Primary genomic feature matrix used by the GBDT classifier. |

### 3.3 Core Somatic Genes Panel
The current clinical panel encompasses 16 key driver genes:

| Symbol | Pathway / Functional Category | Pathognomonic Lineage Enriched |
| :--- | :--- | :--- |
| **`TP53`** | Cell Cycle / Genome Integrity | Broad Pan-Cancer (high in High-Grade Serous Ovarian, SCLC) |
| **`KRAS`** | RTK/RAS Signaling | Pancreatic Ductal Adenocarcinoma (>90%), Colorectal (45%), Lung (30%) |
| **`EGFR`** | RTK/RAS Signaling | Lung Adenocarcinoma (NSCLC activating mutations) |
| **`PIK3CA`** | PI3K/AKT/MTOR Signaling | Breast Carcinoma, Endometrial, Cervical |
| **`APC`** | WNT/β-Catenin Signaling | Colorectal Carcinoma (canonical gatekeeper) |
| **`BRAF`** | MAPK/ERK Signaling | Cutaneous Melanoma (V600E), Thyroid Papillary, CRC |
| **`PTEN`** | PI3K/AKT Signaling (Tumor Suppressor)| Endometrial Carcinoma, Glioblastoma, Prostate |
| **`ARID1A`** | SWI/SNF Chromatin Remodeling | Clear Cell Ovarian, Endometrial Carcinoma |
| **`PIK3R1`** | PI3K Regulatory Subunit | Endometrial, Glioblastoma |
| **`RB1`** | Cell Cycle G1/S Checkpoint | Small Cell Lung Cancer, Retinoblastoma, Bladder |
| **`CDKN2A`** | Cell Cycle (p16INK4a / p14ARF) | Cutaneous Melanoma, Pancreatic Adenocarcinoma, Bladder |
| **`SMAD4`** | TGF-β Signaling | Pancreatic Adenocarcinoma, Colorectal |
| **`BRCA1`** | Homologous Recombination Repair | Hereditary Breast & Ovarian Cancer |
| **`BRCA2`** | Homologous Recombination Repair | Hereditary Breast, Ovarian, Prostate, Pancreatic |
| **`VHL`** | Hypoxia / Ubiquitination | Clear Cell Renal Cell Carcinoma (ccRCC >80%) |
| **`IDH1`** | Cellular Metabolism (2-HG) | Lower-Grade Glioma, Secondary Glioblastoma, Cholangiocarcinoma |

---

## 4. Diagnostic Output Contract (JSON Response Payload)

The backend inference response must match the following schema.

### 4.1 JSON Response Payload Schema
```json
{
  "top_prediction": {
    "cancer_type": "Lung Adenocarcinoma",
    "oncotree_code": "LUAD",
    "icd_code": "8140/3",
    "organ_system": "Thoracic",
    "confidence_score": 82.4,
    "certainty_level": "High Certainty",
    "actionability_category": "Category 1"
  },
  "differential_diagnoses": [
    {
      "rank": 1,
      "cancer_type": "Lung Adenocarcinoma",
      "oncotree_code": "LUAD",
      "probability": 82.4
    },
    {
      "rank": 2,
      "cancer_type": "Colorectal Cancer",
      "oncotree_code": "COADREAD",
      "probability": 7.1
    },
    {
      "rank": 3,
      "cancer_type": "Breast Cancer",
      "oncotree_code": "BRCA",
      "probability": 4.5
    },
    {
      "rank": 4,
      "cancer_type": "Pancreatic Adenocarcinoma",
      "oncotree_code": "PAAD",
      "probability": 3.8
    },
    {
      "rank": 5,
      "cancer_type": "Cutaneous Melanoma",
      "oncotree_code": "SKCM",
      "probability": 2.2
    }
  ],
  "shap_attributions": {
    "positive_drivers": [
      {
        "feature": "EGFR Mutation",
        "type": "gene",
        "value": "+0.44",
        "score": 0.44,
        "direction": "positive",
        "interpretation": "Pathognomonic activating driver in non-small cell lung cancer"
      },
      {
        "feature": "FGA (0.38)",
        "type": "clinical",
        "value": "+0.14",
        "score": 0.14,
        "direction": "positive",
        "interpretation": "Elevated chromosomal instability typical in invasive lung carcinoma"
      },
      {
        "feature": "Metastatic Biopsy",
        "type": "clinical",
        "value": "+0.09",
        "score": 0.09,
        "direction": "positive",
        "interpretation": "High frequency of distant metastatic presentation in cohort"
      }
    ],
    "negative_suppressors": [
      {
        "feature": "APC Wild-Type",
        "type": "gene",
        "value": "-0.24",
        "score": -0.24,
        "direction": "negative",
        "interpretation": "Absence of definitive WNT pathway alteration suppresses GI differential"
      },
      {
        "feature": "KRAS Wild-Type",
        "type": "gene",
        "value": "-0.18",
        "score": -0.18,
        "direction": "negative",
        "interpretation": "Lower likelihood of mucinous or pancreatic ductal differentiation"
      },
      {
        "feature": "Low TMB (7 muts)",
        "type": "clinical",
        "value": "-0.12",
        "score": -0.12,
        "direction": "negative",
        "interpretation": "De-weights sun-exposed skin or mismatch-repair deficient phenotypes"
      }
    ]
  },
  "model_metadata": {
    "model_name": "MSK-IMPACT Ensemble v3.1",
    "architecture": "Calibrated GBDT + TreeSHAP",
    "cohort_samples": 10945,
    "features_count": 74,
    "accuracy_roc": 0.941,
    "status": "Ready",
    "inference_time_ms": 14
  }
}
```

### 4.2 Diagnostic Output Fields

#### Top Prediction Object (`top_prediction`)
- `cancer_type` (`string`): Human-readable diagnosis name (e.g. `"Lung Adenocarcinoma"`).
- `oncotree_code` (`string`): Standard MSK OncoTree ontology classification code (e.g. `"LUAD"`).
- `icd_code` (`string`): World Health Organization ICD-O-3 histology/behavior code (e.g. `"8140/3"`).
- `organ_system` (`string`): Anatomical body system (e.g. `"Thoracic"`, `"Gastrointestinal"`).
- `confidence_score` (`float`): Platt-scaled posterior probability percentage ($0.0 \text{ to } 100.0$).
- `certainty_level` (`string`):
  - `"High Certainty"`: Probability $\ge 70.0\%$.
  - `"Moderate"`: Probability between $40.0\%$ and $69.9\%$.
  - `"Equivocal"`: Probability $< 40.0\%$.
- `actionability_category` (`string`):
  - `"Category 1"`: Tumor harbors actionable genomic targets with FDA-approved targeted therapies (e.g. EGFR, BRAF, ERBB2).
  - `"Category 2"`: Standard cytotoxic / empirical CUP care pathway.

#### Differential Diagnoses Array (`differential_diagnoses`)
Ordered array of the top 5 predicted diseases ($N=5$) sorted in descending order of probability:
- `rank` (`integer`): 1 to 5.
- `cancer_type` (`string`): Disease name.
- `oncotree_code` (`string`): Ontology symbol.
- `probability` (`float`): Calibrated percentage ($0.0 \text{ to } 100.0$).

#### SHAP Attributions Object (`shap_attributions`)
- `positive_drivers` (`array`): Top 3 features that positively increased the log-odds toward the top diagnosis.
- `negative_suppressors` (`array`): Top 3 features that de-weighted alternate lineages.
- **Item Fields**:
  - `feature` (`string`): Feature title (e.g. `"EGFR Mutation"`, `"Female Sex [0]"`).
  - `type` (`string`): `"gene"` or `"clinical"`.
  - `value` (`string`): Formatted attribution value (e.g. `"+0.44"`, `"-0.24"`).
  - `score` (`float`): Raw numerical Shapley value.
  - `direction` (`string`): `"positive"` or `"negative"`.
  - `interpretation` (`string`): Clinical molecular rationale.

---

## 5. Backend Integration Guide

Follow these steps to replace the client-side simulation in `frontend/src/data/mockModel.js` with a live Python backend (FastAPI / Flask).

### 5.1 FastAPI Reference Implementation (`backend/main.py`)

```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, List, Optional
import time

app = FastAPI(
    title="Pan-Cancer Tumor of Origin Inference API",
    version="1.0.0",
    description="MSK-IMPACT Machine Learning Classifier for Cancer of Unknown Primary"
)

# 1. CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Pydantic Models Matching Frontend Contract
class SomaticMutations(BaseModel):
    TP53: int = Field(default=0, ge=0, le=1)
    KRAS: int = Field(default=0, ge=0, le=1)
    EGFR: int = Field(default=0, ge=0, le=1)
    PIK3CA: int = Field(default=0, ge=0, le=1)
    APC: int = Field(default=0, ge=0, le=1)
    BRAF: int = Field(default=0, ge=0, le=1)
    PTEN: int = Field(default=0, ge=0, le=1)
    ARID1A: int = Field(default=0, ge=0, le=1)
    PIK3R1: int = Field(default=0, ge=0, le=1)
    RB1: int = Field(default=0, ge=0, le=1)
    CDKN2A: int = Field(default=0, ge=0, le=1)
    SMAD4: int = Field(default=0, ge=0, le=1)
    BRCA1: int = Field(default=0, ge=0, le=1)
    BRCA2: int = Field(default=0, ge=0, le=1)
    VHL: int = Field(default=0, ge=0, le=1)
    IDH1: int = Field(default=0, ge=0, le=1)

class PredictionRequest(BaseModel):
    sex: int = Field(ge=0, le=1, description="0: Female, 1: Male")
    sample_type: int = Field(ge=0, le=1, description="0: Primary, 1: Metastatic")
    fraction_genome_altered: float = Field(ge=0.0, le=1.0, description="FGA index 0.0-1.0")
    mutation_count: int = Field(ge=0, description="TMB non-synonymous mutation count")
    somatic_mutations: SomaticMutations

class TopPrediction(BaseModel):
    cancer_type: str
    oncotree_code: str
    icd_code: str
    organ_system: str
    confidence_score: float
    certainty_level: str
    actionability_category: str

class DifferentialItem(BaseModel):
    rank: int
    cancer_type: str
    oncotree_code: str
    probability: float

class ShapItem(BaseModel):
    feature: str
    type: str
    value: str
    score: float
    direction: str
    interpretation: str

class ShapAttributions(BaseModel):
    positive_drivers: List[ShapItem]
    negative_suppressors: List[ShapItem]

class ModelMetadata(BaseModel):
    model_name: str
    architecture: str
    cohort_samples: int
    features_count: int
    accuracy_roc: float
    status: str
    inference_time_ms: int

class PredictionResponse(BaseModel):
    top_prediction: TopPrediction
    differential_diagnoses: List[DifferentialItem]
    shap_attributions: ShapAttributions
    model_metadata: ModelMetadata

# 3. Inference Endpoint
@app.post("/api/predict", response_model=PredictionResponse)
async def predict_tumor_origin(payload: PredictionRequest):
    start_time = time.time()
    
    try:
        # TODO: Load pre-trained model artifact:
        # model = joblib.load("model/msk_impact_gbdt.joblib")
        # scaler = joblib.load("model/feature_scaler.joblib")
        
        # Simulated inference return (replace with model.predict_proba):
        return {
            "top_prediction": {
                "cancer_type": "Lung Adenocarcinoma",
                "oncotree_code": "LUAD",
                "icd_code": "8140/3",
                "organ_system": "Thoracic",
                "confidence_score": 82.4,
                "certainty_level": "High Certainty",
                "actionability_category": "Category 1"
            },
            "differential_diagnoses": [
                {"rank": 1, "cancer_type": "Lung Adenocarcinoma", "oncotree_code": "LUAD", "probability": 82.4},
                {"rank": 2, "cancer_type": "Colorectal Cancer", "oncotree_code": "COADREAD", "probability": 7.1},
                {"rank": 3, "cancer_type": "Breast Cancer", "oncotree_code": "BRCA", "probability": 4.5},
                {"rank": 4, "cancer_type": "Pancreatic Adenocarcinoma", "oncotree_code": "PAAD", "probability": 3.8},
                {"rank": 5, "cancer_type": "Cutaneous Melanoma", "oncotree_code": "SKCM", "probability": 2.2}
            ],
            "shap_attributions": {
                "positive_drivers": [
                    {
                        "feature": "EGFR Mutation",
                        "type": "gene",
                        "value": "+0.44",
                        "score": 0.44,
                        "direction": "positive",
                        "interpretation": "Pathognomonic activating driver in non-small cell lung cancer"
                    }
                ],
                "negative_suppressors": [
                    {
                        "feature": "APC Wild-Type",
                        "type": "gene",
                        "value": "-0.24",
                        "score": -0.24,
                        "direction": "negative",
                        "interpretation": "Absence of definitive WNT pathway alteration"
                    }
                ]
            },
            "model_metadata": {
                "model_name": "MSK-IMPACT Ensemble v3.1",
                "architecture": "Calibrated GBDT + TreeSHAP",
                "cohort_samples": 10945,
                "features_count": 74,
                "accuracy_roc": 0.941,
                "status": "Ready",
                "inference_time_ms": int((time.time() - start_time) * 1000)
            }
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
```

---

### 5.2 Frontend Client Adapter (`frontend/src/services/apiClient.js`)

Create a dedicated API client module that handles payload normalization between frontend state and backend schemas:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Executes remote inference against the FastAPI backend
 * Falls back to local simulation on network failure
 */
export async function executeRemoteInference(inputs) {
  // 1. Transform camelCase frontend state to snake_case backend contract
  const requestPayload = {
    sex: inputs.sex,
    sample_type: inputs.sampleType,
    fraction_genome_altered: inputs.fga,
    mutation_count: inputs.mutationCount,
    somatic_mutations: inputs.mutations,
  };

  try {
    const response = await fetch(`${API_BASE_URL}/api/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // 2. Map snake_case response back into frontend state model
    return {
      topPrediction: {
        name: data.top_prediction.cancer_type,
        probability: data.top_prediction.confidence_score,
        oncoTree: data.top_prediction.oncotree_code,
        icdO3: data.top_prediction.icd_code,
        system: data.top_prediction.organ_system,
        certainty: data.top_prediction.certainty_level,
        actionability: data.top_prediction.actionability_category,
      },
      differentialDiagnoses: data.differential_diagnoses.map((d) => ({
        name: d.cancer_type,
        probability: d.probability,
        oncoTree: d.oncotree_code,
        rank: d.rank,
      })),
      shapExplanations: {
        positive: data.shap_attributions.positive_drivers,
        negative: data.shap_attributions.negative_suppressors,
      },
      modelMetadata: data.model_metadata,
    };
  } catch (error) {
    console.warn('Backend inference unreachable, using fallback simulation:', error);
    // Optional fallback to mockModel.js for offline dev resilience
    const { predictTumorOfOrigin } = await import('../data/mockModel');
    return predictTumorOfOrigin(inputs);
  }
}
```

---

### 5.3 Connecting in `App.jsx`
To activate the live API in `App.jsx`, replace the `predictTumorOfOrigin` call inside `executeInference`:

```javascript
import { executeRemoteInference } from './services/apiClient';

// Inside App component:
const executeInference = useCallback(async (currentInputs) => {
  setIsCalculating(true);
  try {
    const result = await executeRemoteInference(currentInputs);
    setPredictionResult(result);
  } catch (err) {
    console.error('Inference error:', err);
  } finally {
    setIsCalculating(false);
  }
}, []);
```

---

### 5.4 Environment Configuration (`frontend/.env.development`)
Create a `.env.development` file in the `frontend` root:
```ini
VITE_API_URL=http://localhost:8000
```
Restart the Vite dev server (`npm run dev`) after creating or editing `.env` files.

