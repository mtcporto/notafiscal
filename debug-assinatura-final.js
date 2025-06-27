console.log('🔍 DEBUG FINAL - Analisando problema de assinatura João Pessoa');

// ==================== SETUP ====================
const forge = require('node-forge');
const fs = require('fs');
const path = require('path');

// Configuração do teste
const CONFIG = {
  certificadoPath: path.join(__dirname, 'certificados', 'Wayne Enterprises, Inc..pfx'),
  senhaCertificado: '123456',
  joaoPessoaCNPJ: '04281067000130'
};

// ==================== FUNÇÕES AUXILIARES ====================

// Função de canonicalização C14N original que funcionou
function canonicalizarXMLOriginal(xmlString) {
    try {
        console.log('📐 Canonicalização C14N original (que funcionou)...');
        
        let canonical = xmlString
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .replace(/>\s*\n\s*</g, '><')
            .replace(/>\s+</g, '><')
            .replace(/\s*=\s*/g, '=')
            .replace(/="\s+/g, '="')
            .replace(/\s+"/g, '"')
            .replace(/\s*\/>/g, '/>')
            .replace(/\s*>/g, '>')
            .replace(/  +/g, ' ')
            .trim();
        
        return canonical;
        
    } catch (error) {
        console.error('❌ Erro na canonicalização:', error);
        return xmlString;
    }
}

// Função de canonicalização C14N mais agressiva (teste)
function canonicalizarXMLAgressiva(xmlString) {
    try {
        console.log('📐 Canonicalização C14N agressiva (teste)...');
        
        let canonical = xmlString
            // Remove TUDO: quebras, espaços, tabs
            .replace(/\s+/g, '')
            // Recoloca apenas os espaços essenciais em atributos
            .replace(/="/g, '="')
            .replace(/"/g, '"')
            // Remove espaços antes e depois do =
            .replace(/\s*=\s*/g, '=');
        
        return canonical;
        
    } catch (error) {
        console.error('❌ Erro na canonicalização agressiva:', error);
        return xmlString;
    }
}

// Função para carregar certificado
function carregarCertificado() {
    try {
        console.log('🔐 Carregando certificado...');
        
        const certificadoBuffer = fs.readFileSync(CONFIG.certificadoPath);
        const p12Asn1 = forge.asn1.fromDer(certificadoBuffer.toString('binary'));
        const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, CONFIG.senhaCertificado);
        
        const bags = p12.getBags({ bagType: forge.pki.oids.certBag });
        const certificate = bags[forge.pki.oids.certBag][0].cert;
        
        const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
        const privateKey = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag][0].key;
        
        console.log('✅ Certificado carregado com sucesso');
        console.log('📋 Subject:', certificate.subject.getField('CN').value);
        
        return { certificate, privateKey };
        
    } catch (error) {
        console.error('❌ Erro ao carregar certificado:', error);
        throw error;
    }
}

// Função para gerar XML básico João Pessoa (apenas estrutura essencial)
function gerarXMLJoaoPessoaBasico() {
    const agora = new Date();
    const dataFormatada = agora.toISOString().slice(0, 19);
    const numeroLote = Math.floor(Math.random() * 999999) + 1;
    const numeroRps = Math.floor(Math.random() * 999999) + 1;
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tc="http://www.portalfiscal.inf.br/nfse">
<soap:Body>
<tc:RecepcionarLoteRps>
<EnviarLoteRpsEnvio xmlns="http://www.abrasf.org.br/nfse.xsd">
<LoteRps Id="lote${numeroLote}" versao="2.03">
<NumeroLote>${numeroLote}</NumeroLote>
<CpfCnpj>
<Cnpj>${CONFIG.joaoPessoaCNPJ}</Cnpj>
</CpfCnpj>
<InscricaoMunicipal>123456</InscricaoMunicipal>
<QuantidadeRps>1</QuantidadeRps>
<ListaRps>
<Rps>
<InfDeclaracaoPrestacaoServico Id="rps${numeroRps}">
<Rps>
<IdentificacaoRps>
<Numero>${numeroRps}</Numero>
<Serie>1</Serie>
<Tipo>1</Tipo>
</IdentificacaoRps>
<DataEmissao>${dataFormatada}</DataEmissao>
<Status>1</Status>
</Rps>
<Competencia>${dataFormatada}</Competencia>
<Servico>
<Valores>
<ValorServicos>100.00</ValorServicos>
<ValorLiquidoNfse>100.00</ValorLiquidoNfse>
</Valores>
<IssRetido>2</IssRetido>
<ItemListaServico>1401</ItemListaServico>
<CodigoMunicipio>2507507</CodigoMunicipio>
<Discriminacao>Teste de servico</Discriminacao>
<CodigoMunicipio>2507507</CodigoMunicipio>
</Servico>
<Prestador>
<CpfCnpj>
<Cnpj>${CONFIG.joaoPessoaCNPJ}</Cnpj>
</CpfCnpj>
<InscricaoMunicipal>123456</InscricaoMunicipal>
</Prestador>
<TomadorServico>
<IdentificacaoTomador>
<CpfCnpj>
<Cnpj>11222333000144</Cnpj>
</CpfCnpj>
</IdentificacaoTomador>
<RazaoSocial>Cliente Teste</RazaoSocial>
</TomadorServico>
</InfDeclaracaoPrestacaoServico>
</Rps>
</ListaRps>
</LoteRps>
</EnviarLoteRpsEnvio>
</tc:RecepcionarLoteRps>
</soap:Body>
</soap:Envelope>`;
}

// ==================== FUNÇÕES DE ASSINATURA ====================

// Assinatura método 1: LoteRps apenas (original)
async function assinarMetodo1(xml, certificate, privateKey) {
    console.log('\n🔐 MÉTODO 1: Assinando apenas LoteRps...');
    
    try {
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
        
        console.log('🎯 ID do LoteRps:', loteRpsId);
        
        // Canonicalizar (método original)
        const xmlCanonicalizado = canonicalizarXMLOriginal(loteRpsCompleto);
        
        // Digest SHA-1
        const md = forge.md.sha1.create();
        md.update(xmlCanonicalizado, 'utf8');
        const digestValue = forge.util.encode64(md.digest().bytes());
        
        console.log('🔐 Digest Value:', digestValue.substring(0, 20) + '...');
        
        // SignedInfo EXATO (com xmlns)
        const signedInfo = `<SignedInfo xmlns="http://www.w3.org/2000/09/xmldsig#">
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
        
        // Assinar SignedInfo
        const signedInfoCanonicalizado = canonicalizarXMLOriginal(signedInfo);
        const mdSignature = forge.md.sha1.create();
        mdSignature.update(signedInfoCanonicalizado, 'utf8');
        const signature = privateKey.sign(mdSignature);
        const signatureValue = forge.util.encode64(signature);
        
        console.log('✅ Signature Value:', signatureValue.substring(0, 30) + '...');
        
        // Certificado
        const certDer = forge.asn1.toDer(forge.pki.certificateToAsn1(certificate)).getBytes();
        const certificateValue = forge.util.encode64(certDer);
        
        // Assinatura conforme modelo oficial
        const xmlSignature = `<Signature xmlns="http://www.w3.org/2000/09/xmldsig#">
${signedInfo}
<SignatureValue>${signatureValue}</SignatureValue>
<KeyInfo>
<X509Data>
<X509Certificate>${certificateValue}</X509Certificate>
</X509Data>
</KeyInfo>
</Signature>`;
        
        // Inserir assinatura após LoteRps
        const xmlAssinado = xml.replace('</LoteRps>', '</LoteRps>\n' + xmlSignature);
        
        console.log('✅ XML assinado - Método 1');
        
        return {
            xml: xmlAssinado,
            digestValue,
            signatureValue,
            metodo: 'LoteRps apenas (original)'
        };
        
    } catch (erro) {
        console.error('❌ Erro no Método 1:', erro);
        throw erro;
    }
}

// Assinatura método 2: LoteRps com canonicalização agressiva
async function assinarMetodo2(xml, certificate, privateKey) {
    console.log('\n🔐 MÉTODO 2: LoteRps com canonicalização agressiva...');
    
    try {
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
        
        console.log('🎯 ID do LoteRps:', loteRpsId);
        
        // Canonicalizar (método agressivo)
        const xmlCanonicalizado = canonicalizarXMLAgressiva(loteRpsCompleto);
        
        // Digest SHA-1
        const md = forge.md.sha1.create();
        md.update(xmlCanonicalizado, 'utf8');
        const digestValue = forge.util.encode64(md.digest().bytes());
        
        console.log('🔐 Digest Value (agressivo):', digestValue.substring(0, 20) + '...');
        
        // SignedInfo EXATO (com xmlns)
        const signedInfo = `<SignedInfo xmlns="http://www.w3.org/2000/09/xmldsig#">
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
        
        // Assinar SignedInfo (também com canonicalização agressiva)
        const signedInfoCanonicalizado = canonicalizarXMLAgressiva(signedInfo);
        const mdSignature = forge.md.sha1.create();
        mdSignature.update(signedInfoCanonicalizado, 'utf8');
        const signature = privateKey.sign(mdSignature);
        const signatureValue = forge.util.encode64(signature);
        
        console.log('✅ Signature Value (agressivo):', signatureValue.substring(0, 30) + '...');
        
        // Certificado
        const certDer = forge.asn1.toDer(forge.pki.certificateToAsn1(certificate)).getBytes();
        const certificateValue = forge.util.encode64(certDer);
        
        // Assinatura conforme modelo oficial
        const xmlSignature = `<Signature xmlns="http://www.w3.org/2000/09/xmldsig#">
${signedInfo}
<SignatureValue>${signatureValue}</SignatureValue>
<KeyInfo>
<X509Data>
<X509Certificate>${certificateValue}</X509Certificate>
</X509Data>
</KeyInfo>
</Signature>`;
        
        // Inserir assinatura após LoteRps
        const xmlAssinado = xml.replace('</LoteRps>', '</LoteRps>\n' + xmlSignature);
        
        console.log('✅ XML assinado - Método 2');
        
        return {
            xml: xmlAssinado,
            digestValue,
            signatureValue,
            metodo: 'LoteRps com canonicalização agressiva'
        };
        
    } catch (erro) {
        console.error('❌ Erro no Método 2:', erro);
        throw erro;
    }
}

// Assinatura método 3: SignedInfo SEM xmlns
async function assinarMetodo3(xml, certificate, privateKey) {
    console.log('\n🔐 MÉTODO 3: SignedInfo SEM xmlns...');
    
    try {
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
        
        console.log('🎯 ID do LoteRps:', loteRpsId);
        
        // Canonicalizar (método original)
        const xmlCanonicalizado = canonicalizarXMLOriginal(loteRpsCompleto);
        
        // Digest SHA-1
        const md = forge.md.sha1.create();
        md.update(xmlCanonicalizado, 'utf8');
        const digestValue = forge.util.encode64(md.digest().bytes());
        
        console.log('🔐 Digest Value:', digestValue.substring(0, 20) + '...');
        
        // SignedInfo SEM xmlns (teste)
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
        
        // Assinar SignedInfo
        const signedInfoCanonicalizado = canonicalizarXMLOriginal(signedInfo);
        const mdSignature = forge.md.sha1.create();
        mdSignature.update(signedInfoCanonicalizado, 'utf8');
        const signature = privateKey.sign(mdSignature);
        const signatureValue = forge.util.encode64(signature);
        
        console.log('✅ Signature Value:', signatureValue.substring(0, 30) + '...');
        
        // Certificado
        const certDer = forge.asn1.toDer(forge.pki.certificateToAsn1(certificate)).getBytes();
        const certificateValue = forge.util.encode64(certDer);
        
        // Assinatura conforme modelo oficial
        const xmlSignature = `<Signature xmlns="http://www.w3.org/2000/09/xmldsig#">
${signedInfo}
<SignatureValue>${signatureValue}</SignatureValue>
<KeyInfo>
<X509Data>
<X509Certificate>${certificateValue}</X509Certificate>
</X509Data>
</KeyInfo>
</Signature>`;
        
        // Inserir assinatura após LoteRps
        const xmlAssinado = xml.replace('</LoteRps>', '</LoteRps>\n' + xmlSignature);
        
        console.log('✅ XML assinado - Método 3');
        
        return {
            xml: xmlAssinado,
            digestValue,
            signatureValue,
            metodo: 'SignedInfo SEM xmlns'
        };
        
    } catch (erro) {
        console.error('❌ Erro no Método 3:', erro);
        throw erro;
    }
}

// ==================== FUNÇÃO DE TESTE ====================

async function testarAssinaturas() {
    try {
        console.log('🚀 Iniciando teste de assinaturas João Pessoa...\n');
        
        // Carregar certificado
        const { certificate, privateKey } = carregarCertificado();
        
        // Gerar XML base
        const xmlBase = gerarXMLJoaoPessoaBasico();
        console.log('📝 XML base gerado com', xmlBase.length, 'caracteres\n');
        
        // Testar diferentes métodos de assinatura
        const metodos = [
            { nome: 'Método 1', funcao: assinarMetodo1 },
            { nome: 'Método 2', funcao: assinarMetodo2 },
            { nome: 'Método 3', funcao: assinarMetodo3 }
        ];
        
        const resultados = [];
        
        for (const metodo of metodos) {
            try {
                const resultado = await metodo.funcao(xmlBase, certificate, privateKey);
                resultados.push(resultado);
                
                // Salvar XML assinado para análise
                const nomeArquivo = `teste-assinatura-${metodo.nome.toLowerCase().replace(' ', '-')}.xml`;
                fs.writeFileSync(nomeArquivo, resultado.xml);
                console.log(`💾 Salvo: ${nomeArquivo}`);
                
            } catch (erro) {
                console.error(`❌ Falha no ${metodo.nome}:`, erro.message);
            }
        }
        
        // Comparar resultados
        console.log('\n📊 COMPARAÇÃO DOS RESULTADOS:');
        console.log('=' .repeat(60));
        
        resultados.forEach((resultado, index) => {
            console.log(`\n${index + 1}. ${resultado.metodo}`);
            console.log(`   Digest: ${resultado.digestValue.substring(0, 30)}...`);
            console.log(`   Signature: ${resultado.signatureValue.substring(0, 30)}...`);
            console.log(`   Tamanho XML: ${resultado.xml.length} caracteres`);
        });
        
        console.log('\n🎯 XMLs gerados para teste manual no webservice.');
        console.log('📂 Arquivos salvos no diretório atual para análise.');
        
    } catch (erro) {
        console.error('❌ Erro no teste:', erro);
    }
}

// Executar teste
if (require.main === module) {
    testarAssinaturas();
}

module.exports = {
    testarAssinaturas,
    canonicalizarXMLOriginal,
    canonicalizarXMLAgressiva
};
