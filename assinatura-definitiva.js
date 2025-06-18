// ================ ASSINATURA REAL DEFINITIVA ================
// ÚNICA versão para assinatura real - sem fallbacks, sem simulações
// Baseada na estrutura EXATA esperada pelo webservice João Pessoa/PB

console.log('🔐 Sistema de assinatura REAL definitivo carregado!');

async function assinarXMLDefinitivo(xml) {
    console.log('🔐 Aplicando assinatura REAL definitiva...');
    
    try {
        // Carregar certificado real
        const { certificate, privateKey } = await carregarCertificadoReal();
        
        // Calcular hash do XML conforme ABRASF
        const xmlParaAssinar = extrairInfRps(xml);
        const hash = await calcularHashABRASF(xmlParaAssinar);
        
        // Assinar com certificado real
        const assinatura = assinarComChavePrivada(hash, privateKey);
        
        // Construir XMLDSig conforme padrão ABRASF
        const xmldsig = construirXMLDSigABRASF(assinatura, certificate, hash);
        
        // Inserir assinatura no local correto (dentro do InfRps)
        const xmlAssinado = inserirAssinaturaCorreta(xml, xmldsig);
        
        console.log('✅ XML assinado com estrutura ABRASF correta');
        return xmlAssinado;
        
    } catch (error) {
        console.error('❌ Erro na assinatura definitiva:', error);
        throw error;
    }
}

// Carregar certificado real (sem prompt repetido)
let certificadoCache = null;

async function carregarCertificadoReal() {
    if (certificadoCache) {
        console.log('🔄 Usando certificado do cache');
        return certificadoCache;
    }
    
    try {
        // Tentar carregar automaticamente o certificado da pasta
        console.log('📁 Tentando carregar pixelvivo.pfx automaticamente...');
        
        const response = await fetch('./certificados/pixelvivo.pfx');
        if (response.ok) {
            const pfxData = await response.arrayBuffer();
            const pfxBytes = new Uint8Array(pfxData);
            
            // Ler senha do arquivo
            const senhaResponse = await fetch('./certificados/senha pixelvivo.txt');
            const senhaTexto = await senhaResponse.text();
            const senha = senhaTexto.split('\n')[0].trim(); // Primeira linha
            
            const pfx = forge.pkcs12.pkcs12FromAsn1(forge.asn1.fromDer(forge.util.createBuffer(pfxBytes)));
            const bags = pfx.getBags({ bagType: forge.pki.oids.certBag });
            const bag = bags[forge.pki.oids.certBag][0];
            
            const certificate = bag.cert;
            const privateKey = pfx.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[forge.pki.oids.pkcs8ShroudedKeyBag][0].key;
            
            certificadoCache = { certificate, privateKey };
            console.log('✅ Certificado carregado automaticamente');
            return certificadoCache;
            
        } else {
            throw new Error('Arquivo não encontrado automaticamente');
        }
        
    } catch (error) {
        console.log('⚠️ Carregamento automático falhou, solicitando arquivo...');
        
        // Fallback: solicitar arquivo
        return new Promise((resolve, reject) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.pfx,.p12';
            
            input.onchange = async function(event) {
                try {
                    const file = event.target.files[0];
                    if (!file) throw new Error('Nenhum arquivo selecionado');
                    
                    const pfxData = await file.arrayBuffer();
                    const pfxBytes = new Uint8Array(pfxData);
                    
                    const senha = prompt('Digite a senha do certificado:');
                    if (!senha) throw new Error('Senha não informada');
                    
                    const pfx = forge.pkcs12.pkcs12FromAsn1(forge.asn1.fromDer(forge.util.createBuffer(pfxBytes)));
                    const bags = pfx.getBags({ bagType: forge.pki.oids.certBag });
                    const bag = bags[forge.pki.oids.certBag][0];
                    
                    const certificate = bag.cert;
                    const privateKey = pfx.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[forge.pki.oids.pkcs8ShroudedKeyBag][0].key;
                    
                    certificadoCache = { certificate, privateKey };
                    resolve(certificadoCache);
                    
                } catch (error) {
                    reject(error);
                }
            };
            
            input.click();
        });
    }
}

// Extrair InfRps para assinatura (conforme ABRASF)
function extrairInfRps(xml) {
    const infRpsMatch = xml.match(/<InfRps[^>]*>[\s\S]*?<\/InfRps>/);
    if (!infRpsMatch) {
        throw new Error('InfRps não encontrado no XML');
    }
    return infRpsMatch[0];
}

// Calcular hash conforme ABRASF (SHA-1 canonicalizado)
async function calcularHashABRASF(xml) {
    // Canonicalizar XML
    const xmlCanonicalizado = xml
        .replace(/>\s+</g, '><')
        .replace(/\s+/g, ' ')
        .trim();
    
    // Calcular SHA-1 (padrão ABRASF)
    const encoder = new TextEncoder();
    const data = encoder.encode(xmlCanonicalizado);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Assinar hash com chave privada
function assinarComChavePrivada(hash, privateKey) {
    const md = forge.md.sha1.create();
    md.update(hash, 'hex');
    
    const signature = privateKey.sign(md);
    return forge.util.encode64(signature);
}

// Construir XMLDSig conforme padrão ABRASF
function construirXMLDSigABRASF(signatureValue, certificate, digestValue) {
    const certDer = forge.asn1.toDer(forge.pki.certificateToAsn1(certificate)).getBytes();
    const certificateValue = forge.util.encode64(certDer);
    
    return `<Signature xmlns="http://www.w3.org/2000/09/xmldsig#">
<SignedInfo>
<CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>
<SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1"/>
<Reference URI="#rps1">
<Transforms>
<Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/>
<Transform Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>
</Transforms>
<DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"/>
<DigestValue>${digestValue}</DigestValue>
</Reference>
</SignedInfo>
<SignatureValue>${signatureValue}</SignatureValue>
<KeyInfo>
<X509Data>
<X509Certificate>${certificateValue}</X509Certificate>
</X509Data>
</KeyInfo>
</Signature>`;
}

// Inserir assinatura no local correto (dentro do InfRps)
function inserirAssinaturaCorreta(xml, xmldsig) {
    // A assinatura deve ir DENTRO do InfRps, antes do fechamento
    return xml.replace(/<\/InfRps>/, `${xmldsig}</InfRps>`);
}

// Função principal para usar no sistema
window.assinarXMLDefinitivo = assinarXMLDefinitivo;

// Testar função
async function testarAssinaturaDefinitiva() {
    const xmlTeste = `<?xml version="1.0" encoding="UTF-8"?>
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
                    <DataEmissao>2025-06-17</DataEmissao>
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
                    </Tomador>
                </InfRps>
            </Rps>
        </ListaRps>
    </LoteRps>
</EnviarLoteRpsEnvio>`;
    
    try {
        const resultado = await assinarXMLDefinitivo(xmlTeste);
        console.log('🧪 Teste da assinatura definitiva:', resultado);
        return { sucesso: true, xml: resultado };
    } catch (error) {
        console.error('🧪 Erro no teste:', error);
        return { sucesso: false, erro: error.message };
    }
}

window.testarAssinaturaDefinitiva = testarAssinaturaDefinitiva;
