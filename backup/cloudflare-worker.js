// ==================================================
// CLOUDFLARE-WORKER.JS - Worker Cloudflare para CORS
// ==================================================
// Deploy este código em um Worker Cloudflare gratuito
// URL do worker: https://seu-worker.seu-subdominio.workers.dev

export default {
  async fetch(request, env, ctx) {
    // Responder a requisições OPTIONS (CORS preflight)
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, SOAPAction, X-Requested-With',
          'Access-Control-Max-Age': '86400'
        }
      });
    }

    // Verificar se é GET para teste
    if (request.method === 'GET') {
      return new Response(JSON.stringify({
        success: true,
        message: 'Worker Cloudflare NFS-e funcionando!',
        timestamp: new Date().toISOString(),
        version: '1.0',
        worker: 'cloudflare-nfse-proxy'
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Processar POST
    if (request.method === 'POST') {
      try {
        const body = await request.text();
        console.log('📨 Worker recebeu requisição:', body.substring(0, 200));
        
        const data = JSON.parse(body);
        
        if (!data.url || !data.soapEnvelope) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Parâmetros obrigatórios: url, soapEnvelope'
          }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        }

        // Preparar headers para o webservice
        const headers = {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': '""',
          'User-Agent': 'Cloudflare-Worker-NFSe/1.0',
          'Accept': 'text/xml, application/soap+xml',
          ...data.headers
        };

        console.log('🌐 Worker fazendo requisição para:', data.url);
        console.log('📤 Headers:', headers);        // Fazer requisição para o webservice com timeout estendido
        const response = await fetch(data.url, {
          method: 'POST',
          headers: headers,
          body: data.soapEnvelope,
          signal: AbortSignal.timeout(45000) // 45 segundos
        });

        const responseText = await response.text();
        
        console.log('📥 Worker recebeu resposta:', response.status);
        console.log('📄 Tamanho da resposta:', responseText.length);
        console.log('📄 Primeiros 300 chars:', responseText.substring(0, 300));

        // Retornar resposta com CORS
        return new Response(JSON.stringify({
          success: true,
          response: responseText,
          httpCode: response.status,
          headers: Object.fromEntries(response.headers),
          timestamp: new Date().toISOString()
        }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, SOAPAction, X-Requested-With'
          }
        });

      } catch (error) {
        console.error('❌ Erro no Worker:', error.message);
        
        return new Response(JSON.stringify({
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
    }

    // Método não suportado
    return new Response('Método não suportado', {
      status: 405,
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    });
  },
};

/* 
INSTRUÇÕES PARA DEPLOY NO CLOUDFLARE:

1. Acesse https://workers.cloudflare.com/
2. Crie uma conta gratuita (até 100.000 requests/dia)
3. Clique em "Create a Worker"
4. Cole este código no editor
5. Clique em "Save and Deploy"
6. Anote a URL do seu worker (ex: https://nfse-proxy.sua-conta.workers.dev)
7. Use essa URL como proxy no sistema NFS-e

VANTAGENS:
- Gratuito até 100k requests/dia
- Performance global (CDN)
- Suporte completo a CORS
- Mais confiável que proxies públicos
- Logs detalhados no dashboard

EXEMPLO DE USO:
fetch('https://nfse-proxy.sua-conta.workers.dev', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: 'https://serem-hml.joaopessoa.pb.gov.br/notafiscal-abrasfv203-ws/NotaFiscalSoap',
    soapEnvelope: '<?xml version="1.0"?>...',
    headers: { 'SOAPAction': '""' }
  })
})
*/
