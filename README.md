# AgroSense AI: An Explainable Agricultural Decision Support System by Extending the AgroConsultant Framework

**AgroSense AI** is a multi-tier, explainable agricultural decision support system designed as an MCA dissertation project. It extends the AgroConsultant framework by combining machine learning crop recommendation, live agro-climatic weather analysis, and irrigation requirement forecasting into a unified Decision Engine, alongside an independent post-sowing leaf pathology diagnosis module with visual interpretability.

---

## 🏛️ System Architecture

```mermaid
graph TD
    subgraph Client Tier
        UI[React + Vite Frontend (Port 3000)]
    end

    subgraph API Gateway Tier
        EX[Node.js + Express Gateway (Port 5000)]
        DB[(MongoDB Database / In-Memory Fallback)]
    end

    subgraph ML Microservice Tier
        FA[Python + FastAPI Service (Port 8000)]
        OW[OpenWeather API]
        CR[Crop Random Forest + SHAP]
        IR[Irrigation Random Forest Pipeline]
        DE[Multi-Factor Decision Engine]
        DD[PlantVillage CNN + Grad-CAM]
    end

    UI -->|HTTP / REST| EX
    EX -->|Mongoose| DB
    EX -->|Proxy / Reverse Call| FA
    FA -->|Live Meteorological Data| OW
    FA --> CR
    FA --> IR
    FA --> DE
    FA --> DD
```

---

## 🚀 Key Modules & Explainability

### 1. Pre-Sowing Decision Support Engine
Combines three distinct agricultural parameters to recommend the most suitable crop:
1. **Soil Nutrient Fit (60% Layer 1 Weight)**:
   - Random Forest model evaluating 7 inputs: Nitrogen (N), Phosphorus (P), Potassium (K), Temperature, Relative Humidity, Soil pH, and Rainfall.
   - Evaluates all 22 crop classes, outputting Top-3 candidates with confidence probabilities.
   - **SHAP (SHapley Additive exPlanations)** calculates local feature attributions showing whether individual soil nutrients supported or limited crop selection.
2. **Weather Suitability (40% Layer 1 Weight)**:
   - Live weather fetched via OpenWeather API (temperature, humidity, precipitation, wind speed) or manual observation.
   - Evaluates crop-specific tolerance ranges (`crop_weather_requirements`) to calculate an agro-climatic suitability score out of 100.
3. **Irrigation Feasibility (20% Final Decision Weight)**:
   - Evaluates 19 agronomic field attributes (soil moisture %, soil type, growth stage, season, irrigation type, water source).
   - Random Forest model predicts water demand: **Low**, **Medium**, or **High**.
   - Mapped to a resource feasibility score: `Low = 100`, `Medium = 75`, `High = 50`.
4. **Final Decision Fusion & Human-Readable Explanation**:
   - `Final Score = [(Crop Prob × 0.60 + Weather Score × 0.40) × 0.80] + [Irrigation Feasibility × 0.20]`
   - Generates a clear, non-technical plain text explanation for the farmer detailing *why* the winning crop outperformed alternatives.

### 2. Post-Sowing Plant Disease Detection (Decoupled Branch)
- **Strict Decoupling Policy**: Operates exclusively post-sowing and **never** influences pre-sowing crop selection or Decision Engine ratings.
- Evaluates leaf specimens across 38 PlantVillage disease classes.
- **Grad-CAM (Gradient-Weighted Class Activation Mapping)**: Computes gradients with respect to convolutional layer feature maps (`conv2d_2`) to overlay a thermal Jet heatmap highlighting infected lesions.
- **Agronomic Health Guidance**: Maps detected conditions to immediate sanitation protocols, cultural practices, and scouting guidelines.

---

## 📊 Completed ML Benchmark Models (Source of Truth: Kaggle)

| Component | Architecture / Pipeline | Input Dimensions | Accuracy | Explainability |
| :--- | :--- | :--- | :--- | :--- |
| **Crop Recommendation** | Random Forest (`n_estimators=200`, balanced) | 7 soil & climate features | **99.55%** | Tree SHAP local attribution |
| **Irrigation Prediction** | Random Forest Pipeline (`ColumnTransformer` + `OHE`) | 19 field & environmental features | **97.85%** | Gini feature importance & probabilities |
| **Disease Detection** | Deep CNN (3 Conv2D blocks + GAP + Dense) | 128 × 128 × 3 leaf image | **75.33%** | Grad-CAM saliency heatmaps |
| **Weather Engine** | OpenWeather API + Agro-climatic scoring | Lat / Lon / City / Live weather | Real-time | Parametric score reduction |

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Lucide Icons, Modern Responsive CSS
- **Backend API Gateway**: Node.js, Express, Axios, Multer, Mongoose, CORS
- **ML Microservice**: Python, FastAPI, Uvicorn, Scikit-learn, NumPy, Pandas, Pillow
- **Database**: MongoDB (with graceful in-memory session audit fallback)

---

## ⚙️ Installation & Setup Instructions

### Prerequisites
- Node.js (v18+ or v24+) & npm
- Python (v3.12+ or v3.14+)
- MongoDB (optional; system includes automatic in-memory fallback if MongoDB is not running)

---

### Step 1: Python ML Microservice Setup

1. Open a terminal and navigate to `ml_service/`:
   ```bash
   cd ml_service
   ```
2. (Optional) Create or activate virtual environment:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate      # Windows
   # source .venv/bin/activate  # Linux/macOS
   ```
3. Install required packages:
   ```bash
   pip install -r requirements.txt
   ```
4. Verify/Export model binaries (already pre-generated in `ml_service/models/`):
   ```bash
   python export_models.py
   ```
5. Launch the FastAPI service:
   ```bash
   python -m uvicorn app:app --host 127.0.0.1 --port 8000 --reload
   ```
   *FastAPI Interactive Docs:* `http://localhost:8000/docs`

---

### Step 2: Node.js + Express Backend Setup

1. Open a new terminal and navigate to `backend/`:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env` (a template is provided in `.env.example`):
   ```env
   PORT=5000
   ML_SERVICE_URL=http://localhost:8000
   MONGODB_URI=mongodb://localhost:27017/agrosense_ai
   OPENWEATHER_API_KEY=your_openweather_api_key_here
   NODE_ENV=development
   ```
   *(Note: If `OPENWEATHER_API_KEY` is omitted, the system seamlessly uses demo agronomic station weather).*
4. Launch the Express server:
   ```bash
   node server.js
   ```
   *Backend Gateway runs on:* `http://localhost:5000`

---

### Step 3: React Frontend Setup

1. Open a new terminal and navigate to `frontend/`:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *Access the Web Application at:* `http://localhost:3000`

---

## 📡 API Reference Documentation

### FastAPI ML Microservice (`http://localhost:8000`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Service and model status check |
| `POST` | `/predict/crop` | Returns Top-3 crops, probabilities, and SHAP attributions |
| `POST` | `/predict/irrigation` | Returns Low/Medium/High water need and feasibility score |
| `POST` | `/predict/disease` | Multipart leaf image upload; returns diagnosis, confidence, and Grad-CAM |
| `POST` | `/decision` | Full Decision Engine evaluation, score fusion, and explanation |
| `GET` | `/weather` | Secure server-side weather lookup (`lat`, `lon`, or `city`) |

### Express API Gateway (`http://localhost:5000`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check verifying Express, MongoDB, and FastAPI |
| `POST` | `/api/crop/recommend` | Proxies crop prediction |
| `POST` | `/api/irrigation/recommend` | Proxies irrigation prediction |
| `POST` | `/api/disease/detect` | Handles multipart leaf upload, forwards to ML, records audit history |
| `POST` | `/api/decision/evaluate` | Evaluates decision engine, records audit history |
| `GET` | `/api/weather/current` | Proxies weather lookup securely |
| `GET` | `/api/history/recommendations` | Retrieves pre-sowing decision history |
| `GET` | `/api/history/diseases` | Retrieves post-sowing disease diagnosis history |

---

## ⚠️ Limitations & Academic Disclaimer

1. **Decision Support & Advisory**: AgroSense AI is designed as an academic prototype for an MCA dissertation project extending the AgroConsultant framework. Outputs should be treated as decision support recommendations, not agronomic or legal guarantees.
2. **Post-Sowing CNN Boundary**: The PlantVillage dataset represents laboratory-controlled leaf specimens. Field conditions with extreme glare, multiple leaves, or physical leaf damage may affect visual feature extraction.
3. **Soil Testing Validation**: Farmers should always cross-reference recommendations with physical soil test reports from certified soil testing laboratories before planting or applying chemical pesticides.
