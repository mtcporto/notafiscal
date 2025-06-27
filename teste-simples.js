// Teste simples da assinatura
console.log('🔧 Teste simples de assinatura');

// Simular a chamada principal que seria feita pelo sistema
async function testeRapido() {
    try {
        // Importar as funções necessárias
        const script = document.createElement('script');
        script.src = './assinatura-simples.js';
        document.head.appendChild(script);
        
        // Aguardar carregamento
        await new Promise(resolve => {
            script.onload = resolve;
        });
        
        console.log('✅ Script carregado');
        
        // Testar se a função principal existe
        if (typeof assinarXMLCompleto === 'function') {
            console.log('✅ Função assinarXMLCompleto disponível');
        } else {
            console.log('❌ Função assinarXMLCompleto não encontrada');
        }
        
    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
}

// Se estivermos no Node.js, simular ambiente DOM
if (typeof window === 'undefined') {
    console.log('📝 Executando no Node.js - simulando DOM...');
    global.document = {
        createElement: () => ({ onload: null }),
        head: { appendChild: () => {} }
    };
    global.window = {};
}

testeRapido();
