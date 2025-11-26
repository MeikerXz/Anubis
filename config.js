// Configurações do Banco de Dados PostgreSQL
// Configure via arquivo .env (recomendado) ou variáveis de ambiente

require('dotenv').config();

// Função para determinar se deve usar SSL
function getSslConfig() {
  // Se DATABASE_URL contém sslmode=require, sempre usar SSL
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('sslmode=require')) {
    return { rejectUnauthorized: false };
  }
  
  // Se o host é do Render, sempre usar SSL
  const host = process.env.DB_HOST || (process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL).hostname : null);
  if (host && (host.includes('render.com') || host.includes('render'))) {
    return { rejectUnauthorized: false };
  }
  
  // Em produção, usar SSL por padrão
  if (process.env.NODE_ENV === 'production') {
    return { rejectUnauthorized: false };
  }
  
  // Em desenvolvimento local, não usar SSL
  return false;
}

module.exports = {
  postgres: {
    // Connection string do Render (via .env ou variável de ambiente)
    connectionString: process.env.DATABASE_URL,
    
    // Configuração manual (alternativa se não usar DATABASE_URL)
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    
    // Pool de conexões
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000, // Aumentado para 10 segundos
    ssl: getSslConfig()
  },
  
  init: {
    createDefaultAdmin: true,
    defaultAdmin: {
      username: process.env.ADMIN_USERNAME || 'admin',
      password: process.env.ADMIN_PASSWORD || 'admin123'
    }
  }
};
