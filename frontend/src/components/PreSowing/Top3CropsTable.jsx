import React from 'react';
import { ListOrdered } from 'lucide-react';

export default function Top3CropsTable({ crops }) {
  if (!crops || crops.length === 0) return null;

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          <ListOrdered size={20} color="#1e6b37" />
          Top-3 Crop Candidates Multi-Factor Comparison
        </h3>
        <span className="badge badge-accent">Ranked Evaluation</span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 70 }}>Rank</th>
              <th>Crop Candidate</th>
              <th>ML Model Prob</th>
              <th>Weather Score</th>
              <th>Irrigation Need</th>
              <th>Irrigation Feasibility</th>
              <th>Final Combined Score</th>
              <th style={{ width: 140 }}>Relative Match</th>
            </tr>
          </thead>
          <tbody>
            {crops.map((c, idx) => {
              const isWinner = idx === 0;
              const need = c.irrigation_need || 'Medium';
              const needStyle = need === 'Low'
                ? { bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' }
                : need === 'High'
                  ? { bg: '#fee2e2', color: '#b91c1c', border: '#fecaca' }
                  : { bg: '#fef9c3', color: '#854d0e', border: '#fef08a' };

              return (
                <tr key={idx} style={{ backgroundColor: isWinner ? '#f0fdf4' : 'transparent' }}>
                  <td>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      backgroundColor: isWinner ? '#1e6b37' : '#e2e8f0',
                      color: isWinner ? '#ffffff' : '#475569',
                      fontWeight: 700,
                      fontSize: '0.82rem'
                    }}>
                      {idx + 1}
                    </span>
                  </td>
                  <td>
                    <strong style={{ fontSize: '1rem', color: isWinner ? '#166534' : '#0f172a', textTransform: 'capitalize' }}>
                      {c.crop}
                    </strong>
                    {isWinner && (
                      <span className="badge badge-success" style={{ marginLeft: 8, fontSize: '0.68rem', padding: '2px 8px' }}>
                        Selected
                      </span>
                    )}
                  </td>
                  <td style={{ fontWeight: 600 }}>{c.crop_probability}%</td>
                  <td style={{ fontWeight: 600, color: '#0284c7' }}>{c.weather_score} / 100</td>
                  <td>
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 9px',
                      borderRadius: 6,
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      backgroundColor: needStyle.bg,
                      color: needStyle.color,
                      border: `1px solid ${needStyle.border}`
                    }}>
                      {need}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: '#ca8a04' }}>{c.irrigation_score} / 100</td>
                  <td>
                    <strong style={{ fontSize: '1.05rem', color: isWinner ? '#1e6b37' : '#0f172a' }}>
                      {c.final_score}
                    </strong>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}> / 100</span>
                  </td>
                  <td>
                    <div className="progress-bar-bg">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${Math.min(100, Math.max(10, c.final_score))}%`,
                          backgroundColor: isWinner ? '#1e6b37' : '#94a3b8'
                        }}
                      ></div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
