import React from 'react';
import { HeartPulse, Stethoscope, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function HealthGuidance({ guidance, diseaseName }) {
  if (!guidance) return null;

  const isHealthy = diseaseName?.toLowerCase().includes('healthy');

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          {isHealthy ? <ShieldCheck size={20} color="#15803d" /> : <HeartPulse size={20} color="#ea580c" />}
          Agronomic Health Guidance & Action Plan
        </h3>
        <span className="badge badge-info">Knowledge Advisory Layer</span>
      </div>

      <div style={{
        padding: 18,
        backgroundColor: isHealthy ? '#f0fdf4' : '#fffbeb',
        borderRadius: 10,
        border: `1px solid ${isHealthy ? '#bbf7d0' : '#fef3c7'}`,
        marginBottom: 18
      }}>
        <div style={{
          fontSize: '0.85rem',
          fontWeight: 700,
          color: isHealthy ? '#166534' : '#92400e',
          marginBottom: 6,
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          <Stethoscope size={18} />
          Recommended Actionable Agronomic Measures:
        </div>
        <p style={{ fontSize: '0.95rem', color: isHealthy ? '#14532d' : '#78350f', lineHeight: 1.6 }}>
          {guidance}
        </p>
      </div>

      <div className="grid-2">
        <div style={{ padding: 14, backgroundColor: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
            Preventative Cultural Practices:
          </div>
          <ul style={{ fontSize: '0.82rem', color: '#64748b', paddingLeft: 18, lineHeight: 1.6 }}>
            <li>Maintain recommended row and plant spacing for ventilation.</li>
            <li>Avoid overhead irrigation during humid hours to reduce leaf wetness.</li>
            <li>Sanitize pruning shears and farming implements between rows.</li>
          </ul>
        </div>

        <div style={{ padding: 14, backgroundColor: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
            Monitoring & Scouting Guidelines:
          </div>
          <ul style={{ fontSize: '0.82rem', color: '#64748b', paddingLeft: 18, lineHeight: 1.6 }}>
            <li>Scout fields bi-weekly, inspecting lower and inner leaf canopies.</li>
            <li>Quarantine severely affected specimens to prevent aerial spore spread.</li>
            <li>Verify symptoms with local Krishi Vigyan Kendra (KVK) extension staff.</li>
          </ul>
        </div>
      </div>

      {/* College Project Disclaimer */}
      <div style={{
        marginTop: 18,
        padding: '10px 14px',
        backgroundColor: '#f1f5f9',
        borderRadius: 6,
        fontSize: '0.75rem',
        color: '#64748b',
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }}>
        <AlertTriangle size={14} color="#64748b" style={{ flexShrink: 0 }} />
        <span>
          <strong>Academic Decision Support Disclaimer:</strong> This system is designed as an educational and advisory prototype for an MCA dissertation. Recommendations should be validated by certified agronomists before applying chemical fungicides.
        </span>
      </div>
    </div>
  );
}
