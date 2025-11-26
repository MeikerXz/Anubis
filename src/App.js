import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';
import Login from './components/Login';
import CardGrid from './components/CardGrid';
import AdminPanel from './components/AdminPanel';
import SearchBar from './components/SearchBar';
import TagFilter from './components/TagFilter';
import RequestCardModal from './components/RequestCardModal';
import UpdateButton from './components/UpdateButton';
import DownloadApp from './components/DownloadApp';
import { ApiProvider, useApi } from './contexts/ApiContext';

function AppContent() {
  const { apiUrl, connectionError, isConnected, isDetecting, isMobile } = useApi();
  const [user, setUser] = useState(null);
  const [cards, setCards] = useState([]);
  const [tags, setTags] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  const checkCurrentUser = useCallback(async () => {
    try {
      const response = await axios.get(`${apiUrl}/current-user`);
      if (response.data.user) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Erro ao verificar usuário:', error);
    }
  }, [apiUrl]);

  const loadCards = useCallback(async () => {
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedTags.length > 0) params.tags = selectedTags.join(',');
      
      const response = await axios.get(`${apiUrl}/cards`, { params });
      setCards(response.data);
    } catch (error) {
      console.error('Erro ao carregar cards:', error);
    }
  }, [apiUrl, searchTerm, selectedTags]);

  const loadTags = useCallback(async () => {
    try {
      const response = await axios.get(`${apiUrl}/tags`);
      setTags(response.data);
    } catch (error) {
      console.error('Erro ao carregar tags:', error);
    }
  }, [apiUrl]);

  const loadUsers = useCallback(async () => {
    try {
      const response = await axios.get(`${apiUrl}/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  }, [apiUrl]);

  useEffect(() => {
    checkCurrentUser();
    loadTags();
    if (user && user.is_admin) {
      loadUsers();
    }
  }, [user, checkCurrentUser, loadTags, loadUsers]);

  useEffect(() => {
    if (user) {
      loadCards();
    }
  }, [user, loadCards]);

  const handleLogin = async (username, password) => {
    try {
      const response = await axios.post(`${apiUrl}/login`, { username, password });
      if (response.data.success) {
        setUser(response.data.user);
      }
    } catch (error) {
      throw new Error('Credenciais inválidas');
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${apiUrl}/logout`);
      setUser(null);
      setShowAdminPanel(false);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const handleCardUpdate = async () => {
    await loadCards();
    await loadTags();
    if (user && user.is_admin) {
      await loadUsers();
    }
  };

  // Mostrar erro de conexão se houver (especialmente no mobile)
  const showConnectionError = connectionError && isMobile && !isConnected;

  if (!user) {
    return (
      <>
        {showConnectionError && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: '#d32f2f',
            color: '#fff',
            padding: '15px',
            zIndex: 10000,
            textAlign: 'center',
            fontSize: '14px',
            borderBottom: '2px solid #b71c1c'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
              ⚠️ Erro de Conexão
            </div>
            <div style={{ fontSize: '12px' }}>
              {connectionError.type === 'not_configured' 
                ? 'URL da API não configurada. O backend precisa estar hospedado remotamente.'
                : connectionError.message}
            </div>
          </div>
        )}
        <Login onLogin={handleLogin} />
      </>
    );
  }

  return (
    <div className="app">
      <div className="background-logs">
        <div className="glitch-right-1">█<br/>█<br/>█<br/>█<br/>█<br/>█<br/>█<br/>█<br/>█<br/>█</div>
        <div className="glitch-right-2">▓<br/>▓<br/>▓<br/>▓<br/>▓<br/>▓<br/>▓<br/>▓<br/>▓<br/>▓</div>
        <div className="glitch-right-3">▒<br/>▒<br/>▒<br/>▒<br/>▒<br/>▒<br/>▒<br/>▒<br/>▒<br/>▒</div>
      </div>
      <div className="app-content">
        <header className="app-header">
          <div className="header-left">
            <h1 className="app-title">ANUBIS</h1>
          </div>
          <div className="header-controls">
            <SearchBar 
              searchTerm={searchTerm} 
              onSearchChange={setSearchTerm} 
            />
            <UpdateButton />
            <DownloadApp />
            <button 
              className="request-btn"
              onClick={() => setShowRequestModal(true)}
            >
              REQUEST
            </button>
            {user.is_admin && (
              <button 
                className="admin-btn"
                onClick={() => setShowAdminPanel(true)}
              >
                ADMIN
              </button>
            )}
            <button className="logout-btn" onClick={handleLogout}>
              SAIR
            </button>
          </div>
        </header>

        <div className="filters-container">
          <TagFilter 
            tags={tags}
            selectedTags={selectedTags}
            onTagToggle={(tagId) => {
              setSelectedTags(prev => 
                prev.includes(tagId) 
                  ? prev.filter(id => id !== tagId)
                  : [...prev, tagId]
              );
            }}
          />
        </div>
        
        <main className="main-content">
          <CardGrid 
            cards={cards} 
            onUpdate={handleCardUpdate}
            isAdmin={user.is_admin}
          />
        </main>

        {showAdminPanel && user.is_admin && (
          <AdminPanel
            cards={cards}
            tags={tags}
            users={users}
            onClose={() => setShowAdminPanel(false)}
            onUpdate={handleCardUpdate}
          />
        )}

        {showRequestModal && (
          <RequestCardModal
            onClose={() => setShowRequestModal(false)}
            onSuccess={handleCardUpdate}
          />
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <ApiProvider>
      <AppContent />
    </ApiProvider>
  );
}

export default App;

