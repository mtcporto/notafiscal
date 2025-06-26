// Script para verificar a estrutura do XML assinado
// Salvar o XML em um arquivo para análise detalhada

// Adicionar ao final do processo de assinatura
function salvarXMLParaAnalise(xml) {
  const blob = new Blob([xml], { type: 'text/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'xml-assinado-debug.xml';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Adicionar ao escopo global
window.salvarXMLParaAnalise = salvarXMLParaAnalise;
