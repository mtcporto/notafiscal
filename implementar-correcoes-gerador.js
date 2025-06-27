// Implementação das Correções do Modelo Oficial no Gerador Principal
console.log('🔧 IMPLEMENTANDO CORREÇÕES NO GERADOR PRINCIPAL');
console.log('==============================================');

function implementarCorrecaoGerador() {
    console.log('\n📋 CORREÇÕES A IMPLEMENTAR:');
    console.log('1. ✅ Elemento raiz <RecepcionarLoteRps>');
    console.log('2. ✅ Estrutura <InfDeclaracaoPrestacaoServico>');
    console.log('3. ✅ Estrutura <CpfCnpj><Cnpj>');
    console.log('4. ✅ Campos obrigatórios específicos');
    console.log('5. ✅ Apenas 1 assinatura (LoteRps)');
    
    console.log('\n🎯 MODIFICAÇÕES NECESSÁRIAS EM xml.js:');
    console.log('- Mudar estrutura do XML para João Pessoa');
    console.log('- Adicionar elemento raiz <RecepcionarLoteRps>');
    console.log('- Usar <InfDeclaracaoPrestacaoServico> em vez de <InfRps>');
    console.log('- Ajustar estrutura CpfCnpj');
    console.log('- Adicionar campos obrigatórios');
    
    console.log('\n🎯 MODIFICAÇÕES NECESSÁRIAS EM assinatura-simples.js:');
    console.log('- Para João Pessoa: assinar APENAS LoteRps');
    console.log('- Manter ABRASF padrão para outras cidades');
    
    console.log('\n📝 ARQUIVO A CRIAR/MODIFICAR:');
    console.log('- xml-joao-pessoa.js (gerador específico)');
    console.log('- Ou modificar xml.js com detecção de cidade');
    
    return {
        xmlPrincipal: 'xml.js',
        assinaturaPrincipal: 'assinatura-simples.js',
        novoArquivo: 'xml-joao-pessoa.js'
    };
}

// Função para gerar XML João Pessoa (versão produção)
function gerarXMLJoaoPessoaProducao(dadosFormulario) {
    console.log('🏗️ Gerando XML para produção - Modelo João Pessoa');
    
    // Extrair dados do formulário ou usar defaults
    const prestador = {
        cnpj: dadosFormulario?.cnpjPrestador?.replace(/\D/g, '') || 
              document.getElementById('cnpjPrestador')?.value?.replace(/\D/g, '') || 
              '15198135000180',
        inscricaoMunicipal: dadosFormulario?.imPrestador || 
                           document.getElementById('imPrestador')?.value || 
                           '122781-5',
        razaoSocial: dadosFormulario?.razaoPrestador || 
                    document.getElementById('razaoPrestador')?.value || 
                    'PIXEL VIVO SOLUCOES WEB LTDA'
    };
    
    const tomador = {
        documento: dadosFormulario?.docTomador?.replace(/\D/g, '') || 
                  document.getElementById('docTomador')?.value?.replace(/\D/g, '') || 
                  '11222333000181',
        tipoDoc: dadosFormulario?.tipoDocTomador || 
                document.getElementById('tipoDocTomador')?.value || 
                'cnpj',
        razaoSocial: dadosFormulario?.razaoTomador || 
                    document.getElementById('razaoTomador')?.value || 
                    'CLIENTE TESTE LTDA'
    };
    
    const servico = {
        valorServicos: dadosFormulario?.valor || 
                      document.getElementById('valor')?.value || 
                      '2500.00',
        discriminacao: dadosFormulario?.descricao || 
                      document.getElementById('descricao')?.value || 
                      'Desenvolvimento de sistema web',
        itemListaServico: dadosFormulario?.itemServico || 
                         document.getElementById('itemServico')?.value || 
                         '01.01'
    };
    
    const numeroRps = Math.floor(Math.random() * 999) + 1;
    const numeroLote = numeroRps;
    const dataAtual = new Date().toISOString().split('T')[0];
    const competencia = dataAtual.substring(0, 7) + '-01';
    
    // XML conforme modelo oficial João Pessoa
    const xml = `<RecepcionarLoteRps>
<EnviarLoteRpsEnvio>
<LoteRps Id="lote${numeroLote}" versao="2.03">
<NumeroLote>${numeroLote}</NumeroLote>
<CpfCnpj>
<Cnpj>${prestador.cnpj}</Cnpj>
</CpfCnpj>
<InscricaoMunicipal>${prestador.inscricaoMunicipal}</InscricaoMunicipal>
<QuantidadeRps>1</QuantidadeRps>
<ListaRps>
<Rps>
<InfDeclaracaoPrestacaoServico Id="rps${numeroRps}">
<Rps Id="">
<IdentificacaoRps>
<Numero>${numeroRps}</Numero>
<Serie>A1</Serie>
<Tipo>1</Tipo>
</IdentificacaoRps>
<DataEmissao>${dataAtual}</DataEmissao>
<Status>1</Status>
</Rps>
<Competencia>${competencia}</Competencia>
<Servico>
<Valores>
<ValorServicos>${servico.valorServicos}</ValorServicos>
</Valores>
<IssRetido>2</IssRetido>
<ItemListaServico>${servico.itemListaServico}</ItemListaServico>
<CodigoCnae>6201500</CodigoCnae>
<Discriminacao>${servico.discriminacao}</Discriminacao>
<CodigoMunicipio>2211001</CodigoMunicipio>
<ExigibilidadeISS>1</ExigibilidadeISS>
<MunicipioIncidencia>2211001</MunicipioIncidencia>
</Servico>
<Prestador>
<CpfCnpj>
<Cnpj>${prestador.cnpj}</Cnpj>
</CpfCnpj>
<InscricaoMunicipal>${prestador.inscricaoMunicipal}</InscricaoMunicipal>
</Prestador>
<Tomador>
<IdentificacaoTomador>
<CpfCnpj>
${tomador.tipoDoc === 'cpf' ? `<Cpf>${tomador.documento}</Cpf>` : `<Cnpj>${tomador.documento}</Cnpj>`}
</CpfCnpj>
</IdentificacaoTomador>
<RazaoSocial>${tomador.razaoSocial}</RazaoSocial>
<Endereco>
<Endereco>RUA TESTE</Endereco>
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

    console.log('✅ XML gerado para produção');
    console.log('📊 Tamanho:', xml.length, 'caracteres');
    
    return xml;
}

// Função para assinar XML João Pessoa (apenas LoteRps)
async function assinarXMLJoaoPessoaProducao(xml) {
    try {
        console.log('🔐 Assinando XML João Pessoa (apenas LoteRps)...');
        
        // Usar certificado carregado
        const response = await fetch('./certificados/pixelvivo.pfx');
        const pfxBuffer = await response.arrayBuffer();
        const pfxBytes = new Uint8Array(pfxBuffer);
        const senha = 'pixel2025';
        
        const { certificate, privateKey } = await processarCertificado(pfxBytes, senha);
        
        // Extrair LoteRps para assinatura
        const loteRpsMatch = xml.match(/<LoteRps[^>]*>([\s\S]*?)<\/LoteRps>/);
        if (!loteRpsMatch) throw new Error('LoteRps não encontrado');
        
        const loteRpsTag = xml.match(/<LoteRps[^>]*>/)[0];
        const idMatch = loteRpsTag.match(/Id="([^"]*)"/);
        if (!idMatch) throw new Error('Id do LoteRps não encontrado');
        
        const loteRpsId = idMatch[1];
        const loteRpsCompleto = loteRpsMatch[0];
        
        // Canonicalizar
        const xmlCanonicalizado = canonicalizarXML(loteRpsCompleto);
        
        // Digest SHA-1
        const md = forge.md.sha1.create();
        md.update(xmlCanonicalizado, 'utf8');
        const digestValue = forge.util.encode64(md.digest().bytes());
        
        // SignedInfo
        const signedInfo = `<SignedInfo>
<CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>
<SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1"/>
<Reference URI="#${loteRpsId}">
<Transforms>
<Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/>
<Transform Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>
</Transforms>
<DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"/>
<DigestValue>${digestValue}</DigestValue>
</Reference>
</SignedInfo>`;
        
        // Assinar
        const signedInfoCanonicalizado = canonicalizarXML(signedInfo);
        const mdSignature = forge.md.sha1.create();
        mdSignature.update(signedInfoCanonicalizado, 'utf8');
        const signature = privateKey.sign(mdSignature);
        const signatureValue = forge.util.encode64(signature);
        
        // Certificado
        const certDer = forge.asn1.toDer(forge.pki.certificateToAsn1(certificate)).getBytes();
        const certificateValue = forge.util.encode64(certDer);
        
        // Assinatura
        const xmlSignature = `<Signature xmlns="http://www.w3.org/2000/09/xmldsig#">
${signedInfo}
<SignatureValue>${signatureValue}</SignatureValue>
<KeyInfo>
<X509Data>
<X509Certificate>${certificateValue}</X509Certificate>
</X509Data>
</KeyInfo>
</Signature>`;
        
        // Inserir assinatura
        const xmlAssinado = xml.replace('</LoteRps>', '</LoteRps>\n' + xmlSignature);
        
        console.log('✅ XML assinado para produção');
        return xmlAssinado;
        
    } catch (erro) {
        console.error('❌ Erro na assinatura:', erro);
        throw erro;
    }
}

// Função para testar gerador de produção
async function testarGeradorProducao() {
    try {
        console.log('🧪 TESTANDO GERADOR DE PRODUÇÃO');
        console.log('==============================');
        
        // Gerar XML
        const xml = gerarXMLJoaoPessoaProducao();
        
        // Assinar
        const xmlAssinado = await assinarXMLJoaoPessoaProducao(xml);
        
        console.log('✅ XML de produção gerado e assinado');
        console.log('📊 Tamanho final:', xmlAssinado.length, 'caracteres');
        
        // Verificar estrutura
        const todasVerificacoes = [
            xmlAssinado.includes('<RecepcionarLoteRps>'),
            xmlAssinado.includes('<InfDeclaracaoPrestacaoServico'),
            xmlAssinado.includes('<CpfCnpj>'),
            xmlAssinado.includes('<Competencia>'),
            xmlAssinado.includes('<ExigibilidadeISS>'),
            xmlAssinado.includes('<MunicipioIncidencia>'),
            xmlAssinado.includes('<OptanteSimplesNacional>'),
            xmlAssinado.includes('<IncentivoFiscal>'),
            (xmlAssinado.match(/<Signature xmlns="http:\/\/www\.w3\.org\/2000\/09\/xmldsig#">/g) || []).length === 1
        ];
        
        const tudoOk = todasVerificacoes.every(v => v);
        
        console.log('🎯 RESULTADO FINAL:');
        console.log(tudoOk ? '✅ GERADOR DE PRODUÇÃO OK!' : '❌ Gerador precisa de ajustes');
        
        return xmlAssinado;
        
    } catch (erro) {
        console.error('❌ Erro no teste de produção:', erro);
        return null;
    }
}

// Executar implementação
implementarCorrecaoGerador();

console.log('\n📌 PRÓXIMOS PASSOS:');
console.log('1. Execute: testarGeradorProducao()');
console.log('2. Se OK, substitua o gerador atual');
console.log('3. Teste envio real');
console.log('4. Deploy em produção');
