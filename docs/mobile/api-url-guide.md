# 🔗 Guia: O que é a REACT_APP_API_URL?

## 📖 O que é?

A `REACT_APP_API_URL` é a **URL (endereço) do seu backend** que o aplicativo mobile vai usar para se conectar ao banco de dados e fazer todas as operações.

## 🤔 Por que é necessária?

### No Desktop (Electron):
- O app roda no seu computador
- O backend roda **localmente** no mesmo computador (localhost)
- Por isso funciona com `http://localhost:3001`

### No Mobile (APK):
- O app roda no celular do usuário
- O celular **não tem acesso ao seu computador**
- Precisa de um backend **hospedado na internet** (não localhost)
- Por isso precisa de uma URL pública como `https://meu-backend.onrender.com`

## 🌐 O que preciso fazer?

Você precisa **hospedar o backend** em algum lugar na internet. É como ter um servidor que fica sempre online.

### Exemplo Visual:

```
┌─────────────────────────────────────────┐
│   SEU COMPUTADOR (Desktop)              │
│                                         │
│   App Desktop ←→ Backend Local          │
│   (localhost:3001)                      │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│   CELULAR (Mobile)                      │
│                                         │
│   App Mobile ←→ Backend na Internet    │
│   (https://meu-backend.onrender.com)   │
└─────────────────────────────────────────┘
         │
         │ Internet
         ▼
┌─────────────────────────────────────────┐
│   SERVIDOR (Render.com)                 │
│                                         │
│   Backend Online                        │
│   ←→ Banco de Dados PostgreSQL         │
└─────────────────────────────────────────┘
```

## 🚀 Como obter a URL?

### Passo 1: Hospedar o Backend

A forma mais fácil é usar o **Render.com** (gratuito):

1. **Acesse:** https://render.com
2. **Crie conta** (pode usar GitHub)
3. **Crie um novo Web Service:**
   - Conecte seu repositório Git
   - Configure:
     - **Build Command:** `npm install`
     - **Start Command:** `node server.js`
   - Adicione variáveis de ambiente:
     ```
     DATABASE_URL=sua_url_do_banco_aqui
     PORT=10000
     NODE_ENV=production
     ```
4. **Depois do deploy**, você receberá uma URL tipo:
   ```
   https://anubis-backend.onrender.com
   ```

### Passo 2: Verificar se está funcionando

Abra no navegador:
```
https://seu-backend.onrender.com/api/health
```

Deve retornar algo como:
```json
{
  "status": "ok",
  "database": {
    "status": "healthy",
    "connected": true
  }
}
```

### Passo 3: Configurar no projeto

Crie/edite o arquivo `.env` na raiz do projeto:

```env
REACT_APP_API_URL=https://seu-backend.onrender.com
```

**⚠️ IMPORTANTE:** Substitua `seu-backend.onrender.com` pela URL real que o Render deu para você!

## 📝 Exemplo Completo

### 1. Você faz deploy do backend no Render.com

Depois de alguns minutos, o Render te dá:
```
https://anubis-backend-xyz123.onrender.com
```

### 2. Você testa no navegador

Acessa: `https://anubis-backend-xyz123.onrender.com/api/health`

Funciona? ✅ Perfeito!

### 3. Você configura no `.env`

```env
REACT_APP_API_URL=https://anubis-backend-xyz123.onrender.com
```

### 4. Você faz rebuild do app

```bash
npm run build
npm run mobile:sync
npm run mobile:apk
```

### 5. O app mobile agora usa essa URL

Quando o usuário abre o app no celular, ele vai conectar nessa URL na internet, não no seu computador local.

## ❓ Perguntas Frequentes

### Preciso pagar?

**Não!** O Render.com tem plano gratuito que é suficiente para começar.

### O que acontece se eu não configurar?

O app mobile vai tentar usar uma URL placeholder (`https://seu-servidor-backend.onrender.com`) que não existe, e vai dar erro de conexão.

### Posso usar localhost no mobile?

**Não!** O celular não tem acesso ao seu computador. Precisa ser uma URL pública na internet.

### E se meu computador estiver desligado?

Se o backend estiver hospedado no Render, funciona normalmente! O Render mantém o servidor online 24/7 (no plano gratuito pode hibernar depois de 15 minutos sem uso, mas volta quando recebe requisição).

### Como atualizo o backend depois?

1. Faça as mudanças no código
2. Faça commit e push para o Git
3. O Render detecta e faz deploy automático
4. Em alguns minutos, está atualizado!

## 🔗 Links Úteis

- [Documentação completa de deploy](../deployment/backend.md)
- [Render.com - Criar conta](https://render.com)
- [GUIA-APK.md](../../GUIA-APK.md) - Guia completo do APK

---

**Resumindo:** A `REACT_APP_API_URL` é o endereço do seu backend na internet que o app mobile usa para funcionar. Você precisa hospedar o backend (no Render.com ou similar) e colocar essa URL no arquivo `.env`.

