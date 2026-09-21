import React, { useEffect, useState } from 'react';
import { Sprout, Activity, ShieldAlert, FileSpreadsheet, Cpu } from 'lucide-react';
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

  const tabs = [
    { id: 'pre-sowing', label: 'Pre-Sowing Decision', icon: Activity },
    { id: 'post-sowing', label: 'Post-Sowing Disease', icon: ShieldAlert },
    { id: 'history', label: 'History & Audits', icon: FileSpreadsheet },
  ];

  return (
    <header style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #dde8d8',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 64
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #2d7a4f 0%, #1a5c38 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(45,122,79,0.25)'
          }}>
            <Sprout size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1a2e1a', lineHeight: 1.2 }}>
              AgroSense <span style={{ color: '#2d7a4f' }}>AI</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: '#7a9e8a', fontWeight: 500, letterSpacing: '0.02em' }}>
              Explainable Agricultural Decision Support
            </div>
          </div>
        </div>

        {/* Tabs */}
        <nav style={{ display: 'flex', gap: 4 }}>
          {tabs.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 14px',
                  borderRadius: 8,
                  border: 'none',
                  fontSize: '0.83rem',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  background: isActive ? '#e8f5e9' : 'transparent',
                  color: isActive ? '#2d7a4f' : '#4b6358',
                  boxShadow: isActive ? 'inset 0 0 0 1px #c8e6c9' : 'none'
                }}
              >
                <Icon size={15} />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '6px 12px',
          background: '#f7f9f4',
          borderRadius: 20,
          border: '1px solid #dde8d8',
          fontSize: '0.72rem',
          fontWeight: 500,
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%', display: 'block',
              backgroundColor: health.backend === 'online' ? '#2d7a4f' : '#f59e0b'
            }} />
            <span style={{ color: '#4b6358' }}>API Gateway</span>
          </div>
          <span style={{ color: '#dde8d8' }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Cpu size={11} color="#7a9e8a" />
            <span style={{ color: '#4b6358' }}>ML Engine</span>
          </div>
        </div>
      </div>
    </header>
  );
}
