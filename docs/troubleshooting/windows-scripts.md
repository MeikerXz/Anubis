# 🪟 Scripts para Windows (PowerShell)

## ⚠️ Problema no Windows

No Windows PowerShell, o operador `&&` não funciona como no bash/Linux. Por isso, alguns scripts foram divididos.

## 📝 Scripts Disponíveis

### Desktop

```powershell
npm run dev              # Desenvolvimento (React + Electron)
npm run build            # Build do React
npm run start            # Executar Electron
npm run criar-admin      # Criar usuário admin via CLI
npm run build:electron   # Build para distribuição (Desktop)
```

### Mobile (Passo a Passo)

Como o `&&` não funciona bem no PowerShell, execute os comandos separadamente:

#### Inicializar Projeto Mobile:

```powershell
# Passo 1: Fazer build
npm run mobile:build

# Passo 2: Adicionar plataforma Android (apenas primeira vez)
npm run mobile:init:add

# Passo 3: Sincronizar
npm run mobile:sync
```

#### Atualizar após mudanças:

```powershell
# Passo 1: Build do React
npm run mobile:build

# Passo 2: Sincronizar com Android
npm run mobile:build:sync

# Passo 3: Abrir no Android Studio
npm run mobile:open
```

## 🔧 Comandos Alternativos

Se preferir, pode executar diretamente:

```powershell
# Build do React
npm run build

# Sincronizar Capacitor
npx cap sync android

# Abrir Android Studio
npx cap open android
```

## ✅ Solução Completa: Inicializar Mobile no Windows

```powershell
# 1. Build
npm run build

# 2. Adicionar Android (primeira vez apenas)
npx cap add android

# 3. Sincronizar
npx cap sync android

# 4. Abrir Android Studio
npx cap open android
```

## 🚀 Solução Completa: Atualizar após mudanças

```powershell
# 1. Build do React
npm run build

# 2. Sincronizar
npx cap sync android

# 3. Abrir Android Studio (opcional)
npx cap open android
```

## 💡 Dica

Se quiser usar `&&` no Windows, instale o Git Bash ou use o WSL (Windows Subsystem for Linux).

Ou crie um arquivo `.bat` ou `.ps1` que execute os comandos sequencialmente.

---

**Nota:** Os scripts foram ajustados para funcionar melhor no PowerShell, mas para desenvolvimento mobile, é recomendado executar os comandos separadamente.

