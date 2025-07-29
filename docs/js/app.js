/**
 * Main Application Controller
 * 
 * Orchestrates all application modules, handles initialization, event delegation,
 * and coordinates user interactions. Implements robust error handling, performance
 * monitoring, and accessibility features throughout the application lifecycle.
 * 
 * @author Angelo Ferdinand Imon Spanó
 * @version 2.0.0
 * @since 2025-01-29
 */

class CVApplication {
    /**
     * Initialize the application with module instances and state management
     */
    constructor() {
        /** @type {DataManager} Data management instance */
        this.dataManager = null;

        /** @type {UIManager} UI management instance */
        this.uiManager = null;

        /** @type {PDFGenerator} PDF generation instance */
        this.pdfGenerator = null;

        /** @type {string} Current application language */
        this.currentLanguage = 'pt';

        /** @type {boolean} Application initialization state */
        this.isInitialized = false;

        /** @type {boolean} Application ready state */
        this.isReady = false;

        /** @type {AbortController} For handling operation cancellation */
        this.abortController = null;

        /** @type {Object} Event handlers cache for cleanup */
        this.eventHandlers = new Map();

        this.bindMethods();
    }

    /**
     * Binds class methods to maintain correct context
     */
    bindMethods() {
        this.handleAction = this.handleAction.bind(this);
        this.handleError = this.handleError.bind(this);
        this.handleKeyboardNavigation = this.handleKeyboardNavigation.bind(this);
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    }

    /**
     * Initializes the complete application with error handling and performance monitoring
     */
    async initialize() {
        PerformanceMonitor.start('appInitialization');

        try {
            if (AppConfig.DEBUG) {
                console.log('[CVApplication] Starting application initialization...');
            }

            // Wait for DOM to be fully loaded
            await this.waitForDOMReady();

            // Initialize core modules
            await this.initializeModules();

            // Set up global event listeners
            this.setupEventListeners();

            // Load initial application state
            await this.loadInitialState();

            // Mark application as ready
            this.isInitialized = true;
            this.isReady = true;

            if (AppConfig.DEBUG) {
                console.log('[CVApplication] Application initialized successfully');
                console.log('[CVApplication] Initial state:', this.getApplicationState());
            }

            // Notify that application is ready
            this.dispatchEvent('app:ready', { timestamp: Date.now() });

        } catch (error) {
            console.error('[CVApplication] Initialization failed:', error);
            this.handleError(error, 'initialization');
            throw error;
        } finally {
            PerformanceMonitor.end('appInitialization');
        }
    }

    /**
     * Waits for DOM to be ready for manipulation
     * @returns {Promise<void>} Resolves when DOM is ready
     */
    waitForDOMReady() {
        return new Promise((resolve) => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve, { once: true });
            } else {
                resolve();
            }
        });
    }

    /**
     * Initializes all core application modules with dependency management
     */
    async initializeModules() {
        try {
            // Initialize UI manager first for early error display capability
            this.uiManager = new UIManager();

            // Initialize data manager
            this.dataManager = new DataManager();

            // Initialize PDF generator
            this.pdfGenerator = new PDFGenerator();

            if (AppConfig.DEBUG) {
                console.log('[CVApplication] All modules initialized successfully');
            }

        } catch (error) {
            console.error('[CVApplication] Module initialization failed:', error);
            throw new Error(`Module initialization failed: ${error.message}`);
        }
    }

    /**
     * Sets up comprehensive event handling system with delegation
     */
    setupEventListeners() {
        // Global action delegation for data-action attributes
        const actionHandler = this.createEventHandler('click', this.handleAction);
        document.addEventListener('click', actionHandler);
        this.eventHandlers.set('document:click', actionHandler);

        // Keyboard navigation support
        const keyboardHandler = this.createEventHandler('keydown', this.handleKeyboardNavigation);
        document.addEventListener('keydown', keyboardHandler);
        this.eventHandlers.set('document:keydown', keyboardHandler);

        // Visibility change handling for performance optimization
        const visibilityHandler = this.createEventHandler('visibilitychange', this.handleVisibilityChange);
        document.addEventListener('visibilitychange', visibilityHandler);
        this.eventHandlers.set('document:visibilitychange', visibilityHandler);

        // Global error handling
        const errorHandler = this.createEventHandler('error', this.handleError);
        window.addEventListener('error', errorHandler);
        this.eventHandlers.set('window:error', errorHandler);

        // Unhandled promise rejection handling
        const rejectionHandler = this.createEventHandler('unhandledrejection', (event) => {
            this.handleError(event.reason, 'unhandledPromise');
            event.preventDefault();
        });
        window.addEventListener('unhandledrejection', rejectionHandler);
        this.eventHandlers.set('window:unhandledrejection', rejectionHandler);

        // Beforeunload for cleanup warning
        const beforeUnloadHandler = this.createEventHandler('beforeunload', () => {
            this.cleanup();
        });
        window.addEventListener('beforeunload', beforeUnloadHandler);
        this.eventHandlers.set('window:beforeunload', beforeUnloadHandler);

        if (AppConfig.DEBUG) {
            console.log('[CVApplication] Event listeners setup completed');
        }
    }

    /**
     * Creates wrapped event handler for proper cleanup management
     * @param {string} type - Event type
     * @param {Function} handler - Event handler function
     * @returns {Function} Wrapped event handler
     */
    createEventHandler(type, handler) {
        return (event) => {
            try {
                handler(event);
            } catch (error) {
                console.error(`[CVApplication] Error in ${type} handler:`, error);
                this.handleError(error, `${type}Handler`);
            }
        };
    }

    /**
     * Loads initial application state including theme, language, and data
     */
    async loadInitialState() {
        try {
            // Load saved theme preference
            this.uiManager.loadSavedTheme();

            // Determine initial language (could be from URL params, localStorage, etc.)
            const initialLanguage = this.determineInitialLanguage();

            // Show loading state
            this.uiManager.showLoading(initialLanguage);

            // Load CV data
            await this.loadLanguageData(initialLanguage);

            // Hide loading and show content
            this.uiManager.hideLoading();

            if (AppConfig.DEBUG) {
                console.log('[CVApplication] Initial state loaded successfully');
            }

        } catch (error) {
            console.error('[CVApplication] Failed to load initial state:', error);
            this.uiManager.showError(error.message, this.currentLanguage);
        }
    }

    /**
     * Determines initial language based on various factors
     * @returns {string} Initial language code
     */
    determineInitialLanguage() {
        // Check URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang');

        if (urlLang && AppConfig.DATA_FILES[urlLang]) {
            return urlLang;
        }

        // Check localStorage
        const savedLang = localStorage.getItem('cv-language-preference');
        if (savedLang && AppConfig.DATA_FILES[savedLang]) {
            return savedLang;
        }

        // Check browser language
        const browserLang = navigator.language.startsWith('en') ? 'en' : 'pt';

        return browserLang;
    }

    /**
     * Handles all user actions through event delegation
     * @param {Event} event - Click event
     */
    async handleAction(event) {
        const target = event.target.closest('[data-action]');

        if (!target) return;

        const action = target.getAttribute('data-action');

        if (!action) return;

        event.preventDefault();

        // Add visual feedback
        target.classList.add('processing');

        try {
            switch (action) {
                case AppConfig.ACTIONS.LANGUAGE:
                    await this.handleLanguageSwitch(target);
                    break;

                case AppConfig.ACTIONS.TOGGLE_THEME:
                    this.handleThemeToggle();
                    break;

                case AppConfig.ACTIONS.EXPORT_PDF:
                    await this.handlePDFExport();
                    break;

                default:
                    console.warn(`[CVApplication] Unknown action: ${action}`);
            }

        } catch (error) {
            console.error(`[CVApplication] Action ${action} failed:`, error);
            this.uiManager.showError(error.message, this.currentLanguage);
        } finally {
            target.classList.remove('processing');
        }
    }

    /**
     * Handles language switching with data loading and UI updates
     * @param {HTMLElement} target - Language button element
     */
    async handleLanguageSwitch(target) {
        const newLanguage = target.getAttribute('data-lang');

        if (!newLanguage || newLanguage === this.currentLanguage) {
            return;
        }

        if (!AppConfig.DATA_FILES[newLanguage]) {
            throw new Error(`Unsupported language: ${newLanguage}`);
        }

        PerformanceMonitor.start(`languageSwitch-${newLanguage}`);

        try {
            // Show loading for language switch
            this.uiManager.showLoading(newLanguage);

            // Load new language data
            await this.loadLanguageData(newLanguage);

            // Update UI language elements
            this.uiManager.updateLanguageButtons(newLanguage);

            // Hide loading
            this.uiManager.hideLoading();

            // Save language preference
            localStorage.setItem('cv-language-preference', newLanguage);

            // Update URL without reload
            this.updateURL(newLanguage);

            if (AppConfig.DEBUG) {
                console.log(`[CVApplication] Language switched to: ${newLanguage}`);
            }

            // Announce to screen readers
            const announcement = newLanguage === 'en' ?
                'Language changed to English' :
                'Idioma alterado para Português';
            this.uiManager.announceToScreenReader(announcement);

        } catch (error) {
            console.error(`[CVApplication] Language switch to ${newLanguage} failed:`, error);
            throw error;
        } finally {
            PerformanceMonitor.end(`languageSwitch-${newLanguage}`);
        }
    }

    /**
     * Loads and displays data for specified language
     * @param {string} language - Target language code
     */
    async loadLanguageData(language) {
        try {
            const cvData = await this.dataManager.loadCVData(language);

            if (!this.dataManager.validateDataStructure(cvData)) {
                throw new Error('Invalid CV data structure');
            }

            this.uiManager.populateContent(cvData);
            this.currentLanguage = language;

            // Preload alternate language for better UX
            this.dataManager.preloadAlternateLanguage(language);

        } catch (error) {
            console.error(`[CVApplication] Failed to load ${language} data:`, error);
            throw error;
        }
    }

    /**
     * Handles theme toggle functionality
     */
    handleThemeToggle() {
        this.uiManager.toggleTheme();

        // Dispatch theme change event
        this.dispatchEvent('theme:changed', {
            theme: this.uiManager.currentTheme,
            timestamp: Date.now()
        });
    }

    /**
     * Handles PDF export with comprehensive error handling
     */
    async handlePDFExport() {
        PerformanceMonitor.start('pdfExport');

        try {
            if (!this.dataManager.isDataLoaded()) {
                throw new Error(AppConfig.INTERFACE_TEXTS[this.currentLanguage].errors.dataNotLoaded);
            }

            const cvData = this.dataManager.getCVData();

            // Show export feedback
            const exportButton = document.querySelector('#export-pdf');
            if (exportButton) {
                const originalText = exportButton.textContent;
                exportButton.textContent = '⏳ Gerando PDF...';
                exportButton.disabled = true;

                try {
                    await this.pdfGenerator.generatePDF(cvData, this.currentLanguage);

                    // Success feedback
                    exportButton.textContent = '✅ PDF Gerado!';
                    setTimeout(() => {
                        exportButton.textContent = originalText;
                        exportButton.disabled = false;
                    }, 2000);

                } catch (error) {
                    exportButton.textContent = '❌ Erro no PDF';
                    setTimeout(() => {
                        exportButton.textContent = originalText;
                        exportButton.disabled = false;
                    }, 3000);
                    throw error;
                }
            }

            // Dispatch export event
            this.dispatchEvent('pdf:exported', {
                language: this.currentLanguage,
                timestamp: Date.now()
            });

        } catch (error) {
            console.error('[CVApplication] PDF export failed:', error);
            throw error;
        } finally {
            PerformanceMonitor.end('pdfExport');
        }
    }

    /**
     * Handles keyboard navigation for accessibility
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeyboardNavigation(event) {
        // Handle escape key for cancelling operations
        if (event.key === 'Escape') {
            if (this.abortController) {
                this.abortController.abort();
                this.abortController = null;
            }
        }

        // Handle keyboard shortcuts
        if (event.ctrlKey || event.metaKey) {
            switch (event.key) {
                case 'p':
                    event.preventDefault();
                    this.handlePDFExport();
                    break;

                case 'd':
                    event.preventDefault();
                    this.handleThemeToggle();
                    break;
            }
        }

        // Handle tab navigation improvements
        if (event.key === 'Tab') {
            this.handleTabNavigation(event);
        }
    }

    /**
     * Enhances tab navigation behavior
     * @param {KeyboardEvent} event - Tab key event
     */
    handleTabNavigation(event) {
        const focusableElements = document.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
            if (document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        }
    }

    /**
     * Handles page visibility changes for performance optimization
     */
    handleVisibilityChange() {
        if (document.hidden) {
            // Page is hidden, pause non-critical operations
            if (AppConfig.DEBUG) {
                console.log('[CVApplication] Page hidden, pausing operations');
            }
        } else {
            // Page is visible, resume operations
            if (AppConfig.DEBUG) {
                console.log('[CVApplication] Page visible, resuming operations');
            }
        }
    }

    /**
     * Comprehensive error handling with user feedback
     * @param {Error|Event} error - Error object or error event
     * @param {string} context - Error context for debugging
     */
    handleError(error, context = 'unknown') {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : '';

        console.error(`[CVApplication] Error in ${context}:`, errorMessage);

        if (AppConfig.DEBUG && errorStack) {
            console.error('[CVApplication] Error stack:', errorStack);
        }

        // Show user-friendly error message
        if (this.uiManager && this.isInitialized) {
            this.uiManager.showError(errorMessage, this.currentLanguage);
        }

        // Dispatch error event for monitoring
        this.dispatchEvent('app:error', {
            error: errorMessage,
            context: context,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            url: window.location.href
        });
    }

    /**
     * Updates browser URL without page reload
     * @param {string} language - Current language
     */
    updateURL(language) {
        try {
            const url = new URL(window.location);
            url.searchParams.set('lang', language);

            window.history.replaceState(
                { language: language },
                document.title,
                url.toString()
            );
        } catch (error) {
            if (AppConfig.DEBUG) {
                console.warn('[CVApplication] Failed to update URL:', error);
            }
        }
    }

    /**
     * Dispatches custom application events
     * @param {string} eventName - Event name
     * @param {Object} detail - Event detail data
     */
    dispatchEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, {
            detail: {
                ...detail,
                source: 'CVApplication'
            }
        });

        document.dispatchEvent(event);

        if (AppConfig.DEBUG) {
            console.log(`[CVApplication] Event dispatched: ${eventName}`, detail);
        }
    }

    /**
     * Gets comprehensive application state for debugging
     * @returns {Object} Current application state
     */
    getApplicationState() {
        return {
            isInitialized: this.isInitialized,
            isReady: this.isReady,
            currentLanguage: this.currentLanguage,
            dataManager: this.dataManager?.getCacheStats(),
            uiManager: this.uiManager?.getState(),
            pdfGenerator: this.pdfGenerator?.getStats(),
            performance: {
                loadTime: performance.now(),
                memory: performance.memory ? {
                    used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                    total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)
                } : null
            }
        };
    }

    /**
     * Comprehensive cleanup method for proper resource management
     */
    cleanup() {
        try {
            // Cancel any ongoing operations
            if (this.abortController) {
                this.abortController.abort();
            }

            // Clean up event listeners
            this.eventHandlers.forEach((handler, key) => {
                const [target, eventType] = key.split(':');
                const element = target === 'document' ? document : window;
                element.removeEventListener(eventType, handler);
            });
            this.eventHandlers.clear();

            // Clean up modules
            if (this.uiManager) {
                this.uiManager.cleanup();
            }

            if (this.dataManager) {
                this.dataManager.clearCache();
            }

            if (this.pdfGenerator) {
                this.pdfGenerator.cleanup();
            }

            // Reset state
            this.isInitialized = false;
            this.isReady = false;

            if (AppConfig.DEBUG) {
                console.log('[CVApplication] Cleanup completed');
            }

        } catch (error) {
            console.error('[CVApplication] Cleanup error:', error);
        }
    }
}

/**
 * Application initialization and lifecycle management
 */
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Create global application instance
        window.cvApp = new CVApplication();

        // Initialize application
        await window.cvApp.initialize();

        if (AppConfig.DEBUG) {
            console.log('[Main] CV Application started successfully');
            console.log('[Main] Application available at window.cvApp');

            // Development helpers
            window.getAppState = () => window.cvApp.getApplicationState();
            window.getPerformanceMetrics = () => PerformanceMonitor.marks;
        }

    } catch (error) {
        console.error('[Main] Failed to start CV Application:', error);

        // Show fallback error message
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      left: 20px;
      right: 20px;
      background: #f44336;
      color: white;
      padding: 20px;
      border-radius: 8px;
      z-index: 9999;
      text-align: center;
      font-family: Arial, sans-serif;
    `;
        errorDiv.innerHTML = `
      <h3>Erro na Aplicação</h3>
      <p>Falha ao inicializar o currículo. Recarregue a página.</p>
      <button onclick="window.location.reload()" style="background: white; color: #f44336; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin-top: 10px;">
        🔄 Recarregar Página
      </button>
    `;

        document.body.appendChild(errorDiv);
    }
});

// Export for module access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CVApplication;
}