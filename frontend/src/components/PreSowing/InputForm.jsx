import React, { useState } from 'react';
import { Sliders, CloudSun, MapPin, Sparkles, AlertCircle, FlaskConical, Droplets, Sprout, ArrowRight, Sun, Layers } from 'lucide-react';

const PRESETS = [
  {
    name: 'Rice / Wetland',
    icon: Sprout,
    bgColor: '#d5eeda',
    borderColor: '#98d9a7',
    textColor: '#145229',
    values: { N: 90, P: 42, K: 43, ph: 6.5, soil_type: 'Loamy', season: 'Kharif', soil_moisture: 45, city: 'Chennai' }
  },
  {
    name: 'Wheat / Dry Rabi',
    icon: Sun,
    bgColor: '#fce5c0',
    borderColor: '#f3c078',
    textColor: '#7a3600',
    values: { N: 60, P: 55, K: 40, ph: 6.8, soil_type: 'Clayey', season: 'Rabi', soil_moisture: 30, city: 'Punjab' }
  },
  {
    name: 'Cotton / Black Soil',
    icon: Layers,
    bgColor: '#e2e8f0',
    borderColor: '#cbd5e1',
    textColor: '#1e293b',
    values: { N: 110, P: 45, K: 50, ph: 7.2, soil_type: 'Black', season: 'Kharif', soil_moisture: 25, city: 'Nagpur' }
  }
];

export default function InputForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    N: '', P: '', K: '', ph: '',
    Soil_Type: '', Season: '', Irrigation_Type: '', Soil_Moisture: '',
    city: '', useLiveWeather: true,
    manual_temperature: '', manual_humidity: '', manual_rainfall: ''
  });
  const [validationError, setValidationError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValidationError('');
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const applyPreset = (preset) => {
    setValidationError('');
    setFormData(prev => ({
      ...prev,
      N: preset.values.N, P: preset.values.P, K: preset.values.K, ph: preset.values.ph,
      Soil_Type: preset.values.soil_type, Season: preset.values.season,
      Irrigation_Type: 'Drip', Soil_Moisture: preset.values.soil_moisture, city: preset.values.city
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');
    if (formData.N === '' || isNaN(formData.N)) { setValidationError('Please enter Nitrogen (N) value'); return; }
    if (formData.P === '' || isNaN(formData.P)) { setValidationError('Please enter Phosphorus (P) value'); return; }
    if (formData.K === '' || isNaN(formData.K)) { setValidationError('Please enter Potassium (K) value'); return; }
    if (formData.ph === '' || isNaN(formData.ph)) { setValidationError('Please enter Soil pH value'); return; }
    if (!formData.Soil_Type) { setValidationError('Please select Soil Type'); return; }
    if (!formData.Season) { setValidationError('Please select Cropping Season'); return; }
    if (!formData.Irrigation_Type) { setValidationError('Please select Irrigation System'); return; }
    if (formData.Soil_Moisture === '' || isNaN(formData.Soil_Moisture)) { setValidationError('Please enter Soil Moisture percentage'); return; }
    if (formData.useLiveWeather) {
      if (!formData.city || !formData.city.trim()) { setValidationError('Please enter an Agricultural Region or City for live weather analysis'); return; }
    } else {
      if (formData.manual_temperature === '' || isNaN(formData.manual_temperature)) { setValidationError('Please enter Temperature value'); return; }
      if (formData.manual_humidity === '' || isNaN(formData.manual_humidity)) { setValidationError('Please enter Humidity value'); return; }
      if (formData.manual_rainfall === '' || isNaN(formData.manual_rainfall)) { setValidationError('Please enter Rainfall value'); return; }
    }
    const payload = {
      N: parseFloat(formData.N), P: parseFloat(formData.P), K: parseFloat(formData.K), ph: parseFloat(formData.ph),
      Soil_Type: formData.Soil_Type, Season: formData.Season, Irrigation_Type: formData.Irrigation_Type,
      Soil_Moisture: parseFloat(formData.Soil_Moisture)
    };
    if (formData.useLiveWeather) {
      payload.city = formData.city.trim();
    } else {
      payload.temperature = parseFloat(formData.manual_temperature);
      payload.humidity = parseFloat(formData.manual_humidity);
      payload.rainfall = parseFloat(formData.manual_rainfall);
    }
    onSubmit(payload);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Presets Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 20px',
        background: 'linear-gradient(135deg, #e3f2e6 0%, #d8ebd9 100%)',
        borderRadius: 14,
        border: '1px solid #b4ddb9',
        boxShadow: '0 2px 5px rgba(30, 110, 60, 0.08)',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.82rem', fontWeight: 800, color: '#124d28', textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: 4 }}>
          <Sparkles size={16} color="#1e6e3c" />
          Quick Demo Presets:
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {PRESETS.map((p, idx) => {
            const IconComp = p.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(p)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '7px 16px',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  borderRadius: 9,
                  backgroundColor: p.bgColor,
                  border: `1px solid ${p.borderColor}`,
                  color: p.textColor,
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)';
                }}
              >
                <IconComp size={15} />
                {p.name}
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        {/* Section 1: Soil Nutrients */}
        <div style={{
          background: 'linear-gradient(180deg, #e5f3e7 0%, #edf7ef 100%)',
          border: '1px solid #b6e0be',
          borderLeft: '6px solid #1e6e3c',
          borderRadius: 14,
          padding: '24px 26px',
          boxShadow: '0 3px 8px rgba(30, 110, 60, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: '#1e6e3c',
                color: '#ffffff',
                fontSize: '0.88rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 2px 4px rgba(30,110,60,0.25)'
              }}>
                1
              </span>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: '#c6e9cd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FlaskConical size={18} color="#1e6e3c" />
              </div>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0d3a1e' }}>
                  Soil Chemical & Nutrient Profile
                </div>
                <div style={{ fontSize: '0.78rem', color: '#2b663e', fontWeight: 600 }}>
                  Soil test parameters (NPK & pH laboratory values)
                </div>
              </div>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: 6, backgroundColor: '#c6e9cd', color: '#0d3a1e', border: '1px solid #99d6a5' }}>
              Soil Nutrients
            </span>
          </div>

          <div className="grid-4">
            <div className="form-group">
              <label className="form-label" style={{ color: '#0d3a1e', fontWeight: 700 }}>Nitrogen (N) [kg/ha]</label>
              <input type="number" name="N" value={formData.N} onChange={handleChange} min="0" max="200" step="1" placeholder="e.g. 90" className="form-input" style={{ backgroundColor: '#ffffff', borderColor: '#a3d9ae', color: '#0d3a1e', fontWeight: 600 }} />
              <span className="form-helper" style={{ color: '#2b663e', fontWeight: 500 }}>Range: 0–140</span>
            </div>
            <div className="form-group">
              <label className="form-label" style={{ color: '#0d3a1e', fontWeight: 700 }}>Phosphorus (P) [kg/ha]</label>
              <input type="number" name="P" value={formData.P} onChange={handleChange} min="0" max="200" step="1" placeholder="e.g. 42" className="form-input" style={{ backgroundColor: '#ffffff', borderColor: '#a3d9ae', color: '#0d3a1e', fontWeight: 600 }} />
              <span className="form-helper" style={{ color: '#2b663e', fontWeight: 500 }}>Range: 5–145</span>
            </div>
            <div className="form-group">
              <label className="form-label" style={{ color: '#0d3a1e', fontWeight: 700 }}>Potassium (K) [kg/ha]</label>
              <input type="number" name="K" value={formData.K} onChange={handleChange} min="0" max="250" step="1" placeholder="e.g. 43" className="form-input" style={{ backgroundColor: '#ffffff', borderColor: '#a3d9ae', color: '#0d3a1e', fontWeight: 600 }} />
              <span className="form-helper" style={{ color: '#2b663e', fontWeight: 500 }}>Range: 5–205</span>
            </div>
            <div className="form-group">
              <label className="form-label" style={{ color: '#0d3a1e', fontWeight: 700 }}>Soil pH Level</label>
              <input type="number" name="ph" value={formData.ph} onChange={handleChange} min="3.5" max="10.0" step="0.1" placeholder="e.g. 6.5" className="form-input" style={{ backgroundColor: '#ffffff', borderColor: '#a3d9ae', color: '#0d3a1e', fontWeight: 600 }} />
              <span className="form-helper" style={{ color: '#2b663e', fontWeight: 500 }}>Neutral: 6.0–7.5</span>
            </div>
          </div>
        </div>

        {/* Section 2: Field Characteristics */}
        <div style={{
          background: 'linear-gradient(180deg, #faf0df 0%, #fdf6ea 100%)',
          border: '1px solid #f3d4a6',
          borderLeft: '6px solid #d97706',
          borderRadius: 14,
          padding: '24px 26px',
          boxShadow: '0 3px 8px rgba(217, 119, 6, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: '#d97706',
                color: '#ffffff',
                fontSize: '0.88rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 2px 4px rgba(217,119,6,0.25)'
              }}>
                2
              </span>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: '#fde68a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sliders size={18} color="#b45309" />
              </div>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#5c2406' }}>
                  Field Characteristics & Irrigation Setup
                </div>
                <div style={{ fontSize: '0.78rem', color: '#78350f', fontWeight: 600 }}>
                  Soil texture, cropping season, and water availability
                </div>
              </div>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: 6, backgroundColor: '#fde68a', color: '#5c2406', border: '1px solid #f59e0b' }}>
              Agronomic Setup
            </span>
          </div>

          <div className="grid-4">
            <div className="form-group">
              <label className="form-label" style={{ color: '#5c2406', fontWeight: 700 }}>Soil Type</label>
              <select name="Soil_Type" value={formData.Soil_Type} onChange={handleChange} className="form-select" style={{ backgroundColor: '#ffffff', borderColor: '#f3c280', color: '#451a03', fontWeight: 600 }}>
                <option value="">Select Soil Type</option>
                <option value="Loamy">Loamy Soil</option>
                <option value="Clayey">Clayey Soil</option>
                <option value="Sandy">Sandy Soil</option>
                <option value="Black">Black Soil</option>
                <option value="Alluvial">Alluvial Soil</option>
                <option value="Red">Red Soil</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" style={{ color: '#5c2406', fontWeight: 700 }}>Cropping Season</label>
              <select name="Season" value={formData.Season} onChange={handleChange} className="form-select" style={{ backgroundColor: '#ffffff', borderColor: '#f3c280', color: '#451a03', fontWeight: 600 }}>
                <option value="">Select Season</option>
                <option value="Kharif">Kharif (Monsoon)</option>
                <option value="Rabi">Rabi (Winter)</option>
                <option value="Zaid">Zaid (Summer)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" style={{ color: '#5c2406', fontWeight: 700 }}>Irrigation System</label>
              <select name="Irrigation_Type" value={formData.Irrigation_Type} onChange={handleChange} className="form-select" style={{ backgroundColor: '#ffffff', borderColor: '#f3c280', color: '#451a03', fontWeight: 600 }}>
                <option value="">Select System</option>
                <option value="Drip">Drip Irrigation</option>
                <option value="Sprinkler">Sprinkler</option>
                <option value="Flood">Surface / Flood</option>
                <option value="Furrow">Furrow Irrigation</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" style={{ color: '#5c2406', fontWeight: 700 }}>Soil Moisture [%]</label>
              <input type="number" name="Soil_Moisture" value={formData.Soil_Moisture} onChange={handleChange} min="0" max="100" step="1" placeholder="e.g. 40" className="form-input" style={{ backgroundColor: '#ffffff', borderColor: '#f3c280', color: '#451a03', fontWeight: 600 }} />
              <span className="form-helper" style={{ color: '#78350f', fontWeight: 500 }}>Optimal: 30–60%</span>
            </div>
          </div>
        </div>

        {/* Section 3: Weather Source */}
        <div style={{
          background: 'linear-gradient(180deg, #e3f0fb 0%, #eef6fc 100%)',
          border: '1px solid #b3d7f2',
          borderLeft: '6px solid #165b8c',
          borderRadius: 14,
          padding: '24px 26px',
          boxShadow: '0 3px 8px rgba(22, 91, 140, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: '#165b8c',
                color: '#ffffff',
                fontSize: '0.88rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 2px 4px rgba(22,91,140,0.25)'
              }}>
                3
              </span>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: '#c2e0f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CloudSun size={18} color="#165b8c" />
              </div>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0e3857' }}>
                  Agro-Climatic Weather Source
                </div>
                <div style={{ fontSize: '0.78rem', color: '#1d6fa4', fontWeight: 600 }}>
                  Live OpenWeather geocoding API or manual inputs
                </div>
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', cursor: 'pointer', fontWeight: 700, color: '#0e3857', backgroundColor: '#c2e0f8', padding: '7px 16px', borderRadius: 8, border: '1px solid #165b8c' }}>
              <input type="checkbox" name="useLiveWeather" checked={formData.useLiveWeather} onChange={handleChange} style={{ accentColor: '#165b8c', width: 17, height: 17 }} />
              Fetch Live Weather via OpenWeather API
            </label>
          </div>

          {formData.useLiveWeather ? (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ color: '#0e3857', fontWeight: 700 }}>Agricultural Region / District City</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={18} style={{ position: 'absolute', left: 12, top: 12, color: '#165b8c' }} />
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. Chennai, Pune, Ludhiana, Coimbatore"
                  className="form-input"
                  style={{ paddingLeft: 38, backgroundColor: '#ffffff', borderColor: '#94c8ee', color: '#08283e', fontWeight: 600 }}
                />
              </div>
              <span className="form-helper" style={{ color: '#1d6fa4', fontWeight: 500 }}>Weather API resolves live temperature, humidity, rainfall, and wind speed.</span>
            </div>
          ) : (
            <div className="grid-3">
              <div className="form-group">
                <label className="form-label" style={{ color: '#0e3857', fontWeight: 700 }}>Temperature (°C)</label>
                <input type="number" name="manual_temperature" value={formData.manual_temperature} onChange={handleChange} step="0.5" placeholder="e.g. 28.5" className="form-input" style={{ backgroundColor: '#ffffff', borderColor: '#94c8ee', color: '#08283e', fontWeight: 600 }} />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ color: '#0e3857', fontWeight: 700 }}>Humidity (%)</label>
                <input type="number" name="manual_humidity" value={formData.manual_humidity} onChange={handleChange} step="1" placeholder="e.g. 68" className="form-input" style={{ backgroundColor: '#ffffff', borderColor: '#94c8ee', color: '#08283e', fontWeight: 600 }} />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ color: '#0e3857', fontWeight: 700 }}>Rainfall (mm)</label>
                <input type="number" name="manual_rainfall" value={formData.manual_rainfall} onChange={handleChange} step="1" placeholder="e.g. 50" className="form-input" style={{ backgroundColor: '#ffffff', borderColor: '#94c8ee', color: '#08283e', fontWeight: 600 }} />
              </div>
            </div>
          )}
        </div>

        {/* Validation Error */}
        {validationError && (
          <div className="callout callout-warning">
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontWeight: 700 }}>{validationError}</span>
          </div>
        )}

        {/* Submit Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              minWidth: 280,
              padding: '15px 36px',
              fontSize: '1.05rem',
              fontWeight: 800,
              color: '#ffffff',
              background: 'linear-gradient(135deg, #185a33 0%, #0d381e 100%)',
              border: '1px solid #16542f',
              borderRadius: 12,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.75 : 1,
              boxShadow: '0 4px 16px rgba(24, 90, 51, 0.4)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 22px rgba(24, 90, 51, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(24, 90, 51, 0.4)';
              }
            }}
          >
            {loading ? (
              <>Evaluating Multi-Factor Decision...</>
            ) : (
              <>
                Run Decision Engine
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

