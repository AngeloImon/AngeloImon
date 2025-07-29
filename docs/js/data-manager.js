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
        // Usar a função do config para obter URL correta
        const fileUrl = AppConfig.getDataFileUrl(language);

        if (!fileUrl) {
            throw new Error(`Idioma não suportado: ${language}`);
        }

        this.isLoading = true;

        try {
            if (AppConfig.DEBUG) {
                console.log(`[DataManager] Carregando dados de: ${fileUrl}`);
            }

            const response = await fetch(fileUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                },
                cache: 'no-cache'
            });

            if (AppConfig.DEBUG) {
                console.log(`[DataManager] Response status: ${response.status}`);
                console.log(`[DataManager] Response headers:`, response.headers);
            }

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(`Arquivo não encontrado: ${fileUrl}`);
                }
                throw new Error(`HTTP ${response.status}: Falha ao carregar ${fileUrl}`);
            }

            const responseText = await response.text();
            if (AppConfig.DEBUG) {
                console.log(`[DataManager] Response text length: ${responseText.length}`);
            }

            try {
                this.cvData = JSON.parse(responseText);
            } catch (parseError) {
                console.error('[DataManager] Erro ao parsear JSON:', parseError);
                throw new Error(`Arquivo JSON inválido: ${parseError.message}`);
            }

            this.currentLanguage = language;

            if (AppConfig.DEBUG) {
                console.log('[DataManager] Dados carregados com sucesso:', this.cvData);
            }

            return this.cvData;

        } catch (error) {
            console.error('[DataManager] Erro ao carregar dados:', error);

            // Tentar URLs alternativos
            if (!fileUrl.includes('github.io')) {
                console.log('[DataManager] Tentando URL alternativo...');
                return this.tryAlternativeUrls(language);
            }

            throw new Error(`${AppConfig.INTERFACE_TEXTS[language].errors.dataLoadError}: ${error.message}`);
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Tenta URLs alternativos se o primeiro falhar
     * @param {string} language - Idioma
     * @returns {Promise<Object>} Dados carregados
     */
    async tryAlternativeUrls(language) {
        const alternativeUrls = [
            `https://raw.githubusercontent.com/AngeloImon/AngeloImon/main/DOCS/${AppConfig.DATA_FILES[language]}`,
            `https://angeloimon.github.io/AngeloImon/DOCS/${AppConfig.DATA_FILES[language]}`,
            `./${AppConfig.DATA_FILES[language]}`, // URL relativa local
        ];

        for (const url of alternativeUrls) {
            try {
                console.log(`[DataManager] Tentando URL alternativo: ${url}`);

                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Cache-Control': 'no-cache'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    this.cvData = data;
                    this.currentLanguage = language;
                    console.log(`[DataManager] Sucesso com URL: ${url}`);
                    return data;
                }
            } catch (error) {
                console.log(`[DataManager] Falhou URL ${url}:`, error.message);
                continue;
            }
        }

        throw new Error('Nenhuma URL de dados funcionou');
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