# 🚀 Como Executar o Sistema NFS-e João Pessoa

## ⚠️ IMPORTANTE: Configuração do Servidor Web

**O sistema NÃO funcionará se executado diretamente abrindo o arquivo `index.html` no navegador (protocolo `file://`).**

### ✅ Método Correto - XAMPP/Apache

1. **Confirme que o XAMPP está rodando:**
   - Abra o XAMPP Control Panel
   - Inicie o serviço **Apache**
   - Verifique se o status está "Running" (verde)

2. **Acesse via HTTP:**
   ```
   http://localhost/mt/notafiscal/
   ```
   OU
   ```
   http://127.0.0.1/mt/notafiscal/
   ```

3. **Verificação de Funcionamento:**
   - A página deve carregar sem erros no console
   - O botão "Teste Modelo Oficial" deve funcionar
   - Não deve aparecer erros de CORS no console

### ❌ Método Incorreto - File Protocol

**NÃO faça isso:**
- Abrir o arquivo diretamente: `file:///d:/xampp/htdocs/mt/notafiscal/index.html`
- Clicar duas vezes no `index.html`

Isso causará erros de CORS:
```
Access to fetch at 'file:///d:/xampp/htdocs/mt/notafiscal/certificados/pixelvivo.pfx' 
from origin 'null' has been blocked by CORS policy
```

## 🔧 Configuração dos Certificados

1. **Certificados disponíveis na pasta `/certificados/`:**
   - `pixelvivo.pfx` (senha: `pixel2025`) - Certificado principal
   - `Alan Mathison Turing.pfx` - Certificado de teste
   - `Ferdinand Georg Frobenius.pfx` - Certificado de teste
   - `Pierre de Fermat.pfx` - Certificado de teste
   - `Wayne Enterprises, Inc..pfx` - Certificado de teste

2. **Configuração no sistema:**
   - O sistema tentará usar `pixelvivo.pfx` por padrão
   - Se não conseguir carregar (CORS), usará certificado fallback
   - Para usar outro certificado, modifique o código em `sistema-joaopessoa-simplificado.js`

## 🧪 Testes Disponíveis

### 1. Teste Modelo Oficial
- Botão: "Teste Modelo Oficial"
- Função: Valida XML conforme documentação ABRASF
- Resultado esperado: XML gerado, assinado e validado

### 2. Sistema Simplificado
- Botão: "Enviar NFS-e"
- Função: Fluxo completo de geração e envio
- Resultado esperado: XML enviado para webservice João Pessoa

### 3. Sistema Final Idêntico
- Botão: "Sistema Final Idêntico"
- Função: Replica exatamente o modelo oficial
- Resultado esperado: Estrutura XML idêntica ao modelo

## 📝 Estrutura XML Gerada

O sistema gera XMLs com as seguintes características:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:tem="http://tempuri.org/">
  <soap:Header/>
  <soap:Body>
    <tem:RecepcionarLoteRps>
      <tem:inputXML>
        <![CDATA[
          <EnviarLoteRpsEnvio xmlns="http://www.abrasf.org.br/nfse.xsd" versao="2.03">
            <LoteRps Id="lote123" versao="2.03">
              <NumeroLote>123</NumeroLote>
              <CpfCnpj>
                <Cnpj>11222333000181</Cnpj>
              </CpfCnpj>
              <InscricaoMunicipal>123456</InscricaoMunicipal>
              <QuantidadeRps>1</QuantidadeRps>
              <ListaRps>
                <Rps versao="2.03" Id="">
                  <!-- Dados do RPS -->
                </Rps>
              </ListaRps>
            </LoteRps>
          </EnviarLoteRpsEnvio>
        ]]>
      </tem:inputXML>
    </tem:RecepcionarLoteRps>
  </soap:Body>
</soap:Envelope>
```

## 🐛 Resolução de Problemas

### Erro: "Failed to fetch"
- **Causa:** Sistema executado via `file://`
- **Solução:** Use `http://localhost/`

### Erro: "CORS blocked"
- **Causa:** Navegador bloqueando acesso a arquivos locais
- **Solução:** Use servidor web (XAMPP/Apache)

### Erro: "Erro na assinatura"
- **Causa:** XML mal formado ou assinatura incorreta
- **Solução:** Verifique estrutura XML e certificado

### XAMPP não inicia
- **Causa:** Porta 80 ocupada ou permissões
- **Solução:** 
  1. Feche Skype/IIS
  2. Execute XAMPP como administrador
  3. Use porta alternativa (8080)

## 📞 Webservice João Pessoa

- **URL:** `https://nfse.joaopessoa.pb.gov.br/WSNacional/nfse_sjp.asmx`
- **Método:** `RecepcionarLoteRps`
- **Protocolo:** SOAP 1.2
- **Versão ABRASF:** 2.03

## ✅ Checklist de Funcionamento

- [ ] XAMPP rodando
- [ ] Acesso via `http://localhost/`
- [ ] Console sem erros de CORS
- [ ] Certificados na pasta `/certificados/`
- [ ] Teste modelo oficial funcionando
- [ ] Sistema simplificado gerando XML
- [ ] Envio para webservice sem "erro na assinatura"
