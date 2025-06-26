const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const fetch = require('node-fetch');
const { DOMParser, XMLSerializer } = require('xmldom');

// --- 1. Simulação do Ambiente do Navegador ---

// Criar um DOM virtual
const dom = new JSDOM('<!DOCTYPE html><html><body><div id="xmlOutput"></div></body></html>', {
    url: 'http://localhost',
    runScripts: 'dangerously',
    pretendToBeVisual: true,
});

// Expor objetos do DOM para o escopo global do Node.js
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.localStorage = dom.window.localStorage;
global.fetch = fetch;
global.DOMParser = DOMParser;
global.XMLSerializer = XMLSerializer;
global.alert = (message) => console.log(`ALERT: ${message}`);
global.confirm = (message) => {
    console.log(`CONFIRM: ${message}`);
    return true; // Simula o usuário sempre clicando 'OK'
};

// Mock para funções que interagem com a UI
global.abrirModal = () => console.log('UI: abrirModal() chamada.');
global.mostrarStatusEnvio = () => console.log('UI: mostrarStatusEnvio() chamada.');
global.exibirResultadoEnvio = (res) => console.log('UI: exibirResultadoEnvio() chamado com:', res);
global.exibirErroEnvio = (err) => console.error('UI: exibirErroEnvio() chamado com:', err);
global.atualizarPassoEnvio = (passo, status) => console.log(`UI: Passo ${passo} -> ${status}`);

// --- 2. Carregamento e Execução dos Scripts ---

// Função para carregar e executar um script no contexto do JSDOM
function loadScript(filePath) {
    const scriptPath = path.resolve(__dirname, filePath);
    const scriptContent = fs.readFileSync(scriptPath, 'utf8');
    try {
        // Executa o script no escopo global, que agora tem o 'window' do JSDOM
        new Function(scriptContent)();
        console.log(`✅ Script ${filePath} carregado e executado com sucesso.`);
    } catch (e) {
        console.error(`❌ Erro ao executar o script ${filePath}:`, e);
        process.exit(1); // Termina se um script essencial falhar
    }
}

// Carregar os scripts necessários
// É importante carregar na ordem de dependência, se houver.
loadScript('assinatura-simples.js');
loadScript('envio.js');

// --- 3. Execução da Lógica Principal ---

async function main() {
    console.log('\n--- Iniciando processo de envio Node.js ---\n');

    // Simular a configuração que seria pega do localStorage
    const config = {
        webservice: {
            url: 'https://serem-hml.joaopessoa.pb.gov.br/notafiscal-abrasfv203-ws/NotaFiscalSoap',
            versao: '2.03'
        },
        certificado: {
            tipo: 'A1',
            arquivo: 'certificados/Wayne Enterprises, Inc..pfx',
            senha: '1234'
        }
    };

    // Simular o XML que estaria na página
    const xmlDeExemplo = `<?xml version="1.0" encoding="UTF-8"?>
<EnviarLoteRpsEnvio xmlns="http://www.abrasf.org.br/nfse.xsd">
    <LoteRps Id="lote_12345">
        <NumeroLote>12345</NumeroLote>
        <Cnpj>08299822000176</Cnpj>
        <InscricaoMunicipal>123456</InscricaoMunicipal>
        <QuantidadeRps>1</QuantidadeRps>
        <ListaRps>
            <Rps>
                <InfDeclaracaoPrestacaoServico Id="rps_1">
                    <Rps>
                        <IdentificacaoRps>
                            <Numero>1</Numero>
                            <Serie>A</Serie>
                            <Tipo>1</Tipo>
                        </IdentificacaoRps>
                        <DataEmissao>2023-10-27T10:00:00</DataEmissao>
                        <Status>1</Status>
                    </Rps>
                    <Competencia>2023-10-27</Competencia>
                    <Servico>
                        <Valores>
                            <ValorServicos>100.00</ValorServicos>
                            <ValorDeducoes>0.00</ValorDeducoes>
                            <ValorPis>0.65</ValorPis>
                            <ValorCofins>3.00</ValorCofins>
                            <ValorInss>0.00</ValorInss>
                            <ValorIr>1.50</ValorIr>
                            <ValorCsll>1.00</ValorCsll>
                            <IssRetido>2</IssRetido>
                            <ValorIss>5.00</ValorIss>
                            <OutrasRetencoes>0.00</OutrasRetencoes>
                            <Aliquota>0.05</Aliquota>
                            <DescontoIncondicionado>0.00</DescontoIncondicionado>
                            <DescontoCondicionado>0.00</DescontoCondicionado>
                        </Valores>
                        <ItemListaServico>1.01</ItemListaServico>
                        <CodigoCnae>7490104</CodigoCnae>
                        <CodigoTributacaoMunicipio>1011</CodigoTributacaoMunicipio>
                        <Discriminacao>Serviços de consultoria</Discriminacao>
                        <CodigoMunicipio>2507507</CodigoMunicipio>
                        <ExigibilidadeISS>1</ExigibilidadeISS>
                        <MunicipioIncidencia>2507507</MunicipioIncidencia>
                    </Servico>
                    <Prestador>
                        <Cnpj>08299822000176</Cnpj>
                        <InscricaoMunicipal>98765</InscricaoMunicipal>
                    </Prestador>
                    <Tomador>
                        <IdentificacaoTomador>
                            <CpfCnpj>
                                <Cnpj>98765432000199</Cnpj>
                            </CpfCnpj>
                        </identificacaoTomador>
                        <RazaoSocial>Empresa Tomadora Exemplo</RazaoSocial>
                        <Endereco>
                            <Endereco>Rua Exemplo</Endereco>
                            <Numero>123</Numero>
                            <Bairro>Centro</Bairro>
                            <CodigoMunicipio>2507507</CodigoMunicipio>
                            <Uf>PB</Uf>
                            <Cep>58000000</Cep>
                        </Endereco>
                        <Contato>
                            <Telefone>83999999999</Telefone>
                            <Email>contato@tomador.com</Email>
                        </Contato>
                    </Tomador>
                    <OptanteSimplesNacional>2</OptanteSimplesNacional>
                    <IncentivoFiscal>2</IncentivoFiscal>
                </InfDeclaracaoPrestacaoServico>
            </Rps>
        </ListaRps>
    </LoteRps>
</EnviarLoteRpsEnvio>`;

    try {
        // Chamar a função de envio principal, que agora deve funcionar no Node.js
        const resultado = await global.enviarParaWebserviceReal(xmlDeExemplo, config);

        console.log('\n--- Resultado Final do Envio ---\n');
        if (resultado.sucesso) {
            console.log('✅ Envio concluído com sucesso!');
            console.log('Protocolo:', resultado.protocolo);
            console.log('NFS-e:', resultado.numeroNfse);
            console.log('Link:', resultado.linkDanfse);
        } else {
            console.error('❌ Falha no envio.');
            console.error('Erro:', resultado.erro);
        }

    } catch (error) {
        console.error('\n--- Erro Crítico na Execução ---\n');
        console.error(error.message);
    }
}

// Iniciar a execução
main();
