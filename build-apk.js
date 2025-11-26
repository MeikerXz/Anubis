#!/usr/bin/env node

/**
 * Script automatizado para compilar e gerar APK do ANUBIS
 * 
 * Uso:
 *   node build-apk.js              # Gera APK debug
 *   node build-apk.js --release    # Gera APK release (assinado)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function exec(command, options = {}) {
  try {
    log(`\n▶ Executando: ${command}`, 'cyan');
    execSync(command, { 
      stdio: 'inherit', 
      cwd: process.cwd(),
      ...options 
    });
    return true;
  } catch (error) {
    log(`\n❌ Erro ao executar: ${command}`, 'red');
    return false;
  }
}

function checkFileExists(filePath) {
  return fs.existsSync(path.join(process.cwd(), filePath));
}

function checkJavaVersion() {
  try {
    const javaVersion = execSync('java -version', { 
      encoding: 'utf8', 
      stdio: ['pipe', 'pipe', 'pipe'] 
    });
    
    // Extrair versão do stderr (java -version escreve no stderr)
    const stderr = execSync('java -version 2>&1', { encoding: 'utf8' });
    const versionMatch = stderr.match(/version "(\d+)/);
    
    if (versionMatch) {
      const majorVersion = parseInt(versionMatch[1]);
      return majorVersion;
    }
    return null;
  } catch (error) {
    return null;
  }
}

function main() {
  const isRelease = process.argv.includes('--release');
  const buildType = isRelease ? 'release' : 'debug';
  
  log('\n═══════════════════════════════════════════════════', 'bright');
  log('🚀 ANUBIS - Gerador de APK Automatizado', 'bright');
  log('═══════════════════════════════════════════════════\n', 'bright');

  // Verificar pré-requisitos
  log('📋 Verificando pré-requisitos...', 'yellow');
  
  if (!checkFileExists('package.json')) {
    log('❌ package.json não encontrado! Execute este script na raiz do projeto.', 'red');
    process.exit(1);
  }

  // Verificar versão do Java
  log('☕ Verificando versão do Java...', 'yellow');
  const javaVersion = checkJavaVersion();
  if (javaVersion === null) {
    log('❌ Java não encontrado! Instale o Java JDK 11 ou superior.', 'red');
    log('   Download: https://adoptium.net/', 'yellow');
    process.exit(1);
  } else if (javaVersion < 11) {
    log(`❌ Java ${javaVersion} detectado. O Gradle requer Java 11 ou superior!`, 'red');
    log('\n💡 Solução:', 'yellow');
    log('   1. Instale Java JDK 11+ de: https://adoptium.net/', 'cyan');
    log('   2. Configure a variável de ambiente JAVA_HOME:', 'cyan');
    log('      Exemplo: JAVA_HOME=C:\\Program Files\\Eclipse Adoptium\\jdk-11.0.x', 'cyan');
    log('   3. Adicione %JAVA_HOME%\\bin ao PATH', 'cyan');
    log('   4. Reinicie o terminal e execute novamente', 'cyan');
    log('\n   Ou configure no gradle.properties:', 'yellow');
    log('   Adicione em android/gradle.properties:', 'cyan');
    log('   org.gradle.java.home=C:\\caminho\\para\\jdk-11', 'cyan');
    process.exit(1);
  } else {
    log(`✅ Java ${javaVersion} detectado (OK)`, 'green');
  }

  if (!checkFileExists('android')) {
    log('⚠️  Pasta android não encontrada. Inicializando Capacitor...', 'yellow');
    if (!exec('npm run mobile:init')) {
      log('❌ Falha ao inicializar Capacitor', 'red');
      process.exit(1);
    }
  }

  // Passo 1: Build do React
  log('\n📦 Passo 1: Compilando React...', 'yellow');
  if (!exec('npm run build')) {
    log('❌ Falha ao compilar React', 'red');
    process.exit(1);
  }
  log('✅ Build do React concluído!', 'green');

  // Passo 2: Sincronizar com Capacitor
  log('\n🔄 Passo 2: Sincronizando com Capacitor...', 'yellow');
  if (!exec('npm run mobile:sync')) {
    log('❌ Falha ao sincronizar com Capacitor', 'red');
    process.exit(1);
  }
  log('✅ Sincronização concluída!', 'green');

  // Passo 3: Gerar APK
  log(`\n🔨 Passo 3: Gerando APK ${buildType}...`, 'yellow');
  
  // Verificar se gradlew existe
  if (!checkFileExists('android/gradlew.bat') && !checkFileExists('android/gradlew')) {
    log('❌ gradlew não encontrado na pasta android!', 'red');
    log('   Execute: npm run mobile:init', 'yellow');
    process.exit(1);
  }
  
  // Tentar encontrar e configurar JAVA_HOME
  let javaHome = process.env.JAVA_HOME;
  
  // Se JAVA_HOME não está definido ou está inválido, tentar encontrar Java
  if (!javaHome || !fs.existsSync(javaHome)) {
    log('🔍 Procurando instalação do Java...', 'yellow');
    
    // Tentar encontrar Java nos locais comuns do Windows
    const possiblePaths = [
      'C:\\Program Files\\Eclipse Adoptium\\jdk-21.0.9.10-hotspot',
      'C:\\Program Files\\Eclipse Adoptium\\jdk-17.0.11+9',
      'C:\\Program Files\\Java\\jdk-21',
      'C:\\Program Files\\Java\\jdk-17',
    ];
    
    // Tentar ler do gradle.properties
    const gradlePropsPath = path.join(process.cwd(), 'android', 'gradle.properties');
    if (fs.existsSync(gradlePropsPath)) {
      const gradleProps = fs.readFileSync(gradlePropsPath, 'utf8');
      const match = gradleProps.match(/org\.gradle\.java\.home=(.+)/);
      if (match) {
        const gradleJavaHome = match[1].trim().replace(/\\\\/g, '\\');
        if (fs.existsSync(gradleJavaHome)) {
          javaHome = gradleJavaHome;
          log(`✅ Java encontrado via gradle.properties: ${javaHome}`, 'green');
        }
      }
    }
    
    // Se ainda não encontrou, procurar nos caminhos possíveis
    if (!javaHome || !fs.existsSync(javaHome)) {
      for (const possiblePath of possiblePaths) {
        if (fs.existsSync(possiblePath)) {
          javaHome = possiblePath;
          log(`✅ Java encontrado: ${javaHome}`, 'green');
          break;
        }
      }
    }
    
    // Se encontrou um Java válido, definir como variável de ambiente para esta execução
    if (javaHome && fs.existsSync(javaHome)) {
      process.env.JAVA_HOME = javaHome;
      log(`✅ JAVA_HOME definido para esta execução: ${javaHome}`, 'green');
    } else {
      log('⚠️  Não foi possível encontrar JAVA_HOME automaticamente', 'yellow');
      log('   O Gradle tentará usar o JAVA_HOME do sistema', 'yellow');
    }
  } else {
    log(`✅ JAVA_HOME já configurado: ${javaHome}`, 'green');
  }
  
  const gradlew = process.platform === 'win32' ? '.\\gradlew.bat' : './gradlew';
  const buildCommand = isRelease 
    ? `${gradlew} assembleRelease`
    : `${gradlew} assembleDebug`;

  // Mudar para diretório android
  const originalDir = process.cwd();
  process.chdir('android');

  // Executar com JAVA_HOME definido
  if (!exec(buildCommand, { 
    env: { ...process.env, JAVA_HOME: javaHome || process.env.JAVA_HOME }
  })) {
    log('❌ Falha ao gerar APK', 'red');
    process.chdir(originalDir);
    process.exit(1);
  }

  // Voltar para raiz
  process.chdir(originalDir);

  // Verificar se APK foi gerado
  const apkPath = isRelease
    ? 'android/app/build/outputs/apk/release/app-release.apk'
    : 'android/app/build/outputs/apk/debug/app-debug.apk';

  if (checkFileExists(apkPath)) {
    const stats = fs.statSync(apkPath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    log('\n═══════════════════════════════════════════════════', 'green');
    log('✅ APK GERADO COM SUCESSO!', 'green');
    log('═══════════════════════════════════════════════════\n', 'green');
    log(`📱 Arquivo: ${apkPath}`, 'bright');
    log(`📊 Tamanho: ${sizeMB} MB`, 'bright');
    log(`\n💡 Para instalar no celular:`, 'cyan');
    log(`   1. Transfira o arquivo para o dispositivo`, 'cyan');
    log(`   2. Ative "Fontes desconhecidas" nas configurações`, 'cyan');
    log(`   3. Abra o arquivo APK no celular`, 'cyan');
    
    if (isRelease) {
      log(`\n⚠️  APK Release gerado. Certifique-se de ter assinado corretamente!`, 'yellow');
    } else {
      log(`\n💡 Para gerar APK assinado (release), execute:`, 'cyan');
      log(`   node build-apk.js --release`, 'cyan');
      log(`   (Ou use Android Studio: Build > Generate Signed Bundle / APK)`, 'cyan');
    }
  } else {
    log(`\n⚠️  APK não encontrado em: ${apkPath}`, 'yellow');
    log('   Verifique os logs acima para erros.', 'yellow');
  }

  log('\n');
}

main();

