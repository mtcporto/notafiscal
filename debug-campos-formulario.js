// SCRIPT DE DEBUG PARA VERIFICAR IDS DOS CAMPOS
console.log('🔍 DEBUG: Verificando IDs dos campos do formulário');

function verificarCamposFormulario() {
    console.log('\n📋 VERIFICAÇÃO DE CAMPOS:');
    console.log('=========================');
    
    const campos = [
        'cnpjPrestador',
        'imPrestador', 
        'razaoPrestador',
        'tipoDocTomador',
        'docTomador',
        'razaoTomador',
        'valor',
        'itemServico',
        'descricao'
    ];
    
    campos.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            console.log(`✅ ${id}: "${elemento.value || '(vazio)'}"`);
        } else {
            console.log(`❌ ${id}: ELEMENTO NÃO ENCONTRADO`);
        }
    });
    
    console.log('\n🎯 CAMPOS ENCONTRADOS NO DOM:');
    const inputs = document.querySelectorAll('input[id], select[id], textarea[id]');
    inputs.forEach(input => {
        if (input.id) {
            console.log(`📌 ID: ${input.id}, Tipo: ${input.type || input.tagName}, Valor: "${input.value || '(vazio)'}"`);
        }
    });
}

// Executar quando carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', verificarCamposFormulario);
} else {
    verificarCamposFormulario();
}

// Função global para executar via console
window.verificarCamposFormulario = verificarCamposFormulario;

console.log('📌 Execute: verificarCamposFormulario() no console para ver os campos');
