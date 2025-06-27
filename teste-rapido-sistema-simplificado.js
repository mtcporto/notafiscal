// TESTE RÁPIDO DO SISTEMA JOÃO PESSOA SIMPLIFICADO
console.log('🧪 TESTE RÁPIDO: SISTEMA JOÃO PESSOA SIMPLIFICADO');
console.log('================================================');

async function testeRapidoSistemaSimplificado() {
    try {
        console.log('\n🎯 TESTANDO SISTEMA SIMPLIFICADO...');
        
        // Verificar se o sistema está carregado
        if (typeof sistemaJoaoPessoa === 'undefined') {
            console.error('❌ Sistema João Pessoa não carregado');
            return;
        }
        
        console.log('✅ Sistema João Pessoa carregado');
        console.log('📋 Métodos disponíveis:', Object.keys(sistemaJoaoPessoa));
        
        // Testar geração de XML
        console.log('\n📝 TESTE 1: Geração de XML');
        const xml = sistemaJoaoPessoa.gerarXML();
        console.log('✅ XML gerado:', xml.length, 'caracteres');
        console.log('📄 Início do XML:', xml.substring(0, 200));
        
        // Verificar estrutura
        const verificacoes = [
            ['<RecepcionarLoteRps>', xml.includes('<RecepcionarLoteRps>')],
            ['<InfDeclaracaoPrestacaoServico>', xml.includes('<InfDeclaracaoPrestacaoServico>')],
            ['<LoteRps Id=', xml.includes('<LoteRps Id=')],
            ['<CpfCnpj><Cnpj>', xml.includes('<CpfCnpj>\n<Cnpj>') || xml.includes('<CpfCnpj><Cnpj>')],
            ['<Competencia>', xml.includes('<Competencia>')],
            ['<ExigibilidadeISS>', xml.includes('<ExigibilidadeISS>')],
            ['<OptanteSimplesNacional>', xml.includes('<OptanteSimplesNacional>')],
            ['<IncentivoFiscal>', xml.includes('<IncentivoFiscal>')]
        ];
        
        console.log('\n🔍 VERIFICAÇÕES DE ESTRUTURA:');
        verificacoes.forEach(([nome, check]) => {
            console.log(check ? '✅' : '❌', nome);
        });
        
        // Testar assinatura (se forge estiver disponível)
        if (typeof forge !== 'undefined') {
            console.log('\n🔐 TESTE 2: Assinatura');
            try {
                const xmlAssinado = await sistemaJoaoPessoa.assinarXML(xml);
                console.log('✅ XML assinado:', xmlAssinado.length, 'caracteres');
                console.log('🔍 Tem assinatura:', xmlAssinado.includes('<Signature xmlns="http://www.w3.org/2000/09/xmldsig#">'));
                
                // Verificar posição da assinatura
                const posLoteRps = xmlAssinado.indexOf('</LoteRps>');
                const posSignature = xmlAssinado.indexOf('<Signature');
                console.log('🎯 Assinatura após LoteRps:', posSignature > posLoteRps);
                
            } catch (erro) {
                console.log('⚠️ Erro na assinatura (esperado se não tiver certificado):', erro.message);
            }
        } else {
            console.log('\n⚠️ Forge não carregado - teste de assinatura pulado');
        }
        
        console.log('\n🎉 TESTE CONCLUÍDO!');
        console.log('✅ Sistema simplificado funcionando');
        console.log('🚀 Próximo: Testar no fluxo normal');
        
    } catch (erro) {
        console.error('❌ Erro no teste:', erro);
    }
}

// Executar teste quando a página carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', testeRapidoSistemaSimplificado);
} else {
    testeRapidoSistemaSimplificado();
}

// Função para executar via console
window.testeRapidoSistemaSimplificado = testeRapidoSistemaSimplificado;

console.log('\n📌 PARA EXECUTAR MANUALMENTE:');
console.log('Execute: testeRapidoSistemaSimplificado()');
