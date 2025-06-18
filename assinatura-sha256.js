// ========== ASSINATURA COM SHA-256 (Teste alternativo) ==========
// Versão com SHA-256 caso o webservice exija algoritmo mais recente

console.log('🔐 Sistema de assinatura SHA-256 carregado!');

async function assinarXMLComSHA256(xml) {
    console.log('🔐 Aplicando assinatura com SHA-256...');
    
    try {
        // Carregar certificado da configuração
        const config = obterConfiguracaoSalva();
        const senha = config.certificado?.senha || 'pixel2025';
        
        // Solicitar arquivo .pfx
        const { pfxData } = await solicitarArquivoPfx();
        
        // Processar certificado
        const { certificate, privateKey } = await processarCertificadoSHA256(pfxData, senha);
        
        // Assinar com SHA-256
        const xmlAssinado = await assinarComSHA256(xml, certificate, privateKey);
        
        return xmlAssinado;
        
    } catch (error) {
        console.error('❌ Erro na assinatura SHA-256:', error);
        throw error;
    }
}

function solicitarArquivoPfx() {
    return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pfx,.p12';
        
        input.onchange = async function(event) {
            try {
                const file = event.target.files[0];
                if (!file) throw new Error('Nenhum arquivo selecionado');
                
                const pfxData = await file.arrayBuffer();
                resolve({ pfxData });
                
            } catch (error) {
                reject(error);
            }
        };
        
        input.click();
    });
}

async function processarCertificadoSHA256(pfxData, senha) {
    const pfxBytes = new Uint8Array(pfxData);
    const pfxBuffer = forge.util.createBuffer(pfxBytes);
    
    const pfx = forge.pkcs12.pkcs12FromAsn1(
        forge.asn1.fromDer(pfxBuffer), 
        senha
    );
    
    const certBags = pfx.getBags({ bagType: forge.pki.oids.certBag });
    const certificate = certBags[forge.pki.oids.certBag][0].cert;
    
    const keyBags = pfx.getBags({ 
        bagType: forge.pki.oids.pkcs8ShroudedKeyBag
    });
    const privateKey = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag][0].key;
    
    return { certificate, privateKey };
}

async function assinarComSHA256(xml, certificate, privateKey) {
    // Extrair InfRps
    const infRpsMatch = xml.match(/<InfRps[^>]*>([\s\S]*?)<\/InfRps>/);
    if (!infRpsMatch) {
        throw new Error('Tag InfRps não encontrada');
    }
    
    const infRpsCompleto = infRpsMatch[0];
    
    // Canonicalizar para digest
    const xmlCanonicalizado = infRpsCompleto.replace(/>\s+</g, '><').trim();
    
    // Calcular digest SHA-256
    const md = forge.md.sha256.create();
    md.update(xmlCanonicalizado, 'utf8');
    const digestValue = forge.util.encode64(md.digest().bytes());
    
    // Criar SignedInfo com SHA-256
    const signedInfo = `<SignedInfo xmlns="http://www.w3.org/2000/09/xmldsig#">
<CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>
<SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"/>
<Reference URI="#rps1">
<Transforms>
<Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/>
<Transform Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>
</Transforms>
<DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
<DigestValue>${digestValue}</DigestValue>
</Reference>
</SignedInfo>`;
    
    // Canonicalizar SignedInfo
    const signedInfoCanonicalizado = signedInfo.replace(/>\s+</g, '><').trim();
    
    // Assinar com SHA-256
    const mdSignature = forge.md.sha256.create();
    mdSignature.update(signedInfoCanonicalizado, 'utf8');
    const signature = privateKey.sign(mdSignature);
    const signatureValue = forge.util.encode64(signature);
    
    // Obter certificado em Base64
    const certDer = forge.asn1.toDer(forge.pki.certificateToAsn1(certificate)).getBytes();
    const certificateValue = forge.util.encode64(certDer);
    
    // Construir assinatura completa
    const xmlSignature = `<Signature xmlns="http://www.w3.org/2000/09/xmldsig#">
${signedInfo}
<SignatureValue>${signatureValue}</SignatureValue>
<KeyInfo>
<X509Data>
<X509Certificate>${certificateValue}</X509Certificate>
</X509Data>
</KeyInfo>
</Signature>`;
    
    // Inserir assinatura
    const xmlAssinado = xml.replace('</InfRps>', xmlSignature + '</InfRps>');
    
    console.log('✅ Assinatura SHA-256 criada!');
    console.log('🔍 XML com SHA-256:', xmlAssinado);
    
    return xmlAssinado;
}

// Expor função
window.assinarXMLComSHA256 = assinarXMLComSHA256;
