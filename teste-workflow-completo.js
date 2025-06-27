// Script para testar o workflow completo de assinatura João Pessoa
// Este script simula exatamente o que acontece no formulário normal

console.log('🧪 Iniciando teste completo do workflow João Pessoa...');

// Simular dados do formulário como no caso real
const dadosFormulario = {
  prestador: {
    cnpj: '12345678000199',
    inscricaoMunicipal: '123456',
    razaoSocial: 'PIXEL VIVO TECNOLOGIA LTDA',
    simplesNacional: '2',
    incentivoCultural: '2'
  },
  tomador: {
    tipoDoc: 'cpf',
    documento: '12345678901',
    razaoSocial: 'TOMADOR TESTE',
    endereco: {
      logradouro: 'RUA TESTE',
      numero: '123',
      bairro: 'CENTRO',
      cep: '58000000'
    }
  },
  servico: {
    valor: 1000.00,
    aliquota: 0.05,
    issRetido: '2',
    itemListaServico: '01.01',
    codigoCnae: '6201500',
    descricao: 'Serviços de desenvolvimento de software',
    exigibilidadeIss: '1'
  }
};

// Gerar XML usando a mesma função do sistema
function construirXMLJoaoPessoa(dados, valorServico, valorIss, valorLiquido, numeroRps, serieRps) {
  console.log('🏗️ Construindo XML específico para João Pessoa');
  
  // Data/hora atual no formato correto
  const agora = new Date();
  const dataEmissao = agora.toISOString().split('T')[0]; // AAAA-MM-DD
  const competencia = dataEmissao.substring(0, 7) + '-01'; // Primeiro dia do mês
  
  return `<RecepcionarLoteRps>
<EnviarLoteRpsEnvio>
<LoteRps Id="lote${numeroRps.toString().padStart(3, '0')}" versao="2.03">
<NumeroLote>${numeroRps}</NumeroLote>
<CpfCnpj>
<Cnpj>${dados.prestador.cnpj}</Cnpj>
</CpfCnpj>
<InscricaoMunicipal>${dados.prestador.inscricaoMunicipal}</InscricaoMunicipal>
<QuantidadeRps>1</QuantidadeRps>
<ListaRps>
<Rps>
<InfDeclaracaoPrestacaoServico Id="rps${numeroRps.toString().padStart(3, '0')}">
<Rps Id="">
<IdentificacaoRps>
<Numero>${numeroRps}</Numero>
<Serie>${serieRps}</Serie>
<Tipo>1</Tipo>
</IdentificacaoRps>
<DataEmissao>${dataEmissao}</DataEmissao>
<Status>1</Status>
</Rps>
<Competencia>${competencia}</Competencia>
<Servico>
<Valores>
<ValorServicos>${valorServico.toFixed(2)}</ValorServicos>
</Valores>
<IssRetido>${dados.servico.issRetido}</IssRetido>
<ItemListaServico>${dados.servico.itemListaServico}</ItemListaServico>
<CodigoCnae>${dados.servico.codigoCnae || '6201500'}</CodigoCnae>
<Discriminacao>${dados.servico.descricao}</Discriminacao>
<CodigoMunicipio>2211001</CodigoMunicipio>
<ExigibilidadeISS>${dados.servico.exigibilidadeIss || '1'}</ExigibilidadeISS>
<MunicipioIncidencia>2211001</MunicipioIncidencia>
</Servico>
<Prestador>
<CpfCnpj>
<Cnpj>${dados.prestador.cnpj}</Cnpj>
</CpfCnpj>
<InscricaoMunicipal>${dados.prestador.inscricaoMunicipal}</InscricaoMunicipal>
</Prestador>
<Tomador>
<IdentificacaoTomador>
<CpfCnpj>
${dados.tomador.tipoDoc === 'cpf' ? 
  `<Cpf>${dados.tomador.documento}</Cpf>` : 
  `<Cnpj>${dados.tomador.documento}</Cnpj>`
}
</CpfCnpj>
</IdentificacaoTomador>
<RazaoSocial>${dados.tomador.razaoSocial}</RazaoSocial>
<Endereco>
<Endereco>${dados.tomador.endereco?.logradouro || 'RUA TESTE'}</Endereco>
<Numero>${dados.tomador.endereco?.numero || '123'}</Numero>
<Bairro>${dados.tomador.endereco?.bairro || 'CENTRO'}</Bairro>
<CodigoMunicipio>2211001</CodigoMunicipio>
<Uf>PB</Uf>
<Cep>${dados.tomador.endereco?.cep || '58000000'}</Cep>
</Endereco>
</Tomador>
<OptanteSimplesNacional>${dados.prestador.simplesNacional || '2'}</OptanteSimplesNacional>
<IncentivoFiscal>${dados.prestador.incentivoCultural || '2'}</IncentivoFiscal>
</InfDeclaracaoPrestacaoServico>
</Rps>
</ListaRps>
</LoteRps>
</EnviarLoteRpsEnvio>
</RecepcionarLoteRps>`;
}

// Função de canonicalização
function canonicalizarXML(xmlString) {
    try {
        console.log('📐 Aplicando canonicalização C14N específica para João Pessoa...');
        
        let canonical = xmlString
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
        
        console.log('✅ Canonicalização específica para João Pessoa aplicada');
        return canonical;
        
    } catch (error) {
        console.error('❌ Erro na canonicalização:', error);
        return xmlString;
    }
}

// Testar assinatura exata como no workflow
async function testarWorkflowCompleto() {
  try {
    console.log('🎯 1. Gerando XML conforme workflow normal...');
    
    const valorServico = dadosFormulario.servico.valor;
    const valorIss = valorServico * dadosFormulario.servico.aliquota;
    const valorLiquido = valorServico - (dadosFormulario.servico.issRetido === '1' ? valorIss : 0);
    
    const numeroRps = 123;
    const serieRps = 'A1';
    
    const xml = construirXMLJoaoPessoa(dadosFormulario, valorServico, valorIss, valorLiquido, numeroRps, serieRps);
    
    console.log('📄 XML gerado:');
    console.log(xml);
    
    console.log('\n🔐 2. Aplicando assinatura conforme envio.js...');
    
    // Carregar certificado
    const certResponse = await fetch('./certificados/pixelvivo.pfx');
    const pfxBuffer = await certResponse.arrayBuffer();
    const pfxBytes = new Uint8Array(pfxBuffer);
    const senha = 'pixel2025';
    
    console.log('📄 Carregando certificado...');
    const p12Asn1 = forge.asn1.fromDer(forge.util.binary.raw.encode(pfxBytes));
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, senha);
    
    const bags = p12.getBags({bagType: forge.pki.oids.certBag});
    const certBag = bags[forge.pki.oids.certBag][0];
    const certificate = certBag.cert;
    
    const keyBags = p12.getBags({bagType: forge.pki.oids.pkcs8ShroudedKeyBag});
    const keyBag = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag][0];
    const privateKey = keyBag.key;
    
    console.log('✅ Certificado carregado');
    
    // Assinatura conforme função assinarApenasLoteRpsJoaoPessoa
    const loteRpsMatch = xml.match(/<LoteRps[^>]*>([\s\S]*?)<\/LoteRps>/);
    if (!loteRpsMatch) {
      throw new Error('LoteRps não encontrado no XML');
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
    
    // Inserir assinatura APÓS LoteRps mas DENTRO de EnviarLoteRpsEnvio (conforme modelo oficial)
    const xmlAssinado = xml.replace('</LoteRps>', '</LoteRps>\n' + xmlSignature);
    
    console.log('✅ XML assinado conforme modelo oficial João Pessoa');
    console.log('📊 Tamanho final:', xmlAssinado.length, 'caracteres');
    
    console.log('\n📤 3. Enviando para webservice...');
    
    // Criar SOAP envelope
    const soapEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns1="http://nfse.joaopessoa.pb.gov.br/">
  <soap:Header/>
  <soap:Body>
    <ns1:RecepcionarLoteRpsRequest>
      <nfseCabecMsg><![CDATA[<?xml version="1.0" encoding="UTF-8"?><cabecalho xmlns="http://nfse.joaopessoa.pb.gov.br/" versao="2.03"><versaoDados>2.03</versaoDados></cabecalho>]]></nfseCabecMsg>
      <nfseDadosMsg><![CDATA[${xmlAssinado}]]></nfseDadosMsg>
    </ns1:RecepcionarLoteRpsRequest>
  </soap:Body>
</soap:Envelope>`;

    // Enviar para o webservice
    const wsResponse = await fetch('https://nfse.joaopessoa.pb.gov.br/wssimnfse/nfseservice.svc', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': ''
      },
      body: soapEnvelope
    });
    
    const responseText = await wsResponse.text();
    console.log('📨 Resposta do webservice:');
    console.log(responseText);
    
    if (responseText.includes('erro na assinatura')) {
      console.error('❌ AINDA HÁ ERRO NA ASSINATURA!');
      console.log('🔍 Vamos analisar o XML canonicalizado...');
      console.log('XML LoteRps canonicalizado:', xmlCanonicalizado);
      console.log('SignedInfo canonicalizado:', signedInfoCanonicalizado);
    } else {
      console.log('✅ SUCESSO! Sem erro de assinatura!');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Executar teste
testarWorkflowCompleto();
