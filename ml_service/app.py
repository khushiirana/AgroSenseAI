"""
AgroSense AI - FastAPI ML Service
Provides RESTful inference and explainability endpoints for:
- Crop Recommendation (Random Forest + SHAP)
- Irrigation Need (Random Forest Pipeline)
- Plant Disease Detection (CNN + Grad-CAM + Health Guidance)
- Multi-factor Decision Engine
- Secure Weather Service
"""

import os
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List

# Load environment variables
load_dotenv()

from services.crop_service import crop_service
from services.irrigation_service import irrigation_service
from services.disease_service import disease_service
from services.weather_service import weather_service
from services.decision_engine import decision_engine

app = FastAPI(
    title="AgroSense AI - ML Microservice",
    description="Explainable Agricultural Decision Support System ML Service",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------------------------------------------
# Pydantic Request Models
# -------------------------------------------------------------

class CropPredictRequest(BaseModel):
    N: float = Field(..., description="Nitrogen content in soil (kg/ha)", ge=0, le=200)
    P: float = Field(..., description="Phosphorus content in soil (kg/ha)", ge=0, le=200)
    K: float = Field(..., description="Potassium content in soil (kg/ha)", ge=0, le=250)
    temperature: float = Field(..., description="Temperature in degree Celsius", ge=-10, le=60)
    humidity: float = Field(..., description="Relative humidity in %", ge=0, le=100)
    ph: float = Field(..., description="Soil pH", ge=0, le=14)
    rainfall: float = Field(..., description="Rainfall in mm", ge=0, le=1000)


class IrrigationPredictRequest(BaseModel):
    Soil_Type: Optional[str] = "Loamy"
    Crop_Type: Optional[str] = "Rice"
    Crop_Growth_Stage: Optional[str] = "Sowing"
    Season: Optional[str] = "Kharif"
    Irrigation_Type: Optional[str] = "Drip"
    Water_Source: Optional[str] = "Groundwater"
    Mulching_Used: Optional[str] = "No"
    Region: Optional[str] = "South"
    Soil_pH: Optional[float] = 6.5
    Soil_Moisture: Optional[float] = 40.0
    Organic_Carbon: Optional[float] = 1.0
    Electrical_Conductivity: Optional[float] = 0.5
    Temperature_C: Optional[float] = 28.0
    Humidity: Optional[float] = 65.0
    Rainfall_mm: Optional[float] = 50.0
    Sunlight_Hours: Optional[float] = 7.0
    Wind_Speed_kmh: Optional[float] = 10.0
    Field_Area_hectare: Optional[float] = 1.0
    Previous_Irrigation_mm: Optional[float] = 20.0


class DecisionRequest(BaseModel):
    N: float = 90.0
    P: float = 42.0
    K: float = 43.0
    ph: float = 6.5
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    city: Optional[str] = None
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    rainfall: Optional[float] = None
    wind_speed: Optional[float] = None
    Soil_Type: Optional[str] = "Loamy"
    Season: Optional[str] = "Kharif"
    Irrigation_Type: Optional[str] = "Drip"
    Soil_Moisture: Optional[float] = 40.0


# -------------------------------------------------------------
# Endpoints
# -------------------------------------------------------------

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AgroSense AI - ML Microservice",
        "crop_model_loaded": crop_service.trees is not None,
        "irrigation_model_loaded": irrigation_service.trees is not None,
        "disease_model_loaded": True
    }


@app.post("/predict/crop")
def predict_crop(req: CropPredictRequest):
    try:
        result = crop_service.predict_top3(
            n=req.N,
            p=req.P,
            k=req.K,
            temperature=req.temperature,
            humidity=req.humidity,
            ph=req.ph,
            rainfall=req.rainfall
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict/irrigation")
def predict_irrigation(req: IrrigationPredictRequest):
    try:
        result = irrigation_service.predict(req.dict())
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict/disease")
async def predict_disease(file: UploadFile = File(...)):
    """
    POST-SOWING Leaf Disease Detection endpoint.
    Strictly independent branch that does not alter pre-sowing decisions.
    """
    try:
        contents = await file.read()
        if not contents:
            raise HTTPException(status_code=400, detail="Empty image uploaded")
        result = disease_service.predict(contents)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Leaf disease detection failed: {str(e)}")


@app.post("/decision")
def evaluate_decision(req: DecisionRequest):
    """
    Decision Engine Endpoint.
    Combines:
    1. Crop suitability (60%)
    2. Weather suitability (40%)
    3. Irrigation feasibility (20% final decision weight)
    """
    try:
        result = decision_engine.evaluate(req.dict())
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Decision Engine evaluation failed: {str(e)}")


@app.get("/weather")
def get_weather(
    lat: Optional[float] = None,
    lon: Optional[float] = None,
    city: Optional[str] = None
):
    try:
        weather_data = weather_service.fetch_weather(latitude=lat, longitude=lon, city=city)
        return {"success": True, "data": weather_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
