import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminPanel.css';
import { useApi } from '../contexts/ApiContext';

function AdminPanel({ cards, tags, users, onClose, onUpdate }) {
  const { apiUrl } = useApi();
  const [activeTab, setActiveTab] = useState('cards');
  const [editingCard, setEditingCard] = useState(null);
  const [editingTag, setEditingTag] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [cardForm, setCardForm] = useState({
    title: '',
    description: '',
    color: '',
    thumbnail_url: '',
    tag_ids: []
  });
  const [tagForm, setTagForm] = useState({
    name: '',
    color: ''
  });
  const [userForm, setUserForm] = useState({
    username: '',
    password: '',
    is_admin: false
  });
  const [selectedCardForAccess, setSelectedCardForAccess] = useState(null);
  const [cardAccessUsers, setCardAccessUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');

  const handleCardSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCard) {
        await axios.put(`${apiUrl}/cards/${editingCard.id}`, cardForm);
      } else {
        await axios.post(`${apiUrl}/cards`, cardForm);
      }
      setCardForm({ title: '', description: '', color: '', thumbnail_url: '', tag_ids: [] });
      setEditingCard(null);
      onUpdate();
    } catch (error) {
      console.error('Erro ao salvar card:', error);
      alert('Erro ao salvar card');
    }
  };

  const handleTagSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTag) {
        await axios.put(`${apiUrl}/tags/${editingTag.id}`, tagForm);
      } else {
        await axios.post(`${apiUrl}/tags`, tagForm);
      }
      setTagForm({ name: '', color: '' });
      setEditingTag(null);
      onUpdate();
    } catch (error) {
      console.error('Erro ao salvar tag:', error);
      alert('Erro ao salvar tag');
    }
  };

  const handleDeleteCard = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este card e todos os seus links?')) {
      return;
    }
    try {
      await axios.delete(`${apiUrl}/cards/${id}`);
      onUpdate();
    } catch (error) {
      console.error('Erro ao excluir card:', error);
      alert('Erro ao excluir card');
    }
  };

  const handleDeleteTag = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta tag?')) {
      return;
    }
    try {
      await axios.delete(`${apiUrl}/tags/${id}`);
      onUpdate();
    } catch (error) {
      console.error('Erro ao excluir tag:', error);
      alert('Erro ao excluir tag');
    }
  };

  const handleEditCard = (card) => {
    setEditingCard(card);
    // Converter tag_ids de string para array se necessário
    let tagIds = card.tag_ids || [];
    if (typeof tagIds === 'string') {
      tagIds = tagIds ? tagIds.split(',').map(id => parseInt(id)).filter(id => !isNaN(id)) : [];
    }
    setCardForm({
      title: card.title,
      description: card.description || '',
      color: card.color || '',
      thumbnail_url: card.thumbnail_url || '',
      tag_ids: tagIds
    });
  };

  const handleEditTag = (tag) => {
    setEditingTag(tag);
    setTagForm({
      name: tag.name,
      color: tag.color || ''
    });
  };

  const toggleTagSelection = (tagId) => {
    setCardForm(prev => ({
      ...prev,
      tag_ids: prev.tag_ids.includes(tagId)
        ? prev.tag_ids.filter(id => id !== tagId)
        : [...prev.tag_ids, tagId]
    }));
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await axios.put(`${apiUrl}/users/${editingUser.id}`, userForm);
      } else {
        await axios.post(`${apiUrl}/users`, userForm);
      }
      setUserForm({ username: '', password: '', is_admin: false });
      setEditingUser(null);
      onUpdate();
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      alert(error.response?.data?.error || 'Erro ao salvar usuário');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) {
      return;
    }
    try {
      await axios.delete(`${apiUrl}/users/${id}`);
      onUpdate();
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      alert(error.response?.data?.error || 'Erro ao excluir usuário');
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserForm({
      username: user.username,
      password: '',
      is_admin: user.is_admin
    });
  };

  const handleManageCardAccess = async (card) => {
    setSelectedCardForAccess(card);
    try {
      const response = await axios.get(`${apiUrl}/cards/${card.id}/access`);
      setCardAccessUsers(response.data);
    } catch (error) {
      console.error('Erro ao carregar usuários com acesso:', error);
      setCardAccessUsers([]);
    }
  };

  const handleGrantAccess = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;
    
    try {
      const response = await axios.post(`${apiUrl}/cards/${selectedCardForAccess.id}/access`, {
        user_id: parseInt(selectedUserId)
      });
      await handleManageCardAccess(selectedCardForAccess);
      setSelectedUserId('');
    } catch (error) {
      console.error('Erro ao conceder acesso:', error);
      const errorMessage = error.response?.data?.error || 'Erro ao conceder acesso';
      alert(errorMessage);
    }
  };

  const handleRevokeAccess = async (userId) => {
    try {
      await axios.delete(`${apiUrl}/cards/${selectedCardForAccess.id}/access/${userId}`);
      await handleManageCardAccess(selectedCardForAccess);
    } catch (error) {
      console.error('Erro ao revogar acesso:', error);
      alert('Erro ao revogar acesso');
    }
  };

  return (
    <div className="admin-overlay" onClick={onClose}>
      <div className="admin-panel" onClick={(e) => e.stopPropagation()}>
        <div className="admin-header">
          <h2>PAINEL DE ADMINISTRAÇÃO</h2>
          <button className="close-admin-btn" onClick={onClose}>×</button>
        </div>

        <div className="admin-tabs">
          <button
            className={activeTab === 'cards' ? 'active' : ''}
            onClick={() => setActiveTab('cards')}
          >
            CARDS
          </button>
          <button
            className={activeTab === 'tags' ? 'active' : ''}
            onClick={() => setActiveTab('tags')}
          >
            TAGS
          </button>
          <button
            className={activeTab === 'users' ? 'active' : ''}
            onClick={() => setActiveTab('users')}
          >
            USUÁRIOS
          </button>
        </div>

        <div className="admin-content">
          {activeTab === 'cards' && (
            <div className="admin-section">
              <h3>{editingCard ? 'EDITAR CARD' : 'NOVO CARD'}</h3>
              <form onSubmit={handleCardSubmit} className="admin-form">
                <div className="form-row">
                  <label>Título *</label>
                  <input
                    type="text"
                    value={cardForm.title}
                    onChange={(e) => setCardForm({ ...cardForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-row">
                  <label>Descrição</label>
                  <textarea
                    value={cardForm.description}
                    onChange={(e) => setCardForm({ ...cardForm, description: e.target.value })}
                    rows="3"
                  />
                </div>
                <div className="form-row">
                  <label>Cor (hex)</label>
                  <input
                    type="text"
                    value={cardForm.color}
                    onChange={(e) => setCardForm({ ...cardForm, color: e.target.value })}
                    placeholder="#8a2be2"
                  />
                </div>
                <div className="form-row">
                  <label>URL da Miniatura (imagem)</label>
                  <input
                    type="url"
                    value={cardForm.thumbnail_url}
                    onChange={(e) => setCardForm({ ...cardForm, thumbnail_url: e.target.value })}
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                </div>
                <div className="form-row">
                  <label>Tags</label>
                  <div className="tag-selector">
                    {tags.map(tag => (
                      <button
                        key={tag.id}
                        type="button"
                        className={`tag-option ${cardForm.tag_ids.includes(tag.id) ? 'selected' : ''}`}
                        onClick={() => toggleTagSelection(tag.id)}
                      >
                        #{tag.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit">
                    {editingCard ? 'ATUALIZAR' : 'CRIAR'}
                  </button>
                  {editingCard && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCard(null);
                          setCardForm({ title: '', description: '', color: '', thumbnail_url: '', tag_ids: [] });
                        }}
                      >
                        CANCELAR
                      </button>
                  )}
                </div>
              </form>

              <div className="admin-list">
                <h3>CARDS EXISTENTES</h3>
                <div className="items-list">
                  {cards.map(card => (
                    <div key={card.id} className="admin-item">
                      <div className="item-info">
                        <strong>{card.title}</strong>
                        {card.description && <span>{card.description}</span>}
                      </div>
                      <div className="item-actions">
                        <button onClick={() => handleEditCard(card)}>EDITAR</button>
                        <button onClick={() => handleManageCardAccess(card)}>PERMISSÕES</button>
                        <button onClick={() => handleDeleteCard(card.id)} className="delete-btn">
                          EXCLUIR
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedCardForAccess && (
                <div className="access-management">
                  <div className="access-header">
                    <h3 className="access-title">GERENCIAR PERMISSÕES: {selectedCardForAccess.title}</h3>
                    <button className="access-close-btn" onClick={() => setSelectedCardForAccess(null)}>
                      FECHAR
                    </button>
                  </div>
                  
                  <form onSubmit={handleGrantAccess} className="access-form">
                    <div className="access-form-row">
                      <select
                        className="access-select"
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        required
                      >
                        <option value="">Selecione um usuário...</option>
                        {users
                          .filter(user => !cardAccessUsers.find(au => au.id === user.id))
                          .map(user => (
                            <option key={user.id} value={user.id}>
                              {user.username} {user.is_admin ? '(Admin)' : ''}
                            </option>
                          ))}
                      </select>
                      <button type="submit" className="access-grant-btn">
                        CONCEDER ACESSO
                      </button>
                    </div>
                  </form>

                  <div className="access-users-section">
                    <h4 className="access-users-title">USUÁRIOS COM ACESSO:</h4>
                    {cardAccessUsers.length === 0 ? (
                      <div className="access-empty">
                        Nenhum usuário tem acesso a este card
                      </div>
                    ) : (
                      <div className="items-list">
                        {cardAccessUsers.map(accessUser => (
                          <div key={accessUser.id} className="admin-item">
                            <div className="item-info">
                              <strong>{accessUser.username}</strong>
                              {accessUser.is_admin && <span className="admin-badge">(Admin)</span>}
                            </div>
                            <div className="item-actions">
                              <button 
                                onClick={() => handleRevokeAccess(accessUser.id)} 
                                className="access-remove-btn"
                              >
                                REMOVER
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'tags' && (
            <div className="admin-section">
              <h3>{editingTag ? 'EDITAR TAG' : 'NOVA TAG'}</h3>
              <form onSubmit={handleTagSubmit} className="admin-form">
                <div className="form-row">
                  <label>Nome *</label>
                  <input
                    type="text"
                    value={tagForm.name}
                    onChange={(e) => setTagForm({ ...tagForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-row">
                  <label>Cor (hex)</label>
                  <input
                    type="text"
                    value={tagForm.color}
                    onChange={(e) => setTagForm({ ...tagForm, color: e.target.value })}
                    placeholder="#191970"
                  />
                </div>
                <div className="form-actions">
                  <button type="submit">
                    {editingTag ? 'ATUALIZAR' : 'CRIAR'}
                  </button>
                  {editingTag && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTag(null);
                        setTagForm({ name: '', color: '' });
                      }}
                    >
                      CANCELAR
                    </button>
                  )}
                </div>
              </form>

              <div className="admin-list">
                <h3>TAGS EXISTENTES</h3>
                <div className="items-list">
                  {tags.map(tag => (
                    <div key={tag.id} className="admin-item">
                      <div className="item-info">
                        <strong>#{tag.name}</strong>
                      </div>
                      <div className="item-actions">
                        <button onClick={() => handleEditTag(tag)}>EDITAR</button>
                        <button onClick={() => handleDeleteTag(tag.id)} className="delete-btn">
                          EXCLUIR
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="admin-section">
              <h3>{editingUser ? 'EDITAR USUÁRIO' : 'NOVO USUÁRIO'}</h3>
              <form onSubmit={handleUserSubmit} className="admin-form">
                <div className="form-row">
                  <label>Usuário *</label>
                  <input
                    type="text"
                    value={userForm.username}
                    onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                    required
                  />
                </div>
                <div className="form-row">
                  <label>Senha {editingUser ? '(deixe em branco para manter)' : '*'}</label>
                  <input
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    required={!editingUser}
                  />
                </div>
                <div className="form-row">
                  <label>
                    <input
                      type="checkbox"
                      checked={userForm.is_admin}
                      onChange={(e) => setUserForm({ ...userForm, is_admin: e.target.checked })}
                    />
                    Administrador
                  </label>
                </div>
                <div className="form-actions">
                  <button type="submit">
                    {editingUser ? 'ATUALIZAR' : 'CRIAR'}
                  </button>
                  {editingUser && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingUser(null);
                        setUserForm({ username: '', password: '', is_admin: false });
                      }}
                    >
                      CANCELAR
                    </button>
                  )}
                </div>
              </form>

              <div className="admin-list">
                <h3>USUÁRIOS EXISTENTES</h3>
                <div className="items-list">
                  {users && users.map(user => (
                    <div key={user.id} className="admin-item">
                      <div className="item-info">
                        <strong>{user.username}</strong>
                        <span>{user.is_admin ? 'Administrador' : 'Usuário'}</span>
                      </div>
                      <div className="item-actions">
                        <button onClick={() => handleEditUser(user)}>EDITAR</button>
                        <button onClick={() => handleDeleteUser(user.id)} className="delete-btn">
                          EXCLUIR
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;

