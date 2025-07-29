/**
 * Gerenciador de dados do CV
 * Responsável por carregar, processar e fornecer dados do currículo
 */
class DataManager {
    /**
     * Inicializa o gerenciador de dados
     */
    constructor() {
        /** @type {Object} Dados do CV carregados */
        this.cvData = {};

        /** @type {string} Idioma atual */
        this.currentLanguage = 'pt';

        /** @type {boolean} Estado de carregamento */
        this.isLoading = false;
    }

    /**
     * Carrega dados do CV baseado no idioma especificado
     * @param {string} language - Código do idioma ('pt' ou 'en')
     * @returns {Promise<Object>} Dados do CV carregados
     * @throws {Error} Erro de carregamento de dados
     */
    async loadCVData(language = 'pt') {
        const fileName = AppConfig.DATA_FILES[language];

        if (!fileName) {
            throw new Error(`Idioma não suportado: ${language}`);
        }

        this.isLoading = true;

        try {
            console.log(`[DataManager] Carregando dados de: ${fileName}`);

            const response = await fetch(fileName, {
                cache: 'no-cache',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Falha ao carregar ${fileName}`);
            }

            this.cvData = await response.json();
            this.currentLanguage = language;

            console.log('[DataManager] Dados carregados com sucesso:', this.cvData);

            return this.cvData;

        } catch (error) {
            console.error('[DataManager] Erro ao carregar dados:', error);
            throw new Error(`${AppConfig.INTERFACE_TEXTS[language].errors.dataLoadError}: ${error.message}`);
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Retorna os dados do CV atualmente carregados
     * @returns {Object} Dados do CV
     */
    getCVData() {
        return this.cvData;
    }

    /**
     * Retorna o idioma atual
     * @returns {string} Código do idioma atual
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    /**
     * Verifica se os dados estão carregados
     * @returns {boolean} True se os dados estão carregados
     */
    isDataLoaded() {
        return this.cvData && Object.keys(this.cvData).length > 0;
    }

    /**
     * Verifica se está em processo de carregamento
     * @returns {boolean} True se está carregando
     */
    isDataLoading() {
        return this.isLoading;
    }

    /**
     * Valida se os dados do CV estão completos
     * @returns {boolean} True se os dados são válidos
     */
    validateCVData() {
        const requiredFields = ['nome', 'email', 'links', 'resumo', 'experiencia', 'habilidades', 'formacao', 'certificacoes', 'projetos'];

        return requiredFields.every(field => {
            const hasField = this.cvData.hasOwnProperty(field);
            if (!hasField) {
                console.warn(`[DataManager] Campo obrigatório ausente: ${field}`);
            }
            return hasField;
        });
    }

    /**
     * Obtém dados de uma seção específica
     * @param {string} sectionName - Nome da seção
     * @returns {*} Dados da seção ou null se não encontrada
     */
    getSectionData(sectionName) {
        return this.cvData[sectionName] || null;
    }

    /**
     * Obtém título traduzido de uma seção
     * @param {string} sectionName - Nome da seção
     * @returns {string} Título da seção ou nome da seção se não encontrado
     */
    getSectionTitle(sectionName) {
        return this.cvData.secoes?.[sectionName] || sectionName;
    }
}

// Torna a classe globalmente acessível
window.DataManager = DataManager;