import React, { useEffect, useState } from 'react';
import { FileSpreadsheet, RefreshCw, Clock, ShieldAlert, Trash2 } from 'lucide-react';
import {
  getRecommendationHistory,
  getDiseaseHistory,
  deleteRecommendationHistory,
  deleteDiseaseHistory
} from '../../services/api';

export default function HistoryView() {
  const [activeSubTab, setActiveSubTab] = useState('presowing');
  const [recommendations, setRecommendations] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const [recRes, disRes] = await Promise.all([
        getRecommendationHistory(),
        getDiseaseHistory()
      ]);
      setRecommendations(recRes.data || []);
      setDiseases(disRes.data || []);
    } catch (err) {
      console.warn('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDeleteRecommendation = async (id) => {
    if (!id) return;
    const confirmed = window.confirm('Are you sure you want to delete this pre-sowing recommendation record?');
    if (!confirmed) return;

    setDeletingId(id);
    try {
      await deleteRecommendationHistory(id);
      // Immediately refresh/update the list
      setRecommendations(prev => prev.filter(r => (r._id || r.id) !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete record.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteDisease = async (id) => {
    if (!id) return;
    const confirmed = window.confirm('Are you sure you want to delete this post-sowing pathology record?');
    if (!confirmed) return;

    setDeletingId(id);
    try {
      await deleteDiseaseHistory(id);
      // Immediately refresh/update the list
      setDiseases(prev => prev.filter(d => (d._id || d.id) !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete record.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>
            System Audit & Recommendation History
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Persistent session log of multi-factor decisions and leaf disease diagnoses.
          </p>
        </div>

        <button onClick={fetchHistory} className="btn btn-outline" disabled={loading}>
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, borderBottom: '1px solid #e2e8f0', paddingBottom: 8 }}>
        <button
          onClick={() => setActiveSubTab('presowing')}
          style={{
            padding: '8px 16px',
            borderRadius: 6,
            border: 'none',
            fontSize: '0.88rem',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: activeSubTab === 'presowing' ? '#e8f5e9' : 'transparent',
            color: activeSubTab === 'presowing' ? '#1e6b37' : '#64748b'
          }}
        >
          Pre-Sowing Decision History ({recommendations.length})
        </button>

        <button
          onClick={() => setActiveSubTab('disease')}
          style={{
            padding: '8px 16px',
            borderRadius: 6,
            border: 'none',
            fontSize: '0.88rem',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: activeSubTab === 'disease' ? '#fee2e2' : 'transparent',
            color: activeSubTab === 'disease' ? '#dc2626' : '#64748b'
          }}
        >
          Post-Sowing Pathology History ({diseases.length})
        </button>
      </div>

      {/* Content */}
      {activeSubTab === 'presowing' ? (
        <div className="card">
          {recommendations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
              <Clock size={36} style={{ margin: '0 auto 8px auto', opacity: 0.5 }} />
              <div>No pre-sowing decisions evaluated yet.</div>
              <div style={{ fontSize: '0.8rem', marginTop: 4 }}>Run the Decision Engine on the Pre-Sowing tab.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {recommendations.map((item, idx) => {
                const itemId = item._id || item.id;
                return (
                  <div key={itemId || idx} style={{
                    padding: 16,
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#f8fafc',
                    transition: 'all 0.2s ease'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span className="badge badge-success">Decision</span>
                        <strong style={{ fontSize: '1.1rem', color: '#166534', textTransform: 'capitalize' }}>
                          {item.recommended_crop}
                        </strong>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          {new Date(item.timestamp).toLocaleString()}
                        </span>
                        <button
                          onClick={() => handleDeleteRecommendation(itemId)}
                          disabled={deletingId === itemId}
                          title="Delete this record"
                          style={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #fecaca',
                            borderRadius: 6,
                            color: '#dc2626',
                            padding: '4px 10px',
                            fontSize: '0.78rem',
                            fontWeight: 500,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fef2f2'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; }}
                        >
                          <Trash2 size={13} />
                          {deletingId === itemId ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: '#334155', marginBottom: 10 }}>
                      {item.human_readable_explanation}
                    </p>

                    <div style={{ display: 'flex', gap: 16, fontSize: '0.78rem', color: '#64748b', flexWrap: 'wrap' }}>
                      <span>Suitability: <strong>{item.final_suitability_score}/100</strong></span>
                      {item.irrigation_need && <span>Irrigation: <strong>{item.irrigation_need}</strong></span>}
                      {item.weather_summary?.location && <span>Location: <strong>{item.weather_summary.location}</strong></span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="card">
          {diseases.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
              <ShieldAlert size={36} style={{ margin: '0 auto 8px auto', opacity: 0.5 }} />
              <div>No disease pathology diagnoses recorded yet.</div>
              <div style={{ fontSize: '0.8rem', marginTop: 4 }}>Upload a leaf image on the Post-Sowing tab.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {diseases.map((item, idx) => {
                const itemId = item._id || item.id;
                return (
                  <div key={itemId || idx} style={{
                    padding: 16,
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#f8fafc',
                    transition: 'all 0.2s ease'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span className="badge badge-danger">Pathology</span>
                        <strong style={{ fontSize: '1.05rem', color: '#991b1b' }}>
                          {item.display_name || item.predicted_disease}
                        </strong>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>
                          ({item.confidence}%)
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          {new Date(item.timestamp).toLocaleString()}
                        </span>
                        <button
                          onClick={() => handleDeleteDisease(itemId)}
                          disabled={deletingId === itemId}
                          title="Delete this record"
                          style={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #fecaca',
                            borderRadius: 6,
                            color: '#dc2626',
                            padding: '4px 10px',
                            fontSize: '0.78rem',
                            fontWeight: 500,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fef2f2'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; }}
                        >
                          <Trash2 size={13} />
                          {deletingId === itemId ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: '#334155' }}>
                      {item.health_guidance}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
