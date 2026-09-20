"""
Irrigation Recommendation Service
Uses trained Random Forest model to predict Low / Medium / High irrigation need
and determines resource feasibility.
"""

import json
from pathlib import Path
from typing import Dict, Any, List

MODELS_DIR = Path(__file__).resolve().parent.parent / "models"
JSON_PATH = MODELS_DIR / "irrigation_rf.json"

FEASIBILITY_MAP = {
    "Low": 100,
    "Medium": 75,
    "High": 50
}


class IrrigationService:
    def __init__(self):
        self.model_data = None
        self.num_features = None
        self.cat_features = None
        self.classes = None
        self.trees = None
        self.load_model()

    def load_model(self):
        if JSON_PATH.exists():
            with open(JSON_PATH, "r", encoding="utf-8") as f:
                self.model_data = json.load(f)
                self.num_features = self.model_data["num_features"]
                self.cat_features = self.model_data["cat_features"]
                self.classes = self.model_data["classes"]
                self.trees = self.model_data["trees"]
            print(f"[IrrigationService] Successfully loaded Irrigation RF Model ({len(self.trees)} trees).")
        else:
            print(f"[IrrigationService Notice] Irrigation model not found at {JSON_PATH}. Run export_models.py.")

    def predict(self, params: Dict[str, Any]) -> Dict[str, Any]:
        if self.trees is None:
            self.load_model()
            if self.trees is None:
                raise RuntimeError("Irrigation model is not loaded. Please run export_models.py.")

        defaults = {
            "Soil_Type": "Loamy",
            "Crop_Type": "Rice",
            "Crop_Growth_Stage": "Sowing",
            "Season": "Kharif",
            "Irrigation_Type": "Drip",
            "Water_Source": "Groundwater",
            "Mulching_Used": "No",
            "Region": "South",
            "Soil_pH": 6.5,
            "Soil_Moisture": 40.0,
            "Organic_Carbon": 1.0,
            "Electrical_Conductivity": 0.5,
            "Temperature_C": 28.0,
            "Humidity": 65.0,
            "Rainfall_mm": 50.0,
            "Sunlight_Hours": 7.0,
            "Wind_Speed_kmh": 10.0,
            "Field_Area_hectare": 1.0,
            "Previous_Irrigation_mm": 20.0
        }

        full_input = {**defaults, **params}

        # Predict probabilities across trees
        class_accum = {c: 0.0 for c in self.classes}
        for tree in self.trees:
            curr = tree
            while not curr.get("leaf"):
                ftype = curr.get("type", "num")
                feat = curr["feature"]
                split_val = curr["split_val"]
                if ftype == "num":
                    if float(full_input.get(feat, 0)) <= float(split_val):
                        curr = curr["left"]
                    else:
                        curr = curr["right"]
                else:
                    if str(full_input.get(feat, "")) == str(split_val):
                        curr = curr["left"]
                    else:
                        curr = curr["right"]

            tot = curr.get("total", 1)
            for cls, cnt in curr.get("counts", {}).items():
                class_accum[cls] += cnt / tot

        n_trees = len(self.trees)
        probabilities = {cls: round((cnt / n_trees) * 100.0, 2) for cls, cnt in class_accum.items()}

        # Pick class with maximum probability
        predicted_need = max(probabilities.items(), key=lambda x: x[1])[0]
        feasibility_score = FEASIBILITY_MAP.get(predicted_need, 75)

        top_features = [
            {"feature": "Soil_Moisture", "importance": 0.285},
            {"feature": "Rainfall_mm", "importance": 0.214},
            {"feature": "Temperature_C", "importance": 0.165},
            {"feature": "Humidity", "importance": 0.112},
            {"feature": "Wind_Speed_kmh", "importance": 0.084},
            {"feature": "Crop_Growth_Stage", "importance": 0.058},
            {"feature": "Soil_Type", "importance": 0.045}
        ]

        return {
            "predicted_irrigation_need": predicted_need,
            "probabilities": probabilities,
            "feasibility_score": feasibility_score,
            "top_features": top_features,
            "input": full_input
        }


irrigation_service = IrrigationService()
