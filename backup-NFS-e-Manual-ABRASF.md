# BACKUP - NFS-e Nota Fiscal de Serviços Eletrônica ABRASF

**Data do Backup:** 26/06/2025 - 19:35

**Status do Sistema:** ✅ Sistema funcionando, enviando para webservice, erro apenas na assinatura digital

**Progresso:**
- ✅ Comunicação com webservice João Pessoa estabelecida
- ✅ Proxy Cloudflare Worker funcionando
- ✅ XML sendo gerado conforme ABRASF v2.03
- ✅ Envelope SOAP correto
- ✅ Certificado digital válido e reconhecido
- ⚠️ Erro na assinatura retornado pelo webservice: "Arquivo enviado com erro na assinatura. / Acerte a assinatura do arquivo."

---

A seguir está a transcrição do conteúdo do documento "NFS-e\_Manual\_de\_Integracao\_versao\_2.03\_alteracoes.pdf".

---

### **NFS-e Nota Fiscal de Serviços Eletrônica ABRASF**

**Manual de Integração**

**ABRASF \- Associação Brasileira das Secretarias de Finanças das Capitais**

Versão 2.03

Fevereiro/2016

---

### **SUMÁRIO**

| Seção | Título | Página |
| :---- | :---- | :---- |
| 1 | INTRODUÇÃO | 4 |
| 2 | CONSIDERAÇÕES INICIAIS | 5 |
| 2.1 | NOTA FISCAL DE SERVIÇOS ELETRÔNICA \- NFS-E | 5 |
| 2.2 | RECIBO PROVISÓRIO DE SERVIÇO \- RPS. | 5 |
| 3 | ARQUITETURA DE COMUNICAÇÃO COM O CONTRIBUINTE | 7 |
| 3.1 | MODELO CONCEITUAL | 7 |
| 3.1.1 | RECEPÇÃO E PROCESSAMENTO DE LOTE DE RPS. | 7 |
| 3.1.2 | ENVIAR LOTE DE RPS SÍNCRONO | 7 |
| 3.1.3 | GERAÇÃO DE NFS-E. | 8 |
| 3.1.4 | CANCELAMENTO DE NFS-E... | 9 |
| 3.1.5 | SUBSTITUIÇÃO DE NFS-E | 9 |
| 3.1.6 | CONSULTA DE LOTE DE RPS | 10 |
| 3.1.7 | CONSULTA DE NFS-E POR RPS. | 10 |
| 3.1.8 | CONSULTA DE NFS-E- SERVIÇOS PRESTADOS | 11 |
| 3.1.9 | CONSULTA DE NFS-E- SERVIÇOS TOMADOS OU INTERMEDIADOS | 12 |
| 3.1.10 | CONSULTA DE NFS-E POR FAIXA.. | 12 |
| 3.2 | PADRÕES TÉCNICOS.... | 13 |
| 3.2.1 | PADRÃO DE COMUNICAÇÃO | 13 |
| 3.2.2 | PADRÃO DE CERTIFICADO DIGITAL | 14 |
| 3.2.3 | PADRÃO DE ASSINATURA DIGITAL. | 15 |
| 3.2.4 | VALIDAÇÃO DE ASSINATURA DIGITAL PELO SISTEMA NFS-E | 16 |
| 3.2.5 | USO DE ASSINATURA COM CERTIFICADO DIGITAL | 17 |
| 3.3 | PADRÃO DAS MENSAGENS XML | 17 |
| 3.3.1 | ÁREA DO CABEÇALHO | 17 |
| 3.3.2 | VALIDAÇÃO DA ESTRUTURA DAS MENSAGENS XML. | 18 |
| 3.3.3 | SCHEMAS XML (ARQUIVOS XSD). | 18 |
| 3.3.4 | VERSÃO DOS SCHEMAS XML. | 19 |
| 4 | ESTRUTURA DE DADOS DO WEB SERVICE | 20 |
| 4.1 | MODELO OPERACIONAL | 20 |
| 4.1.1 | SERVIÇOS SÍNCRONOS.... | 20 |
| 4.1.2 | SERVIÇOS ASSÍNCRONOS | 21 |
| 4.2 | FORMATOS E PADRÕES UTILIZADOS. | 22 |
| 4.3 | TIPOS SIMPLES | 23 |
| 4.4 | TIPOS COMPLEXOS. | 26 |
| 4.5 | SERVIÇOS. | 35 |
| 4.5.1 | RECEPÇÃO DE LOTE DE RPS. | 36 |
| 4.5.2 | ENVIAR LOTE DE RPS SINCRONO | 36 |
| 4.5.3 | GERAÇÃO DE NFS-E... | 37 |
| 4.5.4 | CANCELAMENTO NFS-E | 37 |
| 4.5.5 | SUBSTITUIÇÃO NFS-E... | 38 |
| 4.5.6 | CONSULTA DE LOTE DE RPS | 39 |
| 4.5.7 | CONSULTA DE NFS-E POR RPS. | 39 |
| 4.5.8 | CONSULTA DE NFS-E-SERVIÇOS PRESTADOS | 40 |
| 4.5.9 | CONSULTA DE NFS-E- SERVIÇOS TOMADOS OU INTERMEDIADOS. | 40 |
| 4.5.10 | CONSULTA DE NFS-E POR FAIXA.. | 41 |

---

### **1 INTRODUÇÃO 1**

Este manual tem como objetivo apresentar as especificações e critérios técnicos necessários para utilização do Web Service disponibilizado pelas Administrações Tributárias Municipais para as empresas prestadoras e/ou tomadoras de serviços. 2 Utilizando o Web Service as empresas poderão integrar seus próprios sistemas de informações com o Sistema de Notas Fiscais de Serviço Eletrônicas das Administrações Tributárias Municipais. 3 Desta forma, consegue-se automatizar o processo de geração, consulta e cancelamento de NFS-e. 4

### **2 CONSIDERAÇÕES INICIAIS 5**

O projeto Nota Fiscal de Serviços Eletrônica está sendo concebido em reuniões das áreas de Negócio e Tecnologia da Informação com os representantes dos municípios integrantes da Câmara Técnica da Associação Brasileira de Secretários e Dirigentes das Finanças dos Municípios das Capitais (ABRASF), que tiveram como principal objetivo a geração de um modelo de processo que considerasse as necessidades e as legislações de cada município. 6 O projeto tem como objetivo atender ao "Protocolo de Cooperação ENAT nº 01/2006 III ENAT", que instituiu a Nota Fiscal de Serviços Eletrônica NFS-e com vistas ao compartilhamento de informações entre os fiscos municipais, estaduais e federal, por meio do desenvolvimento de uma solução para a geração desse documento fiscal eletrônico como instrumento de controle da arrecadação e fiscalização do ISS. 7 Visa a beneficiar as administrações tributárias padronizando e melhorando a qualidade das informações, racionalizando os custos e gerando maior eficácia, bem como aumentar a competitividade das empresas brasileiras pela racionalização das obrigações acessórias (redução do "custo-Brasil"), em especial a dispensa da emissão e guarda de documentos em papel. 8

#### **2.1 Nota Fiscal de Serviços Eletrônica \- NFS-e 9**

A Nota Fiscal de Serviços Eletrônica (NFS-e) é um documento de existência exclusivamente digital, gerado e armazenado eletronicamente pela Administração Tributária Municipal ou por outra entidade conveniada, para documentar as operações de prestação de serviços. 10 A geração da NFS-e será feita, automaticamente, por meio de serviços informatizados, disponibilizados aos contribuintes. 11 Para que sua geração seja efetuada, dados que a compõem serão informados, analisados, processados, validados e, se corretos, gerarão o documento. 12 A responsabilidade pelo cumprimento da obrigação acessória de emissão da NFS-e e pelo correto fornecimento dos dados à Administração Tributária Municipal, para a geração da mesma, é do contribuinte. 13

#### **2.2 Recibo Provisório de Serviço \- RPS 14**

A NFS-e somente será gerada com a utilização dos serviços informatizados disponibilizados pelas Administrações Tributárias Municipais. 15 Esse tipo de serviço pressupõe riscos inerentes à ininterrupta disponibilidade, podendo, eventualmente, em alguns momentos tornar-se indisponível. 16 Visando manter as atividades dos contribuintes ininterruptas, independente de os serviços informatizados disponibilizados pelas Administrações Tributárias Municipais estarem disponíveis, a administração poderá criar, segundo a sua conveniência, o Recibo Provisório de Serviços (RPS), que é um documento de posse e responsabilidade do contribuinte, que deverá ser gerado manually ou por alguma aplicação local, possuindo uma numeração sequencial crescente e devendo ser convertido em NFS-e no prazo estipulado pela legislação tributária municipal. 17 Por opção da Administração Tributária Municipal, um RPS poderá ser reenviado. 18 Nesse caso, será entendido como uma retificação do RPS anteriormente enviado. 19 Nessa situação, se o RPS reenviado for idêntico ao anterior, será ignorado. 20 Se for diferente do anterior, será emitida uma nova NFS-e substituta e cancelada a anterior. 21 Esta funcionalidade deverá ser implementada quando for prevista a circulação do RPS. 22

### **3 ARQUITETURA DE COMUNICAÇÃO COM O CONTRIBUINTE 23**

#### **3.1 Modelo Conceitual 24**

Utilizando Web Service, o Sistema de Notas Fiscais de Serviço Eletrônicas das Administrações Tributárias Municipais disponibilizará serviços que poderão ser acessados pelos sistemas dos contribuintes. 25 A seguir, estão resumidos os serviços disponíveis e suas respectivas funcionalidades básicas. 26

##### **3.1.1 Recepção e Processamento de Lote de RPS 27**

Esse serviço compreende a recepção do Lote de RPS, a resposta com o número do protocolo gerado para esta transação e o processamento do lote. 28 Quando efetuada a recepção, o Lote entrará na fila para processamento posterior quando serão feitas as validações necessárias e geração das NFS-e. 29

**Passos para execução:**

1. A aplicação acessa o serviço de "Recepção e Processamento de Lote de RPS" enviando o lote de RPS (fluxo "b"). 30  
2.   
3. A requisição é recebida pelo servidor do Web Service que grava as informações recebidas e gera o número de protocolo de recebimento (fluxo "c"). 31  
4.   
5. O Web Service retorna uma mensagem com o resultado do processamento do serviço (fluxo "d"). 32  
6. 

##### **3.1.2 Enviar Lote de RPS Síncrono 33**

Esse serviço compreende a recepção do Lote de RPS. 34 Quando efetuada a recepção, o Lote será processado e serão feitas as validações necessárias e geração das NFS-e. 35

**Passos para execução:**

1. A aplicação acessa o serviço de "Enviar Lote de RPS Síncrono" enviando o lote (fluxo "2.b"). 36  
2.   
3. A requisição é recebida pelo servidor do Web Service que grava as informações recebidas e processa o lote (fluxo "2.c"). 37  
4.   
5. O Web Service retorna uma mensagem (a estrutura com a lista da NFS-e geradas ou as mensagens de erro) com o resultado do processamento do serviço (fluxo "2.d"). 38  
6. 

##### **3.1.3 Geração de NFS-e 39**

Esse serviço compreende a recepção do RPS. 40 Quando efetuada a recepção, e serão feitas as validações necessárias do RPS e geração das NFS-e. 41

**Passos para execução:**

1. A aplicação acessa o serviço de "Geração de NFS-e" enviando o RPS (fluxo "2.b"). 42  
2.   
3. A requisição é recebida pelo servidor do Web Service que grava as informações recebidas e processa o RPS (fluxo "2.c"). 43  
4.   
5. O Web Service retorna uma mensagem (a estrutura com a lista da NFS-e geradas ou as mensagens de erro) com o resultado do processamento do serviço (fluxo "2.d"). 44  
6. 

##### **3.1.4 Cancelamento de NFS-e 45**

Esse serviço permite o cancelamento direto de uma NFS-e sem a sua substituição por outra. 46

**Passos para execução:**

1. A aplicação acessa o serviço de "Cancelamento de NFS-e" e submete os dados para processamento (fluxo "2.b"). 47  
2.   
3. A requisição é recebida pelo servidor do Web Service, que verifica os dados preenchidos, identifica a NFS-e correspondente e efetua o seu cancelamento (fluxo "2.c"). 48  
4.   
5. O Web Service retorna uma mensagem com o resultado do processamento do serviço (fluxo "2.d"). 49  
6. 

##### **3.1.5 Substituição de NFS-e 50**

Esse serviço permite o cancelamento de uma NFS-e com sua substituição por outra. 51

**Passos para execução:**

1. A aplicação acessa o serviço de "Substituição de NFS-e" e submete os dados para processamento (fluxo "2.b"). 52  
2.   
3. A requisição é recebida pelo servidor do Web Service, que verifica os dados fornecidos, identifica a NFS-e correspondente, processa o RPS, gera a nova NFS-e e efetua o cancelamento da NFS-e substituída (fluxo "2.c"). 53  
4.   
5. O Web Service retorna uma mensagem (a estrutura com NFS-e gerada e a substituída ou as mensagens de erro) como resultado do processamento do serviço (fluxo "2.d"). 54  
6. 

##### **3.1.6 Consulta de Lote de RPS 55**

Esse serviço permite que contribuinte obtenha as NFS-e que foram geradas a partir do Lote de RPS enviado, quando o processamento ocorrer sem problemas; 56 ou que obtenha a lista de erros e/ou inconsistências encontradas nos RPS. 57 Na validação do lote, devem ser retornados todos os erros verificados. 58 Excepcionalmente, havendo uma excessiva quantidade de erros, poderá ser definido um limitador para a quantidade de erros retornados. 59

**Passos para execução:**

1. A aplicação acessa o serviço de "Consulta de Lote de RPS" e submete os dados para processamento (fluxo "b"). 60  
2.   
3. A requisição é recebida pelo servidor do Web Service, que verifica os dados preenchidos e identifica as NFS-e correspondentes (fluxos "c" e "d"). 61  
4.   
5. O Web Service retorna uma mensagem (a estrutura com a lista da NFS-e geradas ou as mensagens de erro) com o resultado do processamento do serviço (fluxo "e"). 62  
6. 

##### **3.1.7 Consulta de NFS-e por RPS 63**

Esse serviço efetua a consulta de uma NFS-e a partir do número de RPS que a gerou. 64

**Passos para execução:**

1. A aplicação acessa o serviço de "Consulta de NFS-e por RPS" e submete os dados para processamento (fluxo "2.b"). 65  
2.   
3. A requisição é recebida pelo servidor do Web Service, que verifica os dados preenchidos e identifica a NFS-e correspondente (fluxos "2.c" e "2.d"). 66  
4.   
5. O Web Service retorna uma mensagem com o resultado do processamento do serviço (fluxo "2.e"). 67  
6. 

##### **3.1.8 Consulta de NFS-e \- Serviços Prestados**

Esse serviço permite a obtenção de determinada NFS-e já gerada.

**Passos para execução:**

1. A aplicação acessa o serviço de "Consulta de NFS-e" e submete os dados para processamento (fluxo "2.B"). 68  
2.   
3. A requisição é recebida pelo servidor do Web Service, que verifica os dados preenchidos e identifica as NFS-e correspondentes (fluxos "2.C" e "2.D"). 69  
4.   
5. O Web Service retorna uma mensagem com o resultado do processamento do serviço (fluxos "2.E"). 70  
6. 

##### **3.1.9 Consulta de NFS-e \- Serviços Tomados ou Intermediados 71**

Esse serviço permite a obtenção de determinada NFS-e já gerada. 72

**Passos para execução:**

1. A aplicação acessa o serviço de "Consulta de NFS-e" e submete os dados para processamento (fluxo "2.B"). 73  
2.   
3. A requisição é recebida pelo servidor do Web Service, que verifica os dados preenchidos e identifica as NFS-e correspondentes (fluxos "2.C" e "2.D).  
4. O Web Service retorna uma mensagem com o resultado do processamento do serviço (fluxos "2.E").

##### **3.1.10 Consulta de NFS-e por faixa**

Esse serviço permite a obtenção de determinada NFS-e já gerada.

**Passos para execução:**

1. A aplicação acessa o serviço de "Consulta de NFS-e por faixa" e submete os dados para processamento (fluxo "2.b"). 74  
2.   
3. A requisição é recebida pelo servidor do Web Service, que verifica os dados preenchidos e identifica as NFS-e correspondentes (fluxos "2.c" e "2.d"). 75  
4.   
5. O Web Service retorna uma mensagem com o resultado do processamento do serviço (fluxos "2.e"). 76  
6. 

#### **3.2 Padrões Técnicos 77**

##### **3.2.1 Padrão de Comunicação 78**

O meio físico de comunicação utilizado entre os sistemas de informação dos contribuintes e o Sistema de Notas Fiscais de Serviço Eletrônicas das Administrações Tributárias Municipais será a Internet, com o uso do protocolo SSL, que além de garantir um duto de comunicação seguro na Internet, permite a identificação do servidor e do cliente com a utilização de certificados digitais, eliminando a necessidade de identificação do usuário com a utilização de nome ou código de usuário e senha. 79 O modelo de comunicação segue o padrão de Web Services definido pelo WS-I Basic Profile. 80 A troca de mensagens entre o Web Service do Sistema de Notas Fiscais de Serviço Eletrônicas das Administrações Tributárias Municipais e o sistema do contribuinte será realizada no padrão SOAP, com troca de mensagens XML no padrão Style/Enconding: Document/Literal, wrapped. 81 A opção "wrapped" representa a chamada aos métodos disponíveis com a passagem de mais de um parâmetro. 82 Para descrever os serviços disponibilizados, será utilizado um documento WSDL (Web Service Description Language). 83 O WSDL é o padrão recomendado para descrição de serviços SOAP. 84 As chamadas aos serviços serão feitas enviando como parâmetro um documento XML a ser processado pelo sistema. 85 Esse documento não fará parte da descrição do serviço (arquivo WSDL), e o formato do XML correspondente ao serviço está definido neste manual de integração, seção 4.5. 86

##### **3.2.2 Padrão de Certificado Digital 87**

Para garantir a autenticidade, integridade e o não-repúdio das informações transmitidas, os documentos XML de entrada e saída deverão ser assinados digitalmente por certificados digitais válidos, emitidos por Autoridade Certificadora (AC) credenciada pela Infraestrutura de Chaves Públicas Brasileira (ICP-Brasil). 88

Os certificados digitais aceitos para assinatura são os certificados do tipo A1 ou A3, conforme definido pela MP 2.200-2, de 24/08/2001 e normas técnicas correlatas. 89

Para a assinatura dos documentos XML que serão transmitidos ao web service da prefeitura, deverá ser usado o certificado digital da pessoa jurídica prestadora de serviços (CNPJ). 90

##### **3.2.3 Padrão de Assinatura Digital 91**

O padrão de assinatura digital XML a ser utilizado deverá estar em conformidade com a especificação "XML-Signature Syntax and Processing Version 1.0", de 12/02/2002, produzida pelo W3C. 92

A assinatura deverá ser aplicada sobre os elementos que identificam unicamente o RPS (InfRps) e o Lote de RPS (LoteRps), utilizando a referência através do atributo Id. 93

Os elementos InfRps e LoteRps deverão conter o atributo Id com um valor único no documento XML para possibilitar a assinatura digital. 94

A assinatura digital deverá ser aplicada utilizando os seguintes algoritmos: 95

- **Canonicalization Method**: http://www.w3.org/TR/2001/REC-xml-c14n-20010315 96
- **Signature Method**: http://www.w3.org/2000/09/xmldsig#rsa-sha1 97
- **Digest Method**: http://www.w3.org/2000/09/xmldsig#sha1 98
- **Transform Algorithm**: 99
  - http://www.w3.org/2000/09/xmldsig#enveloped-signature 100
  - http://www.w3.org/TR/2001/REC-xml-c14n-20010315 101

##### **3.2.4 Validação de Assinatura Digital pelo Sistema NFS-e 102**

O sistema NFS-e fará a validação da assinatura digital de cada RPS e do Lote de RPS enviado, verificando: 103

1. Se a assinatura digital foi aplicada corretamente segundo as especificações XML-DSig. 104
2. Se o certificado digital utilizado na assinatura está válido (não expirado e não revogado). 105
3. Se o certificado digital foi emitido por AC credenciada na ICP-Brasil. 106
4. Se o certificado digital é da pessoa jurídica prestadora de serviços (CNPJ do certificado deve conferir com o CNPJ do prestador). 107

##### **3.2.5 Uso de Assinatura com Certificado Digital 108**

A assinatura digital é obrigatória para: 109

- Todos os RPS individuais (elemento InfRps) 110
- O Lote de RPS (elemento LoteRps) 111

O certificado digital deve estar válido no momento do envio e deve pertencer à pessoa jurídica prestadora dos serviços. 112

#### **3.3 Padrão das Mensagens XML 113**

##### **3.3.1 Área do Cabeçalho 114**

Todas as mensagens XML trocadas entre o sistema do contribuinte e o sistema NFS-e devem conter na área do cabeçalho as seguintes informações: 115

- **versao**: Versão do schema XML utilizado (ex: "2.03") 116
- **xmlns**: Namespace do documento XML 117

##### **3.3.2 Validação da Estrutura das Mensagens XML 118**

Todas as mensagens XML enviadas ao sistema NFS-e serão validadas contra os schemas XSD correspondentes. 119

As mensagens que não estiverem em conformidade com a estrutura definida nos schemas serão rejeitadas com mensagem de erro específica. 120

##### **3.3.3 Schemas XML (Arquivos XSD) 121**

Os schemas XML (arquivos XSD) definem a estrutura e as regras de validação para todos os documentos XML utilizados na comunicação com o sistema NFS-e. 122

Os schemas estão organizados da seguinte forma: 123

- **nfse.xsd**: Schema principal contendo as definições dos elementos e tipos utilizados 124
- **xmldsig-core-schema.xsd**: Schema para assinatura digital XML 125

##### **3.3.4 Versão dos Schemas XML 126**

A versão atual dos schemas XML é a **2.03**. 127

Esta versão deve ser indicada no atributo "versao" dos elementos raiz dos documentos XML. 128

---

## **SEÇÕES CRÍTICAS PARA RESOLUÇÃO DO ERRO DE ASSINATURA:**

### **3.2.3 Padrão de Assinatura Digital** ⚠️

**ALGORITMOS OBRIGATÓRIOS:**
- Canonicalization Method: `http://www.w3.org/TR/2001/REC-xml-c14n-20010315` ✅
- Signature Method: `http://www.w3.org/2000/09/xmldsig#rsa-sha1` ✅
- Digest Method: `http://www.w3.org/2000/09/xmldsig#sha1` ✅
- Transform Algorithm: ✅
  - `http://www.w3.org/2000/09/xmldsig#enveloped-signature`
  - `http://www.w3.org/TR/2001/REC-xml-c14n-20010315`

### **3.2.4 Validação de Assinatura Digital pelo Sistema NFS-e** ⚠️

**VERIFICAÇÕES DO WEBSERVICE:**
1. ✅ Assinatura XML-DSig correta
2. ✅ Certificado válido (não expirado)
3. ✅ AC credenciada ICP-Brasil
4. ⚠️ **CNPJ do certificado deve conferir com CNPJ do prestador**

### **POSSÍVEL CAUSA DO ERRO:**
O erro "Arquivo enviado com erro na assinatura" pode ser devido a:
- CNPJ no certificado: `15.198.135/0001-80`
- CNPJ no XML: `12345678000123` ❌

**AÇÃO NECESSÁRIA:** Verificar se o CNPJ no XML corresponde ao CNPJ do certificado digital.
