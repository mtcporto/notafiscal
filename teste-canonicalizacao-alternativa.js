// Teste alternativo com canonicalização baseada em exemplos reais de sucesso
// Este script testa diferentes abordagens de canonicalização

console.log('🧪 Teste de Canonicalização Alternativa para João Pessoa');

// Função de canonicalização baseada em implementações de sucesso
function canonicalizarXMLAlternativo(xmlString) {
    console.log('📐 Aplicando canonicalização baseada em casos de SUCESSO...');
    
    // Esta versão é baseada em análises de XMLs que foram aceitos por João Pessoa
    let canonical = xmlString
        // 1. Converter para string se necessário
        .toString()
        
        // 2. Remover BOM se presente
        .replace(/^\uFEFF/, '')
        
        // 3. Normalizar quebras de linha
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        
        // 4. Remover quebras de linha entre tags
        .replace(/>\s*\n\s*</g, '><')
        
        // 5. Remover espaços em excesso
        .replace(/\s+/g, ' ')
        
        // 6. Normalizar atributos
        .replace(/\s*=\s*/g, '=')
        .replace(/=\s*"/g, '="')
        .replace(/"\s+/g, '" ')
        .replace(/\s+>/g, '>')
        
        // 7. Trim final
        .trim();
    
    console.log('✅ Canonicalização alternativa aplicada');
    return canonical;
}

// Função de canonicalização C14N mais próxima do padrão oficial
function canonicalizarXMLC14N(xmlString) {
    console.log('📐 Aplicando canonicalização C14N oficial...');
    
    // Implementação mais próxima do C14N oficial
    try {
        // Parse do XML para DOM
        const parser = new DOMParser();
        const doc = parser.parseFromString(xmlString, 'text/xml');
        
        // Verificar se houve erro de parsing
        const parseError = doc.querySelector('parsererror');
        if (parseError) {
            console.warn('⚠️ Erro de parsing, usando canonicalização simples');
            return canonicalizarXMLSimples(xmlString);
        }
        
        // Serializar de volta (isso já aplica algumas normalizações)
        const serializer = new XMLSerializer();
        const serialized = serializer.serializeToString(doc);
        
        // Aplicar regras C14N adicionais
        let canonical = serialized
            .replace(/>\s+</g, '><')
            .replace(/\s*=\s*/g, '=')
            .replace(/="\s+/g, '="')
            .replace(/\s+"/g, '"')
            .replace(/\s+>/g, '>')
            .replace(/\s+\/>/g, '/>')
            .trim();
        
        console.log('✅ Canonicalização C14N aplicada');
        return canonical;
        
    } catch (error) {
        console.error('❌ Erro na canonicalização C14N:', error);
        return canonicalizarXMLSimples(xmlString);
    }
}

// Canonicalização simples para fallback
function canonicalizarXMLSimples(xmlString) {
    return xmlString
        .replace(/\r\n/g, '')
        .replace(/\r/g, '')
        .replace(/\n\s*/g, '')
        .replace(/>\s+</g, '><')
        .replace(/\s*=\s*/g, '=')
        .replace(/="\s+/g, '="')
        .replace(/\s+"/g, '"')
        .replace(/\s*\/>/g, '/>')
        .replace(/\s*>/g, '>')
        .trim();
}

// Testar diferentes canonicalizações
function testarCanonizacoes() {
    const xmlTeste = `<LoteRps Id="lote123" versao="2.03">
<NumeroLote>123</NumeroLote>
<CpfCnpj>
<Cnpj>15198135000180</Cnpj>
</CpfCnpj>
<InscricaoMunicipal>122781-5</InscricaoMunicipal>
</LoteRps>`;

    console.log('📄 XML Original:');
    console.log(xmlTeste);
    
    console.log('\n🔄 Teste 1 - Canonicalização Atual:');
    const resultado1 = canonicalizarXMLSimples(xmlTeste);
    console.log(resultado1);
    
    console.log('\n🔄 Teste 2 - Canonicalização Alternativa:');
    const resultado2 = canonicalizarXMLAlternativo(xmlTeste);
    console.log(resultado2);
    
    console.log('\n🔄 Teste 3 - Canonicalização C14N:');
    const resultado3 = canonicalizarXMLC14N(xmlTeste);
    console.log(resultado3);
    
    // Comparar tamanhos
    console.log('\n📊 Comparação:');
    console.log('Original:', xmlTeste.length, 'caracteres');
    console.log('Atual:', resultado1.length, 'caracteres');
    console.log('Alternativa:', resultado2.length, 'caracteres');
    console.log('C14N:', resultado3.length, 'caracteres');
    
    // Verificar diferenças
    console.log('\n🔍 Diferenças:');
    console.log('Atual === Alternativa:', resultado1 === resultado2);
    console.log('Atual === C14N:', resultado1 === resultado3);
    console.log('Alternativa === C14N:', resultado2 === resultado3);
    
    return {
        original: xmlTeste,
        atual: resultado1,
        alternativa: resultado2,
        c14n: resultado3
    };
}

// Executar teste
const resultados = testarCanonizacoes();

// Testar hash SHA-1 para cada resultado
async function testarHashes() {
    console.log('\n🔐 Testando hashes SHA-1...');
    
    const encoder = new TextEncoder();
    
    for (const [nome, xml] of Object.entries(resultados)) {
        try {
            const data = encoder.encode(xml);
            const hashBuffer = await crypto.subtle.digest('SHA-1', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashBase64 = btoa(String.fromCharCode.apply(null, hashArray));
            
            console.log(`${nome}: ${hashBase64}`);
        } catch (error) {
            console.error(`Erro ao calcular hash para ${nome}:`, error);
        }
    }
}

// Executar teste de hashes
testarHashes();

console.log('\n✅ Teste de canonicalização alternativa concluído!');
console.log('💡 Use este script para identificar qual canonicalização funciona melhor.');
