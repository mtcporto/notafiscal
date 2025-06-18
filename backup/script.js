// Sistema de Abas - Controle de navegação
    function switchTab(tabName) {
      // Remover classe active de todos os botões e painéis
      document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
      
      // Ativar o botão e painel selecionados
      const activeButton = document.querySelector(`[onclick="switchTab('${tabName}')"]`);
      const activePanel = document.getElementById(`tab-${tabName}`);
      
      if (activeButton && activePanel) {
        activeButton.classList.add('active');
        activePanel.classList.add('active');
        
        // Scroll suave para o topo da aba
        activePanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Atualizar visibilidade de botões baseado na aba ativa
        updateTabButtonVisibility(tabName);
      }
    }    // Atualizar visibilidade dos botões baseado no estado atual
    function updateTabButtonVisibility(activeTab) {
      const xmlGenerated = document.getElementById('xmlOutput').textContent !== 'Preencha todos os dados e clique em "Gerar XML" na aba anterior para ver o resultado...';
      
      // Botões na aba XML
      const btnToggleXml = document.getElementById('btnToggleXml');
      const btnValidarXML = document.getElementById('btnValidarXML');
      const btnSalvar = document.getElementById('btnSalvar');
      const btnProximoResumo = document.getElementById('btnProximoResumo');
      
      // Botões na aba Resumo
      const btnIrEnvio = document.getElementById('btnIrEnvio');
      
      // Botões na aba Envio
      const btnEnviarWebservice = document.getElementById('btnEnviarWebservice');
      const btnNovaRps = document.getElementById('btnNovaRps');
      
      if (xmlGenerated) {
        if (btnToggleXml) btnToggleXml.style.display = 'inline-block';
        if (btnValidarXML) btnValidarXML.style.display = 'inline-block';
        if (btnSalvar) btnSalvar.style.display = 'inline-block';
        if (btnProximoResumo) btnProximoResumo.style.display = 'inline-block';
        if (btnIrEnvio) btnIrEnvio.style.display = 'inline-block';
        if (btnEnviarWebservice) btnEnviarWebservice.style.display = 'inline-block';
      } else {
        if (btnToggleXml) btnToggleXml.style.display = 'none';
        if (btnValidarXML) btnValidarXML.style.display = 'none';
        if (btnSalvar) btnSalvar.style.display = 'none';
        if (btnProximoResumo) btnProximoResumo.style.display = 'none';
        if (btnIrEnvio) btnIrEnvio.style.display = 'none';
        if (btnEnviarWebservice) btnEnviarWebservice.style.display = 'none';
      }
        // Auto-display full XML when user reaches XML tab
      if (activeTab === 'xml' && xmlGenerated) {
        const xmlOutput = document.getElementById('xmlOutput');
        const btnToggle = document.getElementById('btnToggleXml');
        if (xmlOutput && btnToggle) {
          xmlOutput.style.display = 'block';
          btnToggle.innerHTML = '<i class="fas fa-list"></i> Ver Resumo da NFS-e';
        }
      }
      
      // Indicador de progresso nas abas
      updateTabProgress();
    }

    // Atualizar indicadores de progresso das abas
    function updateTabProgress() {
      const prestadorValid = validarAba('prestador');
      const tomadorValid = validarAba('tomador');
      const servicoValid = validarAba('servico');
      const xmlGenerated = document.getElementById('xmlOutput').textContent !== 'Preencha todos os dados e clique em "Gerar XML" na aba anterior para ver o resultado...';
      
      // Limpar indicadores anteriores
      document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('tab-completed', 'tab-current', 'tab-pending');
      });
      
      // Marcar progresso
      if (prestadorValid) document.querySelector('[onclick="switchTab(\'prestador\')"]').classList.add('tab-completed');
      if (tomadorValid) document.querySelector('[onclick="switchTab(\'tomador\')"]').classList.add('tab-completed');
      if (servicoValid) document.querySelector('[onclick="switchTab(\'servico\')"]').classList.add('tab-completed');
      if (xmlGenerated) {
        document.querySelector('[onclick="switchTab(\'xml\')"]').classList.add('tab-completed');
        document.querySelector('[onclick="switchTab(\'resumo\')"]').classList.add('tab-completed');
      }
    }    // === VALIDAÇÃO MOVIDA PARA dados.js ===
    
    // === AUTO-AVANÇO MOVIDO PARA dados.js ===

    // Toggle Dark Mode
    function toggleDarkMode() {
      const body = document.body;
      const toggleButton = document.querySelector('.dark-mode-toggle');
      
      body.classList.toggle('dark-mode');
      
      if (body.classList.contains('dark-mode')) {
        toggleButton.innerHTML = '<i class="fas fa-sun"></i> Modo Claro';
        localStorage.setItem('darkMode', 'enabled');
      } else {
        toggleButton.innerHTML = '<i class="fas fa-moon"></i> Modo Escuro';
        localStorage.setItem('darkMode', 'disabled');
      }
    }
    
    // === VALIDAÇÃO PRINCIPAL MOVIDA PARA dados.js ===
    
    // === DADOS MOCADOS MOVIDOS PARA dados.js ===
    
    // === CONTROLE DE FORMULÁRIO MOVIDO PARA dados.js ===
    
    // === FORMATAÇÃO DE MOEDA MOVIDA PARA dados.js ===
    
    // === FORMATAÇÃO DE DOCUMENTOS MOVIDA PARA dados.js ===
      // === GERAÇÃO DE RESUMO MOVIDA PARA resumo.js ===

    // === TOGGLE XML MOVIDO PARA xml.js ===
    
    // === CONFIGURAÇÕES MOVIDAS PARA configuracao.js ===
    
    // === TESTES DE CERTIFICADOS MOVIDOS PARA configuracao.js ===
    
    // === VALIDAÇÃO A1 MOVIDA PARA configuracao.js ===
      // === VALIDAÇÃO XML MOVIDA PARA xml.js ===
    
    // === ENVIO PARA WEBSERVICE MOVIDO PARA envio.js ===// === VALIDAÇÃO ANTES DO ENVIO MOVIDA PARA xml.js ===
      // === INCREMENTO DE NÚMERO RPS MOVIDO PARA resumo.js ===
    // === STATUS DE ENVIO MOVIDO PARA resumo.js ===
      // === ENVIO PARA WEBSERVICE MOVIDO PARA envio.js ===

    // === SIMULAÇÃO DE ENVIO MOVIDA PARA envio.js ===

    // === ASSINATURA DIGITAL MOVIDA PARA envio.js ===

    // === SISTEMA DE MONITORAMENTO MOVIDO PARA configuracao.js ===
      // === VALIDAÇÃO DE CERTIFICADO MOVIDA PARA envio.js ===

    // === TRATAMENTO DE ERROS MOVIDO PARA envio.js ===

    // === FUNÇÃO SLEEP MOVIDA PARA envio.js ===// === ATUALIZAÇÃO DE PASSOS MOVIDA PARA resumo.js ===    // === GERAÇÃO DE NÚMEROS MOVIDA PARA resumo.js ===
      // === CÓDIGO DE VERIFICAÇÃO MOVIDO PARA resumo.js ===    // === EXIBIÇÃO DE RESULTADOS MOVIDA PARA resumo.js ===    // === AÇÕES PÓS-ENVIO MOVIDAS PARA resumo.js ===

    // === GERAÇÃO XML MOVIDA PARA xml.js ===

    // === PAINEL DE STATUS MOVIDO PARA configuracao.js ===    // Aplicar modo escuro como padrão e configurar event listeners
    document.addEventListener('DOMContentLoaded', function() {
      const darkMode = localStorage.getItem('darkMode');
      const toggleButton = document.querySelector('.dark-mode-toggle');
      
      // Se nunca foi configurado antes, definir dark mode como padrão
      if (darkMode === null) {
        localStorage.setItem('darkMode', 'enabled');
        // O body já tem a classe dark-mode por padrão no HTML
      } else if (darkMode === 'disabled') {
        // Se o usuário escolheu desabilitar, remover dark mode
        document.body.classList.remove('dark-mode');
        toggleButton.innerHTML = '<i class="fas fa-moon"></i> Modo Escuro';
      }
      // Se darkMode === 'enabled', manter como está (dark-mode já aplicado no HTML)
        // Event listener para mudança no tipo de documento
      document.getElementById('tipoDocTomador').addEventListener('change', atualizarPlaceholderDocumento);
        // Prevenir submit padrão dos formulários das abas
      const forms = ['nfse-form-prestador', 'nfse-form-tomador', 'nfse-form-servico'];
      forms.forEach(formId => {
        const form = document.getElementById(formId);
        if (form) {
          form.addEventListener('submit', function(e) {
            e.preventDefault();
            gerarXML();
          });
        }
      });
      
      // Event listeners para os botões
      document.getElementById('btnValidar').addEventListener('click', function() {
        if (validarFormulario()) {
          document.getElementById('validationResults').innerHTML = 
            '<div class="validation-success">Todos os dados estão válidos!</div>';
        } else {
          document.getElementById('validationResults').innerHTML = 
            '<div class="validation-error">Existem erros no formulário. Verifique os campos destacados.</div>';
        }
        document.getElementById('validationResults').style.display = 'block';
      });

      // Botão Limpar
      document.getElementById('btnLimpar').addEventListener('click', limparFormulario);      // Botão Dados de Teste
      document.getElementById('btnMockData').addEventListener('click', function() {
        console.log('Botão Dados de Teste clicado'); // Debug
        preencherDadosMocados();
      });
      
      // Botão Dados Pixel Vivo
      document.getElementById('btnDadosPixelVivo').addEventListener('click', function() {
        console.log('Botão Dados Pixel Vivo clicado'); // Debug
        preencherDadosPixelVivo();
      });// Botão Salvar XML (agora usa função do xml.js)
      document.getElementById('btnSalvar').addEventListener('click', salvarXML);        // Botão Validar XML (agora usa função do xml.js)
      document.getElementById('btnValidarXML').addEventListener('click', validarXMLOffline);
      
      // Botão Enviar para Webservice
      document.getElementById('btnEnviarWebservice').addEventListener('click', enviarParaWebservice);
      
      // Botão Testar Endpoints
      document.getElementById('btnTestarEndpoints').addEventListener('click', testarMultiplosEndpoints);
      
      // Botão Configurações
      document.getElementById('btnConfiguracoes').addEventListener('click', abrirModal);      // Event listeners para botões específicos das abas
      // Aba Serviço
      document.getElementById('btnValidarServico').addEventListener('click', function() {
        if (validarAba('servico')) {
          autoAdvanceTab('servico');
        }
      });

      // Botão Gerar XML na aba de serviço
      const btnGerarXML = document.getElementById('btnGerarXML');
      if (btnGerarXML) {
        console.log('✅ Botão btnGerarXML encontrado, adicionando event listener');
        btnGerarXML.addEventListener('click', function(e) {
          console.log('🔘 Botão Gerar XML clicado!');
          e.preventDefault();
          try {
            if (typeof gerarXML === 'function') {
              console.log('✅ Função gerarXML encontrada, executando...');
              gerarXML();
            } else {
              console.error('❌ Função gerarXML não encontrada');
              alert('Erro: Função gerarXML não está disponível. Verifique se o módulo xml.js foi carregado.');
            }
          } catch (error) {
            console.error('❌ Erro ao executar gerarXML:', error);
            alert('Erro ao gerar XML: ' + error.message);
          }
        });
      } else {
        console.error('❌ Botão btnGerarXML não encontrado no DOM');
      }
      
      // Aba Resumo
      document.getElementById('btnIrEnvio').addEventListener('click', function() {
        switchTab('envio');
      });
      
      // Aba Envio
      document.getElementById('btnNovaRps').addEventListener('click', function() {
        if (confirm('Isso irá limpar todos os dados atuais. Deseja continuar?')) {
          limparFormulario();
          switchTab('prestador');
        }
      });
      
      // Event listeners do modal
      document.getElementById('tipoCertificado').addEventListener('change', alternarTipoCertificado);
      document.getElementById('btnTestarCertificado').addEventListener('click', testarCertificado);
      document.getElementById('btnTestarWebservice').addEventListener('click', testarWebservice);
      document.getElementById('btnSalvarConfig').addEventListener('click', salvarConfiguracoes);      // Inicializar o sistema de monitoramento de certificados (agora em configuracao.js)
      if (typeof initializeCertificateMonitoring === 'function') {
        initializeCertificateMonitoring();
      }
        // Inicializar primeira aba como ativa
      switchTab('prestador');
      
      // === SISTEMA INICIALIZADO ===
      console.log('✅ NFS-e System loaded successfully!');
      console.log('📋 Modules loaded:');
      console.log('   - configuracao.js (Configuration & Certificates)');
      console.log('   - dados.js (Data Validation & Formatting)');  
      console.log('   - xml.js (XML Generation & Validation)');
      console.log('   - resumo.js (Summary & Status Display)');
      console.log('   - envio.js (Webservice & Digital Signature)');
      console.log('   - script.js (Main Controller)');
      console.log('🎉 System ready for use!');
    });
    
    // Botão Testar Worker
      document.getElementById('btnTestarWorker').addEventListener('click', async function() {
        console.log('Botão Testar Worker clicado');
        
        try {
          const workerUrl = 'https://nfse.mosaicoworkers.workers.dev/';
          
          document.getElementById('validationResults').innerHTML = 
            '<div class="validation-info">🔄 Testando Worker Cloudflare...</div>';
          document.getElementById('validationResults').style.display = 'block';
          
          // Teste 1: GET (verificar se está online)
          const getResponse = await fetch(workerUrl);
          const getData = await getResponse.json();
          
          console.log('✅ Worker GET test:', getData);
          
          // Teste 2: POST simples
          const testPayload = {
            url: 'https://httpbin.org/post',
            soapEnvelope: '<?xml version="1.0"?><test>Hello Worker</test>',
            headers: { 'Content-Type': 'text/xml' }
          };
          
          const postResponse = await fetch(workerUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testPayload)
          });
          
          const postData = await postResponse.json();
          console.log('✅ Worker POST test:', postData);
          
          document.getElementById('validationResults').innerHTML = 
            `<div class="validation-success">
              ✅ Worker Cloudflare funcionando!<br>
              📡 URL: ${workerUrl}<br>
              ⏰ Resposta em: ${getData.timestamp}<br>
              🔄 Teste POST: ${postData.success ? 'Sucesso' : 'Falha'}
            </div>`;
            
        } catch (error) {
          console.error('❌ Erro no teste do Worker:', error);
          document.getElementById('validationResults').innerHTML = 
            `<div class="validation-error">
              ❌ Erro no Worker: ${error.message}<br>
              Verifique se o Worker está ativo em workers.cloudflare.com
            </div>`;
        }
      });
