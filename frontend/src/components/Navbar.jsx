import React, { useEffect, useState } from 'react';
import { Sprout, Activity, FileSpreadsheet, ShieldAlert, Cpu } from 'lucide-react';
import { checkSystemHealth } from '../services/api';

export default function Navbar({ activeTab, setActiveTab }) {
  const [health, setHealth] = useState({ backend: 'checking', ml: 'checking' });

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const data = await checkSystemHealth();
        setHealth({
          backend: data.status === 'healthy' ? 'online' : 'error',
          ml: data.ml_service?.status === 'healthy' ? 'online' : 'ready'
        });
      } catch (err) {
        setHealth({ backend: 'ready', ml: 'ready' });
      }
    };
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 72
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 10,
            backgroundColor: '#1e6b37',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff'
          }}>
            <Sprout size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.2, color: '#0f172a' }}>
              AgroSense <span style={{ color: '#1e6b37' }}>AI</span>
            </h1>
            <p style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>
              Explainable Agricultural Decision Support System
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setActiveTab('pre-sowing')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              borderRadius: 8,
              border: 'none',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              backgroundColor: activeTab === 'pre-sowing' ? '#e8f5e9' : 'transparent',
              color: activeTab === 'pre-sowing' ? '#1e6b37' : '#475569'
            }}
          >
            <Activity size={18} />
            Pre-Sowing Decision
          </button>

          <button
            onClick={() => setActiveTab('post-sowing')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              borderRadius: 8,
              border: 'none',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              backgroundColor: activeTab === 'post-sowing' ? '#fef2f2' : 'transparent',
              color: activeTab === 'post-sowing' ? '#dc2626' : '#475569'
            }}
          >
            <ShieldAlert size={18} />
            Post-Sowing Disease
          </button>

          <button
            onClick={() => setActiveTab('history')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              borderRadius: 8,
              border: 'none',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              backgroundColor: activeTab === 'history' ? '#f1f5f9' : 'transparent',
              color: activeTab === 'history' ? '#0f172a' : '#475569'
            }}
          >
            <FileSpreadsheet size={18} />
            History & Audits
          </button>
        </nav>

        {/* System Status Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '6px 14px',
          backgroundColor: '#f8fafc',
          borderRadius: 20,
          border: '1px solid #e2e8f0',
          fontSize: '0.78rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: health.backend === 'online' ? '#22c55e' : '#f59e0b'
            }}></span>
            <span style={{ color: '#475569', fontWeight: 500 }}>API Gateway</span>
          </div>
          <span style={{ color: '#cbd5e1' }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Cpu size={13} color="#64748b" />
            <span style={{ color: '#475569', fontWeight: 500 }}>ML Engine</span>
          </div>
        </div>
      </div>
    </header>
  );
}
