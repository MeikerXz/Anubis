# 📱 Guia de Configuração para Versão Mobile (APK)

Este guia explica como criar uma versão APK do ANUBIS para instalar em dispositivos Android.

## 📋 Pré-requisitos

### 1. Instalar Android Studio
- Baixe e instale o [Android Studio](https://developer.android.com/studio)
- Durante a instalação, certifique-se de instalar:
  - Android SDK
  - Android SDK Platform
  - Android Virtual Device (AVD) - opcional, para testar no emulador
- Configure as variáveis de ambiente:
  - `ANDROID_HOME` = Caminho para o Android SDK
  - Adicione `$ANDROID_HOME/platform-tools` e `$ANDROID_HOME/tools` ao PATH

### 2. Instalar Java JDK
- Baixe e instale o [Java JDK 17 ou superior](https://adoptium.net/)
- Configure a variável de ambiente `JAVA_HOME`

### 3. Node.js e npm
- Certifique-se de ter Node.js instalado (já deve estar, pois usa Electron)

## 🚀 Passo a Passo

### Passo 1: Instalar Dependências do Capacitor

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
```

### Passo 2: Inicializar Capacitor

```bash
npm run mobile:init
```

Isso irá:
- Fazer build do React
- Adicionar a plataforma Android ao projeto
- Criar a estrutura de pastas do Android

### Passo 3: Configurar URL da API (IMPORTANTE)

Antes de gerar o APK, você precisa configurar a URL do servidor backend que será usado pelo app mobile.

#### Opção A: Usando Variável de Ambiente

Crie um arquivo `.env` na raiz do projeto com:

```env
REACT_APP_API_URL=https://seu-servidor-backend.onrender.com
```

**⚠️ IMPORTANTE:** Substitua `seu-servidor-backend.onrender.com` pela URL real do seu servidor backend hospedado.

#### Opção B: Configurar no Código

Edite `src/contexts/ApiContext.js` e altere a linha:

```javascript
const mobileApiUrl = process.env.REACT_APP_API_URL || 
                     localStorage.getItem('ANUBIS_API_URL') ||
                     'https://seu-servidor-backend.onrender.com';
```

#### Opção C: Configuração Dinâmica no App

O app permite configurar a URL via localStorage. Você pode adicionar uma tela de configuração ou definir no primeiro uso.

### Passo 4: Hospedar o Backend

O backend precisa estar hospedado em um servidor acessível pela internet (não pode ser localhost no mobile).

#### Opção Recomendada: Render.com

1. Crie uma conta no [Render.com](https://render.com)
2. Crie um novo **Web Service**
3. Conecte seu repositório GitHub (ou faça deploy direto)
4. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Environment Variables:**
     - `DATABASE_URL` = URL do seu banco PostgreSQL
     - `PORT` = `10000` (Render usa porta dinâmica, mas pode definir)
     - `NODE_ENV` = `production`
5. Depois do deploy, copie a URL do serviço (ex: `https://anubis-backend.onrender.com`)

#### Ajustar CORS no Backend

No arquivo `server.js`, certifique-se de que o CORS está configurado para aceitar requisições do app mobile:

```javascript
app.use(cors({
  origin: '*', // Ou específico: ['capacitor://localhost', 'http://localhost']
  credentials: true
}));
```

### Passo 5: Rebuild com a Nova URL

Após configurar a URL:

```bash
npm run build
npm run mobile:sync
```

### Passo 6: Personalizar o App (Opcional)

Edite `android/app/src/main/res/values/strings.xml`:

```xml
<resources>
    <string name="app_name">ANUBIS</string>
</resources>
```

### Passo 7: Gerar o APK

#### Opção A: Via Gradle (Linha de Comando)

```bash
npm run mobile:apk
```

O APK será gerado em: `android/app/build/outputs/apk/debug/app-debug.apk`

#### Opção B: Via Android Studio

```bash
npm run mobile:open
```

No Android Studio:
1. Aguarde o projeto carregar
2. Vá em **Build > Build Bundle(s) / APK(s) > Build APK(s)**
3. Aguarde a compilação
4. O APK estará em: `app/build/outputs/apk/debug/app-debug.apk`

#### Opção C: APK Assinado para Produção

Para um APK assinado (necessário para publicar na Play Store):

1. No Android Studio: **Build > Generate Signed Bundle / APK**
2. Escolha **APK**
3. Crie ou use um keystore existente
4. O APK assinado estará em: `app/build/outputs/apk/release/app-release.apk`

### Passo 8: Instalar no Celular

1. Ative **"Fontes desconhecidas"** nas configurações do Android
2. Transfira o arquivo APK para o celular
3. Abra o arquivo APK no celular
4. Siga as instruções de instalação

## 🔧 Troubleshooting

### Erro: "SDK location not found"
- Configure a variável de ambiente `ANDROID_HOME`
- Ou edite `android/local.properties` e adicione:
  ```
  sdk.dir=C:\\Users\\SeuUsuario\\AppData\\Local\\Android\\Sdk
  ```

### Erro: "Command not found: gradlew"
- No Windows, use `gradlew.bat` ao invés de `./gradlew`
- Ou execute via Android Studio

### Erro: "Failed to find 'ANDROID_HOME'"
- Configure as variáveis de ambiente corretamente
- Reinicie o terminal após configurar

### App não consegue conectar à API
- Verifique se a URL está correta
- Verifique se o backend está online e acessível
- Verifique se o CORS está configurado corretamente no servidor
- Teste a URL em um navegador: `https://seu-servidor.com/api/health`

### Erro de build do React
- Certifique-se de ter feito `npm install`
- Limpe o cache: `npm run clean && npm install`

## 🔄 Sincronizando Alterações do Desktop

**Boas notícias!** O código React é compartilhado entre desktop e mobile.

### Quando você alterar código no desktop:

```bash
# 1. Desenvolva normalmente
npm run dev

# 2. Depois de fazer alterações, sincronize com mobile:
npm run mobile:build

# 3. Gere novo APK no Android Studio
```

Todas as mudanças em `src/` aparecerão automaticamente no mobile! Veja o guia completo em [SYNC_DESKTOP_MOBILE.md](SYNC_DESKTOP_MOBILE.md)

## 📝 Notas Importantes

1. **Backend Remoto Necessário:** O app mobile não pode usar `localhost`, pois não está no mesmo dispositivo. O backend precisa estar hospedado.

2. **HTTPS:** Para produção, use HTTPS no backend. O Capacitor requer conexões seguras.

3. **Banco de Dados:** O banco PostgreSQL no Render já está remoto, então funcionará normalmente.

4. **Variáveis de Ambiente:** Variáveis que começam com `REACT_APP_` são incluídas no build do React.

5. **Atualizações:** Para atualizar o app, você precisa gerar um novo APK e reinstalar (ou configurar atualizações OTA com Capacitor Live Updates).

6. **Código Compartilhado:** Alterações em `src/` aparecem em ambas as versões. Veja [SYNC_DESKTOP_MOBILE.md](SYNC_DESKTOP_MOBILE.md) para mais detalhes.

## 🎯 Próximos Passos

- [ ] Configurar notificações push (opcional)
- [ ] Adicionar ícone personalizado do app
- [ ] Configurar splash screen personalizado
- [ ] Publicar na Google Play Store (APK assinado necessário)

## 📚 Recursos Adicionais

- [Documentação do Capacitor](https://capacitorjs.com/docs)
- [Guia de Build Android](https://capacitorjs.com/docs/android)
- [Render.com - Deploy Guide](https://render.com/docs)

---

**Desenvolvido com ❤️ usando Capacitor**

