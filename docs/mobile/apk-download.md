# 📱 Configuração do Botão de Download do APK

Este guia explica como configurar o botão de download do APK que foi adicionado ao sistema.

## 🎯 O que foi adicionado

✅ Botão **"📱 DOWNLOAD APP"** no header do sistema
✅ Modal informativo com instruções de instalação
✅ Suporte para URL configurável do APK

## ⚙️ Como Configurar

### Opção 1: URL Externa (Recomendado)

Configure a URL do APK via variável de ambiente ou diretamente no código.

#### Via Variável de Ambiente

No arquivo `.env`, adicione:

```env
REACT_APP_APK_URL=https://seu-servidor.com/anubis.apk
```

#### Via localStorage (Dinâmico)

Você pode configurar no código para permitir alteração dinâmica:

```javascript
localStorage.setItem('ANUBIS_APK_URL', 'https://seu-servidor.com/anubis.apk');
```

#### Diretamente no Código

Edite `src/components/DownloadApp.js` e altere a linha:

```javascript
const apkUrl = 'https://seu-servidor.com/anubis.apk';
```

### Opção 2: Servir APK pelo Próprio Backend

O servidor já está configurado para servir o APK diretamente!

#### Passos:

1. **Crie a pasta para o APK:**
   ```bash
   mkdir -p public/apk
   ```

2. **Copie o APK para a pasta:**
   ```bash
   cp android/app/build/outputs/apk/debug/app-debug.apk public/apk/anubis.apk
   ```

3. **Configure a URL no componente:**
   
   Edite `src/components/DownloadApp.js`:
   ```javascript
   const apkUrl = process.env.REACT_APP_APK_URL || 
                  `${window.location.origin}/download/apk`;
   ```

   Ou use a API URL:
   ```javascript
   const { apiUrl } = useApi();
   const apkUrl = apiUrl.replace('/api', '/download/apk');
   ```

## 🌐 Opções de Hospedagem do APK

### 1. GitHub Releases (Gratuito)

1. Vá para seu repositório no GitHub
2. Crie um **Release**
3. Faça upload do APK
4. Use a URL direta do arquivo:
   ```
   https://github.com/seu-usuario/anubis/releases/download/v1.0.0/anubis.apk
   ```

### 2. Servidor Próprio (Nginx/Apache)

1. Faça upload do APK para seu servidor
2. Configure o servidor web para servir o arquivo
3. Use a URL completa:
   ```
   https://seu-servidor.com/downloads/anubis.apk
   ```

### 3. Google Drive / Dropbox

1. Faça upload do APK
2. Obtenha o link de compartilhamento direto
3. Use como URL

### 4. Render.com / Vercel / Netlify

Você pode adicionar o APK como um arquivo estático no projeto.

### 5. Backend Próprio (Já Configurado)

Como mencionado na Opção 2, o servidor já tem rota para servir o APK!

## 🔧 Configuração Completa

### 1. Gerar o APK

```bash
npm run mobile:build
npm run mobile:open
# No Android Studio: Build > Build APK
```

### 2. Hospedar o APK

Escolha uma das opções acima.

### 3. Configurar URL

Configure no `.env`:

```env
REACT_APP_APK_URL=https://seu-servidor.com/anubis.apk
```

Ou edite diretamente em `DownloadApp.js`.

### 4. Rebuild

```bash
npm run build
```

### 5. Testar

- O botão aparecerá no header
- Ao clicar, mostrará modal com instruções
- Ao confirmar, fará download do APK

## 📝 Personalização

### Alterar Textos do Modal

Edite `src/components/DownloadApp.js`:

```javascript
<p>Seu texto personalizado aqui</p>
```

### Alterar Estilo do Botão

Edite `src/components/DownloadApp.css` para personalizar cores e efeitos.

### Ocultar Botão para Não-Admin

No `src/App.js`, adicione condição:

```javascript
{user.is_admin && <DownloadApp />}
```

Ou sempre visível (padrão atual):

```javascript
<DownloadApp />
```

## 🔒 Segurança

### Verificação de Autenticação (Opcional)

Se quiser restringir o download apenas para usuários autenticados, edite a rota no `server.js`:

```javascript
app.get('/download/apk', requireAuth, (req, res) => {
  // ... código de download
});
```

### Verificação de Admin (Opcional)

Para restringir apenas para admins:

```javascript
app.get('/download/apk', requireAdmin, (req, res) => {
  // ... código de download
});
```

## ✅ Checklist

- [ ] APK gerado e testado
- [ ] APK hospedado em algum lugar
- [ ] URL configurada no `.env` ou no código
- [ ] Rebuild feito (`npm run build`)
- [ ] Botão aparece no header
- [ ] Download funciona corretamente
- [ ] Instruções do modal estão claras

## 📚 Recursos Adicionais

- [MOBILE_SETUP.md](MOBILE_SETUP.md) - Como gerar o APK
- [BACKEND_DEPLOY.md](BACKEND_DEPLOY.md) - Como hospedar o backend
- [SYNC_DESKTOP_MOBILE.md](SYNC_DESKTOP_MOBILE.md) - Sincronização de código

---

**Pronto!** O botão de download está configurado e funcionando! 🎉

