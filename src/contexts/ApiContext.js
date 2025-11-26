import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const ApiContext = createContext();

const DEFAULT_PORT = 3001;
const PORTS_TO_TRY = [3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009, 3010];

// Detectar se está rodando em ambiente mobile (Capacitor)
const isMobile = () => {
  // Verificar Capacitor primeiro (mais confiável)
  if (typeof window !== 'undefined') {
    // Verificar Capacitor
    if (window.Capacitor !== undefined || window.cordova !== undefined) {
      return true;
    }
    
    // Verificar se está rodando dentro do Capacitor WebView
    if (window.CapacitorWeb !== undefined) {
      return true;
    }
    
    // Verificar se está em ambiente nativo (Android/iOS)
    const userAgent = navigator.userAgent || navigator.vendor || window.opera || '';
    if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      // Verificar se não é Electron (que também pode ter user agent mobile)
      if (!userAgent.includes('Electron')) {
        return true;
      }
    }
  }
  
  return false;
};

// Obter URL da API baseada no ambiente
const getApiBaseUrl = () => {
  // Se for mobile, usar variável de ambiente ou URL configurada
  if (isMobile()) {
    // Prioridade: 1. Variável de ambiente, 2. localStorage, 3. Padrão
    const mobileApiUrl = process.env.REACT_APP_API_URL || 
                         localStorage.getItem('ANUBIS_API_URL') ||
                         'https://seu-servidor-backend.onrender.com';
    
    // Validar se não é o placeholder padrão
    if (mobileApiUrl === 'https://seu-servidor-backend.onrender.com') {
      console.warn('⚠️ ATENÇÃO: URL da API não configurada!');
      console.warn('   Configure REACT_APP_API_URL no arquivo .env antes do build');
      console.warn('   Ou defina no localStorage: localStorage.setItem("ANUBIS_API_URL", "https://seu-backend.com")');
    }
    
    // Se a URL não termina com /api, adicionar
    const baseUrl = mobileApiUrl.endsWith('/api') ? mobileApiUrl : `${mobileApiUrl}/api`;
    
    console.log(`📱 Mobile detectado. URL da API: ${baseUrl}`);
    return baseUrl;
  }
  
  // Desktop: usar localhost
  return `http://localhost:${DEFAULT_PORT}/api`;
};

// Função para testar se uma porta está respondendo
async function testPort(port) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    const response = await fetch(`http://localhost:${port}/api/health`, {
      method: 'GET',
      signal: controller.signal,
      mode: 'cors',
      credentials: 'omit'
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    // Silenciosamente falhar - porta não está disponível
    return false;
  }
}

// Função para encontrar a porta do servidor (apenas desktop)
async function findServerPort() {
  // Tentar portas em paralelo para ser mais rápido
  const portPromises = PORTS_TO_TRY.map(port => 
    testPort(port).then(available => ({ port, available }))
  );
  
  const results = await Promise.all(portPromises);
  const availablePort = results.find(result => result.available);
  
  if (availablePort) {
    return availablePort.port;
  }
  
  // Se nenhuma porta funcionou, retornar a padrão
  return DEFAULT_PORT;
}

// Função para testar URL remota (mobile)
async function testRemoteUrl(url) {
  try {
    const controller = new AbortController();
    // Timeout aumentado para 30s - Render.com free tier pode demorar para "acordar"
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    console.log(`🔍 Testando conexão com: ${url}/health`);
    console.log(`   (Timeout: 30s - Render.com pode demorar para iniciar)`);
    
    const response = await fetch(`${url}/health`, {
      method: 'GET',
      signal: controller.signal,
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json().catch(() => ({}));
      console.log(`✅ Conexão bem-sucedida com a API`);
      if (data.database) {
        console.log(`   Banco de dados: ${data.database.status === 'healthy' ? '✅ Conectado' : '❌ Desconectado'}`);
      }
      return true;
    } else {
      console.warn(`⚠️ API retornou status ${response.status}`);
      return false;
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error(`❌ Timeout ao conectar à API (30s): ${url}`);
      console.error(`   Possíveis causas:`);
      console.error(`   - Backend está offline ou não responde`);
      console.error(`   - Render.com: Serviço pode estar "adormecido" (free tier)`);
      console.error(`   - Primeira requisição após inatividade pode demorar 30-60s`);
      console.error(`   💡 Solução: Configure Uptime Robot para manter o serviço ativo`);
    } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      console.error(`❌ Erro de rede ao conectar à API: ${url}`);
      console.error(`   Possíveis causas:`);
      console.error(`   - Backend não está online`);
      console.error(`   - URL incorreta ou não configurada`);
      console.error(`   - Problema de CORS no servidor`);
      console.error(`   - Sem conexão com a internet`);
      console.error(`   - Render.com: Serviço pode estar "adormecido"`);
    } else {
      console.error(`❌ Erro ao conectar à API: ${error.message}`);
    }
    return false;
  }
}

export function ApiProvider({ children }) {
  const isMobileEnv = isMobile();
  const baseUrl = getApiBaseUrl();
  
  const [apiUrl, setApiUrl] = useState(baseUrl);
  const [isDetecting, setIsDetecting] = useState(!isMobileEnv);
  const [connectionError, setConnectionError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    if (isMobileEnv) {
      // Ambiente mobile: usar URL remota configurada
      async function checkRemoteUrl() {
        const url = getApiBaseUrl();
        
        // Verificar se a URL não é o placeholder padrão
        if (url.includes('seu-servidor-backend.onrender.com')) {
          setConnectionError({
            type: 'not_configured',
            message: 'URL da API não configurada. Configure REACT_APP_API_URL no arquivo .env antes de fazer o build.',
            url: url
          });
          setIsConnected(false);
          setIsDetecting(false);
          return;
        }
        
        setIsDetecting(true);
        setConnectionError(null);
        
        const isValid = await testRemoteUrl(url);
        
        if (!mounted) return;
        
        if (isValid) {
          setApiUrl(url);
          setIsConnected(true);
          setConnectionError(null);
          console.log(`📡 API remota configurada e conectada: ${url}`);
        } else {
          setApiUrl(url);
          setIsConnected(false);
          const isRender = url.includes('render.com');
          setConnectionError({
            type: 'connection_failed',
            message: isRender 
              ? `Não foi possível conectar ao backend. O serviço no Render.com pode estar "adormecido" (free tier). A primeira requisição pode demorar 30-60 segundos. Tente novamente ou configure Uptime Robot para manter o serviço ativo.`
              : `Não foi possível conectar ao backend em: ${url}. Verifique se o servidor está online e a URL está correta.`,
            url: url
          });
          console.error(`❌ Não foi possível conectar à API: ${url}`);
        }
        
        setIsDetecting(false);
      }
      
      checkRemoteUrl();
    } else {
      // Ambiente desktop: detectar porta local
      async function detectPort() {
        try {
          const port = await findServerPort();
          if (!mounted) return;
          
          const url = `http://localhost:${port}/api`;
          setApiUrl(url);
          console.log(`📡 API detectada na porta ${port}: ${url}`);
        } catch (error) {
          if (!mounted) return;
          console.warn('⚠️ Não foi possível detectar a porta, usando padrão 3001');
          setApiUrl(`http://localhost:${DEFAULT_PORT}/api`);
        } finally {
          if (mounted) {
            setIsDetecting(false);
          }
        }
      }

      detectPort();
      
      // Tentar detectar novamente a cada 5 segundos se não encontrar
      const interval = setInterval(() => {
        detectPort();
      }, 5000);

      return () => {
        mounted = false;
        clearInterval(interval);
      };
    }
  }, [isMobileEnv]);

  return (
    <ApiContext.Provider value={{ 
      apiUrl, 
      isDetecting, 
      connectionError, 
      isConnected,
      isMobile: isMobileEnv 
    }}>
      {children}
    </ApiContext.Provider>
  );
}

export function useApi() {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi deve ser usado dentro de ApiProvider');
  }
  return context;
}

