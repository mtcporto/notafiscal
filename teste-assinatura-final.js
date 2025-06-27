// ===============================
// TESTE FINAL ASSINATURA DIGITAL
// ===============================
// Teste específico para diagnosticar e resolver o "erro na assinatura"
// no webservice de João Pessoa

console.log('🔧 TESTE FINAL DA ASSINATURA DIGITAL');
console.log('=====================================');

async function testeAssinaturaFinal() {
    try {
        // 1. Configurar certificado
        console.log('🔑 Configurando certificado...');
        await obterCertificadoDaConfiguracao();
        
        if (!certificadoAtual) {
            console.error('❌ Certificado não carregado');
            return;
        }
        
        // 2. Gerar XML de teste
        console.log('📄 Gerando XML de teste...');
        const xmlTeste = gerarXMLNFSeCompleto();
        console.log('✅ XML gerado');
        
        // 3. Assinar XML
        console.log('✍️ Assinando XML...');
        const xmlAssinado = await assinarXMLCompleto(xmlTeste, certificadoAtual);
        console.log('✅ XML assinado');
        
        // 4. Verificar estrutura da assinatura
        console.log('🔍 Verificando estrutura da assinatura...');
        verificarEstruturasAssinatura(xmlAssinado);
        
        // 5. Testar envio
        console.log('🌐 Testando envio...');
        const envelope = criarEnvelopeSOAP(xmlAssinado);
        console.log('📦 Envelope SOAP criado');
        
        const urlWebservice = 'https://serem-hml.joaopessoa.pb.gov.br/notafiscal-abrasfv203-ws/NotaFiscalSoap';
        const resultado = await enviarViaProxyAlternativo({
            nome: 'Mosaico Workers Proxy',
            tipo: 'cloudflare',
            url: 'https://nfse.mosaicoworkers.workers.dev/'
        }, urlWebservice, envelope);
        
        console.log('📥 RESULTADO DO TESTE:');
        console.log('======================');
        if (resultado.success) {
            console.log('✅ SUCESSO!');
            console.log('📄 Resposta:', resultado.response);
        } else {
            console.log('❌ ERRO:');
            console.log('📄 Resposta:', resultado.error || resultado.response);
        }
        
        return resultado;
        
    } catch (error) {
        console.error('❌ Erro no teste:', error);
        return { error: error.message };
    }
}

function verificarEstruturasAssinatura(xml) {
    console.log('🔍 VERIFICAÇÃO DETALHADA DA ASSINATURA');
    console.log('======================================');
    
    // 1. Verificar namespaces
    const temNamespaceABRASF = xml.includes('xmlns="http://www.abrasf.org.br/nfse.xsd"');
    const temNamespaceXMLDSig = xml.includes('xmlns="http://www.w3.org/2000/09/xmldsig#"');
    
    console.log('📐 Namespaces:');
    console.log(`   ABRASF: ${temNamespaceABRASF ? '✅' : '❌'}`);
    console.log(`   XMLDSig: ${temNamespaceXMLDSig ? '✅' : '❌'}`);
    
    // 2. Verificar elementos assinados
    const assinaturasRPS = (xml.match(/<Signature[^>]*xmlns="http:\/\/www\.w3\.org\/2000\/09\/xmldsig#">/g) || []).length;
    const rpsElements = (xml.match(/<Rps>/g) || []).length;
    const loteRpsSignature = xml.includes('<LoteRps') && xml.includes('<Signature');
    
    console.log('📝 Estrutura:');
    console.log(`   RPS encontrados: ${rpsElements}`);
    console.log(`   Assinaturas RPS: ${assinaturasRPS}`);
    console.log(`   Assinatura LoteRps: ${loteRpsSignature ? '✅' : '❌'}`);
    
    // 3. Verificar algoritmos
    const algoritmoSignature = xml.includes('http://www.w3.org/2000/09/xmldsig#rsa-sha1');
    const algoritmoDigest = xml.includes('http://www.w3.org/2000/09/xmldsig#sha1');
    const algoritmoCanonicalization = xml.includes('http://www.w3.org/TR/2001/REC-xml-c14n-20010315');
    
    console.log('🔐 Algoritmos:');
    console.log(`   Signature (RSA-SHA1): ${algoritmoSignature ? '✅' : '❌'}`);
    console.log(`   Digest (SHA-1): ${algoritmoDigest ? '✅' : '❌'}`);
    console.log(`   Canonicalization: ${algoritmoCanonicalization ? '✅' : '❌'}`);
    
    // 4. Verificar certificado
    const temCertificado = xml.includes('<X509Certificate>');
    const temKeyInfo = xml.includes('<KeyInfo>');
    
    console.log('🎫 Certificado:');
    console.log(`   KeyInfo: ${temKeyInfo ? '✅' : '❌'}`);
    console.log(`   X509Certificate: ${temCertificado ? '✅' : '❌'}`);
    
    // 5. Verificar IDs e referências
    const idsRPS = xml.match(/InfRps Id="([^"]+)"/g) || [];
    const referencesRPS = xml.match(/Reference URI="#([^"]+)"/g) || [];
    
    console.log('🔗 IDs e Referências:');
    console.log(`   IDs RPS encontrados: ${idsRPS.length}`);
    console.log(`   References encontradas: ${referencesRPS.length}`);
    
    if (idsRPS.length > 0) {
        console.log('   IDs RPS:', idsRPS);
    }
    if (referencesRPS.length > 0) {
        console.log('   References:', referencesRPS);
    }
    
    // 6. Validação final
    const estruturaValida = temNamespaceABRASF && 
                          temNamespaceXMLDSig && 
                          assinaturasRPS > 0 && 
                          loteRpsSignature &&
                          algoritmoSignature &&
                          algoritmoDigest &&
                          temCertificado;
    
    console.log('🏁 RESULTADO DA VERIFICAÇÃO:');
    console.log(`   Estrutura válida: ${estruturaValida ? '✅ PASSOU EM TODOS OS TESTES' : '❌ PROBLEMAS ENCONTRADOS'}`);
    
    return estruturaValida;
}

// Executar teste automaticamente
console.log('⏳ Iniciando teste em 2 segundos...');
setTimeout(() => {
    testeAssinaturaFinal().then(resultado => {
        console.log('🔚 Teste concluído:', resultado);
    });
}, 2000);
