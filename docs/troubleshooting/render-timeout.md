# 🔧 Solução: Timeout do Backend no Render.com

## 🚨 Problema: Backend não responde / Timeout

O erro mostra que o backend em `https://anubis-vdnn.onrender.com/api` não está respondendo.

## ✅ Soluções

### 1. Backend Hibernado (Plano Gratuito)

No plano gratuito do Render, o serviço **hiberna após 15 minutos sem uso**. 

**Solução:**
- **A primeira requisição pode demorar até 60 segundos** para acordar o serviço
- Aguarde alguns segundos e tente novamente no app
- Ou faça uma requisição manual no navegador primeiro para acordar

### 2. Verificar Status no Dashboard do Render

1. Acesse: https://dashboard.render.com
2. Clique no seu serviço `anubis-vdnn`
3. Verifique se o status está **"Live"** (verde)
4. Se estiver **"Sleeping"** (cinza), clique em **"Manual Deploy"** → **"Clear build cache & deploy"**

### 3. Verificar Logs do Backend

No dashboard do Render:
1. Clique na aba **"Logs"**
2. Verifique se há erros:
   - Erro de conexão com banco de dados
   - Erro de porta
   - Erros de dependências

### 4. Verificar Variáveis de Ambiente

No dashboard do Render:
1. Vá em **"Environment"**
2. Verifique se todas as variáveis estão configuradas:
   - `DATABASE_URL` ✅
   - `PORT` ✅ (deixe vazio ou use 10000)
   - `NODE_ENV` = `production` ✅
   - `CORS_ALLOWED_ORIGINS` = `*` ✅ (opcional)

### 5. Re-deploy do Backend

Se nada funcionar, faça um novo deploy:

1. No dashboard do Render, clique em **"Manual Deploy"**
2. Selecione **"Clear build cache & deploy"**
3. Aguarde o deploy terminar (pode levar 5-10 minutos)

### 6. Testar a URL no Navegador

Abra no navegador:
```
https://anubis-vdnn.onrender.com/api/health
```

**Resultados esperados:**
- ✅ **Funciona:** Deve retornar JSON com `{"status": "ok", ...}`
- ❌ **Timeout:** Backend está hibernando ou com problema
- ❌ **404:** Deploy não foi bem-sucedido

## 🔄 Plano Gratuito vs Pago

**Plano Gratuito:**
- ❌ Hiberna após 15 minutos sem uso
- ❌ Primeira requisição após hibernar pode demorar até 60s
- ✅ Gratuito

**Plano Pago (Starter - $7/mês):**
- ✅ Não hiberna
- ✅ Sempre online
- ✅ Responde imediatamente

## 💡 Dica Rápida

Se você está apenas testando, pode **acordar o backend manualmente** antes de usar o app:

1. Abra o navegador
2. Acesse: `https://anubis-vdnn.onrender.com/api/health`
3. Aguarde carregar (pode demorar até 60s na primeira vez)
4. Depois disso, o app mobile deve funcionar normalmente

## 📋 Checklist

- [ ] Verificou o status no dashboard do Render (deve estar "Live")
- [ ] Testou a URL no navegador (`/api/health`)
- [ ] Verificou os logs do backend no Render
- [ ] Verificou as variáveis de ambiente
- [ ] Tentou fazer um novo deploy se necessário

---

**Problema ainda persiste?** Verifique:
- [docs/troubleshooting/mobile-connection.md](./mobile-connection.md)
- [docs/deployment/backend.md](../deployment/backend.md)

