"""
Weather Service
Integrates OpenWeather API and calculates agronomic suitability scores
from agrosenseai (1).ipynb cells 93-100.
"""

import os
import requests
from typing import Dict, Any, Optional

# Crop weather requirements from notebook cell 98 + expanded standard agronomic ranges
CROP_WEATHER_REQUIREMENTS: Dict[str, Dict[str, tuple]] = {
    "rice": {"temperature": (20, 35), "humidity": (60, 90), "rainfall": (150, 300)},
    "jute": {"temperature": (24, 35), "humidity": (60, 90), "rainfall": (150, 300)},
    "pomegranate": {"temperature": (20, 35), "humidity": (40, 70), "rainfall": (50, 100)},
    "maize": {"temperature": (18, 32), "humidity": (50, 80), "rainfall": (50, 150)},
    "wheat": {"temperature": (10, 25), "humidity": (40, 70), "rainfall": (30, 100)},
    "cotton": {"temperature": (21, 30), "humidity": (50, 80), "rainfall": (50, 100)},
    "coconut": {"temperature": (25, 32), "humidity": (70, 90), "rainfall": (100, 250)},
    "papaya": {"temperature": (22, 35), "humidity": (60, 90), "rainfall": (100, 200)},
    "orange": {"temperature": (15, 35), "humidity": (50, 80), "rainfall": (60, 120)},
    "apple": {"temperature": (10, 24), "humidity": (50, 80), "rainfall": (60, 150)},
    "muskmelon": {"temperature": (20, 30), "humidity": (50, 70), "rainfall": (20, 60)},
    "watermelon": {"temperature": (24, 30), "humidity": (50, 80), "rainfall": (40, 80)},
    "grapes": {"temperature": (15, 35), "humidity": (50, 75), "rainfall": (40, 80)},
    "mango": {"temperature": (24, 35), "humidity": (50, 80), "rainfall": (50, 150)},
    "banana": {"temperature": (25, 35), "humidity": (70, 90), "rainfall": (100, 200)},
    "coffee": {"temperature": (18, 28), "humidity": (60, 85), "rainfall": (150, 250)},
    "chickpea": {"temperature": (15, 25), "humidity": (30, 60), "rainfall": (30, 80)},
    "kidneybeans": {"temperature": (15, 25), "humidity": (50, 70), "rainfall": (60, 120)},
    "pigeonpeas": {"temperature": (20, 35), "humidity": (40, 70), "rainfall": (60, 120)},
    "mothbeans": {"temperature": (25, 35), "humidity": (40, 70), "rainfall": (30, 75)},
    "mungbean": {"temperature": (25, 35), "humidity": (60, 85), "rainfall": (40, 90)},
    "blackgram": {"temperature": (25, 35), "humidity": (60, 85), "rainfall": (50, 90)},
    "lentil": {"temperature": (15, 25), "humidity": (40, 70), "rainfall": (30, 80)}
}


class WeatherService:
    def __init__(self):
        self.api_key = os.getenv("OPENWEATHER_API_KEY", "")

    def fetch_weather(self, latitude: Optional[float] = None, longitude: Optional[float] = None, city: Optional[str] = None) -> Dict[str, Any]:
        """Fetch current weather from OpenWeather API or return mock default if key missing."""
        api_key = self.api_key or os.getenv("OPENWEATHER_API_KEY", "")
        if not api_key:
            # Fallback mock weather for testing / offline demonstrations
            return {
                "location": city or "Demo Agronomic Station (Chennai)",
                "temperature": 28.5,
                "humidity": 68.0,
                "rainfall": 10.0,
                "weather": "Scattered Clouds",
                "wind_speed": 4.2,
                "is_live": False,
                "note": "Default demonstration weather. Set OPENWEATHER_API_KEY for live data."
            }

        url = "https://api.openweathermap.org/data/2.5/weather"
        params = {"appid": api_key, "units": "metric"}
        if latitude is not None and longitude is not None:
            params["lat"] = latitude
            params["lon"] = longitude
        elif city:
            params["q"] = city
        else:
            params["lat"] = 13.0827  # Default Chennai coordinates
            params["lon"] = 80.2707

        try:
            res = requests.get(url, params=params, timeout=5)
            if res.status_code == 200:
                data = res.json()
                return {
                    "location": data.get("name", "Unknown"),
                    "temperature": round(float(data["main"]["temp"]), 2),
                    "humidity": float(data["main"]["humidity"]),
                    "rainfall": float(data.get("rain", {}).get("1h", 0.0)),
                    "weather": data["weather"][0]["description"].title() if data.get("weather") else "Clear",
                    "wind_speed": round(float(data["wind"]["speed"]), 2),
                    "is_live": True
                }
            else:
                return {
                    "location": city or "Field Location",
                    "temperature": 28.0,
                    "humidity": 65.0,
                    "rainfall": 0.0,
                    "weather": "Normal",
                    "wind_speed": 3.5,
                    "is_live": False,
                    "error": f"OpenWeather API returned status {res.status_code}: {res.text}"
                }
        except Exception as e:
            return {
                "location": city or "Field Location",
                "temperature": 28.0,
                "humidity": 65.0,
                "rainfall": 0.0,
                "weather": "Normal",
                "wind_speed": 3.5,
                "is_live": False,
                "error": str(e)
            }

    @staticmethod
    def calculate_general_suitability(temperature: float, humidity: float, rainfall: float) -> float:
        """From notebook cell 97: general weather suitability score 0-100."""
        score = 100
        if temperature < 15 or temperature > 35:
            score -= 30
        elif temperature < 20 or temperature > 30:
            score -= 15

        if humidity < 30 or humidity > 90:
            score -= 20
        elif humidity < 40 or humidity > 80:
            score -= 10

        if rainfall == 0:
            score -= 10

        return max(0, score)

    @staticmethod
    def calculate_crop_weather_score(crop: str, temperature: float, humidity: float, rainfall: float) -> float:
        """From notebook cell 99: crop-specific weather suitability score 0-100."""
        crop_key = crop.lower().strip()
        if crop_key not in CROP_WEATHER_REQUIREMENTS:
            # Fallback to general suitability
            return float(WeatherService.calculate_general_suitability(temperature, humidity, rainfall))

        req = CROP_WEATHER_REQUIREMENTS[crop_key]
        t_min, t_max = req["temperature"]
        h_min, h_max = req["humidity"]
        r_min, r_max = req["rainfall"]

        t_ideal = (t_min + t_max) / 2
        h_ideal = (h_min + h_max) / 2
        r_ideal = (r_min + r_max) / 2

        t_range = max(1.0, (t_max - t_min) / 2)
        h_range = max(1.0, (h_max - h_min) / 2)
        r_range = max(1.0, (r_max - r_min) / 2)

        temp_score = max(0.0, 1.0 - abs(temperature - t_ideal) / t_range)
        hum_score = max(0.0, 1.0 - abs(humidity - h_ideal) / h_range)

        if rainfall == 0:
            rain_score = 0.5
        else:
            rain_score = max(0.0, 1.0 - abs(rainfall - r_ideal) / r_range)

        final_score = (temp_score * 40.0) + (hum_score * 30.0) + (rain_score * 30.0)
        return round(float(final_score), 2)


weather_service = WeatherService()
