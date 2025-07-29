/**
 * Aplicação principal do CV
 * Coordena todos os componentes e inicializa o sistema
 */
class CVApplication {
    /**
     * Inicializa a aplicação
     */
    constructor() {
        /** @type {DataManager} Gerenciador de dados */
        this.dataManager = null;

        /** @type {UIManager} Gerenciador de interface */
        this.uiManager = null;

        this.initializeApplication();
    }

    /**
     * Inicializa todos os componentes da aplicação
     */
    async initializeApplication() {
        try {
            console.log('[CVApplication] Iniciando aplicação...');

            // Inicializar gerenciadores
            this.dataManager = new DataManager();
            this.uiManager = new UIManager(this.dataManager);

            // Carregar dados iniciais
            await this.loadInitialData();

            console.log('[CVApplication] Aplicação iniciada com sucesso!');

        } catch (error) {
            console.error('[CVApplication] Erro na inicialização:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * Carrega dados iniciais da aplicação
     */
    async loadInitialData() {
        try {
            this.uiManager.showLoading();

            // Carregar dados em português por padrão
            await this.dataManager.loadCVData('pt');

            // Validar dados carregados
            if (!this.dataManager.validateCVData()) {
                throw new Error('Dados do CV incompletos ou inválidos');
            }

            // Renderizar conteúdo inicial
            this.uiManager.renderAllContent();
            this.uiManager.updateInterfaceTexts();

        } finally {
            this.uiManager.hideLoading();
        }
    }

    /**
     * Manipula erros de inicialização
     * @param {Error} error - Erro ocorrido
     */
    handleInitializationError(error) {
        console.error('[CVApplication] Falha crítica na inicialização:', error);

        // Tentar mostrar erro na interface
        const errorMessage = error.message || 'Erro desconhecido na inicialização';

        // Fallback para alert se UI não estiver disponível
        if (this.uiManager) {
            this.uiManager.showError(`Erro de inicialização: ${errorMessage}`);
        } else {
            alert(`Erro crítico: ${errorMessage}`);
        }
    }

    /**
     * Obtém instância do gerenciador de dados
     * @returns {DataManager} Instância do gerenciador de dados
     */
    getDataManager() {
        return this.dataManager;
    }

    /**
     * Obtém instância do gerenciador de UI
     * @returns {UIManager} Instância do gerenciador de UI
     */
    getUIManager() {
        return this.uiManager;
    }
}

/**
 * Ponto de entrada da aplicação
 * Inicializa quando o DOM estiver pronto
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('[CVApplication] DOM carregado, iniciando aplicação...');

    // Criar instância global da aplicação
    window.cvApp = new CVApplication();
});

// Funções globais para compatibilidade com código legado
window.trocarIdioma = (language) => {
    if (window.cvApp?.getUIManager()) {
        window.cvApp.getUIManager().handleLanguageChange(language);
    }
};

window.toggleTheme = () => {
    if (window.cvApp?.getUIManager()) {
        window.cvApp.getUIManager().toggleTheme();
    }
};

window.exportarPDF = () => {
    if (window.cvApp?.getUIManager()) {
        window.cvApp.getUIManager().handlePDFExport();
    }
};