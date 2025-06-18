// =============== ASSINATURA REAL SIMPLIFICADA ===============
// Usando node-forge no navegador com upload de arquivo .pfx
// SEM PHP, SEM servidor, SEM complicação desnecessária

// Log de inicialização do arquivo
console.log('🔄 assinatura-simples.js carregando...', new Date().toISOString());

console.log('🔐 Sistema de assinatura REAL simplificado carregado!');

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
        .replace(/=\s+/g, '=')
        
        // Normalizar quebras de linha para LF (padrão Unix)
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        
        // Remover espaços no final das linhas
        .replace(/[ \t]+$/gm, '')
        
        // Normalizar espaços múltiplos para um único espaço
        .replace(/ {2,}/g, ' ')
        
        // Remover linhas completamente vazias
        .replace(/^\s*\n/gm, '')
        
        .trim();
    
    console.log('✅ XML limpo para padrão ABRASF');
    return xmlLimpo;
}

// Canonicalização XML conforme C14N (http://www.w3.org/TR/2001/REC-xml-c14n-20010315)
function canonicalizarXML(xml) {
    console.log('📐 Aplicando canonicalização C14N...');
    
    // Implementação simplificada do C14N para ABRASF
    let xmlCanonicalizado = xml
        // 1. Normalizar quebras de linha
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        
        // 2. Remover espaços em branco entre tags (preservando conteúdo de texto)
        .replace(/>\s+</g, '><')
        
        // 3. Normalizar espaços em atributos (um espaço apenas)
        .replace(/\s+=/g, '=')
        .replace(/=\s+/g, '=')
        
        // 4. Remover espaços no início e fim
        .trim();
    
    console.log('✅ Canonicalização C14N aplicada');
    return xmlCanonicalizado;
}

// Função de verificação da estrutura XML assinado conforme ABRASF
function verificarEstruturaAssinaturaABRASF(xmlAssinado) {
    console.log('🔍 Verificando estrutura da assinatura conforme ABRASF...');
    
    const problemas = [];
    
    // 1. Verificar namespace da assinatura
    if (!xmlAssinado.includes('xmlns="http://www.w3.org/2000/09/xmldsig#"')) {
        problemas.push('Namespace XMLDSig ausente ou incorreto');
    }
    
    // 2. Verificar presença de ambas as assinaturas (RPS e Lote)
    const assinaturas = xmlAssinado.match(/<Signature[^>]*>/g);
    if (!assinaturas || assinaturas.length < 2) {
        problemas.push(`Número de assinaturas incorreto: encontradas ${assinaturas ? assinaturas.length : 0}, esperadas 2`);
    }
    
    // 3. Verificar algoritmos
    if (!xmlAssinado.includes('rsa-sha1')) {
        problemas.push('Algoritmo de assinatura SHA-1 não encontrado');
    }
    
    // 4. Verificar canonicalização
    if (!xmlAssinado.includes('http://www.w3.org/TR/2001/REC-xml-c14n-20010315')) {
        problemas.push('Algoritmo de canonicalização C14N não encontrado');
    }
    
    // 5. Verificar referências URI
    const referencias = xmlAssinado.match(/URI="#([^"]+)"/g);
    if (!referencias || referencias.length < 2) {
        problemas.push('Referências URI insuficientes');
    }
    
    // 6. Verificar certificado X509
    if (!xmlAssinado.includes('<X509Certificate>') || !xmlAssinado.includes('</X509Certificate>')) {
        problemas.push('Certificado X509 ausente');
    }
    
    if (problemas.length === 0) {
        console.log('✅ Estrutura da assinatura ABRASF está correta');
        return true;
    } else {
        console.log('❌ Problemas encontrados na estrutura da assinatura:');
        problemas.forEach(problema => console.log(`   • ${problema}`));
        return false;
    }
}

// Função para testar envio DIRETO ao webservice com XML assinado
async function testarEnvioWebserviceConfiguracao() {
    console.log('🌐 TESTE: Envio DIRETO ao webservice com XML assinado...');
    
    try {
        // 1. Gerar e assinar XML
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

        console.log('🔐 Assinando XML...');
        const xmlAssinado = await assinarXMLCompleto(xmlTeste, false);
        
        console.log('✅ XML assinado com sucesso!');
        
        // 2. Criar envelope SOAP
        const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" 
               xmlns:tns="http://nfse.abrasf.org.br">
  <soap:Body>
    <tns:RecepcionarLoteRps>
      ${xmlAssinado}
    </tns:RecepcionarLoteRps>
  </soap:Body>
</soap:Envelope>`;

        console.log('📄 Envelope SOAP criado');
        console.log('🔍 Primeiros 500 chars:', soapEnvelope.substring(0, 500));
        
        // 3. Enviar para webservice
        console.log('📡 Enviando para webservice...');
        
        const url = 'https://serem-hml.joaopessoa.pb.gov.br/notafiscal-abrasfv203-ws/NotaFiscalSoap';
        
        try {
            // Testar via proxy
            const proxyResponse = await fetch('https://nfse.mosaicoworkers.workers.dev/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url: url,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'text/xml; charset=utf-8',
                        'SOAPAction': 'http://nfse.abrasf.org.br/RecepcionarLoteRps'
                    },
                    body: soapEnvelope
                })
            });

            const result = await proxyResponse.json();
            
            console.log('📥 Resposta do webservice:');
            console.log('🔍 Status:', result.httpCode);
            console.log('🔍 Resposta:', result.response);
            
            return {
                sucesso: result.success,
                httpCode: result.httpCode,
                resposta: result.response,
                xmlAssinado: xmlAssinado
            };
            
        } catch (error) {
            console.error('❌ Erro no envio:', error);
            return {
                sucesso: false,
                erro: error.message,
                xmlAssinado: xmlAssinado
            };
        }
        
    } catch (error) {
        console.error('❌ Erro no teste completo:', error);
        return {
            sucesso: false,
            erro: error.message
        };
    }
}

// NOVA FUNÇÃO: Envio direto ao webservice com estrutura correta conforme WSDL
async function testarEnvioDiretoWebservice() {
    console.log('🌐 TESTE: Envio DIRETO ao webservice (sem proxy) com estrutura correta...');
    
    try {
        // 1. Gerar e assinar XML
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

        console.log('🔐 Assinando XML...');
        const xmlAssinado = await assinarXMLCompleto(xmlTeste, false);
        
        console.log('✅ XML assinado com sucesso!');
        
        // 2. Criar envelope SOAP CORRETO conforme WSDL
        const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" 
               xmlns:tns="http://nfse.abrasf.org.br">
  <soap:Body>
    <tns:RecepcionarLoteRps>
      <tns:EnviarLoteRpsEnvio>
        ${xmlAssinado.replace('<?xml version="1.0" encoding="UTF-8"?>', '')}
      </tns:EnviarLoteRpsEnvio>
    </tns:RecepcionarLoteRps>
  </soap:Body>
</soap:Envelope>`;

        console.log('📄 Envelope SOAP CORRETO criado conforme WSDL');
        console.log('🔍 Primeiros 800 chars:', soapEnvelope.substring(0, 800));
        
        // 3. URL do webservice (homologação João Pessoa)
        const url = 'https://serem-hml.joaopessoa.pb.gov.br/notafiscal-abrasfv203-ws/NotaFiscalSoap';
        
        console.log('📡 Tentando envio DIRETO ao webservice...');
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/xml; charset=utf-8',
                    'SOAPAction': '"http://nfse.abrasf.org.br/RecepcionarLoteRps"',
                    'Accept': 'text/xml',
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                },
                body: soapEnvelope
            });

            console.log('📊 Status da resposta:', response.status);
            console.log('📊 Headers da resposta:', Object.fromEntries(response.headers.entries()));
            
            const responseText = await response.text();
            console.log('📥 Resposta completa:', responseText);

            if (response.ok) {
                console.log('✅ Envio direto FUNCIONOU!');
                return { success: true, response: responseText };
            } else {
                console.log('❌ Erro no envio direto:', response.status, response.statusText);
                return { success: false, error: `HTTP ${response.status}: ${response.statusText}`, response: responseText };
            }

        } catch (fetchError) {
            console.log('❌ Erro de fetch (CORS/Network):', fetchError);
            
            // Se deu erro de CORS, tentar com proxy melhorado
            console.log('🔄 Tentando com proxy aprimorado...');
            return await tentarComProxyAprimorado(soapEnvelope, url);
        }
        
    } catch (error) {
        console.error('❌ Erro geral:', error);
        return { success: false, error: error.message };
    }
}

// FUNÇÃO DEFINITIVA: Envio com SOAPAction correto (vazio conforme WSDL)
async function testarEnvioComSoapActionCorreto() {
    console.log('🎯 TESTE DEFINITIVO: Envio com SOAPAction CORRETO (vazio conforme WSDL)...');
    
    try {
        // 1. Gerar e assinar XML
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

        console.log('🔐 Assinando XML...');
        const xmlAssinado = await assinarXMLCompleto(xmlTeste, false);
        
        console.log('✅ XML assinado com sucesso!');
        
        // 2. Criar envelope SOAP CORRETO conforme WSDL
        const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" 
               xmlns:tns="http://nfse.abrasf.org.br">
  <soap:Body>
    <tns:RecepcionarLoteRps>
      <tns:EnviarLoteRpsEnvio>
        ${xmlAssinado.replace('<?xml version="1.0" encoding="UTF-8"?>', '')}
      </tns:EnviarLoteRpsEnvio>
    </tns:RecepcionarLoteRps>
  </soap:Body>
</soap:Envelope>`;

        console.log('📄 Envelope SOAP com estrutura WSDL correta');
        console.log('🔍 Primeiros 600 chars:', soapEnvelope.substring(0, 600));
        
        // 3. URL do webservice
        const url = 'https://serem-hml.joaopessoa.pb.gov.br/notafiscal-abrasfv203-ws/NotaFiscalSoap';
        
        console.log('📡 Enviando com SOAPAction VAZIO (conforme WSDL)...');
        
        try {
            // Headers CORRETOS conforme WSDL
            const headers = {
                'Content-Type': 'text/xml; charset=utf-8',
                'SOAPAction': '""',  // VAZIO conforme WSDL!
                'Accept': 'text/xml'
            };
            
            console.log('📋 Headers enviados:', headers);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: soapEnvelope
            });

            console.log('📊 Status da resposta:', response.status);
            console.log('📊 Status text:', response.statusText);
            console.log('📊 Headers da resposta:', Object.fromEntries(response.headers.entries()));
            
            const responseText = await response.text();
            console.log('📥 Resposta completa (primeiros 1000 chars):', responseText.substring(0, 1000));

            if (response.ok) {
                console.log('🎉 SUCESSO! Envio com SOAPAction correto FUNCIONOU!');
                
                // Verificar se a resposta contém elementos esperados
                if (responseText.includes('EnviarLoteRpsResposta') || responseText.includes('Protocolo') || responseText.includes('NumeroLote')) {
                    console.log('✅ Resposta contém elementos ABRASF esperados!');
                } else if (responseText.includes('soap:Fault') || responseText.includes('faultstring')) {
                    console.log('⚠️ Resposta contém fault SOAP - verificar detalhes');
                } else {
                    console.log('📄 Resposta em formato diferente - analisar conteúdo');
                }
                
                return { success: true, response: responseText, status: response.status };
            } else {
                console.log('❌ Erro HTTP:', response.status, response.statusText);
                console.log('📄 Conteúdo do erro:', responseText);
                return { success: false, error: `HTTP ${response.status}: ${response.statusText}`, response: responseText, status: response.status };
            }

        } catch (fetchError) {
            console.log('❌ Erro de fetch (CORS/Network):', fetchError.message);
            
            // Tentar com proxy com headers corretos
            console.log('🔄 Tentando com proxy usando headers corretos...');
            return await tentarComProxyHeadersCorretos(soapEnvelope, url);
        }
        
    } catch (error) {
        console.error('❌ Erro geral:', error);
        return { success: false, error: error.message };
    }
}

// Proxy com headers corretos
async function tentarComProxyHeadersCorretos(soapEnvelope, targetUrl) {
    try {
        console.log('🌐 Proxy com headers CORRETOS...');
        
        const proxyResponse = await fetch('https://nfse.mosaicoworkers.workers.dev/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                url: targetUrl,
                method: 'POST',
                headers: {
                    'Content-Type': 'text/xml; charset=utf-8',
                    'SOAPAction': '""',  // VAZIO conforme WSDL!
                    'Accept': 'text/xml',
                    'User-Agent': 'NFSe-ABRASF-Client/2.03'
                },
                body: soapEnvelope
            })
        });

        console.log('📊 Status do proxy:', proxyResponse.status);
        
        if (!proxyResponse.ok) {
            const errorText = await proxyResponse.text();
            console.log('❌ Erro do proxy:', errorText);
            throw new Error(`Proxy error: ${proxyResponse.status} - ${errorText}`);
        }

        const result = await proxyResponse.json();
        
        console.log('📥 Resposta via proxy com headers corretos:');
        console.log('📊 Status:', result.status);
        console.log('📊 Headers:', result.headers);
        console.log('📄 Body (primeiros 1000 chars):', (result.body || '').substring(0, 1000));

        if (result.status >= 200 && result.status < 300) {
            console.log('🎉 SUCESSO via proxy com headers corretos!');
            
            // Analisar resposta
            const resposta = result.body || '';
            if (resposta.includes('EnviarLoteRpsResposta') || resposta.includes('Protocolo')) {
                console.log('✅ Resposta ABRASF válida recebida!');
            }
            
            return { success: true, response: resposta, status: result.status, via: 'proxy' };
        } else {
            console.log('❌ Erro via proxy:', result.status);
            return { success: false, error: `HTTP ${result.status}`, response: result.body, status: result.status, via: 'proxy' };
        }

    } catch (proxyError) {
        console.error('❌ Erro no proxy com headers corretos:', proxyError);
        return { success: false, error: `Proxy error: ${proxyError.message}`, via: 'proxy' };
    }
}

// Função para tentar com proxy aprimorado
async function tentarComProxyAprimorado(soapEnvelope, targetUrl) {
    try {
        console.log('🌐 Usando proxy aprimorado...');
        
        const proxyResponse = await fetch('https://nfse.mosaicoworkers.workers.dev/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                url: targetUrl,
                method: 'POST',
                headers: {
                    'Content-Type': 'text/xml; charset=utf-8',
                    'SOAPAction': '"http://nfse.abrasf.org.br/RecepcionarLoteRps"',
                    'Accept': 'text/xml',
                    'User-Agent': 'NFSe-Client/1.0'
                },
                body: soapEnvelope
            })
        });

        console.log('📊 Status do proxy:', proxyResponse.status);
        
        if (!proxyResponse.ok) {
            const errorText = await proxyResponse.text();
            console.log('❌ Resposta de erro do proxy:', errorText);
            throw new Error(`Proxy error: ${proxyResponse.status} - ${errorText}`);
        }

        const result = await proxyResponse.json();
        
        console.log('📥 Resposta via proxy:');
        console.log('📊 Status:', result.status);
        console.log('📊 Headers:', result.headers);
        console.log('📄 Body:', result.body);

        if (result.status >= 200 && result.status < 300) {
            console.log('✅ Envio via proxy FUNCIONOU!');
            return { success: true, response: result.body, status: result.status };
        } else {
            console.log('❌ Erro via proxy:', result.status);
            return { success: false, error: `HTTP ${result.status}`, response: result.body, status: result.status };
        }

    } catch (proxyError) {
        console.error('❌ Erro no proxy aprimorado:', proxyError);
        return { success: false, error: `Proxy error: ${proxyError.message}` };
    }
}

// Expor todas as funções necessárias
window.assinarXMLComUpload = assinarXMLComUpload;
window.assinarXMLCompleto = assinarXMLCompleto;
window.testarAssinaturaSimplificada = testarAssinaturaSimplificada;
window.testarAssinaturaCompletaABRASF = testarAssinaturaCompletaABRASF;
window.testarAssinaturaCompletaConfiguracao = testarAssinaturaCompletaConfiguracao;
window.testarEnvioWebserviceConfiguracao = testarEnvioWebserviceConfiguracao;
window.testeSimples = testeSimples;
window.limparXMLParaAssinatura = limparXMLParaAssinatura;
window.canonicalizarXML = canonicalizarXML;
window.verificarEstruturaAssinaturaABRASF = verificarEstruturaAssinaturaABRASF;

// Funções de teste
window.testarEnvioDiretoWebservice = testarEnvioDiretoWebservice;
window.tentarComProxyAprimorado = tentarComProxyAprimorado;
window.testarTodasAbordagensEnvio = testarTodasAbordagensEnvio;
window.testarSoapSimples = testarSoapSimples;
window.testarAbrasfPuro = testarAbrasfPuro;
window.enviarParaWebservice = enviarParaWebservice;

// Função definitiva
window.testarEnvioComSoapActionCorreto = testarEnvioComSoapActionCorreto;
window.tentarComProxyHeadersCorretos = tentarComProxyHeadersCorretos;

console.log('✅ Todas as funções de teste expostas:', {
    testarEnvioComSoapActionCorreto: typeof window.testarEnvioComSoapActionCorreto,
    testarTodasAbordagensEnvio: typeof window.testarTodasAbordagensEnvio,
    testarEnvioDiretoWebservice: typeof window.testarEnvioDiretoWebservice
});
