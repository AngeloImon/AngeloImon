/**
 * Configurações globais da aplicação CV
 * Centraliza todas as constantes e configurações utilizadas no sistema
 */
class AppConfig {
    /**
     * URLs base para diferentes ambientes
     * @type {Object}
     */
    static BASE_URLS = {
        // Para desenvolvimento local
        local: './',
        // Para GitHub Pages
        production: 'https://angeloimon.github.io/AngeloImon/docs/'
    };

    /**
     * Detecta se está em produção ou desenvolvimento
     * @returns {string} URL base apropriada
     */
    static getBaseUrl() {
        const isLocalhost = window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.hostname === '';

        return isLocalhost ? this.BASE_URLS.local : this.BASE_URLS.production;
    }

    /**
     * Configurações de arquivos de dados
     * @type {Object}
     */
    static DATA_FILES = {
        pt: 'cv.json',
        en: 'cv.en.json'
    };

    /**
     * Obtém URL completa do arquivo de dados
     * @param {string} language - Idioma ('pt' ou 'en')
     * @returns {string} URL completa do arquivo
     */
    static getDataFileUrl(language) {
        const baseUrl = this.getBaseUrl();
        const fileName = this.DATA_FILES[language];
        return `${baseUrl}${fileName}`;
    }

    /**
     * Textos da interface em múltiplos idiomas
     * @type {Object}
     */
    static INTERFACE_TEXTS = {
        pt: {
            darkTheme: '🌙 Tema Escuro',
            lightTheme: '☀️ Tema Claro',
            exportPdf: '📄 Exportar PDF',
            loading: 'Carregando currículo...',
            errors: {
                pdfLibraryNotLoaded: 'Biblioteca PDF não carregada. Tente novamente.',
                dataNotLoaded: 'Dados do CV ainda não carregados. Aguarde e tente novamente.',
                pdfGenerationError: 'Erro ao gerar PDF. Tente novamente.',
                dataLoadError: 'Erro ao carregar dados do CV',
                fileNotFound: 'Arquivo de dados não encontrado'
            }
        },
        en: {
            darkTheme: '🌙 Dark Theme',
            lightTheme: '☀️ Light Theme',
            exportPdf: '📄 Export PDF',
            loading: 'Loading resume...',
            errors: {
                pdfLibraryNotLoaded: 'PDF library not loaded. Please try again.',
                dataNotLoaded: 'CV data not loaded yet. Please wait and try again.',
                pdfGenerationError: 'Error generating PDF. Please try again.',
                dataLoadError: 'Error loading CV data',
                fileNotFound: 'Data file not found'
            }
        }
    };

    /**
     * Configurações do gerador de PDF
     * @type {Object}
     */
    static PDF_CONFIG = {
        margin: 20,
        lineHeight: 7,
        maxWidth: 170,
        pageHeight: 270,
        fontSize: {
            title: 20,
            sectionTitle: 16,
            jobTitle: 14,
            normal: 12,
            small: 10,
            tiny: 9,
            link: 8
        }
    };

    /**
     * Seletores DOM utilizados na aplicação
     * @type {Object}
     */
    static SELECTORS = {
        loading: '#main-loading',
        mainContent: '#main-content',
        themeToggle: '#theme-toggle',
        exportPdf: '#export-pdf',
        loadingText: '.loading-content p',
        elements: {
            nome: '#nome',
            email: '#email',
            github: '#github',
            linkedin: '#linkedin',
            resumo: '#resumo',
            formacao: '#formacao',
            experiencia: '#experiencia',
            habilidades: '#habilidades',
            certificacoes: '#certificacoes',
            projetos: '#projetos'
        },
        titles: {
            resumo: '#resumo-title',
            experiencia: '#experiencia-title',
            habilidades: '#habilidades-title',
            formacao: '#formacao-title',
            certificacoes: '#certificacoes-title',
            projetos: '#projetos-title'
        }
    };

    /**
     * Configurações de tema
     * @type {Object}
     */
    static THEME_CONFIG = {
        darkClass: 'dark-theme',
        storageKey: 'theme',
        values: {
            dark: 'dark',
            light: 'light'
        }
    };

    /**
     * Ações disponíveis via data-attributes
     * @type {Object}
     */
    static ACTIONS = {
        LANGUAGE: 'language',
        TOGGLE_THEME: 'toggle-theme',
        EXPORT_PDF: 'export-pdf'
    };

    /**
     * Debug mode
     * @type {boolean}
     */
    static DEBUG = window.location.hostname === 'localhost';
}

// Torna a configuração globalmente acessível
window.AppConfig = AppConfig;