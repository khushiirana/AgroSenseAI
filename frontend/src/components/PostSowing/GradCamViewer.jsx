import React from 'react';
import { Eye, Layers } from 'lucide-react';

export default function GradCamViewer({ gradcamImage, originalPreview }) {
  if (!gradcamImage) return null;

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title" style={{ color: '#5b21b6' }}>
          <Layers size={20} color="#7c3aed" />
          Grad-CAM Explainability
        </h3>
        <span className="badge badge-accent">CNN Feature Attribution</span>
      </div>

      <p style={{ fontSize: '0.9rem', color: '#4b6358', marginBottom: 20, lineHeight: 1.6, fontWeight: 600 }}>
        Highlighted regions indicate the areas that contributed most to the model’s prediction. Gradient-weighted Class Activation Mapping (Grad-CAM) visualizes the spatial features in the leaf specimen that drove the CNN’s diagnostic decision.
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 32, flexWrap: 'wrap', marginBottom: 22 }}>
        {/* Original Uploaded Leaf Image */}
        {originalPreview && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              border: '2px solid #cbd5e1',
              borderRadius: 12,
              padding: 4,
              display: 'inline-block',
              backgroundColor: '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
              <img
                src={originalPreview}
                alt="Original Leaf Specimen"
                style={{
                  width: 260,
                  height: 260,
                  borderRadius: 8,
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
            </div>
            <div style={{ marginTop: 10, fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>
              Original Leaf Specimen
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
              Uploaded Input Specimen
            </div>
          </div>
        )}

        {/* Grad-CAM Heatmap Overlay */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            border: '2px solid #7c3aed',
            borderRadius: 12,
            padding: 4,
            display: 'inline-block',
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 14px rgba(124, 58, 237, 0.2)'
          }}>
            <img
              src={gradcamImage}
              alt="Grad-CAM Saliency Overlay"
              style={{
                width: 260,
                height: 260,
                borderRadius: 8,
                objectFit: 'cover',
                display: 'block'
              }}
            />
          </div>
          <div style={{ marginTop: 10, fontSize: '0.88rem', fontWeight: 700, color: '#6d28d9' }}>
            Grad-CAM Heatmap Overlay
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
            Feature Activation Overlay (50% Jet Colormap)
          </div>
        </div>
      </div>

      {/* Heatmap Legend */}
      <div style={{ padding: 16, backgroundColor: '#f5f3ff', borderRadius: 10, border: '1px solid #ddd6fe' }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#5b21b6', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Eye size={16} color="#7c3aed" />
          Feature Saliency Interpretation:
        </div>
        <div style={{
          height: 12,
          borderRadius: 6,
          background: 'linear-gradient(90deg, #00008f 0%, #0000ff 20%, #00ffff 40%, #ffff00 70%, #ff0000 100%)',
          marginBottom: 8
        }}></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#5b21b6', fontWeight: 600 }}>
          <span>Low Activation (Healthy Foliage / Background)</span>
          <span>Moderate Focus</span>
          <span style={{ color: '#dc2626', fontWeight: 700 }}>Peak Saliency (Infection Lesions)</span>
        </div>
      </div>
    </div>
  );
}
