// Script para inicializar o banco de dados e criar as tabelas
// Execute: node init-database.js

require('dotenv').config();
const db = require('./database');

async function init() {
  try {
    console.log('\n═══════════════════════════════════════');
    console.log('  🗄️  INICIALIZAÇÃO DO BANCO DE DADOS');
    console.log('═══════════════════════════════════════\n');
    
    console.log('🔄 Inicializando banco de dados...');
    await db.initDatabase();
    
    console.log('\n✅ Banco de dados inicializado com sucesso!');
    console.log('   Todas as tabelas foram criadas.');
    console.log('   O sistema está pronto para uso.\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERRO ao inicializar banco de dados:');
    console.error(`   ${error.message}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Verifique se:');
      console.error('   - O servidor PostgreSQL está rodando');
      console.error('   - A DATABASE_URL está correta no arquivo .env');
    } else if (error.message.includes('Configuração')) {
      console.error('\n💡 Configure o DATABASE_URL no arquivo .env');
    }
    
    console.error('\n');
    process.exit(1);
  }
}

init();

