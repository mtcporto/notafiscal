# 📋 Como Interpretar a Resposta do Webservice NFS-e

## 🎯 **Tipos de Resposta Esperados**

### ✅ **SUCESSO - Nota Aceita**
```xml
<soap:Envelope>
  <soap:Body>
    <RecepcionarLoteRpsResponse>
      <Protocolo>2025061312345678</Protocolo>
      <DataRecebimento>2025-06-13T17:48:43</DataRecebimento>
    </RecepcionarLoteRpsResponse>
  </soap:Body>
</soap:Envelope>
```

**🔍 Procure por:**
- `<Protocolo>` - Número do protocolo para consulta
- `<DataRecebimento>` - Data/hora do processamento
- Ausência de tags `<Erro>` ou `<Fault>`

---

### ❌ **ERRO - Problema no XML**
```xml
<soap:Envelope>
  <soap:Body>
    <soap:Fault>
      <faultcode>Client</faultcode>
      <faultstring>XML mal formado</faultstring>
    </soap:Fault>
  </soap:Body>
</soap:Envelope>
```

**🔍 Procure por:**
- `<soap:Fault>` - Erro geral
- `<faultstring>` - Descrição do erro
- `<faultcode>` - Tipo de erro

---

### ⚠️ **ERRO - Validação ABRASF**
```xml
<soap:Envelope>
  <soap:Body>
    <RecepcionarLoteRpsResponse>
      <ListaMensagemRetorno>
        <MensagemRetorno>
          <Codigo>E001</Codigo>
          <Mensagem>CNPJ do prestador inválido</Mensagem>
          <Correcao>Verificar CNPJ na inscrição municipal</Correcao>
        </MensagemRetorno>
      </ListaMensagemRetorno>
    </RecepcionarLoteRpsResponse>
  </soap:Body>
</soap:Envelope>
```

**🔍 Procure por:**
- `<ListaMensagemRetorno>` - Lista de erros
- `<Codigo>` - Código do erro (E001, E002, etc.)
- `<Mensagem>` - Descrição do problema
- `<Correcao>` - Como corrigir

---

## 📊 **Códigos de Erro Comuns**

| Código | Descrição | Solução |
|--------|-----------|---------|
| E001 | CNPJ inválido | Verificar CNPJ na configuração |
| E002 | Inscrição Municipal inválida | Verificar IM na configuração |
| E003 | RPS já processado | Alterar número do RPS |
| E004 | Certificado inválido | Renovar/configurar certificado |
| E005 | XML mal formado | Verificar estrutura do XML |
| E006 | Assinatura digital inválida | Reassinar o XML |
| E007 | Prestador não habilitado | Contatar prefeitura |

---

## 🔧 **Próximos Passos Após Sucesso**

### 1. **Se obteve PROTOCOLO:**
```javascript
// Use para consultar o status
const protocolo = "2025061312345678";
```

### 2. **Consultar Status (após processamento):**
```xml
<ConsultarSituacaoLoteRpsEnvio>
  <Prestador>
    <Cnpj>12345678000195</Cnpj>
    <InscricaoMunicipal>123456</InscricaoMunicipal>
  </Prestador>
  <Protocolo>2025061312345678</Protocolo>
</ConsultarSituacaoLoteRpsEnvio>
```

### 3. **Resposta da Consulta (Processado):**
```xml
<ConsultarSituacaoLoteRpsResposta>
  <Situacao>4</Situacao> <!-- 1=Não Recebido, 2=Não Processado, 3=Processado com Erro, 4=Processado com Sucesso -->
  <ListaNfse>
    <CompNfse>
      <Nfse>
        <InfNfse>
          <Numero>123456</Numero>
          <CodigoVerificacao>ABC123DEF</CodigoVerificacao>
          <DataEmissao>2025-06-13</DataEmissao>
        </InfNfse>
      </Nfse>
    </CompNfse>
  </ListaNfse>
</ConsultarSituacaoLoteRpsResposta>
```

---

## 🎯 **Interpretação das Situações**

| Situação | Significado | Próxima Ação |
|----------|-------------|---------------|
| 1 | Não Recebido | Reenviar o RPS |
| 2 | Não Processado | Aguardar processamento |
| 3 | Processado com Erro | Verificar erros e corrigir |
| 4 | Processado com Sucesso | NFS-e gerada! 🎉 |

---

## 💡 **Dicas Importantes**

1. **📋 Protocolo é fundamental** - Sem ele, não há como consultar
2. **⏱️ Processamento leva tempo** - Pode demorar alguns minutos
3. **🔍 Sempre consulte o status** - A nota só é válida após situação = 4
4. **💾 Guarde o número da NFS-e** - Necessário para DANFSE e cancelamento
5. **🔐 Código de verificação** - Usado para validar a nota

---

**📞 Em caso de dúvidas específicas sobre códigos de erro, consulte a documentação da prefeitura ou o suporte técnico.**
