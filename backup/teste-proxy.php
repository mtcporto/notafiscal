<?php
echo "Testando proxy NFS-e...\n";

$ch = curl_init('http://localhost/mt/notafiscal/proxy-nfse.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$result = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
echo "Resposta: $result\n";
?>
