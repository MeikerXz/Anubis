import React, { useState } from 'react';
import axios from 'axios';
import './RequestCardModal.css';
import { useApi } from '../contexts/ApiContext';

function RequestCardModal({ onClose, onSuccess }) {
  const { apiUrl } = useApi();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await axios.post(`${apiUrl}/card-requests`, {
        title: formData.title,
        description: formData.description || null,
        thumbnail_url: formData.thumbnail_url || null
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      setError(error.response?.data?.error || 'Erro ao enviar solicitação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (success) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">SOLICITAÇÃO ENVIADA</h2>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          <div className="modal-body">
            <div className="success-message">
              > SOLICITAÇÃO ENVIADA COM SUCESSO
              <br />
              <br />
              > AGUARDANDO APROVAÇÃO DO ADMINISTRADOR
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">SOLICITAR NOVO CARD</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form className="request-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">TÍTULO *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Nome do card"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">DESCRIÇÃO</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descrição do card (opcional)"
              rows="4"
            />
          </div>

          <div className="form-group">
            <label htmlFor="thumbnail_url">URL DA IMAGEM</label>
            <input
              type="url"
              id="thumbnail_url"
              name="thumbnail_url"
              value={formData.thumbnail_url}
              onChange={handleChange}
              placeholder="https://exemplo.com/imagem.jpg"
            />
          </div>

          {error && (
            <div className="error-message">
              > ERRO: {error}
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              CANCELAR
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'ENVIANDO...' : 'ENVIAR SOLICITAÇÃO'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RequestCardModal;

