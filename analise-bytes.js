// Script para análise byte-a-byte e comparação com XML funcional
// Este script irá nos ajudar a identificar exatamente onde está a diferença

console.log('🔬 Análise Byte-a-Byte para Debug de Assinatura');

// XML base que sabemos que está estruturado corretamente
const xmlBase = `<RecepcionarLoteRps>
<EnviarLoteRpsEnvio>
<LoteRps Id="lote123" versao="2.03">
<NumeroLote>123</NumeroLote>
<CpfCnpj>
<Cnpj>15198135000180</Cnpj>
</CpfCnpj>
<InscricaoMunicipal>122781-5</InscricaoMunicipal>
<QuantidadeRps>1</QuantidadeRps>
<ListaRps>
<Rps>
<InfDeclaracaoPrestacaoServico Id="rps123">
<Rps Id="">
<IdentificacaoRps>
<Numero>123</Numero>
<Serie>A1</Serie>
<Tipo>1</Tipo>
</IdentificacaoRps>
<DataEmissao>2025-06-27</DataEmissao>
<Status>1</Status>
</Rps>
<Competencia>2025-06-01</Competencia>
<Servico>
<Valores>
<ValorServicos>2500.00</ValorServicos>
</Valores>
<IssRetido>2</IssRetido>
<ItemListaServico>01.01</ItemListaServico>
<CodigoCnae>6201500</CodigoCnae>
<Discriminacao>Desenvolvimento de programas de computador sob encomenda</Discriminacao>
<CodigoMunicipio>2211001</CodigoMunicipio>
<ExigibilidadeISS>1</ExigibilidadeISS>
<MunicipioIncidencia>2211001</MunicipioIncidencia>
</Servico>
<Prestador>
<CpfCnpj>
<Cnpj>15198135000180</Cnpj>
</CpfCnpj>
<InscricaoMunicipal>122781-5</InscricaoMunicipal>
</Prestador>
<Tomador>
<IdentificacaoTomador>
<CpfCnpj>
<Cpf>12345678901</Cpf>
</CpfCnpj>
</IdentificacaoTomador>
<RazaoSocial>CLIENTE TESTE LTDA</RazaoSocial>
<Endereco>
<Endereco>RUA EXEMPLO</Endereco>
<Numero>123</Numero>
<Bairro>CENTRO</Bairro>
<CodigoMunicipio>2211001</CodigoMunicipio>
<Uf>PB</Uf>
<Cep>58000000</Cep>
</Endereco>
</Tomador>
<OptanteSimplesNacional>2</OptanteSimplesNacional>
<IncentivoFiscal>2</IncentivoFiscal>
</InfDeclaracaoPrestacaoServico>
</Rps>
</ListaRps>
</LoteRps>
</EnviarLoteRpsEnvio>
</RecepcionarLoteRps>`;

// Funções de análise
function analisarCaracteresEspeciais(texto, nome) {
    console.log(`\n🔍 Análise de caracteres especiais - ${nome}:`);
    
    const caracteres = {
        quebrasLinha: (texto.match(/\n/g) || []).length,
        carriageReturn: (texto.match(/\r/g) || []).length,
        tabs: (texto.match(/\t/g) || []).length,
        espacosSimples: (texto.match(/ /g) || []).length,
        espacosDuplos: (texto.match(/  /g) || []).length,
        espacosMultiplos: (texto.match(/   +/g) || []).length
    };
    
    console.log('Quebras de linha (\\n):', caracteres.quebrasLinha);
    console.log('Carriage return (\\r):', caracteres.carriageReturn);
    console.log('Tabs (\\t):', caracteres.tabs);
    console.log('Espaços simples:', caracteres.espacosSimples);
    console.log('Espaços duplos:', caracteres.espacosDuplos);
    console.log('Espaços múltiplos:', caracteres.espacosMultiplos);
    
    return caracteres;
}

function analisarEstrutura(xml, nome) {
    console.log(`\n📋 Análise de estrutura - ${nome}:`);
    
    const elementos = {
        loteRps: (xml.match(/<LoteRps[^>]*>/g) || []).length,
        assinaturas: (xml.match(/<Signature[^>]*>/g) || []).length,
        references: (xml.match(/<Reference[^>]*>/g) || []).length,
        digestValues: (xml.match(/<DigestValue>/g) || []).length,
        signatureValues: (xml.match(/<SignatureValue>/g) || []).length
    };
    
    console.log('LoteRps encontrados:', elementos.loteRps);
    console.log('Signatures encontradas:', elementos.assinaturas);
    console.log('References encontradas:', elementos.references);
    console.log('DigestValues encontrados:', elementos.digestValues);
    console.log('SignatureValues encontrados:', elementos.signatureValues);
    
    // Verificar IDs
    const loteRpsMatch = xml.match(/<LoteRps[^>]*Id="([^"]*)"[^>]*>/);
    if (loteRpsMatch) {
        console.log('ID do LoteRps:', loteRpsMatch[1]);
    }
    
    const referenceMatch = xml.match(/<Reference[^>]*URI="#([^"]*)"[^>]*>/);
    if (referenceMatch) {
        console.log('URI da Reference:', referenceMatch[1]);
    }
    
    return elementos;
}

function compararTextos(texto1, texto2, nome1, nome2) {
    console.log(`\n🔬 Comparação detalhada: ${nome1} vs ${nome2}`);
    
    if (texto1 === texto2) {
        console.log('✅ Textos são IDÊNTICOS');
        return true;
    }
    
    console.log('❌ Textos são DIFERENTES');
    console.log(`Tamanho ${nome1}:`, texto1.length);
    console.log(`Tamanho ${nome2}:`, texto2.length);
    
    // Encontrar primeira diferença
    const maxLen = Math.min(texto1.length, texto2.length);
    for (let i = 0; i < maxLen; i++) {
        if (texto1[i] !== texto2[i]) {
            console.log(`Primeira diferença na posição ${i}:`);
            console.log(`${nome1}: "${texto1[i]}" (código: ${texto1.charCodeAt(i)})`);
            console.log(`${nome2}: "${texto2[i]}" (código: ${texto2.charCodeAt(i)})`);
            console.log(`Contexto: "${texto1.substring(Math.max(0, i-20), i+20)}"`);
            break;
        }
    }
    
    return false;
}

function extrairLoteRps(xml) {
    const match = xml.match(/<LoteRps[^>]*>([\s\S]*?)<\/LoteRps>/);
    return match ? match[0] : null;
}

// Função de canonicalização atual
function canonicalizarAtual(xmlString) {
    return xmlString
        .replace(/\r\n/g, '')
        .replace(/\r/g, '')
        .replace(/\n\s*/g, '')
        .replace(/>\s+</g, '><')
        .replace(/\s*=\s*/g, '=')
        .replace(/="\s+/g, '="')
        .replace(/\s+"/g, '"')
        .replace(/"/g, '"')
        .replace(/"/g, '"')
        .replace(/\s*\/>/g, '/>')
        .replace(/\s*>/g, '>')
        .replace(/>(\s+)([^<]+)(\s+)</g, '>$2<')
        .replace(/<Cnpj\s+>/g, '<Cnpj>')
        .replace(/<Cpf\s+>/g, '<Cpf>')
        .replace(/<LoteRps\s+/g, '<LoteRps ')
        .replace(/\s+versao=/g, ' versao=')
        .replace(/\s+Id=/g, ' Id=')
        .trim();
}

// Função de canonicalização simples
function canonicalizarSimples(xmlString) {
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

// Executar análise completa
function executarAnaliseCompleta() {
    console.log('🎯 Iniciando análise completa...');
    
    // 1. Analisar XML base
    console.log('\n=== ANÁLISE DO XML BASE ===');
    analisarCaracteresEspeciais(xmlBase, 'XML Base');
    analisarEstrutura(xmlBase, 'XML Base');
    
    // 2. Extrair e analisar LoteRps
    const loteRpsOriginal = extrairLoteRps(xmlBase);
    if (loteRpsOriginal) {
        console.log('\n=== ANÁLISE DO LOTERPS ORIGINAL ===');
        console.log('LoteRps extraído:', loteRpsOriginal.length, 'caracteres');
        analisarCaracteresEspeciais(loteRpsOriginal, 'LoteRps Original');
        
        // 3. Testar canonicalizações
        const loteRpsAtual = canonicalizarAtual(loteRpsOriginal);
        const loteRpsSimples = canonicalizarSimples(loteRpsOriginal);
        
        console.log('\n=== COMPARAÇÃO DE CANONICALIZAÇÕES ===');
        compararTextos(loteRpsAtual, loteRpsSimples, 'Atual', 'Simples');
        
        analisarCaracteresEspeciais(loteRpsAtual, 'LoteRps Canonicalizado (Atual)');
        analisarCaracteresEspeciais(loteRpsSimples, 'LoteRps Canonicalizado (Simples)');
        
        // 4. Mostrar resultados finais
        console.log('\n=== RESULTADOS FINAIS ===');
        console.log('Original:', loteRpsOriginal.length, 'chars');
        console.log('Atual:', loteRpsAtual.length, 'chars');
        console.log('Simples:', loteRpsSimples.length, 'chars');
        
        console.log('\n📄 LoteRps Canonicalizado (Atual):');
        console.log(loteRpsAtual);
        
        console.log('\n📄 LoteRps Canonicalizado (Simples):');
        console.log(loteRpsSimples);
        
        return {
            original: loteRpsOriginal,
            atual: loteRpsAtual,
            simples: loteRpsSimples
        };
    } else {
        console.error('❌ Não foi possível extrair LoteRps do XML base');
        return null;
    }
}

// Executar análise
const resultado = executarAnaliseCompleta();

// Calcular hashes se possível
if (resultado && typeof crypto !== 'undefined') {
    console.log('\n🔐 Calculando hashes SHA-1...');
    
    const encoder = new TextEncoder();
    
    Promise.all([
        crypto.subtle.digest('SHA-1', encoder.encode(resultado.atual)),
        crypto.subtle.digest('SHA-1', encoder.encode(resultado.simples))
    ]).then(([hashAtual, hashSimples]) => {
        const hashAtualB64 = btoa(String.fromCharCode(...new Uint8Array(hashAtual)));
        const hashSimplesB64 = btoa(String.fromCharCode(...new Uint8Array(hashSimples)));
        
        console.log('Hash Atual:', hashAtualB64);
        console.log('Hash Simples:', hashSimplesB64);
        console.log('Hashes iguais:', hashAtualB64 === hashSimplesB64 ? '✅' : '❌');
    }).catch(error => {
        console.error('❌ Erro ao calcular hashes:', error);
    });
}

console.log('\n✅ Análise byte-a-byte concluída!');
