"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import './Reportes.css';

export default function Reportes() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    document.title = 'Tablero de Control - Speech Analytics';
  }, []);

  const handleIframeLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const recargarDashboard = () => {
    setIsLoading(true);
    setHasError(false);
    // Forzar recarga del iframe
    const iframe = document.getElementById('power-bi-iframe');
    if (iframe) {
      iframe.src = iframe.src;
    }
  };

  return (
    <div className="reportes-container">
      {/* Header */}
      <div className="reportes-header">
        <div className="header-content">
          <h1 className="reportes-title">
            <i className="fas fa-chart-pie"></i>
            Tablero de Control
          </h1>
        </div>
        <div className="header-actions">
          <button 
            className="btn-reload" 
            onClick={recargarDashboard}
            title="Recargar dashboard"
          >
            <i className="fas fa-sync-alt"></i>
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* Contenedor Power BI */}
      <div className="power-bi-wrapper">
        {isLoading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p className="loading-text">Cargando dashboard...</p>
          </div>
        )}

        {hasError && (
          <div className="error-overlay">
            <div className="error-content">
              <i className="fas fa-exclamation-triangle"></i>
              <h3>Error al cargar el dashboard</h3>
              <p>No se pudo cargar el tablero de Power BI. Por favor, intenta nuevamente.</p>
              <button className="btn-retry" onClick={recargarDashboard}>
                <i className="fas fa-redo"></i>
                Reintentar
              </button>
            </div>
          </div>
        )}

        <div className="power-bi-container">
          <iframe
            id="power-bi-iframe"
            title="Dashboard Speech Analytics"
            src="https://app.powerbi.com/view?r=eyJrIjoiNDgxZDNkMTctYWU0My00YjQ5LWJhZTQtOWNlYjJiOTNmMTAyIiwidCI6IjMwZDFmYWFmLTFjZWYtNDMxZC1iNTFmLTE2N2UyNzg2YjFlMCIsImMiOjR9"
            frameBorder="0"
            allowFullScreen={true}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            style={{ 
              display: isLoading || hasError ? 'none' : 'block' 
            }}
          ></iframe>
        </div>
      </div>

      {/* Footer Info */}
      <div className="reportes-footer">
        <div className="footer-info">
          <i className="fas fa-info-circle"></i>
          <span>Usuario: <strong>{user?.usuario || 'Usuario'}</strong></span>
        </div>
        <div className="footer-info">
          <i className="fas fa-clock"></i>
          <span>Ultima actualizacion: {new Date().toLocaleString('es-PE')}</span>
        </div>
      </div>
    </div>
  );
}
