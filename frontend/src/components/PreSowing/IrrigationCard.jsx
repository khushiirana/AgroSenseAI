import React from 'react';
import { Waves, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

export default function IrrigationCard({ irrigation, recommendedCrop }) {
  if (!irrigation) return null;

  const targetCrop = recommendedCrop || irrigation.crop_evaluated;
  const need = irrigation.predicted_irrigation_need;
  const probs = irrigation.probabilities || {};
  const feasibility = irrigation.feasibility_score;

  const getNeedBadge = () => {
    switch (need) {
      case 'Low':
        return { color: '#15803d', bg: '#dcfce7', label: 'Low Irrigation Requirement (Highly Feasible)' };
      case 'Medium':
        return { color: '#ca8a04', bg: '#fefce8', label: 'Medium Irrigation Requirement (Standard)' };
      case 'High':
      default:
        return { color: '#dc2626', bg: '#fee2e2', label: 'High Irrigation Requirement (Resource Intensive)' };
    }
  };

  const badgeInfo = getNeedBadge();

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          <Waves size={20} color="#0d9488" />
          Field Irrigation Requirement & Feasibility {targetCrop && (
            <span style={{ fontSize: '0.9rem', color: '#0f766e', fontWeight: 600, textTransform: 'capitalize' }}>
              ({targetCrop})
            </span>
          )}
        </h3>
        <span className="badge badge-info">
          {targetCrop ? `${targetCrop.charAt(0).toUpperCase() + targetCrop.slice(1)} RF Pipeline` : 'Random Forest Pipeline'}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            Predicted Water Demand
          </div>
          <div style={{
            display: 'inline-block',
            marginTop: 4,
            padding: '6px 14px',
            backgroundColor: badgeInfo.bg,
            color: badgeInfo.color,
            borderRadius: 8,
            fontWeight: 700,
            fontSize: '1.05rem',
            border: `1px solid ${badgeInfo.color}30`
          }}>
            {need} Water Need
          </div>
        </div>

        <div style={{
          padding: '10px 18px',
          backgroundColor: '#f8fafc',
          borderRadius: 10,
          border: '1px solid #e2e8f0',
          textAlign: 'right'
        }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            Resource Feasibility Score
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>
            {feasibility} <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>/ 100</span>
          </div>
        </div>
      </div>

      {/* Category Probabilities */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: 8 }}>
          Irrigation Level Probabilities:
        </div>
        <div className="grid-3">
          {['Low', 'Medium', 'High'].map((lvl) => (
            <div key={lvl} style={{ padding: 10, backgroundColor: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 4 }}>
                <span style={{ fontWeight: 500, color: '#334155' }}>{lvl}</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{probs[lvl] || 0}%</span>
              </div>
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${probs[lvl] || 0}%`,
                    backgroundColor: lvl === 'Low' ? '#16a34a' : (lvl === 'Medium' ? '#eab308' : '#ef4444')
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Influential field factors */}
      {irrigation.top_features && irrigation.top_features.length > 0 && (
        <div>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: 6 }}>
            Influential Environmental & Soil Features:
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {irrigation.top_features.slice(0, 5).map((f, idx) => (
              <span key={idx} style={{
                padding: '4px 10px',
                backgroundColor: '#f1f5f9',
                borderRadius: 6,
                fontSize: '0.78rem',
                color: '#334155',
                border: '1px solid #e2e8f0'
              }}>
                {f.feature.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
