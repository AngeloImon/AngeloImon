/**
 * Application Configuration Module
 * 
 * Centralizes all configuration constants, URLs, selectors, and settings
 * used throughout the CV application. Provides environment-aware URL
 * resolution and internationalization support.
 * 
 * @author Angelo Ferdinand Imon Spanó
 * @version 2.0.0
 * @since 2025-01-29
 */

class AppConfig {
    /**
     * Base URLs for different deployment environments
     * Automatically detects development vs production environment
     * @type {Object}
     */
    static BASE_URLS = {
        local: './',
        production: 'https://angeloimon.github.io/AngeloImon/docs/'
    };

    /**
     * Data file configuration for multilingual support
     * Maps language codes to their respective JSON files
     * @type {Object}
     */
    static DATA_FILES = {
        pt: 'cv.json',
        en: 'cv.en.json'
    };

    /**
     * Determines the appropriate base URL based on current environment
     * Detects localhost, 127.0.0.1, or file protocol for development mode
     * @returns {string} Base URL for current environment
     */
    static getBaseUrl() {
        const isLocalhost = window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.hostname === '' ||
            window.location.protocol === 'file:';

        return isLocalhost ? this.BASE_URLS.local : this.BASE_URLS.production;
    }

    /**
     * Constructs complete data file URL for specified language
     * @param {string} language - Language code ('pt' or 'en')
     * @returns {string} Complete URL to data file
     * @throws {Error} If language is not supported
     */
    static getDataFileUrl(language) {
        if (!this.DATA_FILES[language]) {
            throw new Error(`Unsupported language: ${language}`);
        }

        const baseUrl = this.getBaseUrl();
        const fileName = this.DATA_FILES[language];
        return `${baseUrl}${fileName}`;
    }

    /**
     * Internationalization texts for user interface elements
     * Supports dynamic language switching with proper accessibility labels
     * @type {Object}
     */
    static INTERFACE_TEXTS = {
        pt: {
            darkTheme: '🌙 Tema Escuro',
            lightTheme: '☀️ Tema Claro',
            exportPdf: '📄 Exportar PDF',
            loading: 'Carregando currículo...',
            errors: {
                pdfLibraryNotLoaded: 'Biblioteca PDF não carregada. Tente novamente em alguns segundos.',
                dataNotLoaded: 'Dados do CV ainda não foram carregados. Aguarde e tente novamente.',
                pdfGenerationError: 'Erro ao gerar PDF. Verifique os dados e tente novamente.',
                dataLoadError: 'Erro ao carregar dados do CV',
                fileNotFound: 'Arquivo de dados não encontrado',
                networkError: 'Erro de conexão. Verifique sua internet e tente novamente.',
                invalidData: 'Dados do CV inválidos ou corrompidos'
            }
        },
        en: {
            darkTheme: '🌙 Dark Theme',
            lightTheme: '☀️ Light Theme',
            exportPdf: '📄 Export PDF',
            loading: 'Loading resume...',
            errors: {
                pdfLibraryNotLoaded: 'PDF library not loaded. Please try again in a few seconds.',
                dataNotLoaded: 'CV data not loaded yet. Please wait and try again.',
                pdfGenerationError: 'Error generating PDF. Check data and try again.',
                dataLoadError: 'Error loading CV data',
                fileNotFound: 'Data file not found',
                networkError: 'Connection error. Check your internet and try again.',
                invalidData: 'Invalid or corrupted CV data'
            }
        }
    };

    /**
     * PDF generation configuration parameters
     * Defines layout, typography, and formatting for PDF export
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
        },
        colors: {
            primary: '#1976d2',
            text: '#1a1a1a',
            secondary: '#666666'
        }
    };

    /**
     * DOM selector mappings for consistent element targeting
     * Centralizes all CSS selectors used by JavaScript modules
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
     * Theme management configuration
     * Handles dark/light mode persistence and application
     * @type {Object}
     */
    static THEME_CONFIG = {
        darkClass: 'dark-theme',
        storageKey: 'cv-theme-preference',
        values: {
            dark: 'dark',
            light: 'light'
        },
        defaultTheme: 'light'
    };

    /**
     * Data attribute actions for event delegation
     * Maps data-action values to their corresponding functionality
     * @type {Object}
     */
    static ACTIONS = {
        LANGUAGE: 'language',
        TOGGLE_THEME: 'toggle-theme',
        EXPORT_PDF: 'export-pdf'
    };

    /**
     * Application debugging configuration
     * Enables detailed logging in development environment
     * @type {boolean}
     */
    static DEBUG = window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.protocol === 'file:';

    /**
     * Performance monitoring thresholds
     * Defines acceptable performance metrics for loading operations
     * @type {Object}
     */
    static PERFORMANCE = {
        dataLoadTimeout: 10000, // 10 seconds
        pdfGenerationTimeout: 15000, // 15 seconds
        maxRetryAttempts: 3
    };

    /**
     * Accessibility configuration
     * ARIA and screen reader optimization settings
     * @type {Object}
     */
    static ACCESSIBILITY = {
        announceDelay: 500, // Delay before screen reader announcements
        focusDelay: 100, // Delay before focusing elements
        minTouchTarget: 44 // Minimum touch target size in pixels
    };

    /**
     * Animation and transition timing configuration
     * Consistent timing values across the application
     * @type {Object}
     */
    static ANIMATION = {
        fast: 200,
        normal: 300,
        slow: 500,
        easing: 'ease-in-out'
    };
}

/**
 * Performance monitoring utility
 * Tracks application performance metrics for optimization
 */
class PerformanceMonitor {
    static marks = new Map();

    /**
     * Starts a performance measurement
     * @param {string} name - Unique identifier for the measurement
     */
    static start(name) {
        if (AppConfig.DEBUG) {
            this.marks.set(name, performance.now());
        }
    }

    /**
     * Ends a performance measurement and logs the result
     * @param {string} name - Identifier of the measurement to end
     */
    static end(name) {
        if (AppConfig.DEBUG && this.marks.has(name)) {
            const duration = performance.now() - this.marks.get(name);
            console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
            this.marks.delete(name);
        }
    }
}

// Export configuration and utilities to global scope for module access
window.AppConfig = AppConfig;
window.PerformanceMonitor = PerformanceMonitor;

// Initialize performance monitoring
if (AppConfig.DEBUG) {
    console.log('[AppConfig] Configuration loaded successfully');
    console.log('[AppConfig] Environment:', AppConfig.getBaseUrl());
    console.log('[AppConfig] Debug mode:', AppConfig.DEBUG);
}