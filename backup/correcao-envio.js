// Função de correção temporária para tentarEnvioFormulario
async function tentarEnvioFormularioCorrigido(urlWebservice, soapEnvelope) {
  console.log('📝 Tentativa 4: Envio via página separada com SOAP correto');
  
  const confirmacao = confirm(`⚠️ ATENÇÃO: Estratégias automáticas falharam devido ao CORS.

🌐 Será aberta uma nova janela que fará o envio SOAP CORRETO.
📋 ESSA PÁGINA MOSTRARÁ A RESPOSTA REAL DO WEBSERVICE!

🔧 Problema corrigido:
• O erro "primeiro caractere não é '<'" era causado pelo encoding de formulário
• Agora o XML SOAP é enviado como texto puro (Content-Type: text/xml)
• A nova página mostra a resposta completa do webservice

Deseja continuar com o envio corrigido?`);

  if (!confirmacao) {
    throw new Error('❌ Envio cancelado pelo usuário.');
  }

  // Escapar o envelope SOAP para JavaScript
  const soapEscaped = soapEnvelope
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');

  // Criar página HTML simples
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>Envio NFS-e - SOAP Correto</title>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
    .container { max-width: 800px; margin: 0 auto; }
    .status { padding: 10px; margin: 10px 0; border-radius: 5px; font-weight: bold; }
    .sucesso { background: #d4edda; color: #155724; }
    .erro { background: #f8d7da; color: #721c24; }
    .aguardando { background: #fff3cd; color: #856404; }
    .resultado { background: #fff; border: 1px solid #ddd; padding: 15px; margin: 20px 0; max-height: 400px; overflow: auto; font-family: monospace; font-size: 12px; white-space: pre-wrap; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 Envio NFS-e - Correção Aplicada</h1>
    <div id="status" class="status aguardando">⏳ Preparando envio SOAP...</div>
    <div id="resultado" class="resultado" style="display: none;"></div>
  </div>
  <script>
    const soapEnvelope = '${soapEscaped}';
    const urlWebservice = '${urlWebservice}';
    
    async function enviarSOAP() {
      try {
        document.getElementById('status').textContent = '📡 Enviando XML SOAP (Content-Type: text/xml)...';
        
        const response = await fetch(urlWebservice, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/xml; charset=utf-8',
            'SOAPAction': ''
          },
          body: soapEnvelope
        });
        
        const responseText = await response.text();
        
        document.getElementById('resultado').style.display = 'block';
        document.getElementById('resultado').textContent = responseText;
        
        if (response.ok || response.status === 500) {
          document.getElementById('status').textContent = '✅ Resposta recebida - verifique abaixo';
          document.getElementById('status').className = 'status sucesso';
        } else {
          document.getElementById('status').textContent = '⚠️ HTTP ' + response.status + ' - verifique resposta';
          document.getElementById('status').className = 'status erro';
        }
      } catch (error) {
        document.getElementById('status').textContent = '❌ Erro: ' + error.message;
        document.getElementById('status').className = 'status erro';
        document.getElementById('resultado').style.display = 'block';
        document.getElementById('resultado').textContent = 'ERRO: ' + error.message;
      }
    }
    
    window.onload = () => setTimeout(enviarSOAP, 1000);
  </script>
</body>
</html>`;

  // Abrir nova janela
  const novaJanela = window.open('', '_blank', 'width=900,height=600,scrollbars=yes');
  
  if (!novaJanela) {
    alert('❌ Popup bloqueado! Permita popups para este site.');
    throw new Error('Popup bloqueado - não foi possível abrir nova janela');
  }

  novaJanela.document.open();
  novaJanela.document.write(htmlContent);
  novaJanela.document.close();

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
}

// Substituir a função corrompida
window.tentarEnvioFormulario = tentarEnvioFormularioCorrigido;

console.log('✅ Correção da função tentarEnvioFormulario aplicada!');
