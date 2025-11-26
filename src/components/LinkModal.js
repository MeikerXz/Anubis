import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './LinkModal.css';
import { useApi } from '../contexts/ApiContext';

function LinkModal({ card, links: initialLinks, onClose, isAdmin, onUpdate }) {
  const { apiUrl } = useApi();
  const [links, setLinks] = useState(initialLinks);
  const [newLink, setNewLink] = useState({ title: '', url: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [hasAccess, setHasAccess] = useState(true);
  const [loading, setLoading] = useState(false);

  const loadLinks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/cards/${card.id}/links`);
      setLinks(response.data);
      setHasAccess(true);
    } catch (error) {
      console.error('Erro ao carregar links:', error);
      if (error.response && error.response.status === 403) {
        setHasAccess(false);
        setLinks([]);
      } else {
        setHasAccess(true);
      }
    } finally {
      setLoading(false);
    }
  }, [apiUrl, card.id]);

  useEffect(() => {
    loadLinks();
  }, [loadLinks]);

  const handleLinkClick = (url) => {
    // Validar URL antes de abrir
    if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
      console.error('URL inválida:', url);
      alert('URL inválida');
      return;
    }
    
    // Verificar se está rodando no Electron
    if (window.electronAPI && window.electronAPI.openUrl) {
      // Abrir em navegador interno do Electron
      window.electronAPI.openUrl(url);
    } else {
      // Fallback para navegador padrão (modo desenvolvimento web)
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleAddLink = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${apiUrl}/links`, {
        card_id: card.id,
        title: newLink.title || null,
        url: newLink.url,
        order_index: links.length
      });
      setNewLink({ title: '', url: '' });
      setShowAddForm(false);
      await loadLinks();
      onUpdate();
    } catch (error) {
      console.error('Erro ao adicionar link:', error);
      alert('Erro ao adicionar link');
    }
  };

  const handleDeleteLink = async (linkId) => {
    if (!window.confirm('Tem certeza que deseja excluir este link?')) {
      return;
    }
    try {
      const response = await axios.delete(`${apiUrl}/links/${linkId}`);
      setLinks(response.data);
      onUpdate();
    } catch (error) {
      console.error('Erro ao excluir link:', error);
      alert('Erro ao excluir link');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{card.title}</h2>
          {isAdmin && (
            <button
              className="add-link-btn"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? 'CANCELAR' : '+ ADICIONAR LINK'}
            </button>
          )}
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {showAddForm && isAdmin && (
          <form className="add-link-form" onSubmit={handleAddLink}>
            <input
              type="text"
              placeholder="Título (opcional)"
              value={newLink.title}
              onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
            />
            <input
              type="url"
              placeholder="URL *"
              value={newLink.url}
              onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
              required
            />
            <button type="submit">ADICIONAR</button>
          </form>
        )}

        <div className="modal-body">
          {loading ? (
            <div className="empty-links">
              > CARREGANDO...
            </div>
          ) : !hasAccess ? (
            <div className="empty-links">
              > ACESSO NEGADO
              <div className="admin-hint" style={{ marginTop: '10px', color: '#b0b0b0' }}>
                Você não tem permissão para acessar os links deste card.
                {isAdmin && <div style={{ marginTop: '5px' }}>Como administrador, você pode gerenciar as permissões no painel ADMIN.</div>}
              </div>
            </div>
          ) : links.length === 0 ? (
            <div className="empty-links">
              > NENHUM LINK DISPONÍVEL
              {isAdmin && <div className="admin-hint">Use o botão acima para adicionar links</div>}
            </div>
          ) : (
            <ul className="links-list">
              {links.map(link => (
                <li key={link.id} className="link-item">
                  <div
                    className="link-content"
                    onClick={() => handleLinkClick(link.url)}
                  >
                    {link.title ? (
                      <>
                        <div className="link-title">{link.title}</div>
                        <div className="link-url">{link.url}</div>
                      </>
                    ) : (
                      <div className="link-url-only">{link.url}</div>
                    )}
                  </div>
                  {isAdmin && (
                    <button
                      className="delete-link-btn"
                      onClick={() => handleDeleteLink(link.id)}
                    >
                      ×
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default LinkModal;

