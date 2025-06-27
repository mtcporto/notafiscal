// Análise comparativa NFe vs NFS-e para João Pessoa
console.log('🔍 ANÁLISE COMPARATIVA: NFE (FUNCIONANDO) vs NFS-E (COM ERRO)');
console.log('===============================================================');

// XML NFe que está funcionando em João Pessoa
const nfeJoaoPessoaFuncionando = `<?xml version="1.0" encoding="UTF-8"?><nfeProc versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe"><NFe xmlns="http://www.portalfiscal.inf.br/nfe"><infNFe versao="4.00" Id="NFe25250604933861000183550010000243131388107570"><!-- dados da NFe --></infNFe><Signature xmlns="http://www.w3.org/2000/09/xmldsig#"><SignedInfo><CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/><SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1"/><Reference URI="#NFe25250604933861000183550010000243131388107570"><Transforms><Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/><Transform Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/></Transforms><DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"/><DigestValue>G/bIYYxWqC+h3b8l8kktcvtcANw=</DigestValue></Reference></SignedInfo><SignatureValue>Spfyr0WP4G2fMFs4tJvzH3znmcMCgrB402DVqdc48gtTp8X19M+vVd3Q8t3Zb94J/rn9yMr8PXbYCKsbYZq9WM1En0y5yUIULnvMcM/m492zhrix8fEqa2Y+7V8ir7VwpdRmLdUC0a9GI56S7zJplCVZumnpEFifgEPg7kgWAXVNfXuoS4+IeCvrNuo1ULoXY0GrFD6qA80dyx7rpXapzFRVhr6VUe4s/uNj++JNPTC4pKCx7NaUDw8XF8RdfZgmR+muY0bz1+lxoruKMZvGdZg3yjueg5TNDRZgDrBEEmMgfJQS/nhp9+oohjpFdRsds12S170beZtElfqdIHCnvA==</SignatureValue><KeyInfo><X509Data><X509Certificate>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</X509Certificate></X509Data></KeyInfo></Signature></NFe><protNFe versao="4.00"><infProt><tpAmb>1</tpAmb><verAplic>SVRS2506161036DR</verAplic><chNFe>25250604933861000183550010000243131388107570</chNFe><dhRecbto>2025-06-27T10:34:05-03:00</dhRecbto><nProt>225250037993423</nProt><digVal>G/bIYYxWqC+h3b8l8kktcvtcANw=</digVal><cStat>100</cStat><xMotivo>Autorizado o uso da NF-e</xMotivo></infProt></protNFe></nfeProc>`;

async function analisarComparativoNFeVsNFSe() {
    try {
        console.log('\n🔍 ANÁLISE DA NFe QUE FUNCIONA:');
        console.log('==============================');
        
        // 1. Extrair e analisar a assinatura da NFe
        const signatureMatch = nfeJoaoPessoaFuncionando.match(/<Signature.*?<\/Signature>/s);
        if (signatureMatch) {
            const nfeSignature = signatureMatch[0];
            console.log('📄 Assinatura NFe encontrada (tamanho:', nfeSignature.length, 'chars)');
            
            // Analisar estrutura da assinatura NFe
            console.log('\n🔍 ESTRUTURA DA ASSINATURA NFe (FUNCIONANDO):');
            
            // Verificar SignedInfo
            const signedInfoMatch = nfeSignature.match(/<SignedInfo>(.*?)<\/SignedInfo>/s);
            if (signedInfoMatch) {
                const signedInfo = signedInfoMatch[1];
                console.log('📐 SignedInfo estrutura:');
                console.log('   • Tem quebras de linha:', signedInfo.includes('\n') ? 'SIM' : 'NÃO');
                console.log('   • Tem \\r\\n:', signedInfo.includes('\r\n') ? 'SIM' : 'NÃO');
                console.log('   • Tamanho:', signedInfo.length, 'chars');
                
                // Mostrar SignedInfo formatado
                console.log('📄 SignedInfo da NFe:');
                console.log(signedInfo.substring(0, 300) + '...');
            }
            
            // Verificar Reference URI
            const uriMatch = nfeSignature.match(/URI="([^"]+)"/);
            const uri = uriMatch ? uriMatch[1] : 'não encontrado';
            console.log('📍 URI da assinatura:', uri);
            
            // Verificar algoritmos
            const temSHA1 = nfeSignature.includes('rsa-sha1');
            const temC14N = nfeSignature.includes('xml-c14n-20010315');
            console.log('🔐 Algoritmo SHA-1:', temSHA1 ? 'SIM' : 'NÃO');
            console.log('📐 Canonicalização C14N:', temC14N ? 'SIM' : 'NÃO');
            
            // Verificar certificado
            const temX509 = nfeSignature.includes('<X509Certificate>');
            console.log('📜 Certificado X509:', temX509 ? 'SIM' : 'NÃO');
            
            // 2. Comparar com nossa NFS-e
            console.log('\n⚖️ COMPARAÇÃO COM NOSSA NFS-E:');
            console.log('==============================');
            
            if (typeof gerarXMLNFSeABRASF === 'function' && typeof assinarXMLCompleto === 'function') {
                // Gerar nossa NFS-e para comparação
                const xmlNFSe = gerarXMLNFSeABRASF();
                const xmlNFSeAssinado = await assinarXMLCompleto(xmlNFSe);
                
                // Extrair nossa assinatura
                const nossaAssinatura = xmlNFSeAssinado.match(/<Signature.*?<\/Signature>/s);
                if (nossaAssinatura) {
                    const nossaSignature = nossaAssinatura[0];
                    console.log('📄 Nossa assinatura encontrada (tamanho:', nossaSignature.length, 'chars)');
                    
                    // Comparar estruturas
                    console.log('\n🔍 COMPARAÇÃO DETALHADA:');
                    
                    // SignedInfo
                    const nossaSignedInfo = nossaSignature.match(/<SignedInfo.*?<\/SignedInfo>/s);
                    if (nossaSignedInfo) {
                        const nossoSignedInfoContent = nossaSignedInfo[0];
                        console.log('📐 Nossa SignedInfo:');
                        console.log('   • Tem quebras de linha:', nossoSignedInfoContent.includes('\n') ? 'SIM' : 'NÃO');
                        console.log('   • Tem \\r\\n:', nossoSignedInfoContent.includes('\r\n') ? 'SIM' : 'NÃO');
                        console.log('   • Tamanho:', nossoSignedInfoContent.length, 'chars');
                        
                        console.log('\n📄 Nossa SignedInfo (primeiros 300 chars):');
                        console.log(nossoSignedInfoContent.substring(0, 300) + '...');
                        
                        // DIFERENÇAS CRÍTICAS
                        console.log('\n🚨 DIFERENÇAS CRÍTICAS IDENTIFICADAS:');
                        
                        const nfeTemQuebras = signedInfoMatch[1].includes('\n');
                        const nfseTamQuebras = nossoSignedInfoContent.includes('\n');
                        
                        if (nfeTemQuebras !== nfseTamQuebras) {
                            console.log('❗ DIFERENÇA: NFe tem quebras de linha, nossa NFS-e não (ou vice-versa)');
                            console.log('   NFe quebras:', nfeTemQuebras ? 'SIM' : 'NÃO');
                            console.log('   NFS-e quebras:', nfseTamQuebras ? 'SIM' : 'NÃO');
                            console.log('🔧 CORREÇÃO: Ajustar formato do SignedInfo para coincidir');
                        }
                        
                        // Comparar posicionamento
                        console.log('\n📍 POSICIONAMENTO DAS ASSINATURAS:');
                        console.log('NFe: Assinatura como irmã do elemento principal (após </infNFe>)');
                        
                        const temRpsAssinado = xmlNFSeAssinado.includes('</InfRps><Signature');
                        const temLoteAssinado = xmlNFSeAssinado.includes('</LoteRps><Signature');
                        console.log('NFS-e RPS: Assinatura dentro do RPS -', temRpsAssinado ? 'SIM' : 'NÃO');
                        console.log('NFS-e Lote: Assinatura como irmã do LoteRps -', temLoteAssinado ? 'SIM' : 'NÃO');
                        
                        // Comparar certificados
                        console.log('\n🏛️ CERTIFICADOS:');
                        
                        // Extrair subject da NFe
                        const nfeCertMatch = nfeJoaoPessoaFuncionando.match(/<X509Certificate>(.*?)<\/X509Certificate>/);
                        if (nfeCertMatch) {
                            // Decodificar certificado da NFe (simulação)
                            console.log('📜 NFe: Certificado ICP-Brasil (AC CNDL RFB)');
                            console.log('📜 NFe: POSTO DE COMBUSTIVEIS FREI DAMIAO LTDA');
                            console.log('📜 NFe: CNPJ 04.933.861/0001-83');
                        }
                        
                        console.log('📜 NFS-e: PIXEL VIVO SOLUCOES WEB LTDA');
                        console.log('📜 NFS-e: CNPJ 15.198.135/0001-80');
                        
                        // 3. HIPÓTESES E CORREÇÕES
                        console.log('\n🎯 HIPÓTESES PARA O ERRO DE ASSINATURA:');
                        console.log('=====================================');
                        
                        console.log('1️⃣ FORMATO DO SignedInfo:');
                        if (nfeTemQuebras && !nfseTamQuebras) {
                            console.log('   ✅ PROVÁVEL CAUSA: NFe usa SignedInfo com quebras de linha');
                            console.log('   🔧 CORREÇÃO: Adicionar quebras de linha no SignedInfo da NFS-e');
                        } else if (!nfeTemQuebras && nfseTamQuebras) {
                            console.log('   ✅ PROVÁVEL CAUSA: NFe usa SignedInfo compacto');
                            console.log('   🔧 CORREÇÃO: Remover quebras de linha do SignedInfo da NFS-e');
                        } else {
                            console.log('   ⚠️ Formato similar - não é a causa');
                        }
                        
                        console.log('\n2️⃣ AUTORIDADE CERTIFICADORA:');
                        console.log('   NFe: AC CNDL RFB (Certisign)');
                        console.log('   NFS-e: [verificar nossa AC]');
                        console.log('   🔧 Possível: João Pessoa aceita apenas certas ACs para NFS-e');
                        
                        console.log('\n3️⃣ POSICIONAMENTO:');
                        console.log('   NFe: 1 assinatura como irmã do elemento principal');
                        console.log('   NFS-e: 2 assinaturas (RPS + Lote) com posicionamentos diferentes');
                        console.log('   🔧 Possível: Problema específico da dupla assinatura ABRASF');
                        
                        console.log('\n4️⃣ NAMESPACE:');
                        console.log('   NFe: xmlns="http://www.portalfiscal.inf.br/nfe"');
                        console.log('   NFS-e: xmlns="http://www.abrasf.org.br/nfse.xsd"');
                        console.log('   🔧 Possível: Validação específica de namespace');
                        
                        console.log('\n🔧 PRÓXIMAS CORREÇÕES A TESTAR:');
                        console.log('1. Ajustar formato do SignedInfo para coincidir com NFe');
                        console.log('2. Testar com certificado da mesma AC (Certisign)');
                        console.log('3. Simplificar para assinatura única (apenas Lote)');
                        console.log('4. Verificar encoding e charset');
                        
                    }
                }
            } else {
                console.log('❌ Funções de NFS-e não disponíveis para comparação');
            }
        } else {
            console.log('❌ Assinatura não encontrada na NFe');
        }
        
        console.log('\n🏁 Análise comparativa concluída');
        
    } catch (erro) {
        console.error('❌ Erro na análise comparativa:', erro);
    }
}

// Executar análise
setTimeout(analisarComparativoNFeVsNFSe, 1000);
