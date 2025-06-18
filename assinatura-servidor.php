<?php
// ============= ASSINATURA DE XML COM CERTIFICADO A1 =============
// Processa certificado .pfx no servidor e assina XML
// Remove certificado imediatamente após uso por segurança

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    die(json_encode(['erro' => 'Método não permitido']));
}

try {
    // Verificar se recebeu os dados necessários
    if (!isset($_FILES['certificado']) || !isset($_POST['senha']) || !isset($_POST['xml'])) {
        throw new Exception('Dados incompletos: certificado, senha e XML são obrigatórios');
    }
    
    $certificadoFile = $_FILES['certificado'];
    $senha = $_POST['senha'];
    $xml = $_POST['xml'];
    
    // Validar arquivo de certificado
    if ($certificadoFile['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('Erro no upload do certificado');
    }
    
    if (!in_array(strtolower(pathinfo($certificadoFile['name'], PATHINFO_EXTENSION)), ['pfx', 'p12'])) {
        throw new Exception('Arquivo deve ser .pfx ou .p12');
    }
    
    // Ler certificado temporariamente
    $pfxData = file_get_contents($certificadoFile['tmp_name']);
    
    // Tentar abrir o certificado
    $certificados = [];
    if (!openssl_pkcs12_read($pfxData, $certificados, $senha)) {
        throw new Exception('Erro ao ler certificado: senha incorreta ou arquivo inválido');
    }
    
    // Extrair chave privada e certificado
    $privateKey = $certificados['pkey'];
    $certificate = $certificados['cert'];
      // Obter informações do certificado
    $certInfo = openssl_x509_parse($certificate);
    $subject = isset($certInfo['subject']['CN']) ? $certInfo['subject']['CN'] : 'Não identificado';
    $issuer = isset($certInfo['issuer']['CN']) ? $certInfo['issuer']['CN'] : 'Não identificado';
    $validTo = date('Y-m-d H:i:s', $certInfo['validTo_time_t']);
    
    // Verificar se o certificado ainda é válido
    if (time() > $certInfo['validTo_time_t']) {
        throw new Exception('Certificado expirado em ' . $validTo);
    }
    
    // Extrair a parte do XML a ser assinada (InfRps)
    if (!preg_match('/<InfRps[^>]*>(.*?)<\/InfRps>/s', $xml, $matches)) {
        throw new Exception('Tag InfRps não encontrada no XML');
    }
    
    $infRps = $matches[0];
    $infRpsId = 'rps1'; // Extrair do Id se necessário
    
    // Canonicalizar XML (remover espaços extras)
    $xmlCanonicalizado = preg_replace('/>\s+</', '><', trim($infRps));
    
    // Calcular hash SHA-1 (padrão ABRASF)
    $digestValue = base64_encode(sha1($xmlCanonicalizado, true));
    
    // Criar SignedInfo
    $signedInfo = '<SignedInfo xmlns="http://www.w3.org/2000/09/xmldsig#">' .
        '<CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>' .
        '<SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1"/>' .
        '<Reference URI="#' . $infRpsId . '">' .
        '<Transforms>' .
        '<Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/>' .
        '<Transform Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>' .
        '</Transforms>' .
        '<DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"/>' .
        '<DigestValue>' . $digestValue . '</DigestValue>' .
        '</Reference>' .
        '</SignedInfo>';
    
    // Canonicalizar SignedInfo
    $signedInfoCanonicalizado = preg_replace('/>\s+</', '><', $signedInfo);
    
    // Assinar SignedInfo
    $signature = '';
    if (!openssl_sign($signedInfoCanonicalizado, $signature, $privateKey, OPENSSL_ALGO_SHA1)) {
        throw new Exception('Erro ao assinar XML');
    }
    
    $signatureValue = base64_encode($signature);
    
    // Obter certificado em Base64
    $certData = '';
    openssl_x509_export($certificate, $certData);
    $certBase64 = base64_encode($certData);
    
    // Remover headers do certificado
    $certBase64 = str_replace(['-----BEGIN CERTIFICATE-----', '-----END CERTIFICATE-----', "\n", "\r"], '', $certBase64);
    
    // Construir assinatura XML
    $xmlSignature = '<Signature xmlns="http://www.w3.org/2000/09/xmldsig#">' .
        $signedInfo .
        '<SignatureValue>' . $signatureValue . '</SignatureValue>' .
        '<KeyInfo>' .
        '<X509Data>' .
        '<X509Certificate>' . $certBase64 . '</X509Certificate>' .
        '</X509Data>' .
        '</KeyInfo>' .
        '</Signature>';
    
    // Inserir assinatura no XML (antes do fechamento do InfRps)
    $xmlAssinado = str_replace('</InfRps>', $xmlSignature . '</InfRps>', $xml);
    
    // Limpar dados sensíveis da memória
    $pfxData = null;
    $senha = null;
    $privateKey = null;
    
    // Retornar resultado
    echo json_encode([
        'sucesso' => true,
        'xmlAssinado' => $xmlAssinado,
        'certificadoInfo' => [
            'titular' => $subject,
            'emissor' => $issuer,
            'validoAte' => $validTo
        ],
        'timestampAssinatura' => date('Y-m-d H:i:s')
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'sucesso' => false,
        'erro' => $e->getMessage()
    ]);
    
} finally {
    // Garantir que o arquivo temporário seja removido
    if (isset($certificadoFile) && file_exists($certificadoFile['tmp_name'])) {
        unlink($certificadoFile['tmp_name']);
    }
}
?>
