// Script de diagnóstico para problemas de conexão mobile
// Execute: node diagnose-mobile.js

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

console.log('\n═══════════════════════════════════════');
console.log('  📱 DIAGNÓSTICO DE CONEXÃO MOBILE');
console.log('═══════════════════════════════════════\n');

// Verificar arquivo .env
console.log('📋 1. Verificando arquivo .env...\n');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('   ✅ Arquivo .env encontrado');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  if (envContent.includes('REACT_APP_API_URL')) {
    const match = envContent.match(/REACT_APP_API_URL=(.+)/);
    if (match) {
      const apiUrl = match[1].trim();
      console.log(`   ✅ REACT_APP_API_URL configurada: ${apiUrl}`);
      
      // Verificar se não é o placeholder
      if (apiUrl.includes('seu-servidor-backend.onrender.com') || 
          apiUrl.includes('seu-backend.onrender.com')) {
        console.log('   ⚠️  ATENÇÃO: URL é um placeholder! Configure a URL real do seu backend.');
      }
    } else {
      console.log('   ⚠️  REACT_APP_API_URL encontrada mas sem valor');
    }
  } else {
    console.log('   ❌ REACT_APP_API_URL não encontrada no .env');
    console.log('   📝 Adicione: REACT_APP_API_URL=https://seu-backend.onrender.com');
  }
} else {
  console.log('   ❌ Arquivo .env não encontrado!');
  console.log('   📝 Crie um arquivo .env na raiz do projeto com:');
  console.log('      REACT_APP_API_URL=https://seu-backend.onrender.com');
}

// Verificar variável de ambiente atual
console.log('\n📋 2. Verificando variável de ambiente atual...\n');
const currentApiUrl = process.env.REACT_APP_API_URL;
if (currentApiUrl) {
  console.log(`   ✅ REACT_APP_API_URL: ${currentApiUrl}`);
} else {
  console.log('   ⚠️  REACT_APP_API_URL não está definida no ambiente atual');
  console.log('   💡 Isso é normal se você ainda não fez o build');
}

// Verificar build
console.log('\n📋 3. Verificando build do React...\n');
const buildPath = path.join(__dirname, 'build');
if (fs.existsSync(buildPath)) {
  console.log('   ✅ Pasta build encontrada');
  
  // Verificar se há arquivos JS no build
  const buildJsPath = path.join(buildPath, 'static', 'js');
  if (fs.existsSync(buildJsPath)) {
    const jsFiles = fs.readdirSync(buildJsPath).filter(f => f.endsWith('.js'));
    if (jsFiles.length > 0) {
      console.log(`   ✅ Build contém ${jsFiles.length} arquivo(s) JavaScript`);
      
      // Tentar verificar se a URL está no build (limitado, mas útil)
      const mainJsFile = path.join(buildJsPath, jsFiles[0]);
      try {
        const jsContent = fs.readFileSync(mainJsFile, 'utf8');
        if (currentApiUrl && jsContent.includes(currentApiUrl)) {
          console.log(`   ✅ URL da API encontrada no build: ${currentApiUrl}`);
        } else if (jsContent.includes('seu-servidor-backend.onrender.com')) {
          console.log('   ⚠️  Placeholder encontrado no build - faça rebuild após configurar .env');
        } else {
          console.log('   ⚠️  Não foi possível verificar se a URL está no build');
        }
      } catch (error) {
        console.log('   ⚠️  Não foi possível ler o arquivo do build');
      }
    } else {
      console.log('   ⚠️  Nenhum arquivo JavaScript encontrado no build');
    }
  }
} else {
  console.log('   ⚠️  Pasta build não encontrada');
  console.log('   📝 Execute: npm run build');
}

// Verificar Capacitor
console.log('\n📋 4. Verificando configuração do Capacitor...\n');
const capacitorConfigPath = path.join(__dirname, 'capacitor.config.json');
if (fs.existsSync(capacitorConfigPath)) {
  console.log('   ✅ capacitor.config.json encontrado');
  try {
    const capacitorConfig = JSON.parse(fs.readFileSync(capacitorConfigPath, 'utf8'));
    
    if (capacitorConfig.server && capacitorConfig.server.allowNavigation) {
      const allowNav = capacitorConfig.server.allowNavigation;
      if (Array.isArray(allowNav) && allowNav.length > 0) {
        console.log(`   ✅ allowNavigation configurado: ${allowNav.join(', ')}`);
      } else {
        console.log('   ⚠️  allowNavigation está vazio ou inválido');
      }
    } else {
      console.log('   ⚠️  allowNavigation não configurado');
    }
    
    if (capacitorConfig.android && capacitorConfig.android.allowMixedContent) {
      console.log('   ✅ allowMixedContent habilitado');
    }
  } catch (error) {
    console.log('   ⚠️  Erro ao ler capacitor.config.json:', error.message);
  }
} else {
  console.log('   ⚠️  capacitor.config.json não encontrado');
}

// Verificar AndroidManifest
console.log('\n📋 5. Verificando AndroidManifest.xml...\n');
const manifestPath = path.join(__dirname, 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
if (fs.existsSync(manifestPath)) {
  console.log('   ✅ AndroidManifest.xml encontrado');
  const manifestContent = fs.readFileSync(manifestPath, 'utf8');
  
  if (manifestContent.includes('android.permission.INTERNET')) {
    console.log('   ✅ Permissão INTERNET configurada');
  } else {
    console.log('   ❌ Permissão INTERNET não encontrada!');
  }
  
  if (manifestContent.includes('network_security_config')) {
    console.log('   ✅ network_security_config configurado');
  } else {
    console.log('   ⚠️  network_security_config não encontrado');
  }
  
  if (manifestContent.includes('usesCleartextTraffic')) {
    console.log('   ✅ usesCleartextTraffic configurado');
  }
} else {
  console.log('   ⚠️  AndroidManifest.xml não encontrado');
}

// Testar conexão com backend
console.log('\n📋 6. Testando conexão com backend...\n');
const apiUrl = currentApiUrl || process.env.REACT_APP_API_URL || 'https://seu-servidor-backend.onrender.com';

if (apiUrl && !apiUrl.includes('seu-servidor-backend.onrender.com') && !apiUrl.includes('seu-backend.onrender.com')) {
  const testUrl = apiUrl.endsWith('/api') ? `${apiUrl}/health` : `${apiUrl}/api/health`;
  console.log(`   🔍 Testando: ${testUrl}`);
  
  const url = new URL(testUrl);
  const client = url.protocol === 'https:' ? https : http;
  
  const request = client.get(testUrl, { timeout: 10000 }, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log('   ✅ Backend está online e respondendo!');
        try {
          const json = JSON.parse(data);
          if (json.database && json.database.status) {
            console.log(`   ✅ Banco de dados: ${json.database.status === 'healthy' ? 'Conectado' : 'Desconectado'}`);
          }
        } catch (e) {
          // Ignorar erro de parse
        }
      } else {
        console.log(`   ⚠️  Backend respondeu com status ${res.statusCode}`);
      }
      printSummary();
    });
  });
  
  request.on('error', (error) => {
    console.log(`   ❌ Erro ao conectar: ${error.message}`);
    console.log('   💡 Verifique se:');
    console.log('      - O backend está online');
    console.log('      - A URL está correta');
    console.log('      - Não há firewall bloqueando');
    printSummary();
  });
  
  request.on('timeout', () => {
    request.destroy();
    console.log('   ❌ Timeout ao conectar (10s)');
    console.log('   💡 O backend pode estar offline ou a URL está incorreta');
    printSummary();
  });
  
  request.setTimeout(10000);
} else {
  console.log('   ⚠️  URL não configurada ou é placeholder - pulando teste de conexão');
  printSummary();
}

function printSummary() {
  console.log('\n═══════════════════════════════════════');
  console.log('  📝 RESUMO E PRÓXIMOS PASSOS');
  console.log('═══════════════════════════════════════\n');
  
  console.log('Para corrigir problemas de conexão mobile:\n');
  
  console.log('1. ✅ Configure REACT_APP_API_URL no arquivo .env:');
  console.log('   REACT_APP_API_URL=https://seu-backend-real.onrender.com\n');
  
  console.log('2. ✅ Faça rebuild completo:');
  console.log('   npm run build\n');
  
  console.log('3. ✅ Sincronize com Capacitor:');
  console.log('   npm run mobile:sync\n');
  
  console.log('4. ✅ Rebuild do APK:');
  console.log('   npm run mobile:apk\n');
  
  console.log('⚠️  IMPORTANTE:');
  console.log('   - A URL deve apontar para um backend HOSPEDADO (não localhost)');
  console.log('   - O backend precisa estar ONLINE e ACESSÍVEL pela internet');
  console.log('   - Teste a URL no navegador: https://seu-backend.com/api/health\n');
  
  console.log('═══════════════════════════════════════\n');
}

