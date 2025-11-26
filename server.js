// Carregar variáveis de ambiente do arquivo .env
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const db = require('./database');
const { findAvailablePort } = require('./port-finder');

const app = express();
const DEFAULT_PORT = parseInt(process.env.PORT) || 3001;
const PORT_FILE = path.join(__dirname, '.server-port');

// Variáveis globais
let server;
let currentUser = null;
let isShuttingDown = false;

// Middleware
// Configurar CORS - permitir todas as origens (incluindo mobile)
// Em produção, configure CORS_ALLOWED_ORIGINS no .env para restringir origens
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS 
  ? process.env.CORS_ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : '*';

app.use(cors({
  origin: allowedOrigins === '*' ? '*' : (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

// Middleware de logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 400 ? '❌' : res.statusCode >= 300 ? '⚠️' : '✅';
    console.log(`${statusColor} ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Middleware para verificar se está em shutdown
app.use((req, res, next) => {
  if (isShuttingDown) {
    return res.status(503).json({ error: 'Servidor está sendo encerrado' });
  }
  next();
});

// Rota de health check melhorada
app.get('/api/health', async (req, res) => {
  try {
    const dbHealth = await db.healthCheck();
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      port: server ? server.address().port : null,
      database: dbHealth,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      }
    };
    
    if (dbHealth.status === 'healthy') {
      res.json(health);
    } else {
      res.status(503).json(health);
    }
  } catch (error) {
    res.status(503).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Middleware de autenticação
function requireAuth(req, res, next) {
  if (!currentUser) {
    return res.status(401).json({ error: 'Não autenticado' });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!currentUser || !currentUser.is_admin) {
    return res.status(403).json({ error: 'Acesso negado. Requer permissões de administrador.' });
  }
  next();
}

// Rotas de autenticação
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
    }
    
    const user = await db.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    
    const bcrypt = require('bcryptjs');
    const isValid = bcrypt.compareSync(password, user.password);
    
    if (isValid) {
      currentUser = {
        id: user.id,
        username: user.username,
        is_admin: user.is_admin
      };
      res.json({ success: true, user: currentUser });
    } else {
      res.status(401).json({ error: 'Credenciais inválidas' });
    }
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/logout', (req, res) => {
  currentUser = null;
  res.json({ success: true });
});

app.get('/api/current-user', (req, res) => {
  res.json({ user: currentUser });
});

// Rotas de cards
app.get('/api/cards', async (req, res) => {
  try {
    const { search, tags } = req.query;
    const tagIds = tags ? tags.split(',').map(Number).filter(id => !isNaN(id)) : [];
    const cards = await db.getAllCards(search || '', tagIds);
    res.json(cards);
  } catch (error) {
    console.error('Erro ao buscar cards:', error);
    res.status(500).json({ error: 'Erro ao buscar cards' });
  }
});

// Rotas de controle de acesso aos cards (devem vir ANTES das rotas genéricas /api/cards/:id)
app.get('/api/cards/:cardId/access', requireAdmin, async (req, res) => {
  try {
    const cardId = parseInt(req.params.cardId);
    const users = await db.getCardAccessUsers(cardId);
    res.json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários com acesso:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários com acesso' });
  }
});

app.post('/api/cards/:cardId/access', requireAdmin, async (req, res) => {
  try {
    const cardId = parseInt(req.params.cardId);
    const { user_id } = req.body;
    
    if (!user_id) {
      return res.status(400).json({ error: 'user_id é obrigatório' });
    }
    
    // Verificar se o card existe
    const card = await db.getCardById(cardId);
    if (!card) {
      return res.status(404).json({ error: 'Card não encontrado' });
    }
    
    // Verificar se o usuário existe
    const user = await db.getUserById(user_id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    await db.grantCardAccess(cardId, user_id);
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao conceder acesso:', error);
    const errorMessage = error.code === '23503' 
      ? 'Card ou usuário não existe' 
      : error.message || 'Erro ao conceder acesso';
    res.status(500).json({ error: errorMessage });
  }
});

app.delete('/api/cards/:cardId/access/:userId', requireAdmin, async (req, res) => {
  try {
    const cardId = parseInt(req.params.cardId);
    const userId = parseInt(req.params.userId);
    
    await db.revokeCardAccess(cardId, userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao revogar acesso:', error);
    res.status(500).json({ error: 'Erro ao revogar acesso' });
  }
});

app.get('/api/cards/:id', async (req, res) => {
  try {
    const card = await db.getCardById(req.params.id);
    if (!card) {
      return res.status(404).json({ error: 'Card não encontrado' });
    }
    res.json(card);
  } catch (error) {
    console.error('Erro ao buscar card:', error);
    res.status(500).json({ error: 'Erro ao buscar card' });
  }
});

app.post('/api/cards', requireAdmin, async (req, res) => {
  try {
    if (!req.body.title) {
      return res.status(400).json({ error: 'Título é obrigatório' });
    }
    const card = await db.createCard(req.body);
    res.status(201).json(card);
  } catch (error) {
    console.error('Erro ao criar card:', error);
    if (error.code === '23505') { // Unique violation
      res.status(409).json({ error: 'Card já existe' });
    } else {
      res.status(500).json({ error: 'Erro ao criar card' });
    }
  }
});

app.put('/api/cards/:id', requireAdmin, async (req, res) => {
  try {
    if (!req.body.title) {
      return res.status(400).json({ error: 'Título é obrigatório' });
    }
    const card = await db.updateCard(req.params.id, req.body);
    if (!card) {
      return res.status(404).json({ error: 'Card não encontrado' });
    }
    res.json(card);
  } catch (error) {
    console.error('Erro ao atualizar card:', error);
    res.status(500).json({ error: 'Erro ao atualizar card' });
  }
});

app.delete('/api/cards/:id', requireAdmin, async (req, res) => {
  try {
    await db.deleteCard(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir card:', error);
    res.status(500).json({ error: 'Erro ao excluir card' });
  }
});

// Rotas de links
app.get('/api/cards/:cardId/links', requireAuth, async (req, res) => {
  try {
    const cardId = parseInt(req.params.cardId);
    const userId = currentUser.id;
    const isAdmin = currentUser.is_admin;
    
    // Verificar se o usuário tem acesso ao card
    const hasAccess = await db.hasCardAccess(userId, cardId, isAdmin);
    
    if (!hasAccess) {
      return res.status(403).json({ 
        error: 'Acesso negado',
        message: 'Você não tem permissão para acessar os links deste card'
      });
    }
    
    const links = await db.getLinksByCardId(cardId);
    res.json(links);
  } catch (error) {
    console.error('Erro ao buscar links:', error);
    res.status(500).json({ error: 'Erro ao buscar links' });
  }
});

app.post('/api/links', requireAdmin, async (req, res) => {
  try {
    if (!req.body.url || !req.body.card_id) {
      return res.status(400).json({ error: 'URL e card_id são obrigatórios' });
    }
    const link = await db.createLink(req.body);
    res.status(201).json(link);
  } catch (error) {
    console.error('Erro ao criar link:', error);
    res.status(500).json({ error: 'Erro ao criar link' });
  }
});

app.delete('/api/links/:id', requireAdmin, async (req, res) => {
  try {
    const links = await db.deleteLink(req.params.id);
    res.json(links);
  } catch (error) {
    console.error('Erro ao excluir link:', error);
    res.status(500).json({ error: 'Erro ao excluir link' });
  }
});

// Rotas de tags
app.get('/api/tags', async (req, res) => {
  try {
    const tags = await db.getAllTags();
    res.json(tags);
  } catch (error) {
    console.error('Erro ao buscar tags:', error);
    res.status(500).json({ error: 'Erro ao buscar tags' });
  }
});

app.post('/api/tags', requireAdmin, async (req, res) => {
  try {
    if (!req.body.name) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }
    const tag = await db.createTag(req.body);
    res.status(201).json(tag);
  } catch (error) {
    console.error('Erro ao criar tag:', error);
    if (error.code === '23505') { // Unique violation
      res.status(409).json({ error: 'Tag já existe' });
    } else {
      res.status(500).json({ error: 'Erro ao criar tag' });
    }
  }
});

app.put('/api/tags/:id', requireAdmin, async (req, res) => {
  try {
    if (!req.body.name) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }
    const tag = await db.updateTag(req.params.id, req.body);
    if (!tag) {
      return res.status(404).json({ error: 'Tag não encontrada' });
    }
    res.json(tag);
  } catch (error) {
    console.error('Erro ao atualizar tag:', error);
    res.status(500).json({ error: 'Erro ao atualizar tag' });
  }
});

app.delete('/api/tags/:id', requireAdmin, async (req, res) => {
  try {
    await db.deleteTag(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir tag:', error);
    res.status(500).json({ error: 'Erro ao excluir tag' });
  }
});

// Rotas de usuários
app.get('/api/users', requireAdmin, async (req, res) => {
  try {
    const users = await db.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

app.get('/api/users/:id', requireAdmin, async (req, res) => {
  try {
    const user = await db.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.json(user);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
});

app.post('/api/users', requireAdmin, async (req, res) => {
  try {
    if (!req.body.username || !req.body.password) {
      return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
    }
    const user = await db.createUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    if (error.code === '23505') { // Unique violation
      res.status(409).json({ error: 'Usuário já existe' });
    } else {
      res.status(500).json({ error: 'Erro ao criar usuário' });
    }
  }
});

app.put('/api/users/:id', requireAdmin, async (req, res) => {
  try {
    if (!req.body.username) {
      return res.status(400).json({ error: 'Usuário é obrigatório' });
    }
    const user = await db.updateUser(req.params.id, req.body);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.json(user);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    if (error.code === '23505') {
      res.status(409).json({ error: 'Usuário já existe' });
    } else {
      res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
  }
});

app.delete('/api/users/:id', requireAdmin, async (req, res) => {
  try {
    if (currentUser && currentUser.id === parseInt(req.params.id)) {
      return res.status(400).json({ error: 'Não é possível excluir seu próprio usuário' });
    }
    await db.deleteUser(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({ error: 'Erro ao excluir usuário' });
  }
});

// Rotas de solicitações de cards
app.post('/api/card-requests', requireAuth, async (req, res) => {
  try {
    if (!req.body.title) {
      return res.status(400).json({ error: 'Título é obrigatório' });
    }
    
    const request = await db.createCardRequest(req.body, currentUser.id);
    res.status(201).json(request);
  } catch (error) {
    console.error('Erro ao criar solicitação:', error);
    res.status(500).json({ error: 'Erro ao criar solicitação' });
  }
});

app.get('/api/card-requests', requireAuth, async (req, res) => {
  try {
    const status = req.query.status || null;
    const requests = await db.getAllCardRequests(status);
    res.json(requests);
  } catch (error) {
    console.error('Erro ao buscar solicitações:', error);
    res.status(500).json({ error: 'Erro ao buscar solicitações' });
  }
});

app.get('/api/card-requests/:id', requireAuth, async (req, res) => {
  try {
    const request = await db.getCardRequestById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Solicitação não encontrada' });
    }
    res.json(request);
  } catch (error) {
    console.error('Erro ao buscar solicitação:', error);
    res.status(500).json({ error: 'Erro ao buscar solicitação' });
  }
});

app.put('/api/card-requests/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status é obrigatório' });
    }
    const request = await db.updateCardRequestStatus(req.params.id, status);
    res.json(request);
  } catch (error) {
    console.error('Erro ao atualizar status da solicitação:', error);
    res.status(500).json({ error: 'Erro ao atualizar status da solicitação' });
  }
});

app.delete('/api/card-requests/:id', requireAdmin, async (req, res) => {
  try {
    await db.deleteCardRequest(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir solicitação:', error);
    res.status(500).json({ error: 'Erro ao excluir solicitação' });
  }
});

// Middleware de tratamento de erros global
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Rota para servir o APK do app mobile (opcional)
// Coloque o arquivo APK na pasta 'public/apk/' para servir diretamente
const APK_PATH = path.join(__dirname, 'public', 'apk', 'anubis.apk');
if (fs.existsSync(APK_PATH)) {
  app.get('/download/apk', (req, res) => {
    res.download(APK_PATH, 'anubis.apk', (err) => {
      if (err) {
        console.error('Erro ao servir APK:', err);
        res.status(404).json({ error: 'APK não encontrado' });
      }
    });
  });
  console.log('📱 Rota de download do APK configurada: /download/apk');
}

// Middleware para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Função para iniciar servidor em uma porta disponível
async function startServer() {
  try {
    // Tentar encontrar porta disponível
    const port = await findAvailablePort(DEFAULT_PORT, 10);
    
    // Salvar porta em arquivo para o frontend ler
    fs.writeFileSync(PORT_FILE, port.toString(), 'utf8');
    
    server = app.listen(port, () => {
      console.log('');
      console.log('═══════════════════════════════════════');
      console.log('  ✅ SERVIDOR INICIADO COM SUCESSO');
      console.log('═══════════════════════════════════════');
      console.log(`📡 Porta: ${port}`);
      console.log(`🌐 API: http://localhost:${port}/api`);
      console.log(`💚 Health: http://localhost:${port}/api/health`);
      console.log('═══════════════════════════════════════');
      console.log('');
      
      // Tentar inicializar banco de dados após servidor iniciar
      db.initDatabase().then(() => {
        console.log('✅ Sistema pronto para uso!');
        console.log('');
      }).catch(err => {
        console.error('❌ Erro ao inicializar banco de dados:', err.message);
        console.error('⚠️  O servidor está rodando, mas algumas funcionalidades podem não funcionar');
        console.error('📖 Configure o DATABASE_URL no arquivo .env e reinicie o servidor');
        console.error('');
      });
    });
    
    // Graceful shutdown
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
    
    return port;
  } catch (error) {
    console.error('❌ Erro ao encontrar porta disponível:', error.message);
    // Tentar porta padrão mesmo assim
    server = app.listen(DEFAULT_PORT, () => {
      console.log(`⚠️  Usando porta padrão ${DEFAULT_PORT} (pode estar ocupada)`);
      console.log(`📡 API disponível em http://localhost:${DEFAULT_PORT}/api`);
      fs.writeFileSync(PORT_FILE, DEFAULT_PORT.toString(), 'utf8');
    });
  }
}

// Função para graceful shutdown
async function gracefulShutdown(signal) {
  console.log(`\n${signal} recebido. Iniciando graceful shutdown...`);
  isShuttingDown = true;
  
  if (server) {
    server.close(async () => {
      console.log('✅ Servidor HTTP fechado');
      
      // Fechar conexões do banco
      try {
        await db.closePool();
      } catch (error) {
        console.error('Erro ao fechar conexões do banco:', error);
      }
      
      // Remover arquivo de porta
      if (fs.existsSync(PORT_FILE)) {
        fs.unlinkSync(PORT_FILE);
      }
      
      console.log('✅ Shutdown completo');
      process.exit(0);
    });
    
    // Forçar fechamento após 10 segundos
    setTimeout(() => {
      console.error('⚠️  Forçando fechamento...');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
}

// Iniciar servidor
startServer();

// Exportar para uso em outros módulos
module.exports = { app, server };
