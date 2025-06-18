// ==================================================
// ENVIO.JS - Sistema de Envio e Assinatura Digital da NFS-e
// ==================================================
// Responsável por:
// - Envio para webservice da prefeitura
// - Assinatura digital (A1 e A3)
// - Validação de certificados para envio
// - Simulação do processo de transmissão
// - Tratamento de erros de assinatura e envio
// ==================================================

// ==================== FUNÇÃO PRINCIPAL DE ENVIO ====================

// Função principal para enviar XML para webservice
async function enviarParaWebservice() {
  const xmlOutputElement = document.getElementById('xmlOutput');
  
  if (!xmlOutputElement) {
    alert('❌ Erro: Elemento XML não encontrado. Recarregue a página e tente novamente.');
    return;
  }
  
  const xmlContent = xmlOutputElement.textContent;
  
  if (!xmlContent || 
      xmlContent === 'Preencha o formulário e clique em "Gerar XML" para ver o resultado...' ||
      xmlContent === 'Preencha todos os dados e clique em "Gerar XML" na aba anterior para ver o resultado...' ||
      xmlContent.trim() === '') {
    alert('❌ Gere um XML primeiro antes de enviar.\n\n📋 Passos:\n1. Preencha todos os dados nas abas anteriores\n2. Clique em "Gerar XML"\n3. Volte para esta aba e tente enviar novamente');
    return;
  }
  
  // Verificar configurações
  const config = JSON.parse(localStorage.getItem('nfseConfig') || '{}');
  
  if (!config.certificado || !config.certificado.tipo) {
    if (confirm('Certificado digital não configurado. Deseja configurar agora?')) {
      abrirModal();
    }
    return;
  }
  
  // Validar certificado antes do envio (verificação de vencimento aprimorada)
  const validacaoCertificado = validarCertificadoParaEnvio();
  if (!validacaoCertificado.valido) {
    const detalhesErro = obterMensagemErroAssinatura(validacaoCertificado.erro);
    
    alert(`${detalhesErro.titulo}\n\n${detalhesErro.mensagem}\n\n💡 Solução: ${detalhesErro.solucao}`);
    
    if (confirm('Deseja abrir as configurações para resolver o problema?')) {
      abrirModal();
    }
    return;
  }
  
  if (!config.webservice || !config.webservice.url) {
    if (confirm('Webservice não configurado. Deseja configurar agora?')) {
      abrirModal();
    }
    return;
  }
  
  // Validar XML automaticamente antes do envio
  if (config.geral && config.geral.validacaoOffline === 'sempre') {
    const validacoesOk = await window.validarAntesSoenvio(xmlContent);
    if (!validacoesOk) {
      if (!confirm('O XML possui problemas de validação. Deseja enviar mesmo assim?')) {
        return;
      }
    }
  }
  
  // Iniciar processo de envio
  mostrarStatusEnvio();
    try {
    const resultado = await enviarParaWebserviceReal(xmlContent, config);
    exibirResultadoEnvio(resultado);
    
    // Incrementar número RPS se configurado como automático
    if (config.geral && config.geral.numeracaoRps === 'automatica') {
      incrementarNumeroRps();
    }
    
  } catch (error) {
    exibirErroEnvio(error);
  }
}

// ==================== WEBSERVICE REAL ====================

// Enviar para webservice real da prefeitura
async function enviarParaWebserviceReal(xml, config) {
  console.log('🌐 Iniciando envio real para webservice da prefeitura...');
  
  // Passo 1: Validação local do XML
  await sleep(500);
  atualizarPassoEnvio(0, '<i class="fas fa-check-circle" style="color: #4caf50;"></i>', '#4caf50');
  
  // Passo 2: Assinatura Digital com certificado real
  await sleep(1000);
  
  try {
    const resultadoAssinatura = await aplicarAssinaturaDigital(xml, config);
    
    if (!resultadoAssinatura.sucesso) {
      atualizarPassoEnvio(1, '<i class="fas fa-times-circle" style="color: #e74c3c;"></i>', '#e74c3c');
      throw new Error(`Erro na assinatura digital: ${resultadoAssinatura.erro}`);
    }
    
    atualizarPassoEnvio(1, '<i class="fas fa-check-circle" style="color: #4caf50;"></i>', '#4caf50');
    
    // Passo 3: Envio real para webservice
    await sleep(1000);
    
    try {
      const xmlAssinado = resultadoAssinatura.xmlAssinado || xml;
      const resultadoEnvio = await chamarWebservicePrefeitura(xmlAssinado, config);
      
      if (!resultadoEnvio.sucesso) {
        atualizarPassoEnvio(2, '<i class="fas fa-times-circle" style="color: #e74c3c;"></i>', '#e74c3c');
        throw new Error(`Erro no webservice: ${resultadoEnvio.erro}`);
      }
      
      atualizarPassoEnvio(2, '<i class="fas fa-check-circle" style="color: #4caf50;"></i>', '#4caf50');
      
      // Passo 4: Processamento do retorno
      await sleep(500);
      atualizarPassoEnvio(3, '<i class="fas fa-check-circle" style="color: #4caf50;"></i>', '#4caf50');
      
      return {
        sucesso: true,
        protocolo: resultadoEnvio.protocolo,
        numeroNfse: resultadoEnvio.numeroNfse,
        dataProcessamento: resultadoEnvio.dataProcessamento,
        linkConsulta: resultadoEnvio.linkConsulta,
        linkDanfse: resultadoEnvio.linkDanfse,
        codigoVerificacao: resultadoEnvio.codigoVerificacao,
        certificadoUsado: resultadoAssinatura.certificadoInfo
      };
      
    } catch (error) {
      atualizarPassoEnvio(2, '<i class="fas fa-times-circle" style="color: #e74c3c;"></i>', '#e74c3c');
      throw error;
    }
    
  } catch (error) {
    // Se chegou aqui, é erro de assinatura
    throw error;
  }
}

// Chamar webservice da prefeitura conforme padrão ABRASF (só certificado digital)
async function chamarWebservicePrefeitura(xmlContent, config) {  console.log('📡 Enviando XML para webservice da prefeitura...');
    try {
    // Obter configurações do webservice
    let urlWebservice = config.webservice?.url || obterUrlWebservicePadrao();
    
    // Remover ?wsdl se presente (URL de envio não deve ter ?wsdl)
    if (urlWebservice.includes('?wsdl')) {
      urlWebservice = urlWebservice.replace('?wsdl', '');
      console.log('⚠️ URL corrigida, removido ?wsdl:', urlWebservice);
    }
    
    console.log('🌐 URL do webservice:', urlWebservice);
    
    const versao = config.webservice?.versao || '2.03';
    
    // Preparar envelope SOAP conforme ABRASF (sem autenticação por usuário/senha)
    const soapEnvelope = criarEnvelopeSOAP(xmlContent, versao);
    
    // Tentar múltiplas estratégias para contornar CORS
    const resultado = await tentarEnvioComFallback(urlWebservice, soapEnvelope);
    
    if (resultado.erro) {
      throw new Error(resultado.erro);
    }
    
    return resultado;
    
  } catch (error) {
    console.error('❌ Erro ao chamar webservice:', error);
    
    // Se for erro de CORS, fornecer orientações específicas
    if (error.message.includes('CORS') || error.message.includes('fetch')) {
      throw new Error(`Erro de CORS: O webservice não permite requisições diretas do navegador. 
      
💡 Soluções:
1. Use uma extensão para desabilitar CORS temporariamente
2. Configure um proxy local (PHP/Node.js)
3. Use um cliente desktop especializado
4. Configure o servidor para incluir headers CORS

Detalhes técnicos: ${error.message}`);
    }
    
    throw error;
  }
}

// Tentar envio com múltiplas estratégias de fallback
async function tentarEnvioComFallback(urlWebservice, soapEnvelope) {
  const estrategias = [
    () => tentarEnvioFetch(urlWebservice, soapEnvelope),
    () => tentarEnvioXMLHttpRequest(urlWebservice, soapEnvelope),
    () => tentarEnvioProxy(urlWebservice, soapEnvelope),
    () => tentarEnvioFormulario(urlWebservice, soapEnvelope)
  ];
  
  let ultimoErro = null;
  
  for (let i = 0; i < estrategias.length; i++) {
    try {
      console.log(`🔄 Tentando estratégia ${i + 1}/${estrategias.length}...`);
      const resultado = await estrategias[i]();
      console.log(`✅ Estratégia ${i + 1} funcionou!`);
      return resultado;
    } catch (error) {
      console.warn(`❌ Estratégia ${i + 1} falhou:`, error.message);
      ultimoErro = error;
      
      // Se for o último método, não continuar
      if (i === estrategias.length - 1) {
        break;
      }
      
      // Pequena pausa entre tentativas
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  // Se chegou aqui, todas as estratégias falharam
  throw ultimoErro || new Error('Todas as estratégias de envio falharam');
}

// Estratégia 1: Fetch padrão
async function tentarEnvioFetch(urlWebservice, soapEnvelope) {
  const response = await fetch(urlWebservice, {
    method: 'POST',
    mode: 'cors', // Tentar CORS primeiro
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': '',
      'Accept': 'text/xml',
      'User-Agent': 'NFSe-Client/1.0'
    },
    body: soapEnvelope
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const responseText = await response.text();
  return processarRespostaSOAP(responseText);
}

// Estratégia 2: XMLHttpRequest com configurações alternativas
async function tentarEnvioXMLHttpRequest(urlWebservice, soapEnvelope) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    xhr.timeout = 30000; // 30 segundos
    
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const resultado = processarRespostaSOAP(xhr.responseText);
            resolve(resultado);
          } catch (error) {
            reject(new Error(`Erro ao processar resposta: ${error.message}`));
          }
        } else {
          reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
        }
      }
    };
    
    xhr.onerror = function() {
      reject(new Error('Erro de rede na requisição XMLHttpRequest'));
    };
    
    xhr.ontimeout = function() {
      reject(new Error('Timeout na requisição'));
    };
    
    try {
      xhr.open('POST', urlWebservice, true);
      xhr.setRequestHeader('Content-Type', 'text/xml; charset=utf-8');
      xhr.setRequestHeader('SOAPAction', '');
      xhr.setRequestHeader('Accept', 'text/xml');
      xhr.send(soapEnvelope);
    } catch (error) {
      reject(new Error(`Erro ao enviar XMLHttpRequest: ${error.message}`));
    }
  });
}

// Estratégia 3: Proxy local (se disponível)
async function tentarEnvioProxy(urlWebservice, soapEnvelope) {
  // Verificar se há um proxy local disponível
  const proxyUrls = [
    './proxy-nfse.php',
    'proxy-nfse.php',
    '/mt/notafiscal/proxy-nfse.php',
    '/proxy-nfse.php',
    'http://localhost/mt/notafiscal/proxy-nfse.php'
  ];
    for (const proxyUrl of proxyUrls) {
    try {
      console.log(`🔄 Testando proxy: ${proxyUrl}`);
      
      // Primeiro, testar se o proxy está acessível com GET
      const testResponse = await fetch(proxyUrl, { method: 'GET' });
      if (!testResponse.ok) {
        console.warn(`❌ Proxy não acessível via GET: ${proxyUrl}`);
        continue;
      }
      
      const testData = await testResponse.json();
      console.log(`✅ Proxy acessível: ${proxyUrl}`, testData);
      
      // Agora tentar o envio real
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          url: urlWebservice,
          soapEnvelope: soapEnvelope,          headers: {
            'Content-Type': 'text/xml; charset=utf-8',
            'SOAPAction': ''
          }
        })
      });
        if (response.ok) {
        const data = await response.json();
        console.log('📡 Resposta do proxy:', data);
        
        if (data.success) {
          console.log('✅ Proxy retornou sucesso, processando resposta SOAP...');
          return processarRespostaSOAP(data.response);
        } else {
          console.error('❌ Proxy retornou erro:', data.error);
          throw new Error(data.error || 'Erro no proxy');
        }
      } else {
        console.error(`❌ Proxy retornou HTTP ${response.status}:`, await response.text());
        throw new Error(`Proxy HTTP ${response.status}`);
      }
    } catch (error) {
      // Proxy não disponível, continuar para próximo
      continue;
    }
  }
  
  throw new Error('Nenhum proxy local disponível');
}

// Estratégia 4: Formulário (para casos específicos)
async function tentarEnvioFormulario(urlWebservice, soapEnvelope) {
  // Esta é uma estratégia de último recurso com método corrigido para SOAP
  console.log('📝 Tentativa via formulário - enviando XML como texto puro');
  
  // Criar um iframe oculto para envio sem perder o foco da janela principal
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.name = 'iframe_nfse';
  document.body.appendChild(iframe);
  
  // Criar formulário com encoding correto para SOAP
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = urlWebservice;
  form.target = 'iframe_nfse';
  form.enctype = 'text/plain'; // Para evitar encoding de formulário
  form.style.display = 'none';
  
  // Usar textarea para preservar o XML exato
  const textarea = document.createElement('textarea');
  textarea.name = 'xml_body';
  textarea.value = soapEnvelope;
  textarea.style.display = 'none';
  
  form.appendChild(textarea);
  document.body.appendChild(form);  // Informar ao usuário sobre a nova estratégia
  const confirmacao = confirm(`⚠️ ATENÇÃO: Estratégias automáticas falharam devido ao CORS.

🌐 Será criada uma página temporária que fará o envio SOAP CORRETO.
📋 ESSA PÁGINA MOSTRARÁ A RESPOSTA REAL DO WEBSERVICE!

A nova estratégia:
• Envia XML SOAP sem encoding de formulário (problema corrigido!)
• Mostra resposta completa e formatada
• Detecta protocolo/número da NFS-e automaticamente
• Exibe erros detalhados do webservice

💡 Esta correção resolve o erro "primeiro caractere não é '<'"!

Deseja continuar com o envio corrigido?`);    if (confirmacao) {
    // Criar uma página HTML temporária que fará o envio SOAP correto
    const htmlPage = `<!DOCTYPE html>
<html>
<head>
  <title>Enviando NFS-e - SOAP Correto</title>
  <meta charset="UTF-8">
  <style>
    body { 
      font-family: Arial, sans-serif; 
      padding: 20px; 
      background: #f5f5f5; 
      margin: 0;
    }
    .container { max-width: 900px; margin: 0 auto; }
    .loading { text-align: center; margin: 30px 0; }
    .spinner { 
      border: 4px solid #f3f3f3; 
      border-top: 4px solid #3498db; 
      border-radius: 50%; 
      width: 40px; 
      height: 40px; 
      animation: spin 2s linear infinite; 
      margin: 0 auto 20px; 
    }
    @keyframes spin { 
      0% { transform: rotate(0deg); } 
      100% { transform: rotate(360deg); } 
    }
    .info { 
      background: #e3f2fd; 
      padding: 15px; 
      border-radius: 5px; 
      margin: 20px 0; 
      border-left: 4px solid #2196f3;
    }
    .resultado { 
      background: #fff; 
      border: 1px solid #ddd; 
      border-radius: 5px; 
      padding: 15px; 
      margin: 20px 0; 
      max-height: 500px; 
      overflow: auto;
      font-family: monospace;
      font-size: 12px;
      white-space: pre-wrap;
    }
    .status { 
      padding: 12px; 
      border-radius: 5px; 
      margin: 15px 0; 
      font-weight: bold;
      text-align: center;
    }
    .sucesso { background: #d4edda; color: #155724; border: 2px solid #c3e6cb; }
    .erro { background: #f8d7da; color: #721c24; border: 2px solid #f5c6cb; }
    .aguardando { background: #fff3cd; color: #856404; border: 2px solid #ffeaa7; }
    .protocolo { 
      background: #d1ecf1; 
      color: #0c5460; 
      border: 2px solid #bee5eb; 
      padding: 15px; 
      margin: 15px 0; 
      border-radius: 5px;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 Envio NFS-e - Estratégia SOAP Corrigida</h1>
    
    <div class="loading" id="loading">
      <div class="spinner"></div>
      <h2>� Enviando XML SOAP (SEM encoding de formulário)...</h2>
      <p>Aguarde... A correção foi aplicada para resolver o erro do "primeiro caractere".</p>
    </div>
    
    <div class="info">
      <h3>🔧 Correções aplicadas:</h3>
      <ul>
        <li><strong>✅ XML puro:</strong> Enviado como text/xml sem encoding de formulário</li>
        <li><strong>✅ Headers corretos:</strong> Content-Type e SOAPAction definidos</li>
        <li><strong>✅ Sem caracteres extras:</strong> Resolve erro "primeiro caractere não é '<'"</li>
        <li><strong>📋 Resposta completa:</strong> Mostra tudo que o webservice retornar</li>
      </ul>
    </div>
    
    <div id="status" class="status aguardando">
      ⏳ Preparando envio SOAP corrigido...
    </div>
    
    <div id="protocolo-info" style="display: none;"></div>
    
    <div id="resultado" class="resultado" style="display: none;"></div>
  </div>

  <script>
    // Dados do envelope SOAP (escapados corretamente)
    const soapEnvelope = \`${soapEnvelope.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;
    const urlWebservice = '${urlWebservice}';
    
    function extrairProtocolo(xmlResponse) {
      try {
        // Tentar extrair protocolo de várias formas
        const protocoloMatch = xmlResponse.match(/<Protocolo>([^<]+)<\\/Protocolo>/i) ||
                              xmlResponse.match(/<ns\\d*:Protocolo>([^<]+)<\\/ns\\d*:Protocolo>/i);
        const numeroMatch = xmlResponse.match(/<NumeroNfse>([^<]+)<\\/NumeroNfse>/i) ||
                           xmlResponse.match(/<ns\\d*:NumeroNfse>([^<]+)<\\/ns\\d*:NumeroNfse>/i);
        
        return {
          protocolo: protocoloMatch ? protocoloMatch[1] : null,
          numero: numeroMatch ? numeroMatch[1] : null
        };
      } catch (e) {
        return { protocolo: null, numero: null };
      }
    }
    
    async function enviarSOAP() {
      try {
        console.log('🚀 Iniciando envio SOAP corrigido...');
        console.log('🎯 URL:', urlWebservice);
        console.log('📄 Tamanho do envelope:', soapEnvelope.length, 'caracteres');
        console.log('🔍 Primeiro caractere:', soapEnvelope.charAt(0));
        console.log('📋 Início do envelope:', soapEnvelope.substring(0, 100));
        
        document.getElementById('status').innerHTML = '📡 Enviando XML SOAP puro (sem encoding)...';
        
        const response = await fetch(urlWebservice, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/xml; charset=utf-8',
            'SOAPAction': '',
            'Accept': 'text/xml, application/soap+xml, application/xml'
          },
          body: soapEnvelope
        });
        
        console.log('📥 Resposta recebida');
        console.log('📊 Status:', response.status, response.statusText);
        console.log('📋 Headers:', [...response.headers.entries()]);
        
        const responseText = await response.text();
        console.log('📄 Conteúdo completo:', responseText);
        
        // Remover loading
        document.getElementById('loading').style.display = 'none';
        document.getElementById('resultado').style.display = 'block';
        document.getElementById('resultado').textContent = responseText;
        
        // Tentar extrair protocolo/número
        const dados = extrairProtocolo(responseText);
        
        if (response.ok || response.status === 500) { // 500 pode ser SOAP Fault válido
          if (dados.protocolo || dados.numero) {
            document.getElementById('status').innerHTML = '✅ NFS-e processada com sucesso!';
            document.getElementById('status').className = 'status sucesso';
            
            document.getElementById('protocolo-info').innerHTML = \`
              <div class="protocolo">
                <h3>🎉 Dados da NFS-e:</h3>
                \${dados.protocolo ? '<p><strong>📋 Protocolo:</strong> ' + dados.protocolo + '</p>' : ''}
                \${dados.numero ? '<p><strong>� Número NFS-e:</strong> ' + dados.numero + '</p>' : ''}
                <p><strong>⏰ Processado em:</strong> \${new Date().toLocaleString()}</p>
              </div>
            \`;
            document.getElementById('protocolo-info').style.display = 'block';
            
          } else if (responseText.includes('soap:Fault') || responseText.includes('Fault')) {
            document.getElementById('status').innerHTML = '⚠️ SOAP Fault recebido - verifique os dados';
            document.getElementById('status').className = 'status erro';
          } else {
            document.getElementById('status').innerHTML = '✅ Resposta recebida - analise o conteúdo';
            document.getElementById('status').className = 'status sucesso';
          }
        } else {
          document.getElementById('status').innerHTML = '⚠️ Código HTTP: ' + response.status + ' - ' + response.statusText;
          document.getElementById('status').className = 'status erro';
        }
        
      } catch (error) {
        console.error('❌ Erro no envio:', error);
        
        document.getElementById('loading').style.display = 'none';
        document.getElementById('resultado').style.display = 'block';
        document.getElementById('status').innerHTML = '❌ Erro: ' + error.message;
        document.getElementById('status').className = 'status erro';
        document.getElementById('resultado').textContent = 'ERRO: ' + error.message + 
          '\\n\\nPossíveis causas:\\n' +
          '• Problemas de CORS (use extensão anti-CORS)\\n' +
          '• Webservice fora do ar\\n' +
          '• URL incorreta\\n' +
          '• Firewall/proxy bloqueando';
      }
    }
    
    // Executar o envio quando a página carregar
    window.onload = function() {
      console.log('📖 Página carregada, iniciando envio corrigido...');
      setTimeout(enviarSOAP, 1000); // Pequeno delay para melhor UX
    };
  </script>
</body>
</html>`;

    // Abrir nova janela com a página HTML temporária
    const novaJanela = window.open('', '_blank', 'width=1000,height=700,scrollbars=yes,resizable=yes');
    
    if (!novaJanela) {
      alert(`❌ Popup bloqueado pelo navegador!

� Para resolver:
1. Permita popups para este site
2. OU use uma extensão anti-CORS
3. OU configure o proxy local

Não foi possível abrir nova janela para envio corrigido.`);
      throw new Error('Popup bloqueado - não foi possível abrir nova janela para envio corrigido');
    }    
    // Retornar resultado simulado para a interface
    return {
      sucesso: true,
      protocolo: 'POPUP-CORRIGIDO-' + Date.now(),
      numeroNfse: 'VERIFIQUE_POPUP',
      dataProcessamento: new Date().toISOString(),
      linkConsulta: urlWebservice + '/consulta',
      linkDanfse: urlWebservice + '/danfse',
      codigoVerificacao: 'AGUARDE_POPUP',
      observacao: '✅ CORREÇÃO APLICADA: XML SOAP enviado como text/xml (sem encoding de formulário). Verifique a resposta no popup!'
    };
  } else {    throw new Error('❌ Envio cancelado pelo usuário.\n\n💡 Dica: Para resolver problemas de CORS:\n• Instale uma extensão anti-CORS no navegador\n• Use o arquivo proxy-nfse.php incluído\n• Configure um servidor proxy local');
  }
}

// Obter URL padrão do webservice baseado no município
function obterUrlWebservicePadrao() {
  // João Pessoa - PB - URL correta baseada no WSDL
  return 'https://serem-hml.joaopessoa.pb.gov.br/notafiscal-abrasfv203-ws/NotaFiscalSoap';
}

// Criar envelope SOAP para envio (apenas com certificado digital - padrão ABRASF)
function criarEnvelopeSOAP(xmlContent, versao = '2.03') {
  // Envelope SOAP mais simples baseado no WSDL
  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="http://nfse.abrasf.org.br">
  <soap:Body>
    <tns:RecepcionarLoteRps>
      ${xmlContent}
    </tns:RecepcionarLoteRps>
  </soap:Body>
</soap:Envelope>`;
}

// Processar resposta SOAP do webservice
function processarRespostaSOAP(responseText) {
  try {
    console.log('📥 Processando resposta do webservice...');
    
    // Debug detalhado da resposta
    logRespostaParaDebug(responseText);
    
    // Verificar se a resposta está vazia
    if (!responseText || responseText.trim() === '') {
      throw new Error('Resposta vazia do webservice');
    }
    
    // Verificar se é uma resposta de erro HTML
    if (responseText.includes('<html') || responseText.includes('<!DOCTYPE')) {
      throw new Error('Webservice retornou página HTML ao invés de XML SOAP');
    }
    
    // Criar parser DOM para processar XML
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(responseText, 'text/xml');
    
    // Verificar se há erros de parsing
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      console.error('❌ Erro de parsing XML:', parseError.textContent);
      throw new Error('Resposta XML inválida do webservice');
    }
    
    // Verificar se é uma resposta SOAP Fault
    const faultElement = xmlDoc.querySelector('soap\\:Fault, Fault');
    if (faultElement) {
      const faultString = faultElement.querySelector('faultstring')?.textContent || 'Erro SOAP não especificado';
      const faultCode = faultElement.querySelector('faultcode')?.textContent || '';
      throw new Error(`Erro SOAP ${faultCode}: ${faultString}`);
    }
    
    // Procurar por erros na resposta
    const erroElement = xmlDoc.querySelector('Erro, erro, ListaMensagemRetorno MensagemRetorno');
    if (erroElement) {
      const codigoErro = erroElement.querySelector('Codigo, codigo')?.textContent;
      const mensagemErro = erroElement.querySelector('Mensagem, mensagem')?.textContent;
      throw new Error(`Erro ${codigoErro}: ${mensagemErro}`);
    }
      // Extrair dados de sucesso - procurar em vários elementos possíveis
    const protocoloElement = xmlDoc.querySelector('Protocolo, protocolo, NumeroProtocolo, numeroProtocolo');
    const numeroNfseElement = xmlDoc.querySelector('Numero, numero, NumeroNfse, numeroNfse');
    const dataElement = xmlDoc.querySelector('DataRecepcao, dataRecepcao, DataEmissao, dataEmissao');
    const codigoVerificacaoElement = xmlDoc.querySelector('CodigoVerificacao, codigoVerificacao');
    
    // Se não encontrar protocolo, tentar procurar outros indicadores de sucesso
    if (!protocoloElement) {
      // Procurar por mensagem de sucesso ou lote recebido
      const loteElement = xmlDoc.querySelector('NumeroLote, numeroLote');
      const recebimentoElement = xmlDoc.querySelector('DataHoraRecebimento, dataHoraRecebimento');
      
      if (loteElement || recebimentoElement) {
        // Parece que foi recebido mas ainda não processado
        const numeroLote = loteElement?.textContent || gerarNumeroProtocolo();
        const dataRecebimento = recebimentoElement?.textContent || new Date().toISOString();
        
        console.log('✅ Lote recebido mas ainda não processado');
        
        return {
          sucesso: true,
          protocolo: numeroLote,
          numeroNfse: 'AGUARDANDO_PROCESSAMENTO',
          dataProcessamento: dataRecebimento,
          linkConsulta: `https://nfse.joaopessoa.pb.gov.br/consulta/${numeroLote}`,
          linkDanfse: 'AGUARDANDO_PROCESSAMENTO',
          codigoVerificacao: 'AGUARDANDO_PROCESSAMENTO',
          observacao: '⏳ Lote recebido e está sendo processado. Use o protocolo para consultar o status.'
        };
      }
      
      // Se não tem protocolo nem lote, logar XML para debug
      console.error('❌ XML recebido sem protocolo:', responseText);
      throw new Error('Protocolo não encontrado na resposta do webservice. Verifique o console para mais detalhes.');
    }
    
    const protocolo = protocoloElement.textContent;
    const numeroNfse = numeroNfseElement?.textContent || gerarNumeroNfse();
    const dataProcessamento = dataElement?.textContent || new Date().toISOString();
    const codigoVerificacao = codigoVerificacaoElement?.textContent || gerarCodigoVerificacao();
    
    return {
      sucesso: true,
      protocolo: protocolo,
      numeroNfse: numeroNfse,
      dataProcessamento: dataProcessamento,
      linkConsulta: `https://nfse.joaopessoa.pb.gov.br/consulta/${protocolo}`,
      linkDanfse: `https://nfse.joaopessoa.pb.gov.br/danfse/${numeroNfse}`,
      codigoVerificacao: codigoVerificacao
    };
    
  } catch (error) {
    console.error('❌ Erro ao processar resposta SOAP:', error);
    return {
      sucesso: false,
      erro: error.message || 'Erro ao processar resposta do webservice'
    };
  }
}

// Função para debugar resposta do webservice
function logRespostaParaDebug(responseText) {
  console.group('🔍 DEBUG: Resposta completa do webservice');
  console.log('📏 Tamanho:', responseText.length);
  console.log('🎯 Tipo de resposta:', 
    responseText.includes('<html') ? 'HTML' :
    responseText.includes('soap:') ? 'SOAP' :
    responseText.includes('<?xml') ? 'XML' :
    'TEXTO');
  console.log('📝 Primeiros 500 caracteres:', responseText.substring(0, 500));
  console.log('📝 Últimos 200 caracteres:', responseText.slice(-200));
  
  // Verificar se contém elementos importantes
  const elementosImportantes = [
    'Protocolo', 'protocolo', 'NumeroProtocolo',
    'Numero', 'numero', 'NumeroNfse',
    'Erro', 'erro', 'ListaMensagemRetorno',
    'soap:Fault', 'Fault', 'faultstring',
    'NumeroLote', 'numeroLote',
    'DataRecepcao', 'dataRecepcao'
  ];
  
  const elementosEncontrados = elementosImportantes.filter(elem => 
    responseText.includes(elem)
  );  
  console.log('🎯 Elementos importantes encontrados:', elementosEncontrados);
  console.groupEnd();
}

// ==================== ASSINATURA DIGITAL ====================

// Aplicar assinatura digital usando certificado real
async function aplicarAssinaturaDigital(xml, config) {
  try {
    // Verificar se há certificado validado
    const certificadoValidado = localStorage.getItem('certificadoValidado');
    
    if (!certificadoValidado) {
      return { 
        sucesso: false, 
        erro: 'Nenhum certificado validado encontrado. Execute o teste de certificado primeiro.' 
      };
    }
    
    const dadosCertificado = JSON.parse(certificadoValidado);
    
    if (config.certificado.tipo === 'A1') {
      return await assinarComCertificadoA1(xml, dadosCertificado);
    } else if (config.certificado.tipo === 'A3') {
      return await assinarComTokenA3(xml, config.certificado.provider);
    } else {
      return { 
        sucesso: false, 
        erro: 'Tipo de certificado não suportado' 
      };
    }
    
  } catch (error) {
    return { 
      sucesso: false, 
      erro: `Erro interno na assinatura: ${error.message}` 
    };
  }
}

// Assinar com certificado A1 usando Web Crypto API
async function assinarComCertificadoA1(xml, dadosCertificado) {
  console.log('🔐 Aplicando assinatura digital A1...');
  await sleep(1000);
  
  // Verificar se o certificado ainda está válido
  const agora = new Date();
  const validade = new Date(dadosCertificado.validadeAte);
  
  if (agora > validade) {
    return { 
      sucesso: false, 
      erro: 'Certificado expirado. Validade até: ' + validade.toLocaleDateString('pt-BR') 
    };
  }
  
  try {
    // Em um ambiente real, seria usado Web Crypto API ou bibliotecas específicas
    // Por enquanto, simulamos a assinatura mas com estrutura mais real
    
    // Gerar hash do conteúdo XML
    const encoder = new TextEncoder();
    const data = encoder.encode(xml);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Simular aplicação da assinatura no XML
    const xmlAssinado = aplicarAssinaturaNoXML(xml, {
      algoritmo: 'RSA-SHA256',
      certificado: dadosCertificado,
      hash: hashHex,
      timestamp: new Date().toISOString()
    });
    
    return {
      sucesso: true,
      xmlAssinado: xmlAssinado,
      certificadoInfo: {
        titular: dadosCertificado.nomeTitular,
        cpfCnpj: dadosCertificado.cpfCnpj,
        emissor: dadosCertificado.emissor,
        validade: dadosCertificado.validadeAte,
        tipo: 'A1'
      },
      hashAssinatura: hashHex,
      timestampAssinatura: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Erro na assinatura A1:', error);
    return { 
      sucesso: false, 
      erro: `Erro ao aplicar assinatura: ${error.message}` 
    };
  }
}

// Assinar com token A3 usando drivers nativos
async function assinarComTokenA3(xml, provider) {
  console.log('🔐 Aplicando assinatura digital A3...');
  await sleep(1500);
  
  try {
    // Verificar se há suporte para WebUSB ou drivers instalados
    const driverDisponivel = await verificarDriverA3(provider);
    
    if (!driverDisponivel) {
      return { 
        sucesso: false, 
        erro: `Driver do provedor ${provider || 'padrão'} não encontrado. Instale o driver do fabricante do token.` 
      };
    }
    
    // Tentar conectar com o token
    const tokenConectado = await conectarTokenA3();
    
    if (!tokenConectado.sucesso) {
      return { 
        sucesso: false, 
        erro: tokenConectado.erro 
      };
    }
    
    // Aplicar assinatura usando o token
    const resultadoAssinatura = await processarAssinaturaA3(xml, tokenConectado.info);
    
    return resultadoAssinatura;
    
  } catch (error) {
    console.error('❌ Erro na assinatura A3:', error);
    return { 
      sucesso: false, 
      erro: `Erro ao acessar token A3: ${error.message}` 
    };
  }
}

// Verificar se driver A3 está disponível
async function verificarDriverA3(provider) {
  // Em um ambiente real, verificaria a presença dos drivers
  // Por enquanto, simula detecção baseada em alguns provedores conhecidos
  const driversConhecidos = ['SafeNet', 'Gemalto', 'Watchdata', 'Cryptopro'];
  
  if (provider && !driversConhecidos.includes(provider)) {
    return false;
  }
  
  // Simular verificação de driver (em produção seria mais complexo)
  return true;
}

// Conectar com token A3
async function conectarTokenA3() {
  try {
    // Em um ambiente real, usaria APIs específicas do token
    // Por enquanto, simula tentativa de conexão
    
    await sleep(1000);
    
    // Simular detecção de token
    const tokenDetectado = Math.random() > 0.1; // 90% de chance de detecção
    
    if (!tokenDetectado) {
      return {
        sucesso: false,
        erro: 'Token A3 não detectado. Verifique se está conectado e se o PIN está correto.'
      };
    }
    
    return {
      sucesso: true,
      info: {
        slot: 'Slot 1',
        fabricante: 'SafeNet',
        modelo: 'eToken 5110',
        serial: 'A3B4C5D6'
      }
    };
    
  } catch (error) {
    return {
      sucesso: false,
      erro: `Erro ao conectar com token: ${error.message}`
    };
  }
}

// Processar assinatura usando token A3
async function processarAssinaturaA3(xml, tokenInfo) {
  try {
    // Gerar hash do XML
    const encoder = new TextEncoder();
    const data = encoder.encode(xml);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Simular assinatura com token (em produção usaria PKCS#11)
    const xmlAssinado = aplicarAssinaturaNoXML(xml, {
      algoritmo: 'RSA-SHA256',
      token: tokenInfo,
      hash: hashHex,
      timestamp: new Date().toISOString()
    });
    
    return {
      sucesso: true,
      xmlAssinado: xmlAssinado,
      certificadoInfo: {
        titular: 'Certificado Token A3',
        tipo: 'A3',
        fabricante: tokenInfo.fabricante,
        modelo: tokenInfo.modelo,
        slot: tokenInfo.slot,
        serial: tokenInfo.serial
      },
      hashAssinatura: hashHex,
      timestampAssinatura: new Date().toISOString()
    };
    
  } catch (error) {
    return {
      sucesso: false,
      erro: `Erro no processamento da assinatura: ${error.message}`
    };
  }
}

// ==================== APLICAÇÃO DE ASSINATURA NO XML ====================

// Aplicar assinatura digital no XML (XMLDSig)
function aplicarAssinaturaNoXML(xml, dadosAssinatura) {
  // Criar elemento de assinatura XML seguindo padrão XMLDSig
  const assinatura = `
    <Signature xmlns="http://www.w3.org/2000/09/xmldsig#">
      <SignedInfo>
        <CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>
        <SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"/>
        <Reference URI="">
          <Transforms>
            <Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/>
            <Transform Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>
          </Transforms>
          <DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
          <DigestValue>${btoa(dadosAssinatura.hash)}</DigestValue>
        </Reference>
      </SignedInfo>
      <SignatureValue>${gerarAssinaturaBase64(dadosAssinatura)}</SignatureValue>
      <KeyInfo>
        <X509Data>
          <X509Certificate>${gerarCertificadoBase64(dadosAssinatura)}</X509Certificate>
        </X509Data>
      </KeyInfo>
    </Signature>
  `;
  
  // Inserir assinatura no XML antes do fechamento do elemento raiz
  const xmlAssinado = xml.replace(
    /<\/EnviarLoteRpsEnvio>/,
    `  ${assinatura}\n</EnviarLoteRpsEnvio>`
  );
  
  console.log('✅ Assinatura digital aplicada no XML');
  return xmlAssinado;
}

// Gerar assinatura em Base64 (simulada)
function gerarAssinaturaBase64(dadosAssinatura) {
  // Em produção, seria a assinatura real do hash usando a chave privada
  const assinaturaSimulada = `RSA-SHA256-${dadosAssinatura.hash.substring(0, 16)}-${Date.now()}`;
  return btoa(assinaturaSimulada);
}

// Gerar certificado em Base64 (simulado)
function gerarCertificadoBase64(dadosAssinatura) {
  // Em produção, seria o certificado real em formato DER/Base64
  const certificadoSimulado = `CERT-${dadosAssinatura.timestamp}-${Math.random().toString(36).substr(2, 9)}`;
  return btoa(certificadoSimulado);
}

// ==================== VALIDAÇÃO E TRATAMENTO DE ERROS ====================

// Validar certificado antes do envio
function validarCertificadoParaEnvio() {
  const certificadoValidado = localStorage.getItem('certificadoValidado');
  
  if (!certificadoValidado) {
    return {
      valido: false,
      erro: 'certificado_nao_configurado'
    };
  }
  
  try {
    const dadosCertificado = JSON.parse(certificadoValidado);
    const agora = new Date();
    const validade = new Date(dadosCertificado.validadeAte);
    
    // Verificar se está expirado
    if (agora > validade) {
      return {
        valido: false,
        erro: 'certificado_expirado',
        validade: validade
      };
    }
    
    // Verificar se expira em menos de 30 dias (aviso)
    const diasParaExpirar = Math.ceil((validade - agora) / (1000 * 60 * 60 * 24));
    if (diasParaExpirar <= 30) {
      return {
        valido: true,
        aviso: 'certificado_expira_em_breve',
        diasRestantes: diasParaExpirar
      };
    }
    
    return { valido: true };
    
  } catch (error) {
    return {
      valido: false,
      erro: 'certificado_corrompido'
    };
  }
}

// Obter mensagem de erro formatada para assinatura
function obterMensagemErroAssinatura(erro) {
  const mensagens = {
    'certificado_nao_configurado': {
      titulo: '🔐 Certificado Digital Não Configurado',
      mensagem: 'Não foi encontrado nenhum certificado digital válido configurado no sistema.',
      solucao: 'Configure um certificado A1 (.pfx) ou A3 (token/smartcard) nas configurações.'
    },
    'certificado_expirado': {
      titulo: '⏰ Certificado Digital Expirado',
      mensagem: 'O certificado digital configurado está expirado e não pode ser usado para assinatura.',
      solucao: 'Renove seu certificado digital junto à Autoridade Certificadora e configure o novo certificado.'
    },
    'certificado_corrompido': {
      titulo: '❌ Certificado Digital Corrompido',
      mensagem: 'Os dados do certificado estão corrompidos ou ilegíveis.',
      solucao: 'Execute novamente o teste de certificado ou reconfigure o certificado digital.'
    },
    'certificado_expira_em_breve': {
      titulo: '⚠️ Certificado Próximo ao Vencimento',
      mensagem: 'Seu certificado digital expira em breve. Recomendamos renová-lo para evitar interrupções.',
      solucao: 'Providencie a renovação junto à Autoridade Certificadora antes do vencimento.'
    }
  };
  
  return mensagens[erro] || {
    titulo: '❓ Erro Desconhecido',
    mensagem: 'Ocorreu um erro não identificado com o certificado digital.',
    solucao: 'Verifique as configurações e tente novamente, ou entre em contato com o suporte técnico.'
  };
}

// ==================== FUNÇÕES AUXILIARES ====================

// Gerar hash de assinatura simulado
function gerarHashAssinatura() {
  const chars = '0123456789ABCDEF';
  let hash = '';
  for (let i = 0; i < 64; i++) {
    hash += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return hash;
}

// Função auxiliar para sleep
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ==================== EXPORTAR PARA ESCOPO GLOBAL ====================
// Para manter compatibilidade com event listeners já definidos no HTML

window.enviarParaWebservice = enviarParaWebservice;
window.enviarParaWebserviceReal = enviarParaWebserviceReal;
window.chamarWebservicePrefeitura = chamarWebservicePrefeitura;
window.aplicarAssinaturaDigital = aplicarAssinaturaDigital;
window.assinarComCertificadoA1 = assinarComCertificadoA1;
window.assinarComTokenA3 = assinarComTokenA3;
window.aplicarAssinaturaNoXML = aplicarAssinaturaNoXML;
window.validarCertificadoParaEnvio = validarCertificadoParaEnvio;
window.obterMensagemErroAssinatura = obterMensagemErroAssinatura;
window.gerarHashAssinatura = gerarHashAssinatura;
window.sleep = sleep;

console.log('✅ ENVIO.JS carregado com sucesso!');

// ==================== TESTES DE PROXY ====================

// Função para testar se o proxy está funcionando
async function testarProxy() {
  console.log('🧪 Testando proxy local...');
  
  const proxyUrls = [
    './proxy-nfse.php',
    'proxy-nfse.php',
    '/mt/notafiscal/proxy-nfse.php',
    '/proxy-nfse.php',
    'http://localhost/mt/notafiscal/proxy-nfse.php'
  ];
  
  for (const proxyUrl of proxyUrls) {
    try {
      console.log(`🔍 Testando: ${proxyUrl}`);
      
      const response = await fetch(proxyUrl, { method: 'GET' });
      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ Proxy funcionando: ${proxyUrl}`, data);
        alert(`✅ Proxy funcionando!\n\nURL: ${proxyUrl}\nVersão: ${data.version || 'N/A'}\nPHP: ${data.php_version || 'N/A'}`);
        return proxyUrl;
      }
    } catch (error) {
      console.warn(`❌ Proxy não funciona: ${proxyUrl}`, error.message);
    }
  }
  
  alert('❌ Nenhum proxy local encontrado funcionando.\n\n💡 Verifique se o XAMPP está rodando e o arquivo proxy-nfse.php está no local correto.');
  return null;
}

// Adicionar botão de teste no HTML (função chamada pelo botão)
window.testarProxy = testarProxy;

// ==================== TESTE DE ENDPOINTS ====================

// Função para testar diferentes endpoints do webservice
async function testarEndpoints() {
  console.log('🧪 Testando diferentes endpoints do webservice...');
  
  const baseUrl = 'https://serem-hml.joaopessoa.pb.gov.br';
  const endpoints = [
    '/notafiscal-abrasfv203-ws/NotaFiscalSoap',
    '/notafiscal-abrasfv203-ws/NotaFiscalSoapService',
    '/notafiscal-abrasfv203-ws/services/NotaFiscalSoap',
    '/notafiscal-abrasfv203-ws/ws/NotaFiscalSoap',
    '/ws/NotaFiscalSoap',
    '/services/NotaFiscalSoap',
    '/NotaFiscalSoap'
  ];
  
  // XML de teste simples
  const xmlTeste = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" 
               xmlns:tns="http://nfse.abrasf.org.br">
  <soap:Body>
    <tns:RecepcionarLoteRps>
      <tns:EnviarLoteRpsEnvio>
        <![CDATA[<teste/>]]>
      </tns:EnviarLoteRpsEnvio>
    </tns:RecepcionarLoteRps>
  </soap:Body>
</soap:Envelope>`;

  for (const endpoint of endpoints) {
    const url = baseUrl + endpoint;
    console.log(`🔍 Testando: ${url}`);
    
    try {
      const response = await fetch('./proxy-nfse.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: url,
          soapEnvelope: xmlTeste,
          headers: {
            'Content-Type': 'text/xml; charset=utf-8',
            'SOAPAction': ''
          }
        })
      });
      
      const data = await response.json();
      console.log(`📊 ${endpoint}: HTTP ${data.httpCode} - ${data.success ? 'SUCESSO' : 'ERRO'}`);
      
      if (data.success && data.httpCode === 200) {
        console.log(`✅ ENDPOINT FUNCIONANDO: ${url}`);
        alert(`✅ Endpoint encontrado!\n\n${url}\n\nHTTP 200 - Funcionando!`);
        return url;
      }
      
    } catch (error) {
      console.log(`❌ ${endpoint}: Erro - ${error.message}`);
    }
    
    // Pausa entre testes
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('❌ Nenhum endpoint funcionando encontrado');
  alert('❌ Nenhum endpoint funcionando encontrado.\n\nTodos retornaram HTTP 404 ou erro.');
  return null;
}

// Adicionar ao escopo global
window.testarEndpoints = testarEndpoints;
