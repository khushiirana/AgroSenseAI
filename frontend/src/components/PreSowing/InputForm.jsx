import React, { useState } from 'react';
import { Sliders, CloudSun, MapPin, Sparkles, AlertCircle } from 'lucide-react';

const PRESETS = [
  {
    name: 'Rice / Wetland Preset',
    values: { N: 90, P: 42, K: 43, ph: 6.5, soil_type: 'Loamy', season: 'Kharif', soil_moisture: 45, city: 'Chennai' }
  },
  {
    name: 'Wheat / Dry Rabi Preset',
    values: { N: 60, P: 55, K: 40, ph: 6.8, soil_type: 'Clayey', season: 'Rabi', soil_moisture: 30, city: 'Punjab' }
  },
  {
    name: 'Cotton / Black Soil Preset',
    values: { N: 110, P: 45, K: 50, ph: 7.2, soil_type: 'Black', season: 'Kharif', soil_moisture: 25, city: 'Nagpur' }
  }
];

export default function InputForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    N: '',
    P: '',
    K: '',
    ph: '',
    Soil_Type: '',
    Season: '',
    Irrigation_Type: '',
    Soil_Moisture: '',
    city: '',
    useLiveWeather: true,
    manual_temperature: '',
    manual_humidity: '',
    manual_rainfall: ''
  });

  const [validationError, setValidationError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValidationError('');
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const applyPreset = (preset) => {
    setValidationError('');
    setFormData(prev => ({
      ...prev,
      N: preset.values.N,
      P: preset.values.P,
      K: preset.values.K,
      ph: preset.values.ph,
      Soil_Type: preset.values.soil_type,
      Season: preset.values.season,
      Irrigation_Type: 'Drip',
      Soil_Moisture: preset.values.soil_moisture,
      city: preset.values.city
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    // Clear, user-friendly field-by-field validation
    if (formData.N === '' || isNaN(formData.N)) {
      setValidationError('Please enter Nitrogen (N) value');
      return;
    }
    if (formData.P === '' || isNaN(formData.P)) {
      setValidationError('Please enter Phosphorus (P) value');
      return;
    }
    if (formData.K === '' || isNaN(formData.K)) {
      setValidationError('Please enter Potassium (K) value');
      return;
    }
    if (formData.ph === '' || isNaN(formData.ph)) {
      setValidationError('Please enter Soil pH value');
      return;
    }
    if (!formData.Soil_Type) {
      setValidationError('Please select Soil Type');
      return;
    }
    if (!formData.Season) {
      setValidationError('Please select Cropping Season');
      return;
    }
    if (!formData.Irrigation_Type) {
      setValidationError('Please select Irrigation System');
      return;
    }
    if (formData.Soil_Moisture === '' || isNaN(formData.Soil_Moisture)) {
      setValidationError('Please enter Soil Moisture percentage');
      return;
    }

    if (formData.useLiveWeather) {
      if (!formData.city || !formData.city.trim()) {
        setValidationError('Please enter an Agricultural Region or City for live weather analysis');
        return;
      }
    } else {
      if (formData.manual_temperature === '' || isNaN(formData.manual_temperature)) {
        setValidationError('Please enter Temperature value');
        return;
      }
      if (formData.manual_humidity === '' || isNaN(formData.manual_humidity)) {
        setValidationError('Please enter Humidity value');
        return;
      }
      if (formData.manual_rainfall === '' || isNaN(formData.manual_rainfall)) {
        setValidationError('Please enter Rainfall value');
        return;
      }
    }

    const payload = {
      N: parseFloat(formData.N),
      P: parseFloat(formData.P),
      K: parseFloat(formData.K),
      ph: parseFloat(formData.ph),
      Soil_Type: formData.Soil_Type,
      Season: formData.Season,
      Irrigation_Type: formData.Irrigation_Type,
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
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">
          <Sliders size={20} color="#1e6b37" />
          Field & Environmental Input Parameters
        </h2>
        <span className="badge badge-success">Pre-Sowing Support</span>
      </div>

      {/* Presets Bar */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Sparkles size={14} color="#ca8a04" />
          DEMO PRESETS FOR QUICK EVALUATION:
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(p)}
              className="btn btn-outline"
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* Soil Nutrients */}
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#334155', marginBottom: 12, paddingBottom: 6, borderBottom: '1px solid #f1f5f9' }}>
            1. Soil Chemical & Nutrient Profile
          </h3>
          <div className="grid-4">
            <div className="form-group">
              <label className="form-label">Nitrogen (N) [kg/ha]</label>
              <input
                type="number"
                name="N"
                value={formData.N}
                onChange={handleChange}
                min="0"
                max="200"
                step="1"
                placeholder="e.g. 90"
                className="form-input"
              />
              <span className="form-helper">Recommended range: 0 - 140</span>
            </div>

            <div className="form-group">
              <label className="form-label">Phosphorus (P) [kg/ha]</label>
              <input
                type="number"
                name="P"
                value={formData.P}
                onChange={handleChange}
                min="0"
                max="200"
                step="1"
                placeholder="e.g. 42"
                className="form-input"
              />
              <span className="form-helper">Recommended range: 5 - 145</span>
            </div>

            <div className="form-group">
              <label className="form-label">Potassium (K) [kg/ha]</label>
              <input
                type="number"
                name="K"
                value={formData.K}
                onChange={handleChange}
                min="0"
                max="250"
                step="1"
                placeholder="e.g. 43"
                className="form-input"
              />
              <span className="form-helper">Recommended range: 5 - 205</span>
            </div>

            <div className="form-group">
              <label className="form-label">Soil pH Level</label>
              <input
                type="number"
                name="ph"
                value={formData.ph}
                onChange={handleChange}
                min="3.5"
                max="10.0"
                step="0.1"
                placeholder="e.g. 6.5"
                className="form-input"
              />
              <span className="form-helper">Neutral range: 6.0 - 7.5</span>
            </div>
          </div>
        </div>

        {/* Agronomic & Field Characteristics */}
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#334155', marginBottom: 12, paddingBottom: 6, borderBottom: '1px solid #f1f5f9' }}>
            2. Field Characteristics & Irrigation Setup
          </h3>
          <div className="grid-4">
            <div className="form-group">
              <label className="form-label">Soil Type</label>
              <select name="Soil_Type" value={formData.Soil_Type} onChange={handleChange} className="form-select">
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
              <label className="form-label">Cropping Season</label>
              <select name="Season" value={formData.Season} onChange={handleChange} className="form-select">
                <option value="">Select Cropping Season</option>
                <option value="Kharif">Kharif (Monsoon/Autumn)</option>
                <option value="Rabi">Rabi (Winter/Spring)</option>
                <option value="Zaid">Zaid (Summer)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Irrigation System</label>
              <select name="Irrigation_Type" value={formData.Irrigation_Type} onChange={handleChange} className="form-select">
                <option value="">Select Irrigation System</option>
                <option value="Drip">Drip Irrigation</option>
                <option value="Sprinkler">Sprinkler Irrigation</option>
                <option value="Flood">Surface / Flood</option>
                <option value="Furrow">Furrow Irrigation</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Soil Moisture [%]</label>
              <input
                type="number"
                name="Soil_Moisture"
                value={formData.Soil_Moisture}
                onChange={handleChange}
                min="0"
                max="100"
                step="1"
                placeholder="e.g. 40"
                className="form-input"
              />
              <span className="form-helper">Optimal range: 30 - 60%</span>
            </div>
          </div>
        </div>

        {/* Live Weather vs Manual Weather */}
        <div style={{ marginBottom: 24, padding: 16, backgroundColor: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: 8 }}>
              <CloudSun size={18} color="#0d9488" />
              3. Agro-Climatic Weather Source
            </h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', cursor: 'pointer', fontWeight: 500 }}>
              <input
                type="checkbox"
                name="useLiveWeather"
                checked={formData.useLiveWeather}
                onChange={handleChange}
              />
              Fetch Live Weather via OpenWeather API
            </label>
          </div>

          {formData.useLiveWeather ? (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Agricultural Region / District City</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={18} style={{ position: 'absolute', left: 12, top: 12, color: '#64748b' }} />
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter district or city, e.g. Chennai, Pune, Ludhiana, Coimbatore"
                  className="form-input"
                  style={{ paddingLeft: 38 }}
                />
              </div>
              <span className="form-helper">Weather API securely resolves live temperature, humidity, rainfall, and wind speed.</span>
            </div>
          ) : (
            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Temperature (°C)</label>
                <input
                  type="number"
                  name="manual_temperature"
                  value={formData.manual_temperature}
                  onChange={handleChange}
                  step="0.5"
                  placeholder="e.g. 28.5"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Humidity (%)</label>
                <input
                  type="number"
                  name="manual_humidity"
                  value={formData.manual_humidity}
                  onChange={handleChange}
                  step="1"
                  placeholder="e.g. 68"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Rainfall (mm)</label>
                <input
                  type="number"
                  name="manual_rainfall"
                  value={formData.manual_rainfall}
                  onChange={handleChange}
                  step="1"
                  placeholder="e.g. 50"
                  className="form-input"
                />
              </div>
            </div>
          )}
        </div>

        {/* Validation Error Message */}
        {validationError && (
          <div className="callout callout-warning" style={{ marginBottom: 18, borderLeft: '4px solid #f59e0b' }}>
            <AlertCircle size={18} color="#b45309" style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontWeight: 500, color: '#92400e' }}>{validationError}</span>
          </div>
        )}

        {/* Submit */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: 220, padding: '12px 24px', fontSize: '1rem' }}>
            {loading ? 'Evaluating Multi-Factor Decision...' : 'Run Decision Engine'}
          </button>
        </div>
      </form>
    </div>
  );
}
