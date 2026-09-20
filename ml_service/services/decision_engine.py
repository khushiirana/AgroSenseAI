"""
AgroSense AI - Decision Engine
Extends the AgroConsultant framework to combine:
1. Crop model suitability (60% weight)
2. Live weather suitability (40% weight)
3. Irrigation feasibility (20% final decision weight)

Generates final recommendation, ranked comparison, and human-readable explanation
exactly as implemented in agrosenseai (1).ipynb cells 101-108.
"""

from typing import Dict, Any, List, Optional
from .crop_service import crop_service
from .weather_service import weather_service, WeatherService
from .irrigation_service import irrigation_service, FEASIBILITY_MAP


class DecisionEngine:
    def evaluate(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Full pre-sowing decision fusion pipeline.
        payload contains:
        - N, P, K, ph
        - latitude, longitude or city (optional, for live weather)
        - temperature, humidity, rainfall (optional, manual weather override)
        - optional irrigation attributes: Soil_Type, Season, Irrigation_Type, etc.
        """
        # 1. Resolve Weather Parameters
        live_weather = None
        has_manual_weather = (
            payload.get("temperature") is not None and
            payload.get("humidity") is not None and
            payload.get("rainfall") is not None
        )

        if not has_manual_weather:
            # Fetch live weather or default station
            live_weather = weather_service.fetch_weather(
                latitude=payload.get("latitude"),
                longitude=payload.get("longitude"),
                city=payload.get("city")
            )
            temp = float(live_weather["temperature"])
            hum = float(live_weather["humidity"])
            rain = float(live_weather["rainfall"])
            wind = float(live_weather.get("wind_speed") or 3.5)
        else:
            temp = float(payload["temperature"])
            hum = float(payload["humidity"])
            rain = float(payload["rainfall"])
            wind = float(payload.get("wind_speed") or 3.5)
            live_weather = {
                "location": payload.get("city") or "Manual Farmer Input",
                "temperature": temp,
                "humidity": hum,
                "rainfall": rain,
                "weather": "Manual Observation",
                "wind_speed": wind,
                "is_live": False
            }

        n = float(payload.get("N") or 90.0)
        p = float(payload.get("P") or 42.0)
        k = float(payload.get("K") or 43.0)
        ph = float(payload.get("ph") or 6.5)

        # 2. Step 1: Crop Recommendation (Top-3)
        crop_res = crop_service.predict_top3(
            n=n, p=p, k=k,
            temperature=temp,
            humidity=hum,
            ph=ph,
            rainfall=rain
        )
        top_3_crops = crop_res["top_3"]

        # 3. Step 2 & 3: Weather Suitability & Combined Suitability
        combined_scores = []
        for item in top_3_crops:
            crop_name = item["crop"]
            crop_prob = item["probability"]
            weather_score = WeatherService.calculate_crop_weather_score(crop_name, temp, hum, rain)

            # Combined score: 60% crop probability + 40% weather suitability (Notebook Cell 103)
            layer1_score = (crop_prob * 0.60) + (weather_score * 0.40)
            combined_scores.append({
                "crop": crop_name,
                "crop_probability": round(crop_prob, 2),
                "weather_score": round(weather_score, 2),
                "combined_score": round(layer1_score, 2)
            })

        # 4. Step 4 & 5: Crop-Specific Irrigation Requirement & Feasibility
        base_irrigation_params = {
            "Soil_Type": payload.get("Soil_Type") or "Loamy",
            "Crop_Growth_Stage": payload.get("Crop_Growth_Stage") or "Sowing",
            "Season": payload.get("Season") or "Kharif",
            "Irrigation_Type": payload.get("Irrigation_Type") or "Drip",
            "Water_Source": payload.get("Water_Source") or "Groundwater",
            "Mulching_Used": payload.get("Mulching_Used") or "No",
            "Region": payload.get("Region") or "South",
            "Soil_pH": ph,
            "Soil_Moisture": float(payload.get("Soil_Moisture") or 40.0),
            "Organic_Carbon": float(payload.get("Organic_Carbon") or 1.0),
            "Electrical_Conductivity": float(payload.get("Electrical_Conductivity") or 0.5),
            "Temperature_C": temp,
            "Humidity": hum,
            "Rainfall_mm": rain,
            "Sunlight_Hours": float(payload.get("Sunlight_Hours") or 7.0),
            "Wind_Speed_kmh": wind * 3.6,
            "Field_Area_hectare": float(payload.get("Field_Area_hectare") or 1.0),
            "Previous_Irrigation_mm": float(payload.get("Previous_Irrigation_mm") or 20.0)
        }

        # For EACH Top-3 crop candidate:
        # 1. Create the irrigation input using that candidate as Crop_Type
        # 2. Run existing trained irrigation RF pipeline separately
        # 3. Get crop's irrigation prediction and probabilities
        # 4. Convert predicted irrigation need using Low=100, Medium=75, High=50
        # 5. Calculate Final = (Crop Prob * 0.60 + Weather * 0.40) * 0.80 + Irrigation Feasibility * 0.20
        candidate_irr_results = {}
        for item in combined_scores:
            candidate_crop = item["crop"].title()
            cand_irr_params = {**base_irrigation_params, "Crop_Type": candidate_crop}
            cand_irr_res = irrigation_service.predict(cand_irr_params)
            candidate_irr_results[item["crop"]] = cand_irr_res

            cand_irr_need = cand_irr_res["predicted_irrigation_need"]
            cand_irr_score = cand_irr_res["feasibility_score"]

            cw_score = item["combined_score"]
            final_decision_score = (cw_score * 0.80) + (cand_irr_score * 0.20)

            item["irrigation_need"] = cand_irr_need
            item["irrigation_score"] = cand_irr_score
            item["irrigation_probabilities"] = cand_irr_res["probabilities"]
            item["final_score"] = round(final_decision_score, 2)

        # Rank crops according to the final Decision Engine score
        combined_scores = sorted(
            combined_scores,
            key=lambda x: x["final_score"],
            reverse=True
        )

        final_crop = combined_scores[0]["crop"]
        final_result = combined_scores[0]

        # Winning crop's irrigation analysis for detailed card display
        irr_res = candidate_irr_results[final_crop]
        irr_res["crop_evaluated"] = final_crop.title()
        predicted_irrigation = final_result["irrigation_need"]
        irrigation_score = final_result["irrigation_score"]

        # 6. Human-readable Explanation Generation (Notebook Cell 107)
        explanation = (
            f"{final_crop.title()} is recommended because it received the "
            f"highest overall suitability score of {final_result['final_score']}/100. "
            f"The crop recommendation model assigned it a probability of "
            f"{final_result['crop_probability']}%, while the current weather suitability "
            f"score is {final_result['weather_score']}/100. "
            f"The predicted irrigation requirement is {predicted_irrigation}, "
            f"with an irrigation feasibility score of {irrigation_score}/100."
        )

        return {
            "final_recommended_crop": final_crop,
            "final_suitability_score": final_result["final_score"],
            "human_readable_explanation": explanation,
            "ranked_crops": combined_scores,
            "weather_analysis": {
                **live_weather,
                "general_suitability": WeatherService.calculate_general_suitability(temp, hum, rain)
            },
            "irrigation_analysis": irr_res,
            "crop_shap_explanation": crop_res.get("shap_explanation", []),
            "farmer_inputs": {
                "N": n, "P": p, "K": k, "ph": ph,
                "temperature": temp, "humidity": hum, "rainfall": rain,
                "soil_moisture": base_irrigation_params["Soil_Moisture"],
                "soil_type": base_irrigation_params["Soil_Type"]
            }
        }


decision_engine = DecisionEngine()
