// Correção baseada na análise da NFe que funciona em João Pessoa
console.log('🔧 CORREÇÃO BASEADA NA NFe QUE FUNCIONA');
console.log('=====================================');

// Análise preliminar da NFe que funciona:
// - SignedInfo TEM quebras de linha (formatado)
// - Certificado é da Certisign (AC CNDL RFB)
// - Posicionamento: assinatura como irmã do elemento principal
// - Algoritmos: SHA-1 + C14N (igual ao nosso)

async function aplicarCorrecaoBaseadaNFe() {
    try {
        console.log('\n🎯 APLICANDO CORREÇÕES BASEADAS NA NFe FUNCIONANDO:');
        console.log('==================================================');
        
        console.log('1️⃣ Alterando formato do SignedInfo para coincidir com NFe');
        console.log('2️⃣ Testando posicionamento de assinatura');
        console.log('3️⃣ Verificando compatibilidade de certificado');
        console.log('');
        
        // 1. Primeira tentativa: ajustar apenas o formato do SignedInfo
        console.log('🔧 TESTE 1: SignedInfo formatado como NFe (com quebras de linha)');
        
        if (typeof gerarXMLNFSeABRASF === 'function') {
            const xml = gerarXMLNFSeABRASF();
            console.log('✅ XML NFS-e gerado');
            
            // Gerar versão com SignedInfo formatado
            const xmlComSignedInfoFormatado = await criarAssinaturaFormatadaComoNFe(xml);
            
            if (xmlComSignedInfoFormatado) {
                console.log('✅ XML assinado com SignedInfo formatado');
                
                // Testar envio
                console.log('\n📡 TESTANDO ENVIO COM SIGNEDINFO FORMATADO...');
                
                if (typeof enviarNFSeCompleta === 'function') {
                    try {
                        const resposta = await enviarNFSeCompleta(xmlComSignedInfoFormatado);
                        
                        console.log('\n📥 RESULTADO DO TESTE 1:');
                        console.log('=======================');
                        console.log(resposta);
                        
                        if (typeof resposta === 'string' && resposta.toLowerCase().includes('erro na assinatura')) {
                            console.log('\n❌ TESTE 1 FALHOU: Ainda erro de assinatura');
                            console.log('🔧 Tentando TESTE 2...');
                            
                            // TESTE 2: Simplificar para assinatura única
                            await testarAssinaturaUnica();
                            
                        } else if (typeof resposta === 'string' && 
                                  (resposta.includes('<NumeroNfse>') || resposta.toLowerCase().includes('sucesso'))) {
                            console.log('\n🎉 TESTE 1 SUCESSO! Problema resolvido!');
                            console.log('✅ SignedInfo formatado resolveu o problema!');
                            
                        } else {
                            console.log('\n📝 TESTE 1: Resultado inconcluso');
                            console.log('📋 Verificar resposta acima');
                        }
                        
                    } catch (erro) {
                        console.log('\n❌ ERRO no TESTE 1:', erro.message);
                    }
                } else {
                    console.log('❌ Função enviarNFSeCompleta não disponível');
                }
            }
        } else {
            console.log('❌ Função gerarXMLNFSeABRASF não disponível');
        }
        
    } catch (erro) {
        console.error('❌ Erro na correção baseada NFe:', erro);
    }
}

// Função para criar assinatura formatada como NFe
async function criarAssinaturaFormatadaComoNFe(xml) {
    try {
        console.log('🔧 Criando assinatura com SignedInfo formatado como NFe...');
        
        // Carregar certificado
        const response = await fetch('./certificados/pixelvivo.pfx');
        const pfxBuffer = await response.arrayBuffer();
        const pfxBytes = new Uint8Array(pfxBuffer);
        const senha = 'pixel2025';
        
        // Processar certificado
        if (typeof processarCertificado === 'function') {
            const { certificate, privateKey } = await processarCertificado(pfxBytes, senha);
            
            // Assinar com formato de SignedInfo igual à NFe
            return await assinarComFormatoNFe(xml, certificate, privateKey);
        }
        
        return null;
        
    } catch (erro) {
        console.error('❌ Erro ao criar assinatura formatada:', erro);
        return null;
    }
}

// Função de assinatura com formato igual à NFe que funciona
async function assinarComFormatoNFe(xml, certificate, privateKey) {
    try {
        console.log('🔧 Assinando com formato EXATO da NFe que funciona...');
        
        // Extrair InfRps
        const infRpsMatch = xml.match(/<InfRps[^>]*Id="([^"]*)"[^>]*>([\s\S]*?)<\/InfRps>/);
        if (!infRpsMatch) {
            throw new Error('InfRps não encontrado');
        }
        
        const infRpsId = infRpsMatch[1];
        const infRpsCompleto = infRpsMatch[0];
        
        // Canonicalizar
        const xmlCanonicalizado = canonicalizarXML(infRpsCompleto);
        
        // Digest SHA-1
        const md = forge.md.sha1.create();
        md.update(xmlCanonicalizado, 'utf8');
        const digestValue = forge.util.encode64(md.digest().bytes());
        
        // SignedInfo formatado EXATAMENTE como NFe (com quebras de linha)
        const signedInfoFormatado = `<SignedInfo>
<CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>
<SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1"/>
<Reference URI="#${infRpsId}">
<Transforms>
<Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/>
<Transform Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>
</Transforms>
<DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"/>
<DigestValue>${digestValue}</DigestValue>
</Reference>
</SignedInfo>`;
        
        console.log('📐 SignedInfo formatado como NFe (com quebras de linha)');
        
        // Canonicalizar SignedInfo
        const signedInfoCanonicalizado = canonicalizarXML(signedInfoFormatado);
        
        // Assinar
        const mdSignature = forge.md.sha1.create();
        mdSignature.update(signedInfoCanonicalizado, 'utf8');
        const signature = privateKey.sign(mdSignature);
        const signatureValue = forge.util.encode64(signature);
        
        // Certificado
        const certDer = forge.asn1.toDer(forge.pki.certificateToAsn1(certificate)).getBytes();
        const certificateValue = forge.util.encode64(certDer);
        
        // Assinatura completa formatada como NFe
        const xmlSignatureFormatada = `<Signature xmlns="http://www.w3.org/2000/09/xmldsig#">
${signedInfoFormatado}
<SignatureValue>${signatureValue}</SignatureValue>
<KeyInfo>
<X509Data>
<X509Certificate>${certificateValue}</X509Certificate>
</X509Data>
</KeyInfo>
</Signature>`;
        
        // Inserir assinatura no RPS
        let xmlAssinado = xml;
        const rpsPattern = new RegExp(`(<Rps[^>]*>[\\s\\S]*?<InfRps[^>]*Id="${infRpsId}"[^>]*>[\\s\\S]*?</InfRps>)([\\s\\S]*?)(</Rps>)`, 'i');
        const rpsMatch = xmlAssinado.match(rpsPattern);
        
        if (rpsMatch) {
            xmlAssinado = xmlAssinado.replace(rpsMatch[0], rpsMatch[1] + rpsMatch[2] + '\n' + xmlSignatureFormatada + '\n' + rpsMatch[3]);
        }
        
        // Assinar o lote também (mas apenas se necessário)
        xmlAssinado = await assinarLoteComFormatoNFe(xmlAssinado, certificate, privateKey);
        
        console.log('✅ Assinatura criada com formato NFe');
        return xmlAssinado;
        
    } catch (erro) {
        console.error('❌ Erro na assinatura formato NFe:', erro);
        throw erro;
    }
}

// Assinar lote com formato NFe
async function assinarLoteComFormatoNFe(xmlComRpsAssinados, certificate, privateKey) {
    try {
        // Extrair LoteRps
        const loteRpsMatch = xmlComRpsAssinados.match(/<LoteRps[^>]*>([\s\S]*?)<\/LoteRps>/);
        if (!loteRpsMatch) {
            return xmlComRpsAssinados; // Retorna sem assinatura do lote se não encontrar
        }
        
        const loteRpsTag = xmlComRpsAssinados.match(/<LoteRps[^>]*>/)[0];
        const idMatch = loteRpsTag.match(/Id="([^"]*)"/);
        if (!idMatch) {
            return xmlComRpsAssinados;
        }
        
        const loteRpsId = idMatch[1];
        const loteRpsCompleto = loteRpsMatch[0];
        
        // Canonicalizar e assinar
        const xmlCanonicalizado = canonicalizarXML(loteRpsCompleto);
        const md = forge.md.sha1.create();
        md.update(xmlCanonicalizado, 'utf8');
        const digestValue = forge.util.encode64(md.digest().bytes());
        
        // SignedInfo formatado
        const signedInfoLote = `<SignedInfo>
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
        
        const signedInfoCanonicalizado = canonicalizarXML(signedInfoLote);
        const mdSignature = forge.md.sha1.create();
        mdSignature.update(signedInfoCanonicalizado, 'utf8');
        const signature = privateKey.sign(mdSignature);
        const signatureValue = forge.util.encode64(signature);
        
        const certDer = forge.asn1.toDer(forge.pki.certificateToAsn1(certificate)).getBytes();
        const certificateValue = forge.util.encode64(certDer);
        
        const xmlSignatureLote = `<Signature xmlns="http://www.w3.org/2000/09/xmldsig#">
${signedInfoLote}
<SignatureValue>${signatureValue}</SignatureValue>
<KeyInfo>
<X509Data>
<X509Certificate>${certificateValue}</X509Certificate>
</X509Data>
</KeyInfo>
</Signature>`;
        
        // Inserir como irmã do LoteRps
        const xmlLoteAssinado = xmlComRpsAssinados.replace('</LoteRps>', '</LoteRps>\n' + xmlSignatureLote);
        
        return xmlLoteAssinado;
        
    } catch (erro) {
        console.error('❌ Erro na assinatura do lote formato NFe:', erro);
        return xmlComRpsAssinados;
    }
}

// TESTE 2: Assinatura única (apenas lote)
async function testarAssinaturaUnica() {
    try {
        console.log('\n🔧 TESTE 2: Assinatura única (apenas LoteRps)');
        console.log('===============================================');
        console.log('Hipótese: João Pessoa pode não aceitar dupla assinatura ABRASF');
        
        if (typeof gerarXMLNFSeABRASF === 'function') {
            const xml = gerarXMLNFSeABRASF();
            
            // Carregar certificado
            const response = await fetch('./certificados/pixelvivo.pfx');
            const pfxBuffer = await response.arrayBuffer();
            const pfxBytes = new Uint8Array(pfxBuffer);
            const senha = 'pixel2025';
            
            if (typeof processarCertificado === 'function') {
                const { certificate, privateKey } = await processarCertificado(pfxBytes, senha);
                
                // Assinar APENAS o lote (não os RPS individuais)
                const xmlApenasloteAssinado = await assinarApenasLote(xml, certificate, privateKey);
                
                console.log('✅ XML assinado apenas no lote');
                
                // Testar envio
                if (typeof enviarNFSeCompleta === 'function') {
                    try {
                        const resposta = await enviarNFSeCompleta(xmlApenasloteAssinado);
                        
                        console.log('\n📥 RESULTADO DO TESTE 2:');
                        console.log('=======================');
                        console.log(resposta);
                        
                        if (typeof resposta === 'string' && resposta.toLowerCase().includes('erro na assinatura')) {
                            console.log('\n❌ TESTE 2 FALHOU: Ainda erro de assinatura');
                            console.log('🔧 Problema pode ser específico do certificado ou AC');
                            
                        } else if (typeof resposta === 'string' && 
                                  (resposta.includes('<NumeroNfse>') || resposta.toLowerCase().includes('sucesso'))) {
                            console.log('\n🎉 TESTE 2 SUCESSO! Problema resolvido!');
                            console.log('✅ Assinatura única resolveu o problema!');
                            
                        } else {
                            console.log('\n📝 TESTE 2: Resultado inconcluso');
                        }
                        
                    } catch (erro) {
                        console.log('\n❌ ERRO no TESTE 2:', erro.message);
                    }
                }
            }
        }
        
    } catch (erro) {
        console.error('❌ Erro no teste de assinatura única:', erro);
    }
}

// Função para assinar apenas o lote
async function assinarApenasLote(xml, certificate, privateKey) {
    try {
        console.log('🔧 Assinando APENAS o LoteRps (sem RPS individuais)');
        
        // Extrair LoteRps
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
        
        // Canonicalizar e assinar
        const xmlCanonicalizado = canonicalizarXML(loteRpsCompleto);
        const md = forge.md.sha1.create();
        md.update(xmlCanonicalizado, 'utf8');
        const digestValue = forge.util.encode64(md.digest().bytes());
        
        // SignedInfo formatado como NFe
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
        
        const signedInfoCanonicalizado = canonicalizarXML(signedInfo);
        const mdSignature = forge.md.sha1.create();
        mdSignature.update(signedInfoCanonicalizado, 'utf8');
        const signature = privateKey.sign(mdSignature);
        const signatureValue = forge.util.encode64(signature);
        
        const certDer = forge.asn1.toDer(forge.pki.certificateToAsn1(certificate)).getBytes();
        const certificateValue = forge.util.encode64(certDer);
        
        const xmlSignature = `<Signature xmlns="http://www.w3.org/2000/09/xmldsig#">
${signedInfo}
<SignatureValue>${signatureValue}</SignatureValue>
<KeyInfo>
<X509Data>
<X509Certificate>${certificateValue}</X509Certificate>
</X509Data>
</KeyInfo>
</Signature>`;
        
        // Inserir como irmã do LoteRps
        const xmlAssinado = xml.replace('</LoteRps>', '</LoteRps>\n' + xmlSignature);
        
        return xmlAssinado;
        
    } catch (erro) {
        console.error('❌ Erro na assinatura única:', erro);
        throw erro;
    }
}

// Executar correção
console.log('⏳ Iniciando correção baseada em NFe em 2 segundos...');
setTimeout(aplicarCorrecaoBaseadaNFe, 2000);
