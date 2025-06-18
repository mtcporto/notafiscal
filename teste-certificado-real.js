// ============ TESTE DIRETO CERTIFICADO REAL ==============
// Script para testar DIRETAMENTE o certificado .pfx sem fallbacks
// Não usa simulações ou fallbacks - apenas assinatura REAL

console.log('🔐 Módulo de teste certificado REAL carregado!');

// Função para testar envio direto com certificado real
async function testarEnvioComCertificadoReal() {
    console.log('🚀 Iniciando teste DIRETO com certificado real...');
    
    try {
        // 1. Gerar XML básico para teste
        const xml = gerarXMLBasico();
        console.log('📄 XML gerado para teste:', xml.substring(0, 200) + '...');
        
        // 2. Aplicar assinatura REAL diretamente
        console.log('🔐 Aplicando assinatura REAL com certificado .pfx...');
        const xmlAssinado = await assinarXMLComCertificadoReal(xml);
        
        // 3. Validar se a assinatura foi aplicada
        if (!xmlAssinado.includes('<Signature')) {
            throw new Error('Assinatura não foi aplicada ao XML');
        }
        
        console.log('✅ Assinatura REAL aplicada com sucesso!');
        console.log('📏 Tamanho do XML assinado:', xmlAssinado.length);
        
        // 4. Enviar diretamente para webservice (sem proxies)
        console.log('📡 Enviando para webservice da prefeitura...');
        const resultado = await enviarDiretamenteParaWebservice(xmlAssinado);
        
        return {
            sucesso: true,
            xmlAssinado: xmlAssinado,
            resultado: resultado
        };
        
    } catch (error) {
        console.error('❌ Erro no teste direto:', error);
        return {
            sucesso: false,
            erro: error.message
        };
    }
}

// Gerar XML básico para teste
function gerarXMLBasico() {
    return `<?xml version="1.0" encoding="UTF-8"?>
<EnviarLoteRpsEnvio xmlns="http://www.abrasf.org.br/nfse.xsd">
    <LoteRps versao="2.03">
        <NumeroLote>1</NumeroLote>
        <CpfCnpj><Cnpj>15198135000180</Cnpj></CpfCnpj>
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
                    <DataEmissao>${new Date().toISOString().split('T')[0]}</DataEmissao>
                    <Status>1</Status>
                    <Servico>
                        <Valores>
                            <ValorServicos>2500.00</ValorServicos>
                            <Aliquota>0.02</Aliquota>
                            <ValorIss>50.00</ValorIss>
                            <ValorLiquidoNfse>2500.00</ValorLiquidoNfse>
                        </Valores>
                        <ItemListaServico>17.01</ItemListaServico>
                        <CodigoTributacaoMunicipio>170101</CodigoTributacaoMunicipio>
                        <Discriminacao>Desenvolvimento de software personalizado</Discriminacao>
                    </Servico>
                    <Prestador>
                        <CpfCnpj><Cnpj>15198135000180</Cnpj></CpfCnpj>
                        <InscricaoMunicipal>122781-5</InscricaoMunicipal>
                    </Prestador>
                    <Tomador>
                        <CpfCnpj><Cnpj>11222333000144</Cnpj></CpfCnpj>
                        <RazaoSocial>Cliente Teste LTDA</RazaoSocial>
                        <Endereco>
                            <Endereco>Rua Teste, 123</Endereco>
                            <Numero>123</Numero>
                            <Bairro>Centro</Bairro>
                            <CodigoMunicipio>2507507</CodigoMunicipio>
                            <Uf>PB</Uf>
                            <Cep>58000000</Cep>
                        </Endereco>
                    </Tomador>
                </InfRps>
            </Rps>
        </ListaRps>
    </LoteRps>
</EnviarLoteRpsEnvio>`;
}

// Enviar diretamente para webservice (sem proxies)
async function enviarDiretamenteParaWebservice(xmlAssinado) {
    const endpoint = 'https://serem-hml.joaopessoa.pb.gov.br/notafiscal-abrasfv203-ws/NotaFiscalSoap';
    
    const envelope = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:nfs="http://www.abrasf.org.br/nfse.xsd">
    <soap:Header/>
    <soap:Body>
        <nfs:EnviarLoteRpsEnvio>
            ${xmlAssinado}
        </nfs:EnviarLoteRpsEnvio>
    </soap:Body>
</soap:Envelope>`;

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/xml; charset=utf-8',
                'SOAPAction': 'http://www.abrasf.org.br/nfse.xsd/EnviarLoteRps'
            },
            body: envelope
        });
        
        const responseText = await response.text();
        
        return {
            sucesso: response.ok,
            status: response.status,
            resposta: responseText
        };
        
    } catch (error) {
        throw new Error(`Erro no envio direto: ${error.message}`);
    }
}

// Expor função globalmente
window.testarEnvioComCertificadoReal = testarEnvioComCertificadoReal;
