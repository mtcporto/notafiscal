// Script melhorado para encontrar erro de sintaxe
const fs = require('fs');

try {
  const content = fs.readFileSync('envio.js', 'utf8');
  
  // Dividir o arquivo em linhas
  const lines = content.split('\n');
  
  // Truncar o arquivo linha por linha a partir do final para encontrar onde para de dar erro
  for (let i = lines.length - 1; i >= 0; i--) {
    const partialContent = lines.slice(0, i + 1).join('\n');
    
    try {
      // Tentar fazer parsing
      new Function(partialContent);
      console.log(`✅ Código válido até a linha ${i + 1}: ${lines[i]}`);
      
      // Se chegou aqui, o erro está após esta linha
      if (i < lines.length - 1) {
        console.log(`❌ Erro começa na linha ${i + 2}: ${lines[i + 1]}`);
        
        // Mostrar contexto ao redor do erro
        const start = Math.max(0, i - 2);
        const end = Math.min(lines.length - 1, i + 5);
        console.log('\nContexto do erro:');
        for (let j = start; j <= end; j++) {
          const marker = j === i + 1 ? '>>> ' : '    ';
          console.log(`${marker}${j + 1}: ${lines[j]}`);
        }
      }
      break;
    } catch (error) {
      // Continue removendo linhas até encontrar onde para de dar erro
      continue;
    }
  }
} catch (error) {
  console.error('Erro ao ler arquivo:', error.message);
}
