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
import { AlertCircle, ArrowLeft, CheckCircle2, Leaf, Sprout } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('pre-sowing');

  // Pre-Sowing
  const [step, setStep] = useState('input'); // 'input' | 'results'
  const [decisionLoading, setDecisionLoading] = useState(false);
  const [decisionResult, setDecisionResult] = useState(null);
  const [preSowingError, setPreSowingError] = useState(null);

  // Post-Sowing
  const [diseaseLoading, setDiseaseLoading] = useState(false);
  const [selectedLeafFile, setSelectedLeafFile] = useState(null);
  const [diseaseResult, setDiseaseResult] = useState(null);
  const [postSowingError, setPostSowingError] = useState(null);

  const handleDecisionSubmit = async (payload) => {
    setDecisionLoading(true);
    setPreSowingError(null);
    try {
      const response = await evaluateDecision(payload);
      if (response.success && response.data) {
        setDecisionResult(response.data);
        setStep('results');
      } else {
        setPreSowingError(response.message || 'Evaluation failed.');
      }
    } catch (err) {
      if (err.response?.status === 500 && !err.response?.data?.message) {
        setPreSowingError('Express Backend (Port 5000) is unreachable. Please make sure "node server.js" is running.');
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
        setPostSowingError('Express Backend (Port 5000) is unreachable.');
      } else {
        setPostSowingError(err.response?.data?.message || err.message || 'Error processing leaf image.');
      }
    } finally {
      setDiseaseLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Reset pre-sowing to input step when switching away and back
    if (tab !== 'pre-sowing') setStep('input');
  };

  return (
    <div className="app-container">
      <Navbar activeTab={activeTab} setActiveTab={handleTabChange} />

      <main className="main-content">

        {/* ====== PRE-SOWING TAB ====== */}
        {activeTab === 'pre-sowing' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

            {/* STEP 1: INPUT */}
            {step === 'input' && (
              <div className="fade-in">
                {/* Page Header */}
                <div style={{
                  marginBottom: 26,
                  padding: '24px 28px',
                  background: 'linear-gradient(135deg, #e2f2e5 0%, #d5e9d9 100%)',
                  borderRadius: 16,
                  border: '1px solid #b2dbb9',
                  borderLeft: '6px solid #185a33',
                  boxShadow: '0 3px 10px rgba(24, 90, 51, 0.08)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div className="step-indicator" style={{ marginBottom: 12 }}>
                    <span style={{
                      backgroundColor: '#185a33',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: 6,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}>
                      Step 1 of 2
                    </span>
                    <span style={{ color: '#245435', fontWeight: 700, marginLeft: 6 }}>
                      Farmer Provides Field Details
                    </span>
                    <span style={{ color: '#689f76' }}>→</span>
                    <span style={{ color: '#4a7a58', fontWeight: 500 }}>
                      Step 2: AgroSense AI Decision
                    </span>
                  </div>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0b301a', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Sprout size={26} color="#185a33" />
                    Start with Your Field Details
                  </h2>
                  <p style={{ fontSize: '0.92rem', color: '#1c4a2a', maxWidth: 660, lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
                    Provide your soil profile, field characteristics, and regional weather source. The Decision Engine will synthesize all factors to recommend the optimal crop.
                  </p>
                </div>

                {preSowingError && (
                  <div className="callout callout-warning" style={{ marginBottom: 20 }}>
                    <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span>{preSowingError}</span>
                  </div>
                )}

                <InputForm onSubmit={handleDecisionSubmit} loading={decisionLoading} />
              </div>
            )}

            {/* STEP 2: RESULTS */}
            {step === 'results' && decisionResult && (
              <div className="fade-in">
                {/* Results Header */}
                <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div className="step-indicator" style={{ marginBottom: 10 }}>
                      <div className="step-dot done" />
                      <span>Field Details</span>
                      <span style={{ color: '#dde8d8' }}>—</span>
                      <div className="step-dot active" />
                      <span style={{ color: '#2d7a4f', fontWeight: 600 }}>Step 2 of 2</span>
                      <span style={{ color: '#dde8d8' }}>—</span>
                      <span>Crop Recommendation</span>
                    </div>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1a2e1a', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <CheckCircle2 size={28} color="#2d7a4f" />
                      Your Crop Recommendation is Ready!
                    </h2>
                    <p style={{ fontSize: '0.88rem', color: '#4b6358', marginTop: 6 }}>
                      Based on your field profile, live weather data, and irrigation feasibility — reviewed by the multi-factor Decision Engine.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                    <button
                      className="btn btn-outline"
                      onClick={() => setStep('input')}
                      style={{ padding: '9px 18px' }}
                    >
                      <ArrowLeft size={15} />
                      Modify Inputs
                    </button>
                  </div>
                </div>

                {/* Results Grid */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
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

                  {/* Bottom actions */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 12,
                    paddingTop: 8,
                    borderTop: '1px solid var(--border)'
                  }}>
                    <button
                      className="btn btn-outline"
                      onClick={() => setStep('input')}
                    >
                      <ArrowLeft size={15} />
                      Modify Inputs
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setActiveTab('history')}
                    >
                      <Leaf size={15} />
                      View History
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ====== POST-SOWING TAB ====== */}
        {activeTab === 'post-sowing' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ marginBottom: 4 }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1a2e1a', marginBottom: 6 }}>
                Post-Sowing Leaf Pathology Diagnosis
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#4b6358', maxWidth: 580, lineHeight: 1.6 }}>
                Computer vision diagnosis using PlantVillage CNN (38 classes) with Grad-CAM heatmap visualization and agronomic treatment guidance.
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
                {/* Diagnostic Pathology Report — full width */}
                <DiseaseResult result={diseaseResult} />

                {/* Grad-CAM Heatmap Visualization — full width */}
                {diseaseResult.gradcam_image && (
                  <GradCamViewer gradcamImage={diseaseResult.gradcam_image} />
                )}

                {/* Agronomic Health Guidance & Action Plan — full width */}
                <HealthGuidance
                  guidance={diseaseResult.health_guidance}
                  diseaseName={diseaseResult.predicted_disease}
                />
              </div>
            )}
          </div>
        )}

        {/* ====== HISTORY TAB ====== */}
        {activeTab === 'history' && <HistoryView />}

      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid #dde8d8',
        backgroundColor: '#ffffff',
        padding: '18px 0',
        textAlign: 'center',
        fontSize: '0.78rem',
        color: '#7a9e8a'
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <strong style={{ color: '#4b6358' }}>AgroSense AI:</strong> An Explainable Agricultural Decision Support System extending the AgroConsultant Framework.
          <div style={{ marginTop: 4, color: '#aab9af' }}>
            MCA Dissertation Project Prototype &bull; Strictly Decision Support &amp; Educational Advisory
          </div>
        </div>
      </footer>
    </div>
  );
}
