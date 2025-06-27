// Teste real com certificado PixelVivo
console.log('🏢 TESTE REAL COM CERTIFICADO PIXELVIVO');
console.log('=========================================');

async function testeRealPixelVivo() {
    try {
        console.log('\n📋 DADOS REAIS PARA TESTE:');
        console.log('Empresa: PIXEL VIVO SOLUCOES WEB LTDA');
        console.log('CNPJ: 15.198.135/0001-80');
        console.log('Inscrição Municipal: 122781-5');
        console.log('');
        
        // 1. Carregar certificado real PixelVivo
        console.log('1️⃣ Carregando certificado PixelVivo...');
        
        const response = await fetch('./certificados/pixelvivo.pfx');
        if (!response.ok) {
            throw new Error('Erro ao carregar certificado PixelVivo');
        }
        
        const pfxBuffer = await response.arrayBuffer();
        const pfxBytes = new Uint8Array(pfxBuffer);
        const senha = 'pixel2025'; // Senha do certificado
        
        console.log('✅ Certificado PixelVivo carregado');
        console.log('📊 Tamanho do arquivo:', pfxBytes.length, 'bytes');
        
        // 2. Processar certificado
        console.log('\n2️⃣ Processando certificado...');
        
        if (typeof processarCertificado === 'function') {
            const certificado = await processarCertificado(pfxBytes, senha);
            console.log('✅ Certificado processado com sucesso');
            console.log('🔑 Certificado válido para assinatura');
            
            // 3. Gerar XML com dados reais
            console.log('\n3️⃣ Gerando XML com dados reais...');
            
            // Preencher formulário com dados reais
            const dadosReais = {
                'cnpj-prestador': '15198135000180',
                'inscricao-municipal-prestador': '122781-5',
                'razao-social-prestador': 'PIXEL VIVO SOLUCOES WEB LTDA',
                'endereco-prestador': 'RUA EXEMPLO',
                'numero-prestador': '123',
                'bairro-prestador': 'CENTRO',
                'cep-prestador': '58000000',
                'cidade-prestador': 'JOAO PESSOA',
                'uf-prestador': 'PB',
                'telefone-prestador': '83999999999',
                'email-prestador': 'contato@pixelvivo.com.br',
                
                // Tomador de teste
                'cnpj-tomador': '11222333000181',
                'razao-social-tomador': 'CLIENTE TESTE LTDA',
                'endereco-tomador': 'RUA CLIENTE',
                'numero-tomador': '456',
                'bairro-tomador': 'CENTRO',
                'cep-tomador': '58000000',
                'cidade-tomador': 'JOAO PESSOA',
                'uf-tomador': 'PB',
                'email-tomador': 'cliente@teste.com.br',
                
                // Serviço
                'discriminacao': 'Desenvolvimento de sistema web',
                'valor-servicos': '1000.00',
                'aliquota': '5.00',
                'valor-deducoes': '0.00',
                'valor-pis': '0.00',
                'valor-cofins': '0.00',
                'valor-inss': '0.00',
                'valor-ir': '0.00',
                'valor-csll': '0.00',
                'outras-retencoes': '0.00',
                'desconto-incondicionado': '0.00',
                'desconto-condicionado': '0.00',
                'item-lista-servico': '0107',
                'codigo-tributacao-municipio': '010701',
                'codigo-municipio': '2211001'
            };
            
            // Preencher campos do formulário
            for (const [campo, valor] of Object.entries(dadosReais)) {
                const elemento = document.getElementById(campo);
                if (elemento) {
                    elemento.value = valor;
                    // Disparar evento change para que o sistema reconheça
                    elemento.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }
            
            console.log('✅ Formulário preenchido com dados reais');
            
            // Aguardar um pouco para processamento
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // 4. Gerar XML ABRASF
            console.log('\n4️⃣ Gerando XML ABRASF...');
            
            if (typeof gerarXMLNFSeABRASF === 'function') {
                const xml = gerarXMLNFSeABRASF();
                console.log('✅ XML ABRASF gerado');
                console.log('📊 Tamanho:', xml.length, 'caracteres');
                
                // Verificar estrutura ABRASF
                if (xml.includes('<LoteRps>') && xml.includes('<Rps>')) {
                    console.log('✅ Estrutura ABRASF correta');
                } else {
                    console.log('❌ Estrutura ABRASF incorreta');
                    return;
                }
                
                // Verificar CNPJ no XML
                if (xml.includes('15198135000180')) {
                    console.log('✅ CNPJ PixelVivo presente no XML');
                } else {
                    console.log('❌ CNPJ PixelVivo não encontrado no XML');
                }
                
                // 5. Assinar XML com certificado real
                console.log('\n5️⃣ Assinando XML com certificado PixelVivo...');
                
                if (typeof assinarXMLComForge === 'function') {
                    const xmlAssinado = await assinarXMLComForge(xml, certificado.certificate, certificado.privateKey);
                    console.log('✅ XML assinado com certificado PixelVivo');
                    console.log('📊 Tamanho do XML assinado:', xmlAssinado.length, 'caracteres');
                    
                    // Verificar assinaturas
                    const assinaturas = (xmlAssinado.match(/<Signature/g) || []).length;
                    console.log(`🔏 Assinaturas encontradas: ${assinaturas}`);
                    
                    if (assinaturas >= 2) {
                        console.log('✅ Dupla assinatura ABRASF presente');
                        
                        // 6. Testar envio real
                        console.log('\n6️⃣ ENVIANDO PARA JOÃO PESSOA (REAL)...');
                        console.log('🚨 ATENÇÃO: Este é um envio REAL para o webservice!');
                        
                        if (typeof enviarNFSeCompleta === 'function') {
                            try {
                                const resposta = await enviarNFSeCompleta(xmlAssinado);
                                console.log('\n📡 RESPOSTA DO WEBSERVICE:');
                                console.log('==========================');
                                console.log(resposta);
                                
                                // Analisar resposta
                                if (typeof resposta === 'string') {
                                    if (resposta.toLowerCase().includes('erro na assinatura')) {
                                        console.log('\n❌ AINDA TEMOS O ERRO DE ASSINATURA');
                                        console.log('🔍 Necessário investigar mais detalhes');
                                        
                                        // Log detalhado do XML para análise
                                        console.log('\n📄 XML ASSINADO PARA ANÁLISE:');
                                        console.log('============================');
                                        console.log(xmlAssinado.substring(0, 2000) + '...');
                                        
                                    } else if (resposta.includes('<NumeroNfse>') || resposta.includes('sucesso')) {
                                        console.log('\n🎉 SUCESSO! NFS-e emitida com sucesso!');
                                        console.log('✅ Problema de assinatura RESOLVIDO!');
                                        
                                    } else if (resposta.includes('erro') || resposta.includes('fault')) {
                                        console.log('\n⚠️ Outro tipo de erro encontrado');
                                        console.log('📋 Analisar resposta detalhada acima');
                                        
                                    } else {
                                        console.log('\n📝 Resposta não categorizada');
                                        console.log('📋 Analisar resposta detalhada acima');
                                    }
                                } else {
                                    console.log('\n📝 Resposta não é string - tipo:', typeof resposta);
                                    console.log('📋 Objeto resposta:', resposta);
                                }
                                
                            } catch (erro) {
                                console.log('\n❌ ERRO NO ENVIO:');
                                console.log('=================');
                                console.log('Erro:', erro.message);
                                console.log('Stack:', erro.stack);
                            }
                        } else {
                            console.log('❌ Função enviarNFSeCompleta não disponível');
                        }
                        
                    } else {
                        console.log('❌ Dupla assinatura não encontrada');
                    }
                    
                } else {
                    console.log('❌ Função assinarXMLComForge não disponível');
                }
                
            } else {
                console.log('❌ Função gerarXMLNFSeABRASF não disponível');
            }
            
        } else {
            console.log('❌ Função processarCertificado não disponível');
        }
        
        console.log('\n🏁 TESTE REAL CONCLUÍDO');
        
    } catch (erro) {
        console.log('\n❌ ERRO NO TESTE REAL:');
        console.log('======================');
        console.log('Erro:', erro.message);
        console.log('Stack:', erro.stack);
    }
}

// Executar teste real
console.log('⏳ Iniciando teste real em 3 segundos...');
console.log('🚨 Este teste usa certificado REAL e pode gerar NFS-e REAL!');
setTimeout(testeRealPixelVivo, 3000);
