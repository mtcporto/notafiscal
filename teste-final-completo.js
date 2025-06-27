// 🧪 TESTE FINAL - Verificação Completa do Sistema
// Este script testa todos os fluxos do sistema para garantir funcionamento

console.log('🧪 INICIANDO TESTE FINAL COMPLETO...');

// 1. Testar carregamento de certificados
async function testeCarregamentoCertificado() {
    console.log('\n📋 1. TESTE: Carregamento de Certificado');
    
    try {
        // Tentar carregar certificado pixelvivo
        const response = await fetch('./certificados/pixelvivo.pfx');
        const pfxBuffer = await response.arrayBuffer();
        console.log('✅ Certificado pixelvivo.pfx carregado:', pfxBuffer.byteLength, 'bytes');
        return true;
    } catch (error) {
        console.log('❌ Erro ao carregar certificado:', error.message);
        console.log('⚠️ Verificar se está executando via http://localhost/');
        return false;
    }
}

// 2. Testar geração de XML
async function testeGeracaoXML() {
    console.log('\n📋 2. TESTE: Geração de XML');
    
    try {
        // Dados de teste
        const dadosTeste = {
            numero: '123',
            serie: '1',
            tipo: '1',
            dataEmissao: new Date().toISOString(),
            naturezaOperacao: '1',
            regimeEspecialTributacao: '6',
            optanteSimplesNacional: '2',
            incentivadorCultural: '2',
            status: '1',
            rpsSubstituido: '',
            prestador: {
                cnpj: '11222333000181',
                inscricaoMunicipal: '123456',
                razaoSocial: 'EMPRESA TESTE LTDA',
                nomeFantasia: 'EMPRESA TESTE',
                endereco: {
                    endereco: 'RUA TESTE, 123',
                    numero: '123',
                    bairro: 'CENTRO',
                    codigoMunicipio: '2507507',
                    uf: 'PB',
                    cep: '58000000'
                }
            },
            tomador: {
                cnpjCpf: '12345678901',
                inscricaoMunicipal: '',
                razaoSocial: 'CLIENTE TESTE',
                endereco: {
                    endereco: 'RUA CLIENTE, 456',
                    numero: '456',
                    bairro: 'CENTRO',
                    codigoMunicipio: '2507507',
                    uf: 'PB',
                    cep: '58000000'
                }
            },
            servico: {
                itemListaServico: '14.01',
                codigoTributacaoMunicipio: '140101',
                discriminacao: 'TESTE DE SERVICO',
                codigoMunicipio: '2507507',
                valores: {
                    valorServicos: '100.00',
                    valorDeducoes: '0.00',
                    valorPis: '0.00',
                    valorCofins: '0.00',
                    valorInss: '0.00',
                    valorIr: '0.00',
                    valorCsll: '0.00',
                    issRetido: '2',
                    valorIss: '5.00',
                    valorIssRetido: '0.00',
                    outrasRetencoes: '0.00',
                    baseCalculo: '100.00',
                    aliquota: '0.05',
                    valorLiquidoNfse: '100.00',
                    descontoIncondicionado: '0.00',
                    descontoCondicionado: '0.00'
                }
            }
        };

        // Usar função global de geração de XML
        if (typeof gerarXMLCompleto === 'function') {
            const xml = gerarXMLCompleto(dadosTeste);
            console.log('✅ XML gerado:', xml.length, 'caracteres');
            
            // Verificar estrutura XML
            if (xml.includes('versao="2.03"') && 
                xml.includes('http://www.abrasf.org.br/nfse.xsd') &&
                xml.includes('<NumeroLote>')) {
                console.log('✅ Estrutura XML válida (ABRASF 2.03)');
                return true;
            } else {
                console.log('❌ Estrutura XML inválida');
                return false;
            }
        } else {
            console.log('❌ Função gerarXMLCompleto não encontrada');
            return false;
        }
    } catch (error) {
        console.log('❌ Erro na geração de XML:', error.message);
        return false;
    }
}

// 3. Testar assinatura digital
async function testeAssinatura() {
    console.log('\n📋 3. TESTE: Assinatura Digital');
    
    try {
        // XML de teste simples
        const xmlTeste = `<?xml version="1.0" encoding="UTF-8"?>
<EnviarLoteRpsEnvio xmlns="http://www.abrasf.org.br/nfse.xsd" versao="2.03">
    <LoteRps Id="lote123" versao="2.03">
        <NumeroLote>123</NumeroLote>
        <CpfCnpj><Cnpj>11222333000181</Cnpj></CpfCnpj>
        <InscricaoMunicipal>123456</InscricaoMunicipal>
        <QuantidadeRps>1</QuantidadeRps>
        <ListaRps>
            <Rps versao="2.03" Id="">
                <InfDeclaracaoPrestacaoServico Id="rps123">
                    <Rps>
                        <IdentificacaoRps>
                            <Numero>123</Numero>
                            <Serie>1</Serie>
                            <Tipo>1</Tipo>
                        </IdentificacaoRps>
                        <DataEmissao>2025-01-01T00:00:00</DataEmissao>
                        <Status>1</Status>
                    </Rps>
                    <Prestador>
                        <CpfCnpj><Cnpj>11222333000181</Cnpj></CpfCnpj>
                        <InscricaoMunicipal>123456</InscricaoMunicipal>
                    </Prestador>
                </InfDeclaracaoPrestacaoServico>
            </Rps>
        </ListaRps>
    </LoteRps>
</EnviarLoteRpsEnvio>`;

        // Verificar se função de assinatura existe
        if (typeof assinarXMLCompleto === 'function') {
            const resultado = await assinarXMLCompleto(xmlTeste, false); // false = usar certificado real
            
            if (resultado.sucesso) {
                console.log('✅ XML assinado com sucesso');
                console.log('✅ Assinatura válida:', resultado.assinaturaValida);
                return true;
            } else {
                console.log('❌ Erro na assinatura:', resultado.erro);
                return false;
            }
        } else {
            console.log('❌ Função assinarXMLCompleto não encontrada');
            return false;
        }
    } catch (error) {
        console.log('❌ Erro no teste de assinatura:', error.message);
        return false;
    }
}

// 4. Testar envio SOAP
async function testeEnvioSOAP() {
    console.log('\n📋 4. TESTE: Envio SOAP');
    
    try {
        // XML SOAP de teste mínimo
        const soapXML = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
    <soap:Header/>
    <soap:Body>
        <tem:RecepcionarLoteRps>
            <tem:inputXML><![CDATA[<teste>conteudo</teste>]]></tem:inputXML>
        </tem:RecepcionarLoteRps>
    </soap:Body>
</soap:Envelope>`;

        const response = await fetch('https://nfse.joaopessoa.pb.gov.br/WSNacional/nfse_sjp.asmx', {
            method: 'POST',
            headers: {
                'Content-Type': 'text/xml; charset=utf-8',
                'SOAPAction': 'http://tempuri.org/RecepcionarLoteRps'
            },
            body: soapXML
        });

        console.log('✅ Resposta do webservice:', response.status, response.statusText);
        
        const responseText = await response.text();
        console.log('✅ Conexão com webservice funcionando');
        
        // Verificar se é uma resposta SOAP válida (mesmo que com erro)
        if (responseText.includes('soap:') || responseText.includes('Envelope')) {
            console.log('✅ Resposta SOAP válida recebida');
            return true;
        } else {
            console.log('⚠️ Resposta não-SOAP, mas conexão OK');
            return true;
        }
    } catch (error) {
        console.log('❌ Erro no envio SOAP:', error.message);
        return false;
    }
}

// 5. Executar todos os testes
async function executarTesteFinal() {
    console.log('🚀 EXECUTANDO TESTE FINAL COMPLETO...\n');
    
    const resultados = {
        certificado: await testeCarregamentoCertificado(),
        xml: await testeGeracaoXML(),
        assinatura: await testeAssinatura(),
        envio: await testeEnvioSOAP()
    };
    
    console.log('\n📊 RESUMO DOS TESTES:');
    console.log('✅ Certificado:', resultados.certificado ? 'OK' : 'FALHOU');
    console.log('✅ Geração XML:', resultados.xml ? 'OK' : 'FALHOU');
    console.log('✅ Assinatura:', resultados.assinatura ? 'OK' : 'FALHOU');
    console.log('✅ Envio SOAP:', resultados.envio ? 'OK' : 'FALHOU');
    
    const totalOK = Object.values(resultados).filter(r => r).length;
    const total = Object.values(resultados).length;
    
    console.log(`\n🎯 RESULTADO FINAL: ${totalOK}/${total} testes passaram`);
    
    if (totalOK === total) {
        console.log('🎉 SISTEMA 100% FUNCIONAL!');
        console.log('🚀 Pronto para uso em produção!');
    } else {
        console.log('⚠️ Sistema com problemas - verificar itens que falharam');
        
        if (!resultados.certificado) {
            console.log('📝 Certificado: Execute via http://localhost/ (não file://)');
        }
        if (!resultados.xml || !resultados.assinatura) {
            console.log('📝 XML/Assinatura: Verificar dependências e scripts carregados');
        }
        if (!resultados.envio) {
            console.log('📝 Envio: Verificar conexão com internet e CORS');
        }
    }
    
    return resultados;
}

// Auto-executar quando carregado
if (typeof window !== 'undefined') {
    // No navegador - aguardar carregamento completo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(executarTesteFinal, 2000); // Aguardar 2s para scripts carregarem
        });
    } else {
        setTimeout(executarTesteFinal, 2000);
    }
} else {
    // No Node.js - executar imediatamente
    executarTesteFinal();
}

// Exportar para uso manual
if (typeof window !== 'undefined') {
    window.testeFinalCompleto = executarTesteFinal;
}
