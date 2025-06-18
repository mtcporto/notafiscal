// ============== ENVIO DIRETO SEM FALLBACKS ==============
// Versão simplificada que usa APENAS certificado real .pfx
// Sem simulações, sem fallbacks, sem proxies desnecessários

console.log('🚀 Módulo de envio direto carregado!');

// Função de envio principal SIMPLIFICADA
async function enviarNFSeComCertificadoReal() {
    console.log('🚀 Iniciando envio DIRETO com certificado real...');
    
    try {
        // 1. Obter XML da interface
        const xmlContent = document.getElementById('xmlContent').value;
        if (!xmlContent.trim()) {
            throw new Error('XML não encontrado. Gere o XML primeiro.');
        }
        
        console.log('📄 XML obtido da interface:', xmlContent.length, 'caracteres');
        
        // 2. Aplicar assinatura REAL (sem fallbacks)
        console.log('🔐 Aplicando assinatura REAL com certificado .pfx...');
        const xmlAssinado = await assinarXMLComCertificadoReal(xmlContent);
        
        if (!xmlAssinado.includes('<Signature')) {
            throw new Error('Falha na assinatura: XMLDSig não foi incluído no XML');
        }
        
        console.log('✅ Assinatura REAL aplicada com sucesso!');
        console.log('📏 XML assinado:', xmlAssinado.length, 'caracteres');
        
        // 3. Enviar para webservice (estratégia principal: Cloudflare Worker)
        console.log('📡 Enviando para webservice via Cloudflare Worker...');
        const resultado = await enviarViaCloudflareWorker(xmlAssinado);
        
        // 4. Processar resposta
        console.log('📥 Processando resposta do webservice...');
        const status = analisarRespostaWebservice(resultado.response);
        
        return {
            sucesso: true,
            xmlAssinado: xmlAssinado,
            resposta: resultado.response,
            status: status,
            httpCode: resultado.httpCode
        };
        
    } catch (error) {
        console.error('❌ Erro no envio direto:', error);
        return {
            sucesso: false,
            erro: error.message
        };
    }
}

// Enviar via Cloudflare Worker (estratégia principal)
async function enviarViaCloudflareWorker(xmlAssinado) {
    const endpoint = 'https://serem-hml.joaopessoa.pb.gov.br/notafiscal-abrasfv203-ws/NotaFiscalSoap';
    const workerUrl = 'https://nfse.mosaicoworkers.workers.dev/';
    
    const envelope = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:nfs="http://www.abrasf.org.br/nfse.xsd">
    <soap:Header/>
    <soap:Body>
        <nfs:EnviarLoteRpsEnvio>
            ${xmlAssinado}
        </nfs:EnviarLoteRpsEnvio>
    </soap:Body>
</soap:Envelope>`;

    const response = await fetch(workerUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            url: endpoint,
            method: 'POST',
            headers: {
                'Content-Type': 'text/xml; charset=utf-8',
                'SOAPAction': 'http://www.abrasf.org.br/nfse.xsd/EnviarLoteRps'
            },
            body: envelope
        })
    });
    
    const result = await response.json();
    
    if (!result.success) {
        throw new Error(`Worker falhou: ${result.error || 'Erro desconhecido'}`);
    }
    
    return result;
}

// Analisar resposta do webservice
function analisarRespostaWebservice(response) {
    console.log('🔍 Analisando resposta do webservice...');
    
    if (response.includes('soap:Fault')) {
        const faultMatch = response.match(/<faultstring>(.*?)<\/faultstring>/);
        if (faultMatch) {
            const erro = faultMatch[1];
            if (erro.includes('assinatura')) {
                return {
                    tipo: 'ERRO_ASSINATURA',
                    mensagem: 'Erro na assinatura digital',
                    detalhes: erro
                };
            } else {
                return {
                    tipo: 'ERRO_NEGOCIO',
                    mensagem: 'Erro de negócio',
                    detalhes: erro
                };
            }
        }
    }
    
    if (response.includes('NumeroNfse')) {
        return {
            tipo: 'SUCESSO',
            mensagem: 'NFS-e gerada com sucesso',
            detalhes: 'NFS-e foi aceita pela prefeitura'
        };
    }
    
    if (response.includes('Protocolo')) {
        return {
            tipo: 'PROCESSANDO',
            mensagem: 'Lote em processamento',
            detalhes: 'Aguardando processamento pela prefeitura'
        };
    }
    
    return {
        tipo: 'INDEFINIDO',
        mensagem: 'Resposta não reconhecida',
        detalhes: response.substring(0, 200) + '...'
    };
}

// Substituir botão de envio principal
function substituirBotaoEnvio() {
    const btnEnviar = document.getElementById('btnEnviar');
    if (btnEnviar) {
        // Remover event listeners antigos
        const novoBotao = btnEnviar.cloneNode(true);
        btnEnviar.parentNode.replaceChild(novoBotao, btnEnviar);
        
        // Adicionar novo event listener
        novoBotao.addEventListener('click', async function() {
            console.log('🚀 Envio DIRETO iniciado!');
            
            // Mostrar status
            document.getElementById('validationResults').innerHTML = 
                '<div class="validation-info">🚀 Enviando com certificado REAL...</div>';
            document.getElementById('validationResults').style.display = 'block';
            
            const resultado = await enviarNFSeComCertificadoReal();
            
            if (resultado.sucesso) {
                document.getElementById('validationResults').innerHTML = 
                    `<div class="validation-success">
                      🚀 ENVIO EXECUTADO COM CERTIFICADO REAL!<br>
                      ✅ Status: ${resultado.status.tipo}<br>
                      📝 Mensagem: ${resultado.status.mensagem}<br>
                      📊 HTTP: ${resultado.httpCode}<br>
                      🔐 Assinatura REAL aplicada com sucesso!
                    </div>`;
            } else {
                document.getElementById('validationResults').innerHTML = 
                    `<div class="validation-error">❌ Erro no envio: ${resultado.erro}</div>`;
            }
        });
        
        console.log('🔄 Botão de envio substituído por versão DIRETA!');
    }
}

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar um pouco para garantir que outros scripts carregaram
    setTimeout(substituirBotaoEnvio, 2000);
});

// Expor funções globalmente
window.enviarNFSeComCertificadoReal = enviarNFSeComCertificadoReal;
window.substituirBotaoEnvio = substituirBotaoEnvio;
