# OncoLocate research prototype

Pan-cancer tumor-origin classification using MSK-IMPACT 2017. This is a research prototype for exploring model behavior. It is **not a diagnostic tool**, is not validated for Filipino patients, and must not replace pathology, imaging, or clinical judgment.

## Data and known simplification

`preparingdata.py` builds the 507-feature panel, joins on Sample ID, makes fold 0 of a patient-grouped `StratifiedGroupKFold(5)` split, and fits the scaler on training rows. The 2% mutation filter is cohort-level and therefore uses information across the cohort; this is a known simplification retained to preserve the supplied preparation logic. The fold-0 training partition lacks Adrenocortical Adenoma, so the fitted classifier supports 57 of the cohort's 58 types; its one held-out row is listed separately and excluded from scored metrics. `metrics.json` records eligible clinical counts and post-join model counts so excluded samples and patients are visible.

## Run

Use 64-bit Python 3.14 and install the pinned dependencies in `requirements.txt`, then from this directory run:

```powershell
python -m pip install -r requirements.txt
python pipeline.py
python checks.py
python service.py
```

The assert-based checks also verify that XGBoost class columns map to the cancer-type encoder and that TreeSHAP contributions plus the expected value reproduce each raw class score. SHAP contributions are in the model's raw-score units, and the API labels them **contribution to model score**.

CV scalers are fit on each fold's training rows only. XGBoost early stopping uses a patient-grouped stopping subset drawn from each CV training fold, then refits on that full fold at the selected round count before scoring the untouched outer validation fold. Feature importance rankings for CV feature-count scores are also fit within each fold's training portion. Calibration temperature and confidence-tier accuracy are estimated from pooled out-of-fold predictions on the training split. The same grouped folds select hyperparameters, so these are training-derived estimates rather than independent calibration validation.

The pipeline saves `artifacts/model_results.csv`, `heldout_model_comparison.csv`, `per_class_recall.csv`, `per_class_recall_by_model.csv`, `feature_count_sweep.csv`, `metrics.json`, and `model_bundle.joblib`. The held-out comparison reports the best CV configuration from each model family. The bundle contains a full-panel tree model trained only on the fold-0 training split, the saved scaler and label encoder, calibration metadata, held-out profiles, and confidence thresholds. `service.py` exposes `GET /profiles` and `POST /predict` as a local API for a frontend to connect to later; no frontend is included yet.

## API

`POST /predict` accepts:

```json
{"profile_id":"SAMPLE_ID","edits":{"genes_on":["TP53"],"genes_off":[],"fga":0.2,"mutation_count":17}}
```

Mutations are binary toggles. Copy-number scores remain at the selected profile's values. The response includes five distinct candidates with temperature-scaled probabilities, measured confidence tier and tier accuracy, a low-confidence flag, and each candidate's top ten TreeSHAP contributions. Feature values are converted back to raw input units.

All returned labels and probabilities are research-only. Small classes have unstable estimates; 22 cancer types have fewer than 20 cohort samples.
