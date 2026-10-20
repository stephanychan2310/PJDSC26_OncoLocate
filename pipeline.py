"""Grouped, patient-level tumor-origin model comparison. Research use only."""
from __future__ import annotations

import json
import time
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import shap
import xgboost as xgb
from scipy.optimize import minimize_scalar
from sklearn.dummy import DummyClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, f1_score, log_loss, recall_score
from sklearn.model_selection import GroupShuffleSplit, StratifiedGroupKFold
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.utils.class_weight import compute_sample_weight

import preparingdata

SEED = 42
ROOT = Path(__file__).resolve().parent
OUT = ROOT / "artifacts"
CLINICAL = ["Fraction Genome Altered", "Mutation Count", "Sex", "Sample Type"]


def _macro(y, pred, labels=None):
    return f1_score(y, pred, labels=np.unique(y) if labels is None else labels,
                    average="macro", zero_division=0)


def _pad(prob, classes, n_classes):
    out = np.zeros((len(prob), n_classes), dtype=float)
    out[:, np.asarray(classes, dtype=int)] = prob
    return out


def _probability_block(prob, columns):
    """Return finite, row-normalized probabilities in the scored class space."""
    block = np.asarray(prob[:, columns], dtype=float)
    if not np.isfinite(block).all() or (block < -1e-8).any():
        raise ValueError("Model produced invalid test probabilities")
    block = np.clip(block, 1e-12, 1.0)
    totals = block.sum(axis=1, keepdims=True)
    if (totals <= 0).any():
        raise ValueError("Model produced an empty probability row")
    return block / totals


def _fit_xgb(X, y, weights, depth, rounds, n_classes, eval_X=None, eval_y=None, es=20):
    labels = np.unique(y)
    enc = LabelEncoder().fit(labels)
    yi = enc.transform(y)
    model = xgb.XGBClassifier(
        objective="multi:softprob", num_class=len(labels), tree_method="hist",
        learning_rate=0.1, max_depth=depth, subsample=0.8,
        colsample_bytree=0.8, n_estimators=rounds,
        early_stopping_rounds=es if eval_X is not None else None,
        eval_metric="mlogloss", random_state=SEED, n_jobs=-1,
    )
    kwargs = {"sample_weight": weights} if weights is not None else {}
    if eval_X is None:
        model.fit(X, yi, verbose=False, **kwargs)
    else:
        eval_y = np.asarray(eval_y)
        known = np.isin(eval_y, labels)
        eval_encoded = enc.transform(eval_y[known])
        model.fit(X, yi, eval_set=[(eval_X.iloc[np.flatnonzero(known)], eval_encoded)],
                  verbose=False, **kwargs)
    return model, enc


def _predict_xgb(model, enc, X, n_classes):
    return _pad(model.predict_proba(X), enc.classes_, n_classes)


def _weights_for(y, arm):
    if arm == "none":
        return None
    weights = compute_sample_weight("balanced", y)
    return np.minimum(weights, 5) if arm == "capped_5" else weights


def _fold_features(X, a, b):
    train, valid = X.iloc[a], X.iloc[b]
    scaler = StandardScaler().fit(train)
    return (pd.DataFrame(scaler.transform(train), columns=train.columns, index=train.index),
            pd.DataFrame(scaler.transform(valid), columns=valid.columns, index=valid.index))


def _fit_xgb_grouped(X, y, groups, arm, depth, rounds, n_classes):
    fit_idx, stop_idx = next(GroupShuffleSplit(n_splits=1, test_size=0.2,
        random_state=SEED).split(X, y, groups))
    y_fit, y_stop = y[fit_idx], y[stop_idx]
    if np.isin(y_stop, np.unique(y_fit)).any():
        stopping, _ = _fit_xgb(X.iloc[fit_idx], y_fit, _weights_for(y_fit, arm),
            depth, rounds, n_classes, X.iloc[stop_idx], y_stop)
        best_round = int(stopping.best_iteration) + 1
    else:
        best_round = rounds
    model, enc = _fit_xgb(X, y, _weights_for(y, arm), depth, best_round, n_classes)
    return model, enc, best_round


def _fit_final(name, cfg, X, y, weights, rounds, n_classes):
    if name == "LogisticRegression":
        model = LogisticRegression(C=cfg["C"], max_iter=2000, random_state=SEED)
        model.fit(X, y, sample_weight=weights)
        return model, None
    if name == "RandomForest":
        model = RandomForestClassifier(n_estimators=500, max_features="sqrt",
            min_samples_leaf=cfg["min_samples_leaf"], random_state=SEED, n_jobs=-1)
        model.fit(X, y, sample_weight=weights)
        return model, None
    return _fit_xgb(X, y, weights, cfg["max_depth"], rounds, n_classes)


def _predict_final(name, model, enc, X, n_classes):
    if name == "XGBoost":
        return _predict_xgb(model, enc, X, n_classes)
    return _pad(model.predict_proba(X), model.classes_, n_classes)


def main():
    OUT.mkdir(exist_ok=True)
    Xtr, Xte, ytr, yte, _, encoder = preparingdata.ml_ready_data(
        str(ROOT / "datafiles/msk_impact_2017_clinical_data.tsv"),
        str(ROOT / "datafiles/data_mutations.txt"), str(ROOT / "datafiles/data_cna.txt"))
    # Recover original row identifiers and patient groups in exactly the same
    # fold order, without changing the preparation script.
    clinical = pd.read_csv(ROOT / "datafiles/msk_impact_2017_clinical_data.tsv", sep="\t", comment="#")
    clinical = clinical[["Patient ID", "Sample ID", "Cancer Type", *CLINICAL]].dropna()
    clinical["Sex"] = clinical.Sex.map({"Female": 0, "Male": 1})
    clinical["Sample Type"] = clinical["Sample Type"].map({"Primary": 0, "Metastasis": 1})
    clinical = clinical.dropna().set_index("Sample ID")
    # Recover exact row membership from the input and the deterministic splitter.
    # Fold membership is explicit in returned feature frames.
    tr_ids, te_ids = list(Xtr.index), list(Xte.index)
    model_ids = tr_ids + te_ids
    ytr = np.asarray(ytr, dtype=int); yte = np.asarray(yte, dtype=int)
    present = np.unique(ytr)
    all_labels = np.arange(len(encoder.classes_))
    weights = compute_sample_weight("balanced", ytr)
    arms = ("balanced", "capped_5", "none")
    splits = list(StratifiedGroupKFold(n_splits=3, shuffle=True, random_state=SEED).split(
        Xtr, ytr, groups=clinical.loc[tr_ids, "Patient ID"].to_numpy()))
    grids = {
        "LogisticRegression": [{"C": c} for c in (0.01, 0.1, 1)],
        "RandomForest": [{"min_samples_leaf": n} for n in (1, 3)],
        "XGBoost": [{"max_depth": d} for d in (4, 6)],
    }

    # Time exactly one XGBoost fit before deciding whether depth/rounds need reducing.
    t0 = time.perf_counter()
    _fit_xgb(Xtr.iloc[:min(1500, len(Xtr))], ytr[:min(1500, len(Xtr))],
             weights[:min(1500, len(Xtr))], 4, 400, len(all_labels))
    timed = time.perf_counter() - t0
    depths, rounds = ((4,), 200) if timed > 180 else ((4, 6), 400)
    grids["XGBoost"] = [{"max_depth": d} for d in depths]
    summary = []

    for name, configs in grids.items():
        if name == "XGBoost": configs = [{"max_depth": d} for d in depths]
        for arm in arms:
            for cfg in configs:
                scores, best_iterations = [], []
                for a, b in splits:
                    Xa, Xb = _fold_features(Xtr, a, b)
                    sw = _weights_for(ytr[a], arm)
                    if name == "LogisticRegression":
                        m = LogisticRegression(C=cfg["C"], max_iter=2000, random_state=SEED)
                        m.fit(Xa, ytr[a], sample_weight=sw)
                        pred = m.predict(Xb)
                    elif name == "RandomForest":
                        m = RandomForestClassifier(n_estimators=500, max_features="sqrt",
                            min_samples_leaf=cfg["min_samples_leaf"], random_state=SEED, n_jobs=-1)
                        m.fit(Xa, ytr[a], sample_weight=sw)
                        pred = m.predict(Xb)
                    else:
                        m, e, best_round = _fit_xgb_grouped(Xa, ytr[a],
                            clinical.loc[np.asarray(tr_ids)[a], "Patient ID"].to_numpy(),
                            arm, cfg["max_depth"], rounds, len(all_labels))
                        best_iterations.append(best_round)
                        pred = _predict_xgb(m, e, Xb, len(all_labels)).argmax(axis=1)
                    scores.append(_macro(ytr[b], pred))
                mean_score = float(np.mean(scores))
                summary.append({"model": name, "weighting": arm, **cfg,
                                "cv_macro_f1": mean_score, "cv_sd": float(np.std(scores)),
                                "median_best_iteration": int(np.median(best_iterations)) if best_iterations else None})

    results = pd.DataFrame(summary).sort_values("cv_macro_f1", ascending=False)
    results.to_csv(OUT / "model_results.csv", index=False)
    best = results.iloc[0]
    if best.model == "LogisticRegression": cfg = {"C": float(best.C)}
    elif best.model == "RandomForest": cfg = {"min_samples_leaf": int(best.min_samples_leaf)}
    else: cfg = {"max_depth": int(best.max_depth)}
    arm = best.weighting
    selected_rounds = int(best.median_best_iteration) if best.model == "XGBoost" else rounds
    family_models, family_test, family_recalls = {}, [], []
    known_mask = np.isin(yte, present)
    y_eval = yte[known_mask]
    X_eval = Xte.iloc[np.flatnonzero(known_mask)]
    cohort_y = np.concatenate([ytr, yte])
    common = [c for c in present if np.sum(cohort_y == c) >= 20]
    for name in ("LogisticRegression", "RandomForest", "XGBoost"):
        row = results[results.model == name].iloc[0]
        model_cfg = ({"C": float(row.C)} if name == "LogisticRegression" else
                     {"min_samples_leaf": int(row.min_samples_leaf)} if name == "RandomForest" else
                     {"max_depth": int(row.max_depth)})
        family_rounds = int(row.median_best_iteration) if name == "XGBoost" else rounds
        family_weight = _weights_for(ytr, row.weighting)
        fitted, fitted_encoder = _fit_final(name, model_cfg, Xtr, ytr, family_weight,
                                             family_rounds, len(all_labels))
        family_models[name] = (fitted, fitted_encoder)
        family_prob = _predict_final(name, fitted, fitted_encoder, X_eval, len(all_labels))
        family_pred = family_prob.argmax(axis=1)
        family_test.append({"model": name, "weighting": row.weighting,
            "cv_macro_f1": float(row.cv_macro_f1),
            "test_macro_f1_present_classes": _macro(y_eval, family_pred, present),
            "test_macro_f1_classes_n_ge_20": f1_score(y_eval, family_pred, labels=common, average="macro", zero_division=0),
            "test_top3_accuracy": float(np.mean([y in np.argsort(p)[-3:] for y, p in zip(y_eval, family_prob)]))})
        recalls = recall_score(y_eval, family_pred, labels=present, average=None, zero_division=0)
        family_recalls.extend({"model": name, "class_id": int(c),
            "cancer_type": str(encoder.inverse_transform([c])[0]), "recall": float(r),
            "test_support": int((y_eval == c).sum())} for c, r in zip(present, recalls))
    pd.DataFrame(family_test).to_csv(OUT / "heldout_model_comparison.csv", index=False)
    pd.DataFrame(family_recalls).to_csv(OUT / "per_class_recall_by_model.csv", index=False)
    model, xenc = family_models[best.model]
    predict_proba = lambda X: _predict_final(best.model, model, xenc, X, len(all_labels))

    unseen_rows = [{"sample_id": str(i), "true_label": str(encoder.inverse_transform([v])[0])}
                   for i, v in zip(np.asarray(te_ids)[~known_mask], yte[~known_mask])]
    P = predict_proba(X_eval)
    probability_sum_error = float(np.max(np.abs(P.sum(axis=1) - 1.0)))
    if probability_sum_error > 1e-6:
        raise ValueError(f"Padded test probabilities do not sum to one (max error {probability_sum_error:.3g})")
    P_eval = _probability_block(P, present)
    pred = P.argmax(axis=1)
    metrics = {
        "best_model": best.model, "weighting": arm, "parameters": cfg,
        "best_cv_macro_f1": float(best.cv_macro_f1), "xgb_first_fit_seconds": timed,
        "xgb_depths": depths, "xgb_rounds": rounds,
        "test_macro_f1_present_classes": _macro(y_eval, pred, present),
        "test_macro_f1_classes_n_ge_20": f1_score(y_eval, pred, labels=common, average="macro", zero_division=0),
        "test_top3_accuracy": float(np.mean([y in np.argsort(row)[-3:] for y, row in zip(y_eval, P)])),
        "test_probability_max_row_sum_error": probability_sum_error,
        "test_log_loss_before": log_loss(y_eval, P_eval, labels=present),
        "unseen_class_test_rows": unseen_rows,
        "cohort_sample_counts": {"eligible_clinical": int(len(clinical)),
            "model_samples_after_genomic_join": int(len(model_ids)),
            "clinical_samples_without_genomic_match": int(len(clinical) - len(model_ids)),
            "eligible_clinical_patients": int(clinical["Patient ID"].nunique()),
            "model_patients": int(clinical.loc[model_ids, "Patient ID"].nunique())},
        "supported_class_count": int(len(present)),
        "unsupported_training_classes": [str(encoder.classes_[c]) for c in all_labels if c not in present],
        "heldout_model_comparison": family_test,
    }
    recalls = recall_score(y_eval, pred, labels=present, average=None, zero_division=0)
    pd.DataFrame({"class_id": present, "cancer_type": encoder.inverse_transform(present),
                  "recall": recalls, "test_support": [int((y_eval == c).sum()) for c in present]
                  }).to_csv(OUT / "per_class_recall.csv", index=False)

    dummy = DummyClassifier(strategy="prior").fit(np.zeros((len(ytr), 1)), ytr)
    dp = dummy.predict_proba(np.zeros((len(y_eval), 1)))
    metrics["prior_dummy_macro_f1"] = _macro(y_eval, dummy.predict(np.zeros((len(y_eval), 1))), present)
    dummy_top3 = dummy.classes_[np.argsort(dp, axis=1)[:, -3:]]
    metrics["prior_dummy_top3_accuracy"] = float(np.mean([y in row for y, row in zip(y_eval, dummy_top3)]))

    # OOF probabilities for the selected estimator and the deployed tree.
    def make_oof(name, model_cfg, weight_arm, max_rounds):
        oof_prob = np.zeros((len(ytr), len(all_labels)))
        for a, b in splits:
            Xa, Xb = _fold_features(Xtr, a, b)
            sw = _weights_for(ytr[a], weight_arm)
            if name == "LogisticRegression":
                m = LogisticRegression(C=model_cfg["C"], max_iter=2000, random_state=SEED).fit(Xa, ytr[a], sample_weight=sw)
                q = _pad(m.predict_proba(Xb), m.classes_, len(all_labels))
            elif name == "RandomForest":
                m = RandomForestClassifier(n_estimators=500, max_features="sqrt", min_samples_leaf=model_cfg["min_samples_leaf"], random_state=SEED, n_jobs=-1).fit(Xa, ytr[a], sample_weight=sw)
                q = _pad(m.predict_proba(Xb), m.classes_, len(all_labels))
            else:
                m, e, _ = _fit_xgb_grouped(Xa, ytr[a],
                    clinical.loc[np.asarray(tr_ids)[a], "Patient ID"].to_numpy(),
                    weight_arm, model_cfg["max_depth"], max_rounds, len(all_labels))
                q = _predict_xgb(m, e, Xb, len(all_labels))
            oof_prob[b] = q
        return oof_prob

    oof = make_oof(best.model, cfg, arm, selected_rounds)
    valid = np.isin(ytr, present)
    def nll(T, prob, y):
        z = np.log(np.clip(prob[:, present], 1e-12, 1)) / T
        z -= z.max(axis=1, keepdims=True)
        pp = np.exp(z); pp /= pp.sum(axis=1, keepdims=True)
        return log_loss(y, pp, labels=present)
    opt = minimize_scalar(lambda t: nll(t, oof[valid], ytr[valid]), bounds=(0.25, 4), method="bounded")
    T = float(np.clip(opt.x, .25, 4))
    def calibrated(prob):
        z = np.log(np.clip(prob[:, present], 1e-12, 1)) / T
        z -= z.max(axis=1, keepdims=True); q = np.exp(z); q /= q.sum(axis=1, keepdims=True)
        return _pad(q, present, len(all_labels))
    Pc = calibrated(P)
    metrics["temperature"] = T
    Pc_eval = _probability_block(Pc, present)
    metrics["test_log_loss_after"] = log_loss(y_eval, Pc_eval, labels=present)
    oofc = calibrated(oof[valid]); oofy = ytr[valid]
    margins = np.sort(oofc, axis=1)[:, -1] - np.sort(oofc, axis=1)[:, -2]
    metrics["low_confidence_margin_cutoff_q25"] = float(np.quantile(margins, .25))
    top = oofc.max(axis=1)
    edges = np.quantile(top, [1/3, 2/3])
    tier_metrics = {}
    for j, mask in enumerate([top <= edges[0], (top > edges[0]) & (top <= edges[1]), top > edges[1]]):
        tier_metrics[str(j+1)] = {"min": float(top[mask].min()), "max": float(top[mask].max()),
                                  "accuracy": float(accuracy_score(oofy[mask], oofc[mask].argmax(axis=1)))}
    metrics["confidence_tiers"] = tier_metrics

    # Feature-count study: rank non-clinical features by a training-only RF fit.
    ranker = RandomForestClassifier(n_estimators=500, max_features="sqrt", random_state=SEED, n_jobs=-1)
    ranker.fit(Xtr, ytr, sample_weight=weights)
    genomic = [c for c in Xtr.columns if c not in CLINICAL]
    ordered = sorted(genomic, key=lambda c: ranker.feature_importances_[Xtr.columns.get_loc(c)], reverse=True)
    fold_orders = []
    for a, _ in splits:
        fold_ranker = RandomForestClassifier(n_estimators=500, max_features="sqrt", random_state=SEED, n_jobs=-1)
        fold_ranker.fit(Xtr.iloc[a], ytr[a], sample_weight=_weights_for(ytr[a], arm))
        fold_orders.append(sorted(genomic,
            key=lambda c: fold_ranker.feature_importances_[Xtr.columns.get_loc(c)], reverse=True))
    sweep = []
    for count in [0, 10, 20, 50, 100, None]:
        cols = CLINICAL + (ordered if count is None else ordered[:count])
        cols = [c for c in cols if c in Xtr.columns]
        # Refit selected estimator per grouped fold for comparable held-in CV estimates.
        sc = []
        for (a, b), fold_order in zip(splits, fold_orders):
            Xa, Xb = _fold_features(Xtr, a, b)
            fold_cols = CLINICAL + (fold_order if count is None else fold_order[:count])
            sw = _weights_for(ytr[a], arm)
            if best.model == "LogisticRegression":
                m = LogisticRegression(C=cfg["C"], max_iter=2000, random_state=SEED).fit(Xa[fold_cols], ytr[a], sample_weight=sw)
                pr = m.predict(Xb[fold_cols])
            elif best.model == "RandomForest":
                m = RandomForestClassifier(n_estimators=500, max_features="sqrt", min_samples_leaf=cfg["min_samples_leaf"], random_state=SEED, n_jobs=-1).fit(Xa[fold_cols], ytr[a], sample_weight=sw)
                pr = m.predict(Xb[fold_cols])
            else:
                m, e, _ = _fit_xgb_grouped(Xa[fold_cols], ytr[a],
                    clinical.loc[np.asarray(tr_ids)[a], "Patient ID"].to_numpy(),
                    arm, cfg["max_depth"], selected_rounds, len(all_labels))
                pr = _predict_xgb(m, e, Xb[fold_cols], len(all_labels)).argmax(axis=1)
            sc.append(_macro(ytr[b], pr))
        # The predeclared grouped-CV score selects the smallest feature panel;
        # held-out test scores are reported separately and never select the panel.
        sw_full = _weights_for(ytr, arm)
        if best.model == "LogisticRegression":
            fitted = LogisticRegression(C=cfg["C"], max_iter=2000, random_state=SEED).fit(Xtr[cols], ytr, sample_weight=sw_full)
            test_pred = fitted.predict(Xte.loc[:, cols])
            test_prob = _pad(fitted.predict_proba(Xte.loc[:, cols]), fitted.classes_, len(all_labels))
        elif best.model == "RandomForest":
            fitted = RandomForestClassifier(n_estimators=500, max_features="sqrt", min_samples_leaf=cfg["min_samples_leaf"], random_state=SEED, n_jobs=-1).fit(Xtr[cols], ytr, sample_weight=sw_full)
            test_pred = fitted.predict(Xte.loc[:, cols])
            test_prob = _pad(fitted.predict_proba(Xte.loc[:, cols]), fitted.classes_, len(all_labels))
        else:
            fitted, fitted_encoder = _fit_xgb(Xtr[cols], ytr, sw_full, cfg["max_depth"], selected_rounds, len(all_labels))
            test_prob = _predict_xgb(fitted, fitted_encoder, Xte.loc[:, cols], len(all_labels))
            test_pred = test_prob.argmax(axis=1)
        sweep.append({"features": "clinical+all" if count is None else f"clinical+top{count}",
                      "feature_count": len(cols), "cv_macro_f1": float(np.mean(sc)),
                      "test_macro_f1": _macro(y_eval, test_pred[known_mask], present),
                      "test_top3_accuracy": float(np.mean([y in np.argsort(row)[-3:] for y, row in zip(y_eval, test_prob[known_mask])]))})
    full_score = next(x["cv_macro_f1"] for x in sweep if x["features"] == "clinical+all")
    metrics["smallest_feature_set_within_0_02"] = next((x["features"] for x in sweep if x["cv_macro_f1"] >= full_score - .02), "clinical+all")
    pd.DataFrame(sweep).to_csv(OUT / "feature_count_sweep.csv", index=False)

    # Deployed bundle always uses the chosen tree model on the full panel.
    tree_rows = results[results.model.isin(["RandomForest", "XGBoost"])].sort_values("cv_macro_f1", ascending=False)
    deployed_name = tree_rows.iloc[0].model
    deploy_cfg = ({"min_samples_leaf": int(tree_rows.iloc[0].min_samples_leaf)} if deployed_name == "RandomForest" else {"max_depth": int(tree_rows.iloc[0].max_depth)})
    deploy_arm = tree_rows.iloc[0].weighting
    deploy_rounds = int(tree_rows.iloc[0].median_best_iteration) if deployed_name == "XGBoost" else rounds
    if deployed_name != best.model:
        deployed_oof = make_oof(deployed_name, deploy_cfg, deploy_arm, deploy_rounds)
        deploy_opt = minimize_scalar(lambda t: nll(t, deployed_oof[valid], ytr[valid]), bounds=(0.25, 4), method="bounded")
        deploy_T = float(np.clip(deploy_opt.x, .25, 4))
        dz = np.log(np.clip(deployed_oof[valid][:, present], 1e-12, 1)) / deploy_T
        dz -= dz.max(axis=1, keepdims=True)
        deploy_oofc = np.exp(dz); deploy_oofc /= deploy_oofc.sum(axis=1, keepdims=True)
        deploy_margins = np.sort(deploy_oofc, axis=1)[:, -1] - np.sort(deploy_oofc, axis=1)[:, -2]
        deploy_cutoff = float(np.quantile(deploy_margins, .25))
        deploy_top = deploy_oofc.max(axis=1)
        deploy_edges = np.quantile(deploy_top, [1/3, 2/3])
        deploy_tiers = {}
        for j, mask in enumerate([deploy_top <= deploy_edges[0], (deploy_top > deploy_edges[0]) & (deploy_top <= deploy_edges[1]), deploy_top > deploy_edges[1]]):
            deploy_tiers[str(j+1)] = {"min": float(deploy_top[mask].min()), "max": float(deploy_top[mask].max()),
                "accuracy": float(accuracy_score(ytr[valid][mask], deploy_oofc[mask].argmax(axis=1)))}
    else:
        deploy_T, deploy_cutoff, deploy_edges, deploy_tiers = T, metrics["low_confidence_margin_cutoff_q25"], edges, tier_metrics
    deployed, denc = family_models[deployed_name]
    metrics["deployed_temperature"] = deploy_T
    metrics["deployed_oof_margin_cutoff_q25"] = deploy_cutoff
    metrics["deployed_confidence_tiers"] = deploy_tiers
    metrics["deployed_xgb_rounds"] = deploy_rounds if deployed_name == "XGBoost" else None
    bundle = {"model": deployed, "model_name": deployed_name, "xgb_encoder": denc,
        "features": list(Xtr.columns), "scaler": joblib.load(ROOT / "feature_scaler.joblib"),
        "label_encoder": encoder, "present_classes": present, "temperature": deploy_T,
        "margin_cutoff": deploy_cutoff, "tier_edges": deploy_edges,
        "tier_accuracy": deploy_tiers, "genes": [c[:-4] for c in Xtr.columns if c.endswith("_MUT")],
        "clinical_features": CLINICAL, "profiles": {}, "shap_expected_value": None,
        "train_sample_ids": [str(i) for i in tr_ids], "test_sample_ids": [str(i) for i in te_ids]}
    prof = pd.DataFrame({"sample_id": te_ids, "class_id": yte}).set_index("sample_id")
    prof["patient_id"] = clinical.loc[te_ids, "Patient ID"]
    # Select up to 20 held-out samples, round-robin by true class.
    by_class = {}
    for cls, g in prof.groupby("class_id"):
        # One sample per patient per pass; subsequent passes add more only
        # after all available classes have had a chance to contribute.
        by_class[int(cls)] = list(g.loc[~g.patient_id.duplicated(keep="first")].index)
    class_order = sorted(by_class)
    np.random.default_rng(SEED).shuffle(class_order)
    chosen, seen_patients = [], set()
    while len(chosen) < 20 and any(by_class.values()):
        for cls in class_order:
            if len(chosen) >= 20: break
            while by_class[cls]:
                sid = by_class[cls].pop(0)
                patient = prof.loc[sid, "patient_id"]
                if patient not in seen_patients:
                    chosen.append(sid); seen_patients.add(patient); break
    for sid in chosen:
        row = Xte.loc[sid].to_dict()
        bundle["profiles"][str(sid)] = {"sample_id": str(sid), "patient_id": str(prof.loc[sid, "patient_id"]), "true_label": str(encoder.inverse_transform([int(prof.loc[sid,"class_id"])])[0]), "features": row}
    joblib.dump(bundle, OUT / "model_bundle.joblib")
    metrics["deployed_tree_model"] = deployed_name
    (OUT / "metrics.json").write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    print(results.to_string(index=False)); print(json.dumps(metrics, indent=2)); print(pd.DataFrame(sweep).to_string(index=False))


if __name__ == "__main__":
    main()
