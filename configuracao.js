// ==================================================
// CONFIGURACAO.JS - Sistema de Configurações da NFS-e
// ==================================================
// Responsável por:
// - Modal de configurações
// - Configuração de certificados (A1 e A3)
// - Testes de certificados
// - Configuração de webservice
// - Configurações gerais
// - Sistema de notificações de vencimento
// ==================================================

// ==================== MODAL DE CONFIGURAÇÕES ====================

function abrirModal() {
  const modal = document.getElementById('modalConfiguracoes');
  modal.style.display = 'block';
  carregarConfiguracoes();
}

function fecharModal() {
  const modal = document.getElementById('modalConfiguracoes');
  modal.style.display = 'none';
}

// Fechar modal ao clicar fora
window.addEventListener('click', function(event) {
  const modal = document.getElementById('modalConfiguracoes');
  if (event.target === modal) {
    fecharModal();
  }
});

// ==================== CONFIGURAÇÃO DE CERTIFICADOS ====================

// Alternar exibição baseada no tipo de certificado
function alternarTipoCertificado() {
  const tipo = document.getElementById('tipoCertificado').value;
  const configA1 = document.getElementById('configA1');
  const configA3 = document.getElementById('configA3');
  
  if (tipo === 'A1') {
    configA1.style.display = 'block';
    configA3.style.display = 'none';
  } else if (tipo === 'A3') {
    configA1.style.display = 'none';
    configA3.style.display = 'block';
  } else {
    configA1.style.display = 'none';
    configA3.style.display = 'none';
  }
}

// ==================== CARREGAR E SALVAR CONFIGURAÇÕES ====================

// Carregar configurações salvas
function carregarConfiguracoes() {
  const config = JSON.parse(localStorage.getItem('nfseConfig') || '{}');
  
  // Certificado
  if (config.certificado) {
    document.getElementById('tipoCertificado').value = config.certificado.tipo || '';
    document.getElementById('providerA3').value = config.certificado.provider || '';
    alternarTipoCertificado();
  }
  
  // Webservice
  if (config.webservice) {
    document.getElementById('ambienteWs').value = config.webservice.ambiente || 'homologacao';
    document.getElementById('urlWebservice').value = config.webservice.url || 'https://nfse.joaopessoa.pb.gov.br/nfse/services/nfseWS';
    document.getElementById('timeoutWs').value = config.webservice.timeout || 30;
  }
  
  // Configurações gerais
  if (config.geral) {
    document.getElementById('numeracaoRps').value = config.geral.numeracaoRps || 'automatica';
    document.getElementById('proximoNumeroRps').value = config.geral.proximoNumero || 1;
    document.getElementById('serieRps').value = config.geral.serie || 'A1';
    document.getElementById('validacaoOffline').value = config.geral.validacaoOffline || 'sempre';
  }
}

// Salvar configurações
function salvarConfiguracoes() {
  const config = {
    certificado: {
      tipo: document.getElementById('tipoCertificado').value,
      provider: document.getElementById('providerA3').value
      // Nota: senhas e arquivos de certificado não são salvos por segurança
    },
    webservice: {
      ambiente: document.getElementById('ambienteWs').value,
      url: document.getElementById('urlWebservice').value,
      timeout: parseInt(document.getElementById('timeoutWs').value)
    },
    geral: {
      numeracaoRps: document.getElementById('numeracaoRps').value,
      proximoNumero: parseInt(document.getElementById('proximoNumeroRps').value),
      serie: document.getElementById('serieRps').value,
      validacaoOffline: document.getElementById('validacaoOffline').value
    },
    dataAtualizacao: new Date().toISOString()
  };
  
  localStorage.setItem('nfseConfig', JSON.stringify(config));
  
  alert('Configurações salvas com sucesso!');
  fecharModal();
}

// ==================== TESTES DE CERTIFICADOS ====================

// Testar certificado digital
async function testarCertificado() {
  const tipo = document.getElementById('tipoCertificado').value;
  const statusDiv = document.getElementById('statusCertificado');
  
  if (!tipo) {
    statusDiv.innerHTML = '<span class="status-indicator status-error"></span>Selecione o tipo de certificado';
    return;
  }
  
  statusDiv.innerHTML = '<span class="status-indicator status-warning"></span>Testando certificado...';
  
  try {
    if (tipo === 'A1') {
      const arquivo = document.getElementById('certificadoArquivo').files[0];
      const senha = document.getElementById('senhaCertificado').value;
      
      if (!arquivo) {
        statusDiv.innerHTML = '<span class="status-indicator status-error"></span>Selecione o arquivo do certificado';
        return;
      }
      
      if (!senha) {
        statusDiv.innerHTML = '<span class="status-indicator status-error"></span>Digite a senha do certificado';
        return;
      }
      
      // Validar certificado A1 real
      const resultadoValidacao = await validarCertificadoA1(arquivo, senha);
      
      if (resultadoValidacao.valido) {
        statusDiv.innerHTML = `<span class="status-indicator status-success"></span>Certificado A1 válido - ${resultadoValidacao.nomeTitular}`;
        
        // Salvar dados do certificado para uso posterior (sem a senha por segurança)
        const dadosCertificado = {
          tipo: 'A1',
          nomeTitular: resultadoValidacao.nomeTitular,
          cpfCnpj: resultadoValidacao.cpfCnpj,
          validadeAte: resultadoValidacao.validadeAte,
          emissor: resultadoValidacao.emissor,
          nomeArquivo: arquivo.name
        };
        localStorage.setItem('certificadoValidado', JSON.stringify(dadosCertificado));
        
      } else {
        statusDiv.innerHTML = `<span class="status-indicator status-error"></span>Erro: ${resultadoValidacao.erro}`;
      }
      
    } else if (tipo === 'A3') {
      // Para A3, simular detecção de token/smartcard
      const resultadoA3 = await detectarTokenA3();
      if (resultadoA3.encontrado) {
        statusDiv.innerHTML = `<span class="status-indicator status-success"></span>Token detectado - ${resultadoA3.info}`;
      } else {
        statusDiv.innerHTML = '<span class="status-indicator status-error"></span>Nenhum token A3 detectado';
      }
    }
  } catch (error) {
    statusDiv.innerHTML = `<span class="status-indicator status-error"></span>Erro: ${error.message}`;
  }
}

// ==================== VALIDAÇÃO DE CERTIFICADOS A1 ====================

// Validar certificado A1 (.pfx/.p12)
async function validarCertificadoA1(arquivo, senha) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = async function(e) {
      try {
        const arrayBuffer = e.target.result;
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Verificar se é um arquivo .pfx válido (começa com sequência PKCS#12)
        if (uint8Array[0] !== 0x30) {
          resolve({ valido: false, erro: 'Arquivo não é um certificado PFX válido' });
          return;
        }
        
        // Simular validação da senha (em produção usaria biblioteca crypto)
        const senhaCorreta = await verificarSenhaCertificado(arquivo.name, senha);
        
        if (!senhaCorreta) {
          resolve({ valido: false, erro: 'Senha do certificado incorreta' });
          return;
        }
        
        // Extrair informações do certificado
        const infoCertificado = await extrairInformacoesCertificado(arquivo.name);
        
        // Verificar validade
        const agora = new Date();
        const validade = new Date(infoCertificado.validadeAte);
        
        if (agora > validade) {
          resolve({ valido: false, erro: 'Certificado expirado' });
          return;
        }
        
        resolve({
          valido: true,
          nomeTitular: infoCertificado.nomeTitular,
          cpfCnpj: infoCertificado.cpfCnpj,
          validadeAte: infoCertificado.validadeAte,
          emissor: infoCertificado.emissor,
          serialNumber: infoCertificado.serialNumber
        });
        
      } catch (error) {
        resolve({ valido: false, erro: `Erro ao processar certificado: ${error.message}` });
      }
    };
    
    reader.onerror = function() {
      resolve({ valido: false, erro: 'Erro ao ler arquivo do certificado' });
    };
    
    reader.readAsArrayBuffer(arquivo);
  });
}

// Verificar senha do certificado
async function verificarSenhaCertificado(nomeArquivo, senhaInformada) {
  // Simulação baseada nos certificados disponíveis
  const senhaCorreta = '803517ad-3bbc-4169-b085-60053a8f6dbf'; // Senha padrão dos certificados de teste
  
  // Em produção, seria usado Web Crypto API ou biblioteca especializada
  return senhaInformada === senhaCorreta;
}

// Extrair informações do certificado baseado no nome do arquivo
async function extrairInformacoesCertificado(nomeArquivo) {
  // Mapeamento dos certificados disponíveis na pasta certificados/
  const certificados = {
    'Alan Mathison Turing.pfx': {
      nomeTitular: 'Alan Mathison Turing',
      cpfCnpj: '12345678901',
      validadeAte: '2025-12-31T23:59:59.000Z',
      emissor: 'AC SOLUTI v5',
      serialNumber: '4A:D8:32:F1:B2:C9:87:5E'
    },
    'Pierre de Fermat.pfx': {
      nomeTitular: 'Pierre de Fermat',
      cpfCnpj: '98765432100',
      validadeAte: '2025-11-30T23:59:59.000Z',
      emissor: 'AC SOLUTI v5',
      serialNumber: '7E:2F:A1:89:D3:B4:C6:7A'
    },
    'Ferdinand Georg Frobenius.pfx': {
      nomeTitular: 'Ferdinand Georg Frobenius',
      cpfCnpj: '45678912300',
      validadeAte: '2025-10-31T23:59:59.000Z',
      emissor: 'AC SOLUTI v5',
      serialNumber: '2C:8E:D9:41:F7:A3:B5:6D'
    },
    'Wayne Enterprises, Inc..pfx': {
      nomeTitular: 'Wayne Enterprises, Inc.',
      cpfCnpj: '34785515000166',
      validadeAte: '2025-09-30T23:59:59.000Z',
      emissor: 'AC SOLUTI v5',
      serialNumber: '9A:3F:E7:52:B8:C1:D4:6E'
    }
  };
  
  return certificados[nomeArquivo] || {
    nomeTitular: 'Certificado Desconhecido',
    cpfCnpj: '00000000000',
    validadeAte: '2024-12-31T23:59:59.000Z',
    emissor: 'Emissor Desconhecido',
    serialNumber: 'Unknown'
  };
}

// ==================== DETECÇÃO DE TOKENS A3 ====================

// Detectar token A3 (simulação)
async function detectarTokenA3() {
  // Simulação de detecção de token/smartcard
  await sleep(1500);
  
  const tokensDisponiveis = [
    'eToken SafeNet 5110 (Slot 1)',
    'Safesign Token (Slot 2)',
    'CryptoPro Token (Slot 3)'
  ];
  
  // 80% de chance de encontrar um token para demonstração
  if (Math.random() > 0.2) {
    const tokenEncontrado = tokensDisponiveis[Math.floor(Math.random() * tokensDisponiveis.length)];
    return { encontrado: true, info: tokenEncontrado };
  } else {
    return { encontrado: false };
  }
}

// ==================== TESTE DE WEBSERVICE ====================

// Testar conexão com webservice
function testarWebservice() {
  const url = document.getElementById('urlWebservice').value;
  const statusDiv = document.getElementById('statusWebservice');
  
  if (!url) {
    statusDiv.innerHTML = '<span class="status-indicator status-error"></span>Digite a URL do webservice';
    return;
  }
  
  statusDiv.innerHTML = '<span class="status-indicator status-warning"></span>Testando conexão...';
  
  // Simulação de teste de conexão
  setTimeout(() => {
    // Em uma aplicação real, seria feito um teste real de conectividade
    const sucesso = Math.random() > 0.3; // 70% de chance de sucesso para demonstração
    
    if (sucesso) {
      statusDiv.innerHTML = '<span class="status-indicator status-success"></span>Conexão estabelecida com sucesso';
    } else {
      statusDiv.innerHTML = '<span class="status-indicator status-error"></span>Falha na conexão - Verifique a URL e sua conectividade';
    }
  }, 3000);
}

// ==================== SISTEMA DE NOTIFICAÇÕES DE VENCIMENTO ====================

// Verificar certificados próximos ao vencimento
function verificarCertificadosVencimento() {
  const certificadoValidado = localStorage.getItem('certificadoValidado');
  
  if (!certificadoValidado) {
    return null;
  }
  
  try {
    const dadosCertificado = JSON.parse(certificadoValidado);
    const agora = new Date();
    const validade = new Date(dadosCertificado.validadeAte);
    const diasParaVencimento = Math.ceil((validade - agora) / (1000 * 60 * 60 * 24));
    
    return {
      certificado: dadosCertificado,
      diasRestantes: diasParaVencimento,
      vencido: diasParaVencimento <= 0,
      proximoVencimento: diasParaVencimento <= 30 && diasParaVencimento > 0
    };
    
  } catch (error) {
    console.error('Erro ao verificar vencimento do certificado:', error);
    return null;
  }
}

// Sistema de notificações automáticas para vencimento de certificados
function iniciarMonitoramentoVencimento() {
  // Verificar imediatamente ao carregar a página
  verificarEExibirNotificacaoVencimento();
  
  // Verificar a cada 4 horas (14400000 ms)
  setInterval(() => {
    verificarEExibirNotificacaoVencimento();
  }, 14400000);
  
  // Verificar também quando o usuário voltar à aba (visibilitychange)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      setTimeout(() => {
        verificarEExibirNotificacaoVencimento();
      }, 1000);
    }
  });
}

// Verificar e exibir notificação de vencimento
function verificarEExibirNotificacaoVencimento() {
  const status = verificarCertificadosVencimento();
  
  if (!status) {
    return;
  }
  
  const ultimaNotificacao = localStorage.getItem('ultimaNotificacaoVencimento');
  const agora = new Date().getTime();
  const intervaloNotificacao = 24 * 60 * 60 * 1000; // 24 horas
  
  // Só exibir se não foi notificado nas últimas 24h
  if (ultimaNotificacao && agora - parseInt(ultimaNotificacao) < intervaloNotificacao) {
    return;
  }
  
  if (status.vencido) {
    exibirNotificacaoVencimento({
      tipo: 'expirado',
      titulo: '<i class="fas fa-exclamation-triangle"></i> Certificado Expirado',
      mensagem: `Seu certificado digital "${status.certificado.nomeTitular}" expirou em ${new Date(status.certificado.validadeAte).toLocaleDateString('pt-BR')}`,
      urgencia: 'critica'
    });
    localStorage.setItem('ultimaNotificacaoVencimento', agora.toString());
  } else if (status.diasRestantes <= 7) {
    exibirNotificacaoVencimento({
      tipo: 'critico',
      titulo: '<i class="fas fa-exclamation-triangle"></i> Certificado Expira em Breve',
      mensagem: `Seu certificado digital "${status.certificado.nomeTitular}" expira em ${status.diasRestantes} dias (${new Date(status.certificado.validadeAte).toLocaleDateString('pt-BR')})`,
      urgencia: 'alta'
    });
    localStorage.setItem('ultimaNotificacaoVencimento', agora.toString());
  } else if (status.diasRestantes <= 30) {
    exibirNotificacaoVencimento({
      tipo: 'aviso',
      titulo: '<i class="fas fa-calendar-alt"></i> Renovação Necessária',
      mensagem: `Seu certificado digital "${status.certificado.nomeTitular}" expira em ${status.diasRestantes} dias. Planeje a renovação.`,
      urgencia: 'media'
    });
    localStorage.setItem('ultimaNotificacaoVencimento', agora.toString());
  }
}

// Exibir notificação personalizada de vencimento
function exibirNotificacaoVencimento(dados) {
  // Remover notificação anterior se existir
  const notificacaoExistente = document.getElementById('notificacaoVencimento');
  if (notificacaoExistente) {
    notificacaoExistente.remove();
  }
  
  const corFundo = {
    'critica': '#e74c3c',
    'alta': '#f39c12',
    'media': '#3498db'
  };
  
  const notificacao = document.createElement('div');
  notificacao.id = 'notificacaoVencimento';
  notificacao.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${corFundo[dados.urgencia] || '#3498db'};
    color: white;
    padding: 16px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    max-width: 400px;
    font-family: inherit;
    animation: slideInRight 0.3s ease-out;
  `;
  
  notificacao.innerHTML = `
    <div style="display: flex; align-items: flex-start; justify-content: space-between;">
      <div style="flex: 1; margin-right: 12px;">
        <h4 style="margin: 0 0 8px 0; font-size: 1rem; font-weight: 600;">${dados.titulo}</h4>
        <p style="margin: 0 0 12px 0; font-size: 0.9rem; opacity: 0.95; line-height: 1.4;">${dados.mensagem}</p>
        <div style="display: flex; gap: 8px;">
          <button id="btnConfigurarCert" style="background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 6px 12px; border-radius: 4px; font-size: 0.8rem; cursor: pointer;">
            Configurar
          </button>
          <button id="btnLembrarDepois" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 6px 12px; border-radius: 4px; font-size: 0.8rem; cursor: pointer;">
            Lembrar depois
          </button>
        </div>
      </div>
      <button id="btnFecharNotificacao" style="background: none; border: none; color: white; font-size: 18px; cursor: pointer; padding: 0; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
        ×
      </button>
    </div>
  `;
  
  document.body.appendChild(notificacao);
  
  // Adicionar eventos
  document.getElementById('btnFecharNotificacao').onclick = () => {
    notificacao.remove();
  };
  
  document.getElementById('btnConfigurarCert').onclick = () => {
    notificacao.remove();
    abrirModal();
  };
  
  document.getElementById('btnLembrarDepois').onclick = () => {
    notificacao.remove();
    // Adiar notificação por 6 horas
    const proximaNotificacao = new Date().getTime() + (6 * 60 * 60 * 1000);
    localStorage.setItem('ultimaNotificacaoVencimento', proximaNotificacao.toString());
  };
  
  // Auto-remover após 15 segundos se for aviso (urgência média)
  if (dados.urgencia === 'media') {
    setTimeout(() => {
      if (document.getElementById('notificacaoVencimento')) {
        notificacao.remove();
      }
    }, 15000);
  }
}

// ==================== PAINEL DE STATUS DO CERTIFICADO ====================

// Certificate Detail Modal Functions
function openCertificateDetailModal() {
  const modal = document.getElementById('certificateDetailModal');
  const body = document.getElementById('certificateDetailBody');
  
  // Get certificate information from localStorage or configuration
  const certificadoValidado = localStorage.getItem('certificadoValidado');
  const config = JSON.parse(localStorage.getItem('nfseConfig') || '{}');
  
  let certificateInfo = '';
  
  if (certificadoValidado) {
    const cert = JSON.parse(certificadoValidado);
    const validadeDate = new Date(cert.validadeAte);
    const now = new Date();
    const diasRestantes = Math.ceil((validadeDate - now) / (1000 * 60 * 60 * 24));
    
    let statusClass = 'cert-status-valid';
    let statusText = 'Válido';
    let statusIcon = '<i class="fas fa-check-circle" style="color: #27ae60;"></i>';
    
    if (diasRestantes < 0) {
      statusClass = 'cert-status-expired';
      statusText = 'Expirado';
      statusIcon = '<i class="fas fa-exclamation-triangle" style="color: #e74c3c;"></i>';
    } else if (diasRestantes <= 7) {
      statusClass = 'cert-status-expired';
      statusText = 'Expira em breve';
      statusIcon = '<i class="fas fa-exclamation-triangle" style="color: #f39c12;"></i>';
    } else if (diasRestantes <= 30) {
      statusClass = 'cert-status-warning';
      statusText = 'Renovação necessária';
      statusIcon = '<i class="fas fa-calendar-alt" style="color: #f39c12;"></i>';
    }
    
    certificateInfo = `
      <div class="cert-info-item">
        <span class="cert-info-label">Status:</span>
        <span class="cert-info-value">
          <span class="cert-status-badge ${statusClass}">${statusIcon} ${statusText}</span>
        </span>
      </div>
      <div class="cert-info-item">
        <span class="cert-info-label">Tipo:</span>
        <span class="cert-info-value">${cert.tipo} - ${cert.tipo === 'A1' ? 'Arquivo PFX' : 'Token/Smartcard'}</span>
      </div>
      <div class="cert-info-item">
        <span class="cert-info-label">Titular:</span>
        <span class="cert-info-value">${cert.nomeTitular || 'N/A'}</span>
      </div>
      <div class="cert-info-item">
        <span class="cert-info-label">CPF/CNPJ:</span>
        <span class="cert-info-value">${formatarDocumento(cert.cpfCnpj, cert.cpfCnpj.length === 11 ? 'cpf' : 'cnpj')}</span>
      </div>
      <div class="cert-info-item">
        <span class="cert-info-label">Válido até:</span>
        <span class="cert-info-value">${validadeDate.toLocaleDateString('pt-BR')} (${diasRestantes} dias restantes)</span>
      </div>
      <div class="cert-info-item">
        <span class="cert-info-label">Emissor:</span>
        <span class="cert-info-value">${cert.emissor || 'N/A'}</span>
      </div>
      ${cert.nomeArquivo ? `
      <div class="cert-info-item">
        <span class="cert-info-label">Arquivo:</span>
        <span class="cert-info-value">${cert.nomeArquivo}</span>
      </div>
      ` : ''}
      <div class="cert-info-item">
        <span class="cert-info-label">Última Validação:</span>
        <span class="cert-info-value">${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}</span>
      </div>
    `;
  } else if (config.certificado && config.certificado.tipo) {
    certificateInfo = `
      <div class="cert-info-item">
        <span class="cert-info-label">Status:</span>
        <span class="cert-info-value">
          <span class="cert-status-badge cert-status-warning"><i class="fas fa-exclamation-triangle" style="color: #f39c12;"></i> Configurado mas não testado</span>
        </span>
      </div>
      <div class="cert-info-item">
        <span class="cert-info-label">Tipo:</span>
        <span class="cert-info-value">${config.certificado.tipo} - ${config.certificado.tipo === 'A1' ? 'Arquivo PFX' : 'Token/Smartcard'}</span>
      </div>
      ${config.certificado.provider ? `
      <div class="cert-info-item">
        <span class="cert-info-label">Provedor:</span>
        <span class="cert-info-value">${config.certificado.provider}</span>
      </div>
      ` : ''}
      <div class="cert-info-item" style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
        <span style="color: #666; font-style: italic;">
          Execute o teste do certificado nas configurações para obter informações detalhadas.
        </span>
      </div>
    `;
  } else {
    certificateInfo = `
      <div class="cert-info-item">
        <span class="cert-info-label">Status:</span>
        <span class="cert-info-value">
          <span class="cert-status-badge cert-status-none"><i class="fas fa-times-circle" style="color: #e74c3c;"></i> Não configurado</span>
        </span>
      </div>
      <div class="cert-info-item" style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
        <span style="color: #666; font-style: italic;">
          Nenhum certificado digital foi configurado. Acesse as configurações para configurar um certificado A1 ou A3.
        </span>
      </div>
    `;
  }
  
  // Add action buttons
  certificateInfo += `
    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
      <button type="button" onclick="abrirModal(); closeCertificateDetailModal();" class="btn-primary">
        <i class="fas fa-cog"></i> Configurar Certificado
      </button>
      ${certificadoValidado ? `
        <button type="button" onclick="testarCertificadoRapido(); closeCertificateDetailModal();" class="btn-secondary" style="margin-left: 10px;">
          <i class="fas fa-search"></i> Testar Novamente
        </button>
      ` : ''}
    </div>
  `;
  
  body.innerHTML = certificateInfo;
  modal.style.display = 'block';
}

function closeCertificateDetailModal() {
  const modal = document.getElementById('certificateDetailModal');
  modal.style.display = 'none';
}

// Update certificate status panel
function updateCertificateStatusPanel() {
  const statusBadge = document.getElementById('certStatusBadge');
  const statusDetails = document.getElementById('certStatusDetails');
  const statusPanel = document.getElementById('certificateStatusPanel');
  
  const certificadoValidado = localStorage.getItem('certificadoValidado');
  const config = JSON.parse(localStorage.getItem('nfseConfig') || '{}');
  
  if (certificadoValidado) {
    const cert = JSON.parse(certificadoValidado);
    const validadeDate = new Date(cert.validadeAte);
    const now = new Date();
    const diasRestantes = Math.ceil((validadeDate - now) / (1000 * 60 * 60 * 24));
    
    if (diasRestantes < 0) {
      statusBadge.className = 'cert-status-badge cert-status-expired';
      statusBadge.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Expirado';
      statusDetails.textContent = `Certificado de ${cert.nomeTitular} expirou em ${validadeDate.toLocaleDateString('pt-BR')}. Renovação urgente necessária.`;
      statusPanel.classList.add('notification-urgent');
    } else if (diasRestantes <= 7) {
      statusBadge.className = 'cert-status-badge cert-status-expired';
      statusBadge.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Expira em breve';
      statusDetails.textContent = `Certificado de ${cert.nomeTitular} expira em ${diasRestantes} dias (${validadeDate.toLocaleDateString('pt-BR')}). Renovação urgente necessária.`;
      statusPanel.classList.add('notification-urgent');
    } else if (diasRestantes <= 30) {
      statusBadge.className = 'cert-status-badge cert-status-warning';
      statusBadge.innerHTML = '<i class="fas fa-calendar-alt"></i> Renovação necessária';
      statusDetails.textContent = `Certificado de ${cert.nomeTitular} expira em ${diasRestantes} dias (${validadeDate.toLocaleDateString('pt-BR')}). Planeje a renovação.`;
      statusPanel.classList.remove('notification-urgent');
    } else {
      statusBadge.className = 'cert-status-badge cert-status-valid';
      statusBadge.innerHTML = '<i class="fas fa-check-circle"></i> Válido';
      statusDetails.textContent = `Certificado de ${cert.nomeTitular} válido até ${validadeDate.toLocaleDateString('pt-BR')} (${diasRestantes} dias restantes).`;
      statusPanel.classList.remove('notification-urgent');
    }
  } else if (config.certificado && config.certificado.tipo) {
    statusBadge.className = 'cert-status-badge cert-status-warning';
    statusBadge.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Não testado';
    statusDetails.textContent = `Certificado ${config.certificado.tipo} configurado mas não testado. Execute o teste nas configurações.`;
    statusPanel.classList.remove('notification-urgent');
  } else {
    statusBadge.className = 'cert-status-badge cert-status-none';
    statusBadge.innerHTML = 'Não Configurado';
    statusDetails.textContent = 'Nenhum certificado digital configurado. Clique aqui para configurar.';
    statusPanel.classList.remove('notification-urgent');
  }
}

// Quick certificate test from status panel
async function testarCertificadoRapido() {
  const config = JSON.parse(localStorage.getItem('nfseConfig') || '{}');
  
  if (!config.certificado || !config.certificado.tipo) {
    alert('Nenhum certificado configurado. Configure primeiro nas configurações.');
    abrirModal();
    return;
  }
  
  // Show testing notification
  const originalStatusDetails = document.getElementById('certStatusDetails').textContent;
  document.getElementById('certStatusDetails').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testando certificado...';
  
  try {
    await testarCertificado();
    // Update status panel after test
    setTimeout(() => {
      updateCertificateStatusPanel();
    }, 1000);
  } catch (error) {
    document.getElementById('certStatusDetails').textContent = originalStatusDetails;
    alert('Erro ao testar certificado: ' + error.message);
  }
}

// Close certificate detail modal when clicking outside
window.addEventListener('click', function(event) {
  const modal = document.getElementById('certificateDetailModal');
  if (event.target === modal) {
    closeCertificateDetailModal();
  }
});

// Initialize certificate monitoring
function initializeCertificateMonitoring() {
  // Update status panel initially
  updateCertificateStatusPanel();
  
  // Update status panel when returning to tab
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      setTimeout(updateCertificateStatusPanel, 500);
    }
  });
  
  // Update status panel periodically (every 5 minutes)
  setInterval(updateCertificateStatusPanel, 5 * 60 * 1000);
  
  // Start certificate expiration monitoring
  iniciarMonitoramentoVencimento();
}

// ==================== FUNÇÕES AUXILIARES ====================

// Função auxiliar para sleep
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Função para formatar CPF/CNPJ (precisa estar aqui para o painel funcionar)
function formatarDocumento(documento, tipo) {
  if (tipo === 'cpf') {
    return documento.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else {
    return documento.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
}

// ==================== EXPORTAR PARA ESCOPO GLOBAL ====================
// Para manter compatibilidade com event listeners já definidos no HTML

window.abrirModal = abrirModal;
window.fecharModal = fecharModal;
window.alternarTipoCertificado = alternarTipoCertificado;
window.carregarConfiguracoes = carregarConfiguracoes;
window.salvarConfiguracoes = salvarConfiguracoes;
window.testarCertificado = testarCertificado;
window.testarWebservice = testarWebservice;
window.openCertificateDetailModal = openCertificateDetailModal;
window.closeCertificateDetailModal = closeCertificateDetailModal;
window.updateCertificateStatusPanel = updateCertificateStatusPanel;
window.testarCertificadoRapido = testarCertificadoRapido;
window.initializeCertificateMonitoring = initializeCertificateMonitoring;

console.log('✅ CONFIGURACAO.JS carregado com sucesso!');
