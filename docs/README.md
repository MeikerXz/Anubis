# 📚 Documentação do ANUBIS

Bem-vindo à documentação completa do ANUBIS! Esta documentação está organizada por categorias para facilitar a navegação.

## 📖 Índice

### 🚀 Início Rápido
- **[README Principal](../README.md)** - Visão geral e início rápido do projeto

### ⚙️ Configuração e Setup
- **[Configuração do Banco de Dados](setup/database.md)** - Como configurar PostgreSQL no Render.com
- **[Configuração do Ambiente](../README.md#-configuração)** - Variáveis de ambiente e configuração básica

### 🚀 Deploy e Produção
- **[Deploy do Backend](deployment/backend.md)** - Como hospedar o backend para produção
- **[Servidor de Atualizações](deployment/updates.md)** - Configurar atualizações automáticas do Electron

### 📱 Versão Mobile
- **[Setup Mobile](mobile/setup.md)** - Como gerar o APK para Android
- **[Download do APK](mobile/apk-download.md)** - Configurar botão de download do APK
- **[Sincronização Desktop/Mobile](mobile/sync.md)** - Como sincronizar código entre versões

### 🔧 Solução de Problemas
- **[Scripts no Windows](troubleshooting/windows-scripts.md)** - Comandos específicos para Windows PowerShell
- **[Erros do NPM](troubleshooting/npm-errors.md)** - Solução de problemas comuns do npm

### 📄 Documentação Adicional
- **[SECURITY.md](../SECURITY.md)** - Informações sobre segurança e vulnerabilidades
- **[CHANGELOG.md](../CHANGELOG.md)** - Histórico de mudanças e versões

## 🗺️ Mapa de Navegação

```
ANUBIS/
├── README.md                    ← Início aqui!
├── SECURITY.md                  ← Segurança
├── CHANGELOG.md                 ← Histórico
└── docs/                        ← Você está aqui
    ├── README.md                ← Índice da documentação
    ├── setup/                   ← Configuração inicial
    │   └── database.md
    ├── deployment/               ← Deploy e produção
    │   ├── backend.md
    │   └── updates.md
    ├── mobile/                  ← Versão mobile
    │   ├── setup.md
    │   ├── apk-download.md
    │   └── sync.md
    └── troubleshooting/         ← Solução de problemas
        ├── windows-scripts.md
        └── npm-errors.md
```

## 🎯 Guias por Objetivo

### Quero começar a usar o ANUBIS
1. Leia o [README Principal](../README.md)
2. Configure o [Banco de Dados](setup/database.md)
3. Execute `npm run dev`

### Quero gerar um APK para Android
1. Leia [Setup Mobile](mobile/setup.md)
2. Configure o [Backend em Produção](deployment/backend.md)
3. Siga o [guia de download do APK](mobile/apk-download.md)

### Quero fazer deploy do backend
1. Leia [Deploy do Backend](deployment/backend.md)
2. Configure [CORS e segurança](deployment/backend.md#-segurança-recomendado-para-produção)

### Estou tendo problemas
1. Consulte [Troubleshooting](troubleshooting/)
2. Verifique [Erros do NPM](troubleshooting/npm-errors.md)
3. Veja [Scripts para Windows](troubleshooting/windows-scripts.md)

## 📝 Contribuindo

Se você encontrar algum problema na documentação ou quiser adicionar informações, sinta-se à vontade para:

1. Abrir uma issue
2. Fazer um pull request
3. Sugerir melhorias

## 🔗 Links Úteis

- [Render.com](https://render.com) - Hospedagem gratuita
- [Capacitor Docs](https://capacitorjs.com/docs) - Documentação do Capacitor
- [Electron Docs](https://www.electronjs.org/docs) - Documentação do Electron
- [PostgreSQL Docs](https://www.postgresql.org/docs/) - Documentação do PostgreSQL

---

**Última atualização:** Novembro 2024

