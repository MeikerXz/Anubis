import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useApi } from '../contexts/ApiContext';
import './DownloadApp.css';

function DownloadApp() {
  const { apiUrl } = useApi();
  const [showModal, setShowModal] = useState(false);
  
  // URL do APK - pode ser configurada via variável de ambiente, localStorage ou usa a URL da API
  const getApkUrl = () => {
    // Prioridade: variável de ambiente > localStorage > URL da API > padrão
    if (process.env.REACT_APP_APK_URL) {
      return process.env.REACT_APP_APK_URL;
    }
    if (localStorage.getItem('ANUBIS_APK_URL')) {
      return localStorage.getItem('ANUBIS_APK_URL');
    }
    // Se tiver API URL, usar a mesma origem para o download
    if (apiUrl) {
      const baseUrl = apiUrl.replace('/api', '');
      return `${baseUrl}/download/apk`;
    }
    // URL padrão - configure REACT_APP_APK_URL ou ANUBIS_APK_URL no localStorage
    // Exemplos de URLs válidas:
    // - https://github.com/seu-usuario/anubis/releases/download/v1.0.0/anubis.apk
    // - https://meuservidor.com/downloads/anubis.apk
    return null; // Retornar null se não houver URL configurada
  };
  
  const apkUrl = getApkUrl();

  const handleDownload = () => {
    if (!apkUrl) {
      alert('URL do APK não configurada. Configure REACT_APP_APK_URL ou ANUBIS_APK_URL no localStorage.');
      setShowModal(false);
      return;
    }
    
    // Validar URL antes de abrir
    if (!apkUrl.startsWith('http://') && !apkUrl.startsWith('https://')) {
      alert('URL do APK inválida');
      setShowModal(false);
      return;
    }
    
    // Abrir em nova aba ou fazer download direto
    window.open(apkUrl, '_blank', 'noopener,noreferrer');
    setShowModal(false);
  };

  const handleInfoClick = () => {
    setShowModal(true);
  };

  return (
    <>
      <button 
        className="download-app-btn"
        onClick={handleInfoClick}
        title="Baixar app para Android"
      >
        📱 DOWNLOAD APP
      </button>

      {showModal && ReactDOM.createPortal(
        <div className="download-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="download-modal" onClick={(e) => e.stopPropagation()}>
            <div className="download-modal-header">
              <h2>📱 BAIXAR APP ANDROID</h2>
              <button className="close-modal-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <div className="download-modal-content">
              <div className="download-info">
                <p>Versão mobile do ANUBIS disponível para Android!</p>
                <p className="download-warning">
                  ⚠️ Para instalar, você precisará permitir "Fontes desconhecidas" nas configurações do Android.
                </p>
              </div>

              <div className="download-steps">
                <h3>Como instalar:</h3>
                <ol>
                  <li>Baixe o arquivo APK</li>
                  <li>Vá em Configurações → Segurança</li>
                  <li>Ative "Fontes desconhecidas"</li>
                  <li>Abra o arquivo APK baixado</li>
                  <li>Instale o aplicativo</li>
                </ol>
              </div>

              <div className="download-actions">
                <button className="download-confirm-btn" onClick={handleDownload}>
                  ⬇️ BAIXAR APK
                </button>
                <button className="download-cancel-btn" onClick={() => setShowModal(false)}>
                  CANCELAR
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default DownloadApp;

