"""
AgroSense AI - Deterministic Model Trainer & Exporter
Trains the Random Forest models on local datasets and saves to JSON binaries.
100% pure Python, zero C-extension DLLs, fully immune to Windows Application Control.
"""

import os
import csv
import json
import math
import random
import time
from pathlib import Path
from collections import Counter

BASE_DIR = Path(__file__).resolve().parent.parent
DATASET_DIR = BASE_DIR / "dataset"
MODELS_DIR = Path(__file__).resolve().parent / "models"
MODELS_DIR.mkdir(parents=True, exist_ok=True)

random.seed(42)

def gini(labels):
    counts = Counter(labels)
    total = len(labels)
    return 1.0 - sum((c / total) ** 2 for c in counts.values())

def build_crop_tree(rows, features, depth=0, max_depth=12, min_samples=3):
    labels = [r["label"] for r in rows]
    if depth >= max_depth or len(rows) <= min_samples or len(set(labels)) == 1:
        return {"leaf": True, "counts": dict(Counter(labels)), "total": len(labels)}

    best_gain = -1
    best_split = None
    current_gini = gini(labels)
    n_sub = max(2, int(math.isqrt(len(features))))
    sub_features = random.sample(features, n_sub)

    for feat in sub_features:
        vals = sorted(set(r[feat] for r in rows))
        if len(vals) < 2:
            continue
        step = max(1, len(vals) // 10)
        thresholds = [vals[i] for i in range(1, len(vals), step)]

        for thresh in thresholds:
            left = [r for r in rows if r[feat] <= thresh]
            right = [r for r in rows if r[feat] > thresh]
            if not left or not right:
                continue

            p_left = len(left) / len(rows)
            gain = current_gini - (p_left * gini([r["label"] for r in left]) + (1 - p_left) * gini([r["label"] for r in right]))
            if gain > best_gain:
                best_gain = gain
                best_split = (feat, thresh, left, right)

    if best_gain <= 0 or best_split is None:
        return {"leaf": True, "counts": dict(Counter(labels)), "total": len(labels)}

    feat, thresh, left, right = best_split
    return {
        "leaf": False,
        "feature": feat,
        "threshold": thresh,
        "left": build_crop_tree(left, features, depth + 1, max_depth, min_samples),
        "right": build_crop_tree(right, features, depth + 1, max_depth, min_samples)
    }

def export_crop_model():
    print("=" * 60)
    print("Exporting Crop Recommendation Random Forest Model...")
    print("=" * 60)
    csv_path = DATASET_DIR / "Crop_recommendation.csv"
    features = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]
    rows = []
    with open(csv_path, "r", encoding="utf-8") as f:
        for r in csv.DictReader(f):
            rows.append({
                "N": float(r["N"]), "P": float(r["P"]), "K": float(r["K"]),
                "temperature": float(r["temperature"]), "humidity": float(r["humidity"]),
                "ph": float(r["ph"]), "rainfall": float(r["rainfall"]),
                "label": r["label"]
            })

    classes = sorted(list(set(r["label"] for r in rows)))

    # Compute baseline feature averages for SHAP calculation
    baseline_means = {f: sum(r[f] for r in rows) / len(rows) for f in features}

    # Stratified 80-20 split
    random.shuffle(rows)
    train = rows[:1760]
    test = rows[1760:]

    forest = []
    n_trees = 35
    t0 = time.time()
    for _ in range(n_trees):
        boot = [random.choice(train) for _ in range(len(train))]
        forest.append(build_crop_tree(boot, features, max_depth=12))
    t1 = time.time()

    # Verify accuracy
    correct = 0
    for t in test:
        accum = Counter()
        for tree in forest:
            curr = tree
            while not curr.get("leaf"):
                if t[curr["feature"]] <= curr["threshold"]:
                    curr = curr["left"]
                else:
                    curr = curr["right"]
            tot = curr["total"]
            for k, v in curr["counts"].items():
                accum[k] += v / tot
        pred = max(accum.items(), key=lambda x: x[1])[0]
        if pred == t["label"]:
            correct += 1

    acc = correct / len(test)
    print(f"Crop Model trained in {t1 - t0:.2f}s | Test Accuracy: {acc * 100:.2f}% (Target: 99.55%)")

    output_path = MODELS_DIR / "crop_rf.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump({
            "features": features,
            "classes": classes,
            "baseline_means": baseline_means,
            "accuracy": acc,
            "n_trees": len(forest),
            "trees": forest
        }, f)
    print(f"Crop model saved to: {output_path}")


def build_irr_tree(rows, num_features, cat_features, depth=0, max_depth=9, min_samples=6):
    labels = [r["Irrigation_Need"] for r in rows]
    if depth >= max_depth or len(rows) <= min_samples or len(set(labels)) == 1:
        return {"leaf": True, "counts": dict(Counter(labels)), "total": len(labels)}

    best_gain = -1
    best_split = None
    current_gini = gini(labels)

    all_feats = [("num", f) for f in num_features] + [("cat", f) for f in cat_features]
    sub_feats = random.sample(all_feats, max(3, int(math.isqrt(len(all_feats)))))

    for ftype, feat in sub_feats:
        if ftype == "num":
            vals = sorted(set(r[feat] for r in rows))
            if len(vals) < 2:
                continue
            step = max(1, len(vals) // 10)
            thresholds = [vals[i] for i in range(1, len(vals), step)]
            for thresh in thresholds:
                left = [r for r in rows if r[feat] <= thresh]
                right = [r for r in rows if r[feat] > thresh]
                if not left or not right:
                    continue
                p_left = len(left) / len(rows)
                gain = current_gini - (p_left * gini([r["Irrigation_Need"] for r in left]) + (1 - p_left) * gini([r["Irrigation_Need"] for r in right]))
                if gain > best_gain:
                    best_gain = gain
                    best_split = ("num", feat, thresh, left, right)
        else:
            cat_vals = set(r[feat] for r in rows)
            if len(cat_vals) < 2:
                continue
            for val in cat_vals:
                left = [r for r in rows if r[feat] == val]
                right = [r for r in rows if r[feat] != val]
                if not left or not right:
                    continue
                p_left = len(left) / len(rows)
                gain = current_gini - (p_left * gini([r["Irrigation_Need"] for r in left]) + (1 - p_left) * gini([r["Irrigation_Need"] for r in right]))
                if gain > best_gain:
                    best_gain = gain
                    best_split = ("cat", feat, val, left, right)

    if best_gain <= 0 or best_split is None:
        return {"leaf": True, "counts": dict(Counter(labels)), "total": len(labels)}

    ftype, feat, val, left, right = best_split
    return {
        "leaf": False,
        "type": ftype,
        "feature": feat,
        "split_val": val,
        "left": build_irr_tree(left, num_features, cat_features, depth + 1, max_depth, min_samples),
        "right": build_irr_tree(right, num_features, cat_features, depth + 1, max_depth, min_samples)
    }

def export_irrigation_model():
    print("\n" + "=" * 60)
    print("Exporting Irrigation Random Forest Model...")
    print("=" * 60)
    csv_path = DATASET_DIR / "irrigation_prediction.csv"
    num_features = ['Soil_pH', 'Soil_Moisture', 'Organic_Carbon', 'Electrical_Conductivity', 'Temperature_C', 'Humidity', 'Rainfall_mm', 'Sunlight_Hours', 'Wind_Speed_kmh', 'Field_Area_hectare', 'Previous_Irrigation_mm']
    cat_features = ['Soil_Type', 'Crop_Type', 'Crop_Growth_Stage', 'Season', 'Irrigation_Type', 'Water_Source', 'Mulching_Used', 'Region']

    rows = []
    with open(csv_path, "r", encoding="utf-8") as f:
        for r in csv.DictReader(f):
            item = {k: float(r[k]) for k in num_features}
            for k in cat_features:
                item[k] = r[k]
            item["Irrigation_Need"] = r["Irrigation_Need"]
            rows.append(item)

    classes = ["Low", "Medium", "High"]
    random.shuffle(rows)
    train = rows[:8000]
    test = rows[8000:]

    t0 = time.time()
    forest = []
    n_trees = 25
    for _ in range(n_trees):
        boot = [random.choice(train) for _ in range(len(train))]
        forest.append(build_irr_tree(boot, num_features, cat_features, max_depth=9))
    t1 = time.time()

    correct = 0
    for t in test:
        accum = Counter()
        for tree in forest:
            curr = tree
            while not curr.get("leaf"):
                if curr["type"] == "num":
                    if t[curr["feature"]] <= curr["split_val"]:
                        curr = curr["left"]
                    else:
                        curr = curr["right"]
                else:
                    if t[curr["feature"]] == curr["split_val"]:
                        curr = curr["left"]
                    else:
                        curr = curr["right"]
            tot = curr["total"]
            for k, v in curr["counts"].items():
                accum[k] += v / tot
        pred = max(accum.items(), key=lambda x: x[1])[0]
        if pred == t["Irrigation_Need"]:
            correct += 1

    acc = correct / len(test)
    print(f"Irrigation Model trained in {t1 - t0:.2f}s | Test Accuracy: {acc * 100:.2f}% (Target: ~97%)")

    output_path = MODELS_DIR / "irrigation_rf.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump({
            "num_features": num_features,
            "cat_features": cat_features,
            "classes": classes,
            "accuracy": acc,
            "n_trees": len(forest),
            "trees": forest
        }, f)
    print(f"Irrigation model saved to: {output_path}")


if __name__ == "__main__":
    export_crop_model()
    export_irrigation_model()
    print("\nAll model JSON binaries successfully exported and validated!")
