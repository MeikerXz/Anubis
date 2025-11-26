# 🔧 Solução: Erro "could not determine executable to run"

## ❌ Erro
```
npm error could not determine executable to run
```

## 🔍 Causa

Este erro geralmente acontece quando:

1. **Comando não existe** - Tentou executar um script que não está no `package.json`
2. **Problema com `&&` no Windows** - PowerShell não suporta `&&` como separador
3. **Dependência faltando** - Algum comando (`npx`, `node`, etc.) não está disponível
4. **Script malformado** - Erro de sintaxe no `package.json`

## ✅ Soluções

### 1. Verificar qual comando você executou

O erro mostra apenas a mensagem genérica. Qual comando você tentou executar?

Comandos válidos:
```powershell
npm run dev
npm run build
npm run start
npm run criar-admin
npm run mobile:sync
npm run mobile:open
```

### 2. Testar comandos básicos

```powershell
# Verificar se npm funciona
npm --version

# Verificar se node funciona  
node --version

# Ver todos os scripts disponíveis
npm run
```

### 3. Se o erro for com comandos Mobile

Os scripts mobile foram ajustados. Execute um de cada vez:

```powershell
# ❌ NÃO faça isso (não funciona no PowerShell):
npm run mobile:apk

# ✅ Faça isso (um comando de cada vez):
npm run build
npx cap sync android
npx cap open android
```

### 4. Se o erro for com `npm run dev`

O script `dev` pode ter problemas no Windows. Tente executar os comandos separadamente:

```powershell
# Opção 1: Executar separadamente
npm run dev:react

# Em outro terminal:
npm start

# Opção 2: Instalar dependências novamente
npm install
```

### 5. Limpar e reinstalar

Se nada funcionar, tente limpar tudo:

```powershell
# Remover node_modules e reinstalar
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
```

## 🎯 Comandos Corrigidos para Windows

### Desktop
```powershell
npm run dev          # Deve funcionar normalmente
npm run build        # Deve funcionar normalmente
npm run start        # Deve funcionar normalmente
```

### Mobile (execute separadamente)

**Inicializar (primeira vez):**
```powershell
npm run build
npx cap add android
npx cap sync android
```

**Atualizar após mudanças:**
```powershell
npm run build
npx cap sync android
npx cap open android
```

## 📝 Verificar Logs Completos

O erro menciona um arquivo de log. Para ver detalhes:

```powershell
# O caminho do log está no erro:
C:\Users\Meiker\AppData\Local\npm-cache\_logs\2025-11-26T09_13_11_845Z-debug-0.log

# Para ler no PowerShell:
Get-Content "C:\Users\Meiker\AppData\Local\npm-cache\_logs\2025-11-26T09_13_11_845Z-debug-0.log"
```

## 🆘 Ajuda Adicional

Se o erro persistir, me informe:

1. **Qual comando você executou?** (ex: `npm run mobile:apk`)
2. **Qual a mensagem completa do erro?**
3. **O que você estava tentando fazer?**

Com essas informações posso ajudar melhor!

## ✅ Checklist

- [ ] Verifiquei qual comando causei o erro
- [ ] Testei comandos básicos (`npm --version`, `node --version`)
- [ ] Executei `npm install` para garantir dependências instaladas
- [ ] Tentei executar comandos separadamente (não com `&&`)
- [ ] Verifiquei os logs completos do erro

---

**Dica:** No Windows, prefira executar comandos separadamente ao invés de usar `&&`!

