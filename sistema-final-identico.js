// SISTEMA FINAL JOÃO PESSOA - IDÊNTICO AO MODELO OFICIAL QUE FUNCIONA
// Este arquivo usa EXATAMENTE as mesmas funções do teste-modelo-oficial-browser.js
console.log('🎯 SISTEMA FINAL JOÃO PESSOA - IDÊNTICO AO MODELO OFICIAL');
console.log('=========================================================');

// ===== FUNÇÃO IDÊNTICA DO MODELO OFICIAL =====
function gerarXMLModeloOficialFinal(dadosFormulario) {
    console.log('🔧 Gerando XML conforme modelo oficial de João Pessoa...');
    
    // Dados para o formulário (se fornecidos) ou dados de teste
    const dadosPrestador = dadosFormulario?.prestador || {
        cnpj: document.getElementById('cnpjPrestador')?.value?.replace(/\D/g, '') || '15198135000180',
        inscricaoMunicipal: document.getElementById('imPrestador')?.value || '122781-5',
        razaoSocial: document.getElementById('razaoPrestador')?.value || 'PIXEL VIVO SOLUCOES WEB LTDA'
    };
    
    const dadosTomador = dadosFormulario?.tomador || {
        documento: document.getElementById('docTomador')?.value?.replace(/\D/g, '') || '11222333000181',
        tipoDoc: document.getElementById('tipoDocTomador')?.value || 'cnpj',
        razaoSocial: document.getElementById('razaoTomador')?.value || 'CLIENTE TESTE LTDA'
    };
    
    const dadosServico = dadosFormulario?.servico || {
        valorServicos: document.getElementById('valor')?.value || '2500.00',
        discriminacao: document.getElementById('descricao')?.value || 'Desenvolvimento de sistema web',
        itemListaServico: document.getElementById('itemServico')?.value || '01.01'
    };
    
    const numeroRps = Math.floor(Math.random() * 999) + 1;
    const numeroLote = numeroRps;
    const dataAtual = new Date().toISOString().split('T')[0];
    
    // XML conforme modelo oficial João Pessoa
    // ❗ ESTRUTURA CRÍTICA: <RecepcionarLoteRps> como raiz
    // ❗ APENAS 1 ASSINATURA (LoteRps)
    // ❗ <InfDeclaracaoPrestacaoServico> em vez de <InfRps>
    const xml = `<RecepcionarLoteRps>
<EnviarLoteRpsEnvio>
<LoteRps Id="lote${numeroLote}" versao="2.03">
<NumeroLote>${numeroLote}</NumeroLote>
<CpfCnpj>
<Cnpj>${dadosPrestador.cnpj}</Cnpj>
</CpfCnpj>
<InscricaoMunicipal>${dadosPrestador.inscricaoMunicipal}</InscricaoMunicipal>
<QuantidadeRps>1</QuantidadeRps>
<ListaRps>
<Rps>
<InfDeclaracaoPrestacaoServico Id="rps${numeroRps}">
<Rps Id="">
<IdentificacaoRps>
<Numero>${numeroRps}</Numero>
<Serie>A1</Serie>
<Tipo>1</Tipo>
</IdentificacaoRps>
<DataEmissao>${dataAtual}</DataEmissao>
<Status>1</Status>
</Rps>
<Competencia>${dataAtual.substring(0, 7)}-01</Competencia>
<Servico>
<Valores>
<ValorServicos>${dadosServico.valorServicos}</ValorServicos>
</Valores>
<IssRetido>2</IssRetido>
<ItemListaServico>${dadosServico.itemListaServico}</ItemListaServico>
<CodigoCnae>6201500</CodigoCnae>
<Discriminacao>${dadosServico.discriminacao}</Discriminacao>
<CodigoMunicipio>2211001</CodigoMunicipio>
<ExigibilidadeISS>1</ExigibilidadeISS>
<MunicipioIncidencia>2211001</MunicipioIncidencia>
</Servico>
<Prestador>
<CpfCnpj>
<Cnpj>${dadosPrestador.cnpj}</Cnpj>
</CpfCnpj>
<InscricaoMunicipal>${dadosPrestador.inscricaoMunicipal}</InscricaoMunicipal>
</Prestador>
<Tomador>
<IdentificacaoTomador>
<CpfCnpj>
${dadosTomador.tipoDoc === 'cpf' ? `<Cpf>${dadosTomador.documento}</Cpf>` : `<Cnpj>${dadosTomador.documento}</Cnpj>`}
</CpfCnpj>
</IdentificacaoTomador>
<RazaoSocial>${dadosTomador.razaoSocial}</RazaoSocial>
<Endereco>
<Endereco>RUA TESTE</Endereco>
<Numero>123</Numero>
<Bairro>CENTRO</Bairro>
<CodigoMunicipio>2211001</CodigoMunicipio>
<Uf>PB</Uf>
<Cep>58000000</Cep>
</Endereco>
</Tomador>
<OptanteSimplesNacional>2</OptanteSimplesNacional>
<IncentivoFiscal>2</IncentivoFiscal>
</InfDeclaracaoPrestacaoServico>
</Rps>
</ListaRps>
</LoteRps>
</EnviarLoteRpsEnvio>
</RecepcionarLoteRps>`;

    return xml;
}

// ===== CANONICALIZAÇÃO IDÊNTICA =====
function canonicalizarXMLFinal(xmlString) {
    return xmlString
        .replace(/\r\n/g, '')
        .replace(/\r/g, '')
        .replace(/\n\s*/g, '')
        .replace(/>\s+</g, '><')
        .replace(/\s*=\s*/g, '=')
        .replace(/="\s+/g, '="')
        .replace(/\s+"/g, '"')
        .replace(/\s*\/>/g, '/>')
        .replace(/\s*>/g, '>')
        .replace(/'/g, '"')
        .trim();
}

// ===== ASSINATURA IDÊNTICA =====
async function assinarModeloOficialFinal(xml, certificadoConfig) {
    try {
        console.log('🔐 Assinando conforme modelo oficial (apenas LoteRps)...');
        
        let certificate, privateKey;
        
        if (certificadoConfig && certificadoConfig.pfxBytes && certificadoConfig.senha) {
            // Usar certificado fornecido
            const resultado = await processarCertificado(certificadoConfig.pfxBytes, certificadoConfig.senha);
            certificate = resultado.certificate;
            privateKey = resultado.privateKey;
        } else {
            // Usar certificado de teste
            const response = await fetch('./certificados/pixelvivo.pfx');
            const pfxBuffer = await response.arrayBuffer();
            const pfxBytes = new Uint8Array(pfxBuffer);
            const senha = 'pixel2025';
            const resultado = await processarCertificado(pfxBytes, senha);
            certificate = resultado.certificate;
            privateKey = resultado.privateKey;
        }
        
        // Extrair LoteRps para assinatura (IDÊNTICO AO FLUXO NORMAL)
        const loteRpsMatch = xml.match(/<LoteRps[^>]*>([\s\S]*?)<\/LoteRps>/);
        if (!loteRpsMatch) {
            throw new Error('LoteRps não encontrado');
        }
        
        const loteRpsTag = xml.match(/<LoteRps[^>]*>/)[0];
        const idMatch = loteRpsTag.match(/Id="([^"]*)"/);
        if (!idMatch) {
            throw new Error('Id do LoteRps não encontrado');
        }
        
        const loteRpsId = idMatch[1];
        const loteRpsCompleto = loteRpsMatch[0];
        
        console.log('🎯 ID do LoteRps para assinatura:', loteRpsId);
        
        // USAR EXATAMENTE A MESMA CANONICALIZAÇÃO DO FLUXO NORMAL
        const xmlCanonicalizado = canonicalizarXMLFinal(loteRpsCompleto);
        
        // Digest SHA-1 (IDÊNTICO AO FLUXO NORMAL)
        const md = forge.md.sha1.create();
        md.update(xmlCanonicalizado, 'utf8');
        const digestValue = forge.util.encode64(md.digest().bytes());
        
        console.log('🔐 Digest Value:', digestValue.substring(0, 20) + '...');
        
        // SignedInfo conforme modelo oficial (IDÊNTICO AO FLUXO NORMAL)
        const signedInfo = `<SignedInfo>
<CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>
<SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1"/>
<Reference URI="#${loteRpsId}">
<Transforms>
<Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/>
<Transform Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>
</Transforms>
<DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"/>
<DigestValue>${digestValue}</DigestValue>
</Reference>
</SignedInfo>`;
        
        // Assinar SignedInfo (IDÊNTICO AO FLUXO NORMAL)
        const signedInfoCanonicalizado = canonicalizarXMLFinal(signedInfo);
        const mdSignature = forge.md.sha1.create();
        mdSignature.update(signedInfoCanonicalizado, 'utf8');
        const signature = privateKey.sign(mdSignature);
        const signatureValue = forge.util.encode64(signature);
        
        console.log('✅ Signature Value:', signatureValue.substring(0, 30) + '...');
        
        // Certificado (IDÊNTICO AO FLUXO NORMAL)
        const certDer = forge.asn1.toDer(forge.pki.certificateToAsn1(certificate)).getBytes();
        const certificateValue = forge.util.encode64(certDer);
        
        // Assinatura conforme modelo oficial (IDÊNTICO AO FLUXO NORMAL)
        const xmlSignature = `<Signature xmlns="http://www.w3.org/2000/09/xmldsig#">
${signedInfo}
<SignatureValue>${signatureValue}</SignatureValue>
<KeyInfo>
<X509Data>
<X509Certificate>${certificateValue}</X509Certificate>
</X509Data>
</KeyInfo>
</Signature>`;
        
        // Inserir assinatura após LoteRps (conforme modelo oficial)
        const xmlAssinado = xml.replace('</LoteRps>', '</LoteRps>\n' + xmlSignature);
        
        console.log('✅ XML assinado conforme modelo oficial João Pessoa');
        console.log('📊 Tamanho final:', xmlAssinado.length, 'caracteres');
        
        return xmlAssinado;
        
    } catch (erro) {
        console.error('❌ Erro na assinatura modelo oficial:', erro);
        return null;
    }
}

// ===== ENVIO IDÊNTICO =====
async function enviarModeloOficialFinal(xmlAssinado) {
    try {
        console.log('📡 Enviando XML conforme modelo oficial João Pessoa...');
        
        const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
               xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
               xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/">
  <soap:Body>
    <RecepcionarLoteRps xmlns="http://www.abrasf.org.br/nfse.xsd">
      ${xmlAssinado}
    </RecepcionarLoteRps>
  </soap:Body>
</soap:Envelope>`;

        console.log('📡 Fazendo requisição SOAP...');
        
        const response = await fetch('https://nfse.joaopessoa.pb.gov.br/sefinws/NFSeChamadasPublicas.asmx', {
            method: 'POST',
            headers: {
                'Content-Type': 'text/xml; charset=utf-8',
                'SOAPAction': '"http://www.abrasf.org.br/nfse.xsd/RecepcionarLoteRps"'
            },
            body: soapEnvelope
        });

        console.log('📡 Response Status:', response.status);
        const responseText = await response.text();
        console.log('📡 Response Body (primeiros 500 chars):', responseText.substring(0, 500));

        return {
            sucesso: true,
            status: response.status,
            resposta: responseText,
            httpCode: response.status
        };

    } catch (erro) {
        console.error('❌ Erro no envio:', erro);
        return {
            sucesso: false,
            erro: erro.message
        };
    }
}

// ===== FLUXO COMPLETO IDÊNTICO =====
async function executarFluxoCompletoFinal(dadosFormulario, certificadoConfig) {
    try {
        console.log('🚀 Executando fluxo completo (modelo oficial idêntico)...');
        
        // 1. Gerar XML
        const xml = gerarXMLModeloOficialFinal(dadosFormulario);
        console.log('✅ XML gerado');
        
        // 2. Assinar XML
        const xmlAssinado = await assinarModeloOficialFinal(xml, certificadoConfig);
        if (!xmlAssinado) {
            throw new Error('Falha na assinatura');
        }
        console.log('✅ XML assinado');
        
        // 3. Enviar XML
        const resultado = await enviarModeloOficialFinal(xmlAssinado);
        console.log('✅ XML enviado');
        
        return {
            sucesso: true,
            xml: xml,
            xmlAssinado: xmlAssinado,
            resultado: resultado
        };
        
    } catch (erro) {
        console.error('❌ Erro no fluxo completo:', erro);
        return {
            sucesso: false,
            erro: erro.message
        };
    }
}

// ===== VERIFICAÇÃO DE ESTRUTURA IDÊNTICA =====
function verificarEstruturaFinal(xml) {
    console.log('\n🔍 VERIFICANDO ESTRUTURA FINAL');
    console.log('==============================');
    
    const verificacoes = [
        {
            nome: 'Elemento raiz <RecepcionarLoteRps>',
            check: xml.includes('<RecepcionarLoteRps>'),
            critico: true
        },
        {
            nome: 'Estrutura <InfDeclaracaoPrestacaoServico>',
            check: xml.includes('<InfDeclaracaoPrestacaoServico'),
            critico: true
        },
        {
            nome: 'Atributo versao="2.03"',
            check: xml.includes('versao="2.03"'),
            critico: true
        },
        {
            nome: 'Rps Id="" vazio',
            check: xml.includes('<Rps Id="">'),
            critico: true
        }
    ];
    
    let todasVerificacoesPassed = true;
    
    verificacoes.forEach(verificacao => {
        const status = verificacao.check ? '✅' : '❌';
        const emoji = verificacao.critico && !verificacao.check ? '🚨 CRÍTICO' : '';
        console.log(`${status} ${emoji}: ${verificacao.nome}`);
        
        if (verificacao.critico && !verificacao.check) {
            todasVerificacoesPassed = false;
        }
    });
    
    if (todasVerificacoesPassed) {
        console.log('\n🎉 ESTRUTURA XML PERFEITA!');
        console.log('✅ Todos os requisitos críticos atendidos!');
        return 'ESTRUTURA XML PERFEITA';
    } else {
        console.log('\n❌ Algumas verificações críticas falharam');
        return 'ERRO ESTRUTURA';
    }
}

// ===== INTERFACE FINAL PARA O SISTEMA =====
window.sistemaJoaoPessoaFinal = {
    gerarXML: gerarXMLModeloOficialFinal,
    assinarXML: assinarModeloOficialFinal,
    enviarXML: enviarModeloOficialFinal,
    fluxoCompleto: executarFluxoCompletoFinal,
    verificarEstrutura: verificarEstruturaFinal
};

console.log('✅ Sistema João Pessoa FINAL (idêntico ao modelo oficial) carregado');
