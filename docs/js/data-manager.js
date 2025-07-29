/**
 * Data Management Module
 * 
 * Handles loading, caching, and validation of CV data from external sources.
 * Implements robust error handling, retry mechanisms, and multi-URL fallback
 * for reliable data retrieval across different environments.
 * 
 * @author Angelo Ferdinand Imon Spanó
 * @version 2.0.0
 * @since 2025-01-29
 */

class DataManager {
    /**
     * Initialize data manager with default state
     */
    constructor() {
        /** @type {Object} Cached CV data for current session */
        this.cvData = {};

        /** @type {string} Currently active language */
        this.currentLanguage = 'pt';

        /** @type {boolean} Loading state indicator */
        this.isLoading = false;

        /** @type {number} Current retry attempt counter */
        this.retryCount = 0;

        /** @type {Map} Cache for loaded data by language */
        this.dataCache = new Map();

        /** @type {AbortController} For cancelling ongoing requests */
        this.abortController = null;
    }

    /**
     * Loads CV data with comprehensive error handling and fallback mechanisms
     * @param {string} language - Target language code ('pt' or 'en')
     * @returns {Promise<Object>} Resolved CV data object
     * @throws {Error} When all fallback attempts fail
     */
    async loadCVData(language = 'pt') {
        PerformanceMonitor.start(`loadCVData-${language}`);

        // Return cached data if available
        if (this.dataCache.has(language)) {
            const cachedData = this.dataCache.get(language);
            this.cvData = cachedData;
            this.currentLanguage = language;
            PerformanceMonitor.end(`loadCVData-${language}`);
            return cachedData;
        }

        this.isLoading = true;
        this.retryCount = 0;

        // Cancel any ongoing request
        if (this.abortController) {
            this.abortController.abort();
        }
        this.abortController = new AbortController();

        const fallbackUrls = this.generateFallbackUrls(language);

        try {
            const data = await this.attemptDataLoad(fallbackUrls, language);

            // Cache successful result
            this.dataCache.set(language, data);
            this.cvData = data;
            this.currentLanguage = language;

            if (AppConfig.DEBUG) {
                console.log(`[DataManager] Successfully loaded data for ${language}:`, data);
            }

            PerformanceMonitor.end(`loadCVData-${language}`);
            return data;

        } catch (error) {
            this.logLoadError(error, language);
            throw new Error(this.formatErrorMessage(error, language));
        } finally {
            this.isLoading = false;
            this.abortController = null;
        }
    }

    /**
     * Generates comprehensive list of fallback URLs for data loading
     * @param {string} language - Target language
     * @returns {Array<string>} Ordered array of URLs to attempt
     */
    generateFallbackUrls(language) {
        const fileName = AppConfig.DATA_FILES[language];

        return [
            // Primary production URL
            `https://angeloimon.github.io/AngeloImon/docs/${fileName}`,

            // Raw GitHub content URLs
            `https://raw.githubusercontent.com/AngeloImon/AngeloImon/main/docs/${fileName}`,

            // JsDelivr CDN fallback
            `https://cdn.jsdelivr.net/gh/AngeloImon/AngeloImon@main/docs/${fileName}`,

            // Local development fallback
            `./${fileName}`
        ];
    }

    /**
     * Attempts to load data from multiple URLs with timeout and retry logic
     * @param {Array<string>} urls - URLs to attempt in order
     * @param {string} language - Target language for error messages
     * @returns {Promise<Object>} Loaded and validated data
     * @throws {Error} When all URLs fail
     */
    async attemptDataLoad(urls, language) {
        const errors = [];

        for (let i = 0; i < urls.length; i++) {
            const url = urls[i];

            try {
                if (AppConfig.DEBUG) {
                    console.log(`[DataManager] Attempting URL ${i + 1}/${urls.length}: ${url}`);
                }

                const data = await this.fetchWithTimeout(url, AppConfig.PERFORMANCE.dataLoadTimeout);

                if (this.validateDataStructure(data)) {
                    if (AppConfig.DEBUG) {
                        console.log(`[DataManager] Successfully loaded from: ${url}`);
                    }
                    return data;
                } else {
                    throw new Error('Invalid data structure');
                }

            } catch (error) {
                const errorMsg = `URL ${i + 1} failed: ${error.message}`;
                errors.push(errorMsg);

                if (AppConfig.DEBUG) {
                    console.warn(`[DataManager] ${errorMsg}`);
                }

                // Continue to next URL
                continue;
            }
        }

        // All URLs failed
        throw new Error(`All ${urls.length} URLs failed. Errors: ${errors.join('; ')}`);
    }

    /**
     * Performs HTTP request with timeout and abort signal support
     * @param {string} url - Target URL
     * @param {number} timeout - Request timeout in milliseconds
     * @returns {Promise<Object>} Parsed JSON data
     * @throws {Error} On network, timeout, or parsing errors
     */
    async fetchWithTimeout(url, timeout) {
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Request timeout')), timeout);
        });

        const fetchPromise = fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            },
            cache: 'no-cache',
            signal: this.abortController.signal
        });

        const response = await Promise.race([fetchPromise, timeoutPromise]);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const responseText = await response.text();

        if (!responseText.trim()) {
            throw new Error('Empty response received');
        }

        try {
            return JSON.parse(responseText);
        } catch (parseError) {
            throw new Error(`JSON parsing failed: ${parseError.message}`);
        }
    }

    /**
     * Validates the structure and required fields of loaded CV data
     * @param {Object} data - Data object to validate
     * @returns {boolean} True if data structure is valid
     */
    validateDataStructure(data) {
        if (!data || typeof data !== 'object') {
            return false;
        }

        const requiredFields = [
            'nome', 'email', 'links', 'resumo', 'experiencia',
            'habilidades', 'formacao', 'certificacoes', 'projetos'
        ];

        const missingFields = requiredFields.filter(field => !data.hasOwnProperty(field));

        if (missingFields.length > 0) {
            if (AppConfig.DEBUG) {
                console.warn(`[DataManager] Missing required fields: ${missingFields.join(', ')}`);
            }
            return false;
        }

        // Validate specific field types
        if (typeof data.nome !== 'string' || !data.nome.trim()) {
            return false;
        }

        if (typeof data.email !== 'string' || !data.email.includes('@')) {
            return false;
        }

        if (!Array.isArray(data.experiencia) || !Array.isArray(data.projetos)) {
            return false;
        }

        return true;
    }

    /**
     * Formats error messages for user display based on language and error type
     * @param {Error} error - Original error object
     * @param {string} language - Current language for localization
     * @returns {string} Localized error message
     */
    formatErrorMessage(error, language) {
        const texts = AppConfig.INTERFACE_TEXTS[language]?.errors || AppConfig.INTERFACE_TEXTS.pt.errors;

        if (error.message.includes('timeout')) {
            return texts.networkError;
        }

        if (error.message.includes('404') || error.message.includes('not found')) {
            return texts.fileNotFound;
        }

        if (error.message.includes('JSON') || error.message.includes('parsing')) {
            return texts.invalidData;
        }

        if (error.message.includes('AbortError')) {
            return 'Request cancelled';
        }

        return `${texts.dataLoadError}: ${error.message}`;
    }

    /**
     * Logs detailed error information for debugging purposes
     * @param {Error} error - Error to log
     * @param {string} language - Language context
     */
    logLoadError(error, language) {
        console.error(`[DataManager] Failed to load CV data for ${language}:`, error);

        if (AppConfig.DEBUG) {
            console.error('[DataManager] Error stack:', error.stack);
            console.error('[DataManager] Retry count:', this.retryCount);
            console.error('[DataManager] Cache state:', this.dataCache);
        }
    }

    /**
     * Retrieves currently loaded CV data
     * @returns {Object} Current CV data object
     */
    getCVData() {
        return this.cvData;
    }

    /**
     * Gets the currently active language
     * @returns {string} Current language code
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    /**
     * Checks if valid data is currently loaded
     * @returns {boolean} True if data is loaded and valid
     */
    isDataLoaded() {
        return this.cvData && Object.keys(this.cvData).length > 0 && this.validateDataStructure(this.cvData);
    }

    /**
     * Checks if data loading is currently in progress
     * @returns {boolean} True if currently loading
     */
    isDataLoading() {
        return this.isLoading;
    }

    /**
     * Retrieves specific section data with fallback handling
     * @param {string} sectionName - Name of the section to retrieve
     * @returns {*} Section data or null if not found
     */
    getSectionData(sectionName) {
        if (!this.isDataLoaded()) {
            return null;
        }

        return this.cvData[sectionName] || null;
    }

    /**
     * Gets localized section title from data
     * @param {string} sectionName - Section identifier
     * @returns {string} Localized section title or fallback
     */
    getSectionTitle(sectionName) {
        if (!this.isDataLoaded()) {
            return sectionName;
        }

        return this.cvData.secoes?.[sectionName] || sectionName;
    }

    /**
     * Clears all cached data and resets state
     */
    clearCache() {
        this.dataCache.clear();
        this.cvData = {};
        this.currentLanguage = 'pt';

        if (AppConfig.DEBUG) {
            console.log('[DataManager] Cache cleared');
        }
    }

    /**
     * Preloads data for the alternate language to improve UX
     * @param {string} currentLanguage - Currently active language
     */
    async preloadAlternateLanguage(currentLanguage) {
        const alternateLanguage = currentLanguage === 'pt' ? 'en' : 'pt';

        if (!this.dataCache.has(alternateLanguage)) {
            try {
                await this.loadCVData(alternateLanguage);
                if (AppConfig.DEBUG) {
                    console.log(`[DataManager] Preloaded ${alternateLanguage} data`);
                }
            } catch (error) {
                if (AppConfig.DEBUG) {
                    console.warn(`[DataManager] Failed to preload ${alternateLanguage}:`, error.message);
                }
            }
        }
    }

    /**
     * Gets cache statistics for debugging
     * @returns {Object} Cache statistics
     */
    getCacheStats() {
        return {
            cachedLanguages: Array.from(this.dataCache.keys()),
            currentLanguage: this.currentLanguage,
            isLoading: this.isLoading,
            dataLoaded: this.isDataLoaded()
        };
    }
}

// Export to global scope for cross-module access
window.DataManager = DataManager;

if (AppConfig.DEBUG) {
    console.log('[DataManager] Module loaded successfully');
}