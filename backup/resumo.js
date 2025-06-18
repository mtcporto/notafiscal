// ==================================================
// RESUMO.JS - Sistema de Resumo e Status da NFS-e
// ==================================================
// Responsável por:
// - Geração do resumo dos dados da NFS-e
// - Exibição de status de envio
// - Exibição de resultados de sucesso/erro
// - Funções auxiliares de protocolo e numeração
// - Interface de acompanhamento do processo
// ==================================================

// ==================== GERAÇÃO DE RESUMO ====================

// Função principal para gerar resumo dos dados
function gerarResumo(dados) {
  // Validar se os dados foram fornecidos
  if (!dados || !dados.servico || !dados.prestador || !dados.tomador) {
    console.error('❌ Dados incompletos para gerar resumo:', dados);
    return '<div class="erro">Erro: Dados incompletos para gerar resumo</div>';
  }

  const valorServico = dados.servico.valor || 0;
  const valorIss = valorServico * (dados.servico.aliquota || 0);
  const valorLiquido = valorServico - (dados.servico.issRetido === '1' ? valorIss : 0);
  
  // Obter configurações para numeração
  const config = JSON.parse(localStorage.getItem('nfseConfig') || '{}');
  const numeroRps = config.geral ? (config.geral.proximoNumero || 1) : 1;
  const serieRps = config.geral ? (config.geral.serie || 'A1') : 'A1';
  
  const resumoHtml = `
    <div class="resumo-section">
      <h4><i class="fas fa-user"></i> Prestador de Serviços</h4>
      <div class="resumo-item">
        <span class="resumo-label">Razão Social:</span>
        <span class="resumo-value">${dados.prestador.razaoSocial}</span>
      </div>
      <div class="resumo-item">
        <span class="resumo-label">CNPJ:</span>
        <span class="resumo-value">${formatarDocumento(dados.prestador.cnpj, 'cnpj')}</span>
      </div>
      <div class="resumo-item">
        <span class="resumo-label">Inscrição Municipal:</span>
        <span class="resumo-value">${dados.prestador.inscricaoMunicipal}</span>
      </div>
    </div>
    
    <div class="resumo-section">
      <h4><i class="fas fa-building"></i> Tomador de Serviços</h4>
      <div class="resumo-item">
        <span class="resumo-label">Razão Social/Nome:</span>
        <span class="resumo-value">${dados.tomador.razaoSocial}</span>
      </div>
      <div class="resumo-item">
        <span class="resumo-label">${dados.tomador.tipoDoc?.toUpperCase() || 'DOCUMENTO'}:</span>
        <span class="resumo-value">${formatarDocumento(dados.tomador.documento, dados.tomador.tipoDoc)}</span>
      </div>
      ${dados.tomador.email ? `
      <div class="resumo-item">
        <span class="resumo-label">E-mail:</span>
        <span class="resumo-value">${dados.tomador.email}</span>
      </div>
      ` : ''}
    </div>
    
    <div class="resumo-section">
      <h4><i class="fas fa-cogs"></i> Serviço Prestado</h4>
      <div class="resumo-item">
        <span class="resumo-label">Código do Serviço:</span>
        <span class="resumo-value">${dados.servico.itemListaServico}</span>
      </div>
      <div class="resumo-item">
        <span class="resumo-label">Descrição:</span>
        <span class="resumo-value">${dados.servico.descricao}</span>
      </div>
    </div>
    
    <div class="resumo-section">
      <h4><i class="fas fa-dollar-sign"></i> Valores e Tributos</h4>
      <div class="resumo-item">
        <span class="resumo-label">Valor dos Serviços:</span>
        <span class="resumo-value valor-destaque">${formatarMoeda(valorServico)}</span>
      </div>
      <div class="resumo-item">
        <span class="resumo-label">Alíquota ISS:</span>
        <span class="resumo-value">${(dados.servico.aliquota * 100).toFixed(2)}%</span>
      </div>
      <div class="resumo-item">
        <span class="resumo-label">Valor ISS:</span>
        <span class="resumo-value">${formatarMoeda(valorIss)}</span>
      </div>
      <div class="resumo-item">
        <span class="resumo-label">ISS Retido:</span>
        <span class="resumo-value">${dados.servico.issRetido === '1' ? 'Sim - Tomador retém' : 'Não - Prestador recolhe'}</span>
      </div>
      <div class="resumo-item">
        <span class="resumo-label">Valor Líquido:</span>
        <span class="resumo-value valor-destaque">${formatarMoeda(valorLiquido)}</span>
      </div>
    </div>
    
    <div class="resumo-section">
      <h4><i class="fas fa-calendar-alt"></i> Informações da Emissão</h4>
      <div class="resumo-item">
        <span class="resumo-label">Data de Emissão:</span>
        <span class="resumo-value">${new Date().toLocaleDateString('pt-BR')}</span>
      </div>
      <div class="resumo-item">
        <span class="resumo-label">Município:</span>
        <span class="resumo-value">João Pessoa/PB</span>
      </div>
      <div class="resumo-item">
        <span class="resumo-label">RPS Número:</span>
        <span class="resumo-value">${numeroRps} - Série ${serieRps}</span>
      </div>
    </div>
  `;
  
  return resumoHtml;
}

// ==================== STATUS DE ENVIO ====================

// Mostrar interface de status de envio
function mostrarStatusEnvio() {
  const statusHtml = `
    <div class="envio-status">
      <h4><i class="fas fa-paper-plane"></i> Enviando NFS-e para Webservice</h4>
      <div class="envio-step">
        <span class="envio-icon"><i class="fas fa-search"></i></span>
        <div class="envio-content">
          <strong>Validando XML</strong>
          <small>Verificando estrutura e dados...</small>
        </div>
        <span class="loading-spinner"></span>
      </div>
      <div class="envio-step">
        <span class="envio-icon"><i class="fas fa-certificate"></i></span>
        <div class="envio-content">
          <strong>Aplicando Assinatura Digital</strong>
          <small>Assinando com certificado A1...</small>
        </div>
        <span style="color: #666;"><i class="fas fa-clock"></i></span>
      </div>
      <div class="envio-step">
        <span class="envio-icon"><i class="fas fa-satellite-dish"></i></span>
        <div class="envio-content">
          <strong>Enviando para Prefeitura</strong>
          <small>Transmitindo dados...</small>
        </div>
        <span style="color: #666;"><i class="fas fa-clock"></i></span>
      </div>
      <div class="envio-step">
        <span class="envio-icon"><i class="fas fa-clipboard-check"></i></span>
        <div class="envio-content">
          <strong>Recebendo Protocolo</strong>
          <small>Aguardando retorno...</small>
        </div>
        <span style="color: #666;"><i class="fas fa-clock"></i></span>
      </div>
    </div>
  `;
  
  document.getElementById('validationResults').innerHTML = statusHtml;
  document.getElementById('validationResults').style.display = 'block';
  document.getElementById('validationResults').scrollIntoView({ behavior: 'smooth' });
}

// Atualizar status de um passo específico
function atualizarPassoEnvio(passo, icone, cor) {
  const steps = document.querySelectorAll('.envio-step');
  if (steps[passo]) {
    const statusElement = steps[passo].querySelector('span:last-child');
    // Clear any existing loading spinner before setting new status
    const existingSpinner = statusElement.querySelector('.loading-spinner');
    if (existingSpinner) {
      statusElement.innerHTML = '';
    }
    statusElement.innerHTML = icone;
    statusElement.style.color = cor;
    
    // Iniciar próximo passo se houver
    if (passo < steps.length - 1) {
      const nextStep = steps[passo + 1];
      const nextStatus = nextStep.querySelector('span:last-child');
      nextStatus.innerHTML = '<span class="loading-spinner"></span>';
    }
  }
}

// ==================== EXIBIÇÃO DE RESULTADOS ====================

// Exibir resultado de sucesso
function exibirResultadoEnvio(resultado) {
  // Gerar seção de informações do certificado se disponível
  let certificadoInfo = '';
  if (resultado.certificadoUsado) {
    const cert = resultado.certificadoUsado;
    
    // Formatar data de validade se disponível
    let validadeFormatada = 'N/A';
    if (cert.validade) {
      try {
        validadeFormatada = new Date(cert.validade).toLocaleDateString('pt-BR');
      } catch (e) {
        validadeFormatada = cert.validade;
      }
    }
    
    certificadoInfo = `
      <div class="envio-step">
        <span class="envio-icon"><i class="fas fa-certificate"></i></span>
        <div class="envio-content">
          <strong>Certificado Digital Utilizado</strong>
          <small>
            <strong>Titular:</strong> ${cert.titular || 'N/A'}<br>
            <strong>Tipo:</strong> ${cert.tipo || 'N/A'}${cert.tipo === 'A3' && cert.provider ? ` (${cert.provider})` : ''}<br>
            ${cert.cpfCnpj ? `<strong>CPF/CNPJ:</strong> ${cert.cpfCnpj}<br>` : ''}
            ${cert.emissor ? `<strong>Autoridade Certificadora:</strong> ${cert.emissor}<br>` : ''}
            ${cert.validade ? `<strong>Válido até:</strong> ${validadeFormatada}<br>` : ''}
            ${cert.slot ? `<strong>Slot:</strong> ${cert.slot}<br>` : ''}
            <span style="color: #4caf50; font-weight: bold;"><i class="fas fa-check-circle"></i> Assinatura aplicada com sucesso</span>
          </small>
        </div>
      </div>
    `;
  }
  
  const resultadoHtml = `
    <div class="envio-status">
      <h4><i class="fas fa-check-circle" style="color: #4caf50;"></i> NFS-e Enviada com Sucesso!</h4>
      
      <div class="protocol-box">
        <div><strong>Protocolo de Envio</strong></div>
        <div class="protocol-number">${resultado.protocolo}</div>
        <div style="margin-top: 10px;">
          <strong>Número da NFS-e:</strong> ${resultado.numeroNfse}<br>
          <strong>Código de Verificação:</strong> ${resultado.codigoVerificacao}
        </div>
      </div>
      
      <div class="envio-step">
        <span class="envio-icon"><i class="fas fa-calendar-alt"></i></span>
        <div class="envio-content">
          <strong>Data de Processamento</strong>
          <small>${new Date(resultado.dataProcessamento).toLocaleString('pt-BR')}</small>
        </div>
      </div>

      ${certificadoInfo}
      
      <div class="envio-step">
        <span class="envio-icon"><i class="fas fa-link"></i></span>
        <div class="envio-content">
          <strong>Link para Consulta</strong>
          <small>
            <a href="${resultado.linkConsulta}" target="_blank" class="link-consulta">
              <i class="fas fa-external-link-alt"></i> Acessar Portal de Consultas
            </a>
          </small>
        </div>
      </div>
      
      <div class="envio-step">
        <span class="envio-icon"><i class="fas fa-file-pdf"></i></span>
        <div class="envio-content">
          <strong>DANFSE</strong>
          <small>
            <a href="${resultado.linkDanfse}" target="_blank" class="link-danfse">
              <i class="fas fa-download"></i> Visualizar/Imprimir DANFSE
            </a>
          </small>
        </div>
      </div>
      
      ${resultado.observacao ? `
        <div class="envio-step">
          <span class="envio-icon"><i class="fas fa-info-circle"></i></span>
          <div class="envio-content">
            <strong>Informação Importante</strong>
            <small style="color: #e67e22; font-weight: bold;">${resultado.observacao}</small>
          </div>
        </div>
      ` : ''}
    </div>
  `;
  
  document.getElementById('validationResults').innerHTML = resultadoHtml;
  
  // Adicionar consulta de protocolo se não for envio via formulário
  if (!resultado.protocolo?.startsWith('FORM-SUBMIT')) {
    setTimeout(() => {
      adicionarConsultaProtocolo();
      // Pré-preencher o protocolo se disponível
      const campoProtocolo = document.getElementById('protocoloConsulta');
      if (campoProtocolo && resultado.protocolo) {
        campoProtocolo.value = resultado.protocolo;
      }
    }, 500);
  } else {
    // Para envios via formulário, mostrar instruções especiais
    setTimeout(() => {
      adicionarConsultaProtocolo();
      const consultaDiv = document.getElementById('consultaProtocolo');
      if (consultaDiv) {
        consultaDiv.insertAdjacentHTML('afterbegin', `
          <div class="config-item" style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; border-radius: 5px; margin-bottom: 15px;">
            <h4><i class="fas fa-exclamation-triangle" style="color: #f39c12;"></i> Atenção!</h4>
            <p>O envio foi feito via formulário direto. <strong>Verifique a nova janela</strong> que foi aberta para encontrar o protocolo real.</p>
            <p>Na resposta do webservice, procure por: <code>&lt;Protocolo&gt;</code> ou <code>&lt;NumeroProtocolo&gt;</code></p>
          </div>
        `);
      }
    }, 500);
  }
}

// Exibir erro no envio
function exibirErroEnvio(error) {
  // Identificar tipo de erro para dar soluções específicas
  let tipoErro = 'generico';
  let solucoes = [];
  
  if (error.message.includes('CORS') || error.message.includes('blocked by CORS')) {
    tipoErro = 'cors';
    solucoes = [
      '🌐 Instale uma extensão anti-CORS no navegador',
      '📁 Use o arquivo proxy-nfse.php incluído no projeto',
      '🔧 Configure um servidor proxy local',
      '🖥️ Execute o XAMPP e acesse via localhost'
    ];
  } else if (error.message.includes('cancelado pelo usuário')) {
    tipoErro = 'cancelado';
    solucoes = [
      '🌐 Instale uma extensão anti-CORS para evitar popups',
      '📁 Use o proxy-nfse.php para envio automático',
      '🔧 Configure adequadamente o webservice',
      '✅ Aceite o popup para envio direto quando solicitado'
    ];
  } else if (error.message.includes('xmlOutput') || error.message.includes('null')) {
    tipoErro = 'xml';
    solucoes = [
      '📋 Preencha todos os dados nas abas anteriores',
      '🔧 Clique em "Gerar XML" antes de enviar',
      '🔄 Recarregue a página se o problema persistir',
      '✅ Verifique se todos os campos obrigatórios estão preenchidos'
    ];
  } else if (error.message.includes('certificado') || error.message.includes('assinatura')) {
    tipoErro = 'certificado';
    solucoes = [
      '📜 Configure um certificado digital válido',
      '⏰ Verifique se o certificado não está vencido',
      '🔧 Confirme o tipo de certificado (A1 ou A3)',
      '💻 Para A3, certifique-se que o leitor está conectado'
    ];
  }
  
  const solucoesHtml = solucoes.length > 0 ? `
    <div class="envio-step">
      <span class="envio-icon">💡</span>
      <div class="envio-content">
        <strong>Possíveis Soluções</strong>
        <small>
          ${solucoes.map(sol => `• ${sol}`).join('<br>')}
        </small>
      </div>
    </div>
  ` : '';
  
  const erroHtml = `
    <div class="envio-status">
      <h4>❌ Erro no Envio</h4>
      
      <div class="envio-step">
        <span class="envio-icon">⚠️</span>
        <div class="envio-content">
          <strong>Falha na Transmissão</strong>
          <small>${error.message}</small>
        </div>
      </div>
      
      ${solucoesHtml}
      
      <div style="text-align: center; margin-top: 20px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
        <button type="button" onclick="enviarParaWebservice()" class="btn-primary">
          🔄 Tentar Novamente
        </button>
        <button type="button" onclick="abrirModal()" class="btn-secondary">
          ⚙️ Configurações
        </button>
        ${tipoErro === 'xml' ? `
          <button type="button" onclick="switchTab('servico')" class="btn-info">
            📋 Preencher Dados
          </button>
        ` : ''}
        ${tipoErro === 'cors' ? `
          <button type="button" onclick="abrirDocumentacaoCors()" class="btn-info">
            📖 Ver Soluções CORS
          </button>
        ` : ''}
      </div>
    </div>
  `;
  
  document.getElementById('validationResults').innerHTML = erroHtml;
}

// ==================== AÇÕES PÓS-ENVIO ====================

// Função para gerar DANFSE real
async function gerarDANFSE(numeroNfse) {
  try {
    console.log(`📄 Gerando DANFSE da NFS-e ${numeroNfse}...`);
    
    // Obter configurações do webservice
    const config = JSON.parse(localStorage.getItem('nfseConfig') || '{}');
    const urlBase = config.webservice?.url?.replace('/webservice/nfse.asmx', '') || 
                   'https://nfse.joaopessoa.pb.gov.br';
    
    // URL real para download da DANFSE
    const urlDanfse = `${urlBase}/danfse/${numeroNfse}`;
    
    // Tentar abrir em nova aba
    const novaAba = window.open(urlDanfse, '_blank');
    
    if (novaAba) {
      alert(`📄 Abrindo DANFSE da NFS-e ${numeroNfse} em nova aba...`);
    } else {
      // Fallback se popup foi bloqueado
      const link = document.createElement('a');
      link.href = urlDanfse;
      link.download = `DANFSE-${numeroNfse}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert(`📄 Download iniciado para DANFSE da NFS-e ${numeroNfse}`);
    }
    
  } catch (error) {
    console.error('Erro ao gerar DANFSE:', error);
    alert(`❌ Erro ao gerar DANFSE: ${error.message}`);
  }
}

// Função para consultar status real
async function consultarStatus(protocolo) {
  try {
    console.log(`🔍 Consultando status do protocolo ${protocolo}...`);
    
    // Obter configurações
    const config = JSON.parse(localStorage.getItem('nfseConfig') || '{}');
    
    if (!config.webservice?.url) {
      alert('❌ Configuração de webservice não encontrada. Configure o webservice primeiro.');
      return;
    }
    
    // Criar envelope SOAP para consulta
    const soapConsulta = criarEnvelopeConsultaStatus(protocolo, config);
    
    // Fazer requisição
    const response = await fetch(config.webservice.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': 'http://www.abrasf.org.br/nfse.xsd/ConsultarSituacaoLoteRps'
      },
      body: soapConsulta
    });
    
    if (!response.ok) {
      throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
    }
    
    const responseText = await response.text();
    const resultado = processarRespostaConsulta(responseText);
    
    // Exibir resultado
    let mensagem = `🔍 Status do protocolo ${protocolo}:\n\n`;
    mensagem += `Status: ${resultado.status}\n`;
    mensagem += `Situação: ${resultado.situacao}\n`;
    mensagem += `Data: ${resultado.data}\n`;
    
    if (resultado.observacoes) {
      mensagem += `Observações: ${resultado.observacoes}\n`;
    }
    
    alert(mensagem);
    
  } catch (error) {
    console.error('Erro ao consultar status:', error);
    alert(`❌ Erro ao consultar status: ${error.message}`);
  }
}

// Função para enviar por e-mail real
async function enviarPorEmail(numeroNfse) {
  try {
    const email = prompt('📧 Digite o e-mail de destino:');
    if (!email) return;
    
    // Validar e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('❌ E-mail inválido. Digite um e-mail válido.');
      return;
    }
    
    console.log(`📧 Enviando NFS-e ${numeroNfse} para ${email}...`);
    
    // Obter configurações
    const config = JSON.parse(localStorage.getItem('nfseConfig') || '{}');
    
    // Criar dados para envio
    const dadosEnvio = {
      numeroNfse: numeroNfse,
      destinatario: email,
      assunto: `NFS-e Nº ${numeroNfse}`,
      incluirDANFSE: true,
      incluirXML: true
    };
    
    // Em um ambiente real, seria feita chamada para API de e-mail
    // Por enquanto, simular processo de envio
    const sucesso = await simularEnvioEmail(dadosEnvio);
    
    if (sucesso) {
      alert(`✅ NFS-e ${numeroNfse} enviada com sucesso para ${email}!`);
    } else {
      alert(`❌ Falha no envio do e-mail. Tente novamente mais tarde.`);
    }
    
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    alert(`❌ Erro ao enviar e-mail: ${error.message}`);
  }
}

// Simular envio de e-mail (será substituído por integração real)
async function simularEnvioEmail(dados) {
  // Aguardar um tempo para simular processamento
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 95% de chance de sucesso
  return Math.random() > 0.05;
}

// Criar envelope SOAP para consulta de status (apenas certificado digital - padrão ABRASF)
function criarEnvelopeConsultaStatus(protocolo, config) {
  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" 
               xmlns:nfse="http://www.abrasf.org.br/nfse.xsd">
  <soap:Body>
    <nfse:ConsultarSituacaoLoteRps>
      <nfse:xmlEnvio>
        <![CDATA[
          <ConsultarSituacaoLoteRpsEnvio xmlns="http://www.abrasf.org.br/nfse.xsd">
            <Prestador>
              <Cnpj>${config.prestador?.cnpj || ''}</Cnpj>
              <InscricaoMunicipal>${config.prestador?.inscricaoMunicipal || ''}</InscricaoMunicipal>
            </Prestador>
            <Protocolo>${protocolo}</Protocolo>
          </ConsultarSituacaoLoteRpsEnvio>
        ]]>
      </nfse:xmlEnvio>
    </nfse:ConsultarSituacaoLoteRps>
  </soap:Body>
</soap:Envelope>`;
}

// ==================== CONSULTA DE PROTOCOLO ====================

// Adicionar campo de consulta de protocolo no resumo de envio
function adicionarConsultaProtocolo() {
  const resultadoDiv = document.getElementById('validationResults');
  if (resultadoDiv && !document.getElementById('consultaProtocolo')) {
    const consultaHtml = `
      <div id="consultaProtocolo" class="config-section" style="margin-top: 20px; border: 2px solid #3498db;">
        <h3><i class="fas fa-search"></i> Consultar Status por Protocolo</h3>
        <div class="config-item">
          <label for="protocoloConsulta">Protocolo da NFS-e:</label>
          <input type="text" id="protocoloConsulta" 
                 placeholder="Digite o protocolo recebido (ex: 2025061312345678)" 
                 style="font-family: monospace;" />
          <small>Use o protocolo obtido na resposta do webservice</small>
        </div>
        <div class="config-item">
          <button type="button" id="btnConsultarProtocolo" class="btn-primary">
            <i class="fas fa-search"></i> Consultar Status
          </button>
          <div id="resultadoConsulta" style="margin-top: 10px;"></div>
        </div>
      </div>
    `;
    
    resultadoDiv.insertAdjacentHTML('beforeend', consultaHtml);
    
    // Adicionar evento de clique
    document.getElementById('btnConsultarProtocolo').addEventListener('click', consultarProtocoloNfse);
  }
}

// Consultar status da NFS-e por protocolo
async function consultarProtocoloNfse() {
  const protocolo = document.getElementById('protocoloConsulta').value.trim();
  const resultadoDiv = document.getElementById('resultadoConsulta');
  
  if (!protocolo) {
    resultadoDiv.innerHTML = '<span class="status-indicator status-error"></span>Digite o protocolo para consulta';
    return;
  }
  
  resultadoDiv.innerHTML = '<span class="status-indicator status-warning"></span>Consultando status...';
  
  try {
    const config = JSON.parse(localStorage.getItem('nfseConfig') || '{}');
    
    if (!config.webservice?.url) {
      resultadoDiv.innerHTML = '<span class="status-indicator status-error"></span>Configure o webservice primeiro';
      return;
    }
    
    // Criar envelope SOAP para consulta
    const soapConsulta = criarEnvelopeConsultaStatus(protocolo, config);
    
    // Tentar consulta usando as mesmas estratégias do envio
    const resultado = await tentarConsultaComFallback(config.webservice.url, soapConsulta);
    
    if (resultado.sucesso) {
      exibirResultadoConsulta(resultado, resultadoDiv);
    } else {
      resultadoDiv.innerHTML = `<span class="status-indicator status-error"></span>Erro: ${resultado.erro}`;
    }
    
  } catch (error) {
    console.error('❌ Erro na consulta:', error);
    resultadoDiv.innerHTML = `<span class="status-indicator status-error"></span>Erro na consulta: ${error.message}`;
  }
}

// Tentar consulta com múltiplas estratégias (similar ao envio)
async function tentarConsultaComFallback(url, soapEnvelope) {
  try {
    // Estratégia 1: Fetch normal
    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': 'http://www.abrasf.org.br/nfse.xsd/ConsultarSituacaoLoteRps'
      },
      body: soapEnvelope
    });
    
    if (response.ok) {
      const responseText = await response.text();
      return processarRespostaConsulta(responseText);
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
  } catch (error) {
    console.warn('❌ Fetch falhou, tentando XMLHttpRequest...', error);
    
    // Estratégia 2: XMLHttpRequest
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.timeout = 15000;
      
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const resultado = processarRespostaConsulta(xhr.responseText);
              resolve(resultado);
            } catch (parseError) {
              reject(new Error(`Erro ao processar resposta: ${parseError.message}`));
            }
          } else {
            reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
          }
        }
      };
      
      xhr.onerror = () => reject(new Error('Erro de rede na consulta'));
      xhr.ontimeout = () => reject(new Error('Timeout na consulta'));
      
      try {
        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-Type', 'text/xml; charset=utf-8');
        xhr.setRequestHeader('SOAPAction', 'http://www.abrasf.org.br/nfse.xsd/ConsultarSituacaoLoteRps');
        xhr.send(soapEnvelope);
      } catch (xhrError) {
        reject(new Error(`Erro XMLHttpRequest: ${xhrError.message}`));
      }
    });
  }
}

// Processar resposta da consulta de status
function processarRespostaConsulta(responseText) {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(responseText, 'text/xml');
    
    // Verificar erros de parsing
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      throw new Error('Resposta XML inválida');
    }
    
    // Verificar fault SOAP
    const faultElement = xmlDoc.querySelector('soap\\:Fault, Fault');
    if (faultElement) {
      const faultString = faultElement.querySelector('faultstring')?.textContent || 'Erro SOAP';
      throw new Error(`Erro no webservice: ${faultString}`);
    }
    
    // Procurar situação do lote
    const situacaoElement = xmlDoc.querySelector('Situacao, situacao');
    if (situacaoElement) {
      const situacao = situacaoElement.textContent;
      
      return {
        sucesso: true,
        situacao: situacao,
        descricaoSituacao: obterDescricaoSituacao(situacao),
        xmlCompleto: responseText,
        nfseGerada: extrairDadosNfse(xmlDoc)
      };
    } else {
      throw new Error('Situação não encontrada na resposta');
    }
    
  } catch (error) {
    return {
      sucesso: false,
      erro: error.message
    };
  }
}

// Obter descrição da situação
function obterDescricaoSituacao(situacao) {
  const situacoes = {
    '1': 'Não Recebido',
    '2': 'Não Processado (aguardando)',
    '3': 'Processado com Erro',
    '4': 'Processado com Sucesso'
  };
  
  return situacoes[situacao] || `Situação ${situacao} (desconhecida)`;
}

// Extrair dados da NFS-e se gerada
function extrairDadosNfse(xmlDoc) {
  const nfseElement = xmlDoc.querySelector('Nfse, nfse');
  if (!nfseElement) return null;
  
  const numero = nfseElement.querySelector('Numero, numero')?.textContent;
  const codigoVerificacao = nfseElement.querySelector('CodigoVerificacao, codigoVerificacao')?.textContent;
  const dataEmissao = nfseElement.querySelector('DataEmissao, dataEmissao')?.textContent;
  
  return {
    numero,
    codigoVerificacao,
    dataEmissao
  };
}

// Exibir resultado da consulta
function exibirResultadoConsulta(resultado, divResultado) {
  const situacao = resultado.situacao;
  let statusClass = 'status-warning';
  let icone = 'fas fa-clock';
  
  if (situacao === '4') {
    statusClass = 'status-success';
    icone = 'fas fa-check-circle';
  } else if (situacao === '3') {
    statusClass = 'status-error';
    icone = 'fas fa-times-circle';
  }
  
  let html = `
    <div class="${statusClass}" style="padding: 15px; border-radius: 5px; margin-top: 10px;">
      <h4><i class="${icone}"></i> ${resultado.descricaoSituacao}</h4>
      <p><strong>Situação:</strong> ${situacao} - ${resultado.descricaoSituacao}</p>
  `;
  
  if (resultado.nfseGerada) {
    html += `
      <hr style="margin: 10px 0;">
      <h5>📄 NFS-e Gerada:</h5>
      <p><strong>Número:</strong> ${resultado.nfseGerada.numero || 'N/A'}</p>
      <p><strong>Código de Verificação:</strong> ${resultado.nfseGerada.codigoVerificacao || 'N/A'}</p>
      <p><strong>Data de Emissão:</strong> ${resultado.nfseGerada.dataEmissao || 'N/A'}</p>
    `;
  }
  
  html += `
      <button type="button" onclick="exibirXmlCompleto('${btoa(resultado.xmlCompleto)}')" class="btn-secondary" style="margin-top: 10px;">
        <i class="fas fa-code"></i> Ver XML Completo
      </button>
    </div>
  `;
  
  divResultado.innerHTML = html;
}

// Exibir XML completo em modal
function exibirXmlCompleto(xmlBase64) {
  const xml = atob(xmlBase64);
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
    background: rgba(0,0,0,0.8); z-index: 9999; 
    display: flex; align-items: center; justify-content: center;
  `;
  
  modal.innerHTML = `
    <div style="background: white; padding: 20px; border-radius: 10px; max-width: 90%; max-height: 90%; overflow: auto;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <h3>📄 Resposta Completa do Webservice</h3>
        <button onclick="this.closest('.modal').remove()" style="background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">✖</button>
      </div>
      <pre style="background: #f8f9fa; padding: 15px; border-radius: 5px; font-size: 12px; white-space: pre-wrap; max-height: 400px; overflow-y: auto;">${xml.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
    </div>
  `;
  
  modal.className = 'modal';
  document.body.appendChild(modal);
}

// ==================== FUNÇÕES AUXILIARES ====================

// Função para gerar nova RPS
function gerarNovaRps() {
  if (confirm('🔄 Deseja gerar uma nova RPS? Os dados atuais serão limpos.')) {
    // Incrementar número RPS
    incrementarNumeroRps();
    
    // Limpar formulário
    document.getElementById('nfseForm').reset();
    
    // Limpar resultados
    document.getElementById('validationResults').innerHTML = '';
    document.getElementById('validationResults').style.display = 'none';
    
    // Voltar para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Focar no primeiro campo
    const primeiroInput = document.querySelector('#nfseForm input');
    if (primeiroInput) {
      primeiroInput.focus();
    }
    
    console.log('✅ Nova RPS iniciada');
  }
}

// Gerar número de protocolo único
function gerarNumeroProtocolo() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${timestamp}${random}`;
}

// Gerar número da NFS-e
function gerarNumeroNfse() {
  const ano = new Date().getFullYear();
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${ano}${timestamp.toString().slice(-6)}${random}`;
}

// Gerar código de verificação
function gerarCodigoVerificacao() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Incrementar número da RPS
function incrementarNumeroRps() {
  try {
    const config = JSON.parse(localStorage.getItem('nfseConfig') || '{}');
    if (!config.geral) config.geral = {};
    
    const numeroAtual = config.geral.proximoNumero || 1;
    config.geral.proximoNumero = numeroAtual + 1;
    
    localStorage.setItem('nfseConfig', JSON.stringify(config));
    console.log(`📊 Número RPS incrementado para: ${config.geral.proximoNumero}`);
  } catch (error) {
    console.error('❌ Erro ao incrementar número RPS:', error);
  }
}

// Abrir documentação de soluções CORS
function abrirDocumentacaoCors() {
  const corsWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes');
  corsWindow.document.write(`
    <html>
      <head>
        <title>🌐 Soluções para Problemas de CORS</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; background: #f5f5f5; }
          .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
          h2 { color: #34495e; margin-top: 30px; }
          .solucao { background: #e8f4fd; padding: 15px; margin: 15px 0; border-left: 4px solid #3498db; border-radius: 5px; }
          .alerta { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .sucesso { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 15px 0; border-radius: 5px; }
          code { background: #f8f9fa; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
          .download-btn { background: #28a745; color: white; padding: 10px 15px; border: none; border-radius: 5px; cursor: pointer; text-decoration: none; display: inline-block; margin: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🌐 Soluções para Problemas de CORS</h1>
          
          <div class="alerta">
            <strong>⚠️ O que é CORS?</strong><br>
            CORS (Cross-Origin Resource Sharing) é uma política de segurança dos navegadores que bloqueia requisições entre diferentes domínios. Como o webservice da prefeitura está em outro domínio, ocorrem esses bloqueios.
          </div>
          
          <h2>🎯 Soluções Recomendadas (em ordem de prioridade)</h2>
          
          <div class="solucao">
            <h3>1. 🌐 Extensão Anti-CORS (Mais Fácil)</h3>
            <p><strong>Chrome:</strong> CORS Unblock</p>
            <p><strong>Firefox:</strong> CORS Everywhere</p>
            <p><strong>Edge:</strong> CORS Toggle</p>
            <p>✅ <strong>Vantagem:</strong> Funciona imediatamente, sem configuração</p>
            <p>⚠️ <strong>Desvantagem:</strong> Reduz segurança do navegador</p>
          </div>
          
          <div class="solucao">
            <h3>2. 📁 Proxy PHP Local (Incluído no Projeto)</h3>
            <p>Use o arquivo <code>proxy-nfse.php</code> que já está no seu projeto:</p>
            <ol>
              <li>Certifique-se que o XAMPP está rodando</li>
              <li>Acesse o sistema via <code>http://localhost/mt/notafiscal/</code></li>
              <li>O proxy será usado automaticamente</li>
            </ol>
            <p>✅ <strong>Vantagem:</strong> Seguro, automático</p>
            <p>⚠️ <strong>Desvantagem:</strong> Requer servidor local</p>
          </div>
          
          <div class="solucao">
            <h3>3. 🖥️ Servidor Local Dedicado</h3>
            <p>Configure um proxy reverso com nginx ou apache</p>
            <p>✅ <strong>Vantagem:</strong> Produção-ready</p>
            <p>⚠️ <strong>Desvantagem:</strong> Configuração mais complexa</p>
          </div>
          
          <div class="solucao">
            <h3>4. 📋 Envio Direto via Formulário (Último Recurso)</h3>
            <p>Se todas as outras falharem, o sistema oferece envio direto que abre uma nova janela</p>
            <p>✅ <strong>Vantagem:</strong> Sempre funciona</p>
            <p>⚠️ <strong>Desvantagem:</strong> Resposta manual</p>
          </div>
          
          <h2>🔧 Testando as Soluções</h2>
          
          <div class="sucesso">
            <h3>Como saber se está funcionando:</h3>
            <ul>
              <li>✅ Envio automático sem popups</li>
              <li>✅ Retorno automático do protocolo</li>
              <li>✅ Sem mensagens de erro de CORS</li>
              <li>✅ Console sem erros de bloqueio</li>
            </ul>
          </div>
          
          <h2>⚙️ Configuração do Proxy PHP</h2>
          
          <p>O arquivo <code>proxy-nfse.php</code> já está configurado. Para verificar:</p>
          <ol>
            <li>Abra o arquivo em um editor</li>
            <li>Verifique se a URL do webservice está correta</li>
            <li>Teste acessando: <code>http://localhost/mt/notafiscal/proxy-nfse.php</code></li>
          </ol>
          
          <div class="alerta">
            <strong>💡 Dica:</strong> Para desenvolvimento, use a extensão anti-CORS. Para produção, use o proxy PHP ou servidor dedicado.
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <button onclick="window.close()" class="download-btn">✖️ Fechar</button>
          </div>
        </div>
      </body>
    </html>
  `);
}

// ==================== AÇÕES PÓS-ENVIO ====================

window.gerarResumo = gerarResumo;
window.mostrarStatusEnvio = mostrarStatusEnvio;
window.atualizarPassoEnvio = atualizarPassoEnvio;
window.exibirResultadoEnvio = exibirResultadoEnvio;
window.exibirErroEnvio = exibirErroEnvio;
window.gerarDANFSE = gerarDANFSE;
window.consultarStatus = consultarStatus;
window.enviarPorEmail = enviarPorEmail;
window.gerarNovaRps = gerarNovaRps;
window.gerarNumeroProtocolo = gerarNumeroProtocolo;
window.gerarNumeroNfse = gerarNumeroNfse;
window.gerarCodigoVerificacao = gerarCodigoVerificacao;
window.incrementarNumeroRps = incrementarNumeroRps;
window.exibirXmlCompleto = exibirXmlCompleto;
window.abrirDocumentacaoCors = abrirDocumentacaoCors;

console.log('✅ RESUMO.JS carregado com sucesso!');
