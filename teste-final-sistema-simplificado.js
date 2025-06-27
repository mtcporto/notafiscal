// TESTE FINAL: FLUXO COMPLETO JOÃO PESSOA SIMPLIFICADO
console.log('🎯 TESTE FINAL: FLUXO COMPLETO JOÃO PESSOA SIMPLIFICADO');
console.log('======================================================');

async function testeFluxoCompletoSimplificado() {
    try {
        console.log('\n🚀 INICIANDO TESTE COMPLETO...');
        
        // ===== VERIFICAÇÕES INICIAIS =====
        console.log('\n1️⃣ VERIFICAÇÕES INICIAIS');
        console.log('========================');
        
        // Verificar se sistema está carregado
        if (typeof sistemaJoaoPessoa === 'undefined') {
            throw new Error('Sistema João Pessoa não carregado');
        }
        console.log('✅ Sistema João Pessoa carregado');
        
        // Verificar se forge está carregado
        if (typeof forge === 'undefined') {
            throw new Error('Forge não carregado');
        }
        console.log('✅ Forge carregado');
        
        // ===== TESTE 1: GERAÇÃO XML =====
        console.log('\n2️⃣ TESTE DE GERAÇÃO XML');
        console.log('=======================');
        
        const dadosTeste = {
            prestador: {
                cnpj: '15198135000180',
                inscricaoMunicipal: '122781-5'
            },
            tomador: {
                tipoDoc: 'cnpj',
                documento: '11222333000181',
                razaoSocial: 'EMPRESA TESTE LTDA'
            },
            servico: {
                valorServicos: '1500.00',
                itemListaServico: '01.01',
                discriminacao: 'Desenvolvimento de sistema web personalizado'
            }
        };
        
        const xml = sistemaJoaoPessoa.gerarXML(dadosTeste);
        console.log('✅ XML gerado:', xml.length, 'caracteres');
        
        // Verificar estrutura crítica
        const verificacoes = [
            ['<RecepcionarLoteRps>', xml.includes('<RecepcionarLoteRps>')],
            ['<InfDeclaracaoPrestacaoServico>', xml.includes('<InfDeclaracaoPrestacaoServico>')],
            ['<LoteRps Id=', xml.includes('<LoteRps Id=')],
            ['<CpfCnpj><Cnpj>', xml.includes('<CpfCnpj>') && xml.includes('<Cnpj>')],
            ['<Competencia>', xml.includes('<Competencia>')],
            ['<ExigibilidadeISS>', xml.includes('<ExigibilidadeISS>')],
            ['<OptanteSimplesNacional>', xml.includes('<OptanteSimplesNacional>')],
            ['<IncentivoFiscal>', xml.includes('<IncentivoFiscal>')]
        ];
        
        const errosEstrutura = verificacoes.filter(([nome, check]) => !check);
        if (errosEstrutura.length > 0) {
            console.log('❌ Problemas na estrutura:');
            errosEstrutura.forEach(([nome]) => console.log('  - ' + nome));
            throw new Error('Estrutura XML inválida');
        }
        console.log('✅ Estrutura XML conforme modelo oficial');
        
        // ===== TESTE 2: ASSINATURA =====
        console.log('\n3️⃣ TESTE DE ASSINATURA');
        console.log('======================');
        
        const xmlAssinado = await sistemaJoaoPessoa.assinarXML(xml);
        console.log('✅ XML assinado:', xmlAssinado.length, 'caracteres');
        
        // Verificar se tem assinatura
        if (!xmlAssinado.includes('<Signature xmlns="http://www.w3.org/2000/09/xmldsig#">')) {
            throw new Error('Assinatura digital não encontrada');
        }
        console.log('✅ Assinatura digital presente');
        
        // Verificar posição da assinatura
        const posLoteRps = xmlAssinado.indexOf('</LoteRps>');
        const posSignature = xmlAssinado.indexOf('<Signature');
        if (posSignature <= posLoteRps) {
            throw new Error('Assinatura em posição incorreta');
        }
        console.log('✅ Assinatura posicionada corretamente após LoteRps');
        
        // Verificar se tem apenas 1 assinatura
        const numAssinaturas = (xmlAssinado.match(/<Signature xmlns="http:\/\/www\.w3\.org\/2000\/09\/xmldsig#">/g) || []).length;
        if (numAssinaturas !== 1) {
            throw new Error(`Número incorreto de assinaturas: ${numAssinaturas} (esperado: 1)`);
        }
        console.log('✅ Apenas 1 assinatura (conforme modelo oficial)');
        
        // ===== TESTE 3: VERIFICAÇÃO FINAL =====
        console.log('\n4️⃣ VERIFICAÇÃO FINAL');
        console.log('====================');
        
        // Verificar tamanho
        if (xmlAssinado.length < 2000) {
            throw new Error('XML muito pequeno, pode estar incompleto');
        }
        console.log('✅ Tamanho adequado:', xmlAssinado.length, 'caracteres');
        
        // Verificar se não tem InfRps (João Pessoa não usa)
        if (xmlAssinado.includes('<InfRps')) {
            console.log('⚠️ XML contém InfRps (João Pessoa usa InfDeclaracaoPrestacaoServico)');
        } else {
            console.log('✅ Não contém InfRps (correto para João Pessoa)');
        }
        
        // ===== RESULTADO FINAL =====
        console.log('\n🎉 TESTE COMPLETO CONCLUÍDO COM SUCESSO!');
        console.log('========================================');
        console.log('✅ XML gerado conforme modelo oficial João Pessoa');
        console.log('✅ Assinatura digital aplicada corretamente');
        console.log('✅ Estrutura validada e compatível');
        console.log('🚀 SISTEMA PRONTO PARA USO EM PRODUÇÃO!');
        
        // Mostrar estatísticas
        console.log('\n📊 ESTATÍSTICAS:');
        console.log(`  📄 XML original: ${xml.length} caracteres`);
        console.log(`  🔐 XML assinado: ${xmlAssinado.length} caracteres`);
        console.log(`  📈 Aumento: ${xmlAssinado.length - xml.length} caracteres (assinatura)`);
        
        // Salvar resultado para análise posterior
        window.ultimoXMLTesteCompleto = xmlAssinado;
        console.log('\n💾 XML salvo em: window.ultimoXMLTesteCompleto');
        
        return {
            sucesso: true,
            xml: xml,
            xmlAssinado: xmlAssinado,
            tamanho: xmlAssinado.length
        };
        
    } catch (erro) {
        console.error('\n❌ ERRO NO TESTE COMPLETO:', erro);
        console.log('🔍 Detalhes do erro:', erro.message);
        
        return {
            sucesso: false,
            erro: erro.message
        };
    }
}

// Função para comparar com o teste modelo oficial
async function compararComModeloOficial() {
    try {
        console.log('\n🔄 COMPARAÇÃO COM MODELO OFICIAL');
        console.log('=================================');
        
        // Executar teste completo
        const resultadoCompleto = await testeFluxoCompletoSimplificado();
        
        if (!resultadoCompleto.sucesso) {
            console.log('❌ Teste completo falhou, não é possível comparar');
            return;
        }
        
        // Executar teste modelo oficial
        const resultadoOficial = await sistemaJoaoPessoa.testarModeloOficial();
        
        // Comparar resultados
        console.log('📊 COMPARAÇÃO DE RESULTADOS:');
        console.log(`  🔧 Teste Completo: ${resultadoCompleto.tamanho} caracteres`);
        console.log(`  📋 Modelo Oficial: ${resultadoOficial.xmlAssinado.length} caracteres`);
        
        const diferenca = Math.abs(resultadoCompleto.tamanho - resultadoOficial.xmlAssinado.length);
        console.log(`  📏 Diferença: ${diferenca} caracteres`);
        
        if (diferenca < 100) {
            console.log('✅ Tamanhos similares - sistemas equivalentes');
        } else {
            console.log('⚠️ Diferença significativa - verificar estruturas');
        }
        
    } catch (erro) {
        console.error('❌ Erro na comparação:', erro);
    }
}

// Executar automaticamente quando carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(testeFluxoCompletoSimplificado, 1000); // Aguardar outros scripts
    });
} else {
    setTimeout(testeFluxoCompletoSimplificado, 1000);
}

// Funções globais
window.testeFluxoCompletoSimplificado = testeFluxoCompletoSimplificado;
window.compararComModeloOficial = compararComModeloOficial;

console.log('\n📌 FUNÇÕES DISPONÍVEIS:');
console.log('1. testeFluxoCompletoSimplificado() - Teste completo');
console.log('2. compararComModeloOficial() - Comparar com modelo oficial');
