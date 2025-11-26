import React, { useState } from 'react';
import './Login.css';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await onLogin(username, password);
    } catch (err) {
      setError('Credenciais inválidas');
    }
  };

  return (
    <div className="login-container">
      <div className="background-logs"></div>
      <div className="login-box">
        <h1 className="login-title">ANUBIS</h1>
        <div className="login-subtitle">SISTEMA DE ACESSO</div>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>USUÁRIO:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>SENHA:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="login-button">
            ACESSAR
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;

