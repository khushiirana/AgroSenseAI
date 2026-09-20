import React from 'react';
import { Eye, Layers } from 'lucide-react';

export default function GradCamViewer({ gradcamImage, originalPreview }) {
  if (!gradcamImage) return null;

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          <Layers size={20} color="#7c3aed" />
          Grad-CAM Explainability: Convolutional Activation Map
        </h3>
        <span className="badge badge-accent">Layer: conv2d_2</span>
      </div>

      <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 18, lineHeight: 1.5 }}>
        Gradient-weighted Class Activation Mapping (Grad-CAM) visualizes the spatial regions in the leaf specimen that drove the CNN’s diagnostic decision.
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        {/* Grad-CAM Overlay */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            border: '2px solid #7c3aed',
            borderRadius: 12,
            padding: 4,
            display: 'inline-block',
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 10px -2px rgba(124, 58, 237, 0.15)'
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
          <div style={{ marginTop: 8, fontSize: '0.85rem', fontWeight: 600, color: '#4b5563' }}>
            Grad-CAM Heatmap Overlay
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
            Blended with 50% Jet Colormap
          </div>
        </div>
      </div>

      {/* Heatmap Legend */}
      <div style={{ marginTop: 24, padding: 14, backgroundColor: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Eye size={15} color="#7c3aed" />
          Feature Saliency Interpretation:
        </div>
        <div style={{
          height: 12,
          borderRadius: 6,
          background: 'linear-gradient(90deg, #00008f 0%, #0000ff 20%, #00ffff 40%, #ffff00 70%, #ff0000 100%)',
          marginBottom: 6
        }}></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
          <span>Low Activation (Healthy Foliage / Background)</span>
          <span>Moderate Focus</span>
          <span style={{ fontWeight: 600, color: '#dc2626' }}>Peak Saliency (Infection Lesions)</span>
        </div>
      </div>
    </div>
  );
}
