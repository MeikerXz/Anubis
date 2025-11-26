// Carregar variáveis de ambiente do arquivo .env
require('dotenv').config();

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const config = require('./config');

// Configuração do pool de conexões PostgreSQL
let pool = null;
let isInitialized = false;
let connectionRetries = 0;
const MAX_RETRIES = 5;
const RETRY_DELAY = 2000; // 2 segundos

// Função para verificar se a configuração está disponível
function hasConfig() {
  return !!(config.postgres.connectionString || 
           (config.postgres.host && config.postgres.database && config.postgres.user && config.postgres.password));
}

// Função para normalizar a connection string e garantir SSL quando necessário
function normalizeConnectionString(connectionString) {
  if (!connectionString) return connectionString;
  
  // Se já tem sslmode, retornar como está
  if (connectionString.includes('sslmode=')) {
    return connectionString;
  }
  
  // Se é Render, adicionar sslmode=require
  if (connectionString.includes('render.com')) {
    const separator = connectionString.includes('?') ? '&' : '?';
    return `${connectionString}${separator}sslmode=require`;
  }
  
  return connectionString;
}

// Função para criar pool de conexões
function createPool() {
  // Fechar pool existente se houver
  if (pool) {
    pool.end().catch(() => {
      // Ignorar erros ao fechar pool antigo
    });
    pool = null;
  }

  if (config.postgres.connectionString) {
    console.log('📡 Usando DATABASE_URL para conexão PostgreSQL');
    
    // Normalizar connection string (adicionar sslmode se necessário)
    const normalizedConnectionString = normalizeConnectionString(config.postgres.connectionString);
    
    // Detectar se precisa de SSL baseado na URL
    let sslConfig = config.postgres.ssl;
    if (normalizedConnectionString.includes('sslmode=require')) {
      sslConfig = { rejectUnauthorized: false };
      console.log('   🔒 SSL habilitado (sslmode=require)');
    } else if (normalizedConnectionString.includes('render.com')) {
      sslConfig = { rejectUnauthorized: false };
      console.log('   🔒 SSL habilitado (Render.com detectado)');
    }
    
    try {
      pool = new Pool({
        connectionString: normalizedConnectionString,
        ssl: sslConfig,
        max: config.postgres.max,
        idleTimeoutMillis: config.postgres.idleTimeoutMillis,
        connectionTimeoutMillis: config.postgres.connectionTimeoutMillis,
        // Configurações adicionais para melhor performance
        statement_timeout: 30000, // 30 segundos
        query_timeout: 30000
      });
    } catch (error) {
      console.error('❌ Erro ao criar pool com DATABASE_URL:', error.message);
      throw error;
    }
  } else if (config.postgres.host && config.postgres.database && config.postgres.user && config.postgres.password) {
    console.log(`📡 Conectando ao PostgreSQL em ${config.postgres.host}:${config.postgres.port || 5432}/${config.postgres.database}`);
    try {
      pool = new Pool({
        host: config.postgres.host,
        port: config.postgres.port || 5432,
        database: config.postgres.database,
        user: config.postgres.user,
        password: config.postgres.password,
        ssl: config.postgres.ssl,
        max: config.postgres.max,
        idleTimeoutMillis: config.postgres.idleTimeoutMillis,
        connectionTimeoutMillis: config.postgres.connectionTimeoutMillis,
        statement_timeout: 30000,
        query_timeout: 30000
      });
    } catch (error) {
      console.error('❌ Erro ao criar pool com configuração manual:', error.message);
      throw error;
    }
  } else {
    console.error('\n========================================');
    console.error('  ERRO: Configuração do PostgreSQL não encontrada!');
    console.error('========================================\n');
    console.error('Para configurar o banco de dados PostgreSQL:\n');
    console.error('OPÇÃO 1 - Criar arquivo .env (RECOMENDADO):');
    console.error('   Crie um arquivo .env na raiz do projeto com:');
    console.error('   DATABASE_URL=postgresql://usuario:senha@host:porta/database?sslmode=require\n');
    console.error('OPÇÃO 2 - Configurar variáveis de ambiente:');
    console.error('   $env:DATABASE_URL="postgresql://usuario:senha@host:porta/database?sslmode=require"');
    console.error('   npm run dev\n');
    console.error('OPÇÃO 3 - Configurar variáveis individuais:');
    console.error('   $env:DB_HOST="seu-host.render.com"');
    console.error('   $env:DB_PORT="5432"');
    console.error('   $env:DB_NAME="anubis"');
    console.error('   $env:DB_USER="seu_usuario"');
    console.error('   $env:DB_PASSWORD="sua_senha"');
    console.error('   npm run dev\n');
    console.error('Veja README.md para instruções completas\n');
    throw new Error('Configuração do PostgreSQL não encontrada. Crie um arquivo .env ou veja README.md');
  }

  // Event handlers do pool
  pool.on('connect', (client) => {
    console.log('✅ Nova conexão estabelecida com PostgreSQL');
    connectionRetries = 0; // Reset retry counter on successful connection
  });

  pool.on('error', (err) => {
    console.error('❌ Erro inesperado no pool PostgreSQL:', err.message);
    // Tentar reconectar se não estiver inicializado
    if (!isInitialized && connectionRetries < MAX_RETRIES) {
      connectionRetries++;
      console.log(`🔄 Tentando reconectar... (${connectionRetries}/${MAX_RETRIES})`);
      setTimeout(() => {
        try {
          createPool();
          initDatabase().catch(() => {
            // Silenciosamente falhar, será tentado novamente
          });
        } catch (error) {
          console.error('❌ Erro ao recriar pool:', error.message);
        }
      }, RETRY_DELAY);
    }
  });

  return pool;
}

// Função para obter ou criar o pool (lazy initialization)
function getPool() {
  if (!pool) {
    if (!hasConfig()) {
      throw new Error('Configuração do PostgreSQL não encontrada. Crie um arquivo .env ou veja README.md');
    }
    createPool();
  }
  return pool;
}

// Função para testar conexão com retry
async function testConnection(retries = MAX_RETRIES) {
  if (!hasConfig()) {
    throw new Error('Configuração do PostgreSQL não encontrada');
  }

  const currentPool = getPool();
  
  for (let i = 0; i < retries; i++) {
    try {
      const result = await currentPool.query('SELECT NOW() as current_time, version() as version');
      const dbTime = result.rows[0].current_time;
      const dbVersion = result.rows[0].version.split(' ')[0] + ' ' + result.rows[0].version.split(' ')[1];
      console.log(`✅ Conexão com PostgreSQL estabelecida (${dbVersion})`);
      console.log(`   Hora do servidor: ${dbTime}`);
      return true;
    } catch (error) {
      if (i < retries - 1) {
        console.log(`⚠️  Tentativa ${i + 1}/${retries} falhou. Tentando novamente em ${RETRY_DELAY / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        // Tentar recriar o pool se houver erro de conexão
        if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
          try {
            createPool();
          } catch (poolError) {
            // Ignorar erro ao recriar pool
          }
        }
      } else {
        throw error;
      }
    }
  }
}

// Função para executar query com retry automático
async function queryWithRetry(text, params, retries = 3) {
  if (!hasConfig()) {
    throw new Error('Configuração do PostgreSQL não encontrada');
  }

  const currentPool = getPool();
  
  for (let i = 0; i < retries; i++) {
    try {
      return await currentPool.query(text, params);
    } catch (error) {
      // Se for erro de conexão e ainda tiver tentativas, tenta novamente
      if ((error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') && i < retries - 1) {
        console.log(`⚠️  Erro de conexão na query. Tentando novamente... (${i + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        // Tentar recriar o pool
        try {
          createPool();
        } catch (poolError) {
          // Ignorar erro ao recriar pool
        }
        continue;
      }
      throw error;
    }
  }
}

// Health check do banco de dados
async function healthCheck() {
  try {
    if (!hasConfig()) {
      return {
        status: 'unhealthy',
        connected: false,
        error: 'Configuração do PostgreSQL não encontrada'
      };
    }

    const currentPool = getPool();
    const result = await currentPool.query('SELECT 1 as health');
    return {
      status: 'healthy',
      connected: true,
      poolSize: currentPool.totalCount,
      idleConnections: currentPool.idleCount,
      waitingClients: currentPool.waitingCount
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      connected: false,
      error: error.message,
      code: error.code
    };
  }
}

// Inicializar banco de dados
async function initDatabase() {
  try {
    // Verificar se há configuração antes de tentar conectar
    if (!hasConfig()) {
      throw new Error('Configuração do PostgreSQL não encontrada. Crie um arquivo .env ou veja README.md');
    }

    // Criar pool se ainda não foi criado
    getPool();
    
    // Testar conexão com retry
    await testConnection();
    
    // Criar tabelas
    console.log('📋 Criando tabelas do banco de dados...');
    
    await queryWithRetry(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryWithRetry(`
      CREATE TABLE IF NOT EXISTS cards (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        icon VARCHAR(255),
        color VARCHAR(50),
        thumbnail_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Adicionar coluna thumbnail_url se não existir (para bancos existentes)
    await queryWithRetry(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='cards' AND column_name='thumbnail_url') THEN
          ALTER TABLE cards ADD COLUMN thumbnail_url TEXT;
        END IF;
      END $$;
    `);

    await queryWithRetry(`
      CREATE TABLE IF NOT EXISTS links (
        id SERIAL PRIMARY KEY,
        card_id INTEGER NOT NULL,
        title VARCHAR(255),
        url TEXT NOT NULL,
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
      )
    `);

    await queryWithRetry(`
      CREATE TABLE IF NOT EXISTS tags (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        color VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryWithRetry(`
      CREATE TABLE IF NOT EXISTS card_tags (
        card_id INTEGER NOT NULL,
        tag_id INTEGER NOT NULL,
        PRIMARY KEY (card_id, tag_id),
        FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      )
    `);

    await queryWithRetry(`
      CREATE TABLE IF NOT EXISTS card_user_access (
        card_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (card_id, user_id),
        FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await queryWithRetry(`
      CREATE TABLE IF NOT EXISTS card_requests (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        icon VARCHAR(255),
        thumbnail_url TEXT,
        requested_by INTEGER,
        card_id INTEGER,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE SET NULL
      )
    `);

    // Adicionar coluna card_id se não existir (para bancos existentes)
    await queryWithRetry(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='card_requests' AND column_name='card_id') THEN
          ALTER TABLE card_requests ADD COLUMN card_id INTEGER REFERENCES cards(id) ON DELETE SET NULL;
        END IF;
      END $$;
    `);

    // Criar tag especial "request" se não existir
    const tagResult = await queryWithRetry(
      'SELECT id FROM tags WHERE name = $1',
      ['request']
    );
    
    if (tagResult.rows.length === 0) {
      await queryWithRetry(
        'INSERT INTO tags (name, color) VALUES ($1, $2)',
        ['request', '#4ade80']
      );
      console.log('✅ Tag especial "request" criada');
    }

    // Criar índices para melhor performance
    console.log('📊 Criando índices para otimização...');
    await queryWithRetry(`CREATE INDEX IF NOT EXISTS idx_links_card_id ON links(card_id)`);
    await queryWithRetry(`CREATE INDEX IF NOT EXISTS idx_card_tags_card_id ON card_tags(card_id)`);
    await queryWithRetry(`CREATE INDEX IF NOT EXISTS idx_card_tags_tag_id ON card_tags(tag_id)`);
    await queryWithRetry(`CREATE INDEX IF NOT EXISTS idx_cards_title ON cards(title)`);
    await queryWithRetry(`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`);
    await queryWithRetry(`CREATE INDEX IF NOT EXISTS idx_card_user_access_card_id ON card_user_access(card_id)`);
    await queryWithRetry(`CREATE INDEX IF NOT EXISTS idx_card_user_access_user_id ON card_user_access(user_id)`);
    await queryWithRetry(`CREATE INDEX IF NOT EXISTS idx_card_requests_status ON card_requests(status)`);
    await queryWithRetry(`CREATE INDEX IF NOT EXISTS idx_card_requests_requested_by ON card_requests(requested_by)`);

    // Criar usuário admin padrão (se configurado)
    if (config.init.createDefaultAdmin) {
      const result = await queryWithRetry(
        'SELECT COUNT(*) as count FROM users WHERE is_admin = TRUE'
      );
      
      if (parseInt(result.rows[0].count) === 0) {
        const hashedPassword = bcrypt.hashSync(config.init.defaultAdmin.password, 10);
        await queryWithRetry(
          'INSERT INTO users (username, password, is_admin) VALUES ($1, $2, $3)',
          [config.init.defaultAdmin.username, hashedPassword, true]
        );
        console.log(`👤 Usuário admin criado: ${config.init.defaultAdmin.username} / ${config.init.defaultAdmin.password}`);
      }
    }

    isInitialized = true;
    console.log('✅ Banco de dados PostgreSQL inicializado com sucesso');
    return true;
  } catch (error) {
    isInitialized = false;
    if (error.code === 'ECONNREFUSED') {
      console.error('\n❌ ERRO: Não foi possível conectar ao PostgreSQL!');
      if (config.postgres.connectionString) {
        const url = new URL(config.postgres.connectionString);
        console.error(`   Tentando conectar em: ${url.hostname}:${url.port || 5432}`);
      } else {
        console.error(`   Tentando conectar em: ${config.postgres.host || 'localhost'}:${config.postgres.port || 5432}`);
      }
      console.error('\n📋 Verifique:');
      console.error('   1. Se o servidor PostgreSQL está rodando');
      console.error('   2. Se as credenciais estão corretas');
      console.error('   3. Se a DATABASE_URL está configurada corretamente');
      console.error('   4. Se o firewall permite conexões');
      console.error('\n📖 Veja RENDER_SETUP.md para instruções de configuração\n');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('\n❌ ERRO: Timeout ao conectar ao PostgreSQL!');
      console.error('   O servidor pode estar sobrecarregado ou a rede está lenta.');
      console.error('   Tente novamente em alguns instantes.\n');
    } else {
      console.error('❌ Erro ao inicializar banco de dados:', error.message);
      if (error.code) {
        console.error(`   Código do erro: ${error.code}`);
      }
    }
    throw error;
  }
}

// Função para fechar conexões gracefulmente
async function closePool() {
  if (pool) {
    console.log('🔌 Fechando conexões com o banco de dados...');
    try {
      await pool.end();
      console.log('✅ Conexões fechadas com sucesso');
    } catch (error) {
      console.error('⚠️  Erro ao fechar conexões:', error.message);
    } finally {
      pool = null;
    }
  }
}

// Exportar funções
module.exports = {
  get pool() { return pool; },
  initDatabase,
  healthCheck,
  queryWithRetry,
  closePool,
  get isInitialized() { return isInitialized; },
  hasConfig
};

// Funções CRUD (usando queryWithRetry)
module.exports.getAllCards = async function(search = '', tagIds = []) {
  let query = 'SELECT c.*, COALESCE(STRING_AGG(t.id::text, \',\'), \'\') as tag_ids FROM cards c LEFT JOIN card_tags ct ON c.id = ct.card_id LEFT JOIN tags t ON ct.tag_id = t.id';
  const params = [];
  
  if (search) {
    query += ' WHERE (c.title ILIKE $1 OR c.description ILIKE $1)';
    params.push(`%${search}%`);
  }
  
  if (tagIds.length > 0) {
    if (search) {
      query += ' AND t.id = ANY($2)';
    } else {
      query += ' WHERE t.id = ANY($1)';
      params.push(tagIds);
    }
  }
  
  query += ' GROUP BY c.id ORDER BY c.id ASC';
  
  const result = await queryWithRetry(query, params);
  return result.rows.map(row => ({
    ...row,
    tag_ids: row.tag_ids ? row.tag_ids.split(',').map(Number) : []
  }));
};

module.exports.getCardById = async function(id) {
  const result = await queryWithRetry(
    'SELECT * FROM cards WHERE id = $1',
    [id]
  );
  return result.rows[0];
};

module.exports.createCard = async function(card) {
  const result = await queryWithRetry(
    'INSERT INTO cards (title, description, icon, color, thumbnail_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [card.title, card.description || null, card.icon || null, card.color || null, card.thumbnail_url || null]
  );
  const newCard = result.rows[0];
  
  // Associar tags
  if (card.tag_ids && card.tag_ids.length > 0) {
    for (const tagId of card.tag_ids) {
      await queryWithRetry(
        'INSERT INTO card_tags (card_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [newCard.id, tagId]
      );
    }
  }
  
  return newCard;
};

module.exports.updateCard = async function(id, card) {
  await queryWithRetry(
    'UPDATE cards SET title = $1, description = $2, icon = $3, color = $4, thumbnail_url = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6',
    [card.title, card.description || null, card.icon || null, card.color || null, card.thumbnail_url || null, id]
  );
  
  // Atualizar tags
  await queryWithRetry('DELETE FROM card_tags WHERE card_id = $1', [id]);
  if (card.tag_ids && card.tag_ids.length > 0) {
    for (const tagId of card.tag_ids) {
      await queryWithRetry(
        'INSERT INTO card_tags (card_id, tag_id) VALUES ($1, $2)',
        [id, tagId]
      );
    }
  }
  
  return await this.getCardById(id);
};

module.exports.deleteCard = async function(id) {
  await queryWithRetry('DELETE FROM cards WHERE id = $1', [id]);
};

module.exports.getLinksByCardId = async function(cardId) {
  const result = await queryWithRetry(
    'SELECT * FROM links WHERE card_id = $1 ORDER BY order_index ASC, id ASC',
    [cardId]
  );
  return result.rows;
};

module.exports.createLink = async function(link) {
  const result = await queryWithRetry(
    'INSERT INTO links (card_id, title, url, order_index) VALUES ($1, $2, $3, $4) RETURNING *',
    [link.card_id, link.title || null, link.url, link.order_index || 0]
  );
  return result.rows[0];
};

module.exports.deleteLink = async function(id) {
  const result = await queryWithRetry(
    'DELETE FROM links WHERE id = $1 RETURNING card_id',
    [id]
  );
  const remainingLinks = await this.getLinksByCardId(result.rows[0].card_id);
  return remainingLinks;
};

module.exports.getAllTags = async function() {
  const result = await queryWithRetry('SELECT * FROM tags ORDER BY name ASC');
  return result.rows;
};

module.exports.createTag = async function(tag) {
  const result = await queryWithRetry(
    'INSERT INTO tags (name, color) VALUES ($1, $2) RETURNING *',
    [tag.name, tag.color || null]
  );
  return result.rows[0];
};

module.exports.updateTag = async function(id, tag) {
  await queryWithRetry(
    'UPDATE tags SET name = $1, color = $2 WHERE id = $3',
    [tag.name, tag.color || null, id]
  );
  const result = await queryWithRetry('SELECT * FROM tags WHERE id = $1', [id]);
  return result.rows[0];
};

module.exports.deleteTag = async function(id) {
  await queryWithRetry('DELETE FROM tags WHERE id = $1', [id]);
};

module.exports.getUserByUsername = async function(username) {
  const result = await queryWithRetry(
    'SELECT * FROM users WHERE username = $1',
    [username]
  );
  return result.rows[0];
};

module.exports.getAllUsers = async function() {
  const result = await queryWithRetry('SELECT id, username, is_admin, created_at FROM users ORDER BY username ASC');
  return result.rows;
};

module.exports.getUserById = async function(id) {
  const result = await queryWithRetry(
    'SELECT id, username, is_admin, created_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0];
};

module.exports.createUser = async function(user) {
  const hashedPassword = bcrypt.hashSync(user.password, 10);
  const result = await queryWithRetry(
    'INSERT INTO users (username, password, is_admin) VALUES ($1, $2, $3) RETURNING id, username, is_admin, created_at',
    [user.username, hashedPassword, user.is_admin || false]
  );
  return result.rows[0];
};

module.exports.updateUser = async function(id, user) {
  if (user.password) {
    const hashedPassword = bcrypt.hashSync(user.password, 10);
    await queryWithRetry(
      'UPDATE users SET username = $1, password = $2, is_admin = $3 WHERE id = $4',
      [user.username, hashedPassword, user.is_admin || false, id]
    );
  } else {
    await queryWithRetry(
      'UPDATE users SET username = $1, is_admin = $2 WHERE id = $3',
      [user.username, user.is_admin || false, id]
    );
  }
  return await this.getUserById(id);
};

module.exports.deleteUser = async function(id) {
  await queryWithRetry('DELETE FROM users WHERE id = $1', [id]);
};

// Funções de controle de acesso aos cards
module.exports.hasCardAccess = async function(userId, cardId, isAdmin) {
  // Admins têm acesso a todos os cards
  if (isAdmin) {
    return true;
  }
  
  const result = await queryWithRetry(
    'SELECT COUNT(*) as count FROM card_user_access WHERE user_id = $1 AND card_id = $2',
    [userId, cardId]
  );
  return parseInt(result.rows[0].count) > 0;
};

module.exports.getCardAccessUsers = async function(cardId) {
  const result = await queryWithRetry(
    `SELECT u.id, u.username, u.is_admin, cua.created_at 
     FROM card_user_access cua
     JOIN users u ON cua.user_id = u.id
     WHERE cua.card_id = $1
     ORDER BY u.username ASC`,
    [cardId]
  );
  return result.rows;
};

module.exports.getUserAccessCards = async function(userId) {
  const result = await queryWithRetry(
    'SELECT card_id FROM card_user_access WHERE user_id = $1',
    [userId]
  );
  return result.rows.map(row => row.card_id);
};

module.exports.grantCardAccess = async function(cardId, userId) {
  try {
    // Verificar se já existe antes de inserir
    const checkResult = await queryWithRetry(
      'SELECT COUNT(*) as count FROM card_user_access WHERE card_id = $1 AND user_id = $2',
      [cardId, userId]
    );
    
    if (parseInt(checkResult.rows[0].count) === 0) {
      await queryWithRetry(
        'INSERT INTO card_user_access (card_id, user_id) VALUES ($1, $2)',
        [cardId, userId]
      );
    }
  } catch (error) {
    console.error('Erro ao conceder acesso:', error);
    throw error;
  }
};

module.exports.revokeCardAccess = async function(cardId, userId) {
  await queryWithRetry(
    'DELETE FROM card_user_access WHERE card_id = $1 AND user_id = $2',
    [cardId, userId]
  );
};

// Funções de solicitações de cards
module.exports.createCardRequest = async function(requestData, userId) {
  const result = await queryWithRetry(
    'INSERT INTO card_requests (title, description, thumbnail_url, requested_by) VALUES ($1, $2, $3, $4) RETURNING *',
    [requestData.title, requestData.description || null, requestData.thumbnail_url || null, userId]
  );
  const request = result.rows[0];
  
  // Criar card temporário apenas com tag "request" para que apareça na lista e possa ser filtrado
  const requestTag = await queryWithRetry('SELECT id FROM tags WHERE name = $1', ['request']);
  const tagIds = [];
  
  // Apenas adicionar a tag "request"
  if (requestTag.rows.length > 0) {
    tagIds.push(requestTag.rows[0].id);
  }
  
  // Criar o card apenas com a tag "request"
  const card = await module.exports.createCard({
    title: `[SOLICITAÇÃO] ${requestData.title}`,
    description: requestData.description || null,
    thumbnail_url: requestData.thumbnail_url || null,
    tag_ids: tagIds
  });
  
  // Atualizar a solicitação com o ID do card criado
  await queryWithRetry(
    'UPDATE card_requests SET card_id = $1 WHERE id = $2',
    [card.id, request.id]
  );
  
  // Retornar a solicitação atualizada
  const updatedRequest = await queryWithRetry(
    'SELECT * FROM card_requests WHERE id = $1',
    [request.id]
  );
  
  return { ...updatedRequest.rows[0], card_id: card.id };
};

module.exports.getAllCardRequests = async function(status = null) {
  let query = `
    SELECT cr.*, u.username as requested_by_username
    FROM card_requests cr
    LEFT JOIN users u ON cr.requested_by = u.id
  `;
  const params = [];
  
  if (status) {
    query += ' WHERE cr.status = $1';
    params.push(status);
  }
  
  query += ' ORDER BY cr.created_at DESC';
  
  const result = await queryWithRetry(query, params);
  return result.rows;
};

module.exports.getCardRequestById = async function(id) {
  const result = await queryWithRetry(
    `SELECT cr.*, u.username as requested_by_username
     FROM card_requests cr
     LEFT JOIN users u ON cr.requested_by = u.id
     WHERE cr.id = $1`,
    [id]
  );
  return result.rows[0];
};

module.exports.updateCardRequestStatus = async function(id, status) {
  await queryWithRetry(
    'UPDATE card_requests SET status = $1 WHERE id = $2',
    [status, id]
  );
  return await this.getCardRequestById(id);
};

module.exports.deleteCardRequest = async function(id) {
  await queryWithRetry('DELETE FROM card_requests WHERE id = $1', [id]);
};
