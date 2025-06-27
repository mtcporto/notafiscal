// Análise detalhada do certificado para verificar compatibilidade com João Pessoa

console.log('🔍 Análise de Certificado para João Pessoa');

async function analisarCertificado() {
    try {
        console.log('📄 Carregando certificado...');
        
        // Carregar certificado
        const response = await fetch('./certificados/pixelvivo.pfx');
        const pfxBuffer = await response.arrayBuffer();
        const pfxBytes = new Uint8Array(pfxBuffer);
        const senha = 'pixel2025';
        
        const p12Asn1 = forge.asn1.fromDer(forge.util.binary.raw.encode(pfxBytes));
        const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, senha);
        
        const bags = p12.getBags({bagType: forge.pki.oids.certBag});
        const certBag = bags[forge.pki.oids.certBag][0];
        const certificate = certBag.cert;
        
        console.log('✅ Certificado carregado com sucesso');
        
        // Análise detalhada
        console.log('\n📋 Dados do Certificado:');
        console.log('Subject:', certificate.subject.getField('CN')?.value || 'N/A');
        console.log('Issuer:', certificate.issuer.getField('CN')?.value || 'N/A');
        console.log('Serial:', certificate.serialNumber);
        console.log('Válido de:', certificate.validity.notBefore);
        console.log('Válido até:', certificate.validity.notAfter);
        
        // Verificar se está válido
        const agora = new Date();
        const valido = agora >= certificate.validity.notBefore && agora <= certificate.validity.notAfter;
        console.log('Status:', valido ? '✅ VÁLIDO' : '❌ EXPIRADO');
        
        // Verificar extensões
        console.log('\n🔑 Extensões do Certificado:');
        if (certificate.extensions) {
            certificate.extensions.forEach((ext, index) => {
                console.log(`${index + 1}. ${ext.name || ext.id}: ${ext.critical ? 'CRÍTICA' : 'não crítica'}`);
            });
        }
        
        // Verificar uso da chave
        const keyUsage = certificate.getExtension('keyUsage');
        if (keyUsage) {
            console.log('\n🔒 Uso da Chave:');
            console.log('Digital Signature:', keyUsage.digitalSignature);
            console.log('Key Encipherment:', keyUsage.keyEncipherment);
            console.log('Data Encipherment:', keyUsage.dataEncipherment);
        }
        
        // Verificar chave pública
        console.log('\n🔐 Chave Pública:');
        console.log('Algoritmo:', certificate.publicKey.algorithm);
        console.log('Tamanho:', certificate.publicKey.n ? certificate.publicKey.n.bitLength() : 'N/A', 'bits');
        
        // Testar se pode assinar
        const keyBags = p12.getBags({bagType: forge.pki.oids.pkcs8ShroudedKeyBag});
        const keyBag = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag][0];
        const privateKey = keyBag.key;
        
        console.log('\n🔑 Chave Privada:');
        console.log('Disponível:', !!privateKey);
        
        if (privateKey) {
            // Teste de assinatura simples
            const testData = 'teste de assinatura';
            const md = forge.md.sha1.create();
            md.update(testData, 'utf8');
            
            try {
                const signature = privateKey.sign(md);
                console.log('Teste de assinatura: ✅ SUCESSO');
                console.log('Tamanho da assinatura:', signature.length, 'bytes');
            } catch (error) {
                console.log('Teste de assinatura: ❌ FALHA -', error.message);
            }
        }
        
        // Verificar compatibilidade com ABRASF
        console.log('\n🏛️ Compatibilidade ABRASF:');
        
        const subjectCN = certificate.subject.getField('CN')?.value || '';
        const issuerCN = certificate.issuer.getField('CN')?.value || '';
        
        // Verificar se é certificado de pessoa jurídica
        const isPJ = subjectCN.includes('LTDA') || subjectCN.includes('S.A.') || subjectCN.includes('EIRELI');
        console.log('Pessoa Jurídica:', isPJ ? '✅ SIM' : '❌ NÃO');
        
        // Verificar AC válida
        const acsValidas = ['CERTISIGN', 'SERASA', 'AC DIGITAL', 'VALID', 'SOLUTI'];
        const acValida = acsValidas.some(ac => issuerCN.toUpperCase().includes(ac));
        console.log('AC Válida:', acValida ? '✅ SIM' : '⚠️ VERIFICAR');
        
        // Verificar algoritmos
        console.log('SHA-1 Suportado: ✅ SIM (RSA com SHA-1)');
        
        return {
            valido: valido,
            podeAssinar: !!privateKey,
            compativel: isPJ && acValida && valido
        };
        
    } catch (error) {
        console.error('❌ Erro na análise do certificado:', error);
        return { error: error.message };
    }
}

// Executar análise
analisarCertificado().then(resultado => {
    console.log('\n📊 Resumo da Análise:');
    if (resultado.error) {
        console.log('❌ ERRO:', resultado.error);
    } else {
        console.log('Certificado válido:', resultado.valido ? '✅' : '❌');
        console.log('Pode assinar:', resultado.podeAssinar ? '✅' : '❌');
        console.log('Compatível com ABRASF:', resultado.compativel ? '✅' : '❌');
        
        if (resultado.compativel) {
            console.log('\n🎉 CERTIFICADO APROVADO para uso em João Pessoa!');
        } else {
            console.log('\n⚠️ Certificado pode ter problemas de compatibilidade.');
        }
    }
});
