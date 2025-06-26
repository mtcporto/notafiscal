// Script para encontrar erro de sintaxe
const fs = require('fs');

try {
  const content = fs.readFileSync('envio.js', 'utf8');
  
  // Dividir o arquivo em linhas
  const lines = content.split('\n');
  
  // Tentar fazer parsing linha por linha até encontrar o erro
  let partialContent = '';
  
  for (let i = 0; i < lines.length; i++) {
    partialContent += lines[i] + '\n';
    
    try {
      // Tentar fazer parsing da parte do código até agora
      new Function(partialContent);
    } catch (error) {
      if (error instanceof SyntaxError) {
        console.log(`❌ Erro de sintaxe na linha ${i + 1}:`);
        console.log(`Linha: ${lines[i]}`);
        console.log(`Erro: ${error.message}`);
        
        // Mostrar algumas linhas ao redor
        const start = Math.max(0, i - 3);
        const end = Math.min(lines.length - 1, i + 3);
        console.log('\nContexto:');
        for (let j = start; j <= end; j++) {
          const marker = j === i ? '>>> ' : '    ';
          console.log(`${marker}${j + 1}: ${lines[j]}`);
        }
        break;
      }
    }
  }
} catch (error) {
  console.error('Erro ao ler arquivo:', error.message);
}
