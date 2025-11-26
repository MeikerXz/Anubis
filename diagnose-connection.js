// Script de diagnóstico de conexão PostgreSQL
// Execute: node diagnose-connection.js

require('dotenv').config();
const { Pool } = require('pg');
const config = require('./config');

// Função principal assíncrona
async function diagnose() {
  console.log('\n═══════════════════════════════════════');
  console.log('  🔍 DIAGNÓSTICO DE CONEXÃO POSTGRESQL');
  console.log('═══════════════════════════════════════\n');

  // Verificar variáveis de ambiente
  console.log('📋 Verificando configuração...\n');

  let hasConnectionString = !!config.postgres.connectionString;
  let hasManualConfig = !!(config.postgres.host && config.postgres.database && config.postgres.user && config.postgres.password);

  console.log(`DATABASE_URL configurado: ${hasConnectionString ? '✅ Sim' : '❌ Não'}`);
  if (hasConnectionString) {
    try {
      const url = new URL(config.postgres.connectionString);
      console.log(`   Host: ${url.hostname}`);
      console.log(`   Porta: ${url.port || 5432}`);
      console.log(`   Database: ${url.pathname.slice(1)}`);
      console.log(`   Usuário: ${url.username || 'não especificado'}`);
    } catch (error) {
      console.log(`   ⚠️  DATABASE_URL inválido: ${error.message}`);
    }
  }

  console.log(`\nConfiguração manual: ${hasManualConfig ? '✅ Sim' : '❌ Não'}`);
  if (hasManualConfig) {
    console.log(`   Host: ${config.postgres.host}`);
    console.log(`   Porta: ${config.postgres.port || 5432}`);
    console.log(`   Database: ${config.postgres.database}`);
    console.log(`   Usuário: ${config.postgres.user}`);
    console.log(`   Senha: ${config.postgres.password ? '***' : 'não configurada'}`);
  }

  if (!hasConnectionString && !hasManualConfig) {
    console.log('\n❌ ERRO: Nenhuma configuração encontrada!');
    console.log('\n📝 Para configurar:');
    console.log('   1. Crie um arquivo .env na raiz do projeto');
    console.log('   2. Adicione: DATABASE_URL=postgresql://usuario:senha@host:porta/database');
    console.log('   3. Ou configure variáveis individuais: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD');
    process.exit(1);
  }

  // Função para normalizar connection string
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

  // Tentar conectar
  console.log('\n🔌 Tentando conectar ao banco de dados...\n');

  let pool;
  try {
    // Detectar se precisa de SSL
    let sslConfig = config.postgres.ssl;
    let connectionString = config.postgres.connectionString;
    
    if (hasConnectionString) {
      // Normalizar connection string
      connectionString = normalizeConnectionString(config.postgres.connectionString);
      
      if (connectionString.includes('sslmode=require')) {
        sslConfig = { rejectUnauthorized: false };
        console.log('   🔒 SSL habilitado (sslmode=require)');
      } else if (connectionString.includes('render.com')) {
        sslConfig = { rejectUnauthorized: false };
        console.log('   🔒 SSL habilitado (Render.com detectado)');
      }
      
      pool = new Pool({
        connectionString: connectionString,
        ssl: sslConfig,
        connectionTimeoutMillis: 15000 // Aumentado para 15 segundos
      });
    } else {
      // Verificar se é Render
      if (config.postgres.host && config.postgres.host.includes('render.com')) {
        sslConfig = { rejectUnauthorized: false };
        console.log('   🔒 SSL habilitado (Render.com detectado)');
      }
      
      pool = new Pool({
        host: config.postgres.host,
        port: config.postgres.port || 5432,
        database: config.postgres.database,
        user: config.postgres.user,
        password: config.postgres.password,
        ssl: sslConfig,
        connectionTimeoutMillis: 15000 // Aumentado para 15 segundos
      });
    }

    // Testar conexão
    const startTime = Date.now();
    const result = await pool.query('SELECT NOW() as current_time, version() as version, current_database() as database');
    const duration = Date.now() - startTime;

    console.log('✅ Conexão estabelecida com sucesso!');
    console.log(`   Tempo de resposta: ${duration}ms`);
    console.log(`   Database: ${result.rows[0].database}`);
    console.log(`   Versão: ${result.rows[0].version.split(' ')[0]} ${result.rows[0].version.split(' ')[1]}`);
    console.log(`   Hora do servidor: ${result.rows[0].current_time}`);

    // Verificar tabelas
    console.log('\n📊 Verificando tabelas...');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    if (tablesResult.rows.length > 0) {
      console.log(`   ✅ Encontradas ${tablesResult.rows.length} tabela(s):`);
      tablesResult.rows.forEach(row => {
        console.log(`      - ${row.table_name}`);
      });
    } else {
      console.log('   ⚠️  Nenhuma tabela encontrada (banco de dados vazio)');
    }

    await pool.end();
    console.log('\n✅ Diagnóstico concluído com sucesso!\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ ERRO ao conectar ao banco de dados:');
    console.error(`   Mensagem: ${error.message}`);
    
    if (error.code) {
      console.error(`   Código: ${error.code}`);
    }

    // Mensagens de erro específicas
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Possíveis causas:');
      console.error('   - Servidor PostgreSQL não está rodando');
      console.error('   - Host ou porta incorretos');
      console.error('   - Firewall bloqueando a conexão');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('\n💡 Possíveis causas:');
      console.error('   - Servidor PostgreSQL não está respondendo');
      console.error('   - Rede lenta ou instável');
      console.error('   - Servidor sobrecarregado');
    } else if (error.code === 'ENOTFOUND') {
      console.error('\n💡 Possíveis causas:');
      console.error('   - Hostname não encontrado (DNS)');
      console.error('   - URL do banco de dados incorreta');
    } else if (error.code === '28P01' || error.message.includes('password')) {
      console.error('\n💡 Possíveis causas:');
      console.error('   - Usuário ou senha incorretos');
      console.error('   - Credenciais não configuradas corretamente');
    } else if (error.code === '3D000' || error.message.includes('database')) {
      console.error('\n💡 Possíveis causas:');
      console.error('   - Database não existe');
      console.error('   - Nome do database incorreto');
    } else if (error.code === '23505') {
      console.error('\n💡 Erro de violação de constraint única');
    } else if (error.code === 'ECONNRESET') {
      console.error('\n💡 Possíveis causas:');
      console.error('   - Problema com configuração SSL');
      console.error('   - Timeout de conexão muito curto');
      console.error('   - Firewall ou proxy bloqueando a conexão');
      console.error('\n🔧 Tentativas de solução:');
      console.error('   1. Verifique se a DATABASE_URL contém "sslmode=require"');
      console.error('   2. Se estiver usando Render, certifique-se de usar a External Database URL');
      console.error('   3. Tente aumentar o timeout de conexão');
    }

    if (pool) {
      try {
        await pool.end();
      } catch (closeError) {
        // Ignorar erro ao fechar
      }
    }

    console.error('\n📖 Veja README.md ou RENDER_SETUP.md para mais informações\n');
    process.exit(1);
  }
}

// Executar diagnóstico
diagnose().catch(error => {
  console.error('\n❌ Erro fatal no diagnóstico:', error.message);
  process.exit(1);
});

