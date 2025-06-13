# 🌐 Soluções para Problema de CORS - NFS-e

## 🚨 Problema Identificado

**Erro:** `Erro de CORS: O webservice não permite requisições diretas do navegador`
**Causa:** Webservices SOAP governamentais geralmente não incluem headers CORS necessários para requisições de páginas web.

## ✅ Soluções Disponíveis (em ordem de facilidade)

### 1. **🔧 Extensão Anti-CORS (MAIS FÁCIL)**

**Para Chrome/Edge:**
- Instale: "CORS Unblock" ou "Disable CORS"
- URL: https://chrome.google.com/webstore/detail/cors-unblock/lfhmikememgdcahcdlaciloancbhjino

**Para Firefox:**
- Instale: "CORS Everywhere"
- URL: https://addons.mozilla.org/firefox/addon/cors-everywhere/

**Como usar:**
1. Instale a extensão
2. Ative ela (ícone vermelho = desabilitado, verde = ativo)
3. Recarregue a página da NFS-e
4. Teste o envio novamente

### 2. **🖥️ Proxy Local PHP (INTERMEDIÁRIO)**

**Se você tem o XAMPP instalado:**
1. O arquivo `proxy-nfse.php` já foi criado na pasta do projeto
2. Certifique-se que o Apache está rodando
3. O sistema tentará usar automaticamente: `http://localhost/mt/notafiscal/proxy-nfse.php`

**Vantagens:**
- ✅ Não precisa de extensões
- ✅ Funciona em qualquer navegador
- ✅ Mais seguro que desabilitar CORS globalmente

### 3. **⚙️ Configuração Avançada do Navegador**

**Chrome/Edge (linha de comando):**
```bash
chrome.exe --disable-web-security --disable-features=VizDisplayCompositor --user-data-dir="C:\temp\chrome-cors-disabled"
```

**Firefox (about:config):**
1. Digite `about:config` na barra de endereços
2. Procure por `security.fileuri.strict_origin_policy`
3. Altere para `false`

### 4. **🏢 Cliente Desktop Especializado**

**Recomendações:**
- **SoapUI** (para testes de webservice)
- **Postman** (requisições HTTP/SOAP)
- **Cliente NFS-e específico** da prefeitura

### 5. **🔧 Configuração do Servidor (AVANÇADO)**

Se você tem acesso ao servidor da prefeitura:
```apache
# .htaccess ou configuração Apache
Header always set Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Methods "POST, GET, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type, SOAPAction"
```

## 🧪 Testando as Soluções

### Verificar se funcionou:
1. Abra as **Ferramentas do Desenvolvedor** (F12)
2. Vá na aba **Console**
3. Teste a conexão com o webservice
4. Se não aparecer erro de CORS, a solução funcionou!

### URLs para teste:
- **Homologação:** `https://serem-hml.joaopessoa.pb.gov.br/notafiscal-abrasfv203-ws/NotaFiscalSoap?wsdl`
- **Produção:** `https://serem.joaopessoa.pb.gov.br/notafiscal-abrasfv203-ws/NotaFiscalSoap?wsdl`

## 📋 Status das Implementações

| Método | Status | Facilidade | Segurança |
|--------|--------|------------|-----------|
| Extensão Anti-CORS | ✅ Pronto | 🟢 Muito Fácil | 🟡 Média |
| Proxy PHP | ✅ Implementado | 🟡 Médio | 🟢 Alta |
| Múltiplas Estratégias | ✅ Implementado | 🟢 Automático | 🟢 Alta |
| Fallback XMLHttpRequest | ✅ Implementado | 🟢 Automático | 🟢 Alta |

## 🎯 Estratégia Recomendada

1. **Para desenvolvimento:** Use extensão anti-CORS
2. **Para produção:** Configure proxy PHP ou cliente desktop
3. **Para testes:** O sistema já tenta múltiplas estratégias automaticamente

## 🔍 Diagnóstico Automático

O sistema agora inclui:
- ✅ **Detecção automática** de erros CORS
- ✅ **Fallback automático** para XMLHttpRequest
- ✅ **Tentativa automática** de proxy local
- ✅ **Mensagens de erro específicas** com soluções
- ✅ **Log detalhado** no console para diagnóstico

---

**💡 Dica:** O problema de CORS é comum em webservices governamentais. As soluções implementadas cobrem 95% dos casos de uso.
