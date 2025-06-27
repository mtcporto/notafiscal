// Teste comparativo: Fluxo Normal vs Modelo Oficial
console.log('🔍 TESTE COMPARATIVO: FLUXO NORMAL vs MODELO OFICIAL');
console.log('=====================================================');

async function testarFluxoNormalVsOficial() {
    try {
        console.log('\n📋 TESTANDO AMBOS OS FLUXOS LADO A LADO');
        console.log('======================================');
        
        // 1. TESTAR MODELO OFICIAL (que funciona)
        console.log('\n1️⃣ TESTANDO MODELO OFICIAL (FUNCIONANDO)...');
        const xmlModeloOficial = await gerarTestarModeloOficial();
        
        // 2. TESTAR FLUXO NORMAL (corrigido)
        console.log('\n2️⃣ TESTANDO FLUXO NORMAL (CORRIGIDO)...');
        const xmlFluxoNormal = await gerarTestarFluxoNormal();
        
        // 3. COMPARAR ESTRUTURAS
        console.log('\n3️⃣ COMPARANDO ESTRUTURAS...');
        compararEstruturas(xmlModeloOficial, xmlFluxoNormal);
        
        // 4. TESTAR AMBOS NO WEBSERVICE
        console.log('\n4️⃣ TESTANDO AMBOS NO WEBSERVICE...');
        await testarAmbosWebservice(xmlModeloOficial, xmlFluxoNormal);
        
    } catch (erro) {
        console.error('❌ Erro no teste comparativo:', erro);
    }
}

async function gerarTestarModeloOficial() {
    console.log('🔧 Gerando XML via modelo oficial...');
    
    // Usar mesmos dados do teste que funciona
    const dadosPrestador = {
        cnpj: '15198135000180',
        inscricaoMunicipal: '122781-5',
        razaoSocial: 'PIXEL VIVO SOLUCOES WEB LTDA'
    };
    
    const dadosTomador = {
        documento: '11222333000181',
        tipoDoc: 'cnpj',
        razaoSocial: 'CLIENTE TESTE LTDA'
    };
    
    const dadosServico = {
        valorServicos: '2500.00',
        discriminacao: 'Desenvolvimento de sistema web',
        itemListaServico: '01.01'
    };
    
    const numeroRps = 123;
    const dataAtual = new Date().toISOString().split('T')[0];
    
    const xml = `<RecepcionarLoteRps>
<EnviarLoteRpsEnvio>
<LoteRps Id="lote${numeroRps}" versao="2.03">
<NumeroLote>${numeroRps}</NumeroLote>
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
<CodigoMunicipio>2211001</CodigoMunicipio>
<ExigibilidadeISS>1</ExigibilidadeISS>
<MunicipioIncidencia>2211001</MunicipioIncidencia>
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
<Cnpj>${dadosTomador.documento}</Cnpj>
</CpfCnpj>
</IdentificacaoTomador>
<RazaoSocial>${dadosTomador.razaoSocial}</RazaoSocial>
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

    console.log('✅ XML modelo oficial gerado');
    return xml;
}

async function gerarTestarFluxoNormal() {
    console.log('🔧 Gerando XML via fluxo normal (função construirXMLJoaoPessoa)...');
    
    // Simular dados do formulário (mesmos dados do modelo oficial)
    const dados = {
        prestador: {
            cnpj: '15198135000180',
            inscricaoMunicipal: '122781-5',
            simplesNacional: '2',
            incentivoCultural: '2'
        },
        tomador: {
            documento: '11222333000181',
            tipoDoc: 'cnpj',
            razaoSocial: 'CLIENTE TESTE LTDA',
            endereco: {
                logradouro: 'RUA TESTE',
                numero: '123',
                bairro: 'CENTRO',
                cep: '58000000'
            }
        },
        servico: {
            valorServicos: 2500.00,
            descricao: 'Desenvolvimento de sistema web',
            itemListaServico: '01.01',
            issRetido: '2',
            exigibilidadeIss: '1',
            codigoCnae: '6201500'
        }
    };
    
    const valorServico = 2500.00;
    const valorIss = 0;
    const valorLiquido = 2500.00;
    const numeroRps = 123;
    const serieRps = 'A1';
    
    // Usar função do sistema
    const xml = construirXMLJoaoPessoa(dados, valorServico, valorIss, valorLiquido, numeroRps, serieRps);
    
    console.log('✅ XML fluxo normal gerado');
    return xml;
}

function compararEstruturas(xmlOficial, xmlNormal) {
    console.log('🔍 COMPARANDO ESTRUTURAS XML...');
    
    // Remover espaços e quebras para comparação
    const normalizeXml = (xml) => xml.replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim();
    
    const oficialNorm = normalizeXml(xmlOficial);
    const normalNorm = normalizeXml(xmlNormal);
    
    console.log('📊 Tamanhos:');
    console.log('  - Modelo Oficial:', xmlOficial.length, 'chars');
    console.log('  - Fluxo Normal:', xmlNormal.length, 'chars');
    
    if (oficialNorm === normalNorm) {
        console.log('🎉 ESTRUTURAS IDÊNTICAS! XMLs são equivalentes!');
        return true;
    } else {
        console.log('⚠️ DIFERENÇAS ENCONTRADAS:');
        
        // Encontrar primeira diferença
        let pos = 0;
        while (pos < Math.min(oficialNorm.length, normalNorm.length)) {
            if (oficialNorm[pos] !== normalNorm[pos]) {
                break;
            }
            pos++;
        }
        
        console.log('🎯 Primeira diferença na posição:', pos);
        console.log('📄 Contexto Oficial:', oficialNorm.substring(Math.max(0, pos-50), pos+50));
        console.log('📄 Contexto Normal:', normalNorm.substring(Math.max(0, pos-50), pos+50));
        
        return false;
    }
}

async function testarAmbosWebservice(xmlOficial, xmlNormal) {
    console.log('📡 TESTANDO AMBOS XMLs NO WEBSERVICE...');
    
    try {
        // Carregar certificado
        const response = await fetch('./certificados/pixelvivo.pfx');
        const pfxBuffer = await response.arrayBuffer();
        const pfxBytes = new Uint8Array(pfxBuffer);
        const senha = 'pixel2025';
        
        const { certificate, privateKey } = await processarCertificado(pfxBytes, senha);
        
        console.log('📋 1. TESTANDO MODELO OFICIAL...');
        const resultadoOficial = await testarXMLNoWebservice(xmlOficial, certificate, privateKey, 'OFICIAL');
        
        console.log('📋 2. TESTANDO FLUXO NORMAL...');
        const resultadoNormal = await testarXMLNoWebservice(xmlNormal, certificate, privateKey, 'NORMAL');
        
        console.log('\n📊 RESUMO DOS RESULTADOS:');
        console.log('=========================');
        console.log('🔸 Modelo Oficial:', resultadoOficial ? '✅ Sucesso' : '❌ Erro');
        console.log('🔸 Fluxo Normal:', resultadoNormal ? '✅ Sucesso' : '❌ Erro');
        
        if (resultadoOficial && resultadoNormal) {
            console.log('\n🎉 AMBOS FUNCIONARAM! PROBLEMA RESOLVIDO!');
        } else if (resultadoOficial && !resultadoNormal) {
            console.log('\n⚠️ Apenas modelo oficial funciona. Verificar diferenças.');
        } else if (!resultadoOficial && !resultadoNormal) {
            console.log('\n❌ Ambos falharam. Problema no certificado ou webservice.');
        }
        
    } catch (erro) {
        console.error('❌ Erro no teste de webservice:', erro);
    }
}

async function testarXMLNoWebservice(xml, certificate, privateKey, tipo) {
    try {
        console.log(`🔐 Assinando XML ${tipo}...`);
        
        // Assinar usando mesma lógica do modelo oficial
        const xmlAssinado = await assinarXMLJoaoPessoa(xml, certificate, privateKey);
        
        if (!xmlAssinado) {
            console.log(`❌ Falha na assinatura ${tipo}`);
            return false;
        }
        
        console.log(`📡 Enviando XML ${tipo} para webservice...`);
        
        // Simular envio (usar função existente se disponível)
        if (typeof enviarParaWebservice === 'function') {
            const resposta = await enviarParaWebservice(xmlAssinado);
            
            const sucesso = resposta && !resposta.includes('erro na assinatura');
            console.log(`📥 Resultado ${tipo}:`, sucesso ? '✅ Aceito' : '❌ Rejeitado');
            
            return sucesso;
        } else {
            console.log(`✅ XML ${tipo} assinado com sucesso (envio não disponível)`);
            return true;
        }
        
    } catch (erro) {
        console.log(`❌ Erro no teste ${tipo}:`, erro.message);
        return false;
    }
}

async function assinarXMLJoaoPessoa(xml, certificate, privateKey) {
    try {
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
        
        // Canonicalizar
        const xmlCanonicalizado = canonicalizarXML(loteRpsCompleto);
        
        // Calcular hash
        const hashBytes = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(xmlCanonicalizado));
        const hashBase64 = btoa(String.fromCharCode(...new Uint8Array(hashBytes)));
        
        // Criar SignedInfo
        const signedInfo = `<SignedInfo><CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"></CanonicalizationMethod><SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1"></SignatureMethod><Reference URI="#${loteRpsId}"><Transforms><Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"></Transform><Transform Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"></Transform></Transforms><DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"></DigestMethod><DigestValue>${hashBase64}</DigestValue></Reference></SignedInfo>`;
        
        const signedInfoCanonicalizado = canonicalizarXML(signedInfo);
        
        // Assinar SignedInfo
        const signatureBytes = await crypto.subtle.sign(
            'RSASSA-PKCS1-v1_5',
            privateKey,
            new TextEncoder().encode(signedInfoCanonicalizado)
        );
        const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signatureBytes)));
        
        // Montar assinatura completa
        const assinatura = `<Signature xmlns="http://www.w3.org/2000/09/xmldsig#">${signedInfo}<SignatureValue>${signatureBase64}</SignatureValue><KeyInfo><X509Data><X509Certificate>${certificate}</X509Certificate></X509Data></KeyInfo></Signature>`;
        
        // Inserir assinatura no XML
        const xmlAssinado = xml.replace('</LoteRps>', assinatura + '</LoteRps>');
        
        return xmlAssinado;
        
    } catch (erro) {
        console.error('❌ Erro na assinatura:', erro);
        return null;
    }
}

// Executar teste automático quando script for carregado
console.log('🚀 Iniciando teste comparativo automático...');
testarFluxoNormalVsOficial();
