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
  
  // VERIFICAR SE É JOÃO PESSOA - USAR SISTEMA SIMPLIFICADO
  const cidade = document.getElementById('prestadorCidade')?.value || 'João Pessoa';
  if (cidade === 'João Pessoa' && typeof sistemaJoaoPessoa !== 'undefined') {
    console.log('🎯 Detectado João Pessoa - usando sistema simplificado');
    
    // Coletar dados do formulário
    const dadosFormulario = {
      prestador: {
        cnpj: document.getElementById('cnpjPrestador').value || '12345678000123',
        inscricaoMunicipal: document.getElementById('imPrestador').value || '123456'
      },
      tomador: {
        tipoDoc: document.getElementById('tipoDocTomador').value || 'cnpj',
        documento: document.getElementById('docTomador').value || '98765432000198',
        razaoSocial: document.getElementById('razaoTomador').value || 'EMPRESA TOMADORA LTDA'
      },
      servico: {
        valorServicos: document.getElementById('valor').value || '100.00',
        itemListaServico: document.getElementById('itemServico').value || '1401',
        discriminacao: document.getElementById('descricao').value || 'SERVICOS DE TESTE'
      }
    };
    
    // Gerar XML usando sistema simplificado
    const xml = sistemaJoaoPessoa.gerarXML(dadosFormulario);
    
    // Mostrar XML na interface
    document.getElementById('xmlOutput').textContent = xml;
    document.getElementById('xmlContainer').style.display = 'block';
    document.getElementById('btnGerarXML').textContent = 'XML Gerado ✓';
    document.getElementById('btnGerarXML').style.backgroundColor = '#28a745';
    
    console.log('✅ XML João Pessoa gerado com sistema simplificado');
    return xml;
  }
  
  // Verificar se a função de validação existe (para outros municípios)
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

// Construir o XML completo da NFS-e conforme ABRASF v2.03
function construirXMLNFSe(dados, valorServico, valorIss, valorLiquido, numeroRps, serieRps) {
  // Detectar se é João Pessoa pelos dados do prestador ou configuração
  const isJoaoPessoa = detectarJoaoPessoa(dados);
  
  if (isJoaoPessoa) {
    console.log('🎯 Detectado João Pessoa - usando modelo oficial específico');
    return construirXMLJoaoPessoa(dados, valorServico, valorIss, valorLiquido, numeroRps, serieRps);
  } else {
    console.log('🎯 Usando modelo ABRASF padrão');
    return construirXMLABRASFPadrao(dados, valorServico, valorIss, valorLiquido, numeroRps, serieRps);
  }
}

// Função para detectar se deve usar o modelo João Pessoa
function detectarJoaoPessoa(dados) {
  // Verificar por CNPJ conhecido (Pixel Vivo)
  if (dados.prestador.cnpj === '15198135000180') {
    return true;
  }
  
  // Verificar por inscrição municipal de João Pessoa
  if (dados.prestador.inscricaoMunicipal && dados.prestador.inscricaoMunicipal.includes('122781')) {
    return true;
  }
  
  // Verificar configuração manual
  const config = JSON.parse(localStorage.getItem('nfseConfig') || '{}');
  if (config.cidade === 'joao-pessoa' || config.modelo === 'joao-pessoa') {
    return true;
  }
  
  return false;
}

// Não há função duplicada aqui
// Construir o XML ABRASF padrão (mantido para outras cidades)
function construirXMLABRASFPadrao(dados, valorServico, valorIss, valorLiquido, numeroRps, serieRps) {
  // Data/hora atual no formato correto
  const agora = new Date();
  const dataEmissao = agora.toISOString().split('T')[0]; // AAAA-MM-DD
  const dataHoraEmissao = agora.toISOString().replace(/\.\d{3}Z$/, ''); // AAAA-MM-DDTHH:mm:ss
  
  return `<EnviarLoteRpsEnvio xmlns="http://www.abrasf.org.br/nfse.xsd">
  <LoteRps Id="lote${numeroRps.toString().padStart(3, '0')}" versao="2.03">
    <NumeroLote>${numeroRps}</NumeroLote>
    <Cnpj>${dados.prestador.cnpj}</Cnpj>
    <InscricaoMunicipal>${dados.prestador.inscricaoMunicipal}</InscricaoMunicipal>
    <QuantidadeRps>1</QuantidadeRps>
    <ListaRps>
      <Rps>
        <InfRps Id="rps${numeroRps.toString().padStart(3, '0')}">
          <IdentificacaoRps>
            <Numero>${numeroRps}</Numero>
            <Serie>${serieRps}</Serie>
            <Tipo>1</Tipo>
          </IdentificacaoRps>
          <DataEmissao>${dataEmissao}</DataEmissao>
          <NaturezaOperacao>1</NaturezaOperacao>
          <RegimeEspecialTributacao>${dados.servico.regimeEspecial || ''}</RegimeEspecialTributacao>
          <OptanteSimplesNacional>${dados.prestador.simplesNacional || '2'}</OptanteSimplesNacional>
          <IncentivadorCultural>${dados.prestador.incentivoCultural || '2'}</IncentivadorCultural>
          <Status>1</Status>
          <Servico>
            <Valores>
              <ValorServicos>${valorServico.toFixed(2)}</ValorServicos>
              ${dados.servico.valorDeducoes ? `<ValorDeducoes>${dados.servico.valorDeducoes.toFixed(2)}</ValorDeducoes>` : ''}
              ${dados.servico.valorPis ? `<ValorPis>${dados.servico.valorPis.toFixed(2)}</ValorPis>` : ''}
              ${dados.servico.valorCofins ? `<ValorCofins>${dados.servico.valorCofins.toFixed(2)}</ValorCofins>` : ''}
              ${dados.servico.valorInss ? `<ValorInss>${dados.servico.valorInss.toFixed(2)}</ValorInss>` : ''}
              ${dados.servico.valorIr ? `<ValorIr>${dados.servico.valorIr.toFixed(2)}</ValorIr>` : ''}
              ${dados.servico.valorCsll ? `<ValorCsll>${dados.servico.valorCsll.toFixed(2)}</ValorCsll>` : ''}
              <IssRetido>${dados.servico.issRetido}</IssRetido>
              <ValorIss>${valorIss.toFixed(2)}</ValorIss>
              ${dados.servico.valorIssRetido ? `<ValorIssRetido>${dados.servico.valorIssRetido.toFixed(2)}</ValorIssRetido>` : ''}
              ${dados.servico.outrasRetencoes ? `<OutrasRetencoes>${dados.servico.outrasRetencoes.toFixed(2)}</OutrasRetencoes>` : ''}
              ${dados.servico.baseCalculo ? `<BaseCalculo>${dados.servico.baseCalculo.toFixed(2)}</BaseCalculo>` : ''}
              <Aliquota>${(dados.servico.aliquota * 100).toFixed(4)}</Aliquota>
              <ValorLiquidoNfse>${valorLiquido.toFixed(2)}</ValorLiquidoNfse>
              ${dados.servico.descontoIncondicionado ? `<DescontoIncondicionado>${dados.servico.descontoIncondicionado.toFixed(2)}</DescontoIncondicionado>` : ''}
              ${dados.servico.descontoCondicionado ? `<DescontoCondicionado>${dados.servico.descontoCondicionado.toFixed(2)}</DescontoCondicionado>` : ''}
            </Valores>
            <IssRetido>${dados.servico.issRetido}</IssRetido>
            ${dados.servico.responsavelRetencao ? `<ResponsavelRetencao>${dados.servico.responsavelRetencao}</ResponsavelRetencao>` : ''}
            <ItemListaServico>${dados.servico.itemListaServico}</ItemListaServico>
            ${dados.servico.codigoCnae ? `<CodigoCnae>${dados.servico.codigoCnae}</CodigoCnae>` : ''}
            ${dados.servico.codigoTributacaoMunicipio ? `<CodigoTributacaoMunicipio>${dados.servico.codigoTributacaoMunicipio}</CodigoTributacaoMunicipio>` : ''}
            <Discriminacao><![CDATA[${dados.servico.descricao}]]></Discriminacao>
            <CodigoMunicipio>${dados.servico.codigoMunicipio || '2507507'}</CodigoMunicipio>
            ${dados.servico.codigoPais ? `<CodigoPais>${dados.servico.codigoPais}</CodigoPais>` : ''}
            <ExigibilidadeISS>${dados.servico.exigibilidadeIss || '1'}</ExigibilidadeISS>
            ${dados.servico.municipioIncidencia ? `<MunicipioIncidencia>${dados.servico.municipioIncidencia}</MunicipioIncidencia>` : ''}
            ${dados.servico.numeroProcesso ? `<NumeroProcesso>${dados.servico.numeroProcesso}</NumeroProcesso>` : ''}
          </Servico>
          <Prestador>
            <CpfCnpj>
              <Cnpj>${dados.prestador.cnpj}</Cnpj>
            </CpfCnpj>
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
              ${dados.tomador.inscricaoMunicipal ? `<InscricaoMunicipal>${dados.tomador.inscricaoMunicipal}</InscricaoMunicipal>` : ''}
            </IdentificacaoTomador>
            <RazaoSocial>${dados.tomador.razaoSocial}</RazaoSocial>
            ${dados.tomador.endereco ? construirXMLEndereco(dados.tomador.endereco) : ''}
            ${dados.tomador.email || dados.tomador.telefone ? construirXMLContato(dados.tomador) : ''}
          </Tomador>
          ${dados.intermediario ? construirXMLIntermediario(dados.intermediario) : ''}
          ${dados.construcaoCivil ? construirXMLConstrucaoCivil(dados.construcaoCivil) : ''}
        </InfRps>
      </Rps>
    </ListaRps>
  </LoteRps>
</EnviarLoteRpsEnvio>`;
}

// Construir o XML específico para João Pessoa conforme modelo oficial
function construirXMLJoaoPessoa(dados, valorServico, valorIss, valorLiquido, numeroRps, serieRps) {
  console.log('🏗️ Construindo XML específico para João Pessoa (MODELO OFICIAL)');
  
  // Data/hora atual no formato correto
  const agora = new Date();
  const dataEmissao = agora.toISOString().split('T')[0]; // AAAA-MM-DD
  const competencia = dataEmissao.substring(0, 7) + '-01'; // Primeiro dia do mês
  
  console.log('📋 Dados para geração:', {
    prestador: dados.prestador.cnpj,
    tomador: dados.tomador.documento,
    valor: valorServico,
    numero: numeroRps,
    serie: serieRps
  });
  
  // ⚠️ ESTRUTURA EXATA CONFORME MODELO OFICIAL JOÃO PESSOA
  // ✅ Elemento raiz <RecepcionarLoteRps>
  // ✅ Estrutura <InfDeclaracaoPrestacaoServico> (não InfRps)
  // ✅ Apenas 1 assinatura (LoteRps)
  // ✅ Estrutura <CpfCnpj><Cnpj> correta
  
  return `<RecepcionarLoteRps>
<EnviarLoteRpsEnvio>
<LoteRps Id="lote${numeroRps}" versao="2.03">
<NumeroLote>${numeroRps}</NumeroLote>
<CpfCnpj>
<Cnpj>${dados.prestador.cnpj}</Cnpj>
</CpfCnpj>
<InscricaoMunicipal>${dados.prestador.inscricaoMunicipal}</InscricaoMunicipal>
<QuantidadeRps>1</QuantidadeRps>
<ListaRps>
<Rps>
<InfDeclaracaoPrestacaoServico Id="rps${numeroRps}">
<Rps Id="">
<IdentificacaoRps>
<Numero>${numeroRps}</Numero>
<Serie>${serieRps}</Serie>
<Tipo>1</Tipo>
</IdentificacaoRps>
<DataEmissao>${dataEmissao}</DataEmissao>
<Status>1</Status>
</Rps>
<Competencia>${competencia}</Competencia>
<Servico>
<Valores>
<ValorServicos>${valorServico.toFixed(2)}</ValorServicos>
</Valores>
<IssRetido>${dados.servico.issRetido || '2'}</IssRetido>
<ItemListaServico>${dados.servico.itemListaServico}</ItemListaServico>
<CodigoCnae>${dados.servico.codigoCnae || '6201500'}</CodigoCnae>
<Discriminacao>${dados.servico.descricao}</Discriminacao>
<CodigoMunicipio>2211001</CodigoMunicipio>
<ExigibilidadeISS>${dados.servico.exigibilidadeIss || '1'}</ExigibilidadeISS>
<MunicipioIncidencia>2211001</MunicipioIncidencia>
</Servico>
<Prestador>
<CpfCnpj>
<Cnpj>${dados.prestador.cnpj}</Cnpj>
</CpfCnpj>
<InscricaoMunicipal>${dados.prestador.inscricaoMunicipal}</InscricaoMunicipal>
</Prestador>
<Tomador>
<IdentificacaoTomador>
<CpfCnpj>
${dados.tomador.tipoDoc === 'cpf' ? `<Cpf>${dados.tomador.documento}</Cpf>` : `<Cnpj>${dados.tomador.documento}</Cnpj>`}
</CpfCnpj>
</IdentificacaoTomador>
<RazaoSocial>${dados.tomador.razaoSocial}</RazaoSocial>
<Endereco>
<Endereco>${dados.tomador.endereco?.logradouro || 'RUA TESTE'}</Endereco>
<Numero>${dados.tomador.endereco?.numero || '123'}</Numero>
<Bairro>${dados.tomador.endereco?.bairro || 'CENTRO'}</Bairro>
<CodigoMunicipio>2211001</CodigoMunicipio>
<Uf>PB</Uf>
<Cep>${dados.tomador.endereco?.cep || '58000000'}</Cep>
</Endereco>
</Tomador>
<OptanteSimplesNacional>${dados.prestador.simplesNacional || '2'}</OptanteSimplesNacional>
<IncentivoFiscal>${dados.prestador.incentivoCultural || '2'}</IncentivoFiscal>
</InfDeclaracaoPrestacaoServico>
</Rps>
</ListaRps>
</LoteRps>
</EnviarLoteRpsEnvio>
</RecepcionarLoteRps>`;
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

// Validação offline do XML conforme padrão ABRASF
function validarXMLOffline() {
  const xmlContent = document.getElementById('xmlOutput').textContent;
  
  if (!xmlContent || xmlContent === 'Preencha o formulário e clique em "Gerar XML" para ver o resultado...') {
    alert('Gere um XML primeiro antes de validar.');
    return;
  }
  
  console.log('🔍 Iniciando validação ABRASF...');
  
  // Usar validação específica ABRASF
  const resultadoABRASF = validarXMLABRASF(xmlContent);
  
  // Validações complementares
  const validacoes = [
    {
      nome: 'Conformidade ABRASF v2.03',
      status: resultadoABRASF.valido,
      detalhes: resultadoABRASF.valido ? 'XML conforme padrão ABRASF' : resultadoABRASF.erros.join('; '),
      erros: resultadoABRASF.erros
    },
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
      nome: 'Assinatura preparada',
      status: validarEstrutraAssinatura(xmlContent),
      detalhes: 'Verifica se estrutura está pronta para assinatura digital'
    }
  ];
  
  let htmlValidacao = '<div class="validation-xml"><h4><i class="fas fa-search"></i> Validação ABRASF v2.03</h4>';
  
  let todosValidos = true;
  validacoes.forEach(validacao => {
    if (!validacao.status) todosValidos = false;
    
    const icon = validacao.status ? 
      '<i class="fas fa-check-circle" style="color: #27ae60;"></i>' : 
      '<i class="fas fa-times-circle" style="color: #e74c3c;"></i>';
    
    htmlValidacao += "<div class=\"validation-item\">" +
      "<span class=\"validation-icon\">" + icon + "</span>" +
      "<div>" +
      "<strong>" + validacao.nome + "</strong><br>" +
      "<small>" + validacao.detalhes + "</small>";
    
    if (validacao.erros && validacao.erros.length > 0) {
      htmlValidacao += "<ul style=\"margin-top: 5px; color: #e74c3c; font-size: 12px;\">";
      validacao.erros.forEach(erro => {
        htmlValidacao += "<li>" + erro + "</li>";
      });
      htmlValidacao += "</ul>";
    }
    
    htmlValidacao += "</div></div>";
  });
  
  // Resultado geral
  if (todosValidos) {
    htmlValidacao += "<div class=\"validation-summary success\">" +
      "<i class=\"fas fa-thumbs-up\"></i>" +
      "<strong>XML aprovado!</strong> Conforme padrão ABRASF v2.03 e pronto para envio." +
      "</div>";
  } else {
    htmlValidacao += "<div class=\"validation-summary error\">" +
      "<i class=\"fas fa-exclamation-triangle\"></i>" +
      "<strong>Correções necessárias!</strong> Ajuste os itens marcados em vermelho." +
      "</div>";
  }
  
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
  
  return elementosObrigatorios.every(elemento => xml.includes("<" + elemento + ">"));
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
  // João Pessoa - PB: 2507507
  return xml.includes('<CodigoMunicipio>2507507</CodigoMunicipio>');
}

// Validar estrutura para assinatura digital
function validarEstrutraAssinatura(xml) {
  // Verificar se tem IDs necessários para assinatura
  const temIdLote = xml.includes('Id="lote');
  const temIdRps = xml.includes('Id="rps');
  const temNamespace = xml.includes('xmlns="http://www.abrasf.org.br/nfse.xsd"');  
  return temIdLote && temIdRps && temNamespace;
}

// ==================== VALIDAÇÃO ANTES DO ENVIO ====================

// Validação antes do envio usando padrão ABRASF (retorna true se passou em todas)
async function validarAntesSoenvio(xml) {
  console.log('🔍 Validando XML antes do envio com padrão ABRASF...');
  
  // Usar a validação ABRASF que implementamos
  const resultadoABRASF = validarXMLABRASF(xml);
  
  if (resultadoABRASF.valido) {
    console.log('✅ XML aprovado pela validação ABRASF');
    return true;
  } else {
    console.log('❌ XML reprovado pela validação ABRASF:', resultadoABRASF.erros);
    return false;
  }
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

// ==================== FUNÇÕES AUXILIARES PARA XML CONFORME ABRASF ====================

// Construir XML de endereço conforme padrão ABRASF
function construirXMLEndereco(endereco) {
  if (!endereco) return '';
  
  let xml = '<Endereco>';
  if (endereco.logradouro) xml += '<Endereco>' + endereco.logradouro + '</Endereco>';
  if (endereco.numero) xml += '<Numero>' + endereco.numero + '</Numero>';
  if (endereco.complemento) xml += '<Complemento>' + endereco.complemento + '</Complemento>';
  if (endereco.bairro) xml += '<Bairro>' + endereco.bairro + '</Bairro>';
  if (endereco.codigoMunicipio) xml += '<CodigoMunicipio>' + endereco.codigoMunicipio + '</CodigoMunicipio>';
  if (endereco.uf) xml += '<Uf>' + endereco.uf + '</Uf>';
  if (endereco.codigoPais) xml += '<CodigoPais>' + endereco.codigoPais + '</CodigoPais>';
  if (endereco.cep) xml += '<Cep>' + endereco.cep.replace(/\D/g, '') + '</Cep>';
  xml += '</Endereco>';
  return xml;
}

// Construir XML de contato conforme padrão ABRASF
function construirXMLContato(contato) {
  if (!contato.email && !contato.telefone) return '';
  
  let xml = '<Contato>';
  if (contato.telefone) xml += '<Telefone>' + contato.telefone + '</Telefone>';
  if (contato.email) xml += '<Email>' + contato.email + '</Email>';
  xml += '</Contato>';
  return xml;
}

// Construir XML de intermediário conforme padrão ABRASF
function construirXMLIntermediario(intermediario) {
  if (!intermediario) return '';
  
  let xml = '<Intermediario><IdentificacaoIntermediario><CpfCnpj>';
  if (intermediario.tipoDoc === 'cpf') {
    xml += '<Cpf>' + intermediario.documento + '</Cpf>';
  } else {
    xml += '<Cnpj>' + intermediario.documento + '</Cnpj>';
  }
  xml += '</CpfCnpj>';
  if (intermediario.inscricaoMunicipal) {
    xml += '<InscricaoMunicipal>' + intermediario.inscricaoMunicipal + '</InscricaoMunicipal>';
  }
  xml += '</IdentificacaoIntermediario>';
  xml += '<RazaoSocial>' + intermediario.razaoSocial + '</RazaoSocial>';
  if (intermediario.endereco) xml += construirXMLEndereco(intermediario.endereco);
  if (intermediario.email || intermediario.telefone) xml += construirXMLContato(intermediario);
  xml += '</Intermediario>';
  return xml;
}

// Construir XML de construção civil conforme padrão ABRASF
function construirXMLConstrucaoCivil(construcao) {
  if (!construcao) return '';
  
  let xml = '<ConstrucaoCivil>';
  if (construcao.codigoObra) xml += '<CodigoObra>' + construcao.codigoObra + '</CodigoObra>';
  if (construcao.art) xml += '<Art>' + construcao.art + '</Art>';
  xml += '</ConstrucaoCivil>';
  return xml;
}

// Validar XML conforme Schema ABRASF
function validarXMLABRASF(xml) {
  console.log('🔍 Validando XML conforme padrão ABRASF...');
  
  const erros = [];
  
  // Validações básicas obrigatórias conforme ABRASF
  if (!xml.includes('xmlns="http://www.abrasf.org.br/nfse.xsd"')) {
    erros.push('Namespace ABRASF obrigatório está ausente');
  }
  
  if (!xml.includes('<EnviarLoteRpsEnvio')) {
    erros.push('Elemento raiz EnviarLoteRpsEnvio está ausente');
  }
  
  // Validar estrutura do lote
  if (!xml.includes('<LoteRps') || !xml.includes('versao="2.03"')) {
    erros.push('Versão do layout deve ser 2.03');
  }
  
  // Validar elementos obrigatórios do prestador
  if (!xml.includes('<Prestador>')) {
    erros.push('Dados do prestador são obrigatórios');
  }
  
  // Validar CNPJ do prestador (14 dígitos) - mais flexível
  const cnpjMatch = xml.match(/<Cnpj>(\d+)<\/Cnpj>/);
  if (!cnpjMatch || cnpjMatch[1].length !== 14) {
    erros.push('CNPJ do prestador deve ter 14 dígitos');
  }
  
  // Validar valores monetários (formato decimal) - mais flexível
  const valoresMatch = xml.match(/<ValorServicos>([\d.]+)<\/ValorServicos>/);
  if (!valoresMatch || isNaN(parseFloat(valoresMatch[1]))) {
    erros.push('ValorServicos deve ser um número válido');
  }
  
  // Validar alíquota (formato percentual) - mais flexível
  const aliquotaMatch = xml.match(/<Aliquota>([\d.]+)<\/Aliquota>/);
  if (!aliquotaMatch || isNaN(parseFloat(aliquotaMatch[1]))) {
    erros.push('Alíquota deve ser um número válido');
  }
  
  // Validar item da lista de serviços (formato mais flexível)
  const itemMatch = xml.match(/<ItemListaServico>(\d+\.?\d*)<\/ItemListaServico>/);
  if (!itemMatch) {
    erros.push('ItemListaServico deve ser um código válido');
  }
  
  // Validar data de emissão (formato AAAA-MM-DD)
  const dataMatch = xml.match(/<DataEmissao>(\d{4}-\d{2}-\d{2})<\/DataEmissao>/);
  if (!dataMatch) {
    erros.push('DataEmissao deve estar no formato AAAA-MM-DD');
  }
  
  // Log dos erros para debug
  if (erros.length > 0) {
    console.log('❌ Erros encontrados na validação ABRASF:', erros);
  } else {
    console.log('✅ XML conforme padrão ABRASF!');
  }
  
  return {
    valido: erros.length === 0,
    erros: erros
  };
}

console.log('✅ XML.JS carregado com sucesso!');
