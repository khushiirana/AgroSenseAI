import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';

export default function DiseaseResult({ result }) {
  if (!result) return null;

  const isHealthy = result.predicted_disease.toLowerCase().includes('healthy');
  const badgeClass = isHealthy ? 'badge-success' : 'badge-danger';

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          {isHealthy ? <ShieldCheck size={20} color="#15803d" /> : <ShieldAlert size={20} color="#dc2626" />}
          Diagnostic Pathology Report
        </h3>
        <span className={`badge ${badgeClass}`}>
          {isHealthy ? 'Specimen Healthy' : 'Infection Detected'}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Primary Classified Condition
          </div>
          <div style={{
            fontSize: '1.8rem',
            fontWeight: 800,
            color: isHealthy ? '#166534' : '#991b1b',
            lineHeight: 1.2
          }}>
            {result.display_name || result.predicted_disease}
          </div>
        </div>

        <div style={{
          padding: '12px 20px',
          backgroundColor: isHealthy ? '#f0fdf4' : '#fef2f2',
          borderRadius: 10,
          border: `1px solid ${isHealthy ? '#bbf7d0' : '#fecaca'}`,
          textAlign: 'right'
        }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Diagnostic Confidence
          </div>
          <div style={{
            fontSize: '1.8rem',
            fontWeight: 800,
            color: isHealthy ? '#166534' : '#b91c1c'
          }}>
            {result.confidence}%
          </div>
        </div>
      </div>

      {/* Top 3 Breakdown */}
      {result.top_3 && result.top_3.length > 0 && (
        <div style={{ marginBottom: 4 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: 10 }}>
            Top Candidate Pathogens Evaluated:
          </div>
          <div className="grid-3">
            {result.top_3.map((c, idx) => {
              const cleanName = c.disease.replace(/___/g, ' - ').replace(/_/g, ' ');
              const isTop = idx === 0;
              return (
                <div key={idx} style={{
                  padding: '14px 16px',
                  backgroundColor: '#f8fafc',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 10
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      backgroundColor: isTop ? (isHealthy ? '#166534' : '#dc2626') : '#94a3b8',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {idx + 1}
                    </span>
                    <strong style={{ fontSize: '1rem', color: isTop ? (isHealthy ? '#166534' : '#b91c1c') : '#475569' }}>
                      {c.confidence}%
                    </strong>
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a', lineHeight: 1.3 }}>
                    {cleanName}
                  </div>
                  <div className="progress-bar-bg">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${Math.min(100, Math.max(5, c.confidence))}%`,
                        backgroundColor: isTop ? (isHealthy ? '#2d7a4f' : '#dc2626') : '#94a3b8'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
