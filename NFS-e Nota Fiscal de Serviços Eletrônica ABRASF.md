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

Os certificados digitais utilizados no sistema de Notas Fiscais de Serviço Eletrônicas das Administrações Tributárias Municipais, serão emitidos por Autoridade Certificadora credenciada pela Infra-estrutura de Chaves Públicas Brasileira \- ICP-Brasil, de pessoa física ou jurídica, dos tipos A1 ou A3. 88 Para a assinatura digital dos documentos envolvidos aceitar-se-á que o certificado digital seja de quaisquer dos estabelecimentos da empresa. 89 Os certificados digitais serão exigidos em 2 (dois) momentos distintos para a integração entre o sistema do contribuinte e o Web Service das Administrações Públicas Municipais:

* **Assinatura de Mensagens:** O certificado digital utilizado para essa função deverá conter o CNPJ do estabelecimento emissor da NFS-e ou o CNPJ do estabelecimento matriz ou CPF quando o prestador de serviços for pessoa física. 90 O certificado digital deverá ter o "uso da chave" previsto para a função de assinatura digital, respeitando a Política do Certificado. 91  
*   
* **Transmissão:** durante a transmissão das mensagens entre os servidores do contribuinte e os serviços disponibilizados pelas Administrações Públicas Municipais. O certificado digital utilizado para identificação do aplicativo do contribuinte deverá conter o CNPJ do responsável pela transmissão das mensagens, mas não necessita ser o mesmo CNPJ do estabelecimento ou CPF, quando o prestador de serviços for pessoa física, emissor da NFS-e, devendo ter a extensão extended Key Usage com permissão de "Autenticação Cliente".

##### **3.2.3 Padrão de Assinatura Digital 92**

As mensagens enviadas aos serviços disponibilizados pelas Administrações Tributárias Municipais são documentos eletrônicos elaborados no padrão XML e devem ser assinados digitalmente com um certificado digital que contenha o CNPJ do estabelecimento matriz ou o CNPJ do estabelecimento ou o CPF do prestador de serviços emissor da NFS-e objeto do pedido. 93 Para garantir minimamente a integridade das informações prestadas e a correta formação dos arquivos XML, o contribuinte deverá submeter as mensagens XML para validação pela linguagem de Schema do XML (XSD \- XML Schema Definition), disponibilizada pelas Administrações Tributárias Municipais antes de seu envio. 94 Os elementos abaixo estão presentes dentro do certificado do contribuinte tornando desnecessária a sua representação individualizada no arquivo XML. 95 Portanto, o arquivo XML não deve conter os elementos: \<X509SubjectName\>, \<X509IssuerSerial\>, \<X509IssuerName\>, \<X509SerialNumber\>, \<X509SKI\>. 96

Deve-se evitar o uso das TAGs abaixo, pois as informações serão obtidas a partir do certificado do emitente: \<KeyValue\>, \<RSAKeyValue\>, \<Modulus\>, \<Exponent\>.

O Projeto NFS-e utiliza um subconjunto do padrão de assinatura XML definido pelo [http://www.w3.org/TR/xmldsig-core/](http://www.w3.org/TR/xmldsig-core/), que tem o seguinte leiaute:

| \# | Campo | Elemento | Pai | Tipo | Ocorrência | Descrição |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| XS01 | Signature | Raiz |  |  |  |  |
| XS02 | Id | A | XS01 | C | 1-1 |  |
| XS03 | SignedInfo | G | XS01 |  | 1-1 | Grupo da Informação da assinatura |
| XS04 | Canonicalization Method | G | XS03 |  | 1-1 | Grupo do Método de Canonicalização |
| XS05 | Algorithm | A | XS04 | C | 1-1 | Atributo Algorithm de Canonicalization Method: [http://www.w3.org/TR/2001/REC-xml-c14n-20010315](http://www.w3.org/TR/2001/REC-xml-c14n-20010315) |
| XS06 | SignatureMethod | G | XS03 |  | 1-1 | Grupo do Método de Assinatura |
| XS07 | Algorithm | A | XS06 | C | 1-1 | Atributo Algorithm de SignedInfo: [http://www.w3.org/2000/09/xmldsig\#rsa-shal](https://www.google.com/search?q=http://www.w3.org/2000/09/xmldsig%23rsa-shal) |
| XS08 | Reference | G | XS03 |  | 1-1 | Grupo do Método de Reference |
| XS09 | URI | A | XS08 | C | 1-1 | Atributo URI da tag Reference |
| XS10 | Transforms | G | XS08 |  | 1-1 | Grupo do algorithm de Transform |
| XS11 | Unique\_Transf\_Alg | RC | XS10 |  | 1-1 | Regra para o atributo Algorithm do Transform ser único |
| XS12 | Transform | G | XS10 |  | 2-2 | Grupo de Transform |
| XS13 | Algorithm | A | XS12 | C | 1-1 | Atributos válidos Algorithm do Transform: [http://www.w3.org/TR/2001/REC-xml-c14n-20010315](http://www.w3.org/TR/2001/REC-xml-c14n-20010315) [http://www.w3.org/2000/09/xmldsig\#enveloped-signature](https://www.google.com/search?q=http://www.w3.org/2000/09/xmldsig%23enveloped-signature) |
| XS14 | Xpath | E | XS12 | C | O-N | Xpath |
| XS15 | DigestMethod | G | XS08 |  | 1-1 | Grupo do Método de DigestMethod |
| XS16 | Algorithm | A | XS15 | C | 1-1 | Atributo Algorithm de DigestMethod: [http://www.w3.org/2000/09/xmldsig\#shal](https://www.google.com/search?q=http://www.w3.org/2000/09/xmldsig%23shal) |
| XS17 | DigestValue | E | XS08 | C | 1 | Digest Value (Hash SHA-1 Base64) |
| XS18 | SignatureValue | G | XS01 |  | 1-1 | Grupo do Signature Value |
| XS19 | KeyInfo | G | XS01 |  | 1-1 | Grupo do KeyInfo |
| XS20 | X509Data | G | XS19 |  | 1-1 | Grupo X509 |
| XS21 | X509Certificate | E | XS20 | C | 1-1 | Certificado Digital x509 em Base64b |

Observação:

Os RPS's e lote devem ser assinados conforme os seguintes passos:

1. Assinatura do RPS isoladamente neste momento deve ser identificado o namespace ([http://www.abrasf.org.br/nfse.xsd](http://www.abrasf.org.br/nfse.xsd)) em cada RPS que será assinado  
2. Agrupar todos os RPS assinados em um único lote  
3. Assinar o lote com os RPS's, também identificando o namespace [http://www.abrasf.org.br/nfse.xsd](http://www.abrasf.org.br/nfse.xsd)

##### **3.2.4 Validação de Assinatura Digital pelo Sistema NFS-e 97**

Para a validação da assinatura digital, seguem as regras que serão adotadas pelas Administrações Tributárias Municipais:

1. Extrair a chave pública do certificado; 98  
2.   
3. Verificar o prazo de validade do certificado utilizado; 99  
4.   
5. Montar e validar a cadeia de confiança dos certificados validando também a LCR (Lista de Certificados Revogados) de cada certificado da cadeia; 100  
6.   
7. Validar o uso da chave utilizada (Assinatura Digital) de tal forma a aceitar certificados somente do tipo A (não serão aceitos certificados do tipo S); 101  
8.   
9. Garantir que o certificado utilizado é de um usuário final e não de uma Autoridade Certificadora; 102  
10.   
11. Adotar as regras definidas pelo RFC 3280 para LCRs e cadeia de confiança; 103  
12.   
13. Validar a integridade de todas as LCR utilizadas pelo sistema; 104  
14.   
15. Prazo de validade de cada LCR utilizada (verificar data inicial e final). 105  
16. 

A forma de conferência da LCR fica a critério de cada Administração Tributária Municipal, podendo ser feita de 2 (duas) maneiras: On-line ou Download periódico. 106 As assinaturas digitais das mensagens serão verificadas considerando o horário fornecido pelo Observatório Nacional. 107

##### **3.2.5 Uso de Assinatura com Certificado Digital 108**

Para garantir a autenticidade dos dados gerados, algumas informações poderão ser assinadas digitalmente, conforme determinação Administração Tributária Municipal. 109 Abaixo seguem as informações que poderão ser assinadas e quem deverá fazê-lo em cada momento: 110

* O RPS, pelo contribuinte, antes do envio do Lote de RPS que o contenha; 111  
*   
* O Lote de RPS, pelo contribuinte, antes do seu envio; 112  
*   
* A NFS-e:  
  * Pela Administração Tributária Municipal e pelo contribuinte, quando gerada pela Aplicação On Line; 113  
  *   
  * Pela Administração Tributária Municipal nos demais casos; 114  
  *   
* O Pedido de cancelamento da NFS-e, pelo contribuinte; 115  
*   
* A Confirmação de cancelamento da NFS-e, pela Administração Tributária Municipal; 116  
*   
* A Confirmação de substituição da NFS-e, pela Administração Tributária Municipal. 117  
* 

#### **3.3 Padrão das Mensagens XML 118**

A especificação adotada para as mensagens XML é a recomendação W3C para XML 1.0, disponível em www.w3.org/TR/REC-xml e a codificação dos caracteres será em UTF-8. 119 As chamadas dos Web Services disponibilizados Administrações Tributárias Municipais e os respectivos resultados do processamento são realizadas com utilização de mensagens com o seguinte padrão:

* **Área de Cabeçalho:** estrutura XML padrão para todas as mensagens de chamada e retorno de resultado dos Web Services disponibilizados pelas Administrações Tributárias Municipais, que contêm os dados de controle da mensagem. 120 A área de cabeçalho está sendo utilizada para armazenar a versão do leiaute da estrutura XML informada na área de dados. 121  
*   
* **Área de Dados:** estrutura XML variável definida na documentação do Web Service acessado. 122  
* 

##### **3.3.1123 Área do Cabeçalho 124**

Abaixo, o leiaute da Área de Cabeçalho padrão:

| \# | Nome | Elemento | Pai | Tipo | Ocorrência | Tamanho | Descrição |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| 1 | cabecalho | G |  |  | 1-1 |  | TAG raiz do cabeçalho da mensagem. |
|  | Versão | A | 1 | N | 1-1 | 4 | Versão do leiaute. |
| 2 | versaoDados | E | 1 | N | 1-1 | 4 | O conteúdo deste campo indica a versão do leiaute XML da estrutura XML informada na área de dados da mensagem. |

O campo versaoDados deve conter a informação da versão do leiaute da estrutura XML armazenada na área de dados da mensagem. 125 A estrutura XML armazenada na área de dados está definida na documentação do Web Service acessado. 126

##### **3.3.2 Validação da estrutura das Mensagens XML 127**

Para garantir minimamente a integridade das informações prestadas e a correta formação das mensagens XML, o contribuinte deverá submeter cada uma das mensagens XML de pedido de serviço para validação pelo seu respectivo arquivo XSD (XML Schema Definition, definição de esquemas XML) antes de seu envio. 128 Neste manual utilizaremos a nomenclatura Schema XML para nos referir a arquivo XSD. 129 Um Schema XML define o conteúdo de uma mensagem XML, descrevendo os seus atributos, seus elementos e a sua organização, além de estabelecer regras de preenchimento de conteúdo e de obrigatoriedade de cada elemento ou grupo de informação. 130 A validação da estrutura da mensagem XML é realizada por um analisador sintático (parser) que verifica se a mensagem XML atende às definições e regras de seu respectivo Schema XML. 131 Qualquer divergência da estrutura da mensagem XML em relação ao seu respectivo Schema XML, provoca um erro de validação do Schema XML. 132 Neste caso o conteúdo da mensagem XML de pedido do serviço não poderá ser processado. 133 A primeira condição para que a mensagem XML seja validada com sucesso é que ela seja submetida ao Schema XML correto. 134 Assim, os sistemas de informação dos contribuintes devem estar preparados para gerar mensagens XML em seus respectivos Schemas XML em vigor. 135

##### **3.3.3 Schemas XML (arquivos XSD) 136**

O Schema XML (arquivo XSD) correspondente a cada uma das mensagens XML de pedido e de retorno utilizadas pelo Web Service pode ser obtido na internet acessando o Portal do Sistema de Notas Fiscais de Serviço Eletrônicas das Administrações Tributárias Municipais. 137

##### **3.3.4 Versão dos Schemas XML 138**

Toda mudança de layout das mensagens XML do Web Service implica a atualização do seu respectivo Schema XML. 139 A identificação da versão dos Schemas XML será realizada com o acréscimo do número da versão com dois dígitos no nome do arquivo XSD precedida da literal "v", como segue: \<Nome do Arquivo\>\_v\<Número da Versão\>.xsd. Exemplo: EnvioLoteRps\_v01.xsd.

A maioria dos Schemas XML definidos para a utilização do Web Service do Sistema de Notas Fiscais de Serviço Eletrônicas das Administrações Tributárias Municipais utilizam as definições de tipos simples ou tipos complexos que estão definidos em outros Schemas XML. 140 Nesses casos, a modificação de versão do Schema básico será repercutida no Schema principal. 141 As modificações de layout das mensagens XML do Web Service podem ser causadas por necessidades técnicas ou em razão da modificação de alguma legislação. 142 As modificações decorrentes de alteração da legislação deverão ser implementadas nos prazos previstos no ato normativo que introduziu a alteração. 143 As modificações de ordem técnica serão divulgadas pelas Administrações Tributárias Municipais e ocorrerão sempre que se fizerem necessárias. 144

### **4 ESTRUTURA DE DADOS DO WEB SERVICE 145**

Existirá um único Web Service com todos os serviços apresentados no item 3.1. 146 O fluxo de comunicação é sempre iniciado pelo sistema do contribuinte com o envio de uma mensagem XML ao Web Service com o pedido do serviço desejado. 147

#### **4.1 Modelo Operacional 148**

A forma de processamento das solicitações de serviços no projeto Nota Fiscal de Serviços Eletrônica pode ser síncrona, caso o atendimento da solicitação de serviço seja realizada na mesma conexão ou assíncrona, quando o processamento do serviço solicitado não é atendido na mesma conexão, devido a uma demanda de processamento de grande quantidade de informação. 149 Nessa situação torna-se necessária a realização de mais uma conexão para a obtenção do resultado do processamento. 150 As solicitações de serviços que exigem processamento intenso serão executadas de forma assíncrona e as demais solicitações de serviços de forma síncrona. 151 Assim, os serviços da NFS-e serão implementados da seguinte forma:

| Serviço | Implementação |
| :---- | :---- |
| Recepção e Processamento de Lote de RPS | Assíncrona |
| Enviar Lote de RPS Sincrono | Síncrona |
| Geração152 de NFS-e | Síncrona |
| Cancelamento de NFS-e | Síncrona |
| Substituição de NFS-e | Síncrona |
| Consulta de Lote de RPS | Síncrona |
| Consulta de NFS-e por RPS | Síncrona |
| Consulta de NFS-e \- Serviços Prestados | Síncrona |
| Consulta de NFS-e \- Serviços Tomados ou Intermediados | Síncrona |
| Consulta de NFS-e por faixa | Síncrona |

##### **4.1.1 Serviços Síncronos 153**

As solicitações de serviços de implementação síncrona são processadas imediatamente e o resultado do processamento é obtido em uma única conexão. 154 Abaixo, o fluxo simplificado de funcionamento:

**Etapas do processo ideal:**

1. O aplicativo do contribuinte inicia a conexão enviando uma mensagem de solicitação de serviço para o Web Service; 155  
2.   
3. O Web Service recebe a mensagem de solicitação de serviço e encaminha ao aplicativo da NFS-e que irá processar o serviço solicitado; 156  
4.   
5. O aplicativo da NFS-e recebe a mensagem de solicitação de serviços e realiza o processamento, devolvendo uma mensagem de resultado do processamento ao Web Service; 157  
6.   
7. O Web Service recebe a mensagem de resultado do processamento e o encaminha ao aplicativo do contribuinte; 158  
8.   
9. O aplicativo do contribuinte recebe a mensagem de resultado do processamento e caso não exista outra mensagem, encerra a conexão. 159  
10. 

##### **4.1.2 Serviços Assíncronos 160**

As solicitações de serviços de implementação assíncrona são processadas de forma distribuída por vários processos e o resultado do processamento somente é obtido na segunda conexão. 161 Abaixo, o fluxo simplificado de funcionamento:

**Etapas do processo ideal:**

**Solicitação e processamento:**

1. O aplicativo do contribuinte inicia a conexão enviando uma mensagem de solicitação de serviço para o Web Service de recepção de solicitação de serviços; 162  
2.   
3. O Web Service de recepção de solicitação de serviços recebe a mensagem de solicitação de serviço e a coloca na fila de serviços solicitados, acrescentando o CNPJ ou CPF do transmissor obtido do certificado digital do transmissor; 163  
4.   
5. O Web Service de recepção de solicitação de serviços retorna o protocolo da solicitação de serviço e a data e hora de gravação na fila de serviços solicitados ao aplicativo do contribuinte; 164  
6.   
7. O aplicativo do contribuinte recebe o protocolo;  
8. Na estrutura interna do aplicativo de NFS-e a solicitação de serviços é retirada da fila de serviços solicitados pelo aplicativo da NFS-e em momento específico, definido pela equipe técnica da NFS-e; 165  
9.   
10. O serviço solicitado é processado pelo aplicativo da NFS-e e o resultado do processamento é colocado na fila de serviços processados; 166  
11. 

**Obtenção do resultado do serviço:**

1. O aplicativo do contribuinte, utilizando o protocolo recebido, envia uma consulta ao serviço que retornará o resultado do processamento daquele protocolo, iniciando uma conexão com o Web Service; 167  
2.   
3. O Web Service recebe a mensagem de consulta e localiza o resultado de processamento da solicitação de serviço; 168  
4.   
5. O Web Service devolve o resultado do processamento ao aplicativo contribuinte; 169  
6.   
7. O aplicativo do contribuinte recebe a mensagem de resultado do processamento e, caso não exista outra mensagem, encerra a conexão. 170  
8. 

#### **4.2 Formatos e Padrões Utilizados 171**

Abaixo seguem algumas formatações de dados que devem ser seguidas para geração correta na estrutura dos arquivos.

| Formato | Observação |
| :---- | :---- |
| Data (date) | Formato: AAAA-MM-DD\&lt;br\>onde:\&lt;br\>AAAA= ano com 4 caracteres\&lt;br\>MM= mês com 2 caracteres\&lt;br\>DD= dia com 2 caracteres |
| Data/Hora (datetime) | Formato AAAA-MM-DDTHH:mm:ss\&lt;br\>onde:\&lt;br\>AAAA= ano com 4 caracteres\&lt;br\>MM= mês com 2 caracteres\&lt;br\>DD= dia com 2 caracteres\&lt;br\>T= caractere de formatação que deve existir separando a data da hora\&lt;br\>HH= hora com 2 caracteres\&lt;br\>mm: minuto com 2 caracteres\&lt;br\>ss: segundo com 2 caracteres |
| Valores Decimais (decimal) | Formato: 0.00\&lt;br\>Não deve ser utilizado separador de milhar. O ponto (.) deve ser utilizado para separar a parte inteira da fracionária.\&lt;br\>Exemplo:\&lt;br\>48.562,25=48562.25\&lt;br\>1,00=1.00 ou 1\&lt;br\>0,50=0.50 ou 0.5 |
| Valores Percentuais (decimal) | Formato 00.00\&lt;br\>O formato em percentual presume o valor percentual em sua forma fracionária, contendo 5 dígitos. O ponto (.) separa a parte inteira da fracionária.\&lt;br\>Exemplo:\&lt;br\>2\&lt;br\>15\&lt;br\>25,32=25.32 |

Não deve ser inserido caractere não significativo para preencher o tamanho completo do campo, ou seja, zeros antes de número ou espaço em branco após a cadeia de caracteres. 172 A posição do campo é definida na estrutura do documento XML através de TAGs (\<tag\>conteúdo\</tag\>). 173 A regra constante do parágrafo anterior deverá estender-se para os campos para os quais não há indicação de obrigatoriedade e que, no entanto, seu preenchimento torna-se obrigatório seja condicionado à legislação específica ou ao negócio do contribuinte. 174 Nesse caso, deverá constar a TAG com o valor correspondente e, para os demais campos, deverão ser eliminadas as TAGs. 175

Para reduzir o tamanho final do arquivo XML da NFS-e alguns cuidados de programação deverão ser assumidos:

* não incluir "zeros não significativos" para campos numéricos; 176  
*   
* não incluir "espaços" no início ou no final de campos numéricos e alfanuméricos; 177  
*   
* não incluir comentários no arquivo XML; 178  
*   
* não incluir anotação e documentação no arquivo XML (TAG annotation e TAG documentation); 179  
*   
* não incluir caracteres de formatação no arquivo XML ("line-feed", "carriage return", "tab", caractere de "espaço" entre as TAGs); 180  
*   
* para quebra de linha na exibição para os campos contendo caracteres Discriminacao e Outrasinformacoes, utilizar a sequência "\\s\\n". 181  
* 

As TAGs que permitirem valores nulos devem ser omitidas da estrutura XML a ser enviada quando seus valores forem nulos. 182

#### **4.3 Tipos Simples 183**

A seguir encontra-se a tabela com a lista dos tipos simples que serão utilizados como tipos de dados. 184 A tabela está dividida em 4 colunas, a saber: 185

* **Campo:** nome do tipo simples; 186  
*   
* **Tipo:** tipo primitivo de dados utilizados pelo campo: 187  
  * C: Caractere;  
  * N: Número;  
  * D: Data ou Data/Hora; 188  
  *   
  * T: Token 189  
  *   
* **Descrição:** descreve informações sobre o campo;  
* **Tam.:** tamanho do campo: 190  
  * Quando forem caracteres o tamanho define a quantidade máxima de caracteres que o texto poderá ter; 191  
  *   
  * Quando for numérico o tamanho pode ser representado das seguintes formas: 192  
    * Número inteiro, que define o total de dígitos existente no número. 193 Exemplo: "15" significa que o número poderá ter, no máximo, 15 dígitos; 194  
    *   
    * Número fracionário, que define o total de dígitos e quantos deles serão designados para a parte fracionária. 195 Exemplo: "15,2" significa que o número poderá ter, no máximo, 15 dígitos sendo 2 deles a da parte fracionária. 196 A parte fracionária não é obrigatória quando assim definido; 197  
    *   
  * Quando for data, não haverá definição de tamanho.

| Campo | Tipo | Descrição | Tam. |
| :---- | :---- | :---- | :---- |
| tsNumeroNfse | N | Número da Nota Fiscal de Serviço Eletrônica, formado por um número seqüencial com 15 posições | 15 |
| tsCodigoVerificacao | C | Código de verificação do número da nota | 9 |
| tsNif | C | Número de Identificação Fiscal | 40 |
| tsStatusRps | N | Código de status do RPS: 1- Normal, 2- Cancelado | 1 |
| tsStatusNfse | N | Código de status da NFS-e: 1- Normal, 2- Cancelado | 1 |
| tsExigibilidadeIss | N | Código de natureza da operação: 1- Exigível; 2- Não incidência; 3- Isenção; 4- Exportação; 5- Imunidade; 6- Exigibilidade Suspensa por Decisão Judicial; 7- Exigibilidade Suspensa por Processo Administrativo | 2 |
| tsNumeroProcesso | C | Número do processo judicial ou administrativo de suspensão da exigibilidade | 30 |
| tsRegimeEspecialTributacao | N | Código de identificação do regime especial de tributação: 1- Microempresa municipal, 3- Estimativa, 3- Sociedade de profissionais, 4- Cooperativa, 5- Microempresário Individual (MEI), 6- Microempresário e Empresa de Pequeno Porte (ME EPP) | 2 |
| tsSimNao | N | Identificação de Sim/Não: 1- Sim, 2- Não | 1 |
| tsResponsavelRetencao | N | Identificação do responsável pela retenção do ISS: 1- Tomador, 2- Intermediário | 1 |
| tsPagina | N | Número da página da consulta | 6 |
| tsNumeroRps | N | Número do RPS | 15 |
| tsSerieRps | C | Número de série do RPS | 5 |
| tsTipoRps | N | Código de tipo de RPS: 1- RPS, 2- Nota Fiscal Conjugada (Mista), 3- Cupom | 1 |
| tsOutrasInformacoes | C | Informações adicionais ao documento. | 255 |
| tsValor | N | Valor monetário. Formato: 0.00 (ponto separando casa decimal). Ex: 1.234,56=1234.56, 1.000,00=1000.00, 1.000,00=1000 | 15,2 |
| tsItemListaServico | C | Código de item da lista de serviço | 5 |
| tsCodigoCnae | N | Código CNAE | 7 |
| tsCodigoTributacao | C | Código de Tributação | 20 |
| tsCodigoNbs | C | Código de NBS | 2 |
| tsAliquota | N | Alíquota. Valor percentual. Formato: 00.00. Ex: 1%=1, 25.5%=25.5, 10%=10 | 4,2 |
| tsDiscriminacao | C | Discriminação do conteúdo da NFS-e | 2000 |
| tsCodigoMunicipioIbge | N | Código de identificação do município conforme tabela do IBGE | 7 |
| tsInscricaoMunicipal | C | Número de inscrição municipal | 15 |
| tsRazaoSocial | C | Razão Social do contribuinte | 150 |
| tsNomeFantasia | C | Nome fantasia | 60 |
| tsCnpj | C | Número CNPJ | 14 |
| tsEndereco | C | Tipo e nome do logradouro (Av.., Rua..., ...) | 125 |
| tsNumeroEndereco | C | Número do imóvel | 10 |
| tsComplementoEndereco | C | Complemento de endereço | 60 |
| tsBairro | C | Bairro | 60 |
| tsUf | C | Sigla da unidade federativa | 2 |
| tsCodigoPaisBacen | C | Código de identificação do município conforme tabela do BACEN | 4 |
| tsCep | C | Número do CEP | 8 |
| tsEmail | C | E-mail | 80 |
| tsTelefone | C | Telefone | 20 |
| tsCpf | C | Número de CPF | 11 |
| tsCodigoObra | C | Código de Obra | 15 |
| tsArt | C | Código ART | 15 |
| tsNumeroLote | N | Número do Lote de RPS | 15 |
| tsNumeroProtocolo | C | Número do protocolo de recebimento do lote RPS | 50 |
| tsSituacaoLoteRps | N | Código de situação de lote de RPS: 1- Não Recebido, 2- Não Processado, 3- Processado com Erro, 4- Processado com Sucesso | 1 |
| tsQuantidadeRps | N | Quantidade de RPS do Lote | 4 |
| tsCodigoMensagemAlerta | C | Código de mensagem de retorno de serviço. | 4 |
| tsDescricaoMensagemAlerta | C | Descrição da mensagem de retorno de serviço. | 200 |
| tsCodigoCancelamentoNfse | C | Código de cancelamento com base na tabela de Erros e alertas: 1- Erro na emissão, 2- Serviço não prestado, 3- Erro de assinatura, 4- Duplicidade da nota, 5- Erro de processamento. Importante: Os códigos 3 (Erro de assinatura) e 5 (Erro de processamento) são de uso restrito da Administração Tributária Municipal | 4 |
| tsIdTag | C | Atributo de identificação da tag a ser assinada no documento XML | 255 |
| tsVersao | T | Versão do leiaute. Formato: \[1-9\]{1}\[0-9\]{0,1}.\[0-9\]{2} |  |

#### **4.4 Tipos Complexos 198**

A seguir são detalhadas as tabelas de cada tipo composto e seus campos. 199 A tabela está dividida da seguinte forma: 200

* **(1) Nome do tipo complexo;** 201  
*   
* **(2) Descrição do tipo complexo;** 202  
*   
* **(3) Identifica se a sequência de campos fará parte de uma escolha (Choice);** 203  
*   
* **(4) Nome do campo que faz parte do tipo complexo;** 204  
*   
* **(5) Tipo do campo, que pode ser simples ou complexo;** 205  
*   
* **(6) Quantas vezes o campo se repete na estrutura de dados:** 206  
  * a. Formato: "x-y" onde "x" é a quantidade mínima e "y" a quantidade máxima. 207  
  *   
  * b. Se a quantidade máxima for indefinida, será utilizado "N" no lugar do "y"; 208  
  *   
* **(7) Descrição do campo.** 209  
* 

**tcCpfCnpj** \- Número de CPF ou CNPJ

| (3) | (4) Nome | (5) Tipo | (6) Ocorrência | (7) Descrição |
| :---- | :---- | :---- | :---- | :---- |
| Choice | Cpf | tsCpf | 1-1 | Número do Cpf |
|  | Cnpj | tsCnpj | 1-1 | Número do Cnpj |

**tcEndereco** \- Representação completa do endereço 210

| (4) Nome | (5) Tipo | (6) Ocorrência | (7) Descrição |
| :---- | :---- | :---- | :---- |
| Endereco | tsEndereco | 0-1 | Tipo e nome do logradouro |
| Numero | tsNumeroEndereco | 0-1 | Número do imóvel |
| Complemento | tsComplementoEndereco | 0-1 | Complemento do Endereço |
| Bairro | tsBairro | 0-1 | Nome do bairro |
| Codigo Municipio | tsCodigoMunicipioIbge | 0-1 | Código da cidade |
| Uf | tsUf | 0-1 | Sigla do estado |
| CodigoPais | tsCodigoPaisBacen | 0-1 | Código do país |
| Cep | tsCep | 0-1 | CEP da localidade |

**tcContato** \- Representa forma de contato com a pessoa (física/jurídica) 211

| (4) Nome | (5) Tipo | (6) Ocorrência | (7) Descrição |
| :---- | :---- | :---- | :---- |
| Telefone | tsTelefone | 0-1 |  |
| Email | tsEmail | 0-1 |  |

**tcIdentificacaoOrgaoGerador** \- Representa dados para identificação de órgão gerador 212

| (4) Nome | (5) Tipo | (6) Ocorrência | (7) Descrição |
| :---- | :---- | :---- | :---- |
| CodigoMunicipio | tsCodigoMunicipioIbge | 1-1 |  |
| Uf | tsUf | 1-1 |  |

**tcIdentificacaoRps** \- Dados de identificação do RPS 213

| (4) Nome | (5) Tipo | (6) Ocorrência | (7) Descrição |
| :---- | :---- | :---- | :---- |
| Numero | tsNumeroRps | 1-1 |  |
| Serie | tsSerieRps | 1-1 |  |
| Tipo | tsTipoRps | 1-1 |  |

**tcIdentificacaoPrestador** \- Representa dados para identificação do prestador de serviço 214

| (4) Nome | (5) Tipo | (6) Ocorrência | (7) Descrição |
| :---- | :---- | :---- | :---- |
| CpfCnpj | tcCpfCnpj | 1-1 |  |
| InscricaoMunicipal | tsInscricaoMunicipal | 0-1 |  |

**tcIdentificacaoTomador** \- Representa dados para identificação do tomador de serviço 215

| (4) Nome | (5) Tipo | (6) Ocorrência | (7) Descrição |
| :---- | :---- | :---- | :---- |
| CpfCnpj | tcCpfCnpj | 0-1 |  |
| InscricaoMunicipal | tsInscricaoMunicipal | 0-1 |  |

**tcIdentificacaoConsulente** \- Representa dados para identificação do prestador de serviço 216

| (4) Nome | (5) Tipo | (6) Ocorrência | (7) Descrição |
| :---- | :---- | :---- | :---- |
| CpfCnpj | tcCpfCnpj | 1-1 |  |
| InscricaoMunicipal | tsInscricaoMunicipal | 0-1 |  |

**tcIdentificacaoIntermediario** \- Representa dados para identificação do tomador de serviço 217

| (4) Nome | (5) Tipo | (6) Ocorrência | (7) Descrição |
| :---- | :---- | :---- | :---- |
| CpfCnpj | tcCpfCnpj | 0-1 |  |
| InscricaoMunicipal | tsInscricaoMunicipal | 0-1 |  |

**tcDadosTomador** \- Representa dados do tomador de serviço 218

| (4) Nome | (5) Tipo | (6) Ocorrência | (7) Descrição |
| :---- | :---- | :---- | :---- |
| IdentificacaoTomador | tcIdentificacaoTomador | 0-1 |  |
| NifTomador | tsNif | 0-1 |  |
| RazaoSocial | tsRazaoSocial | 0-1 |  |
| Endereco | tcEndereco | 0-1 |  |
| Contato | tcContato | 0-1 |  |

**tcDadosIntermediario** \- Representa dados para identificação de intermediário do serviço 219

| (4) Nome | (5) Tipo | (6) Ocorrência | (7) Descrição |
| :---- | :---- | :---- | :---- |
| IdentificacaoIntermediario | tcIdentificacaoIntermediario | 1-1 |  |
| RazaoSocial | tsRazaoSocial | 1-1 |  |

**tcValoresDeclaracaoServico** \- Representa um conjunto de valores que compõe a declaração do serviço 220

| (4) Nome | (5) Tipo | (6) Ocorrência | (7) Descrição |
| :---- | :---- | :---- | :---- |
| ValorServicos | tsValor | 1-1 |  |
| ValorDeducoes | tsValor | 0-1 |  |
| ValorPis | tsValor | 0-1 |  |
| ValorCofins | tsValor | 0-1 |  |
| ValorInss | tsValor | 0-1 |  |
| ValorIr | tsValor | 0-1 |  |
| ValorCsil | tsValor | 0-1 |  |
| OutrasRetencoes | tsValor | 0-1 |  |
| ValTotTributos | tsValor | 0-1 |  |
| ValorIss | tsValor | 0-1 |  |
| Aliquota | tsAliquota | 0-1 |  |
| DescontoIncondicionado | tsValor | 0-1 |  |
| DescontoCondicionado | tsValor | 0-1 |  |

**tcValoresNfse** \- Representa um conjunto de valores que compõe o documento fiscal 221

| (4) Nome | (5) Tipo | (6) Ocorrência | (7) Descrição |
| :---- | :---- | :---- | :---- |
| BaseCalculo | tsValor | 0-1 | (Valor dos serviços \- Valor das deduções \- descontos incondicionados) |
| Aliquota | tsAliquota | 0-1 |  |
| Valoriss | tsValor | 0-1 |  |
| ValorLiquidoNfse | tsValor | 1-1 | (ValorServicos \- ValorPIS \- ValorCOFINS \- ValorINSS \- ValorIR \- ValorCSLL \- OutrasRetençoes \- ValorISSRetido \- DescontoIncondicionado \- DescontoCondicionado) |

**tcDadosServico** \- Representa dados que compõe o serviço prestado 222

| (4) Nome | (5) Tipo | (6) Ocorrência | (7) Descrição |
| :---- | :---- | :---- | :---- |
| Valores | tcValoresDeclaracaoServico | 1-1 |  |
| IssRetido | tsSimNao | 1-1 |  |
| ResponsavelRetencao | tsResponsavelRetencao | 0-1 |  |
| ItemListaServico | tsItemListaServico | 1-1 |  |
| CodigoCnae | tsCodigoCnae | 0-1 |  |
| CodigoTributacaoMunicipio | tsCodigoTributacao | 0-1 |  |
| CodigoNbs | tsCodigoNbs | 0-1 |  |
| Discriminacao | tsDiscriminacao | 1-1 |  |
| CodigoMunicipio | tsCodigoMunicipioIbge | 1-1 |  |
| CodigoPais | tsCodigoPaisBacen | 0-1 |  |
| ExigibilidadeISS | tsExigibilidadeISS | 1-1 |  |
| MunicipioIncidencia | tsCodigoMunicipioIbge | 0-1 |  |
| NumeroProcesso | tsNumeroProcesso | 0-1 |  |

**tcDadosConstrucaoCivil** \- Representa dados para identificação de construção civil 223

| (4) Nome | (5) Tipo | (6) Ocorrência | (7) Descrição |
| :---- | :---- | :---- | :---- |
| CodigoObra | tsCodigoObra | 0-1 |  |
| Art | tsArt | 1-1 |  |

**tcDadosPrestador** \- Representa dados do prestador do serviço 224

| (4) Nome | (5) Tipo | (6) Ocorrência | (7) Descrição |
| :---- | :---- | :---- | :---- |
| IdentificacaoPrestador | tcIdentificacaoPrestador | 1-1 |  |
| RazaoSocial | tsRazaoSocial | 1-1 |  |
| NomeFantasia | tsNomeFantasia | 0-1 |  |
| Endereco | tcEndereco | 1-1 |  |
| Contato | tcContato | 0-1 |  |

**tcInfRps** \- Representa dados informativos do Recibo Provisório de Serviço (RPS) 225

| (4) Nome | (5) Tipo | (6) Ocorrência | (7) Descrição |
| :---- | :---- | :---- | :---- |
| IdentificacaoRps | tcIdentificacaoRps | 1-1 |  |
| DataEmissao | Date | 1-1 |  |
| Status | tsStatusRps | 1-1 |  |
| RpsSubstituido | tcIdentificacaoRps | 0-1 |  |
| Id | tsIdTag |  | Identificador da TAG a ser assinada |

**tcInfDeclaracaoPrestacaoServico** \- Representa dados do da declaração do prestador do serviço 226

| (4) Nome | (5) Tipo | (6) Ocorrência | (7) Descrição |
| :---- | :---- | :---- | :---- |
| Rps | tcInfRps | 0-1 |  |
| Competencia | Date | 1-1 |  |
| Servico | tcDadosServico | 1-1 |  |
| Prestador | tcIdentificacaoPrestador | 1-1 |  |
| TomadorServico | tcDadosTomador | 0-1 |  |
| Intermediario | tcDadosIntermediario | 0-1 |  |
| ConstrucaoCivil | tcDadosConstrucaoCivil | 0-1 |  |
| RegimeEspecialTributacao | tsRegimeEspecialTributacao | 0-1 |  |
| OptanteSimplesNacional | tsSimNao | 1-1 |  |
| IncentivoFiscal | tsSimNao | 1-1 |  |
| Id | tsIdTag |  | Identificador da TAG a ser assinada |

**tcDeclaracaoPrestacaoServico** \- Representa a estrutura da declaração da prestação do serviço assinada 227

| (4) Nome | (5) Tipo | (6) Ocorrência | (7) Descrição |
| :---- | :---- | :---- | :---- |
| InfDeclaracaoPrestacaoServico | tcInfDeclaracaoPrestacaoServico | 1-1 |  |
| Signature | dsig:Signature | 0-1 |  |

**tcIdentificacaoNfse** \- Representa dados que identificam uma Nota Fiscal de Serviços Eletrônica 228

| (4) Nome | (5) Tipo | (6) Ocorrência | (7) Descrição |
| :---- | :---- | :---- | :---- |
| Numero | tsNumeroNfse | 1-1 |  |
| CpfCnpj | tcCpfCnpj | 1-1 |  |
| InscricaoMunicipal | tsInscricaoMunicipal | 0-1 |  |
| CodigoMunicipio | tsCodigoMunicipioIbge | 1-1 |  |

**tcInfNfse** \- Representa os dados informativos da Nota Fiscal de Serviços Eletrônica 229

| (4) Nome | (5) Tipo | (6) Ocorrência | (7) Descrição |
| :---- | :---- | :---- | :---- |
| Numero | tsNumeroNfse | 1-1 |  |
| CodigoVerificacao | tsCodigoVerificacao | 1-1 |  |
| DataEmissao | Datetime | 1-1 |  |
| NfseSubstituida | tsNumeroNfse | 0-1 |  |
| OutrasInformacoes | tsOutrasInformacoes | 0-1 |  |
| ValoresNfse | tcValoresNfse | 1-1 |  |
| ValorCredito | tsValor | 0-1 |  |
| PrestadorServico | tcDadosPrestador | 1-1 |  |
| OrgaoGerador | tcIdentificacaoOrgaoGerador | 1-1 |  |
| DeclaracaoPrestacaoServico | tcDeclaracaoPrestacaoServico | 1-1 | Dentro dessa estrutura está o RPS, como não obrigatório |
| Id | tsIdTag |  | Identificador da TAG a ser assinada |

**tcNfse** \- Representa a estrutura da Nota Fiscal de Serviços Eletrônica assinada 230

| (4) Nome | (5) Tipo | (6) Ocorrência | (7) Descrição |
| :---- | :---- | :---- | :---- |
| InfNfse | tcInfNfse | 1-1 |  |
| Signature | Dsig:Signature | 0-1 |  |
| versao | tsVersao | 1-1 |  |

**tcInfPedidoCancelamento** \- Representa a estrutura de dados do pedido de cancelamento enviado pelo prestador ao cancelar uma Nota Fiscal de Serviços Eletrônica. 231

| (4) Nome | (5) Tipo | (6) Ocorrência | (7) Descrição |
| :---- | :---- | :---- | :---- |
| IdentificacaoNfse | tcIdentificacaoNfse | 1-1 |  |
| CodigoCancelamento | tsCodigoCancelamentoNfse | 0-1 |  |
| Id | tsIdTag |  | Identificador da TAG a ser assinada |

**tcPedidoCancelamento** \- Representa a estrutura de Pedido de Cancelamento da Nota Fiscal de Serviços Eletrônica assinada 232

| (4) Nome | (5) Tipo | (6) Ocorrência | (7) Descrição |
| :---- | :---- | :---- | :---- |
| InfPedidoCancelamento | tcInfPedidoCancelamento | 1-1 |  |
| Signature | Dsig:Signature | 0-1 |  |

**tcConfirmacaoCancelamento** \- Representa a estrutura de Confirmação de Cancelamento da Nota Fiscal de Serviços Eletrônica assinada 233

| (4) Nome | (5) Tipo | (6) Ocorrência | (7) Descrição |
| :---- | :---- | :---- | :---- |
| Pedido | tcPedidoCancelamento | 1-1 |  |
| DataHora | datetime | 1-1 |  |
| Id | tsIdTag |  | Identificador da TAG a ser assinada |

**tcCancelamentoNfse** \- Representa a estrutura completa (pedido \+ confirmação) de cancelamento de NFS-e 234

| (4) Nome | (5) Tipo | (6) Ocorrência | (7) Descrição |
| :---- | :---- | :---- | :---- |
| Confirmacao | tcConfirmacaoCancelamento | 1-1 |  |
| Signature | Dsig:Signature | 0-1 |  |
| versao | tsVersao | 1-1 |  |

**tcRetCancelamento** \- Representa a estrutura de Confirmação de Cancelamento da Nota Fiscal de Serviços Eletrônica assinada 235

| (4) Nome | (5) Tipo | (6) Ocorrência | (7) Descrição |
| :---- | :---- | :---- | :---- |
| NfseCancelamento | tcCancelamentoNfse | 1-1 |  |

**tcInfSubstituicaoNfse** \- Representa os dados de registro de substituição de NFS-e. 236

| (4) Nome | (5) Tipo | (6) Ocorrência | (7) Descrição |
| :---- | :---- | :---- | :---- |
| NfseSubstituidora | tsNumeroNfse | 1-1 |  |
| Id | tsIdTag |  | Identificador da TAG a ser assinada |

**tcSubstituicaoNfse** \- Representa a estrutura de substituição de NFS-e. 237

| (4) Nome | (5) Tipo | (6) Ocorrência | (7) Descrição |
| :---- | :---- | :---- | :---- |
| SubstituicaoNfse | tcInfSubstituicaoNfse | 1-1 | SubstituicaoNfse |
| Signature | dsig:Signature | 0-2 | Signature |
| versao | tsVersao | 1-1 | versao |

**tcCompNfse** \- Representa a estrutura de compartilhamento de dados de uma NFS-e. 238

| (4) Nome | (5) Tipo | (6) Ocorrência | (7) Descrição |
| :---- | :---- | :---- | :---- |
| Nfse | tcNfse | 1-1 |  |
| NfseCancelamento | tcCancelamentoNfse | 0-1 |  |
| NfseSubstituicao | tcSubstituicaoNfse | 0-1 |  |

**tcMensagemRetorno** \- Representa a estrutura de mensagem de retorno de serviço. 239

| (4) Nome | (5) Tipo | (6) Ocorrência | (7) Descrição |
| :---- | :---- | :---- | :---- |
| Codigo | tsCodigoMensagemAlerta | 1-1 |  |
| Mensagem | tsDescricaoMensagemAlerta | 1-1 |  |
| Correcao | tsDescricaoMensagemAlerta | 0-1 |  |

**tcMensagemRetornoLote** \- Representa a estrutura de mensagem de retorno de serviço. 240

| (4) Nome | (5) Tipo | (6) Ocorrência | (7) Descrição |
| :---- | :---- | :---- | :---- |
| IdentificacaoRps | tcIdentificacaoRps | 1-1 |  |
| Codigo | tsCodigoMensagemAlerta | 1-1 |  |
| Mensagem | tsDescricaoMensagemAlerta | 1-1 |  |

**tcLoteRps** \- Representa a estrutura do lote de RPS para fila de processamento 241

| (4) Nome | (5) Tipo | (6) Ocorrência | (7) Descrição |
| :---- | :---- | :---- | :---- |
| NumeroLote | tsNumeroLote | 1-1 |  |
| CpfCnpj | tcCpfCnpj | 1-1 |  |
| InscricaoMunicipal | tsInscricaoMunicipal | 0-1 |  |
| QuantidadeRps | tsQuantidadeRps | 1-1 |  |
| ListaRps |  | 1-1 |  |
| Rps | tcDeclaracaoPrestacaoServico | 1-N |  |
| Id | tsIdTag |  | Identificador da TAG a ser assinada |
| versao | tsVersao | 1-1 |  |

**ListaMensagemRetornoLote** \- Representa a estrutura de mensagem de retorno de serviço. 242

| (4) Nome | (5) Tipo | (6) Ocorrência | (7) Descrição |
| :---- | :---- | :---- | :---- |
| MensagemRetorno | tcMensagemRetornoLote | 1-N |  |

**ListaMensagemRetorno** \- Representa a estrutura de mensagem de retorno de serviço. 243

| (4) Nome | (5) Tipo | (6) Ocorrência | (7) Descrição |
| :---- | :---- | :---- | :---- |
| MensagemRetorno | tcMensagemRetorno | 1-N |  |

**ListaMensagemAlertaRetorno** \- Representa a estrutura de mensagem de retorno de serviço. 244

| (4) Nome | (5) Tipo | (6) Ocorrência | (7) Descrição |
| :---- | :---- | :---- | :---- |
| MensagemRetorno | tcMensagemRetorno | 1-N |  |

**cabecalho** \- Representa a estrutura do cabeçalho

| (4) Nome | (5) Tipo | (6) Ocorrência | (7) Descrição |
| :---- | :---- | :---- | :---- |
| versaoDados | tsVersao | 1-1 |  |
| versao | tsVersao |  |  |

**CompNfse** \- Representa a estrutura da NFS-e. 245

| (4) Nome | (5) Tipo | (6) Ocorrência | (7) Descrição |
| :---- | :---- | :---- | :---- |
| CompNfse | tcCompNfse | 1-1 |  |

#### **4.5 Serviços 246**

A seguir estão os serviços relacionados disponíveis, conforme descritos no item 3.1, no WebService e seus XML Schema. 247 O XML Schema define a estrutura e formatação do arquivo XML que conterá os dados a serem trafegados. 248 Esses documentos serão enviados de forma textual (como uma string) como parâmetros do serviço oferecido pelo Web Service, como descrito em 3.2.1. 249 As tabelas que detalham cada XML Schema estão divididas da seguinte forma: 250

* **(1) Elemento**  
* **(2) Número identificador do campo**  
* **(3) Nome do campo**  
* **(4) Nome do tipo do campo** 251  
*   
* **(5) Indica qual é o campo pai** 252  
*   
* **(6) Quantas vezes o campo se repete** 253  
*   
* **(7) Descreve alguma observação pertinente** 254  
*   
* **(8) Formato de grupo** 255  
*   
* **(9) Identifica os campos ou grupos que farão parte de uma escolha (Choice)** 256  
* 

##### **4.5.1 Recepção de Lote de RPS 257**

Esse serviço será executado, pelo o método RecepcionarLoteRps, passando a mensagem XML como parâmetro com a estrutura definida na tabela que segue. 258

**EnviarLoteRpsEnvio**

| \# | Nome | Tipo | Pai | Ocorrência | Observação |
| :---- | :---- | :---- | :---- | :---- | :---- |
| 1 | EnviarLoteRpsEnvio |  |  |  |  |
|  | LoteRps | tcLoteRps | 1 | 1-1 |  |
|  | Signature | dsig:Signature | 1 | 0-1 |  |

Em resposta a chamada do serviço será devolvida a estrutura definida na tabela a seguir. 259

**EnviarLoteRpsResposta**

| \# | Nome | Tipo | Pai | Ocorrência | Observação |
| :---- | :---- | :---- | :---- | :---- | :---- |
| 1 | EnviarLoteRpsResposta |  |  | 1-1 |  |
|  | NumeroLote | tsNumeroLote | 1 |  | Choice |
|  | DataRecebimento | Datetime | 1 | 1-1 |  |
|  | Protocolo | tsNumeroProtocolo | 1 |  |  |
| 2 | ListaMensagemRetorno | ListaMensagemRetorno | 1 | 1-1 |  |

O lote será processado posteriormente, sendo o seu resultado disponibilizado para consulta. 260

##### **4.5.2 Enviar Lote de RPS Sincrono 261**

Esse serviço será executado, inicialmente, pelo método RecepcionarLoteRpsSincrono, passando a mensagem XML como parâmetro com a estrutura definida na tabela que segue. 262

**EnviarLoteRpsSincronoEnvio**

| \# | Nome | Tipo | Pai | Ocorrência | Observação |
| :---- | :---- | :---- | :---- | :---- | :---- |
| 1 | EnviarLoteRpsSincronoEnvio |  |  | 1-1 |  |
|  | LoteRps | tcLoteRps | 1 | 1-1 |  |
|  | Signature | dsig:Signature | 1 | 0-1 |  |

Em resposta a chamada do serviço será devolvida a estrutura definida na tabela a seguir.

**EnviarLoteRpsSincronoResposta**

| \# | Nome | Tipo | Pai | Ocorrência | Observação |
| :---- | :---- | :---- | :---- | :---- | :---- |
| 1 | EnviarLoteRpsSincronoResposta |  |  | 1-1 |  |
|  | NumeroLote | tsNumeroLote | 1 | 0-1 |  |
|  | DataRecebimento | Datetime | 1 | 0-1 |  |
|  | Protocolo | tsNumeroProtocolo | 1 | 0-1 |  |
| 2 | ListaNfse | ListaNfse | 1 | 1-1 |  |
|  | CompNfse | CompNfse | 2 | 1-N |  |
|  | ListaMensagemAlertaRetorno | ListaMensagemAlertaRetorno | 2 | 0-1 | Choice |
| 3 | ListaMensagemRetorno | ListaMensagemRetorno | 1 | 1-1 |  |
| 4 | ListaMensagemRetornoLote | ListaMensagemRetornoLote | 1 | 1-1 |  |

##### **4.5.3 Geração de NFS-e 263**

Esse serviço será executado, inicialmente, pelo método GerarNfse, passando a mensagem XML como parâmetro com a estrutura definida na tabela que segue. 264

**GerarNfseEnvio**

| \# | Nome | Tipo | Pai | Ocorrência | Observação |
| :---- | :---- | :---- | :---- | :---- | :---- |
| 1 | GerarNfseEnvio |  |  | 1-1 |  |
|  | RPS | tcDeclaracaoPrestacaoServico | 1 | 1-1 |  |

Em resposta a chamada do serviço será devolvida a estrutura definida na tabela a seguir. 265

**GerarNfseResposta**

| \# | Nome | Tipo | Pai | Ocorrência | Observação |
| :---- | :---- | :---- | :---- | :---- | :---- |
| 1 | GerarNfseResposta |  |  | 1-1 |  |
| 2 | ListaNfse | ListaNfse | 1 |  |  |
|  | CompNfse | CompNfse | 2 | 1-1 / 0-1 | Choice |
|  | ListaMensagemAlertaRetorno | ListaMensagemAlertaRetorno | 2 |  |  |
| 2 | ListaMensagemRetorno | ListaMensagemRetorno | 1 | 1-1 |  |

##### **4.5.4 Cancelamento NFS-e 266**

Esse serviço será executado através da chamada ao método CancelarNfse, passando a mensagem XML como parâmetro com a estrutura definida na tabela que segue. 267

**CancelarNfseEnvio**

| \# | Nome | Tipo | Pai | Ocorrência | Observação |
| :---- | :---- | :---- | :---- | :---- | :---- |
| 1 | CancelarNfseEnvio |  |  | 1-1 |  |
|  | Pedido | tcPedidoCancelamento | 1 | 1-1 |  |

Em resposta a chamada do serviço será devolvida a estrutura definida na tabela a seguir. 268

**CancelarNfseResposta**

| \# | Nome | Tipo | Pai | Ocorrência | Observação |
| :---- | :---- | :---- | :---- | :---- | :---- |
| 1 | CancelarNfseResposta |  |  |  |  |
|  | RetCancelamento | tcRetCancelamento | 1 | 1-1 | Choice |
|  | ListaMensagemRetorno | ListaMensagemRetorno | 1 | 1-1 |  |

##### **4.5.5 Substituição NFS-e 269**

Esse serviço será executado pelo método SubstituirNfse, passando a mensagem XML como parâmetro com a estrutura definida na tabela que segue. 270

**SubstituirNfseEnvio**

| \# | Nome | Tipo | Pai | Ocorrência | Observação |
| :---- | :---- | :---- | :---- | :---- | :---- |
| 1 | SubstituirNfseEnvio |  |  |  |  |
| 2 | SubstituicaoNfse |  | 1 | 1-1 |  |
|  | Pedido | tcPedidoCancelamento | 2 | 1-1 |  |
|  | Rps | tcDeclaracaoPrestacaoServico | 2 |  |  |
|  | Id | tsIdTag | 2 | 0-1 |  |
|  | Signature | dsig:Signature | 1 | 0-1 |  |

Em resposta a chamada do serviço será devolvida a estrutura definida na tabela a seguir. 271

**SubstituirNfseResposta**

| \# | Nome | Tipo | Pai | Ocorrência | Observação |
| :---- | :---- | :---- | :---- | :---- | :---- |
| 1 | SubstutuirNfseResposta |  |  |  |  |
| 2 | RetSubstituicao |  | 1 |  |  |
| 3 | NfseSubstituida |  | 2 | 1-1 |  |
|  | CompNfse | CompNfse | 3 | 1-1 |  |
|  | ListaMensagemAlertaRetorno | ListaMensagemAlertaRetorno | 3 | 0-1 | Choice |
| 4 | NfseSubstituidora |  | 2 | 1-1 |  |
|  | CompNfse | CompNfse | 4 | 1-1 |  |
| 5 | ListaMensagemRetorno | ListaMensagemRetorno | 1 | 1-1 |  |

##### **4.5.6 Consulta de Lote de RPS**

Esse serviço será executado pelo método ConsultarLoteRps, passando a mensagem XML como parâmetro com a estrutura definida na tabela que segue.

**ConsultarLoteRpsEnvio**

| \# | Nome | Tipo | Pai | Ocorrência | Observação |
| :---- | :---- | :---- | :---- | :---- | :---- |
| 1 | ConsultarLoteRpsEnvio |  |  | 1-1 |  |
|  | Prestador | tcIdentificacaoPrestador | 1 | 1-1 |  |
|  | Protocolo | tsNumeroProtocolo | 1 | 1-1 |  |

Em resposta a chamada do serviço será devolvida a estrutura definida na tabela a seguir. 272

**ConsultarLoteRpsResposta**

| \# | Nome | Tipo | Pai | Ocorrência | Observação |
| :---- | :---- | :---- | :---- | :---- | :---- |
| 1 | ConsultarLoteRpsResposta |  |  | 1-1 |  |
| 2 | Situação | tsSituacaoLoteRps | 1 | 1-1 |  |
| 3 | ListaNfse | ListaNfse | 1 | 1-1 |  |
|  | CompNfse | CompNfse | 3 | 1-N |  |
|  | ListaMensagemAlertaRetorno | ListaMensagemAlertaRetorno | 3 | 0-1 | Choice |
| 4 | ListaMensagemRetorno | ListaMensagemRetorno | 1 | 1-1 |  |
| 5 | ListaMensagemRetornoLote | ListaMensagemRetornoLote | 1 | 1-1 |  |

##### **4.5.7 Consulta de NFS-e por RPS 273**

Esse serviço será executado pelo método ConsultarNfsePorRps, passando a mensagem XML como parâmetro com a estrutura definida na tabela que segue. 274

**ConsultarNfseRpsEnvio**

| \# | Nome | Tipo | Pai | Ocorrência | Observação |
| :---- | :---- | :---- | :---- | :---- | :---- |
| 1 | ConsultarNfseRpsEnvio |  |  |  |  |
|  | IdentificacaoRps | tcIdentificacaoRps | 1 | 1-1 |  |
|  | Prestador | tcIdentificacaoPrestador | 1 | 1-1 |  |

Em resposta a chamada do serviço será devolvida a estrutura definida na tabela a seguir. 275

**ConsultarNfseRpsResposta**

| \# | Nome | Tipo | Pai | Ocorrência | Observação |
| :---- | :---- | :---- | :---- | :---- | :---- |
| 1 | ConsultarNfseRpsResposta |  |  |  |  |
|  | CompNfse | CompNfse | 1 | 1-1 | Choice |
| 2 | ListaMensagemRetorno | ListaMensagemRetorno | 1 | 1-1 |  |

##### **4.5.8 Consulta de NFS-e \- Serviços Prestados 276**

Esse serviço será executado pelo método ConsultarNfseServicoPrestado, passando a mensagem XML como parâmetro com a estrutura definida na tabela que segue. 277

**ConsultarNfseServicoPrestadoEnvio**

| \# | Nome | Tipo | Pai | Ocorrência | Observação |
| :---- | :---- | :---- | :---- | :---- | :---- |
| 1 | ConsultarNfseEnvio |  |  | 1-1 |  |
|  | Prestador | tcIdentificacaoPrestador | 1 | 1-1 |  |
|  | NumeroNfse | tsNumeroNfse | 1 | 0-1 |  |
| 2 | PeriodoEmissao |  | 1 | 0-1 |  |
|  | DataInicial | date | 2 | 1-1 |  |
|  | DataFinal | date | 2 | 1-1 | Choice |
| 3 | PeriodoCompetencia |  | 1 | 0-1 |  |
|  | DataInicial | date | 3 | 1-1 |  |
|  | DataFinal | date | 3 | 1-1 |  |
|  | Tomador | tcIdentificacaoTomador | 1 | 0-1 |  |
|  | Intermediario | tcIdentificacaoIntermediario | 1 | 0-1 |  |
| 4 | Pagina | tsPagina | 1 | 1-1 |  |

Em resposta a chamada do serviço será devolvida a estrutura definida na tabela a seguir. 278

**ConsultarNfseServicoPrestadoResposta**

| \# | Nome | Tipo | Pai | Ocorrência | Observação |
| :---- | :---- | :---- | :---- | :---- | :---- |
| 1 | ConsultarNfseResposta |  |  | 1-1 |  |
| 2 | ListaNfse |  | 1 | 1-1 |  |
|  | CompNfse | CompNfse | 2 | 1-50 | Choice |
|  | Pagina | tsPagina | 2 | 1-1 |  |
| 3 | ListaMensagemRetorno | ListaMensagemRetorno | 1 | 1-1 |  |

##### **4.5.9 Consulta de NFS-e \- Serviços Tomados ou Intermediados 279**

Esse serviço será executado pelo método ConsultarNfseServicoTomado, passando a mensagem XML como parâmetro com a estrutura definida na tabela que segue. 280

Observação:

1. A identificação do Tomador ou a identificação do Intermediário deve ser igual à identificação do Consulente.  
2. A identificação do Tomador ou a identificação do Intermediário deve ser informada.

**ConsultarNfseServicoTomadoEnvio**

| \# | Nome | Tipo | Pai | Ocorrência | Observação |
| :---- | :---- | :---- | :---- | :---- | :---- |
| 1 | ConsultarNfseEnvio |  |  | 1-1 |  |
|  | Consulente | tcIdentificacaoConsulente | 1 | 1-1 |  |
|  | NumeroNfse | tsNumeroNfse | 1 | 0-1 |  |
| 2 | PeriodoEmissao |  | 1 | 0-1 |  |
|  | DataInicial | date | 2 | 1-1 |  |
|  | DataFinal | date | 2 | 1-1 | Choice |
| 3 | PeriodoCompetencia |  | 1 | 0-1 |  |
|  | DataInicial | date | 3 | 1-1 |  |
|  | DataFinal | date | 3 | 1-1 |  |
|  | Prestador | tcIdentificacaoPrestador | 1 | 0-1 |  |
|  | Tomador | tcIdentificacaoTomador | 1 | 0-1 |  |
|  | Intermediario | tcIdentificacaoIntermediario | 1 | 0-1 |  |
| 4 | Pagina | tsPagina | 1 | 1-1 |  |

Em resposta a chamada do serviço será devolvida a estrutura definida na tabela a seguir. 281

**ConsultarNfseServicoTomadoResposta**

| \# | Nome | Tipo | Pai | Ocorrência | Observação |
| :---- | :---- | :---- | :---- | :---- | :---- |
| 1 | ConsultarNfseResposta |  |  | 1-1 |  |
| 2 | ListaNfse |  | 1 | 1-1 |  |
|  | CompNfse | CompNfse | 2 | 1-50 | Choice |
|  | Pagina | tsPagina | 2 | 1-1 |  |
| 3 | ListaMensagemRetorno | ListaMensagemRetorno | 1 | 1-1 |  |

##### **4.5.10 Consulta de NFS-e por faixa 282**

Esse serviço será executado pelo método ConsultarNfseFaixa, passando a mensagem XML como parâmetro com a estrutura definida na tabela que segue. 283

**ConsultarNfseFaixaEnvio**

| \# | Nome | Tipo | Pai | Ocorrência | Observação |
| :---- | :---- | :---- | :---- | :---- | :---- |
| 1 | ConsultarNfseFaixaEnvio |  |  | 1-1 |  |
|  | Prestador | tcIdentificacaoPrestador | 1 | 1-1 |  |
| 2 | Faixa |  | 1 | 0-1 |  |
|  | NumeroNfseInicial | tsNumeroNfse | 2 | 1-1 |  |
|  | NumeroNfseFinal | tsNumeroNfse | 2 | 1-1 |  |
| 3 | Pagina | tsPagina | 1 | 1-1 |  |

Em resposta a chamada do serviço será devolvida a estrutura definida na tabela a seguir. 284

**ConsultarNfseFaixaResposta**

| \# | Nome | Tipo | Pai | Ocorrência | Observação |
| :---- | :---- | :---- | :---- | :---- | :---- |
| 1 | ConsultarNfseFaixaResposta |  |  | 1-1 |  |
| 2 | ListaNfse |  | 1 | 1-1 |  |
|  | CompNfse | CompNfse | 2 | 1-50 | Choice |
|  | Pagina | tsPagina | 2 | 1-1 |  |
| 3 | ListaMensagemRetorno | ListaMensagemRetorno | 1 | 1-1 |  |

