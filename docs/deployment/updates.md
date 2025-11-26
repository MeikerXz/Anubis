# 🔄 Configuração do Servidor de Atualização

Este documento explica como configurar um servidor para distribuir atualizações automáticas do aplicativo ANUBIS.

## Visão Geral

O sistema de atualização automática usa `electron-updater` com um provedor genérico, permitindo que você hospede as atualizações em qualquer servidor HTTP/HTTPS.

## Estrutura do Servidor

O servidor de atualização deve fornecer um arquivo `latest.yml` (ou `latest-mac.yml` para macOS) que contém informações sobre a versão mais recente.

### Estrutura de Diretórios Recomendada

```
/updates/
  ├── latest.yml          (ou latest-mac.yml para macOS)
  ├── ANUBIS-Setup-1.0.1.exe  (Windows)
  ├── ANUBIS-1.0.1.dmg    (macOS - opcional)
  └── ANUBIS-1.0.1.AppImage (Linux - opcional)
```

## Formato do arquivo latest.yml

O arquivo `latest.yml` deve seguir este formato:

```yaml
version: 1.0.1
files:
  - url: ANUBIS-Setup-1.0.1.exe
    sha512: [hash SHA512 do arquivo]
    size: [tamanho em bytes]
path: ANUBIS-Setup-1.0.1.exe
sha512: [hash SHA512 do arquivo]
releaseDate: '2024-01-15T10:00:00.000Z'
```

### Gerando o arquivo latest.yml

Quando você compila o aplicativo com `electron-builder`, ele gera automaticamente o arquivo `latest.yml` na pasta `dist`. Você pode copiar este arquivo e o instalador para seu servidor.

## Configuração no Aplicativo

### 1. Configurar URL do Servidor

Edite o arquivo `package.json` e atualize a URL no campo `publish`:

```json
"publish": {
  "provider": "generic",
  "url": "https://seu-servidor.com/updates"
}
```

### 2. Usar Variável de Ambiente (Opcional)

Você também pode configurar via variável de ambiente. Edite o arquivo `.env`:

```
UPDATE_SERVER_URL=https://seu-servidor.com/updates
```

O código em `main.js` verifica primeiro a variável de ambiente, depois usa o valor padrão do `package.json`.

## Opções de Hospedagem

### Opção 1: Servidor Web Simples (Apache/Nginx)

1. Configure um servidor web (Apache, Nginx, etc.)
2. Faça upload dos arquivos de atualização para o diretório `/updates/`
3. Configure CORS se necessário:

**Nginx:**
```nginx
location /updates {
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods "GET, OPTIONS";
}
```

**Apache (.htaccess):**
```apache
<Directory "/updates">
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET, OPTIONS"
</Directory>
```

### Opção 2: GitHub Releases

Você pode usar GitHub Releases modificando a configuração:

```json
"publish": {
  "provider": "github",
  "owner": "seu-usuario",
  "repo": "anubis"
}
```

### Opção 3: Servidor Node.js/Express

Exemplo de servidor Express simples:

```javascript
const express = require('express');
const path = require('path');
const app = express();

app.use('/updates', express.static(path.join(__dirname, 'updates')));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  next();
});

app.listen(3000, () => {
  console.log('Servidor de atualização rodando na porta 3000');
});
```

## Processo de Build e Publicação

1. **Atualizar versão no package.json:**
   ```json
   "version": "1.0.1"
   ```

2. **Build do React:**
   ```bash
   npm run build
   ```

3. **Build do Electron:**
   ```bash
   npm run build:electron
   ```

4. **Upload dos arquivos:**
   - Copie `latest.yml` de `dist/` para seu servidor
   - Copie o instalador (`.exe`, `.dmg`, etc.) para seu servidor
   - Mantenha a mesma estrutura de diretórios

## Testando Atualizações

### Modo Desenvolvimento

O sistema de atualização está desabilitado em modo desenvolvimento. Para testar:

1. Compile uma versão de produção
2. Instale a versão compilada
3. Compile uma nova versão com número maior
4. Faça upload para o servidor
5. Execute a versão instalada - ela deve detectar a atualização

### Verificação Manual

Você pode verificar manualmente clicando no botão de atualização (ícone 🔄) no canto inferior direito da aplicação.

## Segurança

### Assinatura de Atualizações (Recomendado)

Para maior segurança, considere assinar suas atualizações:

1. Gere um certificado de código:
   ```bash
   # Windows
   signtool sign /f certificate.pfx /p senha arquivo.exe
   ```

2. Configure no `package.json`:
   ```json
   "win": {
     "certificateFile": "path/to/certificate.pfx",
     "certificatePassword": "senha"
   }
   ```

### HTTPS

Sempre use HTTPS para o servidor de atualização para proteger contra ataques man-in-the-middle.

## Troubleshooting

### Atualização não detectada

1. Verifique se a URL está correta no `package.json`
2. Verifique se o arquivo `latest.yml` está acessível
3. Verifique se a versão no `package.json` é maior que a versão instalada
4. Verifique os logs do console para erros

### Erro ao baixar

1. Verifique se o arquivo de instalação está acessível
2. Verifique se o hash SHA512 no `latest.yml` corresponde ao arquivo
3. Verifique permissões do servidor

### Erro ao instalar

1. Verifique se o usuário tem permissões de administrador
2. Verifique se não há outros processos do aplicativo rodando
3. Verifique se há espaço em disco suficiente

## Notas

- O sistema verifica atualizações automaticamente 5 segundos após a inicialização
- Atualizações só funcionam em versões compiladas (não em modo desenvolvimento)
- O usuário pode escolher quando baixar e instalar atualizações
- O aplicativo será reiniciado automaticamente após a instalação

## 📚 Próximos Passos

- [Voltar para Documentação Principal](../README.md)

