# 🚀 Deploy do Backend para Produção

Para que o app mobile funcione, o backend precisa estar hospedado em um servidor acessível pela internet.

## 🌐 Opção Recomendada: Render.com

O Render.com é gratuito e fácil de usar. Você já está usando para o banco PostgreSQL, então pode usar para o backend também.

### Passo 1: Preparar o Repositório

1. Crie um repositório Git (GitHub, GitLab, etc.) se ainda não tiver
2. Faça commit de todos os arquivos do projeto
3. Crie um arquivo `.gitignore` se não existir:

```gitignore
node_modules/
.env
build/
dist/
.server-port
*.log
.DS_Store
```

### Passo 2: Criar Serviço no Render

1. Acesse [Render.com](https://render.com) e faça login
2. Clique em **"New +"** → **"Web Service"**
3. Conecte seu repositório Git
4. Configure o serviço:

#### Configurações Básicas:
- **Name:** `anubis-backend` (ou outro nome)
- **Environment:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `node server.js`
- **Instance Type:** `Free` (ou pago para melhor performance)

#### Environment Variables (Variáveis de Ambiente):

Adicione as seguintes variáveis:

```
DATABASE_URL=postgresql://usuario:senha@host:porta/database?sslmode=require
PORT=10000
NODE_ENV=production
CORS_ALLOWED_ORIGINS=*
```

**Nota:** Use a mesma `DATABASE_URL` do seu arquivo `.env` local.

### Passo 3: Deploy

1. Clique em **"Create Web Service"**
2. Aguarde o build e deploy (pode levar alguns minutos)
3. Após o deploy, você receberá uma URL como: `https://anubis-backend.onrender.com`

### Passo 4: Verificar se Está Funcionando

Abra no navegador:
```
https://seu-backend.onrender.com/api/health
```

Deve retornar:
```json
{
  "status": "ok",
  "timestamp": "2024-...",
  "database": {
    "status": "healthy",
    "connected": true
  }
}
```

### Passo 5: Configurar no App Mobile

Use essa URL no arquivo `.env` do projeto:

```env
REACT_APP_API_URL=https://seu-backend.onrender.com
```

Ou configure no `ApiContext.js` se preferir hardcoded.

## 🔒 Segurança (Recomendado para Produção)

### Opção 1: Restringir CORS

No `server.js`, o CORS já está configurado para aceitar a variável `CORS_ALLOWED_ORIGINS`. Configure no Render:

```
CORS_ALLOWED_ORIGINS=https://seu-app-domain.com,capacitor://localhost
```

### Opção 2: Adicionar Autenticação de API

Você pode adicionar uma chave de API para proteger o backend:

```javascript
const API_KEY = process.env.API_KEY;

app.use('/api', (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey === API_KEY) {
    next();
  } else {
    res.status(401).json({ error: 'API key inválida' });
  }
});
```

## 🌐 Outras Opções de Hospedagem

### Heroku

1. Instale o [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
2. Faça login: `heroku login`
3. Crie app: `heroku create anubis-backend`
4. Configure variáveis: `heroku config:set DATABASE_URL=...`
5. Deploy: `git push heroku main`

### Railway

1. Acesse [Railway.app](https://railway.app)
2. Conecte repositório
3. Configure variáveis de ambiente
4. Deploy automático

### Vercel / Netlify

⚠️ **Nota:** Estas plataformas são otimizadas para frontend. Para backend Node.js, prefira Render, Heroku ou Railway.

### Servidor VPS Próprio

Se você tem um servidor VPS (DigitalOcean, AWS, etc.):

1. SSH no servidor
2. Instale Node.js: `curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs`
3. Clone o repositório
4. Configure `.env`
5. Use PM2 para manter rodando: `pm2 start server.js`

## 🔧 Troubleshooting

### Erro: "Cannot connect to database"

- Verifique se a `DATABASE_URL` está correta
- Use a **External Database URL** do Render (não a Internal)
- Verifique se o banco está ativo no Render

### Erro: "Port already in use"

- Render usa porta dinâmica via `process.env.PORT`
- Certifique-se de que o código usa: `const port = process.env.PORT || 3001`

### Timeout no Deploy

- Render pode levar até 15 minutos no primeiro deploy
- Verifique os logs no dashboard do Render

### CORS Errors no Mobile

- Certifique-se de que o CORS permite `*` ou o domínio do app
- Verifique se está usando HTTPS (não HTTP)

## 📝 Checklist

- [ ] Backend está online e acessível
- [ ] Health check retorna `{"status": "ok"}`
- [ ] `DATABASE_URL` configurada corretamente
- [ ] CORS configurado para aceitar requisições do mobile
- [ ] URL do backend configurada no app mobile
- [ ] Testado acesso à API via navegador

## 📚 Próximos Passos

- [Configuração Mobile](../mobile/setup.md)
- [Voltar para Documentação Principal](../README.md)

