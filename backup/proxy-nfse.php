<?php
/**
 * Proxy para NFS-e - Contorna limitações de CORS
 * 
 * Este arquivo permite que o sistema web acesse webservices
 * SOAP que não possuem headers CORS adequados.
 * 
 * IMPORTANTE: Use apenas em ambiente de desenvolvimento/teste.
 * Para produção, configure o webservice com headers CORS adequados.
 */

// Log de debug para diagnóstico
error_log("Proxy NFS-e - Método: " . $_SERVER['REQUEST_METHOD']);
error_log("Proxy NFS-e - Content-Type: " . (isset($_SERVER['CONTENT_TYPE']) ? $_SERVER['CONTENT_TYPE'] : 'não definido'));
error_log("Proxy NFS-e - User-Agent: " . (isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : 'não definido'));

// Configurações de segurança
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, SOAPAction, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

// Responder a requisições OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Verificar se é POST ou GET (GET para teste)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Endpoint de teste para verificar se o proxy está funcionando
    echo json_encode([
        'success' => true, 
        'message' => 'Proxy NFS-e está funcionando!',
        'timestamp' => date('c'),
        'version' => '2.0',
        'php_version' => PHP_VERSION
    ]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método não permitido. Use POST para enviar dados ou GET para teste.']);
    exit();
}

try {
    // Ler dados da requisição
    $input = file_get_contents('php://input');
    error_log("Proxy NFS-e - Input recebido: " . substr($input, 0, 200) . "...");
    
    $data = json_decode($input, true);
    
    if (!$data) {
        error_log("Proxy NFS-e - Erro: Dados JSON inválidos. Input: " . $input);
        throw new Exception('Dados JSON inválidos. Verifique se está enviando JSON válido.');
    }
    
    // Log dos dados recebidos
    error_log("Proxy NFS-e - Dados decodificados: " . print_r(array_keys($data), true));
    
    // Validar parâmetros obrigatórios
    if (!isset($data['url']) || !isset($data['soapEnvelope'])) {
        error_log("Proxy NFS-e - Parâmetros faltando. Recebidos: " . implode(', ', array_keys($data)));
        throw new Exception('Parâmetros obrigatórios ausentes (url, soapEnvelope)');
    }
      $url = $data['url'];
    $soapEnvelope = $data['soapEnvelope'];
    $headers = isset($data['headers']) ? $data['headers'] : array();
    
    // Validar URL
    if (!filter_var($url, FILTER_VALIDATE_URL)) {
        throw new Exception('URL inválida');
    }
    
    // Verificar se a URL é de um webservice conhecido/permitido
    $urlsPermitidas = [
        'joaopessoa.pb.gov.br',
        'serem-hml.joaopessoa.pb.gov.br',
        'nfse.prefeitura.gov.br',
        'webservice.prefeitura.gov.br',
        'notafiscal-abrasfv203-ws',
        'NotaFiscalSoap',
        'localhost',
        '127.0.0.1'
    ];
    
    // Log da URL para debug
    error_log("Proxy NFS-e - URL recebida: " . $url);
    
    $urlValida = false;
    foreach ($urlsPermitidas as $dominio) {
        if (strpos($url, $dominio) !== false) {
            $urlValida = true;
            error_log("Proxy NFS-e - URL autorizada pelo domínio: " . $dominio);
            break;
        }
    }
    
    if (!$urlValida) {
        error_log("Proxy NFS-e - URL rejeitada: " . $url);
        throw new Exception('URL não autorizada para este proxy. URL: ' . $url);
    }
      // Preparar headers para a requisição
    $curlHeaders = [
        'Content-Type: text/xml; charset=utf-8',
        'SOAPAction: ""',  // SOAPAction vazio conforme WSDL
        'User-Agent: NFSe-Proxy/1.0',
        'Accept: text/xml'
    ];
    
    // Adicionar headers customizados se fornecidos
    foreach ($headers as $name => $value) {
        if (strtolower($name) !== 'host') { // Não sobrescrever host
            $curlHeaders[] = "$name: $value";
        }
    }
    
    // Inicializar cURL
    $ch = curl_init();
    
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $soapEnvelope,
        CURLOPT_HTTPHEADER => $curlHeaders,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
        CURLOPT_FOLLOWLOCATION => false,
        CURLOPT_MAXREDIRS => 0,
        CURLOPT_USERAGENT => 'NFSe-Proxy/1.0 (PHP/' . PHP_VERSION . ')'
    ]);
    
    // Executar requisição
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
    $error = curl_error($ch);
    
    curl_close($ch);    // Verificar erros de cURL
    if ($response === false || !empty($error)) {
        // Se der erro, tentar novamente sem validação SSL rigorosa (ambiente de teste)
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $soapEnvelope,
            CURLOPT_HTTPHEADER => $curlHeaders,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_SSL_VERIFYPEER => false,  // Desabilitar verificação SSL para teste
            CURLOPT_SSL_VERIFYHOST => 0,      // Desabilitar verificação de host para teste
            CURLOPT_FOLLOWLOCATION => false,
            CURLOPT_MAXREDIRS => 0,
            CURLOPT_USERAGENT => 'NFSe-Proxy/1.0 (PHP/' . PHP_VERSION . ')',
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
        $error = curl_error($ch);
        curl_close($ch);
        
        if ($response === false || !empty($error)) {
            throw new Exception("Erro cURL (tentativa 2): $error");
        }
    }
    
    // Log do resultado para debug
    error_log("Proxy NFS-e - HTTP Code: $httpCode, Content-Type: $contentType, Response Length: " . strlen($response));    // Verificar códigos de erro HTTP
    if ($httpCode === 404) {
        // ESPECIAL PARA JOÃO PESSOA: Forçar processamento mesmo com 404
        if (strpos($url, 'joaopessoa.pb.gov.br') !== false) {
            error_log("Proxy NFS-e - João Pessoa detectado, processando resposta mesmo com HTTP 404");
            error_log("Proxy NFS-e - Resposta recebida: " . substr($response, 0, 500));
            
            // João Pessoa sempre processa a resposta, mesmo com HTTP 404
            // Continuar para retornar a resposta normalmente
            
        } elseif (!empty($response) && (strpos($response, '<?xml') !== false || 
            strpos($response, '<soap') !== false || 
            strpos($response, 'assinatura') !== false)) {
            // Há resposta SOAP válida, continuar processamento normal
            error_log("Proxy NFS-e - HTTP 404 mas com resposta SOAP válida, continuando...");
            // NÃO fazer throw, continuar para processar a resposta
        } else {
            // Se realmente não há resposta útil, só então reportar erro
            throw new Exception("Webservice retornou HTTP 404 sem conteúdo SOAP. 

Possíveis causas:
1. URL incorreta: $url
2. Endpoint exige autenticação/certificado
3. Método POST não permitido sem dados válidos
4. Webservice rejeita requests malformados

Dica: Teste primeiro se ?wsdl está acessível em: {$url}?wsdl");
        }
    }
      if ($httpCode >= 400 && $httpCode !== 404) {
        // Para códigos diferentes de 404, mostrar erro
        // (404 é tratado especialmente acima)
        $errorMsg = "Erro HTTP $httpCode";
        if ($response) {
            $errorMsg .= ": " . substr($response, 0, 200);
        }
        throw new Exception($errorMsg);
    }
    
    // FORÇAR PROCESSAMENTO para João Pessoa 
    // O webservice de João Pessoa funciona mas retorna códigos não-padrão
    if (strpos($url, 'joaopessoa.pb.gov.br') !== false) {
        error_log("Proxy NFS-e - Forçando processamento para João Pessoa, HTTP: $httpCode");
        // Continuar processamento independente do código HTTP
    } elseif ($httpCode >= 400) {
        $errorMsg = "Erro HTTP $httpCode";
        if ($response) {
            $errorMsg .= ": " . substr($response, 0, 200);
        }
        throw new Exception($errorMsg);
    }
    
    // Log da requisição (apenas em desenvolvimento)
    if (isset($_GET['debug'])) {
        error_log("NFSe Proxy - URL: $url, HTTP Code: $httpCode, Content-Type: $contentType");
    }
    
    // Retornar resposta
    echo json_encode([
        'success' => true,
        'response' => $response,
        'httpCode' => $httpCode,
        'contentType' => $contentType,
        'timestamp' => date('c')
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'timestamp' => date('c')
    ]);
}
?>
