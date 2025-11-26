# 📦 Configuração do Git para Deploy no Render

## 🚨 Importante: Render precisa do Git!

O Render.com faz deploy a partir do seu repositório Git (GitHub, GitLab, etc.). Se o repositório estiver vazio ou não existir, o deploy não funcionará.

## 📋 Passo a Passo

### 1. Inicializar Git (se ainda não fez)

```bash
git init
```

### 2. Criar arquivo .gitignore (se não existir)

O arquivo `.gitignore` já existe e está correto. Ele garante que arquivos sensíveis não sejam commitados:
- `.env` (não será commitado)
- `node_modules/`
- `build/`
- etc.

### 3. Fazer primeiro commit

```bash
# Adicionar todos os arquivos (exceto os do .gitignore)
git add .

# Fazer commit
git commit -m "Initial commit - ANUBIS project"
```

### 4. Criar repositório no GitHub (ou GitLab)

1. Acesse: https://github.com (ou GitLab)
2. Clique em **"New repository"**
3. Dê um nome (ex: `anubis`)
4. **NÃO** marque "Initialize with README"
5. Clique em **"Create repository"**

### 5. Conectar repositório local ao remoto

```bash
# Substitua SEU_USUARIO e NOME_REPO pelos seus valores
git remote add origin https://github.com/SEU_USUARIO/NOME_REPO.git

# Enviar código para o GitHub
git branch -M main
git push -u origin main
```

### 6. Conectar no Render

1. Acesse: https://dashboard.render.com
2. Clique em **"New +"** → **"Web Service"**
3. Escolha **"Connect GitHub"** (ou GitLab)
4. Autorize o Render a acessar seus repositórios
5. Selecione o repositório `anubis` (ou o nome que você deu)
6. Configure:
   - **Name:** `anubis-backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Environment Variables:**
     - `DATABASE_URL` = sua URL do banco
     - `PORT` = deixe vazio ou `10000`
     - `NODE_ENV` = `production`
     - `CORS_ALLOWED_ORIGINS` = `*`

### 7. Deploy automático

Depois de conectar, o Render fará deploy automaticamente! 🎉

## ⚠️ Arquivos que NÃO devem ser commitados

O `.gitignore` já está configurado para evitar commit de:
- ✅ `.env` (contém senhas e dados sensíveis)
- ✅ `node_modules/` (dependências)
- ✅ `build/` (arquivos gerados)
- ✅ `android/` (gerado pelo Capacitor)

## 📝 Checklist

- [ ] Git inicializado (`git init`)
- [ ] `.gitignore` configurado corretamente
- [ ] Primeiro commit feito
- [ ] Repositório criado no GitHub/GitLab
- [ ] Código enviado para o repositório remoto (`git push`)
- [ ] Render conectado ao repositório
- [ ] Variáveis de ambiente configuradas no Render
- [ ] Deploy iniciado

## 🔄 Atualizações Futuras

Depois do setup inicial, para atualizar o backend:

```bash
# Fazer mudanças no código
# ...

# Commit
git add .
git commit -m "Descrição das mudanças"

# Enviar para GitHub
git push

# Render fará deploy automático!
```

---

**Pronto!** Agora o Render pode fazer deploy do seu backend! 🚀

