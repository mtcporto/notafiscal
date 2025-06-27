// Teste final com correções específicas para João Pessoa
console.log('🎯 TESTE FINAL - CORREÇÕES JOÃO PESSOA');
console.log('====================================');

async function testeCorrecaoJoaoPessoa() {
    try {
        console.log('\n🔧 APLICANDO CORREÇÕES ESPECÍFICAS PARA JOÃO PESSOA:');
        console.log('   • SignedInfo sem quebras de linha');
        console.log('   • Canonicalização específica (remove \\r\\n)');
        console.log('   • XML Signature compacto');
        console.log('   • Certificado PixelVivo real');
        console.log('');
        
        // 1. Gerar XML com dados PixelVivo
        console.log('1️⃣ Gerando XML com dados PixelVivo...');
        
        if (typeof gerarXMLNFSeABRASF === 'function') {
            const xml = gerarXMLNFSeABRASF();
            console.log('✅ XML gerado (tamanho:', xml.length, 'chars)');
            
            // 2. Aplicar nova assinatura corrigida
            console.log('\n2️⃣ Aplicando assinatura corrigida...');
            
            if (typeof assinarXMLCompleto === 'function') {
                const xmlAssinado = await assinarXMLCompleto(xml);
                console.log('✅ XML assinado com correções específicas');
                console.log('📊 Tamanho do XML assinado:', xmlAssinado.length, 'chars');
                
                // 3. Verificações específicas
                console.log('\n3️⃣ Verificações específicas João Pessoa:');
                
                // Verificar se não tem \r\n nas assinaturas
                const temCarriageReturn = xmlAssinado.includes('\\r\\n') || xmlAssinado.includes('\r\n');
                console.log(`🔍 Tem \\r\\n: ${temCarriageReturn ? '❌ PROBLEMA!' : '✅ OK'}`);
                
                // Verificar estrutura compacta das assinaturas
                const assinaturasComQuebras = (xmlAssinado.match(/<SignedInfo[^>]*>\s*\n/g) || []).length;
                console.log(`🔍 SignedInfo com quebras: ${assinaturasComQuebras > 0 ? '❌ PROBLEMA!' : '✅ OK'}`);
                
                // Verificar dupla assinatura
                const numAssinaturas = (xmlAssinado.match(/<Signature/g) || []).length;
                console.log(`🔍 Número de assinaturas: ${numAssinaturas} ${numAssinaturas >= 2 ? '✅' : '❌'}`);
                
                // Verificar posicionamento correto
                const rpsAssinado = xmlAssinado.includes('</InfRps><Signature') || xmlAssinado.includes('</Signature></Rps>');
                const loteAssinado = xmlAssinado.includes('</LoteRps><Signature');
                console.log(`🔍 RPS posicionado: ${rpsAssinado ? '✅' : '❌'}`);
                console.log(`🔍 Lote posicionado: ${loteAssinado ? '✅' : '❌'}`);
                
                // 4. Testar envio com correções
                console.log('\n4️⃣ TESTE DE ENVIO COM CORREÇÕES:');
                console.log('🚨 Este é um teste REAL com as correções aplicadas!');
                
                if (typeof enviarNFSeCompleta === 'function') {
                    try {
                        console.log('📡 Enviando XML corrigido para João Pessoa...');
                        const resposta = await enviarNFSeCompleta(xmlAssinado);
                        
                        console.log('\n📥 RESPOSTA DO WEBSERVICE:');
                        console.log('========================');
                        console.log(resposta);
                        
                        // Análise da resposta
                        if (typeof resposta === 'string') {
                            if (resposta.toLowerCase().includes('erro na assinatura')) {
                                console.log('\n❌ AINDA TEMOS ERRO DE ASSINATURA');
                                console.log('🔍 Investigação adicional necessária:');
                                console.log('   • Possível problema de certificado');
                                console.log('   • Diferença na cadeia de certificação');
                                console.log('   • Encoding específico não tratado');
                                console.log('   • Validação de ICP-Brasil');
                                
                                // Análise detalhada do XML para debug
                                console.log('\n🔬 ANÁLISE DETALHADA PARA DEBUG:');
                                const primeiraAssinatura = xmlAssinado.match(/<Signature.*?<\/Signature>/s);
                                if (primeiraAssinatura) {
                                    console.log('📄 Primeira assinatura (300 chars):', primeiraAssinatura[0].substring(0, 300));
                                }
                                
                            } else if (resposta.includes('<NumeroNfse>') || resposta.toLowerCase().includes('sucesso')) {
                                console.log('\n🎉 SUCESSO! PROBLEMA RESOLVIDO!');
                                console.log('✅ Correções específicas para João Pessoa funcionaram!');
                                console.log('🏆 Sistema funcionando corretamente!');
                                
                            } else if (resposta.includes('erro') || resposta.includes('fault')) {
                                console.log('\n⚠️ OUTRO TIPO DE ERRO (não assinatura)');
                                console.log('📋 Progresso: Erro de assinatura foi resolvido!');
                                console.log('🔧 Analisar novo erro na resposta acima');
                                
                            } else {
                                console.log('\n📝 RESPOSTA DESCONHECIDA');
                                console.log('📋 Analisar resposta completa acima');
                            }
                        } else {
                            console.log('\n📝 Resposta não é string - tipo:', typeof resposta);
                        }
                        
                    } catch (erro) {
                        console.log('\n❌ ERRO NO ENVIO:');
                        console.log(erro.message);
                    }
                } else {
                    console.log('❌ Função enviarNFSeCompleta não disponível');
                }
                
            } else {
                console.log('❌ Função assinarXMLCompleto não disponível');
            }
            
        } else {
            console.log('❌ Função gerarXMLNFSeABRASF não disponível');
        }
        
        console.log('\n🏁 TESTE DE CORREÇÃO CONCLUÍDO');
        console.log('==============================');
        console.log('Se ainda houver erro de assinatura, o problema pode ser:');
        console.log('• Certificado não aceito pela Receita de João Pessoa');
        console.log('• Diferença sutil na implementação do webservice');
        console.log('• Necessidade de teste com certificado A3 (HSM)');
        console.log('• Validação específica da cadeia ICP-Brasil');
        
    } catch (erro) {
        console.error('❌ Erro no teste de correção:', erro);
    }
}

// Executar teste
console.log('⏳ Iniciando teste de correção em 2 segundos...');
setTimeout(testeCorrecaoJoaoPessoa, 2000);
