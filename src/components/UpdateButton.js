import React, { useState, useEffect } from 'react';
import './UpdateButton.css';

const UpdateButton = () => {
  const [updateStatus, setUpdateStatus] = useState('idle'); // idle, checking, available, downloading, downloaded, error
  const [updateInfo, setUpdateInfo] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Verificar se estamos em um ambiente Electron
    if (!window.electronAPI || !window.electronAPI.update) {
      return;
    }

    // Configurar listeners de eventos
    const updateAPI = window.electronAPI.update;

    const handleChecking = () => {
      setUpdateStatus('checking');
    };

    const handleAvailable = (data) => {
      setUpdateStatus('available');
      setUpdateInfo(data);
      setShowModal(true);
    };

    const handleNotAvailable = () => {
      setUpdateStatus('idle');
      setUpdateInfo(null);
      setShowModal(false);
    };

    const handleDownloadProgress = (data) => {
      setUpdateStatus('downloading');
      setDownloadProgress(data.percent);
    };

    const handleDownloaded = (data) => {
      setUpdateStatus('downloaded');
      setUpdateInfo(data);
      setShowModal(true);
    };

    const handleError = (data) => {
      setUpdateStatus('error');
      console.error('Erro ao verificar atualização:', data.message);
    };

    // Registrar listeners
    updateAPI.onChecking(handleChecking);
    updateAPI.onAvailable(handleAvailable);
    updateAPI.onNotAvailable(handleNotAvailable);
    updateAPI.onDownloadProgress(handleDownloadProgress);
    updateAPI.onDownloaded(handleDownloaded);
    updateAPI.onError(handleError);

    // Verificar atualizações ao montar o componente
    updateAPI.check();

    // Verificar atualizações periodicamente (a cada 1 hora)
    const checkInterval = setInterval(() => {
      updateAPI.check();
    }, 3600000); // 1 hora em milissegundos

    // Cleanup
    return () => {
      clearInterval(checkInterval);
      updateAPI.removeAllListeners('update-checking');
      updateAPI.removeAllListeners('update-available');
      updateAPI.removeAllListeners('update-not-available');
      updateAPI.removeAllListeners('update-download-progress');
      updateAPI.removeAllListeners('update-downloaded');
      updateAPI.removeAllListeners('update-error');
    };
  }, []);

  const handleDownloadUpdate = () => {
    if (window.electronAPI && window.electronAPI.update) {
      window.electronAPI.update.download();
    }
  };

  const handleInstallUpdate = () => {
    if (window.electronAPI && window.electronAPI.update) {
      window.electronAPI.update.install();
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    if (updateStatus === 'downloaded') {
      // Manter o status downloaded para que o botão continue visível
      return;
    }
  };

  // Se não estiver em ambiente Electron, não mostrar nada
  if (!window.electronAPI || !window.electronAPI.update) {
    return null;
  }

  // Só mostrar o botão se houver atualização disponível ou baixada
  if (updateStatus !== 'available' && updateStatus !== 'downloaded') {
    return null;
  }

  return (
    <>
      <button 
        className="update-btn"
        onClick={() => setShowModal(true)}
        title={updateStatus === 'downloaded' ? 'Instalar atualização' : 'Nova versão disponível'}
      >
        UPDATE
      </button>

      {showModal && (
        <div className="update-modal-overlay" onClick={handleCloseModal}>
          <div className="update-modal" onClick={(e) => e.stopPropagation()}>
            <button className="update-modal-close" onClick={handleCloseModal}>×</button>
            
            {updateStatus === 'available' && updateInfo && (
              <div className="update-modal-content">
                <div className="update-modal-icon">✅</div>
                <h2 className="update-modal-title">Nova Versão Disponível!</h2>
                <p className="update-modal-version">Versão {updateInfo.version}</p>
                {updateInfo.releaseNotes && (
                  <div className="update-modal-notes">
                    <h3>Notas da Atualização:</h3>
                    <div dangerouslySetInnerHTML={{ __html: updateInfo.releaseNotes }} />
                  </div>
                )}
                <div className="update-modal-actions">
                  <button className="update-modal-btn download" onClick={handleDownloadUpdate}>
                    Baixar Atualização
                  </button>
                  <button className="update-modal-btn cancel" onClick={handleCloseModal}>
                    Mais Tarde
                  </button>
                </div>
              </div>
            )}

            {updateStatus === 'downloading' && (
              <div className="update-modal-content">
                <div className="update-modal-icon">⬇️</div>
                <h2 className="update-modal-title">Baixando Atualização...</h2>
                <div className="update-progress">
                  <div className="update-progress-bar">
                    <div 
                      className="update-progress-fill" 
                      style={{ width: `${downloadProgress}%` }}
                    ></div>
                  </div>
                  <p className="update-progress-text">{downloadProgress}%</p>
                </div>
              </div>
            )}

            {updateStatus === 'downloaded' && updateInfo && (
              <div className="update-modal-content">
                <div className="update-modal-icon">✅</div>
                <h2 className="update-modal-title">Atualização Baixada!</h2>
                <p className="update-modal-version">Versão {updateInfo.version}</p>
                <p className="update-modal-message">
                  A atualização foi baixada com sucesso. Reinicie o aplicativo para instalar.
                </p>
                <div className="update-modal-actions">
                  <button className="update-modal-btn install" onClick={handleInstallUpdate}>
                    Instalar Agora
                  </button>
                  <button className="update-modal-btn cancel" onClick={handleCloseModal}>
                    Depois
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default UpdateButton;

