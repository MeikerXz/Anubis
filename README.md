# ANUBIS - Sistema de Gerenciamento de Links

Sistema desktop e mobile para gerenciamento de cards e links com interface hacker, painel administrativo completo e banco de dados PostgreSQL.

## 🎨 Características

- 🎨 Interface hacker com cores Vinho (#8a2be2) e Midnight Blue (#191970)
- 🔐 Sistema de autenticação com banco de dados PostgreSQL
- 👤 Painel administrativo completo (Cards, Links, Tags, Usuários)
- 🏷️ Sistema de tags para organização e filtragem
- 🔍 Motor de busca para cards
- 💾 Tudo configurável via banco de dados (sem necessidade de atualizações)
- 📱 Cards clicáveis que abrem modals com links
- 🔄 Detecção automática de porta do servidor
- 📝 Configuração via arquivo `.env`
- 📲 **Versão Mobile Android disponível (APK)**

## 🚀 Início Rápido

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Banco de Dados

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL=postgresql://usuario:senha@host:porta/database?sslmode=require
```

**Onde obter a URL:**
1. Acesse [render.com](https://render.com)
2. Crie um banco PostgreSQL
3. Copie a **External Database URL**
4. Cole no arquivo `.env`

### 3. Executar

```bash
npm run dev
```

### 4. Primeiro Acesso

- **Usuário:** `admin`
- **Senha:** `admin123`

⚠️ **IMPORTANTE:** Altere a senha padrão após o primeiro acesso!

## 📋 Tecnologias

- **Electron** - Framework para aplicação desktop
- **React** - Interface do usuário
- **Capacitor** - Framework para aplicação mobile (Android)
- **Node.js/Express** - Backend API
- **PostgreSQL** - Banco de dados (Render)
- **dotenv** - Configuração via arquivo .env

## 🗄️ Estrutura do Banco de Dados

O sistema cria automaticamente as seguintes tabelas:

- **users** - Usuários e autenticação
- **cards** - Cards principais (ordenados por ID)
- **links** - Links associados aos cards (usa `card_id` como FOREIGN KEY)
- **tags** - Tags para categorização
- **card_tags** - Relacionamento entre cards e tags

### Relacionamentos:
- `links.card_id` → `cards.id` (FOREIGN KEY)
- `card_tags.card_id` → `cards.id` (FOREIGN KEY)
- `card_tags.tag_id` → `tags.id` (FOREIGN KEY)

## 👤 Gerenciamento de Usuários Admin

### Via Painel Admin (Recomendado)

1. Faça login como `admin` / `admin123`
2. Clique no botão **"ADMIN"** (canto superior direito)
3. Vá para a aba **"USUÁRIOS"**
4. Preencha: Usuário, Senha, marque **"Administrador"**
5. Clique em **"CRIAR"**

### Via Script (Linha de Comando)

```bash
npm run criar-admin nome_usuario senha_segura
```

## 🔧 Funcionalidades

### Para Usuários
- ✅ Visualizar cards
- ✅ Buscar cards por título/descrição
- ✅ Filtrar por tags
- ✅ Clicar em cards para ver links
- ✅ Abrir links em nova aba

### Para Administradores
- ✅ Gerenciar cards (criar, editar, excluir)
- ✅ Gerenciar links dentro dos cards
- ✅ Gerenciar tags
- ✅ Gerenciar usuários
- ✅ Associar tags aos cards
- ✅ Tudo configurável sem precisar atualizar o programa

## 🔍 Detecção Automática de Porta

O sistema detecta automaticamente em qual porta o servidor está rodando:

- Tenta portas de 3001 a 3010 automaticamente
- Usa a primeira porta disponível
- Frontend detecta automaticamente e conecta

## 📝 Configuração

### Arquivo .env

Crie um arquivo `.env` na raiz do projeto:

```env
# URL do banco PostgreSQL do Render
DATABASE_URL=postgresql://usuario:senha@host:porta/database?sslmode=require

# Opcional: Credenciais do admin padrão
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### Variáveis de Ambiente Alternativas

Se preferir usar variáveis de ambiente individuais:

```env
DB_HOST=seu-host.render.com
DB_PORT=5432
DB_NAME=anubis
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
```

## 🛠️ Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento (React + Electron)
npm run build        # Build do React
npm run start        # Executar Electron
npm run criar-admin  # Criar usuário admin via CLI
npm run build:electron # Build para distribuição (Desktop)
npm run mobile:init  # Inicializar projeto mobile (Android)
npm run mobile:sync  # Sincronizar código com Android
npm run mobile:open  # Abrir projeto no Android Studio
npm run mobile:build # Build e sincronizar para mobile
```

## 📁 Estrutura do Projeto

```
ANUBIS/
├── .env                    # Configurações (criar você)
├── main.js                 # Processo principal Electron
├── server.js               # Servidor backend (Express)
├── database.js             # Funções do banco PostgreSQL
├── config.js               # Configurações
├── port-finder.js          # Utilitário de detecção de porta
├── criar-admin.js          # Script para criar admin
├── package.json
├── public/                 # Arquivos públicos
└── src/                    # Código React
    ├── App.js
    ├── contexts/
    │   └── ApiContext.js   # Context para API URL
    └── components/
        ├── Login.js
        ├── CardGrid.js
        ├── Card.js
        ├── LinkModal.js
        ├── AdminPanel.js
        ├── SearchBar.js
        └── TagFilter.js
```

## 🔒 Segurança

- ✅ Senhas criptografadas com bcrypt
- ✅ Content Security Policy configurado
- ✅ Proteções do Electron habilitadas
- ✅ Variáveis de ambiente para credenciais
- ✅ Arquivo `.env` no `.gitignore`

## ❓ Solução de Problemas

### Erro: "Configuração do PostgreSQL não encontrada"

**Solução:** Crie o arquivo `.env` com a variável `DATABASE_URL`

### Erro: "ERR_CONNECTION_REFUSED"

**Solução:** 
- Verifique se o servidor está rodando (veja os logs)
- Verifique se a URL do Render está correta
- Use a **External Database URL** (não a Internal)

### Erro: "ECONNREFUSED" no PostgreSQL

**Solução:**
- Verifique se o banco está ativo no Render
- Verifique se a URL está completa e correta
- Verifique se está usando `sslmode=require` na URL

## 📱 Versão Mobile (Android APK)

O ANUBIS também pode ser gerado como um aplicativo Android para instalar em celulares.

### 🎁 Download do App

O sistema inclui um botão **"📱 DOWNLOAD APP"** no header que permite baixar o APK diretamente. 

Veja [docs/mobile/apk-download.md](docs/mobile/apk-download.md) para configurar o botão de download.

### Pré-requisitos

- Android Studio instalado
- **Java JDK 11+ instalado** (⚠️ Java 8 não funciona! Baixe em: https://adoptium.net/)
- Node.js e npm instalados

**⚠️ IMPORTANTE:** Antes de gerar o APK, verifique se o Java está configurado:
```bash
npm run mobile:check-java
```

### Guias Completos

📖 **Consulte a [documentação completa](docs/README.md) ou os guias específicos:**

- **[Setup Mobile](docs/mobile/setup.md)** - Passo a passo para gerar o APK
- **[Deploy do Backend](docs/deployment/backend.md)** - Como hospedar o backend para o app mobile
- **[Sincronização Desktop/Mobile](docs/mobile/sync.md)** - Como sincronizar alterações entre versões

### Resumo Rápido

1. **Hospedar o backend** (Render.com recomendado):
   - Veja [docs/deployment/backend.md](docs/deployment/backend.md) para instruções completas

2. **Instalar Capacitor:**
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/android
   ```

3. **Configurar URL da API:**
   - Edite `.env` e adicione: `REACT_APP_API_URL=https://seu-backend.onrender.com`

4. **Inicializar e gerar APK:**
   ```bash
   npm run mobile:init
   npm run mobile:open
   ```
   - No Android Studio: Build > Build Bundle(s) / APK(s) > Build APK(s)

O APK será gerado em `android/app/build/outputs/apk/debug/app-debug.apk`

**⚠️ Se encontrar erro sobre Java 8:** O Gradle requer Java 11+. Execute `npm run mobile:check-java` para verificar e corrigir.

## 📖 Documentação Completa

📚 **A documentação completa está organizada em [docs/](docs/README.md):**

### Configuração
- **[Configuração do Banco de Dados](docs/setup/database.md)** - Como configurar PostgreSQL no Render.com

### Deploy e Produção
- **[Deploy do Backend](docs/deployment/backend.md)** - Como hospedar o backend para produção
- **[Servidor de Atualizações](docs/deployment/updates.md)** - Configurar atualizações automáticas

### Mobile
- **[Setup Mobile](docs/mobile/setup.md)** - Como gerar o APK para Android
- **[Download do APK](docs/mobile/apk-download.md)** - Configurar botão de download
- **[Sincronização Desktop/Mobile](docs/mobile/sync.md)** - Como sincronizar código entre versões

### Solução de Problemas
- **[Scripts no Windows](docs/troubleshooting/windows-scripts.md)** - Comandos específicos para Windows
- **[Erros do NPM](docs/troubleshooting/npm-errors.md)** - Solução de problemas comuns

### Outros
- **[SECURITY.md](SECURITY.md)** - Informações sobre segurança
- **[CHANGELOG.md](CHANGELOG.md)** - Histórico de mudanças

## 🚀 Build para Distribuição

```bash
npm run build
npm run build:electron
```

O executável será criado na pasta `dist/`.

## 📄 Licença

MIT
