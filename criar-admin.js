// Script para criar usuário admin via linha de comando
// Uso: node criar-admin.js [usuario] [senha]

// Carregar variáveis de ambiente do arquivo .env
require('dotenv').config();

const db = require('./database');

async function criarAdmin() {
  try {
    console.log('🔄 Inicializando banco de dados...');
    await db.initDatabase();
    console.log('✅ Banco de dados inicializado\n');
    
    const username = process.argv[2] || 'novo_admin';
    const password = process.argv[3] || 'senha123';
    const isAdmin = true;
    
    if (!process.argv[3]) {
      console.log('⚠️  AVISO: Usando senha padrão "senha123"');
      console.log('   Para usar senha customizada: node criar-admin.js usuario senha\n');
    }
    
    console.log(`📝 Criando usuário admin...`);
    console.log(`   Usuário: ${username}`);
    console.log(`   É Admin: Sim\n`);
    
    const userId = await db.createUser({
      username: username,
      password: password,
      is_admin: isAdmin
    });
    
    console.log('✅ Admin criado com sucesso!');
    console.log(`   ID: ${userId}`);
    console.log(`   Usuário: ${username}`);
    console.log(`   Senha: ${password}`);
    console.log('\n⚠️  IMPORTANTE: Anote essas credenciais e altere a senha após o primeiro login!\n');
    
  } catch (error) {
    if (error.code === '23505') {
      console.error('❌ ERRO: Usuário já existe!');
      console.error('   Escolha outro nome de usuário.\n');
    } else if (error.message.includes('Configuração do PostgreSQL')) {
      console.error('❌ ERRO: Banco de dados não configurado!');
      console.error('   Execute primeiro: .\\configurar-db.ps1\n');
    } else {
      console.error('❌ Erro:', error.message);
      console.error('\n');
    }
  }
  
  process.exit(0);
}

criarAdmin();

