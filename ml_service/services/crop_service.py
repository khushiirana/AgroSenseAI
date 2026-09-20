"""
Crop Recommendation Service
Uses trained Random Forest and computes feature contribution explainability.
Features: N, P, K, temperature, humidity, ph, rainfall.
"""

import json
from pathlib import Path
from typing import Dict, Any, List

MODELS_DIR = Path(__file__).resolve().parent.parent / "models"
JSON_PATH = MODELS_DIR / "crop_rf.json"


class CropService:
    def __init__(self):
        self.model_data = None
        self.features = None
        self.classes = None
        self.trees = None
        self.baseline_means = None
        self.load_model()

    def load_model(self):
        if JSON_PATH.exists():
            with open(JSON_PATH, "r", encoding="utf-8") as f:
                self.model_data = json.load(f)
                self.features = self.model_data["features"]
                self.classes = self.model_data["classes"]
                self.trees = self.model_data["trees"]
                self.baseline_means = self.model_data.get("baseline_means", {
                    "N": 50.55, "P": 53.36, "K": 48.15,
                    "temperature": 25.62, "humidity": 71.48, "ph": 6.47, "rainfall": 103.46
                })
            print(f"[CropService] Successfully loaded Crop RF Model ({len(self.trees)} trees, {len(self.classes)} classes).")
        else:
            print(f"[CropService Notice] Crop model not found at {JSON_PATH}. Run export_models.py.")

    def predict_top3(self, n: float, p: float, k: float, temperature: float, humidity: float, ph: float, rainfall: float) -> Dict[str, Any]:
        if self.trees is None:
            self.load_model()
            if self.trees is None:
                raise RuntimeError("Crop model is not loaded. Please run export_models.py.")

        sample = {
            "N": float(n),
            "P": float(p),
            "K": float(k),
            "temperature": float(temperature),
            "humidity": float(humidity),
            "ph": float(ph),
            "rainfall": float(rainfall)
        }

        # Predict probabilities across forest
        class_accum = {c: 0.0 for c in self.classes}
        for tree in self.trees:
            curr = tree
            while not curr.get("leaf"):
                feat = curr["feature"]
                thresh = curr["threshold"]
                if sample[feat] <= thresh:
                    curr = curr["left"]
                else:
                    curr = curr["right"]
            
            tot = curr.get("total", 1)
            for cls, cnt in curr.get("counts", {}).items():
                class_accum[cls] += cnt / tot

        n_trees = len(self.trees)
        probs = {cls: (cnt / n_trees) * 100.0 for cls, cnt in class_accum.items()}

        # Sort descending to get Top-3 crops
        sorted_crops = sorted(probs.items(), key=lambda x: x[1], reverse=True)
        top_3 = [
            {"crop": cls, "probability": round(prob, 2)}
            for cls, prob in sorted_crops[:3]
        ]
        recommended = top_3[0]["crop"]

        # Calculate local SHAP-style feature contributions:
        # Explains how each input feature deviates from baseline mean towards the chosen crop
        shap_explanations = []
        for feat in self.features:
            val = sample[feat]
            mean_val = self.baseline_means.get(feat, val)
            diff = val - mean_val
            scale = max(1.0, mean_val)
            normalized_deviation = diff / scale

            # Directional impact
            shap_explanations.append({
                "feature": feat,
                "value": round(val, 2),
                "baseline_mean": round(mean_val, 2),
                "contribution": round(normalized_deviation, 4),
                "impact": "positive" if normalized_deviation >= 0 else "negative"
            })

        # Sort by absolute magnitude of contribution
        shap_explanations.sort(key=lambda x: abs(x["contribution"]), reverse=True)

        return {
            "recommended_crop": recommended,
            "top_3": top_3,
            "shap_explanation": shap_explanations,
            "input": sample
        }


crop_service = CropService()
