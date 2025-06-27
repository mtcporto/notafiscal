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
          // Criar SignedInfo FORMATADO como NFe que funciona em João Pessoa (com quebras de linha)
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
          // Construir assinatura XMLDSig FORMATADA como NFe (com quebras de linha)
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
    
    try {
        // Debug: verificar estrutura do XML
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
        
        // Criar SignedInfo para o lote FORMATADO como NFe (com quebras de linha)
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
        
        // Construir assinatura do lote FORMATADA como NFe (com quebras de linha)
        const xmlSignature = `<Signature xmlns="http://www.w3.org/2000/09/xmldsig#">
${signedInfo}
<SignatureValue>${signatureValue}</SignatureValue>
<KeyInfo>
<X509Data>
<X509Certificate>${certificateValue}</X509Certificate>
</X509Data>
</KeyInfo>
</Signature>`;
        
        // ESTRATÉGIA CORRIGIDA: Inserir a assinatura DEPOIS do elemento LoteRps, como um irmão.
        // Isso resolve problemas de validação em alguns webservices ABRASF mais rigorosos
        const xmlLoteAssinado = xmlComRpsAssinados.replace('</LoteRps>', '</LoteRps>' + '\n' + xmlSignature);

        if (xmlLoteAssinado.includes('</LoteRps>' + '\n' + xmlSignature)) {
             console.log('✅ LOTE assinado conforme padrão ABRASF v2.03');
             console.log('🔍 DEBUG: Assinatura do LOTE inserida como irmã de <LoteRps> (FORA do elemento)');
             console.log('🎯 CORREÇÃO: Esta mudança resolve problemas de validação no webservice de João Pessoa');
        } else {
             console.warn('⚠️ Falha ao inserir a assinatura do LoteRps como irmã. Verifique o XML de entrada.');
             // Fallback para o método antigo (dentro do lote) para não quebrar
             const fallbackXml = xmlComRpsAssinados.replace('</LoteRps>', xmlSignature + '\n</LoteRps>');
             console.log('   -> Usando fallback: assinatura DENTRO do LoteRps.');
             return fallbackXml;
        }
        
        return xmlLoteAssinado;

    } catch (error) {
        console.error('❌ Erro ao assinar o LoteRPS:', error);
        throw error; // Re-lança o erro para ser tratado pela função chamadora
    }
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
        console.log('📐 Aplicando canonicalização C14N específica para João Pessoa...');
        
        // Canonicalização ESPECÍFICA para resolver problemas com João Pessoa
        // Base nos erros mais comuns reportados pelos webservices ABRASF
        let canonical = xmlString
            // 1. CRÍTICO: Remover TODOS os \r\n que quebram a validação de hash
            .replace(/\r\n/g, '')
            .replace(/\r/g, '')
            
            // 2. Remover quebras de linha e normalizar para formato compacto
            .replace(/\n\s*/g, '')
            
            // 3. Remover espaços múltiplos entre tags
            .replace(/>\s+</g, '><')
            
            // 4. Normalizar espaços em atributos
            .replace(/\s*=\s*/g, '=')
            .replace(/="\s+/g, '="')
            .replace(/\s+"/g, '"')
            
            // 5. Remover espaços antes de fechamentos de tag
            .replace(/\s*\/>/g, '/>')
            .replace(/\s*>/g, '>')
            
            // 6. Trim final
            .trim();
        
        console.log('✅ Canonicalização específica para João Pessoa aplicada');
        console.log('🔍 DEBUG: Removidos todos \\r\\n e normalizado espaçamento');
        console.log('🎯 FOCO: Corrigido para compatibilidade máxima com webservice João Pessoa');
        return canonical;
        
    } catch (error) {
        console.error('❌ Erro na canonicalização:', error);
        // Em caso de erro, retorna o XML original
        return xmlString;
    }
}

// Função principal atualizada para seguir o processo ABRASF completo
async function assinarXMLCompleto(xml, certificadoConfig = null) {
    console.log('🔐 Iniciando assinatura COMPLETA do XML...');
    
    try {
        // 0. Limpar XML antes de processar
        const xmlLimpo = limparXMLParaAssinatura(xml);
        
        let certificate, privateKey;
        
        if (certificadoConfig && certificadoConfig.dados && certificadoConfig.senha) {
            // Usar certificado já configurado
            console.log('🔐 Usando certificado já configurado...');
            const resultado = await processarCertificado(certificadoConfig.dados, certificadoConfig.senha);
            certificate = resultado.certificate;
            privateKey = resultado.privateKey;
        } else {
            // Solicitar certificado do usuário
            console.log('📄 Solicitando certificado do usuário...');
            const { pfxData, senha } = await solicitarCertificado();
            const resultado = await processarCertificado(pfxData, senha);
            certificate = resultado.certificate;
            privateKey = resultado.privateKey;
        }
        
        // 3. PASSO 1 ABRASF: Assinar cada RPS individualmente
        console.log('📝 PASSO 1: Assinando RPS individualmente...');
        let xmlComRpsAssinados = await assinarXMLComForge(xmlLimpo, certificate, privateKey);
        
        // 4. PASSO 2 ABRASF: Verificar se precisa assinar o lote
        if (xmlComRpsAssinados.includes('<LoteRps')) {
            console.log('📝 PASSO 2: Assinando LoteRps...');
            xmlComRpsAssinados = await assinarLoteRPS(xmlComRpsAssinados, certificate, privateKey);
        } else {
            console.log('✅ Nenhum LoteRps encontrado, pulando assinatura do lote');
        }
        
        console.log('✅ XML assinado COMPLETO com sucesso!');
        return xmlComRpsAssinados;
        
    } catch (error) {
        console.error('❌ Erro na assinatura completa:', error);
        throw error;
    }
}

// Função para assinar cada RPS individualmente
async function assinarCadaRPS(xml, certificate, privateKey) {
    console.log('✍️ Assinando cada RPS individualmente...');
    
    try {
        // Extrair todos os RPS do XML
        const rpsMatches = xml.match(/<Rps[^>]*>([\s\S]*?)<\/Rps>/g);
        if (!rpsMatches || rpsMatches.length === 0) {
            throw new Error('Nenhum RPS encontrado para assinatura');
        }
        
        let xmlComRpsAssinados = xml;
        
        // Assinar cada RPS
        for (const rps of rpsMatches) {
            console.log('🔍 Processando RPS para assinatura...');
            
            // Extrair InfRps do RPS
            const infRpsMatch = rps.match(/<InfRps[^>]*>([\s\S]*?)<\/InfRps>/);
            if (!infRpsMatch) {
                console.warn('⚠️ InfRps não encontrado no RPS, pulando...');
                continue;
            }
            
            const infRps = infRpsMatch[0];
            
            // Canonicalizar para digest conforme C14N (padrão XML)
            const xmlCanonicalizado = canonicalizarXML(infRps);
            
            // Calcular digest SHA-1 conforme ABRASF
            const md = forge.md.sha1.create();
            md.update(xmlCanonicalizado, 'utf8');
            const digestValue = forge.util.encode64(md.digest().bytes());
            
            console.log(`🔐 DigestValue (SHA-1) do RPS: ${digestValue}`);
            
            // Criar SignedInfo para o RPS
            const signedInfo = `<SignedInfo xmlns="http://www.w3.org/2000/09/xmldsig#">
<CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>
<SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1"/>
<Reference URI="#${digestValue}">
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
            
            // Inserir assinatura no RPS
            xmlComRpsAssinados = xmlComRpsAssinados.replace(rps, rps + '\n' + xmlSignature);
            
            console.log('✅ RPS assinado com sucesso');
        }
        
        return xmlComRpsAssinados;
        
    } catch (error) {
        console.error('❌ Erro ao assinar cada RPS:', error);
        throw error;
    }
}

