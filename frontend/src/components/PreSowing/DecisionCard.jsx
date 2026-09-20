import React from 'react';
import { Award, CheckCircle2, Info, Compass } from 'lucide-react';

export default function DecisionCard({ decision }) {
  if (!decision) return null;

  const finalCrop = decision.final_recommended_crop;
  const finalScore = decision.final_suitability_score;
  const explanation = decision.human_readable_explanation;

  return (
    <div className="card" style={{
      border: '2px solid #1e6b37',
      background: 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)',
      boxShadow: '0 4px 12px -2px rgba(30, 107, 55, 0.15)'
    }}>
      <div className="card-header" style={{ borderBottomColor: '#bbf7d0' }}>
        <h2 className="card-title" style={{ color: '#166534' }}>
          <Award size={24} color="#1e6b37" />
          AgroSense Decision Engine Recommendation
        </h2>
        <span className="badge badge-success">Optimized Choice</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Primary Recommended Crop
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#1e6b37', textTransform: 'capitalize', lineHeight: 1.1 }}>
            {finalCrop}
          </div>
        </div>

        <div style={{
          padding: '12px 24px',
          backgroundColor: '#ffffff',
          borderRadius: 12,
          border: '1px solid #bbf7d0',
          boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.05)',
          textAlign: 'right'
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Overall Suitability Score
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e6b37' }}>
            {finalScore} <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>/ 100</span>
          </div>
        </div>
      </div>

      {/* Decision Engine Weighting Formula Badge */}
      <div style={{
        padding: '10px 14px',
        backgroundColor: '#e8f5e9',
        borderRadius: 8,
        border: '1px solid #c8e6c9',
        marginBottom: 16,
        fontSize: '0.82rem',
        color: '#1b5e20',
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }}>
        <Compass size={16} />
        <span>
          <strong>Decision Engine Formulation:</strong> Combined Layer 1 = [Crop ML Prob × 60% + Weather Suitability × 40%]; Final Score = [Layer 1 × 80% + Irrigation Feasibility × 20%]
        </span>
      </div>

      {/* Human-Readable Explanation Box */}
      <div style={{
        padding: 16,
        backgroundColor: '#ffffff',
        borderRadius: 10,
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12
      }}>
        <Info size={20} color="#1e6b37" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
            Why this crop was recommended:
          </div>
          <p style={{ fontSize: '0.92rem', color: '#1e293b', lineHeight: 1.6 }}>
            {explanation}
          </p>
        </div>
      </div>
    </div>
  );
}
