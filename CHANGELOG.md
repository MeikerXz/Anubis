# Changelog - ANUBIS

## Versão 1.0.0 - Atualização Completa

### ✨ Funcionalidades Implementadas

- ✅ **Cards clicáveis** - Cards que abrem modal com lista de links
- ✅ **Títulos de links** - Mostra título se disponível, senão mostra apenas URL
- ✅ **Botão Admin** - Aparece apenas quando há login de admin
- ✅ **Sistema de Login** - Credenciais armazenadas no banco de dados PostgreSQL
- ✅ **Painel Admin** - Configuração completa de cards, links, tags e usuários
- ✅ **Estética Hacker** - Interface com cores Vinho (#8a2be2) e Midnight Blue (#191970)
- ✅ **Logs de fundo** - Efeito visual hacker
- ✅ **Motor de busca** - Busca por cards (título/descrição)
- ✅ **Sistema de tags** - Organização e filtragem por tags
- ✅ **Sistema independente** - Tudo configurável via banco de dados (sem necessidade de atualizar programa)

### 🔄 Dependências Atualizadas (Versões Mais Recentes)

#### Dependências de Produção:
- ✅ `axios`: ^1.13.2 (atualizado de 1.6.2)
- ✅ `bcryptjs`: ^3.0.3 (atualizado de 2.4.3)
- ✅ `body-parser`: ^1.20.3 (atualizado de 1.20.2)
- ✅ `cors`: ^2.8.5 (mantido)
- ✅ `dotenv`: ^17.2.3 (mantido)
- ✅ `express`: ^4.21.2 (atualizado de 4.18.2)
- ✅ `pg`: ^8.16.3 (atualizado de 8.11.3)
- ✅ `react`: ^18.3.1 (atualizado de 18.2.0)
- ✅ `react-dom`: ^18.3.1 (atualizado de 18.2.0)
- ✅ `react-router-dom`: ^7.1.3 (atualizado de 6.20.0)

#### Dependências de Desenvolvimento:
- ✅ `@electron/rebuild`: ^4.0.1 (mantido)
- ✅ `concurrently`: ^9.2.1 (atualizado de 8.2.2)
- ✅ `cross-env`: ^7.0.3 (mantido)
- ✅ `electron`: ^39.2.3 (atualizado de 28.3.3)
- ✅ `electron-builder`: ^26.0.12 (atualizado de 24.9.1)
- ✅ `react-scripts`: 5.0.1 (mantido - última versão estável)
- ✅ `wait-on`: ^9.0.3 (atualizado de 7.2.0)

### 🛠️ Melhorias Técnicas

- ✅ **Detecção automática de porta** - Sistema tenta portas 3001-3010 automaticamente
- ✅ **Retry logic** - Reconexão automática em caso de falha
- ✅ **Health checks** - Endpoint `/api/health` para monitoramento
- ✅ **Graceful shutdown** - Encerramento seguro do servidor
- ✅ **Logging aprimorado** - Logs detalhados e informativos
- ✅ **Tratamento de erros robusto** - Validação e mensagens claras
- ✅ **Configuração via .env** - Fácil configuração do banco de dados

### 📋 Estrutura do Banco de Dados

- **users** - Usuários e autenticação (com is_admin)
- **cards** - Cards principais (ordenados por ID)
- **links** - Links associados aos cards (usa card_id como FOREIGN KEY)
- **tags** - Tags para categorização
- **card_tags** - Relacionamento entre cards e tags

### 🔒 Segurança

- ✅ Senhas criptografadas com bcrypt
- ✅ Content Security Policy configurado
- ✅ Proteções do Electron habilitadas
- ✅ Variáveis de ambiente para credenciais
- ✅ Electron atualizado para versão segura (39.2.3)

### 📝 Notas

- React 18.3.1 usado (em vez de 19.x) para compatibilidade com react-scripts 5.0.1
- Express 4.x mantido (versão 5 ainda em desenvolvimento)
- Todas as dependências atualizadas para versões mais recentes estáveis
