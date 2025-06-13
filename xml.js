// ==================================================
// XML.JS - Sistema de Geração e Manipulação de XML da NFS-e
// ==================================================
// Responsável por:
// - Geração do XML da NFS-e
// - Validação offline do XML
// - Toggle de visualização do XML
// - Funções auxiliares de formatação
// - Exportação/salvamento do XML
// ==================================================

// ==================== GERAÇÃO DO XML ====================

// Função principal para gerar XML da NFS-e
function gerarXML() {
  console.log('🚀 Função gerarXML chamada'); // Debug
  
  // Verificar se a função de validação existe
  if (typeof validarFormulario !== 'function') {
    console.error('❌ Função validarFormulario não encontrada');
    alert('Erro: Função de validação não carregada. Verifique se todos os módulos foram carregados.');
    return;
  }
  
  console.log('✅ Validando formulário...'); // Debug
  
  if (!validarFormulario()) {
    console.log('❌ Validação falhou'); // Debug
    document.getElementById('validationResults').innerHTML = 
      '<div class="validation-error">Corrija os erros no formulário antes de gerar o XML.</div>';
    document.getElementById('validationResults').style.display = 'block';
    return;
  }

  console.log('✅ Formulário válido, coletando dados...'); // Debug

  // Coletar dados do formulário
  const dados = coletarDadosFormulario();
  console.log('📋 Dados coletados:', dados); // Debug

  // Calcular valores
  const valorServico = dados.servico.valor;
  const valorIss = valorServico * dados.servico.aliquota;
  const valorLiquido = valorServico - (dados.servico.issRetido === '1' ? valorIss : 0);

  // Obter configurações para numeração
  const config = JSON.parse(localStorage.getItem('nfseConfig') || '{}');
  const numeroRps = config.geral ? (config.geral.proximoNumero || 1) : 1;
  const serieRps = config.geral ? (config.geral.serie || 'A1') : 'A1';

  console.log('⚙️ Gerando XML...'); // Debug

  // Gerar XML
  const xml = construirXMLNFSe(dados, valorServico, valorIss, valorLiquido, numeroRps, serieRps);

  console.log('📄 XML gerado, atualizando interface...'); // Debug

  // Exibir resumo dos dados (função externa)
  if (typeof gerarResumo === 'function') {
    const resumoHtml = gerarResumo(dados);
    const resumoElement = document.querySelector('#dadosResumo .resumo-content');
    if (resumoElement) {
      resumoElement.innerHTML = resumoHtml;
      document.getElementById('dadosResumo').style.display = 'block';
    }
  }

  // Exibir XML na tela (inicialmente oculto para posterior auto-display no switchTab)
  const xmlOutputElement = document.getElementById('xmlOutput');
  if (xmlOutputElement) {
    xmlOutputElement.textContent = xml;
    xmlOutputElement.style.display = 'none';
  }

  // Mostrar botões relacionados ao XML
  mostrarBotoesXML();

  // Exibir mensagem de sucesso
  const validationResults = document.getElementById('validationResults');
  if (validationResults) {
    validationResults.innerHTML = 
      '<div class="validation-success">NFS-e gerada com sucesso! Confira o resumo abaixo.</div>';
    validationResults.style.display = 'block';
  }

  console.log('🔄 Navegando para aba XML...'); // Debug

  // Auto-navegar para a aba XML após gerar com sucesso
  setTimeout(() => {
    if (typeof switchTab === 'function') {
      console.log('✅ Chamando switchTab("xml")'); // Debug
      switchTab('xml');
    } else {
      console.error('❌ Função switchTab não encontrada'); // Debug
    }
  }, 500);
  
  console.log('✅ XML gerado com sucesso'); // Debug
}

// ==================== COLETA DE DADOS ====================

// Coletar dados do formulário
function coletarDadosFormulario() {
  // Coletar valor e alíquota com validação
  const valorElement = document.getElementById('valor');
  const aliquotaElement = document.getElementById('aliquota');
  
  const valor = valorElement ? parseFloat(valorElement.value) || 0 : 0;
  const aliquota = aliquotaElement ? parseFloat(aliquotaElement.value) || 0 : 0;
  
  console.log('💰 Valor coletado:', valor, 'Alíquota:', aliquota); // Debug
  
  return {
    prestador: {
      razaoSocial: document.getElementById('razaoPrestador')?.value || '',
      cnpj: (document.getElementById('cnpjPrestador')?.value || '').replace(/\D/g, ''),
      inscricaoMunicipal: document.getElementById('imPrestador')?.value || ''
    },
    tomador: {
      tipoDoc: document.getElementById('tipoDocTomador')?.value || 'cnpj',
      documento: (document.getElementById('docTomador')?.value || '').replace(/\D/g, ''),
      razaoSocial: document.getElementById('razaoTomador')?.value || '',
      email: document.getElementById('emailTomador')?.value || ''
    },
    servico: {
      itemListaServico: document.getElementById('itemServico')?.value || '',
      descricao: document.getElementById('descricao')?.value || '',
      valor: valor,
      aliquota: aliquota,
      issRetido: document.getElementById('issRetido')?.value || '2'
    }
  };
}

// ==================== CONSTRUÇÃO DO XML ====================

// Construir o XML completo da NFS-e
function construirXMLNFSe(dados, valorServico, valorIss, valorLiquido, numeroRps, serieRps) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<EnviarLoteRpsEnvio xmlns="http://www.abrasf.org.br/nfse.xsd">
  <LoteRps Id="lote001" versao="2.02">
    <NumeroLote>1</NumeroLote>
    <Cnpj>${dados.prestador.cnpj}</Cnpj>
    <InscricaoMunicipal>${dados.prestador.inscricaoMunicipal}</InscricaoMunicipal>
    <QuantidadeRps>1</QuantidadeRps>
    <ListaRps>
      <Rps>
        <InfRps Id="rps001">
          <IdentificacaoRps>
            <Numero>${numeroRps}</Numero>
            <Serie>${serieRps}</Serie>
            <Tipo>1</Tipo>
          </IdentificacaoRps>
          <DataEmissao>${new Date().toISOString().split('T')[0]}</DataEmissao>
          <NaturezaOperacao>1</NaturezaOperacao>
          <RegimeEspecialTributacao>1</RegimeEspecialTributacao>
          <OptanteSimplesNacional>2</OptanteSimplesNacional>
          <IncentivadorCultural>2</IncentivadorCultural>
          <Status>1</Status>
          <Servico>
            <Valores>
              <ValorServicos>${valorServico.toFixed(2)}</ValorServicos>
              <ValorIss>${valorIss.toFixed(2)}</ValorIss>
              <Aliquota>${(dados.servico.aliquota * 100).toFixed(2)}</Aliquota>
              <ValorLiquidoNfse>${valorLiquido.toFixed(2)}</ValorLiquidoNfse>
              <IssRetido>${dados.servico.issRetido}</IssRetido>
            </Valores>
            <ItemListaServico>${dados.servico.itemListaServico}</ItemListaServico>
            <Discriminacao><![CDATA[${dados.servico.descricao}]]></Discriminacao>
            <CodigoMunicipio>2507507</CodigoMunicipio>
          </Servico>
          <Prestador>
            <Cnpj>${dados.prestador.cnpj}</Cnpj>
            <InscricaoMunicipal>${dados.prestador.inscricaoMunicipal}</InscricaoMunicipal>
          </Prestador>
          <Tomador>
            <IdentificacaoTomador>
              <CpfCnpj>
                ${dados.tomador.tipoDoc === 'cpf' ? 
                  `<Cpf>${dados.tomador.documento}</Cpf>` : 
                  `<Cnpj>${dados.tomador.documento}</Cnpj>`
                }
              </CpfCnpj>
            </IdentificacaoTomador>
            <RazaoSocial>${dados.tomador.razaoSocial}</RazaoSocial>
            ${dados.tomador.email ? `<Contato><Email>${dados.tomador.email}</Email></Contato>` : ''}
          </Tomador>
        </InfRps>
      </Rps>
    </ListaRps>
  </LoteRps>
</EnviarLoteRpsEnvio>`;
}

// ==================== CONTROLE DE INTERFACE ====================

// Mostrar botões relacionados ao XML
function mostrarBotoesXML() {
  const botoes = [
    'btnToggleXml', 
    'btnValidarXML', 
    'btnSalvar', 
    'btnProximoResumo', 
    'btnIrEnvio', 
    'btnEnviarWebservice'
  ];
  
  botoes.forEach(btnId => {
    const elemento = document.getElementById(btnId);
    if (elemento) {
      elemento.style.display = 'inline-block';
    }
  });
}

// ==================== VISUALIZAÇÃO DO XML ====================

// Função para alternar visualização do XML
function toggleXmlView() {
  const xmlOutput = document.getElementById('xmlOutput');
  const btnToggle = document.getElementById('btnToggleXml');
  
  if (xmlOutput.style.display === 'none') {
    xmlOutput.style.display = 'block';
    btnToggle.innerHTML = '<i class="fas fa-list"></i> Ver Resumo da NFS-e';
  } else {
    xmlOutput.style.display = 'none';
    btnToggle.innerHTML = '<i class="fas fa-file-code"></i> Ver XML Completo';
  }
}

// Alias function for backwards compatibility
function toggleXmlVisibility() {
  toggleXmlView();
}

// ==================== SALVAMENTO DO XML ====================

// Função para salvar XML como arquivo
function salvarXML() {
  const xmlContent = document.getElementById('xmlOutput').textContent;
  
  if (!xmlContent || xmlContent === 'Preencha todos os dados e clique em "Gerar XML" na aba anterior para ver o resultado...') {
    alert('Gere um XML primeiro antes de salvar.');
    return;
  }

  try {
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nfse-rps-${new Date().toISOString().split('T')[0]}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('XML salvo com sucesso!');
  } catch (error) {
    console.error('Erro ao salvar XML:', error);
    alert('Erro ao salvar o arquivo XML.');
  }
}

// ==================== VALIDAÇÃO OFFLINE DO XML ====================

// Validação offline do XML
function validarXMLOffline() {
  const xmlContent = document.getElementById('xmlOutput').textContent;
  
  if (!xmlContent || xmlContent === 'Preencha o formulário e clique em "Gerar XML" para ver o resultado...') {
    alert('Gere um XML primeiro antes de validar.');
    return;
  }
  
  const validacoes = [
    {
      nome: 'Estrutura XML válida',
      status: validarEstruturaXML(xmlContent),
      detalhes: 'Verifica se o XML está bem formado'
    },
    {
      nome: 'Elementos obrigatórios',
      status: validarElementosObrigatorios(xmlContent),
      detalhes: 'Verifica presença de campos obrigatórios'
    },
    {
      nome: 'Formato de valores',
      status: validarFormatoValores(xmlContent),
      detalhes: 'Verifica se valores estão no formato correto'
    },
    {
      nome: 'CNPJ/CPF válidos',
      status: validarDocumentos(xmlContent),
      detalhes: 'Verifica se documentos têm formato válido'
    },
    {
      nome: 'Código do município',
      status: validarCodigoMunicipio(xmlContent),
      detalhes: 'Verifica código do município (João Pessoa)'
    }
  ];
  
  let htmlValidacao = '<div class="validation-xml"><h4><i class="fas fa-search"></i> Resultado da Validação Offline</h4>';
  
  validacoes.forEach(validacao => {
    const icon = validacao.status ? 
      '<i class="fas fa-check-circle" style="color: #27ae60;"></i>' : 
      '<i class="fas fa-times-circle" style="color: #e74c3c;"></i>';
    
    htmlValidacao += `
      <div class="validation-item">
        <span class="validation-icon">${icon}</span>
        <div>
          <strong>${validacao.nome}</strong><br>
          <small>${validacao.detalhes}</small>
        </div>
      </div>
    `;
  });
  
  htmlValidacao += '</div>';
  
  // Mostrar resultado
  document.getElementById('validationResults').innerHTML = htmlValidacao;
  document.getElementById('validationResults').style.display = 'block';
  
  // Scroll para o resultado
  document.getElementById('validationResults').scrollIntoView({ behavior: 'smooth' });
}

// ==================== FUNÇÕES DE VALIDAÇÃO ====================

// Validar estrutura XML
function validarEstruturaXML(xml) {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, 'text/xml');
    const parseError = xmlDoc.getElementsByTagName('parsererror');
    return parseError.length === 0;
  } catch (e) {
    return false;
  }
}

// Validar elementos obrigatórios
function validarElementosObrigatorios(xml) {
  const elementosObrigatorios = [
    'NumeroLote', 'Cnpj', 'InscricaoMunicipal', 'QuantidadeRps',
    'Numero', 'Serie', 'ValorServicos', 'ItemListaServico'
  ];
  
  return elementosObrigatorios.every(elemento => xml.includes(`<${elemento}>`));
}

// Validar formato de valores
function validarFormatoValores(xml) {
  // Verificar se valores numéricos estão no formato correto
  const regexValor = /<ValorServicos>(\d+\.\d{2})<\/ValorServicos>/;
  const regexAliquota = /<Aliquota>(\d+\.\d{2})<\/Aliquota>/;
  
  return regexValor.test(xml) && regexAliquota.test(xml);
}

// Validar documentos
function validarDocumentos(xml) {
  // Verificar formato básico de CNPJ (14 dígitos)
  const regexCNPJ = /<Cnpj>(\d{14})<\/Cnpj>/;
  return regexCNPJ.test(xml);
}

// Validar código do município
function validarCodigoMunicipio(xml) {
  // João Pessoa = 2507507
  return xml.includes('<CodigoMunicipio>2507507</CodigoMunicipio>');
}

// ==================== VALIDAÇÃO ANTES DO ENVIO ====================

// Validação antes do envio (retorna true se passou em todas)
async function validarAntesSoenvio(xml) {
  const validacoes = [
    validarEstruturaXML(xml),
    validarElementosObrigatorios(xml),
    validarFormatoValores(xml),
    validarDocumentos(xml),
    validarCodigoMunicipio(xml)
  ];
  
  return validacoes.every(v => v);
}

// ==================== FUNÇÕES AUXILIARES ====================

// Verificar se XML foi gerado
function xmlFoiGerado() {
  const xmlContent = document.getElementById('xmlOutput').textContent;
  return xmlContent && xmlContent !== 'Preencha todos os dados e clique em "Gerar XML" na aba anterior para ver o resultado...';
}

// Obter conteúdo do XML atual
function obterXMLAtual() {
  return document.getElementById('xmlOutput').textContent;
}

// Limpar XML gerado
function limparXML() {
  document.getElementById('xmlOutput').textContent = 'Preencha todos os dados e clique em "Gerar XML" na aba anterior para ver o resultado...';
  document.getElementById('xmlOutput').style.display = 'block';
  
  // Ocultar botões relacionados ao XML
  const botoes = [
    'btnToggleXml', 'btnValidarXML', 'btnSalvar', 
    'btnProximoResumo', 'btnIrEnvio', 'btnEnviarWebservice'
  ];
  
  botoes.forEach(btnId => {
    const elemento = document.getElementById(btnId);
    if (elemento) {
      elemento.style.display = 'none';
    }
  });
}

// ==================== FORMATAÇÃO E PRETTY PRINT ====================

// Formatar XML para exibição (pretty print)
function formatarXML(xml) {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, 'text/xml');
    const serializer = new XMLSerializer();
    let formatted = serializer.serializeToString(xmlDoc);
    
    // Adicionar indentação básica
    formatted = formatted.replace(/></g, '>\n<');
    
    return formatted;
  } catch (error) {
    console.warn('Erro ao formatar XML:', error);
    return xml; // Retorna XML original se houver erro
  }
}

// ==================== UTILITÁRIOS DE DADOS ====================

// Extrair dados do XML (para reuso ou edição)
function extrairDadosDoXML(xml) {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, 'text/xml');
    
    return {
      prestador: {
        cnpj: xmlDoc.querySelector('Prestador Cnpj')?.textContent || '',
        inscricaoMunicipal: xmlDoc.querySelector('Prestador InscricaoMunicipal')?.textContent || ''
      },
      tomador: {
        documento: xmlDoc.querySelector('CpfCnpj Cpf')?.textContent || xmlDoc.querySelector('CpfCnpj Cnpj')?.textContent || '',
        razaoSocial: xmlDoc.querySelector('Tomador RazaoSocial')?.textContent || '',
        email: xmlDoc.querySelector('Contato Email')?.textContent || ''
      },
      servico: {
        valorServicos: parseFloat(xmlDoc.querySelector('ValorServicos')?.textContent || '0'),
        valorIss: parseFloat(xmlDoc.querySelector('ValorIss')?.textContent || '0'),
        aliquota: parseFloat(xmlDoc.querySelector('Aliquota')?.textContent || '0'),
        itemListaServico: xmlDoc.querySelector('ItemListaServico')?.textContent || '',
        descricao: xmlDoc.querySelector('Discriminacao')?.textContent || ''
      },
      rps: {
        numero: xmlDoc.querySelector('IdentificacaoRps Numero')?.textContent || '',
        serie: xmlDoc.querySelector('IdentificacaoRps Serie')?.textContent || '',
        dataEmissao: xmlDoc.querySelector('DataEmissao')?.textContent || ''
      }
    };
  } catch (error) {
    console.error('Erro ao extrair dados do XML:', error);
    return null;
  }
}

// ==================== EXPORTAR PARA ESCOPO GLOBAL ====================
// Para manter compatibilidade com event listeners já definidos no HTML

window.gerarXML = gerarXML;
window.toggleXmlView = toggleXmlView;
window.toggleXmlVisibility = toggleXmlVisibility;
window.salvarXML = salvarXML;
window.validarXMLOffline = validarXMLOffline;
window.validarAntesSoenvio = validarAntesSoenvio;
window.xmlFoiGerado = xmlFoiGerado;
window.obterXMLAtual = obterXMLAtual;
window.limparXML = limparXML;
window.formatarXML = formatarXML;
window.extrairDadosDoXML = extrairDadosDoXML;

console.log('✅ XML.JS carregado com sucesso!');
