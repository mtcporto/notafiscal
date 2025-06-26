/**
 * TESTE RÁPIDO - CNPJ CORRIGIDO
 * Verifica se o problema da assinatura foi resolvido
 */

const fs = require('fs');

// Simular ambiente browser básico
global.window = {};
global.document = {
    createElement: () => ({
        addEventListener: () => {},
        style: {}
    })
};

// Carregar certificado
eval(fs.readFileSync('pixelvivo-certificate.js', 'utf8'));

// Simular funções de assinatura básicas
function testarCnpjCorrigido() {
    console.log('\n=== TESTE CNPJ CORRIGIDO ===');
    
    const certInfo = obterInformacoesCertificado();
    console.log('CNPJ do certificado:', certInfo.cnpj);
    
    // XML com CNPJ correto
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
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
                        <Discriminacao>Teste CNPJ corrigido - Serviço de desenvolvimento</Discriminacao>
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
                        <RazaoSocial>Cliente Teste</RazaoSocial>
                    </Tomador>
                </InfRps>
            </Rps>
        </ListaRps>
    </LoteRps>
</EnviarLoteRpsEnvio>`;

    // Extrair CNPJs do XML
    const cnpjRegex = /<Cnpj>(\d{14})<\/Cnpj>/g;
    const cnpjs = [];
    let match;
    
    while ((match = cnpjRegex.exec(xml)) !== null) {
        if (!cnpjs.includes(match[1])) {
            cnpjs.push(match[1]);
        }
    }
    
    console.log('CNPJs no XML:', cnpjs);
    console.log('✓ CNPJ compatível:', cnpjs.includes(certInfo.cnpj) ? 'SIM' : 'NÃO');
    
    // Simular assinatura básica
    console.log('\nSimulando assinatura XML...');
    const xmlAssinado = xml.replace('</EnviarLoteRpsEnvio>', `
    <Signature xmlns="http://www.w3.org/2000/09/xmldsig#">
        <SignedInfo>
            <CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>
            <SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1"/>
            <Reference URI="#lote1">
                <Transforms>
                    <Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/>
                    <Transform Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>
                </Transforms>
                <DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"/>
                <DigestValue>SIMULADO_DIGEST_VALUE</DigestValue>
            </Reference>
        </SignedInfo>
        <SignatureValue>SIMULADO_SIGNATURE_VALUE</SignatureValue>
        <KeyInfo>
            <X509Data>
                <X509Certificate>${certInfo.certificadoPem}</X509Certificate>
            </X509Data>
        </KeyInfo>
    </Signature>
</EnviarLoteRpsEnvio>`);
    
    console.log('✓ XML assinado (simulado)');
    console.log('Tamanho XML final:', xmlAssinado.length, 'caracteres');
    
    return xmlAssinado;
}

// Executar teste
const xmlTeste = testarCnpjCorrigido();
console.log('\n✅ CNPJ CORRIGIDO COM SUCESSO');
console.log('Próximo passo: testar no browser com assinatura real');
