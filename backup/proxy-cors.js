// ==================================================
// PROXY-CORS.JS - Servidor Node.js para contornar CORS
// ==================================================
// Alternativa ao proxy PHP para comunicação com webservices
// Mais robusto e com melhor controle de headers/certificados

const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');

const PORT = 3001;

// Função para fazer requisição HTTPS
function makeHttpsRequest(targetUrl, options, postData) {
  return new Promise((resolve, reject) => {
    const parsedUrl = url.parse(targetUrl);
    
    const requestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: parsedUrl.path,
      method: options.method || 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': '""',
        'User-Agent': 'NFSe-Proxy-Node/1.0',
        'Accept': 'text/xml, application/soap+xml',
        'Content-Length': Buffer.byteLength(postData),
        ...options.headers
      },
      // Aceitar certificados auto-assinados (apenas para teste)
      rejectUnauthorized: false
    };

    console.log('🌐 Fazendo requisição para:', targetUrl);
    console.log('📤 Headers:', requestOptions.headers);
    console.log('📤 Body length:', Buffer.byteLength(postData));

    const req = https.request(requestOptions, (res) => {
      let data = '';
      
      console.log('📥 Status Code:', res.statusCode);
      console.log('📥 Headers:', res.headers);
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('📥 Resposta completa recebida, tamanho:', data.length);
        console.log('📄 Primeiros 300 chars:', data.substring(0, 300));
        
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', (error) => {
      console.error('❌ Erro na requisição:', error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Servidor HTTP
const server = http.createServer(async (req, res) => {
  // Headers CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, SOAPAction, X-Requested-With');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  if (req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: 'Proxy Node.js NFS-e funcionando!',
      timestamp: new Date().toISOString(),
      version: '1.0',
      node_version: process.version
    }));
    return;
  }
  
  if (req.method === 'POST') {
    let body = '';
    
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        console.log('📨 Requisição recebida:', body.substring(0, 200));
        
        const data = JSON.parse(body);
        
        if (!data.url || !data.soapEnvelope) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            error: 'Parâmetros obrigatórios: url, soapEnvelope'
          }));
          return;
        }
        
        // Fazer requisição para o webservice
        const result = await makeHttpsRequest(
          data.url,
          { 
            method: 'POST',
            headers: data.headers || {}
          },
          data.soapEnvelope
        );
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          response: result.data,
          httpCode: result.statusCode,
          headers: result.headers,
          timestamp: new Date().toISOString()
        }));
        
      } catch (error) {
        console.error('❌ Erro:', error.message);
        
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        }));
      }
    });
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Proxy Node.js rodando em http://localhost:${PORT}`);
  console.log('🔧 Para usar: configure a URL do proxy como http://localhost:3001');
  console.log('📡 Este proxy contorna limitações CORS para webservices NFS-e');
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.log(`❌ Porta ${PORT} já está em uso. Tente uma porta diferente.`);
  } else {
    console.error('❌ Erro no servidor:', error.message);
  }
});
