import React from 'react';
import { BarChart3, HelpCircle } from 'lucide-react';

export default function ShapChart({ shapData, recommendedCrop }) {
  if (!shapData || shapData.length === 0) return null;

  // Max absolute contribution for scaling
  const maxAbs = Math.max(...shapData.map(d => Math.abs(d.contribution)), 0.1);

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          <BarChart3 size={20} color="#1e6b37" />
          SHAP Explainability: Feature Contributions
        </h3>
        <span className="badge badge-success">Local Attribution</span>
      </div>

      <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 18, lineHeight: 1.5 }}>
        This chart visualizes the local feature contributions explaining why <strong>{recommendedCrop}</strong> was recommended based on your soil and climatic parameters.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {shapData.map((item, idx) => {
          const isPositive = item.contribution >= 0;
          const pct = (Math.abs(item.contribution) / maxAbs) * 100;
          const barColor = isPositive ? '#16a34a' : '#d97706';

          return (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '130px 100px 1fr 70px', alignItems: 'center', gap: 12, fontSize: '0.85rem' }}>
              <div style={{ fontWeight: 600, color: '#334155' }}>
                {item.feature}
              </div>

              <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                Value: <strong style={{ color: '#0f172a' }}>{item.value}</strong>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', height: 20 }}>
                <div style={{
                  height: 14,
                  width: `${Math.max(4, pct)}%`,
                  backgroundColor: barColor,
                  borderRadius: 4,
                  transition: 'width 0.3s ease'
                }}></div>
              </div>

              <div style={{ textAlign: 'right', fontWeight: 700, color: barColor, fontSize: '0.8rem' }}>
                {isPositive ? `+${item.contribution}` : item.contribution}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 18, paddingTop: 12, borderTop: '1px solid #e2e8f0', display: 'flex', gap: 16, fontSize: '0.78rem', color: '#64748b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 12, height: 12, backgroundColor: '#16a34a', borderRadius: 3 }}></span>
          <span>Positive Driver (Supports Crop Growth)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 12, height: 12, backgroundColor: '#d97706', borderRadius: 3 }}></span>
          <span>Limiting Factor / Sub-optimal Deviation</span>
        </div>
      </div>
    </div>
  );
}
