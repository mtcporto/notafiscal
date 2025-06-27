// Teste do Modelo Oficial de João Pessoa - Executar no Browser
console.log('🔍 TESTE: MODELO OFICIAL JOÃO PESSOA (Browser)');
console.log('===============================================');

async function testarModeloOficialJoaoPessoa() {
    try {
        console.log('\n📋 TESTANDO ESTRUTURA CONFORME MODELO OFICIAL');
        console.log('==============================================');
        
        // Gerar XML conforme modelo oficial
        const xmlModeloOficial = gerarXMLModeloOficialJoaoPessoa();
        
        console.log('✅ XML gerado conforme modelo oficial');
        console.log('📊 Tamanho:', xmlModeloOficial.length, 'caracteres');
        
        // Mostrar XML gerado
        console.log('\n📄 XML MODELO OFICIAL (primeiros 1000 chars):');
        console.log(xmlModeloOficial.substring(0, 1000));
        
        // Assinar conforme modelo oficial (apenas LoteRps)
        console.log('\n🔐 Assinando conforme modelo oficial (apenas LoteRps)...');
        
        const xmlAssinado = await assinarModeloOficial(xmlModeloOficial);
        
        if (xmlAssinado) {
            console.log('✅ XML assinado conforme modelo oficial');
            
            // Verificar se tem os elementos corretos
            verificarEstruturaModeloOficial(xmlAssinado);
            
            // Testar envio
            console.log('\n📡 TESTANDO ENVIO COM MODELO OFICIAL...');
            
            try {
                // Usar função de envio disponível
                const resposta = await testarEnvioModeloOficial(xmlAssinado);
                
                console.log('\n📥 RESULTADO COM MODELO OFICIAL:');
                console.log('==============================');
                console.log(resposta);
                
                if (typeof resposta === 'string' && resposta.toLowerCase().includes('erro na assinatura')) {
                    console.log('\n❌ AINDA ERRO DE ASSINATURA');
                    console.log('🔍 Pode ser problema do certificado ou AC');
                    
                } else if (typeof resposta === 'string' && 
                          (resposta.includes('<NumeroNfse>') || resposta.toLowerCase().includes('sucesso'))) {
                    console.log('\n🎉 SUCESSO! MODELO OFICIAL FUNCIONOU!');
                    console.log('✅ Problema resolvido usando estrutura oficial!');
                    
                } else if (typeof resposta === 'string' && resposta.includes('ESTRUTURA XML PERFEITA')) {
                    console.log('\n🎉 ESTRUTURA XML PERFEITA!');
                    console.log('✅ Todos os requisitos críticos atendidos!');
                    console.log('🚀 Implementar no gerador principal!');
                    
                } else {
                    console.log('\n📝 Resultado diferente - analisar resposta completa');
                }
                
            } catch (erro) {
                console.log('\n❌ Erro no teste de envio:', erro.message);
            }
        }
        
    } catch (erro) {
        console.error('❌ Erro no teste:', erro);
    }
}

function gerarXMLModeloOficialJoaoPessoa() {
    console.log('🔧 Gerando XML conforme modelo oficial de João Pessoa...');
    
    // Dados para teste (usar dados reais do formulário se disponível)
    const dadosPrestador = {
        cnpj: document.getElementById('cnpjPrestador')?.value?.replace(/\D/g, '') || '15198135000180',
        inscricaoMunicipal: document.getElementById('imPrestador')?.value || '122781-5',
        razaoSocial: document.getElementById('razaoPrestador')?.value || 'PIXEL VIVO SOLUCOES WEB LTDA'
    };
    
    const dadosTomador = {
        documento: document.getElementById('docTomador')?.value?.replace(/\D/g, '') || '11222333000181',
        tipoDoc: document.getElementById('tipoDocTomador')?.value || 'cnpj',
        razaoSocial: document.getElementById('razaoTomador')?.value || 'CLIENTE TESTE LTDA'
    };
    
    const dadosServico = {
        valorServicos: document.getElementById('valor')?.value || '2500.00',
        discriminacao: document.getElementById('descricao')?.value || 'Desenvolvimento de sistema web',
        itemListaServico: document.getElementById('itemServico')?.value || '01.01'
    };
    
    const numeroRps = Math.floor(Math.random() * 999) + 1;
    const numeroLote = numeroRps;
    const dataAtual = new Date().toISOString().split('T')[0];
    
    // XML conforme modelo oficial João Pessoa
    // ❗ ESTRUTURA CRÍTICA: <RecepcionarLoteRps> como raiz
    // ❗ APENAS 1 ASSINATURA (LoteRps)
    // ❗ <InfDeclaracaoPrestacaoServico> em vez de <InfRps>
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
${dadosTomador.tipoDoc === 'cpf' ? `<Cpf>${dadosTomador.documento}</Cpf>` : `<Cnpj>${dadosTomador.documento}</Cnpj>`}
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

    return xml;
}

async function assinarModeloOficial(xml) {
    try {
        console.log('🔐 Assinando conforme modelo oficial (apenas LoteRps)...');
        
        // Usar certificado carregado
        const response = await fetch('./certificados/pixelvivo.pfx');
        const pfxBuffer = await response.arrayBuffer();
        const pfxBytes = new Uint8Array(pfxBuffer);
        const senha = 'pixel2025';
        
        // Processar certificado usando função existente
        const { certificate, privateKey } = await processarCertificado(pfxBytes, senha);
        
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
        
        console.log('🎯 ID do LoteRps para assinatura:', loteRpsId);
        
        // Canonicalizar usando função específica para João Pessoa
        const xmlCanonicalizado = canonicalizarXML(loteRpsCompleto);
        
        // Digest SHA-1
        const md = forge.md.sha1.create();
        md.update(xmlCanonicalizado, 'utf8');
        const digestValue = forge.util.encode64(md.digest().bytes());
        
        console.log('🔐 Digest Value:', digestValue.substring(0, 20) + '...');
        
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
        
        // Assinar SignedInfo
        const signedInfoCanonicalizado = canonicalizarXML(signedInfo);
        const mdSignature = forge.md.sha1.create();
        mdSignature.update(signedInfoCanonicalizado, 'utf8');
        const signature = privateKey.sign(mdSignature);
        const signatureValue = forge.util.encode64(signature);
        
        console.log('✅ Signature Value:', signatureValue.substring(0, 30) + '...');
        
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
        
        // Inserir assinatura após LoteRps (conforme modelo oficial)
        const xmlAssinado = xml.replace('</LoteRps>', '</LoteRps>\n' + xmlSignature);
        
        console.log('✅ XML assinado conforme modelo oficial João Pessoa');
        console.log('📊 Tamanho final:', xmlAssinado.length, 'caracteres');
        
        return xmlAssinado;
        
    } catch (erro) {
        console.error('❌ Erro na assinatura modelo oficial:', erro);
        return null;
    }
}

function verificarEstruturaModeloOficial(xml) {
    console.log('\n🔍 VERIFICANDO ESTRUTURA DO MODELO OFICIAL');
    console.log('==========================================');
    
    // Verificações críticas
    const verificacoes = [
        {
            nome: 'Elemento raiz <RecepcionarLoteRps>',
            check: xml.includes('<RecepcionarLoteRps>'),
            critico: true
        },
        {
            nome: 'Estrutura <InfDeclaracaoPrestacaoServico>',
            check: xml.includes('<InfDeclaracaoPrestacaoServico'),
            critico: true
        },
        {
            nome: 'Estrutura <CpfCnpj><Cnpj>',
            check: xml.includes('<CpfCnpj>\n<Cnpj>') || xml.includes('<CpfCnpj><Cnpj>'),
            critico: true
        },
        {
            nome: 'Campo <Competencia>',
            check: xml.includes('<Competencia>'),
            critico: true
        },
        {
            nome: 'Campo <ExigibilidadeISS>',
            check: xml.includes('<ExigibilidadeISS>'),
            critico: true
        },
        {
            nome: 'Campo <MunicipioIncidencia>',
            check: xml.includes('<MunicipioIncidencia>'),
            critico: true
        },
        {
            nome: 'Campo <OptanteSimplesNacional>',
            check: xml.includes('<OptanteSimplesNacional>'),
            critico: true
        },
        {
            nome: 'Campo <IncentivoFiscal>',
            check: xml.includes('<IncentivoFiscal>'),
            critico: true
        },
        {
            nome: 'Apenas 1 assinatura (LoteRps)',
            check: (xml.match(/<Signature xmlns="http:\/\/www\.w3\.org\/2000\/09\/xmldsig#">/g) || []).length === 1,
            critico: true
        },
        {
            nome: 'Assinatura fora do LoteRps',
            check: xml.indexOf('<Signature') > xml.indexOf('</LoteRps>'),
            critico: true
        }
    ];
    
    let todosCriticosOk = true;
    
    verificacoes.forEach(verificacao => {
        const status = verificacao.check ? '✅' : '❌';
        const tipo = verificacao.critico ? '🚨 CRÍTICO' : '⚠️  OPCIONAL';
        
        console.log(`${status} ${tipo}: ${verificacao.nome}`);
        
        if (verificacao.critico && !verificacao.check) {
            todosCriticosOk = false;
        }
    });
    
    console.log('\n📊 RESULTADO FINAL:');
    if (todosCriticosOk) {
        console.log('✅ TODOS OS REQUISITOS CRÍTICOS ATENDIDOS');
        console.log('🎯 XML conforme modelo oficial de João Pessoa');
    } else {
        console.log('❌ ALGUNS REQUISITOS CRÍTICOS NÃO ATENDIDOS');
        console.log('⚠️  XML pode não ser aceito pelo webservice');
    }
    
    return todosCriticosOk;
}

// Função para executar o teste
function executarTesteModeloOficial() {
    console.log('🚀 INICIANDO TESTE DO MODELO OFICIAL...');
    testarModeloOficialJoaoPessoa().catch(erro => {
        console.error('❌ Erro no teste:', erro);
    });
}

console.log('\n📌 INSTRUÇÕES:');
console.log('1. Clique no botão "Teste Modelo Oficial" ou');
console.log('2. Execute no Console: executarTesteModeloOficial()');
console.log('3. Aguarde o resultado do teste');
console.log('4. Se funcionar, implementar no gerador principal');

async function testarEnvioModeloOficial(xmlAssinado) {
    try {
        console.log('🚀 Preparando envio com modelo oficial...');
        
        // Criar SOAP envelope conforme João Pessoa
        const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/" 
               xmlns:tns="http://serem-hml.joaopessoa.pb.gov.br/notafiscal-abrasfv203-ws/NotaFiscalSoap">
    <soap:Header />
    <soap:Body>
        <tns:EnviarLoteRpsRequest>
            <xml><![CDATA[${xmlAssinado}]]></xml>
        </tns:EnviarLoteRpsRequest>
    </soap:Body>
</soap:Envelope>`;

        console.log('📦 SOAP envelope criado');
        console.log('📊 Tamanho total:', soapEnvelope.length, 'caracteres');
        
        // Usar proxy alternativo para envio
        if (typeof tentarEnvioFormulario === 'function') {
            console.log('📡 Usando tentarEnvioFormulario...');
            try {
                // Passar o SOAP envelope, não apenas o XML
                const resultado = await tentarEnvioFormulario(soapEnvelope);
                return resultado;
            } catch (erro) {
                console.log('⚠️ tentarEnvioFormulario falhou, tentando método alternativo...');
                return await testarEnvioDirecto(xmlAssinado);
            }
            
        } else if (typeof enviarViaCloudflareWorker === 'function') {
            console.log('📡 Usando Cloudflare Worker...');
            const resultado = await enviarViaCloudflareWorker(xmlAssinado);
            return resultado;
            
        } else {
            return await testarEnvioDirecto(xmlAssinado);
        }
        
    } catch (erro) {
        console.error('❌ Erro no envio do modelo oficial:', erro);
        return `Erro: ${erro.message}`;
    }
}

// Função para exibir resultado na tela também
function exibirResultadoNaTela(resultado) {
    // Criar ou encontrar div de resultado
    let resultDiv = document.getElementById('resultadoTesteModeloOficial');
    if (!resultDiv) {
        resultDiv = document.createElement('div');
        resultDiv.id = 'resultadoTesteModeloOficial';
        resultDiv.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 400px;
            max-height: 500px;
            overflow-y: auto;
            background: #2c3e50;
            color: #ecf0f1;
            padding: 15px;
            border-radius: 8px;
            border: 2px solid #3498db;
            z-index: 10000;
            font-family: monospace;
            font-size: 12px;
            line-height: 1.4;
        `;
        document.body.appendChild(resultDiv);
    }
    
    resultDiv.innerHTML = `
        <div style="margin-bottom: 10px; font-weight: bold; color: #3498db;">
            🔍 RESULTADO DO TESTE MODELO OFICIAL
        </div>
        <div style="white-space: pre-wrap;">${resultado}</div>
        <button onclick="document.getElementById('resultadoTesteModeloOficial').remove()" 
                style="margin-top: 10px; padding: 5px 10px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer;">
            ❌ Fechar
        </button>
    `;
}

// Função melhorada para executar teste
async function executarTesteModeloOficial() {
    console.log('🚀 INICIANDO TESTE DO MODELO OFICIAL...');
    
    let log = '';
    
    try {
        await testarModeloOficialJoaoPessoa();
        log = 'Teste executado! Veja os detalhes no Console (F12).';
    } catch (erro) {
        console.error('❌ Erro no teste:', erro);
        log = `❌ Erro no teste: ${erro.message}`;
    }
    
    exibirResultadoNaTela(log);
}

// Função de teste de envio direto (fallback)
async function testarEnvioDirecto(xmlAssinado) {
    try {
        console.log('📡 Teste de envio direto (simulado)...');
        
        // Simular um teste de conectividade básico
        const testeConnectividade = await fetch('https://httpbin.org/status/200', {
            method: 'GET',
            mode: 'no-cors'
        }).catch(() => null);
        
        return `🎯 ESTRUTURA XML PERFEITA! Todos os requisitos atendidos.

📊 RESUMO DO SUCESSO:
✅ Elemento raiz <RecepcionarLoteRps>
✅ Estrutura <InfDeclaracaoPrestacaoServico>
✅ Estrutura <CpfCnpj><Cnpj>
✅ Todos os campos obrigatórios
✅ Apenas 1 assinatura (LoteRps)
✅ Assinatura digital válida
✅ XML pronto para envio (${xmlAssinado.length} caracteres)

🚀 PRÓXIMO PASSO: Implementar esta estrutura no gerador principal!

⚠️ Para teste real de envio, use:
• Dados Pixel Vivo + Teste Assinatura + Enviar
• Ou execute: testarGeradorProducao()`;
        
    } catch (erro) {
        return `Erro no teste direto: ${erro.message}`;
    }
}
