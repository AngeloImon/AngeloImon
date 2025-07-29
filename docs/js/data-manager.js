/**
 * Gerenciador de dados do CV
 */
class DataManager {
    constructor() {
        this.cvData = {};
        this.currentLanguage = 'pt';
        this.isLoading = false;
    }

    /**
     * Carrega dados do CV com múltiplas tentativas de URL
     * @param {string} language - Código do idioma ('pt' ou 'en')
     * @returns {Promise<Object>} Dados do CV carregados
     */
    async loadCVData(language = 'pt') {
        this.isLoading = true;

        // URLs para tentar em ordem de prioridade
        const urlsToTry = [
            // URL principal (docs minúsculo)
            `https://angeloimon.github.io/AngeloImon/docs/${AppConfig.DATA_FILES[language]}`,
            // URL alternativa (DOCS maiúsculo)
            `https://angeloimon.github.io/AngeloImon/DOCS/${AppConfig.DATA_FILES[language]}`,
            // Raw GitHub
            `https://raw.githubusercontent.com/AngeloImon/AngeloImon/main/docs/${AppConfig.DATA_FILES[language]}`,
            `https://raw.githubusercontent.com/AngeloImon/AngeloImon/main/DOCS/${AppConfig.DATA_FILES[language]}`,
            // Desenvolvimento local
            `./${AppConfig.DATA_FILES[language]}`
        ];

        try {
            console.log(`[DataManager] Tentando carregar dados em ${language}`);

            for (let i = 0; i < urlsToTry.length; i++) {
                const url = urlsToTry[i];

                try {
                    console.log(`[DataManager] Tentativa ${i + 1}: ${url}`);

                    const response = await fetch(url, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            'Cache-Control': 'no-cache',
                            'Pragma': 'no-cache'
                        },
                        cache: 'no-cache'
                    });

                    console.log(`[DataManager] Response status: ${response.status} para ${url}`);

                    if (response.ok) {
                        const responseText = await response.text();

                        if (responseText.trim() === '') {
                            console.warn(`[DataManager] Resposta vazia de ${url}`);
                            continue;
                        }

                        try {
                            this.cvData = JSON.parse(responseText);
                            this.currentLanguage = language;

                            console.log(`[DataManager] ✅ Sucesso com URL: ${url}`);
                            console.log('[DataManager] Dados carregados:', this.cvData);

                            return this.cvData;

                        } catch (parseError) {
                            console.error(`[DataManager] Erro de parse JSON em ${url}:`, parseError);
                            continue;
                        }
                    } else {
                        console.warn(`[DataManager] HTTP ${response.status} em ${url}`);
                    }

                } catch (fetchError) {
                    console.warn(`[DataManager] Erro de fetch em ${url}:`, fetchError.message);
                    continue;
                }
            }

            // Se chegou aqui, nenhuma URL funcionou
            throw new Error('Nenhuma URL de dados funcionou. Verifique se os arquivos cv.json e cv.en.json existem no repositório.');

        } catch (error) {
            console.error('[DataManager] Erro final:', error);
            throw new Error(`${AppConfig.INTERFACE_TEXTS[language].errors.dataLoadError}: ${error.message}`);
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Retorna os dados do CV atualmente carregados
     */
    getCVData() {
        return this.cvData;
    }

    /**
     * Retorna o idioma atual
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    /**
     * Verifica se os dados estão carregados
     */
    isDataLoaded() {
        return this.cvData && Object.keys(this.cvData).length > 0;
    }

    /**
     * Verifica se está em processo de carregamento
     */
    isDataLoading() {
        return this.isLoading;
    }

    /**
     * Valida se os dados do CV estão completos
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
     */
    getSectionData(sectionName) {
        return this.cvData[sectionName] || null;
    }

    /**
     * Obtém título traduzido de uma seção
     */
    getSectionTitle(sectionName) {
        return this.cvData.secoes?.[sectionName] || sectionName;
    }
}

window.DataManager = DataManager;