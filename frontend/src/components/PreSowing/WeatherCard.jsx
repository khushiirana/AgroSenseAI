import React from 'react';
import { CloudRain, Thermometer, Droplets, Wind, Compass } from 'lucide-react';

export default function WeatherCard({ weather }) {
  if (!weather) return null;

  const score = weather.general_suitability !== undefined ? weather.general_suitability : 85;
  const scoreColor = score >= 75 ? '#15803d' : (score >= 50 ? '#ca8a04' : '#dc2626');
  const scoreBg = score >= 75 ? '#dcfce7' : (score >= 50 ? '#fefce8' : '#fee2e2');

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          <CloudRain size={20} color="#0284c7" />
          Live Agro-Climatic Weather Analysis
        </h3>
        <span className={`badge ${weather.is_live ? 'badge-success' : 'badge-info'}`}>
          {weather.is_live ? 'Live OpenWeather API' : 'Station Observation'}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
            {weather.location || 'Agro Climatic Zone'}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Condition: <strong style={{ color: '#334155' }}>{weather.weather || 'Normal'}</strong>
          </div>
        </div>

        <div style={{
          padding: '10px 16px',
          backgroundColor: scoreBg,
          borderRadius: 10,
          border: `1px solid ${scoreColor}40`,
          textAlign: 'right'
        }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: scoreColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Weather Suitability
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: scoreColor, lineHeight: 1 }}>
            {score} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>/ 100</span>
          </div>
        </div>
      </div>

      <div className="grid-4">
        <div style={{ padding: 12, backgroundColor: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Thermometer size={22} color="#ea580c" />
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Temperature</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{weather.temperature}°C</div>
          </div>
        </div>

        <div style={{ padding: 12, backgroundColor: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Droplets size={22} color="#0284c7" />
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Humidity</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{weather.humidity}%</div>
          </div>
        </div>

        <div style={{ padding: 12, backgroundColor: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 10 }}>
          <CloudRain size={22} color="#2563eb" />
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Rainfall</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{weather.rainfall} mm</div>
          </div>
        </div>

        <div style={{ padding: 12, backgroundColor: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Wind size={22} color="#0d9488" />
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Wind Speed</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{weather.wind_speed} m/s</div>
          </div>
        </div>
      </div>
    </div>
  );
}
