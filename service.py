"""Local research-only Flask API for OncoLocate predictions and SHAP values."""
from __future__ import annotations

from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import shap
from flask import Flask, jsonify, request

ROOT = Path(__file__).resolve().parent
app = Flask(__name__)
bundle = joblib.load(ROOT / "artifacts" / "model_bundle.joblib")
model = bundle["model"]
explainer = shap.TreeExplainer(model)
present_classes = np.asarray(bundle["present_classes"], dtype=int)
unsupported_classes = [str(bundle["label_encoder"].classes_[i])
                       for i in range(len(bundle["label_encoder"].classes_)) if i not in present_classes]


def _prob(X):
    if bundle["model_name"] == "XGBoost":
        raw = model.predict_proba(X)
        enc = bundle["xgb_encoder"]
        present = np.asarray(bundle["present_classes"], dtype=int)
        p = np.zeros((len(raw), len(bundle["label_encoder"].classes_)))
        p[:, enc.classes_] = raw
    else:
        raw = model.predict_proba(X)
        p = np.zeros((len(raw), len(bundle["label_encoder"].classes_)))
        p[:, model.classes_] = raw
        present = np.asarray(bundle["present_classes"], dtype=int)
    p = p[:, present]
    T = bundle["temperature"]
    z = np.log(np.clip(p, 1e-12, 1)) / T
    z -= z.max(axis=1, keepdims=True)
    q = np.exp(z); q /= q.sum(axis=1, keepdims=True)
    out = np.zeros((1, len(bundle["label_encoder"].classes_)))
    out[:, present] = q
    return out


def _shap_values(xrow, class_ids):
    values = explainer.shap_values(xrow, check_additivity=False)
    base = explainer.expected_value
    result = {}
    features = bundle["features"]
    scaler = bundle["scaler"]
    means, scales = scaler.mean_, scaler.scale_
    # TreeSHAP operates on the deployed raw-score space; feature values are
    # displayed in raw input units. Axis unit was verified against model output.
    for cls in class_ids:
        if bundle["model_name"] == "XGBoost":
            model_class = int(np.flatnonzero(bundle["xgb_encoder"].classes_ == cls)[0])
        else:
            model_class = int(np.flatnonzero(model.classes_ == cls)[0])
        arr = values[model_class] if isinstance(values, list) else np.asarray(values)[0, :, model_class]
        top = np.argsort(np.abs(arr))[-10:][::-1]
        result[str(int(cls))] = [{"feature": features[j], "value": float(xrow.iloc[0, j] * scales[j] + means[j]),
            "contribution": float(arr[j])} for j in top]
    return result


@app.get("/profiles")
def profiles():
    return jsonify({"research_only": True, "supported_class_count": len(present_classes),
        "unsupported_training_classes": unsupported_classes, "profiles": [
        {"profile_id": pid, "true_label": p["true_label"]}
        for pid, p in bundle["profiles"].items()]})


@app.post("/predict")
def predict():
    payload = request.get_json(silent=True) or {}
    pid = str(payload.get("profile_id", ""))
    if pid not in bundle["profiles"]:
        return jsonify({"error": "profile_id must identify a held-out test profile"}), 400
    edits = payload.get("edits", {})
    genes_on = edits.get("genes_on", [])
    genes_off = edits.get("genes_off", [])
    if not isinstance(genes_on, list) or not isinstance(genes_off, list):
        return jsonify({"error": "genes_on and genes_off must be lists"}), 400
    if any(g not in bundle["genes"] for g in genes_on + genes_off):
        return jsonify({"error": "gene must be in the 93-gene mutation feature list"}), 400
    fga = edits.get("fga", None); mutation_count = edits.get("mutation_count", None)
    for val in (fga, mutation_count):
        if isinstance(val, bool): return jsonify({"error": "invalid numeric edit"}), 400
    if fga is not None and (not isinstance(fga, (int, float)) or not 0 <= fga <= 1):
        return jsonify({"error": "fga must be between 0 and 1"}), 400
    if mutation_count is not None and (not isinstance(mutation_count, int) or mutation_count < 0):
        return jsonify({"error": "mutation_count must be an integer of 0 or more"}), 400
    row = pd.DataFrame([bundle["profiles"][pid]["features"]], columns=bundle["features"])
    for gene in genes_on: row.loc[:, gene + "_MUT"] = 1
    for gene in genes_off: row.loc[:, gene + "_MUT"] = 0
    if fga is not None: row.loc[:, "Fraction Genome Altered"] = float(fga)
    if mutation_count is not None: row.loc[:, "Mutation Count"] = mutation_count
    scaled = pd.DataFrame(bundle["scaler"].transform(row), columns=bundle["features"])
    probs = _prob(scaled)[0]
    candidates = np.argsort(probs)[-5:][::-1]
    margin = float(np.sort(probs)[-1] - np.sort(probs)[-2])
    top_p = float(probs[candidates[0]])
    edges = bundle["tier_edges"]
    tier = 1 if top_p <= edges[0] else (2 if top_p <= edges[1] else 3)
    ids = [int(c) for c in candidates]
    names = bundle["label_encoder"].inverse_transform(ids)
    explanations = _shap_values(scaled, ids)
    return jsonify({"research_only": True, "supported_class_count": len(present_classes),
        "unsupported_training_classes": unsupported_classes,
        "low_confidence": margin <= bundle["margin_cutoff"],
        "margin": margin, "tier": tier, "tier_accuracy": bundle["tier_accuracy"][str(tier)],
        "shap_axis": "contribution to model score",
        "candidates": [{"cancer_type": str(n), "probability": float(probs[c]), "shap": explanations[str(c)]}
                       for n, c in zip(names, candidates)]})


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)
