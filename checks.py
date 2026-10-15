"""Assert-based integrity checks for the trained local research prototype."""
import json
from pathlib import Path
from time import perf_counter

import joblib
import numpy as np
import pandas as pd
import service
from pipeline import _fold_features

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "artifacts"


def main():
    probe = pd.DataFrame({"x": [0.0, 2.0, 100.0]})
    fit_probe, valid_probe = _fold_features(probe, np.array([0, 1]), np.array([2]))
    assert np.isclose(fit_probe.x.mean(), 0) and valid_probe.x.iloc[0] > 20, "CV scaler must fit training rows only"
    bundle = joblib.load(OUT / "model_bundle.joblib")
    metrics = json.loads((OUT / "metrics.json").read_text(encoding="utf-8"))
    clinical = pd.read_csv(ROOT / "datafiles/msk_impact_2017_clinical_data.tsv", sep="\t", comment="#")
    clinical = clinical[["Patient ID", "Sample ID", "Cancer Type", "Fraction Genome Altered", "Mutation Count", "Sex", "Sample Type"]].dropna()
    clinical["Sex"] = clinical.Sex.map({"Female": 0, "Male": 1})
    clinical["Sample Type"] = clinical["Sample Type"].map({"Primary": 0, "Metastasis": 1})
    clinical = clinical.dropna().set_index("Sample ID")
    patient_by_sample = clinical["Patient ID"]
    train_ids, test_ids = set(bundle["train_sample_ids"]), set(bundle["test_sample_ids"])
    assert not train_ids & test_ids, "Sample IDs overlap between train and test"
    tr_patients = set(patient_by_sample.loc[list(train_ids)])
    te_patients = set(patient_by_sample.loc[list(test_ids)])
    assert not (tr_patients & te_patients), "Patient leakage between train and test"
    assert bundle["features"] == list(bundle["scaler"].feature_names_in_), "Scaler feature order mismatch"
    assert set(bundle["profiles"]).issubset(test_ids), "Profile ID is not in held-out test rows"
    assert 0.25 <= bundle["temperature"] <= 4, "Temperature outside configured bounds"
    assert metrics["supported_class_count"] == len(bundle["present_classes"])
    assert metrics["cohort_sample_counts"]["model_samples_after_genomic_join"] == len(train_ids | test_ids)
    profile_patients = [p["patient_id"] for p in bundle["profiles"].values()]
    assert len(profile_patients) == len(set(profile_patients)), "Profiles must represent distinct patients"
    assert metrics["test_probability_max_row_sum_error"] <= 1e-6, "Test probabilities lost class mass"
    comparison = pd.read_csv(OUT / "heldout_model_comparison.csv")
    assert set(comparison.model) == {"LogisticRegression", "RandomForest", "XGBoost"}
    assert len(pd.read_csv(OUT / "per_class_recall_by_model.csv")) > 0
    assert 0 <= metrics["prior_dummy_top3_accuracy"] <= 1
    assert len(set(bundle["profiles"])) == len(bundle["profiles"])
    sample = next(iter(bundle["profiles"].values()))
    xx = pd.DataFrame([sample["features"]], columns=bundle["features"])
    xx = pd.DataFrame(bundle["scaler"].transform(xx), columns=bundle["features"])
    probability = service._prob(xx)
    assert np.allclose(probability.sum(axis=1), 1.0), "Probability rows must sum to one"
    if bundle["model_name"] == "XGBoost":
        raw_probability = bundle["model"].predict_proba(xx)
        mapped = np.zeros((1, len(bundle["label_encoder"].classes_)))
        encoded_classes = np.asarray(bundle["xgb_encoder"].classes_, dtype=int)
        mapped[:, encoded_classes] = raw_probability
        present = np.asarray(bundle["present_classes"], dtype=int)
        logits = np.log(np.clip(mapped[:, present], 1e-12, 1)) / bundle["temperature"]
        logits -= logits.max(axis=1, keepdims=True)
        expected_prob = np.exp(logits)
        expected_prob /= expected_prob.sum(axis=1, keepdims=True)
        expected_full = np.zeros_like(mapped)
        expected_full[:, present] = expected_prob
        assert np.allclose(probability, expected_full, atol=1e-10), "XGBoost probabilities mapped to the wrong cancer labels"

        phi = service.explainer.shap_values(xx, check_additivity=False)
        base = np.asarray(service.explainer.expected_value).reshape(-1)
        if isinstance(phi, list):
            phi = np.stack([np.asarray(v)[0] for v in phi], axis=1)
        else:
            phi = np.asarray(phi)[0]
        margins = np.asarray(bundle["model"].predict(xx, output_margin=True))
        if margins.ndim == 1:
            margins = margins.reshape(1, -1)
        for original_class in encoded_classes:
            class_position = int(np.flatnonzero(encoded_classes == original_class)[0])
            shap_score = base[class_position] + phi[:, class_position].sum()
            assert np.isclose(shap_score, margins[0, class_position], rtol=1e-4, atol=1e-4), (
                f"TreeSHAP additivity failed for class {original_class}: "
                f"expected {margins[0, class_position]:.6g}, got {shap_score:.6g}")
    client = service.app.test_client()
    assert client.get("/").status_code == 404, "No frontend should be served yet"
    profile_response = client.get("/profiles").get_json()
    assert profile_response["supported_class_count"] == len(bundle["present_classes"])
    assert profile_response["unsupported_training_classes"] == metrics["unsupported_training_classes"]
    response = client.post("/predict", json={"profile_id": sample["sample_id"], "edits": {}})
    assert response.status_code == 200, response.get_json()
    assert response.get_json()["supported_class_count"] == len(bundle["present_classes"])
    client.post("/predict", json={"profile_id": sample["sample_id"], "edits": {}})  # warm SHAP/model caches
    started = perf_counter()
    timed_response = client.post("/predict", json={"profile_id": sample["sample_id"], "edits": {}})
    latency = perf_counter() - started
    assert timed_response.status_code == 200, timed_response.get_json()
    metrics["api_predict_latency_seconds"] = latency
    metrics["api_latency_target_under_1s_met"] = latency < 1.0
    (OUT / "metrics.json").write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    classes = [x["cancer_type"] for x in response.get_json()["candidates"]]
    assert len(classes) == 5 and len(set(classes)) == 5, "API must return five distinct classes"
    assert metrics["unseen_class_test_rows"] is not None
    print(f"checks passed; warm POST /predict latency: {latency:.3f}s (target <1s: {latency < 1.0})")


if __name__ == "__main__":
    main()
