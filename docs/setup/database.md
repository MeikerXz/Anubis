# 🗄️ Configuração do Banco de Dados PostgreSQL

Este guia explica como configurar o banco de dados PostgreSQL no Render.com para o ANUBIS.

## 📋 Passo a Passo

### 1. Criar Banco de Dados PostgreSQL no Render

1. Acesse [render.com](https://render.com) e faça login
2. Clique em **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `anubis-db` (ou o nome que preferir)
   - **Database**: `anubis` (ou o nome que preferir)
   - **Region**: Escolha a região mais próxima
   - **PostgreSQL Version**: Use a versão mais recente
   - **Plan**: Escolha o plano (Free tier disponível)
4. Clique em **"Create Database"**

### 2. Obter String de Conexão

Após criar o banco:

1. Vá para o dashboard do banco de dados
2. Na seção **"Connections"**, copie a **"External Database URL"**

A URL terá o formato:
```
postgresql://usuario:senha@host:porta/database?sslmode=require
```

### 3. Configurar no Projeto

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL=postgresql://usuario:senha@host:porta/database?sslmode=require
```

Cole a **External Database URL** do Render no arquivo `.env`.

## ✅ Pronto!

Agora execute:

```bash
npm run dev
```

O sistema lerá automaticamente do arquivo `.env` e conectará ao banco!

## 🔐 Variáveis de Ambiente Opcionais

Você também pode configurar no `.env`:

```env
# Banco de dados (obrigatório)
DATABASE_URL=postgresql://usuario:senha@host:porta/database?sslmode=require

# Admin padrão (opcional)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=sua_senha_segura

# Ambiente (opcional)
NODE_ENV=production

# CORS (opcional, para produção)
CORS_ALLOWED_ORIGINS=https://seu-dominio.com,https://outro-dominio.com
```

## 📝 Estrutura das Tabelas

O sistema criará automaticamente estas tabelas:

- **users** - Usuários e autenticação
- **cards** - Cards principais (ordenados por ID)
- **links** - Links associados aos cards (usa `card_id` como FOREIGN KEY)
- **tags** - Tags para categorização
- **card_tags** - Relacionamento entre cards e tags
- **card_user_access** - Controle de acesso aos cards por usuário
- **card_requests** - Solicitações de novos cards

## 🔧 Solução de Problemas

### Erro de conexão SSL
Verifique se `sslmode=require` está na URL.

### Erro "relation does not exist"
Execute o servidor uma vez para criar as tabelas automaticamente.

### Timeout de conexão
Verifique se está usando a **External Database URL** (não a Internal).

### Erro "ECONNREFUSED"
- Verifique se o banco está ativo no Render
- Verifique se a URL está completa e correta
- Verifique se está usando `sslmode=require` na URL

## 📚 Próximos Passos

- [Configuração do Backend](../deployment/backend.md)
- [Voltar para Documentação Principal](../README.md)

