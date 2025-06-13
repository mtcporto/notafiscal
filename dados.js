// ==================================================
// DADOS.JS - Sistema de Gerenciamento de Dados da NFS-e
// ==================================================
// Responsável por:
// - Validação de formulários
// - Dados mocados para testes
// - Formatação de documentos (CPF/CNPJ)
// - Formatação de valores monetários
// - Atualização de placeholders
// - Validações específicas por aba
// - Auto-avanço entre abas
// - Controle de formulários
// ==================================================

// ==================== VALIDAÇÃO PRINCIPAL ====================

// Função principal para validar formulário
function validarFormulario() {
  let isValid = true;
  const requiredFields = [
    'razaoPrestador',
    'cnpjPrestador', 
    'imPrestador',
    'tipoDocTomador',
    'docTomador',
    'razaoTomador',
    'itemServico',
    'descricao',
    'valor',
    'aliquota',
    'issRetido'
  ];

  // Remover classes de erro anteriores
  document.querySelectorAll('.error').forEach(field => {
    field.classList.remove('error');
  });

  // Validar cada campo obrigatório
  requiredFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field && (!field.value || field.value.trim() === '')) {
      field.classList.add('error');
      isValid = false;
    }
  });

  // Validar formato do CNPJ (básico)
  const cnpj = document.getElementById('cnpjPrestador').value;
  if (cnpj && cnpj.length < 14) {
    document.getElementById('cnpjPrestador').classList.add('error');
    isValid = false;
  }

  return isValid;
}

// Validar aba específica
function validarAba(aba) {
  const camposPorAba = {
    prestador: ['razaoPrestador', 'cnpjPrestador', 'imPrestador'],
    tomador: ['tipoDocTomador', 'docTomador', 'razaoTomador'],
    servico: ['itemServico', 'descricao', 'valor', 'aliquota', 'issRetido']
  };

  const campos = camposPorAba[aba] || [];
  let valido = true;

  campos.forEach(campoId => {
    const campo = document.getElementById(campoId);
    if (campo && (!campo.value || campo.value.trim() === '')) {
      valido = false;
    }
  });

  return valido;
}

// Auto-avanço para próxima aba
function autoAdvanceTab() {
  const abas = ['prestador', 'tomador', 'servico'];
  
  for (let i = 0; i < abas.length; i++) {
    if (!validarAba(abas[i])) {
      return; // Para no primeiro que não estiver válido
    }
    
    // Se chegou até aqui e é a última aba válida, vai para XML
    if (i === abas.length - 1) {
      switchTab('xml');
      return;
    }
  }
}

// ==================== DADOS MOCADOS ====================

// Função para preencher com dados de teste
function preencherDadosMocados() {
  // Dados do Prestador
  document.getElementById('razaoPrestador').value = 'Tech Solutions Consultoria LTDA';
  document.getElementById('cnpjPrestador').value = '12.345.678/0001-90';
  document.getElementById('imPrestador').value = '123456789';

  // Dados do Tomador
  document.getElementById('tipoDocTomador').value = 'cnpj';
  document.getElementById('docTomador').value = '98.765.432/0001-10';
  document.getElementById('razaoTomador').value = 'Empresa Cliente Exemplo S.A.';
  document.getElementById('emailTomador').value = 'contato@cliente.com.br';  // Dados do Serviço
  document.getElementById('itemServico').value = '01.01';  // Análise, Desenvolvimento de Sistemas
  document.getElementById('descricao').value = 'Desenvolvimento de sistema web personalizado para gestão empresarial, incluindo módulos de vendas, estoque e relatórios gerenciais.';
  document.getElementById('valor').value = '15000.00';  // Valor numérico sem formatação
  document.getElementById('aliquota').value = '0.05';   // Valor decimal para 5%
  document.getElementById('issRetido').value = '2';
  // Atualizar placeholder do documento
  atualizarPlaceholderDocumento();
  
  // Aplicar máscaras aos campos preenchidos (apenas para campos de texto)
  aplicarMascaraDocumento(document.getElementById('cnpjPrestador'));
  aplicarMascaraDocumento(document.getElementById('docTomador'));
  // Não aplicar máscara no campo valor pois é type="number"
  // Não aplicar máscara no campo aliquota pois é select

  alert('✅ Dados de teste preenchidos com sucesso!');
}

// ==================== FORMATAÇÃO E MÁSCARAS ====================

// Formatação de documentos (CPF/CNPJ)
function formatarDocumento(documento, tipo) {
  if (!documento) return '';
  
  // Remove caracteres não numéricos
  const numeros = documento.replace(/\D/g, '');
  
  if (tipo === 'cpf') {
    return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else {
    return numeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
}

// Aplicar máscara durante digitação para documentos
function aplicarMascaraDocumento(elemento) {
  elemento.addEventListener('input', function(e) {
    let valor = e.target.value.replace(/\D/g, '');
    const tipoDoc = document.getElementById('tipoDocTomador')?.value;
    
    if (elemento.id === 'cnpjPrestador' || (elemento.id === 'docTomador' && tipoDoc === 'cnpj')) {
      // Máscara CNPJ
      valor = valor.replace(/(\d{2})(\d)/, '$1.$2');
      valor = valor.replace(/(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
      valor = valor.replace(/\.(\d{3})(\d)/, '.$1/$2');
      valor = valor.replace(/(\d{4})(\d)/, '$1-$2');
    } else if (elemento.id === 'docTomador' && tipoDoc === 'cpf') {
      // Máscara CPF
      valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
      valor = valor.replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
      valor = valor.replace(/\.(\d{3})(\d)/, '.$1-$2');
    }
    
    e.target.value = valor;
  });
}

// Formatação de valores monetários
function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
}

// Aplicar máscara para valores monetários
function aplicarMascaraMoeda(elemento) {
  elemento.addEventListener('input', function(e) {
    let valor = e.target.value.replace(/\D/g, '');
    valor = (valor / 100).toFixed(2) + '';
    valor = valor.replace(".", ",");
    valor = valor.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
    e.target.value = valor;
  });
}

// Aplicar máscara para porcentagem
function aplicarMascaraPorcentagem(elemento) {
  elemento.addEventListener('input', function(e) {
    let valor = e.target.value.replace(/[^\d,]/g, '');
    
    // Garantir que não ultrapasse 100
    const valorNumerico = parseFloat(valor.replace(',', '.'));
    if (valorNumerico > 100) {
      valor = '100,00';
    }
    
    e.target.value = valor;
  });
}

// ==================== VALIDAÇÕES ESPECÍFICAS ====================

// Validação de CPF
function validarCPF(cpf) {
  cpf = cpf.replace(/\D/g, '');
  if (cpf.length !== 11) return false;
  
  // Verificar se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  
  // Validar dígitos verificadores
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(9))) return false;
  
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(10))) return false;
  
  return true;
}

// Validação de CNPJ
function validarCNPJ(cnpj) {
  cnpj = cnpj.replace(/\D/g, '');
  if (cnpj.length !== 14) return false;
  
  // Verificar se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cnpj)) return false;
  
  // Validar primeiro dígito verificador
  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0, tamanho);
  let digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
  if (resultado !== parseInt(digitos.charAt(0))) return false;
  
  // Validar segundo dígito verificador
  tamanho = tamanho + 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }
  
  resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
  if (resultado !== parseInt(digitos.charAt(1))) return false;
  
  return true;
}

// ==================== LISTA DE SERVIÇOS ====================

// Função para obter descrição do serviço pelo código
function obterDescricaoServico(codigo) {
  const servicos = {
    '01.01': 'Análise e desenvolvimento de sistemas',
    '01.02': 'Programação',
    '01.03': 'Processamento de dados',
    '01.04': 'Elaboração de programas de computadores',
    '01.05': 'Licenciamento ou cessão de direito de uso de programas',
    '07.02': 'Consultoria em tecnologia da informação',
    '07.09': 'Suporte técnico em informática',
    '17.01': 'Assessoria ou consultoria de qualquer natureza',
    '17.02': 'Análise, exame, pesquisa, coleta, compilação',
    '25.01': 'Funerais, inclusive fornecimento de caixão'
  };
  
  return servicos[codigo] || '';
}

// ==================== FUNÇÕES AUXILIARES ====================

// Limpar formatação de documento
function limparFormatacaoDocumento(documento) {
  return documento.replace(/\D/g, '');
}

// Limpar formatação de valor monetário
function limparFormatacaoMoeda(valor) {
  return parseFloat(valor.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
}

// Verificar se formulário tem dados preenchidos
function formularioTemDados() {
  const campos = [
    'razaoPrestador', 'cnpjPrestador', 'imPrestador',
    'docTomador', 'razaoTomador',
    'itemServico', 'descricao', 'valor'
  ];
  
  return campos.some(campo => {
    const elemento = document.getElementById(campo);
    return elemento && elemento.value.trim() !== '';
  });
}

// ==================== COLETA E ESTRUTURAÇÃO DE DADOS ====================

// Coletar todos os dados do formulário estruturados
function coletarTodosDados() {
  return {
    prestador: {
      razaoSocial: document.getElementById('razaoPrestador').value,
      cnpj: limparFormatacaoDocumento(document.getElementById('cnpjPrestador').value),
      cnpjFormatado: document.getElementById('cnpjPrestador').value,
      inscricaoMunicipal: document.getElementById('imPrestador').value
    },
    tomador: {
      tipoDocumento: document.getElementById('tipoDocTomador').value,
      documento: limparFormatacaoDocumento(document.getElementById('docTomador').value),
      documentoFormatado: document.getElementById('docTomador').value,
      razaoSocial: document.getElementById('razaoTomador').value,
      email: document.getElementById('emailTomador').value
    },
    servico: {
      codigo: document.getElementById('itemServico').value,
      descricao: document.getElementById('descricao').value,
      valor: limparFormatacaoMoeda(document.getElementById('valor').value),
      valorFormatado: document.getElementById('valor').value,
      aliquota: parseFloat(document.getElementById('aliquota').value) / 100, // Converter para decimal
      aliquotaPercent: document.getElementById('aliquota').value,
      issRetido: document.getElementById('issRetido').value === '1'
    },
    timestamp: new Date().toISOString()
  };
}

// Preencher formulário com dados estruturados
function preencherFormulario(dados) {
  // Prestador
  if (dados.prestador) {
    document.getElementById('razaoPrestador').value = dados.prestador.razaoSocial || '';
    document.getElementById('cnpjPrestador').value = dados.prestador.cnpjFormatado || formatarDocumento(dados.prestador.cnpj, 'cnpj');
    document.getElementById('imPrestador').value = dados.prestador.inscricaoMunicipal || '';
  }
  
  // Tomador
  if (dados.tomador) {
    document.getElementById('tipoDocTomador').value = dados.tomador.tipoDocumento || 'cnpj';
    document.getElementById('docTomador').value = dados.tomador.documentoFormatado || formatarDocumento(dados.tomador.documento, dados.tomador.tipoDocumento);
    document.getElementById('razaoTomador').value = dados.tomador.razaoSocial || '';
    document.getElementById('emailTomador').value = dados.tomador.email || '';
  }
  
  // Serviço
  if (dados.servico) {
    document.getElementById('itemServico').value = dados.servico.codigo || '';
    document.getElementById('descricao').value = dados.servico.descricao || '';
    document.getElementById('valor').value = dados.servico.valorFormatado || formatarMoeda(dados.servico.valor);
    document.getElementById('aliquota').value = dados.servico.aliquotaPercent || (dados.servico.aliquota * 100).toFixed(2);
    document.getElementById('issRetido').value = dados.servico.issRetido ? '1' : '2';
  }
  
  // Atualizar placeholder
  atualizarPlaceholderDocumento();
}

// ==================== CONTROLE DE FORMULÁRIO ====================

// Função para atualizar placeholder do documento
function atualizarPlaceholderDocumento() {
  const tipoDoc = document.getElementById('tipoDocTomador').value;
  const inputDoc = document.getElementById('docTomador');
  
  if (tipoDoc === 'cpf') {
    inputDoc.placeholder = '000.000.000-00';
    inputDoc.maxLength = 14;
  } else {
    inputDoc.placeholder = '00.000.000/0001-00';
    inputDoc.maxLength = 18;
  }
}

// Função para limpar todos os campos do formulário
function limparFormulario() {
  // Limpar todos os formulários das abas
  const forms = ['nfse-form-prestador', 'nfse-form-tomador', 'nfse-form-servico'];
  forms.forEach(formId => {
    const form = document.getElementById(formId);
    if (form) {
      form.reset();
    }
  });
  
  // Limpar campos específicos que podem não estar nos forms
  document.getElementById('descricao').value = '';
  
  // Limpar XML usando função do xml.js
  if (typeof limparXML === 'function') {
    limparXML();
  }
  
  document.getElementById('validationResults').style.display = 'none';
  
  // Não precisa mais ocultar botões XML aqui - limparXML() já faz isso
  const elementsToHide = [
    'dadosResumo', 'btnNovaRps'
  ];
  elementsToHide.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.style.display = 'none';
    }
  });
  
  // Voltar para primeira aba
  if (typeof switchTab === 'function') {
    switchTab('prestador');
  }
  
  // Atualizar progresso das abas
  if (typeof updateTabProgress === 'function') {
    updateTabProgress();
  }
}

// ==================== EXPORTAR PARA ESCOPO GLOBAL ====================
// Para manter compatibilidade com event listeners já definidos no HTML

window.validarFormulario = validarFormulario;
window.validarAba = validarAba;
window.autoAdvanceTab = autoAdvanceTab;
window.preencherDadosMocados = preencherDadosMocados;
window.formatarDocumento = formatarDocumento;
window.aplicarMascaraDocumento = aplicarMascaraDocumento;
window.formatarMoeda = formatarMoeda;
window.aplicarMascaraMoeda = aplicarMascaraMoeda;
window.aplicarMascaraPorcentagem = aplicarMascaraPorcentagem;
window.atualizarPlaceholderDocumento = atualizarPlaceholderDocumento;
window.validarCPF = validarCPF;
window.validarCNPJ = validarCNPJ;
window.obterDescricaoServico = obterDescricaoServico;
window.limparFormatacaoDocumento = limparFormatacaoDocumento;
window.limparFormatacaoMoeda = limparFormatacaoMoeda;
window.formularioTemDados = formularioTemDados;
window.coletarTodosDados = coletarTodosDados;
window.preencherFormulario = preencherFormulario;
window.limparFormulario = limparFormulario;

console.log('✅ DADOS.JS carregado com sucesso!');