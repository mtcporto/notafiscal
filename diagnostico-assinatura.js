/**
 * DIAGNÓSTICO CRÍTICO - ANÁLISE DE COMPATIBILIDADE CERTIFICADO/XML
 * 
 * Verifica TODOS os aspectos que podem causar erro de assinatura:
 * 1. CNPJ do XML vs CNPJ do certificado
 * 2. Algoritmos de assinatura conforme ABRASF
 * 3. Estrutura XML conforme padrão
 * 4. Namespace e canonicalização
 * 5. Transforms e DigestMethod
 */

function diagnosticoCompletoAssinatura() {
    console.log('\n=== DIAGNÓSTICO COMPLETO DE ASSINATURA ===');
    
    // 1. Verificar informações do certificado
    console.log('\n1. INFORMAÇÕES DO CERTIFICADO:');
    const certInfo = obterInformacoesCertificado();
    console.log('CNPJ Certificado:', certInfo.cnpj);
    console.log('Subject:', certInfo.subject);
    console.log('Validade:', certInfo.validFrom, 'até', certInfo.validTo);
    console.log('Key Usage:', certInfo.keyUsage);
    
    // 2. Gerar XML e verificar CNPJs
    console.log('\n2. ANÁLISE XML vs CERTIFICADO:');
    const xmlGerado = gerarXmlParaDiagnostico();
    const cnpjsNoXml = extrairCnpjsDoXml(xmlGerado);
    console.log('CNPJs encontrados no XML:', cnpjsNoXml);
    console.log('CNPJ do certificado:', certInfo.cnpj);
    
    const cnpjCompativel = cnpjsNoXml.includes(certInfo.cnpj);
    console.log('✓ CNPJ compatível:', cnpjCompativel ? 'SIM' : 'NÃO');
    
    if (!cnpjCompativel) {
        console.log('❌ ERRO CRÍTICO: CNPJ do XML não confere com certificado!');
        return false;
    }
    
    // 3. Testar assinatura XML
    console.log('\n3. TESTE DE ASSINATURA XML:');
    try {
        const xmlAssinado = assinarXmlCompleto(xmlGerado);
        console.log('✓ XML assinado com sucesso');
        
        // Verificar estrutura da assinatura
        const assinaturaValida = verificarEstruturaAssinatura(xmlAssinado);
        console.log('✓ Estrutura assinatura válida:', assinaturaValida);
        
        return xmlAssinado;
        
    } catch (error) {
        console.log('❌ Erro na assinatura:', error.message);
        return false;
    }
}

function extrairCnpjsDoXml(xml) {
    const cnpjRegex = /<Cnpj>(\d{14})<\/Cnpj>/g;
    const cnpjs = [];
    let match;
    
    while ((match = cnpjRegex.exec(xml)) !== null) {
        if (!cnpjs.includes(match[1])) {
            cnpjs.push(match[1]);
        }
    }
    
    return cnpjs;
}

function verificarEstruturaAssinatura(xmlAssinado) {
    const checks = {
        signature: xmlAssinado.includes('<Signature'),
        signedInfo: xmlAssinado.includes('<SignedInfo'),
        canonicalizationMethod: xmlAssinado.includes('http://www.w3.org/TR/2001/REC-xml-c14n-20010315'),
        signatureMethod: xmlAssinado.includes('http://www.w3.org/2000/09/xmldsig#rsa-sha1'),
        transforms: xmlAssinado.includes('<Transforms>'),
        digestMethod: xmlAssinado.includes('http://www.w3.org/2000/09/xmldsig#sha1'),
        digestValue: xmlAssinado.includes('<DigestValue>'),
        signatureValue: xmlAssinado.includes('<SignatureValue>'),
        keyInfo: xmlAssinado.includes('<KeyInfo>'),
        x509Certificate: xmlAssinado.includes('<X509Certificate>')
    };
    
    console.log('\n   Estrutura da assinatura:');
    Object.entries(checks).forEach(([key, value]) => {
        console.log(`   ${value ? '✓' : '❌'} ${key}: ${value ? 'OK' : 'AUSENTE'}`);
    });
    
    return Object.values(checks).every(v => v);
}

function gerarXmlParaDiagnostico() {
    // Usar o XML com o CNPJ correto do certificado
    return `<?xml version="1.0" encoding="UTF-8"?>
<EnviarLoteRpsEnvio xmlns="http://www.abrasf.org.br/nfse.xsd">
    <LoteRps versao="2.03" Id="lote1">
        <NumeroLote>1</NumeroLote>
        <CpfCnpj>
            <Cnpj>15198135000180</Cnpj>
        </CpfCnpj>
        <InscricaoMunicipal>122781-5</InscricaoMunicipal>
        <QuantidadeRps>1</QuantidadeRps>
        <ListaRps>
            <Rps>
                <InfRps Id="rps1">
                    <IdentificacaoRps>
                        <Numero>1</Numero>
                        <Serie>1</Serie>
                        <Tipo>1</Tipo>
                    </IdentificacaoRps>
                    <DataEmissao>2024-01-15T10:00:00</DataEmissao>
                    <NaturezaOperacao>1</NaturezaOperacao>
                    <RegimeEspecialTributacao>6</RegimeEspecialTributacao>
                    <OptanteSimplesNacional>2</OptanteSimplesNacional>
                    <IncentivadorCultural>2</IncentivadorCultural>
                    <Status>1</Status>
                    <Servico>
                        <Valores>
                            <ValorServicos>100.00</ValorServicos>
                            <ValorDeducoes>0.00</ValorDeducoes>
                            <ValorPis>0.00</ValorPis>
                            <ValorCofins>0.00</ValorCofins>
                            <ValorInss>0.00</ValorInss>
                            <ValorIr>0.00</ValorIr>
                            <ValorCsll>0.00</ValorCsll>
                            <IssRetido>2</IssRetido>
                            <ValorIss>5.00</ValorIss>
                            <BaseCalculo>100.00</BaseCalculo>
                            <Aliquota>0.05</Aliquota>
                            <ValorLiquidoNfse>100.00</ValorLiquidoNfse>
                        </Valores>
                        <ItemListaServico>17.01</ItemListaServico>
                        <CodigoTributacaoMunicipio>170101</CodigoTributacaoMunicipio>
                        <Discriminacao>Teste diagnóstico completo - Serviço de desenvolvimento</Discriminacao>
                    </Servico>
                    <Prestador>
                        <CpfCnpj>
                            <Cnpj>15198135000180</Cnpj>
                        </CpfCnpj>
                        <InscricaoMunicipal>122781-5</InscricaoMunicipal>
                    </Prestador>
                    <Tomador>
                        <CpfCnpj>
                            <Cnpj>11222333000144</Cnpj>
                        </CpfCnpj>
                        <RazaoSocial>Cliente Teste Diagnóstico</RazaoSocial>
                    </Tomador>
                </InfRps>
            </Rps>
        </ListaRps>
    </LoteRps>
</EnviarLoteRpsEnvio>`;
}

function testarEnvioComDiagnostico() {
    console.log('\n=== TESTE DE ENVIO COM DIAGNÓSTICO COMPLETO ===');
    
    // 1. Executar diagnóstico completo
    const xmlAssinado = diagnosticoCompletoAssinatura();
    
    if (!xmlAssinado) {
        console.log('❌ Falha no diagnóstico - não prosseguindo com envio');
        return;
    }
    
    // 2. Testar envio via proxy
    console.log('\n4. TESTE DE ENVIO VIA PROXY:');
    
    const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/" 
               xmlns:tns="http://serem-hml.joaopessoa.pb.gov.br/notafiscal-abrasfv203-ws/NotaFiscalSoap">
    <soap:Header />
    <soap:Body>
        <tns:EnviarLoteRpsRequest>
            <xml><![CDATA[${xmlAssinado}]]></xml>
        </tns:EnviarLoteRpsRequest>
    </soap:Body>
</soap:Envelope>`;

    console.log('Tamanho SOAP Envelope:', soapEnvelope.length, 'caracteres');
    console.log('XML contém assinatura:', xmlAssinado.includes('<Signature') ? 'SIM' : 'NÃO');
    
    // Enviar via proxy
    enviarViaProxyAlternativo({
        endpoint: 'https://serem-hml.joaopessoa.pb.gov.br/notafiscal-abrasfv203-ws/NotaFiscalSoap',
        soapAction: 'EnviarLoteRps',
        soapEnvelope: soapEnvelope,
        headers: {
            'Content-Type': 'text/xml; charset=utf-8',
            'SOAPAction': 'EnviarLoteRps'
        }
    }).then(resultado => {
        console.log('\n5. RESULTADO DO ENVIO:');
        if (resultado.success) {
            console.log('✓ Resposta recebida com sucesso');
            console.log('Status:', resultado.response?.status || 'N/A');
            
            if (resultado.response?.data) {
                console.log('\nConteúdo da resposta:');
                console.log(resultado.response.data);
                
                // Analisar se ainda há erro de assinatura
                if (resultado.response.data.includes('erro na assinatura')) {
                    console.log('\n❌ AINDA HÁ ERRO DE ASSINATURA');
                    console.log('Detalhes:', extrairDetalhesErro(resultado.response.data));
                } else if (resultado.response.data.includes('sucesso') || resultado.response.data.includes('protocolo')) {
                    console.log('\n✅ SUCESSO! XML aceito pelo webservice');
                } else {
                    console.log('\n⚠️  Resposta diferente do esperado - analisar');
                }
            }
        } else {
            console.log('❌ Falha no envio:', resultado.error);
        }
    }).catch(error => {
        console.log('❌ Erro no teste:', error.message);
    });
}

function extrairDetalhesErro(resposta) {
    // Extrair detalhes específicos do erro
    const patterns = [
        /erro na assinatura[^<]*/gi,
        /Acerte a assinatura[^<]*/gi,
        /certificate[^<]*/gi,
        /CNPJ[^<]*/gi
    ];
    
    const detalhes = [];
    patterns.forEach(pattern => {
        const matches = resposta.match(pattern);
        if (matches) {
            detalhes.push(...matches);
        }
    });
    
    return detalhes.length > 0 ? detalhes : ['Erro não específico na resposta'];
}

// Executar diagnóstico automaticamente quando carregado
console.log('🔍 Diagnóstico completo de assinatura carregado');
console.log('Execute: testarEnvioComDiagnostico() para análise completa');
