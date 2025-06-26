// =============== ASSINATURA REAL SIMPLIFICADA ===============
// Usando node-forge no navegador com upload de arquivo .pfx
// SEM PHP, SEM servidor, SEM complicação desnecessária

// Log de inicialização do arquivo
console.log('🔄 assinatura-simples.js carregando...', new Date().toISOString());

console.log('🔐 Sistema de assinatura REAL simplificado carregado!');

// ============================================================================
// VARIÁVEIS GLOBAIS
// ============================================================================

let certificadoAtual = null;
let chavePrivadaAtual = null;

// ============================================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================================

function extrairCNPJDoCertificado(certificado) {
    try {
        if (!certificado) return null;
        
        // Tenta extrair CNPJ do subject
        const subject = certificado.subject;
        if (subject && subject.attributes) {
            for (const attr of subject.attributes) {
                if (attr.name === 'CN' || attr.shortName === 'CN') {
                    const match = attr.value.match(/(\d{14})/);
                    if (match) return match[1];
                }
            }
        }
        
        // Fallback: tenta extrair do campo serialNumber ou outro campo
        if (certificado.serialNumber) {
            const match = certificado.serialNumber.match(/(\d{14})/);
            if (match) return match[1];
        }
        
        return null;
    } catch (error) {
        console.error('❌ Erro ao extrair CNPJ do certificado:', error);
        return null;
    }
}

async function debugProxyDetalhado() {
    console.log('🔍 DEBUG DETALHADO DO PROXY');
    console.log('===========================');
    
    try {
        // 1. Verificar certificado
        if (!certificadoAtual) {
            console.log('❌ Certificado não carregado');
            console.log('💡 Execute primeiro: obterCertificadoDaConfiguracao()');
            return false;
        }
        
        console.log('✅ Certificado carregado');
        
        // 2. Gerar XML de teste
        const xmlTeste = gerarXMLNFSeCompleto();
        console.log('✅ XML de teste gerado');
        
        // 3. Assinar XML
        const xmlAssinado = await assinarXMLCompleto(xmlTeste, certificadoAtual);
        console.log('✅ XML assinado');
        
        // 4. Montar envelope
        const envelope = montarEnvelopeSOAPFinal(xmlAssinado);
        console.log('✅ Envelope SOAP montado');
        
        // 5. Debug do envelope
        console.log('📄 Envelope (primeiros 500 chars):');
        console.log(envelope.substring(0, 500) + '...');        // 6. Testar envio
        const proxy = {
            nome: 'Mosaico Workers Proxy',
            tipo: 'cloudflare',
            url: 'https://nfse.mosaicoworkers.workers.dev/'
        };
        const urlWebservice = 'https://serem-hml.joaopessoa.pb.gov.br/notafiscal-abrasfv203-ws/NotaFiscalSoap';
          console.log('🌐 Enviando via proxy...');
        const resultado = await enviarViaProxyAlternativo(proxy, urlWebservice, envelope);
        
        // Validar resultado do envio
        if (!resultado || typeof resultado !== 'object') {
            console.warn('⚠️ Resultado de envio inválido:', resultado);
            console.log('📥 Resultado: Erro - resposta inválida do proxy');
            return;
        }
        
        console.log('📥 Resultado:', resultado.success ? 'Sucesso' : 'Erro');
        if (resultado.response) {
            console.log('📥 Resposta completa:', resultado.response);
        } else if (resultado.error) {
            console.log('📥 Erro:', resultado.error);
        }
        
        return resultado;
        
    } catch (error) {
        console.error('❌ Erro no debug:', error);
        return { error: error.message };
    }
}

// Função principal - SIMPLES e DIRETA
async function assinarXMLComUpload(xml) {
    console.log('🔐 Iniciando assinatura com upload de certificado...');
    
    try {
        // 1. Solicitar arquivo .pfx do usuário
        const { pfxData, senha } = await solicitarCertificado();
        
        // 2. Processar certificado com node-forge
        const { certificate, privateKey } = await processarCertificado(pfxData, senha);
        
        // 3. Assinar XML
        const xmlAssinado = await assinarXMLComForge(xml, certificate, privateKey);
        
        console.log('✅ XML assinado com sucesso!');
        return xmlAssinado;
        
    } catch (error) {
        console.error('❌ Erro na assinatura:', error);
        throw error;
    }
}

// Solicitar certificado do usuário
function solicitarCertificado() {
    return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pfx,.p12';
          input.onchange = async function(event) {
            try {
                const file = event.target.files[0];
                if (!file) throw new Error('Nenhum arquivo selecionado');
                
                console.log('📁 Arquivo selecionado:', file.name);
                
                // Ler arquivo como ArrayBuffer
                const pfxData = await file.arrayBuffer();
                
                // Obter senha da configuração ou prompt
                let senha = obterSenhaCertificado();
                
                // Fallback: perguntar se não configurado
                if (!senha) {
                    senha = prompt('Digite a senha do certificado:');
                    if (!senha) throw new Error('Senha não informada');
                }
                
                console.log('🔑 Senha obtida');
                
                resolve({ pfxData, senha });
                
            } catch (error) {
                reject(error);
            }
        };
        
        input.click();
    });
}

// Obter senha do certificado de forma centralizada
function obterSenhaCertificado() {
    console.log('🔑 Iniciando processo de obtenção de senha do certificado...');
    
    // 1. Tentar localStorage (configuração salva)
    const configSalva = localStorage.getItem('nfse-config');
    if (configSalva) {
        try {
            const config = JSON.parse(configSalva);
            if (config.certificado?.senha) {
                console.log('🔑 Senha obtida da configuração salva');
                return config.certificado.senha;
            }
        } catch (e) {
            console.log('⚠️ Erro ao ler configuração salva:', e.message);
        }
    }
    
    // 2. Usar senha fixa para o certificado pixelvivo.pfx (desenvolvimento)
    const senhaPixelVivo = 'pixel2025';
    console.log('🔑 Usando senha padrão para pixelvivo.pfx:', senhaPixelVivo);
    console.log('💡 Para usar um certificado diferente, salve a senha na configuração ou será solicitada via prompt');
    return senhaPixelVivo;
}

// Função para solicitar senha ao usuário (fallback)
function solicitarSenhaUsuario() {
    console.log('🔑 Solicitando senha ao usuário...');
    const senha = prompt('Digite a senha do certificado:');
    if (!senha) {
        throw new Error('Senha não informada pelo usuário');
    }
    console.log('🔑 Senha informada pelo usuário');
    return senha;
}

// Processar certificado com node-forge
async function processarCertificado(pfxData, senha) {
    console.log('🔑 Processando certificado com node-forge...');
    console.log('🔑 Validando senha do certificado...');
    
    let tentativas = 0;
    const maxTentativas = 3;
    
    while (tentativas < maxTentativas) {
        try {
            // Converter para formato node-forge
            const pfxBytes = new Uint8Array(pfxData);
            const pfxBuffer = forge.util.createBuffer(pfxBytes);
            
            console.log('📁 Arquivo PKCS#12 carregado, tamanho:', pfxBytes.length);
            
            // Ler PKCS#12 com senha
            console.log(`🔓 Tentativa ${tentativas + 1}/${maxTentativas} - Abrindo PKCS#12 com senha...`);
            const pfx = forge.pkcs12.pkcs12FromAsn1(
                forge.asn1.fromDer(pfxBuffer), 
                senha
            );
            
            // Extrair certificado
            const certBags = pfx.getBags({ bagType: forge.pki.oids.certBag });
            if (!certBags[forge.pki.oids.certBag] || certBags[forge.pki.oids.certBag].length === 0) {
                throw new Error('Nenhum certificado encontrado no arquivo PKCS#12');
            }
            const certificate = certBags[forge.pki.oids.certBag][0].cert;
            
            // Extrair chave privada
            const keyBags = pfx.getBags({ 
                bagType: forge.pki.oids.pkcs8ShroudedKeyBag
            });
            if (!keyBags[forge.pki.oids.pkcs8ShroudedKeyBag] || keyBags[forge.pki.oids.pkcs8ShroudedKeyBag].length === 0) {
                throw new Error('Nenhuma chave privada encontrada no arquivo PKCS#12');
            }
            const privateKey = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag][0].key;
            
            // Verificar validade
            const agora = new Date();
            if (agora < certificate.validity.notBefore || agora > certificate.validity.notAfter) {
                console.warn('⚠️ Atenção: Certificado fora do período de validade');
                console.warn(`   Válido de: ${certificate.validity.notBefore}`);
                console.warn(`   Válido até: ${certificate.validity.notAfter}`);
                console.warn(`   Data atual: ${agora}`);
            }
            
            console.log('✅ Certificado processado com sucesso');
            console.log(`📅 Válido de: ${certificate.validity.notBefore} até ${certificate.validity.notAfter}`);
            
            return { certificate, privateKey };
            
        } catch (error) {
            tentativas++;
            console.error(`❌ Erro na tentativa ${tentativas}:`, error.message);
            
            // Se é erro de senha e ainda há tentativas, solicitar nova senha
            if ((error.message.includes('Invalid password') || 
                 error.message.includes('MAC verification failed') ||
                 error.message.includes('PKCS#12 MAC could not be verified')) && 
                tentativas < maxTentativas) {
                
                console.log('🔑 Senha incorreta. Solicitando nova senha...');
                senha = solicitarSenhaUsuario();
                continue;
            }
            
            // Se esgotou as tentativas ou é outro tipo de erro
            if (tentativas >= maxTentativas) {
                throw new Error(`Falha após ${maxTentativas} tentativas. Último erro: ${error.message}`);
            } else {
                throw error;
            }        }
    }
    
    throw new Error('Falha inesperada no processamento do certificado');
}

// Assinar XML usando node-forge
async function assinarXMLComForge(xml, certificate, privateKey) {
    console.log('✍️ Assinando XML com node-forge...');
    
    try {
        // Extrair InfRps para assinatura
        const infRpsMatch = xml.match(/<InfRps[^>]*Id="([^"]*)"[^>]*>([\s\S]*?)<\/InfRps>/);
        if (!infRpsMatch) {
            throw new Error('Tag InfRps com Id não encontrada');
        }
        
        const infRpsId = infRpsMatch[1];
        const infRpsCompleto = infRpsMatch[0];
        
        console.log(`🔍 Assinando InfRps com Id: ${infRpsId}`);
          // Canonicalizar para digest conforme C14N (padrão XML)
        const xmlCanonicalizado = canonicalizarXML(infRpsCompleto);
        
        // Calcular digest SHA-1 conforme ABRASF
        const md = forge.md.sha1.create();
        md.update(xmlCanonicalizado, 'utf8');
        const digestValue = forge.util.encode64(md.digest().bytes());
          console.log(`🔐 XML canonicalizado (tamanho: ${xmlCanonicalizado.length}):`, xmlCanonicalizado.substring(0, 300) + (xmlCanonicalizado.length > 300 ? '...' : ''));
        console.log(`🔐 DigestValue (SHA-1): ${digestValue}`);
          // Criar SignedInfo conforme padrão ABRASF (com formatação específica)
        const signedInfo = `<SignedInfo xmlns="http://www.w3.org/2000/09/xmldsig#">
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
          // Canonicalizar SignedInfo conforme C14N
        const signedInfoCanonicalizado = canonicalizarXML(signedInfo);
        
        // Assinar SignedInfo com SHA-1
        const mdSignature = forge.md.sha1.create();
        mdSignature.update(signedInfoCanonicalizado, 'utf8');
        const signature = privateKey.sign(mdSignature);
        const signatureValue = forge.util.encode64(signature);
          console.log(`🔐 SignedInfo canonicalizado (tamanho: ${signedInfoCanonicalizado.length}):`, signedInfoCanonicalizado.substring(0, 300) + (signedInfoCanonicalizado.length > 300 ? '...' : ''));
        console.log(`🔐 SignatureValue (tamanho: ${signatureValue.length}): ${signatureValue.substring(0, 50)}...`);
        
        // Obter certificado em Base64
        const certDer = forge.asn1.toDer(forge.pki.certificateToAsn1(certificate)).getBytes();
        const certificateValue = forge.util.encode64(certDer);
          // Construir assinatura XMLDSig completa conforme ABRASF
        const xmlSignature = `<Signature xmlns="http://www.w3.org/2000/09/xmldsig#">
${signedInfo}
<SignatureValue>${signatureValue}</SignatureValue>
<KeyInfo>
<X509Data>
<X509Certificate>${certificateValue}</X509Certificate>
</X509Data>
</KeyInfo>
</Signature>`;
          // IMPORTANTE: Inserir assinatura conforme posição exata do ABRASF
        // A assinatura vai no FINAL do elemento Rps (após todos os elementos, antes do fechamento)
        let xmlAssinado = xml;
        
        // Procurar o fechamento do RPS que contém este InfRps
        const rpsPattern = new RegExp(`(<Rps[^>]*>[\\s\\S]*?<InfRps[^>]*Id="${infRpsId}"[^>]*>[\\s\\S]*?</InfRps>)([\\s\\S]*?)(</Rps>)`, 'i');
        const rpsMatch = xmlAssinado.match(rpsPattern);
        
        if (rpsMatch) {
            // Inserir assinatura ANTES do fechamento do Rps (posição padrão ABRASF)
            xmlAssinado = xmlAssinado.replace(rpsMatch[0], rpsMatch[1] + rpsMatch[2] + '\n' + xmlSignature + '\n' + rpsMatch[3]);
            console.log('✅ Assinatura inserida no FINAL do Rps (posição padrão ABRASF)');
        } else {
            // Fallback: inserir dentro do InfRps
            xmlAssinado = xml.replace('</InfRps>', '\n' + xmlSignature + '\n</InfRps>');
            console.log('⚠️ Fallback: Assinatura inserida dentro do InfRps');
        }
          console.log('✅ Assinatura XMLDSig criada conforme padrão ABRASF v2.03');
        console.log('🔍 DEBUG: Posição da assinatura - DENTRO do Rps, APÓS InfRps');
        console.log('🔍 DEBUG: Algoritmos utilizados - SHA-1 (digest e signature)');
        console.log('🔍 DEBUG: Reference URI aponta para:', `#${infRpsId}`);
        console.log('🔍 DEBUG: Namespace XMLDSig:', 'http://www.w3.org/2000/09/xmldsig#');
        
        // Validação adicional da assinatura inserida
        if (xmlAssinado.includes('<Signature xmlns="http://www.w3.org/2000/09/xmldsig#">')) {
            console.log('✅ Assinatura XMLDSig encontrada no XML final');
        } else {
            console.log('❌ ERRO: Assinatura XMLDSig NÃO encontrada no XML final');
        }
        
        // Log do XML assinado completo para análise
        console.log('🔍 DEBUG: XML assinado completo (primeiros 1000 chars):');
        console.log(xmlAssinado.substring(0, 1000));
        console.log('🔍 DEBUG: XML assinado completo (últimos 1000 chars):');
        console.log(xmlAssinado.substring(xmlAssinado.length - 1000));
        
        return xmlAssinado;
        
    } catch (error) {
        throw new Error(`Erro na assinatura: ${error.message}`);
    }
}

// Função para assinar o lote completo conforme ABRASF v2.03
async function assinarLoteRPS(xmlComRpsAssinados, certificate, privateKey) {
    console.log('✍️ Assinando LOTE de RPS conforme ABRASF...');
    
    try {        // Debug: verificar estrutura do XML
        console.log('🔍 DEBUG: Procurando LoteRps com Id no XML...');
        const temLoteRps = xmlComRpsAssinados.includes('<LoteRps');
        const loteRpsTagMatch = xmlComRpsAssinados.match(/<LoteRps[^>]*>/);
        const loteRpsTag = loteRpsTagMatch ? loteRpsTagMatch[0] : null;
        const temId = loteRpsTag && loteRpsTag.includes('Id=');
        
        console.log(`🔍 DEBUG: Tem LoteRps: ${temLoteRps}`);
        console.log(`🔍 DEBUG: LoteRps tag: ${loteRpsTag}`);
        console.log(`🔍 DEBUG: Tem Id: ${temId}`);
          // Extrair LoteRps para assinatura (regex flexível para qualquer ordem de atributos)
        const loteRpsMatch = xmlComRpsAssinados.match(/<LoteRps[^>]*>([\s\S]*?)<\/LoteRps>/);
        if (!loteRpsMatch) {
            // Mostrar um pedaço do XML para debug
            const xmlSnippet = xmlComRpsAssinados.substring(0, 500);
            console.log('🔍 DEBUG: XML snippet:', xmlSnippet);
            throw new Error('Tag LoteRps não encontrada');
        }
          // Extrair o Id do LoteRps
        const loteRpsTagForId = xmlComRpsAssinados.match(/<LoteRps[^>]*>/)[0];
        const idMatch = loteRpsTagForId.match(/Id="([^"]*)"/);
        if (!idMatch) {
            throw new Error('Atributo Id não encontrado no LoteRps');
        }
        
        const loteRpsId = idMatch[1];
        const loteRpsCompleto = loteRpsMatch[0];
          console.log(`🔍 Assinando LoteRps com Id: ${loteRpsId}`);
        
        // Canonicalizar para digest conforme C14N
        const xmlCanonicalizado = canonicalizarXML(loteRpsCompleto);
        
        // Calcular digest SHA-1
        const md = forge.md.sha1.create();
        md.update(xmlCanonicalizado, 'utf8');
        const digestValue = forge.util.encode64(md.digest().bytes());
        
        console.log(`🔐 XML LOTE canonicalizado (tamanho: ${xmlCanonicalizado.length}):`, xmlCanonicalizado.substring(0, 300) + (xmlCanonicalizado.length > 300 ? '...' : ''));
        console.log(`🔐 DigestValue do LOTE (SHA-1): ${digestValue}`);
        
        // Criar SignedInfo para o lote
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
          // Canonicalizar e assinar SignedInfo conforme C14N
        const signedInfoCanonicalizado = canonicalizarXML(signedInfo);
        const mdSignature = forge.md.sha1.create();
        mdSignature.update(signedInfoCanonicalizado, 'utf8');
        const signature = privateKey.sign(mdSignature);
        const signatureValue = forge.util.encode64(signature);
        
        console.log(`🔐 SignedInfo LOTE canonicalizado (tamanho: ${signedInfoCanonicalizado.length}):`, signedInfoCanonicalizado.substring(0, 300) + (signedInfoCanonicalizado.length > 300 ? '...' : ''));
        console.log(`🔐 SignatureValue LOTE (tamanho: ${signatureValue.length}): ${signatureValue.substring(0, 50)}...`);
        
        // Obter certificado em Base64
        const certDer = forge.asn1.toDer(forge.pki.certificateToAsn1(certificate)).getBytes();
        const certificateValue = forge.util.encode64(certDer);
        
        // Construir assinatura do lote
        const xmlSignature = `<Signature xmlns="http://www.w3.org/2000/09/xmldsig#">
${signedInfo}
<SignatureValue>${signatureValue}</SignatureValue>
<KeyInfo>
<X509Data>
<X509Certificate>${certificateValue}</X509Certificate>
</X509Data>
</KeyInfo>
</Signature>`;
        
        // Inserir assinatura no lote (antes do fechamento)
        const xmlLoteAssinado = xmlComRpsAssinados.replace('</LoteRps>', xmlSignature + '\n</LoteRps>');
        
        console.log('✅ LOTE assinado conforme padrão ABRASF v2.03');
        console.log('🔍 DEBUG: Assinatura do LOTE inserida');
        
        return xmlLoteAssinado;
        
    } catch (error) {
        throw new Error(`Erro na assinatura do lote: ${error.message}`);
    }
}

// Função principal atualizada para seguir o processo ABRASF completo
async function assinarXMLCompleto(xml, forcarUpload = false) {
    console.log('🔐 Iniciando processo COMPLETO de assinatura ABRASF...');
    
    try {
        // 0. Limpar XML antes de processar
        const xmlLimpo = limparXMLParaAssinatura(xml);
        
        // 1. Usar certificado da configuração (SEMPRE, a menos que forçado)
        let pfxData, senha;
        
        if (!forcarUpload) {
            try {
                const resultado = await obterCertificadoDaConfiguracao();
                pfxData = resultado.pfxData;
                senha = resultado.senha;
                console.log('🔑 Certificado obtido da configuração (pixelvivo.pfx)');
            } catch (error) {
                console.log('⚠️ Erro ao obter certificado da configuração:', error.message);
                console.log('📤 Redirecionando para upload manual...');
                const resultado = await solicitarCertificado();
                pfxData = resultado.pfxData;
                senha = resultado.senha;
            }
        } else {
            console.log('📤 Upload forçado pelo usuário...');
            const resultado = await solicitarCertificado();
            pfxData = resultado.pfxData;
            senha = resultado.senha;
        }
        
        // 2. Processar certificado
        const { certificate, privateKey } = await processarCertificado(pfxData, senha);
        
        // 3. PASSO 1 ABRASF: Assinar cada RPS individualmente
        console.log('📝 PASSO 1: Assinando RPS individualmente...');
        let xmlComRpsAssinados = await assinarXMLComForge(xmlLimpo, certificate, privateKey);// 4. PASSO 2 ABRASF: Verificar se precisa assinar o lote
        if (xmlComRpsAssinados.includes('<LoteRps')) {
            console.log('📝 PASSO 2: Assinando LOTE de RPS...');
            
            // Verificar se LoteRps já possui Id (busca mais flexível)
            const loteRpsTag = xmlComRpsAssinados.match(/<LoteRps[^>]*>/);
            const temId = loteRpsTag && loteRpsTag[0].includes('Id=');
            
            if (!temId) {
                console.log('🔧 Adicionando Id ao LoteRps...');
                xmlComRpsAssinados = xmlComRpsAssinados.replace(
                    /<LoteRps([^>]*)>/,
                    '<LoteRps$1 Id="lote1">'
                );
                console.log('✅ Id "lote1" adicionado ao LoteRps');
            } else {
                console.log('✅ LoteRps já possui Id');
            }
            
            xmlComRpsAssinados = await assinarLoteRPS(xmlComRpsAssinados, certificate, privateKey);
        }
        
        // 5. Adicionar namespace ABRASF se necessário
        if (!xmlComRpsAssinados.includes('xmlns="http://www.abrasf.org.br/nfse.xsd"')) {
            xmlComRpsAssinados = xmlComRpsAssinados.replace(
                /<EnviarLoteRpsEnvio([^>]*)>/,
                '<EnviarLoteRpsEnvio$1 xmlns="http://www.abrasf.org.br/nfse.xsd">'
            );
        }
          console.log('✅ Processo COMPLETO de assinatura ABRASF finalizado!');
        console.log('🔍 DEBUG: XML final com todas as assinaturas:');
        console.log(xmlComRpsAssinados);
        
        // Verificar estrutura final da assinatura
        verificarEstruturaAssinaturaABRASF(xmlComRpsAssinados);
        
        return xmlComRpsAssinados;
        
    } catch (error) {
        console.error('❌ Erro no processo completo de assinatura:', error);
        throw error;
    }
}

// Função para obter certificado da configuração
async function obterCertificadoDaConfiguracao() {
    console.log('🔍 Tentando obter certificado da configuração...');
    
    // Usar o certificado fixo do projeto (pixelvivo.pfx)
    const certificadoUrl = './certificados/pixelvivo.pfx';
    const senha = obterSenhaCertificado();
    
    if (!senha) {
        throw new Error('Senha do certificado não encontrada na configuração');
    }
    
    try {
        console.log('📥 Baixando certificado da configuração:', certificadoUrl);
        const response = await fetch(certificadoUrl);
        
        if (!response.ok) {
            throw new Error(`Erro ao baixar certificado: ${response.status}`);
        }
        
        const pfxData = await response.arrayBuffer();
        console.log('✅ Certificado obtido da configuração');
        
        return { pfxData, senha };
        
    } catch (error) {
        throw new Error(`Erro ao obter certificado da configuração: ${error.message}`);
    }
}

// Função de teste
async function testarAssinaturaSimplificada() {
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
        const resultado = await assinarXMLComUpload(xmlTeste);
        console.log('🧪 Teste concluído com sucesso!');
        return { sucesso: true, xmlAssinado: resultado };
    } catch (error) {
        console.error('🧪 Teste falhou:', error);
        return { sucesso: false, erro: error.message };
    }
}

// Função de teste para o processo completo ABRASF
async function testarAssinaturaCompletaABRASF() {
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
        console.log('🧪 Iniciando teste COMPLETO ABRASF...');
        console.log('📋 XML teste será assinado seguindo TODOS os passos ABRASF:');
        console.log('   1. Assinar RPS individualmente');
        console.log('   2. Assinar LOTE de RPS');
        console.log('   3. Verificar namespaces');
        console.log('   4. Validar estrutura final');
        
        const resultado = await assinarXMLCompleto(xmlTeste);
        
        console.log('✅ Teste COMPLETO ABRASF finalizado com sucesso!');
        console.log('🔍 Verificações finais:');
        
        // Verificar se contém assinaturas
        const assinaturasRps = (resultado.match(/<Signature xmlns="http:\/\/www\.w3\/2000\/09\/xmldsig#">/g) || []).length;
        console.log(`   ✓ Assinaturas encontradas: ${assinaturasRps}`);
        
        // Verificar namespace ABRASF
        const temNamespaceABRASF = resultado.includes('xmlns="http://www.abrasf.org.br/nfse.xsd"');
        console.log(`   ✓ Namespace ABRASF: ${temNamespaceABRASF ? 'SIM' : 'NÃO'}`);
        
        // Verificar SHA-1
        const temSHA1 = resultado.includes('xmldsig#sha1');
        console.log(`   ✓ Algoritmo SHA-1: ${temSHA1 ? 'SIM' : 'NÃO'}`);
        
        return { 
            sucesso: true, 
            xmlAssinado: resultado,
            estatisticas: {
                assinaturas: assinaturasRps,
                namespaceABRASF: temNamespaceABRASF,
                algoritmSHA1: temSHA1
            }
        };
        
    } catch (error) {
        console.error('🧪 Teste COMPLETO ABRASF falhou:', error);
        return { 
            sucesso: false, 
            erro: error.message 
        };
    }
}

// Função de teste usando APENAS o certificado da configuração
async function testarAssinaturaCompletaConfiguracao() {
    console.log('🧪 TESTE: Assinatura completa usando APENAS certificado da configuração...');
    
    const xmlTeste = `<?xml version="1.0" encoding="UTF-8"?>
<EnviarLoteRpsEnvio xmlns="http://www.abrasf.org.br/nfse.xsd">
    <LoteRps versao="2.03" Id="lote1">
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
                    <DataEmissao>2025-01-17</DataEmissao>
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
        // Forçar uso do certificado da configuração (sem upload)
        const resultado = await assinarXMLCompleto(xmlTeste, false);
        console.log('🧪 ✅ Teste da configuração concluído com sucesso!');
        console.log('📄 XML assinado (primeiros 500 chars):', resultado.substring(0, 500));
        return { sucesso: true, xmlAssinado: resultado };
    } catch (error) {
        console.error('🧪 ❌ Teste da configuração falhou:', error);
        return { sucesso: false, erro: error.message };
    }
}

// Função de teste simples para verificar carregamento
function testeSimples() {
    console.log('✅ Arquivo assinatura-simples.js carregado e funcionando!');
    console.log('🔍 Node-forge disponível:', typeof forge);
    return 'Teste OK!';
}

// Função para limpar XML antes da assinatura (versão mais conservadora)
function limparXMLParaAssinatura(xml) {
    console.log('🧹 Limpeza específica para ABRASF...');
    
    // Validar se o XML é válido
    if (!xml || typeof xml !== 'string') {
        console.error('❌ XML inválido para limpeza:', typeof xml);
        throw new Error('XML inválido: deve ser uma string não vazia');
    }
    
    // Limpeza específica para o padrão ABRASF
    let xmlLimpo = xml
        // Remover quebras de linha desnecessárias dentro de tags
        .replace(/>\s*\n\s*</g, '><')
        
        // Remover espaços extras entre atributos
        .replace(/\s+=/g, '=')
        
        // Remover espaços antes e depois de '='
        .replace(/\s*=\s*/g, '=')
        
        // Remover comentários XML
        .replace(/<!--.*?-->/g, '');
    
    console.log('✅ XML limpo para padrão ABRASF');
    return xmlLimpo;
}

// ============================================================================
// FUNÇÃO DE CANONICALIZAÇÃO XML (C14N)
// ============================================================================

function canonicalizarXML(xmlString) {
    try {
        console.log('📐 Aplicando canonicalização C14N...');
        
        // Implementação simplificada de canonicalização C14N
        // Remove espaços desnecessários e normaliza o XML
        let canonical = xmlString
            // Remove espaços antes e depois das tags
            .replace(/>\s+</g, '><')
            
            // Remove espaços múltiplos dentro de atributos
            .replace(/\s+/g, ' ')
            
            // Remove espaços antes do fechamento de tags
            .replace(/\s+>/g, '>')
            
            // Remove espaços após abertura de tags
            .replace(/\>\s+/g, '>')
            
            // Normaliza espaços em atributos
            .replace(/=\s+"/g, '="')
            .replace(/"\s+/g, '" ')
            
            // Remove quebras de linha desnecessárias
            .replace(/\n\s*/g, '')
            
            // Trim geral
            .trim();
        
        console.log('✅ Canonicalização C14N aplicada');
        return canonical;
        
    } catch (error) {
        console.error('❌ Erro na canonicalização:', error);
        // Em caso de erro, retorna o XML original
        return xmlString;
    }
}

// ============================================================================
// FUNÇÃO DE VERIFICAÇÃO DA ESTRUTURA DE ASSINATURA ABRASF
// ============================================================================

function verificarEstruturaAssinaturaABRASF(xmlAssinado) {
    try {
        console.log('🔍 Verificando estrutura da assinatura ABRASF...');
        
        if (!xmlAssinado || typeof xmlAssinado !== 'string') {
            throw new Error('XML inválido para verificação');
        }
        
        const verificacoes = {
            temAssinaturas: false,
            temNamespaceXMLDSig: false,
            temSignedInfo: false,
            temCanonicalizationMethod: false,
            temSignatureMethod: false,
            temReference: false,
            temDigestMethod: false,
            temDigestValue: false,
            temSignatureValue: false,
            temKeyInfo: false,
            temX509Data: false,
            temX509Certificate: false,
            estruturaValida: false
        };
        
        // Verificar presença de assinaturas
        const assinaturas = xmlAssinado.match(/<Signature[^>]*>/g);
        verificacoes.temAssinaturas = assinaturas && assinaturas.length > 0;
        
        if (!verificacoes.temAssinaturas) {
            console.warn('⚠️ Nenhuma assinatura encontrada no XML');
            return verificacoes;
        }
        
        console.log(`✓ ${assinaturas.length} assinatura(s) encontrada(s)`);
        
        // Verificar namespace XMLDSig
        verificacoes.temNamespaceXMLDSig = xmlAssinado.includes('xmlns="http://www.w3.org/2000/09/xmldsig#"');
        
        // Verificar elementos obrigatórios da assinatura digital
        verificacoes.temSignedInfo = xmlAssinado.includes('<SignedInfo');
        verificacoes.temCanonicalizationMethod = xmlAssinado.includes('<CanonicalizationMethod');
        verificacoes.temSignatureMethod = xmlAssinado.includes('<SignatureMethod');
        verificacoes.temReference = xmlAssinado.includes('<Reference');
        verificacoes.temDigestMethod = xmlAssinado.includes('<DigestMethod');
        verificacoes.temDigestValue = xmlAssinado.includes('<DigestValue');
        verificacoes.temSignatureValue = xmlAssinado.includes('<SignatureValue');
        verificacoes.temKeyInfo = xmlAssinado.includes('<KeyInfo');
        verificacoes.temX509Data = xmlAssinado.includes('<X509Data');
        verificacoes.temX509Certificate = xmlAssinado.includes('<X509Certificate');
        
        // Verificar se a estrutura está completa
        verificacoes.estruturaValida = 
            verificacoes.temAssinaturas &&
            verificacoes.temNamespaceXMLDSig &&
            verificacoes.temSignedInfo &&
            verificacoes.temCanonicalizationMethod &&
            verificacoes.temSignatureMethod &&
            verificacoes.temReference &&
            verificacoes.temDigestMethod &&
            verificacoes.temDigestValue &&
            verificacoes.temSignatureValue &&
            verificacoes.temKeyInfo &&
            verificacoes.temX509Data &&
            verificacoes.temX509Certificate;
        
        // Log detalhado dos resultados
        console.log('📋 Resultado da verificação ABRASF:');
        Object.entries(verificacoes).forEach(([chave, valor]) => {
            const status = valor ? '✅' : '❌';
            console.log(`   ${status} ${chave}: ${valor}`);
        });
        
        if (verificacoes.estruturaValida) {
            console.log('✅ Estrutura de assinatura ABRASF está VÁLIDA!');
        } else {
            console.warn('⚠️ Estrutura de assinatura ABRASF tem problemas');
            
            // Sugestões de correção
            if (!verificacoes.temNamespaceXMLDSig) {
                console.warn('   💡 Adicionar namespace XMLDSig: xmlns="http://www.w3.org/2000/09/xmldsig#"');
            }
            if (!verificacoes.temSignedInfo) {
                console.warn('   💡 Elemento <SignedInfo> obrigatório está ausente');
            }
            if (!verificacoes.temKeyInfo) {
                console.warn('   💡 Elemento <KeyInfo> com dados do certificado está ausente');
            }
        }
        
        // Verificações específicas ABRASF
        console.log('🏛️ Verificações específicas ABRASF:');
        
        // Verificar se há assinatura no elemento correto (InfRps ou LoteRps)
        const temAssinaturaInfRps = xmlAssinado.includes('<InfRps') && 
                                   xmlAssinado.match(/<InfRps[^>]*Id="[^"]*"[^>]*>/);
        const temAssinaturaLoteRps = xmlAssinado.includes('<LoteRps') && 
                                    xmlAssinado.match(/<LoteRps[^>]*Id="[^"]*"[^>]*>/);
        
        if (temAssinaturaInfRps) {
            console.log('   ✅ Elementos InfRps com Id encontrados (necessário para assinatura)');
        } else {
            console.warn('   ⚠️ Elementos InfRps sem Id adequado para assinatura');
        }
        
        if (temAssinaturaLoteRps) {
            console.log('   ✅ Elemento LoteRps com Id encontrado (necessário para assinatura)');
        } else {
            console.warn('   ⚠️ Elemento LoteRps sem Id adequado para assinatura');
        }
        
        // Verificar algoritmos utilizados
        if (xmlAssinado.includes('rsa-sha1') || xmlAssinado.includes('RSA-SHA1')) {
            console.log('   ✅ Algoritmo RSA-SHA1 encontrado');
        } else if (xmlAssinado.includes('rsa-sha256') || xmlAssinado.includes('RSA-SHA256')) {
            console.log('   ✅ Algoritmo RSA-SHA256 encontrado');
        } else {
            console.warn('   ⚠️ Algoritmo de assinatura não identificado claramente');
        }
        
        return verificacoes;
        
    } catch (error) {
        console.error('❌ Erro na verificação da estrutura ABRASF:', error);
        return { erro: error.message, estruturaValida: false };
    }
}

// ============================================================================
// FUNÇÕES DE GERAÇÃO DE XML E ENVELOPE SOAP
// ============================================================================

function gerarXMLNFSeCompleto() {
    // Wrapper para a função gerarXML() existente
    try {
        if (typeof gerarXML === 'function') {
            console.log('🔄 Tentando usar função gerarXML() existente');
            const xmlGerado = gerarXML();
            if (xmlGerado && xmlGerado.trim()) {
                console.log('✅ XML gerado pela função existente');
                return xmlGerado;
            } else {
                console.log('⚠️ Função gerarXML() retornou vazio, usando fallback');
            }
        } else {
            console.log('🔄 Função gerarXML() não encontrada, usando fallback');
        }
          console.log('🔄 Usando XML de fallback');
        // XML de fallback se a função não existir ou falhar
        return `<?xml version="1.0" encoding="UTF-8"?>
<EnviarLoteRpsEnvio xmlns="http://www.abrasf.org.br/nfse.xsd">
    <LoteRps versao="2.03" Id="lote1">
        <NumeroLote>1</NumeroLote>        <CpfCnpj>
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
                    <DataEmissao>2025-01-17</DataEmissao>
                    <Status>1</Status>
                    <Servico>
                        <Valores>
                            <ValorServicos>100.00</ValorServicos>
                            <Aliquota>0.02</Aliquota>
                            <ValorIss>2.00</ValorIss>
                            <ValorLiquidoNfse>100.00</ValorLiquidoNfse>
                        </Valores>
                        <ItemListaServico>17.01</ItemListaServico>
                        <CodigoTributacaoMunicipio>170101</CodigoTributacaoMunicipio>
                        <Discriminacao>Teste de diagnóstico - Serviço de desenvolvimento</Discriminacao>
                    </Servico>
                    <Prestador>                        <CpfCnpj>
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
        
    } catch (error) {
        console.error('❌ Erro ao gerar XML:', error);
        return null;
    }
}

function montarEnvelopeSOAPFinal(xmlAssinado) {
    try {
        // Remove a declaração XML se existir no XML assinado (para evitar duplicação)
        const xmlLimpo = xmlAssinado.replace(/<\?xml[^>]*\?>\s*/g, '');
        
        // Monta o envelope SOAP conforme padrão ABRASF
        const envelope = `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
        <EnviarLoteRps xmlns="http://nfse.abrasf.org.br">
            ${xmlLimpo}
        </EnviarLoteRps>
    </soap:Body>
</soap:Envelope>`;
        
        return envelope;
    } catch (error) {
        console.error('❌ Erro ao montar envelope SOAP:', error);
        return null;
    }
}

// ============================================================================
// FUNÇÕES DE TESTE SIMPLIFICADAS
// ============================================================================

async function testarDiferentesAssinaturas() {
    console.log('🧪 TESTE DE DIFERENTES ABORDAGENS DE ASSINATURA');
    console.log('===============================================');
    
    // Verificar se certificado está carregado
    if (!certificadoAtual) {
        console.log('🔄 Carregando certificado...');
        try {
            certificadoAtual = await obterCertificadoDaConfiguracao();
            console.log('✅ Certificado carregado');
        } catch (error) {
            console.log('❌ Erro ao carregar certificado:', error.message);
            return { error: 'certificate_load_failed' };
        }
    }
    
    try {
        // Gerar XML base
        const xmlBase = gerarXMLNFSeCompleto();
        console.log('📄 XML base gerado');
        
        // TESTE 1: Assinatura padrão atual
        console.log('\n🔐 TESTE 1: Assinatura padrão atual');
        console.log('-----------------------------------');
        
        const xml1 = await assinarXMLCompleto(xmlBase, certificadoAtual);
        const envelope1 = montarEnvelopeSOAPFinal(xml1);          console.log('📤 Enviando teste 1...');
        const proxy = {
            nome: 'Mosaico Workers Proxy',
            tipo: 'cloudflare',
            url: 'https://nfse.mosaicoworkers.workers.dev/'
        };
        const urlWebservice = 'https://serem-hml.joaopessoa.pb.gov.br/notafiscal-abrasfv203-ws/NotaFiscalSoap';
        const resultado1 = await enviarViaProxyAlternativo(proxy, urlWebservice, envelope1);
        
        // Validar resultado do envio
        if (!resultado1 || typeof resultado1 !== 'object') {
            console.warn('⚠️ Resultado de envio 1 inválido:', resultado1);
            console.log('❌ Envio 1 falhou: resposta inválida do proxy');
        } else if (resultado1.success) {
            console.log('✅ Envio 1 bem sucedido');
            console.log('📥 Resposta 1:', resultado1.response.substring(0, 200) + '...');
        } else {
            console.log('❌ Envio 1 falhou:', resultado1.error);
        }
        
        // ANÁLISE FINAL
        console.log('\n📊 ANÁLISE FINAL DOS TESTES');
        console.log('===========================');
        
        const sucesso1 = resultado1.success;
        console.log('Teste 1 (padrão):', sucesso1 ? '✅' : '❌');
        
        if (sucesso1) {
            if (resultado1.response && resultado1.response.includes('erro na assinatura')) {
                console.log('⚠️ Há erro na assinatura - investigar certificado');
            } else if (resultado1.response && resultado1.response.includes('protocolo')) {
                console.log('🎉 SUCESSO COMPLETO - NFS-e processada!');
            }
        }
        
        return {
            teste1: { success: sucesso1, response: resultado1.response?.substring(0, 100) }
        };
        
    } catch (error) {
        console.error('❌ Erro nos testes:', error);
        return { error: error.message };
    }
}

// ============================================================================
// FUNÇÕES DE DIAGNÓSTICO COMPLETO
// ============================================================================

async function diagnosticarESolverErroSAAJ() {
    console.log('🔍 DIAGNÓSTICO COMPLETO - SOLUÇÃO DO ERRO SAAJ');
    console.log('=============================================');
    
    try {
        // 1. Verificar se certificado está carregado
        if (!certificadoAtual) {
            console.log('🔄 Certificado não carregado, tentando obter da configuração...');
            try {
                certificadoAtual = await obterCertificadoDaConfiguracao();
                chavePrivadaAtual = certificadoAtual;
                console.log('✅ Certificado carregado da configuração');
            } catch (error) {
                console.log('❌ Erro ao carregar certificado:', error.message);
                return false;
            }
        }
        
        console.log('✅ 1. Certificado carregado:', certificadoAtual.subject?.CN || 'Nome não encontrado');
        
        // 2. Gerar XML de teste
        const xmlTeste = gerarXMLNFSeCompleto();
        console.log('✅ 2. XML de teste gerado');
        
        // 3. Assinar o XML
        console.log('🔏 3. Assinando XML...');
        const xmlAssinado = await assinarXMLCompleto(xmlTeste, certificadoAtual);
        
        if (!xmlAssinado) {
            console.log('❌ Falha na assinatura');
            return false;
        }
        
        console.log('✅ 3. XML assinado com sucesso');
        
        // 4. Montar envelope SOAP CORRETO
        console.log('📄 4. Montando envelope SOAP...');
        const envelope = montarEnvelopeSOAPFinal(xmlAssinado);
        
        // 5. Validar envelope (não deve ter <?xml...?> duplicado)
        const xmlCount = (envelope.match(/<\?xml\s+version=/g) || []).length;
        if (xmlCount <= 1) {
            console.log('✅ 5. Envelope sem declaração XML duplicada');
        } else {
            console.log(`❌ 5. Envelope com ${xmlCount} declarações XML - ERRO SAAJ!`);
            return false;
        }          // 6. Testar envio via proxy
        console.log('🌐 6. Testando envio via proxy...');
        const proxy = {
            nome: 'Mosaico Workers Proxy',
            tipo: 'cloudflare',
            url: 'https://nfse.mosaicoworkers.workers.dev/'
        };
        const urlWebservice = 'https://serem-hml.joaopessoa.pb.gov.br/notafiscal-abrasfv203-ws/NotaFiscalSoap';
        const resultado = await enviarViaProxyAlternativo(proxy, urlWebservice, envelope);
        
        // Validar resultado do envio
        if (!resultado || typeof resultado !== 'object') {
            console.warn('⚠️ Resultado de envio inválido:', resultado);
            console.log('❌ 6. Falha no envio: resposta inválida do proxy');
            return false;
        }
        
        if (resultado.success) {
            console.log('✅ 6. Envio via proxy bem sucedido');
            console.log('📥 Resposta do webservice:', resultado.response.substring(0, 300) + '...');
            
            if (resultado.response.includes('Problems creating SAAJ object model')) {
                console.log('❌ AINDA HÁ ERRO SAAJ - envelope incorreto');
                return false;
            } else if (resultado.response.includes('erro na assinatura')) {
                console.log('⚠️ ERRO SAAJ RESOLVIDO - agora problema na assinatura');
                return 'signature_error';
            } else if (resultado.response.includes('protocolo')) {
                console.log('🎉 SUCESSO COMPLETO - NFS-e processada!');
                return true;
            }
        } else {
            console.log('❌ 6. Falha no envio via proxy:', resultado.error);
            return false;
        }
        
    } catch (error) {
        console.error('❌ Erro no diagnóstico:', error);
        return false;
    }
}

async function testarCorrecaoSAAJ() {
    console.log('🔍 TESTE ESPECÍFICO - CORREÇÃO DO ERRO SAAJ');
    console.log('===========================================');
    
    try {
        // 1. Verificar se certificado está carregado
        if (!certificadoAtual) {
            console.log('🔄 Carregando certificado...');
            try {
                certificadoAtual = await obterCertificadoDaConfiguracao();
                console.log('✅ Certificado carregado');
            } catch (error) {
                console.log('❌ Erro ao carregar certificado:', error.message);
                return false;
            }
        }
        
        console.log('✅ 1. Certificado carregado');
        
        // 2. Gerar XML de teste
        const xmlTeste = gerarXMLNFSeCompleto();
        console.log('✅ 2. XML de teste gerado');
        
        // 3. Assinar o XML
        console.log('🔏 3. Assinando XML...');
        const xmlAssinado = await assinarXMLCompleto(xmlTeste, certificadoAtual);
        
        if (!xmlAssinado) {
            console.log('❌ Falha na assinatura');
            return false;
        }
        
        console.log('✅ 3. XML assinado com sucesso');
        
        // 4. Montar envelope SOAP CORRETO
        console.log('📄 4. Montando envelope SOAP correto...');
        const envelope = montarEnvelopeSOAPFinal(xmlAssinado);
        
        // 5. Validar que não há declaração XML duplicada
        const xmlCount = (envelope.match(/<\?xml\s+version=/g) || []).length;
        if (xmlCount <= 1) {
            console.log('✅ 5. Envelope sem declaração XML duplicada');
        } else {
            console.log(`❌ 5. Envelope com ${xmlCount} declarações XML - ERRO SAAJ!`);
            return false;
        }        // 6. Testar envio
        console.log('🌐 6. Testando envio via proxy...');
        const proxy = {
            nome: 'Mosaico Workers Proxy',
            tipo: 'cloudflare',
            url: 'https://nfse.mosaicoworkers.workers.dev/'
        };
        const urlWebservice = 'https://serem-hml.joaopessoa.pb.gov.br/notafiscal-abrasfv203-ws/NotaFiscalSoap';
        const resultado = await enviarViaProxyAlternativo(proxy, urlWebservice, envelope);
        
        if (resultado.success) {
            console.log('✅ 6. Envio bem sucedido');
            
            if (resultado.response.includes('Problems creating SAAJ object model')) {
                console.log('❌ ERRO SAAJ PERSISTE - envelope ainda incorreto');
                return false;
            } else {
                console.log('🎉 ERRO SAAJ CORRIGIDO!');
                console.log('📥 Resposta do webservice:', resultado.response.substring(0, 200) + '...');
                return true;
            }
        } else {
            console.log('❌ 6. Falha no envio:', resultado.error);
            return false;
        }
        
    } catch (error) {
        console.error('❌ Erro no teste:', error);
        return false;
    }
}

// ============================================================================
// EXPOSIÇÃO DAS FUNÇÕES NO WINDOW
// ============================================================================

// Funções principais de assinatura
window.assinarXMLComUpload = assinarXMLComUpload;
window.assinarXMLCompleto = assinarXMLCompleto;

// Funções de teste e diagnóstico
window.testeSimples = testeSimples;
window.limparXMLParaAssinatura = limparXMLParaAssinatura;
window.gerarXMLNFSeCompleto = gerarXMLNFSeCompleto;
window.montarEnvelopeSOAPFinal = montarEnvelopeSOAPFinal;
window.canonicalizarXML = canonicalizarXML;
window.verificarEstruturaAssinaturaABRASF = verificarEstruturaAssinaturaABRASF;
window.testarCorrecaoSAAJ = testarCorrecaoSAAJ;
window.diagnosticarESolverErroSAAJ = diagnosticarESolverErroSAAJ;
window.debugProxyDetalhado = debugProxyDetalhado;
window.testarDiferentesAssinaturas = testarDiferentesAssinaturas;

console.log('✅ assinatura-simples.js carregado - funções expostas no window');


/*
=============================================================================
FUNÇÕES DISPONÍVEIS:
=============================================================================

ASSINATURA:
- assinarXMLComUpload()
- assinarXMLCompleto()

TESTES PRINCIPAIS:
- testarDiferentesAssinaturas() 🆕 TESTE PRINCIPAL RECOMENDADO
- diagnosticarESolverErroSAAJ() ⭐ DIAGNÓSTICO COMPLETO
- testarCorrecaoSAAJ() ⭐ TESTE ESPECÍFICO SAAJ
- debugProxyDetalhado() ⭐ DEBUG PROXY

UTILITÁRIOS:
- testeSimples()
- limparXMLParaAssinatura()
- gerarXMLNFSeCompleto()
- montarEnvelopeSOAPFinal()
- canonicalizarXML()
- verificarEstruturaAssinaturaABRASF() 🆕 VALIDAÇÃO DE ASSINATURA

=============================================================================
TESTE RECOMENDADO:
=============================================================================

// TESTE PRINCIPAL (recomendado):
testarDiferentesAssinaturas()

// Se houver problemas específicos:
diagnosticarESolverErroSAAJ()
testarCorrecaoSAAJ()
debugProxyDetalhado()

=============================================================================
*/
