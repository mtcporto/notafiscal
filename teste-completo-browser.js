// Teste completo do sistema NFS-e
// Para ser executado no console do navegador

console.log('🧪 TESTE COMPLETO DO SISTEMA NFS-e');
console.log('===================================');

async function testeCompletoNFSe() {
    try {
        console.log('\n1️⃣ Verificando funções disponíveis...');
        
        // Verificar se as funções principais existem
        const funcoesEsperadas = [
            'assinarXMLCompleto',
            'gerarXMLNFSeABRASF',
            'enviarNFSeCompleta'
        ];
        
        const funcoesDisponiveis = [];
        for (const funcao of funcoesEsperadas) {
            if (typeof window[funcao] === 'function') {
                funcoesDisponiveis.push(funcao);
                console.log(`✅ ${funcao} - disponível`);
            } else {
                console.log(`❌ ${funcao} - não encontrada`);
            }
        }
        
        console.log('\n2️⃣ Testando geração de XML...');
        
        // Simular dados de teste realistas
        const dadosTeste = {
            // Prestador
            cnpjPrestador: '11222333000181',
            inscricaoMunicipalPrestador: '12345',
            razaoSocialPrestador: 'Empresa Teste LTDA',
            enderecoCompletoPrestador: 'Rua Teste, 123, Centro, João Pessoa - PB, CEP 58000-000',
            
            // Tomador  
            cnpjTomador: '99888777000166',
            razaoSocialTomador: 'Cliente Teste SA',
            enderecoCompletoTomador: 'Av Cliente, 456, Bairro, João Pessoa - PB, CEP 58100-000',
            
            // Serviço
            discriminacao: 'Serviços de desenvolvimento de software',
            valorServicos: '1000.00',
            aliquota: '5.00',
            itemListaServico: '0107',
            codigoMunicipio: '2211001' // João Pessoa
        };
        
        // Simular preenchimento dos campos (se existirem)
        const campos = {
            'cnpj-prestador': dadosTeste.cnpjPrestador,
            'inscricao-municipal-prestador': dadosTeste.inscricaoMunicipalPrestador,
            'razao-social-prestador': dadosTeste.razaoSocialPrestador,
            'cnpj-tomador': dadosTeste.cnpjTomador,
            'razao-social-tomador': dadosTeste.razaoSocialTomador,
            'discriminacao': dadosTeste.discriminacao,
            'valor-servicos': dadosTeste.valorServicos,
            'aliquota': dadosTeste.aliquota,
            'item-lista-servico': dadosTeste.itemListaServico
        };
        
        for (const [id, valor] of Object.entries(campos)) {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.value = valor;
                console.log(`📝 Campo ${id} preenchido`);
            }
        }
        
        console.log('\n3️⃣ Testando geração de XML ABRASF...');
        
        if (typeof gerarXMLNFSeABRASF === 'function') {
            try {
                const xml = gerarXMLNFSeABRASF();
                console.log('✅ XML gerado com sucesso');
                console.log('📄 Tamanho do XML:', xml.length, 'caracteres');
                
                // Verificar estrutura básica
                if (xml.includes('<LoteRps>') && xml.includes('<Rps>')) {
                    console.log('✅ Estrutura ABRASF detectada');
                } else {
                    console.log('⚠️ Estrutura ABRASF não detectada');
                }
                
                console.log('\n4️⃣ Testando assinatura digital...');
                
                if (typeof assinarXMLCompleto === 'function') {
                    try {
                        const xmlAssinado = await assinarXMLCompleto(xml);
                        console.log('✅ XML assinado com sucesso');
                        console.log('📄 Tamanho do XML assinado:', xmlAssinado.length, 'caracteres');
                        
                        // Verificar assinaturas
                        const contadorAssinaturas = (xmlAssinado.match(/<Signature/g) || []).length;
                        console.log(`🔏 Assinaturas encontradas: ${contadorAssinaturas}`);
                        
                        if (contadorAssinaturas >= 2) {
                            console.log('✅ Dupla assinatura ABRASF detectada');
                        } else {
                            console.log('⚠️ Dupla assinatura não detectada');
                        }
                        
                        console.log('\n5️⃣ Testando envio para webservice...');
                        
                        if (typeof enviarNFSeCompleta === 'function') {
                            try {
                                console.log('📡 Enviando para João Pessoa...');
                                const resposta = await enviarNFSeCompleta(xmlAssinado);
                                console.log('✅ Resposta do webservice recebida');
                                console.log('📋 Resposta:', resposta);
                                
                                // Verificar se houve erro de assinatura
                                if (typeof resposta === 'string' && resposta.toLowerCase().includes('erro na assinatura')) {
                                    console.log('❌ ERRO NA ASSINATURA AINDA PERSISTE');
                                    console.log('🔍 Investigação necessária');
                                } else if (typeof resposta === 'string' && resposta.includes('sucesso')) {
                                    console.log('🎉 SUCESSO! Problema resolvido!');
                                } else {
                                    console.log('📝 Resposta recebida - analisar conteúdo');
                                }
                                
                            } catch (erro) {
                                console.log('❌ Erro no envio:', erro.message);
                            }
                        } else {
                            console.log('❌ Função enviarNFSeCompleta não disponível');
                        }
                        
                    } catch (erro) {
                        console.log('❌ Erro na assinatura:', erro.message);
                    }
                } else {
                    console.log('❌ Função assinarXMLCompleto não disponível');
                }
                
            } catch (erro) {
                console.log('❌ Erro na geração do XML:', erro.message);
            }
        } else {
            console.log('❌ Função gerarXMLNFSeABRASF não disponível');
        }
        
        console.log('\n🏁 Teste concluído');
        
    } catch (erro) {
        console.error('❌ Erro geral no teste:', erro);
    }
}

// Executar o teste
console.log('⏳ Iniciando teste em 2 segundos...');
setTimeout(testeCompletoNFSe, 2000);
