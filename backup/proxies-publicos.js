// ==================================================
// PROXIES-PUBLICOS.JS - Configuração de proxies CORS públicos
// ==================================================
// Lista de proxies públicos para contornar CORS em webservices
// Use apenas para desenvolvimento/teste

// Proxies CORS públicos disponíveis
const PROXIES_CORS_PUBLICOS = [
  {
    nome: 'AllOrigins',
    url: 'https://api.allorigins.win/raw?url=',
    metodo: 'GET',
    suportaPost: false,
    status: 'ativo',
    observacoes: 'Apenas GET, converte POST para GET com parâmetros'
  },
  {
    nome: 'CORS Anywhere (Heroku)',
    url: 'https://cors-anywhere.herokuapp.com/',
    metodo: 'POST',
    suportaPost: true,
    status: 'limitado',
    observacoes: 'Requer ativação manual no navegador'
  },
  {
    nome: 'Proxy local Node.js',
    url: 'http://localhost:3001/',
    metodo: 'POST',
    suportaPost: true,
    status: 'local',
    observacoes: 'Execute proxy-cors.js localmente'
  }
];

// Função para testar proxy público
async function testarProxyPublico(proxy) {
  console.log(`🔄 Testando proxy: ${proxy.nome}`);
  
  try {
    if (proxy.nome === 'AllOrigins') {
      // AllOrigins funciona diferente - só GET
      const urlTeste = proxy.url + encodeURIComponent('https://httpbin.org/get');
      const response = await fetch(urlTeste);
      const resultado = await response.text();
      
      console.log(`✅ ${proxy.nome} funcionando!`);
      return { funcionando: true, resposta: resultado };
      
    } else {
      // Testar com POST
      const response = await fetch(proxy.url + 'https://httpbin.org/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ teste: 'proxy cors' })
      });
      
      const resultado = await response.text();
      console.log(`✅ ${proxy.nome} funcionando!`);
      return { funcionando: true, resposta: resultado };
    }
    
  } catch (error) {
    console.log(`❌ ${proxy.nome} não funcionou: ${error.message}`);
    return { funcionando: false, erro: error.message };
  }
}

// Função para usar proxy público com webservice real
async function enviarViaProxyPublico(proxyConfig, urlWebservice, soapEnvelope) {
  console.log(`📡 Enviando via proxy ${proxyConfig.nome}`);
  
  try {
    if (proxyConfig.nome === 'AllOrigins') {
      // AllOrigins não suporta POST com SOAP, não é adequado
      throw new Error('AllOrigins não suporta requisições SOAP POST');
    }
    
    if (proxyConfig.nome === 'Proxy local Node.js') {
      // Usar nosso proxy Node.js local
      const response = await fetch(proxyConfig.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: urlWebservice,
          soapEnvelope: soapEnvelope,
          headers: {
            'Content-Type': 'text/xml; charset=utf-8',
            'SOAPAction': '""'
          }
        })
      });
      
      return await response.json();
    }
    
    if (proxyConfig.suportaPost) {
      // Proxy que suporta POST
      const response = await fetch(proxyConfig.url + urlWebservice, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': '""'
        },
        body: soapEnvelope
      });
      
      const responseText = await response.text();
      
      return {
        success: true,
        response: responseText,
        httpCode: response.status,
        timestamp: new Date().toISOString()
      };
    }
    
  } catch (error) {
    console.error(`❌ Erro no proxy ${proxyConfig.nome}:`, error.message);
    throw error;
  }
}

// Função para testar todos os proxies disponíveis
async function testarTodosProxies() {
  console.log('🔄 Testando todos os proxies CORS disponíveis...');
  
  const resultados = [];
  
  for (const proxy of PROXIES_CORS_PUBLICOS) {
    const resultado = await testarProxyPublico(proxy);
    resultados.push({
      proxy: proxy.nome,
      ...resultado
    });
  }
  
  console.log('📊 Resultados dos testes:', resultados);
  return resultados;
}

// Função para encontrar o melhor proxy disponível
async function encontrarMelhorProxy() {
  const resultados = await testarTodosProxies();
  
  // Priorizar proxy local Node.js se estiver funcionando
  const proxyLocal = resultados.find(r => r.proxy === 'Proxy local Node.js' && r.funcionando);
  if (proxyLocal) {
    return PROXIES_CORS_PUBLICOS.find(p => p.nome === 'Proxy local Node.js');
  }
  
  // Depois proxies que suportam POST
  const proxyPost = resultados.find(r => r.funcionando && 
    PROXIES_CORS_PUBLICOS.find(p => p.nome === r.proxy && p.suportaPost));
  
  if (proxyPost) {
    return PROXIES_CORS_PUBLICOS.find(p => p.nome === proxyPost.proxy);
  }
  
  return null;
}

// Exportar configurações
if (typeof window !== 'undefined') {
  // Browser
  window.PROXIES_CORS_PUBLICOS = PROXIES_CORS_PUBLICOS;
  window.testarProxyPublico = testarProxyPublico;
  window.enviarViaProxyPublico = enviarViaProxyPublico;
  window.testarTodosProxies = testarTodosProxies;
  window.encontrarMelhorProxy = encontrarMelhorProxy;
} else {
  // Node.js
  module.exports = {
    PROXIES_CORS_PUBLICOS,
    testarProxyPublico,
    enviarViaProxyPublico,
    testarTodosProxies,
    encontrarMelhorProxy
  };
}
