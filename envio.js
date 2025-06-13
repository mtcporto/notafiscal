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
  const xmlContent = document.getElementById('xmlOutput').textContent;
  
  if (!xmlContent || xmlContent === 'Preencha o formulário e clique em "Gerar XML" para ver o resultado...') {
    alert('Gere um XML primeiro antes de enviar.');
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
    const resultado = await simularEnvioWebservice(xmlContent, config);
    exibirResultadoEnvio(resultado);
    
    // Incrementar número RPS se configurado como automático
    if (config.geral && config.geral.numeracaoRps === 'automatica') {
      incrementarNumeroRps();
    }
    
  } catch (error) {
    exibirErroEnvio(error);
  }
}

// ==================== SIMULAÇÃO DO WEBSERVICE ====================

// Simular envio para webservice com integração real de certificado
async function simularEnvioWebservice(xml, config) {
  // Passo 1: Validação (1 segundo) - primeiro deixa o loading, depois marca como concluído
  await sleep(1000);
  atualizarPassoEnvio(0, '<i class="fas fa-check-circle" style="color: #4caf50;"></i>', '#4caf50');
  
  // Passo 2: Assinatura Digital com certificado real (2 segundos)
  await sleep(2000);
  
  try {
    const resultadoAssinatura = await aplicarAssinaturaDigital(xml, config);
    
    if (!resultadoAssinatura.sucesso) {
      atualizarPassoEnvio(1, '<i class="fas fa-times-circle" style="color: #e74c3c;"></i>', '#e74c3c');
      throw new Error(`Erro na assinatura digital: ${resultadoAssinatura.erro}`);
    }
    
    atualizarPassoEnvio(1, '<i class="fas fa-check-circle" style="color: #4caf50;"></i>', '#4caf50');
    
    // Passo 3: Envio (3 segundos)
    await sleep(3000);
    
    // Simular possível erro de conectividade (5% de chance - reduzido)
    if (Math.random() < 0.05) {
      atualizarPassoEnvio(2, '<i class="fas fa-times-circle" style="color: #e74c3c;"></i>', '#e74c3c');
      throw new Error('Erro de conectividade: Não foi possível conectar ao webservice da prefeitura');
    }
    
    atualizarPassoEnvio(2, '<i class="fas fa-check-circle" style="color: #4caf50;"></i>', '#4caf50');
    
    // Passo 4: Recebimento do protocolo (1 segundo)
    await sleep(1000);
    
    // Simular possível erro de validação do lado da prefeitura (3% de chance - reduzido)
    if (Math.random() < 0.03) {
      atualizarPassoEnvio(3, '<i class="fas fa-times-circle" style="color: #e74c3c;"></i>', '#e74c3c');
      const erros = [
        'CNPJ do prestador não habilitado para emissão de NFS-e',
        'Valor do serviço incompatível com a alíquota informada',
        'Código de serviço não encontrado na lista municipal',
        'Inscrição Municipal inválida ou inexistente',
        'Tomador com restrições no cadastro municipal'
      ];
      const erroAleatorio = erros[Math.floor(Math.random() * erros.length)];
      throw new Error(`Erro de validação: ${erroAleatorio}`);
    }
    
    atualizarPassoEnvio(3, '<i class="fas fa-check-circle" style="color: #4caf50;"></i>', '#4caf50');
    
    // Sucesso - gerar dados do protocolo
    const protocolo = gerarNumeroProtocolo();
    const numeroNfse = gerarNumeroNfse();
    
    return {
      sucesso: true,
      protocolo: protocolo,
      numeroNfse: numeroNfse,
      dataProcessamento: new Date().toISOString(),
      linkConsulta: `https://nfse.joaopessoa.pb.gov.br/consulta/${protocolo}`,
      linkDanfse: `https://nfse.joaopessoa.pb.gov.br/danfse/${numeroNfse}`,
      codigoVerificacao: gerarCodigoVerificacao(),
      certificadoUsado: resultadoAssinatura.certificadoInfo
    };
    
  } catch (error) {
    // Se chegou aqui, é erro de assinatura
    throw error;
  }
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

// Assinar com certificado A1
async function assinarComCertificadoA1(xml, dadosCertificado) {
  // Simular processo de assinatura
  await sleep(1500);
  
  // Verificar se o certificado ainda está válido
  const agora = new Date();
  const validade = new Date(dadosCertificado.validadeAte);
  
  if (agora > validade) {
    return { 
      sucesso: false, 
      erro: 'Certificado expirado. Validade até: ' + validade.toLocaleDateString('pt-BR') 
    };
  }
  
  // Simular possível erro de certificado corrompido (2% de chance)
  if (Math.random() < 0.02) {
    return { 
      sucesso: false, 
      erro: 'Certificado corrompido ou inacessível' 
    };
  }
  
  // Sucesso na assinatura
  return {
    sucesso: true,
    certificadoInfo: {
      titular: dadosCertificado.nomeTitular,
      cpfCnpj: dadosCertificado.cpfCnpj,
      emissor: dadosCertificado.emissor,
      validade: dadosCertificado.validadeAte,
      tipo: 'A1'
    },
    hashAssinatura: gerarHashAssinatura(),
    timestampAssinatura: new Date().toISOString()
  };
}

// Assinar com token A3
async function assinarComTokenA3(xml, provider) {
  // Simular processo de assinatura com token
  await sleep(2000);
  
  // Simular possível erro de token não conectado (8% de chance)
  if (Math.random() < 0.08) {
    return { 
      sucesso: false, 
      erro: 'Token A3 não conectado ou PIN incorreto' 
    };
  }
  
  // Simular possível erro de driver (3% de chance)
  if (Math.random() < 0.03) {
    return { 
      sucesso: false, 
      erro: `Driver do provedor ${provider || 'padrão'} não instalado ou desatualizado` 
    };
  }
  
  // Sucesso na assinatura
  return {
    sucesso: true,
    certificadoInfo: {
      titular: 'Certificado Token A3',
      tipo: 'A3',
      provider: provider || 'Detectado automaticamente',
      slot: 'Slot 1'
    },
    hashAssinatura: gerarHashAssinatura(),
    timestampAssinatura: new Date().toISOString()
  };
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
window.simularEnvioWebservice = simularEnvioWebservice;
window.aplicarAssinaturaDigital = aplicarAssinaturaDigital;
window.assinarComCertificadoA1 = assinarComCertificadoA1;
window.assinarComTokenA3 = assinarComTokenA3;
window.validarCertificadoParaEnvio = validarCertificadoParaEnvio;
window.obterMensagemErroAssinatura = obterMensagemErroAssinatura;
window.gerarHashAssinatura = gerarHashAssinatura;
window.sleep = sleep;

console.log('✅ ENVIO.JS carregado com sucesso!');
