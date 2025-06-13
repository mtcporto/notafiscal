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
      </div>      <div class="resumo-item">
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
      <h4><i class="fas fa-cogs"></i> Serviço Prestado</h4>      <div class="resumo-item">
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
          <small><a href="${resultado.linkConsulta}" target="_blank" style="color: #3498db;">${resultado.linkConsulta}</a></small>
        </div>
      </div>
      
      <div class="envio-step">
        <span class="envio-icon"><i class="fas fa-file-alt"></i></span>
        <div class="envio-content">
          <strong>DANFSE</strong>
          <small><a href="${resultado.linkDanfse}" target="_blank" style="color: #3498db;">Visualizar/Imprimir DANFSE</a></small>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 20px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
        <button type="button" onclick="gerarDANFSE('${resultado.numeroNfse}')" class="btn-primary">
          <i class="fas fa-file-alt"></i> Baixar DANFSE
        </button>
        <button type="button" onclick="consultarStatus('${resultado.protocolo}')" class="btn-secondary">
          <i class="fas fa-search"></i> Consultar Status
        </button>
        <button type="button" onclick="enviarPorEmail('${resultado.numeroNfse}')" class="btn-info">
          <i class="fas fa-envelope"></i> Enviar por E-mail
        </button>
        <button type="button" onclick="gerarNovaRps()" class="btn-success">
          <i class="fas fa-plus"></i> Nova RPS
        </button>
      </div>
    </div>
  `;
  
  document.getElementById('validationResults').innerHTML = resultadoHtml;
}

// Exibir erro no envio
function exibirErroEnvio(error) {
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
      
      <div style="text-align: center; margin-top: 20px;">
        <button type="button" onclick="enviarParaWebservice()" class="btn-primary">
          🔄 Tentar Novamente
        </button>
        <button type="button" onclick="abrirModal()" class="btn-secondary" style="margin-left: 10px;">
          ⚙️ Verificar Configurações
        </button>
      </div>
    </div>
  `;
  
  document.getElementById('validationResults').innerHTML = erroHtml;
}

// ==================== AÇÕES PÓS-ENVIO ====================

// Função para gerar DANFSE (simulada)
function gerarDANFSE(numeroNfse) {
  alert(`📄 Baixando DANFSE da NFS-e ${numeroNfse}...\n\nEm um sistema real, seria baixado o PDF da DANFSE.`);
}

// Função para consultar status (simulada)
function consultarStatus(protocolo) {
  alert(`🔍 Consultando status do protocolo ${protocolo}...\n\nStatus: Processada com sucesso\nSituação: Autorizada\nData: ${new Date().toLocaleString('pt-BR')}`);
}

// Função para enviar por e-mail (simulada)
function enviarPorEmail(numeroNfse) {
  const email = prompt('📧 Digite o e-mail de destino:');
  if (email) {
    alert(`Enviando NFS-e ${numeroNfse} para ${email}...\n\nEm um sistema real, seria enviado o e-mail com a DANFSE anexa.`);
  }
}

// Função para gerar nova RPS
function gerarNovaRps() {
  if (confirm('🔄 Deseja limpar o formulário para gerar uma nova RPS?')) {
    limparFormulario();
    
    // Se numeração automática estiver ativada, atualizar número
    const config = JSON.parse(localStorage.getItem('nfseConfig') || '{}');
    if (config.geral && config.geral.numeracaoRps === 'automatica') {
      // Atualizar número no XML futuro - isso será usado na próxima geração
      document.querySelector('#xmlOutput').setAttribute('data-proximo-numero', config.geral.proximoNumero || 1);
    }
    
    alert('✅ Formulário limpo. Preencha os dados para a nova RPS.');
  }
}

// ==================== FUNÇÕES AUXILIARES ====================

// Gerar número de protocolo simulado
function gerarNumeroProtocolo() {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `JP${timestamp.slice(-8)}${random}`;
}

// Gerar número da NFS-e
function gerarNumeroNfse() {
  const ano = new Date().getFullYear();
  const sequencial = Math.floor(Math.random() * 999999) + 1;
  return `${ano}${sequencial.toString().padStart(6, '0')}`;
}

// Gerar código de verificação
function gerarCodigoVerificacao() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let codigo = '';
  for (let i = 0; i < 8; i++) {
    codigo += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return codigo;
}

// Incrementar número da RPS nas configurações
function incrementarNumeroRps() {
  const config = JSON.parse(localStorage.getItem('nfseConfig') || '{}');
  
  if (!config.geral) {
    config.geral = {};
  }
  
  const numeroAtual = config.geral.proximoNumero || 1;
  config.geral.proximoNumero = numeroAtual + 1;
  
  localStorage.setItem('nfseConfig', JSON.stringify(config));
  
  // Atualizar painel se estiver visível
  if (typeof atualizarPainelStatus === 'function') {
    atualizarPainelStatus();
  }
}

// ==================== EXPORTAR PARA ESCOPO GLOBAL ====================
// Para manter compatibilidade com event listeners já definidos no HTML

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

console.log('✅ RESUMO.JS carregado com sucesso!');
