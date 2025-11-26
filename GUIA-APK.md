# 📱 Guia Rápido: Como Gerar APK do ANUBIS

Este guia explica como compilar e criar um arquivo APK para publicar no seu repositório.

## 🚀 Método Rápido (Recomendado)

### Opção 1: Script Automatizado (Mais Fácil)

```bash
npm run mobile:apk
```

Este comando irá:
1. ✅ Compilar o React
2. ✅ Sincronizar com Capacitor
3. ✅ Gerar o APK automaticamente

O APK será gerado em: `android/app/build/outputs/apk/debug/app-debug.apk`

### Opção 2: Passo a Passo Manual

```bash
# 1. Compilar React
npm run build

# 2. Sincronizar com Capacitor
npm run mobile:sync

# 3. Gerar APK via Gradle
cd android
.\gradlew.bat assembleDebug
cd ..
```

## 📋 Pré-requisitos

Antes de gerar o APK, certifique-se de ter:

1. **Android Studio instalado**
   - Baixe em: https://developer.android.com/studio
   - Instale o Android SDK durante a instalação

2. **Java JDK 11+ instalado** (⚠️ IMPORTANTE: Java 8 não funciona!)
   - Baixe em: https://adoptium.net/
   - Veja a seção abaixo sobre **"Configuração no Adoptium"**

3. **Variáveis de ambiente configuradas** (Windows):
   - `ANDROID_HOME` = `C:\Users\SeuUsuario\AppData\Local\Android\Sdk`
   - `JAVA_HOME` = `C:\Program Files\Eclipse Adoptium\jdk-11.0.x` (ajuste o caminho)
   - Adicione ao PATH: `%ANDROID_HOME%\platform-tools` e `%ANDROID_HOME%\tools`

### ⚡ Verificação e Configuração Rápida

**Se você ainda não instalou Java 11+ ou está tendo problemas:**

1. **Instale Java 11+ primeiro:**
   - Baixe em: https://adoptium.net/
   - Veja a seção "Configuração no Adoptium" abaixo

2. **Configure automaticamente:**
   ```bash
   npm run mobile:config-java
   ```
   Este script PowerShell irá:
   - ✅ Procurar Java 11+ instalado
   - ✅ Configurar JAVA_HOME
   - ✅ Adicionar ao PATH
   - ✅ Configurar no gradle.properties

3. **Verificar configuração:**
   ```bash
   npm run mobile:check-java
   ```
   Este comando verifica:
   - ✅ Versão do Java instalada
   - ✅ Configuração do JAVA_HOME
   - ✅ Configuração do Gradle

## ☕ Configuração no Adoptium (Download do Java)

Ao baixar o Java no site [Adoptium](https://adoptium.net/), siga estas configurações:

### 1. Acesse o Site

Vá para: **https://adoptium.net/**

### 2. Escolha as Opções Corretas

Na página de download, configure:

| Opção | Valor Recomendado | Explicação |
|-------|-------------------|------------|
| **Version** | **17 LTS** ou **21 LTS** | Versão LTS (Long Term Support) - mais estável |
| **Operating System** | **Windows** | Seu sistema operacional |
| **Architecture** | **x64** (geralmente) | Arquitetura do seu processador |
| **Package Type** | **JDK** | JDK (não JRE) - necessário para compilar |
| **Java Version** | **17** ou **21** | Qualquer versão 11+ funciona |

### 3. Opções Avançadas (Opcional)

Se quiser personalizar:

- **JVM Implementation**: 
  - **HotSpot** (recomendado) - Mais comum e estável
  - **OpenJ9** - Alternativa, pode ser mais eficiente em memória

- **Heap Size**: Deixe o padrão (não precisa alterar)

### 4. Download e Instalação

1. Clique em **"Latest Release"** ou escolha uma versão específica
2. Baixe o instalador (`.msi` para Windows)
3. Execute o instalador
4. **IMPORTANTE**: Durante a instalação, marque a opção:
   - ✅ **"Set JAVA_HOME variable"** (se disponível)
   - ✅ **"Add to PATH"** (se disponível)

### 5. Verificar Instalação

Após instalar, abra um **novo terminal** e verifique:

```bash
java -version
```

Deve mostrar algo como:
```
openjdk version "17.0.x" 2024-xx-xx
OpenJDK Runtime Environment Temurin-17.0.x+8 (build 17.0.x+8)
OpenJDK 64-Bit Server VM Temurin-17.0.x+8 (build 17.0.x+8, mixed mode, sharing)
```

### 6. Configurar JAVA_HOME (Se não foi configurado automaticamente)

Se o instalador não configurou o JAVA_HOME:

1. **Encontre o caminho de instalação** (geralmente):
   - `C:\Program Files\Eclipse Adoptium\jdk-17.0.x`
   - `C:\Program Files\Eclipse Adoptium\jdk-21.0.x`

2. **Configure manualmente** (veja seção "Solução de Problemas" abaixo)

### 📝 Resumo das Configurações no Adoptium

✅ **Versão**: 17 LTS ou 21 LTS  
✅ **Sistema**: Windows  
✅ **Arquitetura**: x64  
✅ **Tipo**: JDK (não JRE)  
✅ **JVM**: HotSpot (recomendado)  

**Caminho típico após instalação:**
```
C:\Program Files\Eclipse Adoptium\jdk-17.0.x
```

## ⚙️ Configuração da URL da API (IMPORTANTE)

O app mobile precisa de uma URL de backend remota (não pode usar localhost).

### 1. Criar arquivo `.env` na raiz do projeto:

```env
REACT_APP_API_URL=https://seu-backend.onrender.com
```

**⚠️ IMPORTANTE:** Substitua pela URL real do seu backend hospedado.

### 2. Rebuild após configurar:

```bash
npm run build
npm run mobile:sync
```

## 🔨 Gerar APK

### APK Debug (Para Testes)

```bash
npm run mobile:apk
```

Ou usando o script diretamente:

```bash
node build-apk.js
```

**Localização:** `android/app/build/outputs/apk/debug/app-debug.apk`

### APK Release (Assinado - Para Publicação)

#### Via Script:

```bash
npm run mobile:apk:release
```

Ou:

```bash
node build-apk.js --release
```

#### Via Android Studio:

```bash
npm run mobile:open
```

No Android Studio:
1. Vá em **Build > Generate Signed Bundle / APK**
2. Escolha **APK**
3. Crie ou use um keystore existente
4. O APK estará em: `app/build/outputs/apk/release/app-release.apk`

## 📦 Publicar no Repositório

### Opção 1: GitHub Releases

1. Gere o APK:
   ```bash
   npm run mobile:apk
   ```

2. Crie uma nova release no GitHub:
   - Vá em **Releases** > **Create a new release**
   - Adicione uma tag (ex: `v1.0.0`)
   - Faça upload do arquivo `android/app/build/outputs/apk/debug/app-debug.apk`
   - Publique

3. A URL do download será:
   ```
   https://github.com/seu-usuario/anubis/releases/download/v1.0.0/app-debug.apk
   ```

### Opção 2: Servidor Próprio

1. Faça upload do APK para seu servidor
2. Configure o servidor para servir o arquivo
3. Use a URL completa no botão de download

### Opção 3: Google Drive / Dropbox

1. Faça upload do APK
2. Obtenha o link de compartilhamento direto
3. Use como URL no componente de download

## 🔄 Atualizar APK Após Mudanças

Quando você fizer alterações no código:

```bash
# 1. Desenvolva normalmente
npm run dev

# 2. Após as mudanças, gere novo APK:
npm run mobile:apk

# 3. Faça upload do novo APK no repositório
```

## 📝 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run mobile:apk` | Gera APK debug (automático) |
| `npm run mobile:apk:release` | Gera APK release (assinado) |
| `npm run mobile:build` | Compila React e sincroniza |
| `npm run mobile:sync` | Sincroniza código com Android |
| `npm run mobile:open` | Abre projeto no Android Studio |
| `npm run mobile:check-java` | Verifica configuração do Java |
| `npm run mobile:config-java` | **Configura Java automaticamente** ⚡ |

## 🐛 Solução de Problemas

### Erro: "Dependency requires at least JVM runtime version 11. This build uses a Java 8 JVM"

**Problema:** O Gradle está usando Java 8, mas precisa de Java 11 ou superior.

**Solução Rápida (Recomendada):**

1. **Instale Java JDK 11+** (se ainda não instalou)
   - Baixe em: https://adoptium.net/
   - **Configurações recomendadas no Adoptium:**
     - Version: **17 LTS** ou **21 LTS**
     - Operating System: **Windows**
     - Architecture: **x64**
     - Package Type: **JDK** (não JRE)
     - JVM Implementation: **HotSpot** (recomendado)

2. **Execute o script de configuração automática:**
   ```bash
   npm run mobile:config-java
   ```
   
   Este script irá:
   - ✅ Procurar Java 11+ instalado automaticamente
   - ✅ Configurar JAVA_HOME
   - ✅ Adicionar ao PATH
   - ✅ Configurar no gradle.properties

3. **Feche e reabra o terminal**, depois teste:
   ```bash
   java -version
   npm run mobile:apk
   ```

**Solução Manual (Se o script não funcionar):**

1. **Configure JAVA_HOME manualmente:**
   
   No PowerShell (como Administrador):
   ```powershell
   # Substitua pelo caminho real do seu JDK 11+
   [System.Environment]::SetEnvironmentVariable('JAVA_HOME', 'C:\Program Files\Eclipse Adoptium\jdk-17.0.x', 'User')
   
   # Adicionar ao PATH
   $currentPath = [System.Environment]::GetEnvironmentVariable('Path', 'User')
   [System.Environment]::SetEnvironmentVariable('Path', "$currentPath;%JAVA_HOME%\bin", 'User')
   ```

   Ou configure manualmente:
   - Painel de Controle > Sistema > Configurações Avançadas do Sistema
   - Variáveis de Ambiente
   - Adicione `JAVA_HOME` = `C:\Program Files\Eclipse Adoptium\jdk-17.0.x`
   - Adicione `%JAVA_HOME%\bin` ao PATH

2. **Configure no Gradle:**
   
   Edite `android/gradle.properties` e adicione:
   ```properties
   org.gradle.java.home=C:\\Program Files\\Eclipse Adoptium\\jdk-17.0.x
   ```
   (Substitua pelo caminho real do seu JDK 11+)

3. **Reinicie o terminal** e verifique:
   ```bash
   java -version
   ```
   Deve mostrar versão 11 ou superior.

### Erro: "SDK location not found"

Edite `android/local.properties` e adicione:

```
sdk.dir=C:\\Users\\SeuUsuario\\AppData\\Local\\Android\\Sdk
```

### Erro: "O termo 'gradlew.bat' não é reconhecido"

**Problema:** No PowerShell, você precisa usar `.\` antes do comando.

**Solução:**

1. **Certifique-se de estar no diretório correto:**
   ```powershell
   cd android
   ```

2. **Use `.\` antes do comando:**
   ```powershell
   .\gradlew.bat assembleDebug
   ```
   
   **❌ ERRADO:** `gradlew.bat assembleDebug`  
   **✅ CORRETO:** `.\gradlew.bat assembleDebug`

3. **Ou use o script automatizado (recomendado):**
   ```bash
   npm run mobile:apk
   ```
   O script já faz isso automaticamente!

### Erro: "Command not found: gradlew"

No Windows, o script usa `gradlew.bat` automaticamente. Se ainda der erro:

1. Abra o PowerShell/CMD na pasta `android`
2. Execute: `.\gradlew.bat assembleDebug`

### Erro: "Failed to find 'ANDROID_HOME'"

1. Configure a variável de ambiente `ANDROID_HOME`
2. Reinicie o terminal
3. Verifique: `echo %ANDROID_HOME%`

### APK não conecta à API

1. Verifique se a URL está correta no `.env`
2. Verifique se o backend está online
3. Teste a URL no navegador: `https://seu-servidor.com/api/health`
4. Verifique se o CORS está configurado no servidor

## 📚 Documentação Completa

Para mais detalhes, consulte:
- **[docs/mobile/setup.md](docs/mobile/setup.md)** - Guia completo de setup
- **[docs/mobile/apk-download.md](docs/mobile/apk-download.md)** - Configurar botão de download
- **[docs/deployment/backend.md](docs/deployment/backend.md)** - Hospedar backend

## ✅ Checklist Rápido

- [ ] Android Studio instalado
- [ ] Java JDK 17+ instalado
- [ ] Variáveis de ambiente configuradas
- [ ] Backend hospedado e acessível
- [ ] Arquivo `.env` com `REACT_APP_API_URL` configurado
- [ ] APK gerado com sucesso
- [ ] APK testado no dispositivo
- [ ] APK publicado no repositório

---

**Pronto!** Agora você pode gerar e publicar o APK do ANUBIS! 🎉

