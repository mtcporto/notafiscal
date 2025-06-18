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
        console.log(envelope.substring(0, 500) + '...');
        
        // 6. Testar envio
        const proxy = 'https://nfse-proxy-jp.mtisrael.workers.dev/';
        const urlWebservice = 'https://nfseh.joaopessoa.pb.gov.br/service.asmx';
        
        console.log('🌐 Enviando via proxy...');
        const resultado = await enviarViaProxyAlternativo(proxy, urlWebservice, envelope);
        
        console.log('📥 Resultado:', resultado.success ? 'Sucesso' : 'Erro');
        if (resultado.response) {
            console.log('📥 Resposta completa:', resultado.response);
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
            console.log('⚠️ Erro ao ler configuração salva');
        }
    }
    
    // 2. Usar senha fixa para o certificado pixelvivo.pfx
    const senhaPixelVivo = 'pixel2025';
    console.log('🔑 Usando senha padrão para pixelvivo.pfx:', senhaPixelVivo);
    return senhaPixelVivo;
}

// Processar certificado com node-forge
async function processarCertificado(pfxData, senha) {
    console.log('🔑 Processando certificado com node-forge...');
    console.log('🔑 Senha recebida:', senha);
    
    try {
        // Converter para formato node-forge
        const pfxBytes = new Uint8Array(pfxData);
        const pfxBuffer = forge.util.createBuffer(pfxBytes);
        
        console.log('📁 Arquivo PKCS#12 carregado, tamanho:', pfxBytes.length);
        
        // Ler PKCS#12 com senha
        console.log('🔓 Tentando abrir PKCS#12 com senha...');
        const pfx = forge.pkcs12.pkcs12FromAsn1(
            forge.asn1.fromDer(pfxBuffer), 
            senha
        );
        
        // Extrair certificado
        const certBags = pfx.getBags({ bagType: forge.pki.oids.certBag });
        const certificate = certBags[forge.pki.oids.certBag][0].cert;
          // Extrair chave privada
        const keyBags = pfx.getBags({ 
            bagType: forge.pki.oids.pkcs8ShroudedKeyBag
        });
        const privateKey = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag][0].key;
        
        // Verificar validade
        const agora = new Date();
        if (agora < certificate.validity.notBefore || agora > certificate.validity.notAfter) {
            throw new Error('Certificado expirado ou ainda não válido');
        }
        
        console.log('✅ Certificado processado com sucesso');
        console.log('📋 Titular:', certificate.subject.getField('CN').value);
        console.log('📋 Válido até:', certificate.validity.notAfter);
        
        return { certificate, privateKey };
        
    } catch (error) {
        throw new Error(`Erro ao processar certificado: ${error.message}`);
    }
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
        const envelope1 = montarEnvelopeSOAPFinal(xml1);
        
        console.log('📤 Enviando teste 1...');
        const proxy = 'https://nfse-proxy-jp.mtisrael.workers.dev/';
        const urlWebservice = 'https://nfseh.joaopessoa.pb.gov.br/service.asmx';
        const resultado1 = await enviarViaProxyAlternativo(proxy, urlWebservice, envelope1);
        
        if (resultado1.success) {
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
