import React, { useState } from 'react';
import Navbar from './components/Navbar';
import InputForm from './components/PreSowing/InputForm';
import WeatherCard from './components/PreSowing/WeatherCard';
import DecisionCard from './components/PreSowing/DecisionCard';
import Top3CropsTable from './components/PreSowing/Top3CropsTable';
import IrrigationCard from './components/PreSowing/IrrigationCard';
import ShapChart from './components/PreSowing/ShapChart';

import ImageUploader from './components/PostSowing/ImageUploader';
import DiseaseResult from './components/PostSowing/DiseaseResult';
import GradCamViewer from './components/PostSowing/GradCamViewer';
import HealthGuidance from './components/PostSowing/HealthGuidance';

import HistoryView from './components/History/HistoryView';
import { evaluateDecision, detectDisease } from './services/api';
import { AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('pre-sowing');

  // Pre-Sowing State
  const [decisionLoading, setDecisionLoading] = useState(false);
  const [decisionResult, setDecisionResult] = useState(null);
  const [preSowingError, setPreSowingError] = useState(null);

  // Post-Sowing State
  const [diseaseLoading, setDiseaseLoading] = useState(false);
  const [selectedLeafFile, setSelectedLeafFile] = useState(null);
  const [diseaseResult, setDiseaseResult] = useState(null);
  const [postSowingError, setPostSowingError] = useState(null);

  // Handlers
  const handleDecisionSubmit = async (payload) => {
    setDecisionLoading(true);
    setPreSowingError(null);
    try {
      const response = await evaluateDecision(payload);
      if (response.success && response.data) {
        setDecisionResult(response.data);
      } else {
        setPreSowingError(response.message || 'Evaluation failed.');
      }
    } catch (err) {
      if (err.response?.status === 500 && !err.response?.data?.message) {
        setPreSowingError('Express Backend (Port 5000) is unreachable. Please make sure "node server.js" is running in Terminal 2 (backend folder).');
      } else {
        setPreSowingError(err.response?.data?.message || err.message || 'Network error evaluating decision.');
      }
    } finally {
      setDecisionLoading(false);
    }
  };

  const handleDiseaseDetect = async () => {
    if (!selectedLeafFile) return;
    setDiseaseLoading(true);
    setPostSowingError(null);
    try {
      const formData = new FormData();
      formData.append('image', selectedLeafFile);
      const response = await detectDisease(formData);
      if (response.success && response.data) {
        setDiseaseResult(response.data);
      } else {
        setPostSowingError(response.message || 'Pathology analysis failed.');
      }
    } catch (err) {
      if (err.response?.status === 500 && !err.response?.data?.message) {
        setPostSowingError('Express Backend (Port 5000) is unreachable. Please make sure "node server.js" is running in Terminal 2 (backend folder).');
      } else {
        setPostSowingError(err.response?.data?.message || err.message || 'Error processing leaf image.');
      }
    } finally {
      setDiseaseLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="main-content">
        {/* PRE-SOWING TAB */}
        {activeTab === 'pre-sowing' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
                Pre-Sowing Decision Support Engine
              </h2>
              <p style={{ fontSize: '0.88rem', color: '#64748b' }}>
                Synthesizes soil nutrients, live weather conditions, and irrigation feasibility to determine the optimal crop choice with explainability.
              </p>
            </div>

            {preSowingError && (
              <div className="callout callout-warning">
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{preSowingError}</span>
              </div>
            )}

            <InputForm onSubmit={handleDecisionSubmit} loading={decisionLoading} />

            {decisionResult && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <DecisionCard decision={decisionResult} />

                <div className="grid-2">
                  <WeatherCard weather={decisionResult.weather_analysis} />
                  <IrrigationCard
                    irrigation={decisionResult.irrigation_analysis}
                    recommendedCrop={decisionResult.final_recommended_crop}
                  />
                </div>

                <Top3CropsTable crops={decisionResult.ranked_crops} />

                <ShapChart
                  shapData={decisionResult.crop_shap_explanation}
                  recommendedCrop={decisionResult.final_recommended_crop}
                />
              </div>
            )}
          </div>
        )}

        {/* POST-SOWING TAB */}
        {activeTab === 'post-sowing' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
                Post-Sowing Leaf Pathology Diagnosis
              </h2>
              <p style={{ fontSize: '0.88rem', color: '#64748b' }}>
                Computer vision diagnosis using PlantVillage CNN (38 classes) with Grad-CAM heatmap visualization and agronomic guidance.
              </p>
            </div>

            {postSowingError && (
              <div className="callout callout-warning">
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{postSowingError}</span>
              </div>
            )}

            <ImageUploader
              selectedFile={selectedLeafFile}
              onImageSelected={setSelectedLeafFile}
              onDetect={handleDiseaseDetect}
              loading={diseaseLoading}
            />

            {diseaseResult && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div className="grid-2">
                  <DiseaseResult result={diseaseResult} />
                  <GradCamViewer gradcamImage={diseaseResult.gradcam_image} />
                </div>

                <HealthGuidance
                  guidance={diseaseResult.health_guidance}
                  diseaseName={diseaseResult.predicted_disease}
                />
              </div>
            )}
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && <HistoryView />}
      </main>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        borderTop: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
        padding: '20px 0',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: '#64748b'
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px' }}>
          <strong>AgroSense AI:</strong> An Explainable Agricultural Decision Support System by Extending the AgroConsultant Framework.
          <div style={{ marginTop: 4, color: '#94a3b8' }}>
            MCA Dissertation Project Prototype • Strictly Decision Support & Educational Advisory
          </div>
        </div>
      </footer>
    </div>
  );
}
