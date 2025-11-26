# 🔄 Sincronização Desktop ↔ Mobile

## ✅ Sim! As alterações no Desktop aparecem no Mobile

**O código React é compartilhado entre ambas as versões!**

## 📁 Estrutura Compartilhada

Ambas as versões usam o **mesmo código React** da pasta `src/`:

```
ANUBIS/
├── src/                    ← CÓDIGO COMPARTILHADO ✨
│   ├── App.js
│   ├── App.css
│   ├── components/         ← Todos os componentes
│   │   ├── Login.js
│   │   ├── CardGrid.js
│   │   ├── AdminPanel.js
│   │   └── ...
│   └── contexts/
│       └── ApiContext.js
│
├── main.js                 ← APENAS Desktop (Electron)
├── server.js               ← Backend (usado por ambos)
├── capacitor.config.json   ← APENAS Mobile (Capacitor)
└── android/                ← APENAS Mobile (gerado pelo Capacitor)
```

### O que é compartilhado:

✅ **Todo o código React** (`src/`)
- Componentes
- Estilos CSS
- Lógica de negócio
- Hooks e Contexts
- Funcionalidades

✅ **Backend** (`server.js`)
- API Express
- Rotas
- Lógica do servidor

### O que é específico:

🖥️ **Desktop (Electron):**
- `main.js` - Janela do Electron
- `preload.js` - Bridge Electron
- Interface específica do desktop

📱 **Mobile (Capacitor):**
- `capacitor.config.json` - Configuração do Capacitor
- `android/` - Projeto Android nativo

## 🔄 Fluxo de Trabalho: Alterar Código e Sincronizar

### Cenário: Você alterou algo no Desktop e quer no Mobile

#### 1. Desenvolvimento Normal (Desktop)

```bash
npm run dev
```

- Edite arquivos em `src/`
- Teste no desktop
- As mudanças aparecem em tempo real

#### 2. Quando quiser testar/sincronizar no Mobile

```bash
# Passo 1: Fazer build do React
npm run build

# Passo 2: Sincronizar com Capacitor
npm run mobile:sync

# Passo 3: Abrir no Android Studio (opcional, para testar)
npm run mobile:open
```

Ou tudo de uma vez:

```bash
npm run mobile:build
```

### 3. Gerar novo APK com as mudanças

Depois de sincronizar:
1. Abra Android Studio: `npm run mobile:open`
2. Build > Build Bundle(s) / APK(s) > Build APK(s)
3. Novo APK terá todas as alterações!

## 📝 Exemplos Práticos

### Exemplo 1: Adicionar um novo botão

**1. Edite o componente:**
```javascript
// src/components/Login.js
<button onClick={handleNewFeature}>
  Nova Funcionalidade
</button>
```

**2. Teste no Desktop:**
```bash
npm run dev
```

**3. Sincronize com Mobile:**
```bash
npm run mobile:build
```

**4. Pronto!** O botão aparecerá no mobile também.

### Exemplo 2: Mudar cores do tema

**1. Edite o CSS:**
```css
/* src/App.css */
.app-title {
  color: #ff0000; /* Nova cor */
}
```

**2. Teste e sincronize:**
```bash
npm run dev          # Teste desktop
npm run mobile:build # Sincronize mobile
```

**3. Gere novo APK** - Nova cor aparecerá!

### Exemplo 3: Adicionar novo componente

**1. Crie o componente:**
```javascript
// src/components/NewFeature.js
export default function NewFeature() {
  return <div>Nova Feature</div>;
}
```

**2. Use no App.js:**
```javascript
// src/App.js
import NewFeature from './components/NewFeature';
// ... usar no render
```

**3. Sincronize:**
```bash
npm run mobile:build
```

## ⚠️ Diferenças Importantes

### Detecção Automática de Ambiente

O `ApiContext.js` detecta automaticamente se está rodando em desktop ou mobile:

```javascript
// Desktop: usa localhost
http://localhost:3001/api

// Mobile: usa servidor remoto
https://seu-backend.onrender.com/api
```

**Não precisa mudar código!** Funciona automaticamente.

### Funcionalidades Específicas

Algumas coisas são diferentes:

| Recurso | Desktop | Mobile |
|---------|---------|--------|
| Backend | Local (localhost) | Remoto (servidor) |
| Janelas | Electron BrowserWindow | Navegador nativo |
| Notificações | Electron | Capacitor Push |
| Atalhos de teclado | Sim | Limitado |

## 🎯 Boas Práticas

### 1. Sempre teste no Desktop primeiro

```bash
npm run dev
```

Facilita o desenvolvimento e debugging.

### 2. Sincronize antes de gerar APK

```bash
npm run mobile:build
```

Garante que todas as mudanças estejam no mobile.

### 3. Verifique mudanças no mobile

Use o emulador Android ou dispositivo físico:
```bash
npm run mobile:open
# No Android Studio: Run > Run 'app'
```

### 4. Versionamento

Mantenha versões sincronizadas:
- Atualize `package.json` version
- Gere novos APKs com a mesma versão
- Documente mudanças

## 🚀 Scripts Úteis

```bash
# Desenvolvimento Desktop
npm run dev              # Desenvolvimento com hot-reload

# Build e Sincronização Mobile
npm run build            # Build do React apenas
npm run mobile:sync      # Sincronizar com Android
npm run mobile:build     # Build + Sync (completo)
npm run mobile:open      # Abrir no Android Studio

# Limpar e resetar
npm run clean            # Limpar builds e cache
```

## 📊 Resumo Visual

```
┌─────────────────────────────────┐
│   Você edita código em src/     │
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│   npm run dev                   │
│   (Desktop - Hot Reload)        │
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│   npm run mobile:build          │
│   (Build + Sync Mobile)         │
└─────────────┬───────────────────┘
              │
       ┌──────┴──────┐
       │             │
       ▼             ▼
┌──────────┐  ┌──────────┐
│ Desktop  │  │  Mobile  │
│ Electron │  │ Capacitor│
└──────────┘  └──────────┘
```

## ❓ Perguntas Frequentes

### Preciso fazer algo especial para sincronizar?

**Não!** Basta executar `npm run mobile:build` depois de fazer alterações.

### E se eu adicionar uma nova dependência?

1. Instale normalmente: `npm install nome-da-bib`
2. Sincronize: `npm run mobile:sync`
3. Pronto!

### Mudanças no backend aparecem automaticamente?

**Sim!** O backend (`server.js`) é o mesmo para ambos. Se você alterar:
- Rotas da API
- Lógica do servidor
- Banco de dados

Tanto desktop quanto mobile usarão as mesmas mudanças (desde que o backend esteja hospedado para o mobile).

### Posso ter código específico para cada plataforma?

**Sim!** Use a detecção no `ApiContext.js`:

```javascript
if (isMobile()) {
  // Código apenas para mobile
} else {
  // Código apenas para desktop
}
```

## ✅ Conclusão

**Todas as alterações no código React aparecem automaticamente em ambas as versões!** 

Apenas sincronize com `npm run mobile:build` quando quiser atualizar o mobile. É simples assim! 🎉

