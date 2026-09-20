import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, CheckCircle, AlertOctagon } from 'lucide-react';

export default function ImageUploader({ onImageSelected, onDetect, loading, selectedFile }) {
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      onImageSelected(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title" style={{ color: '#b91c1c' }}>
          <UploadCloud size={20} color="#dc2626" />
          Leaf Specimen Upload & Preprocessing
        </h3>
        <span className="badge badge-danger">Post-Sowing Diagnostic</span>
      </div>

      {/* Strict Separation Notice */}
      <div className="callout callout-warning">
        <AlertOctagon size={20} style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <strong>Strict Branch Isolation Policy:</strong> Plant disease detection is an exclusively <em>post-sowing</em> diagnostic layer. Disease identification operates independently and does <strong>not</strong> retroactively alter pre-sowing crop selection or the Decision Engine suitability ratings.
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current && fileInputRef.current.click()}
        style={{
          border: `2px dashed ${dragOver ? '#dc2626' : '#cbd5e1'}`,
          borderRadius: 12,
          padding: '36px 20px',
          textAlign: 'center',
          backgroundColor: dragOver ? '#fef2f2' : '#f8fafc',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          marginBottom: 20
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => e.target.files && handleFile(e.target.files[0])}
          accept="image/*"
          style={{ display: 'none' }}
        />

        {preview ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img
              src={preview}
              alt="Leaf Preview"
              style={{
                maxWidth: 220,
                maxHeight: 220,
                borderRadius: 10,
                objectFit: 'cover',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                marginBottom: 12
              }}
            />
            <div style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle size={16} />
              {selectedFile?.name || 'Image ready'} ({Math.round((selectedFile?.size || 0) / 1024)} KB)
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>
              Click or drag another image to replace
            </div>
          </div>
        ) : (
          <div>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: '#fee2e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto',
              color: '#dc2626'
            }}>
              <ImageIcon size={28} />
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>
              Drag and drop leaf image, or browse
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Supports PlantVillage format (JPEG, PNG, WEBP) • Model resizes input to 128×128
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onDetect}
          disabled={!selectedFile || loading}
          className="btn"
          style={{
            backgroundColor: '#dc2626',
            color: '#ffffff',
            minWidth: 200,
            padding: '12px 24px'
          }}
        >
          {loading ? 'Analyzing Plant Pathology...' : 'Run Disease Diagnosis'}
        </button>
      </div>
    </div>
  );
}
