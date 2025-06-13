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

// Configurações de segurança
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, SOAPAction');
header('Content-Type: application/json; charset=utf-8');

// Responder a requisições OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Verificar se é POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método não permitido']);
    exit();
}

try {
    // Ler dados da requisição
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!$data) {
        throw new Exception('Dados JSON inválidos');
    }
    
    // Validar parâmetros obrigatórios
    if (!isset($data['url']) || !isset($data['soapEnvelope'])) {
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
        'webservice.prefeitura.gov.br'
    ];
    
    $urlValida = false;
    foreach ($urlsPermitidas as $dominio) {
        if (strpos($url, $dominio) !== false) {
            $urlValida = true;
            break;
        }
    }
    
    if (!$urlValida) {
        throw new Exception('URL não autorizada para este proxy');
    }
    
    // Preparar headers para a requisição
    $curlHeaders = [
        'Content-Type: text/xml; charset=utf-8',
        'SOAPAction: http://www.abrasf.org.br/nfse.xsd/RecepcionarLoteRps',
        'User-Agent: NFSe-Proxy/1.0'
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
    
    curl_close($ch);
    
    // Verificar erros de cURL
    if ($response === false || !empty($error)) {
        throw new Exception("Erro cURL: $error");
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
