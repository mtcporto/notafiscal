// Debug específico da assinatura para João Pessoa
console.log('🔍 ANÁLISE DETALHADA DA ASSINATURA DIGITAL');
console.log('==========================================');

async function analisarAssinaturaDetalhada() {
    try {
        console.log('\n🎯 INVESTIGANDO O PROBLEMA DE ASSINATURA...');
        
        // 1. Capturar o XML que foi enviado (do último envio)
        console.log('\n1️⃣ Analisando o XML que foi rejeitado...');
        
        // Simular a geração do mesmo XML
        if (typeof gerarXMLNFSeABRASF === 'function') {
            const xmlOriginal = gerarXMLNFSeABRASF();
            console.log('📄 XML original gerado (tamanho:', xmlOriginal.length, 'chars)');
            
            // 2. Analisar assinatura atual
            if (typeof assinarXMLCompleto === 'function') {
                const xmlAssinado = await assinarXMLCompleto(xmlOriginal);
                console.log('📄 XML assinado (tamanho:', xmlAssinado.length, 'chars)');
                
                // 3. Verificações específicas para João Pessoa
                console.log('\n🔍 VERIFICAÇÕES ESPECÍFICAS PARA JOÃO PESSOA:');
                
                // Verificar estrutura de assinaturas
                const assinaturas = xmlAssinado.match(/<Signature.*?<\/Signature>/gs) || [];
                console.log(`📝 Número de assinaturas encontradas: ${assinaturas.length}`);
                
                if (assinaturas.length >= 2) {
                    console.log('✅ Dupla assinatura presente');
                    
                    // Analisar cada assinatura
                    assinaturas.forEach((assinatura, index) => {
                        console.log(`\n🔏 ASSINATURA ${index + 1}:`);
                        
                        // Verificar Reference URI
                        const uriMatch = assinatura.match(/URI="([^"]+)"/);
                        const uri = uriMatch ? uriMatch[1] : 'não encontrado';
                        console.log(`📍 URI: ${uri}`);
                        
                        // Verificar algoritmos
                        const sha1Method = assinatura.includes('rsa-sha1');
                        const c14nMethod = assinatura.includes('xml-c14n-20010315');
                        console.log(`🔐 SHA-1: ${sha1Method ? '✅' : '❌'}`);
                        console.log(`📐 C14N: ${c14nMethod ? '✅' : '❌'}`);
                        
                        // Verificar namespace
                        const xmldsigNS = assinatura.includes('http://www.w3.org/2000/09/xmldsig#');
                        console.log(`🌐 XMLDSig namespace: ${xmldsigNS ? '✅' : '❌'}`);
                        
                        // Verificar se tem certificado
                        const temX509 = assinatura.includes('<X509Certificate>');
                        console.log(`📜 Certificado X509: ${temX509 ? '✅' : '❌'}`);
                    });
                    
                    // 4. Verificações específicas do João Pessoa
                    console.log('\n🏛️ VERIFICAÇÕES ESPECÍFICAS JOÃO PESSOA:');
                    
                    // Verificar posicionamento das assinaturas
                    const rpsAssinado = xmlAssinado.includes('<Rps><InfRps') && xmlAssinado.includes('</Signature></Rps>');
                    const loteAssinado = xmlAssinado.includes('</LoteRps><Signature');
                    
                    console.log(`📍 RPS assinado corretamente: ${rpsAssinado ? '✅' : '❌'}`);
                    console.log(`📍 LoteRps assinado corretamente: ${loteAssinado ? '✅' : '❌'}`);
                    
                    // Verificar IDs
                    const rpsIdMatch = xmlAssinado.match(/InfRps Id="([^"]+)"/);
                    const loteIdMatch = xmlAssinado.match(/LoteRps Id="([^"]+)"/);
                    const rpsId = rpsIdMatch ? rpsIdMatch[1] : null;
                    const loteId = loteIdMatch ? loteIdMatch[1] : null;
                    
                    console.log(`🆔 RPS ID: ${rpsId}`);
                    console.log(`🆔 Lote ID: ${loteId}`);
                    
                    // Verificar se as URIs batem com os IDs
                    const primeiraUri = assinaturas[0].match(/URI="([^"]+)"/)?.[1];
                    const segundaUri = assinaturas[1].match(/URI="([^"]+)"/)?.[1];
                    
                    console.log(`📍 Primeira URI: ${primeiraUri}`);
                    console.log(`📍 Segunda URI: ${segundaUri}`);
                    console.log(`🔗 URI RPS bate: ${primeiraUri === '#' + rpsId ? '✅' : '❌'}`);
                    console.log(`🔗 URI Lote bate: ${segundaUri === '#' + loteId ? '✅' : '❌'}`);
                    
                    // 5. Teste específico de canonicalização
                    console.log('\n📐 TESTE DE CANONICALIZAÇÃO:');
                    
                    // Extrair o InfRps para teste
                    const infRpsMatch = xmlAssinado.match(/<InfRps[^>]*>.*?<\/InfRps>/s);
                    if (infRpsMatch) {
                        const infRpsXml = infRpsMatch[0];
                        console.log('📄 InfRps encontrado (tamanho:', infRpsXml.length, 'chars)');
                        
                        // Verificar problemas comuns de canonicalização
                        const temCarriageReturn = infRpsXml.includes('\r');
                        const temTabsOuEspacos = /[\t ]{2,}/.test(infRpsXml);
                        const temQuebrasLinha = infRpsXml.includes('\n');
                        
                        console.log(`🔍 Tem \\r: ${temCarriageReturn ? '⚠️' : '✅'}`);
                        console.log(`🔍 Tem tabs/espaços extras: ${temTabsOuEspacos ? '⚠️' : '✅'}`);
                        console.log(`🔍 Tem quebras de linha: ${temQuebrasLinha ? '⚠️' : '✅'}`);
                        
                        // Teste manual de canonicalização
                        if (typeof canonicalizarXML === 'function') {
                            const infRpsCanonicalizado = canonicalizarXML(infRpsXml);
                            console.log('📐 InfRps canonicalizado (tamanho:', infRpsCanonicalizado.length, 'chars)');
                            console.log('📄 Primeiros 200 chars:', infRpsCanonicalizado.substring(0, 200));
                        }
                    }
                    
                    // 6. Análise do envelope SOAP
                    console.log('\n📦 ANÁLISE DO ENVELOPE SOAP:');
                    
                    const envelope = montarEnvelopeSOAPFinal ? montarEnvelopeSOAPFinal(xmlAssinado) : 'Função não disponível';
                    if (typeof envelope === 'string') {
                        console.log('📄 Envelope gerado (tamanho:', envelope.length, 'chars)');
                        
                        // Verificar namespace do envelope
                        const temNamespaceCorreto = envelope.includes('xmlns="http://nfse.abrasf.org.br"');
                        console.log(`🌐 Namespace ABRASF: ${temNamespaceCorreto ? '✅' : '❌'}`);
                        
                        // Verificar estrutura SOAP
                        const temSoapEnvelope = envelope.includes('<soap:Envelope');
                        const temSoapBody = envelope.includes('<soap:Body>');
                        console.log(`📦 SOAP Envelope: ${temSoapEnvelope ? '✅' : '❌'}`);
                        console.log(`📦 SOAP Body: ${temSoapBody ? '✅' : '❌'}`);
                    }
                    
                    console.log('\n🎯 DIAGNÓSTICO FINAL:');
                    console.log('====================');
                    
                    const problemas = [];
                    
                    if (!rpsAssinado) problemas.push('❌ Posicionamento da assinatura RPS');
                    if (!loteAssinado) problemas.push('❌ Posicionamento da assinatura Lote');
                    if (primeiraUri !== '#' + rpsId) problemas.push('❌ URI da primeira assinatura não bate');
                    if (segundaUri !== '#' + loteId) problemas.push('❌ URI da segunda assinatura não bate');
                    
                    if (problemas.length === 0) {
                        console.log('🤔 ESTRUTURA PARECE CORRETA');
                        console.log('💡 Possíveis causas do erro:');
                        console.log('   • Problema sutil de canonicalização');
                        console.log('   • Encoding ou charset');
                        console.log('   • Certificado não reconhecido pelo órgão');
                        console.log('   • Diferença na cadeia de certificação');
                        console.log('');
                        console.log('🔧 PRÓXIMOS PASSOS SUGERIDOS:');
                        console.log('   1. Verificar certificado na ICP-Brasil');
                        console.log('   2. Testar canonicalização alternativa');
                        console.log('   3. Verificar encoding UTF-8');
                        console.log('   4. Comparar com exemplo oficial');
                    } else {
                        console.log('🔧 PROBLEMAS ENCONTRADOS:');
                        problemas.forEach(problema => console.log('   ' + problema));
                    }
                    
                } else {
                    console.log('❌ Dupla assinatura não encontrada - este é o problema!');
                }
                
            } else {
                console.log('❌ Função assinarXMLCompleto não disponível');
            }
            
        } else {
            console.log('❌ Função gerarXMLNFSeABRASF não disponível');
        }
        
        console.log('\n🏁 Análise concluída');
        
    } catch (erro) {
        console.error('❌ Erro na análise:', erro);
    }
}

// Executar análise
setTimeout(analisarAssinaturaDetalhada, 1000);
