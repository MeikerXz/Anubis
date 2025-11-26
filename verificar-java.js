#!/usr/bin/env node

/**
 * Script para verificar e ajudar a configurar o Java para o build do APK
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

function checkJavaVersion() {
  try {
    const stderr = execSync('java -version 2>&1', { encoding: 'utf8' });
    const versionMatch = stderr.match(/version "(\d+)/);
    
    if (versionMatch) {
      const majorVersion = parseInt(versionMatch[1]);
      const fullVersion = stderr.split('\n')[0];
      return { major: majorVersion, full: fullVersion };
    }
    return null;
  } catch (error) {
    return null;
  }
}

function checkJAVA_HOME() {
  return process.env.JAVA_HOME || null;
}

function main() {
  log('\n═══════════════════════════════════════════════════', 'bright');
  log('☕ Verificador de Java para Build APK', 'bright');
  log('═══════════════════════════════════════════════════\n', 'bright');

  // Verificar versão do Java
  log('📋 Verificando instalação do Java...', 'yellow');
  const javaInfo = checkJavaVersion();
  
  if (!javaInfo) {
    log('❌ Java não encontrado!', 'red');
    log('\n💡 Solução:', 'yellow');
    log('   1. Baixe e instale Java JDK 11 ou superior:', 'cyan');
    log('      https://adoptium.net/', 'cyan');
    log('   2. Escolha a versão LTS (Long Term Support)', 'cyan');
    log('   3. Após instalar, reinicie o terminal e execute novamente', 'cyan');
    process.exit(1);
  }

  log(`✅ Java encontrado: ${javaInfo.full}`, 'green');
  
  if (javaInfo.major < 11) {
    log(`\n❌ Versão do Java: ${javaInfo.major}`, 'red');
    log('   O Gradle requer Java 11 ou superior!', 'red');
    log('\n💡 Solução:', 'yellow');
    log('   1. Instale Java JDK 11+ de: https://adoptium.net/', 'cyan');
    log('      - Escolha: Version 17 LTS ou 21 LTS', 'cyan');
    log('      - Package Type: JDK (não JRE)', 'cyan');
    log('      - JVM: HotSpot', 'cyan');
    log('   2. Configure JAVA_HOME (veja instruções abaixo)', 'cyan');
    log('   3. Reinicie o terminal', 'cyan');
  } else {
    log(`✅ Versão do Java: ${javaInfo.major} (OK)`, 'green');
  }

  // Verificar JAVA_HOME
  log('\n📋 Verificando JAVA_HOME...', 'yellow');
  const javaHome = checkJAVA_HOME();
  
  if (!javaHome) {
    log('⚠️  JAVA_HOME não está configurado', 'yellow');
    log('\n💡 Como configurar JAVA_HOME:', 'yellow');
    log('\n   📥 Primeiro, baixe o Java JDK 11+ do Adoptium:', 'cyan');
    log('      https://adoptium.net/', 'cyan');
    log('      Configurações recomendadas:', 'cyan');
    log('      - Version: 17 LTS ou 21 LTS', 'cyan');
    log('      - Package Type: JDK (não JRE)', 'cyan');
    log('      - JVM: HotSpot (recomendado)', 'cyan');
    log('\n   No Windows (PowerShell como Administrador):', 'cyan');
    log('   [System.Environment]::SetEnvironmentVariable(', 'cyan');
    log('     "JAVA_HOME",', 'cyan');
    log('     "C:\\Program Files\\Eclipse Adoptium\\jdk-17.0.x",', 'cyan');
    log('     "User"', 'cyan');
    log('   )', 'cyan');
    log('\n   Ou manualmente:', 'cyan');
    log('   1. Painel de Controle > Sistema > Variáveis de Ambiente', 'cyan');
    log('   2. Adicione JAVA_HOME = caminho do JDK', 'cyan');
    log('   3. Adicione %JAVA_HOME%\\bin ao PATH', 'cyan');
    log('   4. Reinicie o terminal', 'cyan');
  } else {
    log(`✅ JAVA_HOME: ${javaHome}`, 'green');
    
    // Verificar se o caminho existe
    if (fs.existsSync(javaHome)) {
      log('✅ Caminho do JAVA_HOME é válido', 'green');
    } else {
      log('⚠️  Caminho do JAVA_HOME não existe!', 'yellow');
      log(`   Caminho configurado: ${javaHome}`, 'yellow');
    }
  }

  // Verificar gradle.properties
  log('\n📋 Verificando configuração do Gradle...', 'yellow');
  const gradlePropsPath = path.join(process.cwd(), 'android', 'gradle.properties');
  
  if (fs.existsSync(gradlePropsPath)) {
    const content = fs.readFileSync(gradlePropsPath, 'utf8');
    if (content.includes('org.gradle.java.home')) {
      log('✅ org.gradle.java.home configurado no gradle.properties', 'green');
    } else {
      log('💡 Dica: Você pode configurar o Java diretamente no Gradle', 'yellow');
      log('   Adicione em android/gradle.properties:', 'cyan');
      log('   org.gradle.java.home=C:\\caminho\\para\\jdk-11', 'cyan');
    }
  } else {
    log('⚠️  android/gradle.properties não encontrado', 'yellow');
  }

  // Resumo
  log('\n═══════════════════════════════════════════════════', 'bright');
  if (javaInfo.major >= 11) {
    log('✅ Java está configurado corretamente!', 'green');
    log('   Você pode executar: npm run mobile:apk', 'cyan');
  } else {
    log('❌ Java precisa ser atualizado para versão 11+', 'red');
    log('   Siga as instruções acima para corrigir', 'yellow');
  }
  log('═══════════════════════════════════════════════════\n', 'bright');
}

main();

