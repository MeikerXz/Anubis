# 🔧 Solução de Problemas: Conexão do Mobile ao Banco de Dados

Este guia ajuda a diagnosticar e resolver problemas de conexão do aplicativo mobile ao backend e banco de dados.

## 🚨 Problema: App Mobile Não Conecta ao Banco de Dados

### Sintomas
- App mobile não carrega dados
- Erro de conexão ao fazer login
- Mensagens de erro sobre API não encontrada
- Timeout ao tentar acessar o backend

## 🔍 Diagnóstico

### 1. Verificar se a URL da API Está Configurada

**Problema:** A URL do backend não foi configurada antes do build.

**Solução:**

1. **Crie ou edite o arquivo `.env` na raiz do projeto:**

```env
REACT_APP_API_URL=https://seu-backend-real.onrender.com
```

2. **⚠️ IMPORTANTE:** Substitua `seu-backend-real.onrender.com` pela URL **real** do seu backend hospedado.

3. **Faça rebuild completo:**

```bash
npm run build
npm run mobile:sync
npm run mobile:apk
```

### 2. Verificar se o Backend Está Online

**Problema:** O backend não está rodando ou não está acessível.

**Solução:**

1. **Teste a URL no navegador:**
   - Acesse: `https://seu-backend.onrender.com/api/health`
   - Deve retornar um JSON com status `"ok"`

2. **Verifique se o backend está hospedado:**
   - Render.com: Verifique o dashboard do serviço
   - Heroku: Verifique se o dyno está ativo
   - Outros: Verifique se o serviço está rodando

### 3. Verificar Configuração do CORS

**Problema:** O backend bloqueia requisições do app mobile.

**Solução:**

No arquivo `server.js`, certifique-se de que o CORS está configurado assim:

```javascript
app.use(cors({
  origin: '*', // Ou lista específica de origens
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 4. Verificar Conexão do Backend ao Banco

**Problema:** O backend está online, mas não consegue conectar ao banco de dados.

**Solução:**

1. **Verifique as variáveis de ambiente no servidor:**
   - `DATABASE_URL` deve estar configurada corretamente
   - Para Render.com: Use a **External Database URL** (não a Internal)

2. **Teste a conexão do backend:**
   ```bash
   npm run diagnose
   ```

### 5. Verificar Logs no Console do App

**Problema:** Não há informações sobre o erro.

**Solução:**

1. **No dispositivo Android:**
   - Conecte via USB
   - Use `adb logcat` para ver logs
   - Ou use Chrome DevTools: `chrome://inspect`

2. **Procure por mensagens como:**
   - `⚠️ ATENÇÃO: URL da API não configurada!`
   - `❌ Erro de rede ao conectar à API`
   - `❌ Timeout ao conectar à API`

## 📋 Checklist de Verificação

Use esta lista para diagnosticar problemas:

- [ ] Arquivo `.env` existe na raiz do projeto
- [ ] `REACT_APP_API_URL` está configurada no `.env`
- [ ] A URL não é o placeholder padrão (`seu-servidor-backend.onrender.com`)
- [ ] Backend está online e acessível
- [ ] Endpoint `/api/health` retorna status `ok`
- [ ] CORS está configurado no servidor
- [ ] Backend consegue conectar ao banco de dados
- [ ] App foi rebuild após configurar a URL
- [ ] APK foi gerado após o rebuild

## 🛠️ Soluções Comuns

### Erro: "URL da API não configurada"

**Causa:** A variável `REACT_APP_API_URL` não foi configurada antes do build.

**Solução:**
1. Crie arquivo `.env` com `REACT_APP_API_URL=https://seu-backend.com`
2. Execute `npm run build`
3. Execute `npm run mobile:sync`
4. Gere novo APK

### Erro: "Não foi possível conectar à API"

**Causa:** Backend não está online ou URL incorreta.

**Solução:**
1. Verifique se o backend está rodando
2. Teste a URL no navegador
3. Verifique se a URL está correta no `.env`
4. Verifique configuração de CORS no servidor

### Erro: "Timeout ao conectar"

**Causa:** Backend está lento ou não está respondendo.

**Solução:**
1. Verifique se o backend está online
2. Verifique logs do servidor para erros
3. Teste a conexão com o banco de dados
4. Verifique se não há problemas de rede

### Erro: "CORS não permitido"

**Causa:** Servidor está bloqueando requisições do mobile.

**Solução:**
1. Configure CORS no `server.js` para aceitar todas as origens
2. Reinicie o servidor
3. Gere novo APK

## 🔄 Processo Correto de Configuração

Siga estes passos na ordem:

1. **Configure o backend:**
   - Hospede o backend (Render.com, Heroku, etc.)
   - Configure `DATABASE_URL` no servidor
   - Verifique que está funcionando

2. **Configure o mobile:**
   - Crie arquivo `.env` com `REACT_APP_API_URL`
   - Substitua pela URL real do backend

3. **Faça rebuild:**
   ```bash
   npm run build
   npm run mobile:sync
   ```

4. **Gere novo APK:**
   ```bash
   npm run mobile:apk
   ```

5. **Teste:**
   - Instale o APK no dispositivo
   - Abra o app
   - Verifique os logs do console
   - Tente fazer login

## 📱 Configuração Dinâmica (Alternativa)

Se você não configurou antes do build, pode usar localStorage:

1. **Abra o console do app no dispositivo**
2. **Execute:**
   ```javascript
   localStorage.setItem('ANUBIS_API_URL', 'https://seu-backend.com');
   ```
3. **Recarregue o app**

**⚠️ Nota:** Esta é uma solução temporária. Para produção, configure no `.env` antes do build.

## 📞 Ainda com Problemas?

Se nenhuma das soluções acima funcionou:

1. Verifique os logs detalhados no console
2. Teste a URL do backend diretamente no navegador
3. Verifique se o banco de dados está acessível
4. Verifique se há erros no servidor backend
5. Consulte a documentação do serviço de hospedagem

## 🔗 Links Úteis

- [GUIA-APK.md](../../GUIA-APK.md) - Guia completo de geração de APK
- [docs/mobile/setup.md](../mobile/setup.md) - Configuração do mobile
- [docs/deployment/backend.md](../deployment/backend.md) - Deploy do backend

---

**Última atualização:** 2024

