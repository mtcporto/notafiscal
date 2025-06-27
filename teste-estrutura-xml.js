// TESTE SIMPLES PARA VERIFICAR ESTRUTURA
console.log('🧪 TESTE DE ESTRUTURA XML');

// Testar se o gerador está funcionando
if (typeof gerarXMLJoaoPessoa === 'function') {
    const xml = gerarXMLJoaoPessoa();
    
    console.log('📄 XML gerado:');
    console.log(xml.substring(0, 500) + '...');
    
    console.log('\n🔍 Verificações:');
    console.log('✅ <RecepcionarLoteRps>:', xml.includes('<RecepcionarLoteRps>'));
    console.log('✅ <InfDeclaracaoPrestacaoServico>:', xml.includes('<InfDeclaracaoPrestacaoServico>'));
    console.log('✅ versao="2.03":', xml.includes('versao="2.03"'));
    console.log('✅ Id="" vazio:', xml.includes('<Rps Id="">'));
    
    // Testar assinatura simples
    if (typeof assinarXMLJoaoPessoaSimplificado === 'function') {
        console.log('\n🔐 Testando assinatura...');
        
        assinarXMLJoaoPessoaSimplificado(xml).then(xmlAssinado => {
            if (xmlAssinado) {
                console.log('✅ Assinatura realizada com sucesso!');
                console.log('📊 Tamanho XML assinado:', xmlAssinado.length);
                
                // Verificar se tem assinatura
                console.log('✅ Tem assinatura:', xmlAssinado.includes('<Signature xmlns="http://www.w3.org/2000/09/xmldsig#">'));
            } else {
                console.log('❌ Falha na assinatura');
            }
        }).catch(erro => {
            console.log('❌ Erro na assinatura:', erro.message);
        });
    }
    
} else {
    console.log('❌ Função gerarXMLJoaoPessoa não encontrada');
}

// Função para testar pelo console
window.testarEstruturaXML = function() {
    const xml = gerarXMLJoaoPessoa();
    console.log('XML GERADO:\n', xml);
    return xml;
};

console.log('💡 Use: testarEstruturaXML() no console para ver o XML completo');
