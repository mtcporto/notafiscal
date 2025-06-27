// Análise comparativa: Nosso XML vs Modelos Oficiais João Pessoa
console.log('🔍 ANÁLISE: NOSSO XML vs MODELOS OFICIAIS JOÃO PESSOA');
console.log('===================================================');

async function analisarDiferencasModelosOficiais() {
    try {
        console.log('\n📋 MODELOS OFICIAIS ENCONTRADOS:');
        console.log('1. GerarNfse - MODELO.xml (RPS individual)');
        console.log('2. RecepcionarLoteRps - MODELO.xml (Lote assíncrono)');
        console.log('3. RecepcionarLoteRpsSincrono - MODELO.xml (Lote síncrono)');
        console.log('');
        
        // Modelo oficial GerarNfse (RPS individual)
        const modeloGerarNfse = `<GerarNfse>
<GerarNfseEnvio>
<Rps>
<InfDeclaracaoPrestacaoServico Id="RPS123456-ASSINA ESTE ID">
<Rps Id="">
<IdentificacaoRps>
<Numero>???</Numero>
<Serie>??</Serie>
<Tipo>1</Tipo>
</IdentificacaoRps>
<DataEmissao>2023-02-15</DataEmissao>
<Status>1</Status>
</Rps>
<Competencia>2023-02-01</Competencia>
<Servico>
<Valores>
<ValorServicos>????.??</ValorServicos>
</Valores>
<IssRetido>2</IssRetido>
<ItemListaServico>??.??</ItemListaServico>
<CodigoCnae>?????????</CodigoCnae>
<Discriminacao>teste</Discriminacao>
<CodigoMunicipio>???????</CodigoMunicipio>
<ExigibilidadeISS>?</ExigibilidadeISS>
<MunicipioIncidencia>???????</MunicipioIncidencia>
</Servico>
<Prestador>
<CpfCnpj>
<Cnpj>??????????????</Cnpj>
</CpfCnpj>
<InscricaoMunicipal>??????</InscricaoMunicipal>
</Prestador>
<Tomador>
<IdentificacaoTomador>
<CpfCnpj>
<Cpf>??????????</Cpf>
</CpfCnpj>
</IdentificacaoTomador>
<RazaoSocial>TOMADOR TESTE</RazaoSocial>
<Endereco>
<Endereco>RUA TESTE</Endereco>
<Numero>1</Numero>
<Bairro>CENTRO</Bairro>
<CodigoMunicipio>???????</CodigoMunicipio>
<Uf>??</Uf>
<Cep>????????</Cep>
</Endereco>
</Tomador>
<OptanteSimplesNacional>2</OptanteSimplesNacional>
<IncentivoFiscal>2</IncentivoFiscal>
</InfDeclaracaoPrestacaoServico>
<Signature xmlns="http://www.w3.org/2000/09/xmldsig#">
<SignedInfo>
<CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>
<SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1"/>
<Reference URI="#RPS123456-ASSINA ESTE ID">
<Transforms>
<Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/>
<Transform Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>
</Transforms>
<DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"/>
<DigestValue>?????????????????????</DigestValue>
</Reference>
</SignedInfo>
<SignatureValue>?????????????????????????????????????????????????</SignatureValue>
<KeyInfo>
<X509Data>
<X509Certificate>???????????????????????????????????????????????</X509Certificate>
</X509Data>
</KeyInfo>
</Signature>
</Rps>
</GerarNfseEnvio>
</GerarNfse>`;

        // Modelo oficial RecepcionarLoteRps
        const modeloLoteRps = `<RecepcionarLoteRps>
<EnviarLoteRpsEnvio>
<LoteRps Id="RPS123456-ASSINA ESTE ID" versao="?">
<NumeroLote>?</NumeroLote>
<CpfCnpj>
<Cnpj>??????????????</Cnpj>
</CpfCnpj>
<InscricaoMunicipal>??????</InscricaoMunicipal>
<QuantidadeRps>1</QuantidadeRps>
<ListaRps>
<Rps>
<InfDeclaracaoPrestacaoServico Id="">
<Rps Id="">
<IdentificacaoRps>
<Numero>???</Numero>
<Serie>??</Serie>
<Tipo>1</Tipo>
</IdentificacaoRps>
<DataEmissao>2023-02-15</DataEmissao>
<Status>1</Status>
</Rps>
<Competencia>2023-02-01</Competencia>
<Servico>
<Valores>
<ValorServicos>????.??</ValorServicos>
</Valores>
<IssRetido>2</IssRetido>
<ItemListaServico>??.??</ItemListaServico>
<CodigoCnae>?????????</CodigoCnae>
<Discriminacao>teste</Discriminacao>
<CodigoMunicipio>???????</CodigoMunicipio>
<ExigibilidadeISS>?</ExigibilidadeISS>
<MunicipioIncidencia>???????</MunicipioIncidencia>
</Servico>
<Prestador>
<CpfCnpj>
<Cnpj>??????????????</Cnpj>
</CpfCnpj>
<InscricaoMunicipal>??????</InscricaoMunicipal>
</Prestador>
<Tomador>
<IdentificacaoTomador>
<CpfCnpj>
<Cpf>??????????</Cpf>
</CpfCnpj>
</IdentificacaoTomador>
<RazaoSocial>TOMADOR TESTE</RazaoSocial>
<Endereco>
<Endereco>RUA TESTE</Endereco>
<Numero>1</Numero>
<Bairro>CENTRO</Bairro>
<CodigoMunicipio>???????</CodigoMunicipio>
<Uf>??</Uf>
<Cep>????????</Cep>
</Endereco>
</Tomador>
<OptanteSimplesNacional>2</OptanteSimplesNacional>
<IncentivoFiscal>2</IncentivoFiscal>
</InfDeclaracaoPrestacaoServico>
</Rps>
</ListaRps>
</LoteRps>
<Signature xmlns="http://www.w3.org/2000/09/xmldsig#">
<SignedInfo>
<CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>
<SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1"/>
<Reference URI="#RPS123456-ASSINA ESTE ID">
<Transforms>
<Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/>
<Transform Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>
</Transforms>
<DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"/>
<DigestValue>?????????????????????</DigestValue>
</Reference>
</SignedInfo>
<SignatureValue>?????????????????????????????????????????????????</SignatureValue>
<KeyInfo>
<X509Data>
<X509Certificate>???????????????????????????????????????????????</X509Certificate>
</X509Data>
</KeyInfo>
</Signature>
</EnviarLoteRpsEnvio>
</RecepcionarLoteRps>`;

        console.log('\n🔍 DIFERENÇAS CRÍTICAS IDENTIFICADAS:');
        console.log('====================================');
        
        console.log('\n❗ DIFERENÇA 1: ESTRUTURA DO XML');
        console.log('Modelo oficial João Pessoa:');
        console.log('  <RecepcionarLoteRps>');
        console.log('    <EnviarLoteRpsEnvio>');
        console.log('      <LoteRps Id="..." versao="...">');
        console.log('        <!-- dados do lote -->');
        console.log('      </LoteRps>');
        console.log('      <Signature>'); // ❗ ASSINATURA FORA DO LoteRps
        console.log('        <!-- assinatura -->');
        console.log('      </Signature>');
        console.log('    </EnviarLoteRpsEnvio>');
        console.log('  </RecepcionarLoteRps>');
        console.log('');
        console.log('Nosso XML atual:');
        console.log('  <EnviarLoteRpsEnvio xmlns="http://www.abrasf.org.br/nfse.xsd">');
        console.log('    <LoteRps Id="..." versao="...">');
        console.log('      <!-- dados do lote -->');
        console.log('    </LoteRps>');
        console.log('    <Signature>'); // ✅ Correto: assinatura fora
        console.log('      <!-- assinatura -->');
        console.log('    </Signature>');
        console.log('  </EnviarLoteRpsEnvio>');
        console.log('');
        console.log('🚨 PROBLEMA: Falta o elemento raiz <RecepcionarLoteRps>!');
        
        console.log('\n❗ DIFERENÇA 2: ESTRUTURA INTERNA DOS RPS');
        console.log('Modelo oficial João Pessoa:');
        console.log('  <Rps>');
        console.log('    <InfDeclaracaoPrestacaoServico Id="...">'); // ❗ DIFERENTE!
        console.log('      <Rps Id="">');
        console.log('        <!-- dados RPS -->');
        console.log('      </Rps>');
        console.log('      <Competencia>...</Competencia>');
        console.log('      <!-- outros dados -->');
        console.log('    </InfDeclaracaoPrestacaoServico>');
        console.log('  </Rps>');
        console.log('');
        console.log('Nosso XML atual:');
        console.log('  <Rps>');
        console.log('    <InfRps Id="...">'); // ❗ DIFERENTE!
        console.log('      <!-- dados RPS -->');
        console.log('    </InfRps>');
        console.log('  </Rps>');
        console.log('');
        console.log('🚨 PROBLEMA: João Pessoa usa InfDeclaracaoPrestacaoServico, não InfRps!');
        
        console.log('\n❗ DIFERENÇA 3: ELEMENTOS DO PRESTADOR/TOMADOR');
        console.log('Modelo oficial usa:');
        console.log('  <CpfCnpj><Cnpj>...</Cnpj></CpfCnpj>');
        console.log('Nosso XML usa:');
        console.log('  <Cnpj>...</Cnpj>');
        console.log('');
        console.log('🚨 PROBLEMA: Estrutura diferente para CPF/CNPJ!');
        
        console.log('\n❗ DIFERENÇA 4: CAMPOS ESPECÍFICOS');
        console.log('Modelo oficial tem:');
        console.log('  • <Competencia> separado');
        console.log('  • <ExigibilidadeISS>');
        console.log('  • <MunicipioIncidencia>');
        console.log('  • <OptanteSimplesNacional>');
        console.log('  • <IncentivoFiscal>');
        console.log('');
        console.log('Nosso XML:');
        console.log('  • Alguns campos podem estar faltando');
        
        console.log('\n❗ DIFERENÇA 5: ASSINATURA');
        console.log('Modelo oficial:');
        console.log('  • APENAS 1 assinatura (do LoteRps)');
        console.log('  • Assinatura FORA do LoteRps');
        console.log('  • Reference URI aponta para Id do LoteRps');
        console.log('');
        console.log('Nosso XML:');
        console.log('  • 2 assinaturas (RPS + LoteRps) - ABRASF padrão');
        console.log('  • Pode estar confundindo o webservice de João Pessoa');
        
        console.log('\n🔧 CORREÇÕES NECESSÁRIAS:');
        console.log('========================');
        console.log('1. ✅ CRÍTICO: Adicionar elemento raiz <RecepcionarLoteRps>');
        console.log('2. ✅ CRÍTICO: Mudar <InfRps> para <InfDeclaracaoPrestacaoServico>');
        console.log('3. ✅ CRÍTICO: Usar estrutura <CpfCnpj><Cnpj>');
        console.log('4. ✅ CRÍTICO: Usar APENAS 1 assinatura (LoteRps)');
        console.log('5. ✅ Adicionar campos obrigatórios específicos de João Pessoa');
        console.log('6. ✅ Ajustar estrutura interna dos elementos');
        
        console.log('\n🚀 IMPLEMENTANDO CORREÇÕES...');
        
        // Implementar correção
        await implementarCorrecaoModeloOficial();
        
    } catch (erro) {
        console.error('❌ Erro na análise:', erro);
    }
}

async function implementarCorrecaoModeloOficial() {
    try {
        console.log('\n🔧 GERANDO XML CONFORME MODELO OFICIAL JOÃO PESSOA');
        console.log('================================================');
        
        // Gerar XML com estrutura correta para João Pessoa
        const xmlJoaoPessoa = gerarXMLConformeModeloJoaoPessoa();
        
        console.log('✅ XML gerado conforme modelo oficial');
        console.log('📊 Tamanho:', xmlJoaoPessoa.length, 'caracteres');
        
        // Log do XML para verificação
        console.log('\n📄 XML CORRIGIDO (primeiros 1000 chars):');
        console.log(xmlJoaoPessoa.substring(0, 1000));
        
        // Assinar APENAS o LoteRps (conforme modelo oficial)
        console.log('\n🔐 Assinando conforme modelo oficial (apenas LoteRps)...');
        
        const xmlAssinado = await assinarConformeModeloOficial(xmlJoaoPessoa);
        
        if (xmlAssinado) {
            console.log('✅ XML assinado conforme modelo oficial');
            
            // Salvar XML assinado para verificação
            const fs = require('fs');
            fs.writeFileSync('./xml-modelo-oficial-assinado.xml', xmlAssinado);
            console.log('� XML salvo em: xml-modelo-oficial-assinado.xml');
            
            // Testar envio (simulado para Node.js)
            console.log('\n📡 TESTANDO ENVIO COM MODELO OFICIAL...');
            console.log('⚠️  Para teste real, execute no browser ou configure HTTPS/CORS');
            
            // Mostrar XML assinado (primeiros 2000 chars)
            console.log('\n� XML FINAL ASSINADO (primeiros 2000 chars):');
            console.log('==============================================');
            console.log(xmlAssinado.substring(0, 2000));
            
            if (xmlAssinado.includes('<Signature xmlns="http://www.w3.org/2000/09/xmldsig#">')) {
                console.log('\n✅ ASSINATURA PRESENTE NO XML');
            } else {
                console.log('\n❌ ASSINATURA NÃO ENCONTRADA');
            }
            
            if (xmlAssinado.includes('<RecepcionarLoteRps>')) {
                console.log('✅ ELEMENTO RAIZ CORRETO');
            } else {
                console.log('❌ ELEMENTO RAIZ INCORRETO');
            }
            
            if (xmlAssinado.includes('<InfDeclaracaoPrestacaoServico')) {
                console.log('✅ ESTRUTURA RPS CORRETA');
            } else {
                console.log('❌ ESTRUTURA RPS INCORRETA');
            }
            
            console.log('\n🎯 PRÓXIMOS PASSOS:');
            console.log('1. Testar este XML no browser (index.html)');
            console.log('2. Se funcionar, implementar no gerador principal');
            console.log('3. Se não funcionar, investigar certificado/AC');
        }
        
    } catch (erro) {
        console.error('❌ Erro na implementação:', erro);
    }
}

function gerarXMLConformeModeloJoaoPessoa() {
    console.log('🔧 Gerando XML conforme modelo oficial de João Pessoa...');
    
    // Dados fixos para teste no Node.js (sem dependência do DOM)
    const dadosPrestador = {
        cnpj: '15198135000180',
        inscricaoMunicipal: '122781-5',
        razaoSocial: 'PIXEL VIVO SOLUCOES WEB LTDA'
    };
    
    const dadosTomador = {
        cpfCnpj: '11222333000181',
        razaoSocial: 'CLIENTE TESTE LTDA',
        endereco: 'RUA TESTE',
        numero: '123',
        bairro: 'CENTRO',
        codigoMunicipio: '2211001', // João Pessoa
        uf: 'PB',
        cep: '58000000'
    };
    
    const dadosServico = {
        valorServicos: '2500.00',
        discriminacao: 'Desenvolvimento de sistema web',
        itemListaServico: '01.01',
        codigoMunicipio: '2211001'
    };
    
    const numeroRps = Math.floor(Math.random() * 999) + 1;
    const numeroLote = numeroRps;
    const dataAtual = new Date().toISOString().split('T')[0];
    
    // XML conforme modelo oficial João Pessoa
    const xml = `<RecepcionarLoteRps>
<EnviarLoteRpsEnvio>
<LoteRps Id="lote${numeroLote}" versao="2.03">
<NumeroLote>${numeroLote}</NumeroLote>
<CpfCnpj>
<Cnpj>${dadosPrestador.cnpj}</Cnpj>
</CpfCnpj>
<InscricaoMunicipal>${dadosPrestador.inscricaoMunicipal}</InscricaoMunicipal>
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
<Competencia>${dataAtual.substring(0, 7)}-01</Competencia>
<Servico>
<Valores>
<ValorServicos>${dadosServico.valorServicos}</ValorServicos>
</Valores>
<IssRetido>2</IssRetido>
<ItemListaServico>${dadosServico.itemListaServico}</ItemListaServico>
<CodigoCnae>6201500</CodigoCnae>
<Discriminacao>${dadosServico.discriminacao}</Discriminacao>
<CodigoMunicipio>${dadosServico.codigoMunicipio}</CodigoMunicipio>
<ExigibilidadeISS>1</ExigibilidadeISS>
<MunicipioIncidencia>${dadosServico.codigoMunicipio}</MunicipioIncidencia>
</Servico>
<Prestador>
<CpfCnpj>
<Cnpj>${dadosPrestador.cnpj}</Cnpj>
</CpfCnpj>
<InscricaoMunicipal>${dadosPrestador.inscricaoMunicipal}</InscricaoMunicipal>
</Prestador>
<Tomador>
<IdentificacaoTomador>
<CpfCnpj>
<Cnpj>${dadosTomador.cpfCnpj}</Cnpj>
</CpfCnpj>
</IdentificacaoTomador>
<RazaoSocial>${dadosTomador.razaoSocial}</RazaoSocial>
<Endereco>
<Endereco>${dadosTomador.endereco}</Endereco>
<Numero>${dadosTomador.numero}</Numero>
<Bairro>${dadosTomador.bairro}</Bairro>
<CodigoMunicipio>${dadosTomador.codigoMunicipio}</CodigoMunicipio>
<Uf>${dadosTomador.uf}</Uf>
<Cep>${dadosTomador.cep}</Cep>
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

    return xml;
}

async function assinarConformeModeloOficial(xml) {
    try {
        console.log('🔐 Assinando conforme modelo oficial (apenas LoteRps)...');
        
        // Para Node.js - usar fs em vez de fetch
        const fs = require('fs');
        const forge = require('node-forge');
        
        // Carregar certificado do arquivo
        const pfxBuffer = fs.readFileSync('./certificados/pixelvivo.pfx');
        const pfxBytes = new Uint8Array(pfxBuffer);
        const senha = 'pixel2025';
        
        // Processar certificado
        const p12Asn1 = forge.asn1.fromDer(forge.util.createBuffer(pfxBytes));
        const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, senha);
        
        // Extrair certificado e chave privada
        const bags = p12.getBags({ bagType: forge.pki.oids.certBag });
        const certBag = bags[forge.pki.oids.certBag][0];
        const certificate = certBag.cert;
        
        const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
        const keyBag = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag][0];
        const privateKey = keyBag.key;
        
        console.log('✅ Certificado carregado no Node.js');
        
        // Extrair LoteRps para assinatura
        const loteRpsMatch = xml.match(/<LoteRps[^>]*>([\s\S]*?)<\/LoteRps>/);
        if (!loteRpsMatch) {
            throw new Error('LoteRps não encontrado');
        }
        
        const loteRpsTag = xml.match(/<LoteRps[^>]*>/)[0];
        const idMatch = loteRpsTag.match(/Id="([^"]*)"/);
        if (!idMatch) {
            throw new Error('Id do LoteRps não encontrado');
        }
        
        const loteRpsId = idMatch[1];
        const loteRpsCompleto = loteRpsMatch[0];
        
        // Canonicalizar (função simples para Node.js)
        function canonicalizarXMLSimples(xmlString) {
            return xmlString
                .replace(/>\s+</g, '><')  // Remove espaços entre tags
                .replace(/\r\n/g, '\n')   // Normaliza quebras de linha
                .replace(/\r/g, '\n')     // Remove \r isolados
                .trim();
        }
        
        const xmlCanonicalizado = canonicalizarXMLSimples(loteRpsCompleto);
        
        // Digest SHA-1
        const md = forge.md.sha1.create();
        md.update(xmlCanonicalizado, 'utf8');
        const digestValue = forge.util.encode64(md.digest().bytes());
        
        // SignedInfo conforme modelo oficial
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
        const signedInfoCanonicalizado = canonicalizarXMLSimples(signedInfo);
        const mdSignature = forge.md.sha1.create();
        mdSignature.update(signedInfoCanonicalizado, 'utf8');
        const signature = privateKey.sign(mdSignature);
        const signatureValue = forge.util.encode64(signature);
        
        // Certificado
        const certDer = forge.asn1.toDer(forge.pki.certificateToAsn1(certificate)).getBytes();
        const certificateValue = forge.util.encode64(certDer);
        
        // Assinatura conforme modelo oficial
        const xmlSignature = `<Signature xmlns="http://www.w3.org/2000/09/xmldsig#">
${signedInfo}
<SignatureValue>${signatureValue}</SignatureValue>
<KeyInfo>
<X509Data>
<X509Certificate>${certificateValue}</X509Certificate>
</X509Data>
</KeyInfo>
</Signature>`;
        
        // Inserir assinatura conforme modelo oficial (após LoteRps, dentro de EnviarLoteRpsEnvio)
        const xmlAssinado = xml.replace('</LoteRps>', '</LoteRps>\n' + xmlSignature);
        
        console.log('✅ XML assinado conforme modelo oficial João Pessoa');
        return xmlAssinado;
        
    } catch (erro) {
        console.error('❌ Erro na assinatura modelo oficial:', erro);
        return null;
    }
}

// Executar análise
setTimeout(analisarDiferencasModelosOficiais, 1000);
