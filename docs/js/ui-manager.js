/**
 * User Interface Management Module
 * 
 * Handles all DOM manipulation, UI state management, and user interaction
 * responses. Implements accessibility features, responsive behavior, and
 * dynamic content rendering with proper error handling.
 * 
 * @author Angelo Ferdinand Imon Spanó
 * @version 2.0.0
 * @since 2025-01-29
 */

class UIManager {
    /**
     * Initialize UI manager with DOM element references and state
     */
    constructor() {
        /** @type {Object} Cached DOM element references for performance */
        this.elements = {};

        /** @type {string} Current theme state */
        this.currentTheme = 'light';

        /** @type {string} Current language state */
        this.currentLanguage = 'pt';

        /** @type {boolean} UI initialization state */
        this.isInitialized = false;

        /** @type {ResizeObserver} For responsive behavior monitoring */
        this.resizeObserver = null;

        /** @type {IntersectionObserver} For scroll-based animations */
        this.intersectionObserver = null;

        this.initializeElements();
        this.setupObservers();
    }

    /**
     * Caches frequently accessed DOM elements for performance optimization
     */
    initializeElements() {
        try {
            // Primary UI containers
            this.elements.loading = document.querySelector(AppConfig.SELECTORS.loading);
            this.elements.mainContent = document.querySelector(AppConfig.SELECTORS.mainContent);
            this.elements.themeToggle = document.querySelector(AppConfig.SELECTORS.themeToggle);
            this.elements.exportPdf = document.querySelector(AppConfig.SELECTORS.exportPdf);
            this.elements.loadingText = document.querySelector(AppConfig.SELECTORS.loadingText);

            // Content elements
            Object.keys(AppConfig.SELECTORS.elements).forEach(key => {
                this.elements[key] = document.querySelector(AppConfig.SELECTORS.elements[key]);
            });

            // Title elements
            Object.keys(AppConfig.SELECTORS.titles).forEach(key => {
                this.elements[`${key}Title`] = document.querySelector(AppConfig.SELECTORS.titles[key]);
            });

            // Language buttons
            this.elements.languageButtons = document.querySelectorAll('[data-action="language"]');

            this.validateRequiredElements();
            this.isInitialized = true;

            if (AppConfig.DEBUG) {
                console.log('[UIManager] Elements initialized successfully');
            }

        } catch (error) {
            console.error('[UIManager] Failed to initialize elements:', error);
            throw new Error('UI initialization failed');
        }
    }

    /**
     * Validates that all required DOM elements are present
     * @throws {Error} If critical elements are missing
     */
    validateRequiredElements() {
        const requiredElements = ['loading', 'mainContent', 'themeToggle'];
        const missingElements = requiredElements.filter(key => !this.elements[key]);

        if (missingElements.length > 0) {
            throw new Error(`Missing required elements: ${missingElements.join(', ')}`);
        }
    }

    /**
     * Sets up responsive and intersection observers for enhanced UX
     */
    setupObservers() {
        // Intersection observer for scroll-based animations
        if ('IntersectionObserver' in window) {
            this.intersectionObserver = new IntersectionObserver(
                this.handleIntersection.bind(this),
                {
                    threshold: 0.1,
                    rootMargin: '50px'
                }
            );
        }

        // Resize observer for responsive adjustments
        if ('ResizeObserver' in window) {
            this.resizeObserver = new ResizeObserver(
                this.handleResize.bind(this)
            );

            if (this.elements.mainContent) {
                this.resizeObserver.observe(this.elements.mainContent);
            }
        }
    }

    /**
     * Handles intersection observer callbacks for scroll animations
     * @param {Array} entries - Intersection observer entries
     */
    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }

    /**
     * Handles resize observer callbacks for responsive behavior
     * @param {Array} entries - Resize observer entries
     */
    handleResize(entries) {
        if (AppConfig.DEBUG) {
            entries.forEach(entry => {
                console.log('[UIManager] Resize detected:', entry.contentRect);
            });
        }

        // Trigger responsive adjustments if needed
        this.adjustResponsiveBehavior();
    }

    /**
     * Adjusts UI behavior based on current viewport size
     */
    adjustResponsiveBehavior() {
        const isMobile = window.innerWidth <= 768;
        const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;

        document.body.classList.toggle('mobile-view', isMobile);
        document.body.classList.toggle('tablet-view', isTablet);
        document.body.classList.toggle('desktop-view', !isMobile && !isTablet);

        // Adjust skills display on mobile
        if (this.elements.habilidades) {
            this.elements.habilidades.classList.toggle('mobile-list', isMobile);
        }
    }

    /**
     * Shows loading state with accessibility announcements
     * @param {string} language - Current language for localized text
     */
    showLoading(language = 'pt') {
        PerformanceMonitor.start('showLoading');

        const loadingText = AppConfig.INTERFACE_TEXTS[language]?.loading ||
            AppConfig.INTERFACE_TEXTS.pt.loading;

        if (this.elements.loading) {
            this.elements.loading.style.display = 'flex';
            this.elements.loading.setAttribute('aria-busy', 'true');
        }

        if (this.elements.loadingText) {
            this.elements.loadingText.textContent = loadingText;
        }

        if (this.elements.mainContent) {
            this.elements.mainContent.style.display = 'none';
            this.elements.mainContent.setAttribute('aria-hidden', 'true');
        }

        // Announce to screen readers with delay
        setTimeout(() => {
            this.announceToScreenReader(loadingText);
        }, AppConfig.ACCESSIBILITY.announceDelay);

        PerformanceMonitor.end('showLoading');
    }

    /**
     * Hides loading state and shows main content with smooth transition
     */
    hideLoading() {
        PerformanceMonitor.start('hideLoading');

        if (this.elements.loading) {
            this.elements.loading.style.display = 'none';
            this.elements.loading.setAttribute('aria-busy', 'false');
        }

        if (this.elements.mainContent) {
            this.elements.mainContent.style.display = 'grid';
            this.elements.mainContent.removeAttribute('aria-hidden');

            // Trigger entrance animations
            this.triggerEntranceAnimations();
        }

        // Set focus to main content for accessibility
        setTimeout(() => {
            if (this.elements.mainContent) {
                this.elements.mainContent.focus();
            }
        }, AppConfig.ACCESSIBILITY.focusDelay);

        PerformanceMonitor.end('hideLoading');
    }

    /**
     * Triggers entrance animations for content sections
     */
    triggerEntranceAnimations() {
        if (this.intersectionObserver) {
            const sections = document.querySelectorAll('section, article');
            sections.forEach(section => {
                this.intersectionObserver.observe(section);
            });
        }
    }

    /**
     * Populates all CV content sections with provided data
     * @param {Object} data - Complete CV data object
     */
    populateContent(data) {
        PerformanceMonitor.start('populateContent');

        try {
            this.populatePersonalInfo(data);
            this.populateMainSections(data);
            this.populateSidebarSections(data);
            this.updateSectionTitles(data.secoes || {});

            if (AppConfig.DEBUG) {
                console.log('[UIManager] Content populated successfully');
            }

        } catch (error) {
            console.error('[UIManager] Error populating content:', error);
            this.showError('Failed to display CV content');
        }

        PerformanceMonitor.end('populateContent');
    }

    /**
     * Populates personal information in header section
     * @param {Object} data - CV data containing personal info
     */
    populatePersonalInfo(data) {
        if (this.elements.nome && data.nome) {
            this.elements.nome.textContent = data.nome;
        }

        if (this.elements.email && data.email) {
            this.elements.email.textContent = data.email;
            this.elements.email.href = `mailto:${data.email}`;
        }

        if (data.links) {
            this.populateLinks(data.links);
        }
    }

    /**
     * Populates social/professional links with security attributes
     * @param {Object} links - Links object from CV data
     */
    populateLinks(links) {
        if (this.elements.github && links.github) {
            this.elements.github.href = links.github;
            this.elements.github.setAttribute('rel', 'noopener noreferrer');
            this.elements.github.setAttribute('target', '_blank');
        }

        if (this.elements.linkedin && links.linkedin) {
            this.elements.linkedin.href = links.linkedin;
            this.elements.linkedin.setAttribute('rel', 'noopener noreferrer');
            this.elements.linkedin.setAttribute('target', '_blank');
        }
    }

    /**
     * Populates main content sections (summary, projects, experience)
     * @param {Object} data - CV data object
     */
    populateMainSections(data) {
        // Professional summary
        if (this.elements.resumo && data.resumo) {
            this.elements.resumo.textContent = data.resumo;
        }

        // Projects section
        if (this.elements.projetos && data.projetos) {
            this.populateProjects(data.projetos);
        }

        // Experience section
        if (this.elements.experiencia && data.experiencia) {
            this.populateExperience(data.experiencia);
        }
    }

    /**
     * Populates sidebar sections (education, skills, certifications)
     * @param {Object} data - CV data object
     */
    populateSidebarSections(data) {
        // Education
        if (this.elements.formacao && data.formacao) {
            this.elements.formacao.textContent = data.formacao;
        }

        // Technical skills
        if (this.elements.habilidades && data.habilidades) {
            this.populateSkills(data.habilidades);
        }

        // Certifications
        if (this.elements.certificacoes && data.certificacoes) {
            this.populateCertifications(data.certificacoes);
        }
    }

    /**
     * Creates and populates projects list with proper accessibility
     * @param {Array} projects - Array of project objects
     */
    populateProjects(projects) {
        const fragment = document.createDocumentFragment();

        projects.forEach((project, index) => {
            const li = document.createElement('li');
            li.setAttribute('role', 'listitem');

            if (project.link) {
                const link = document.createElement('a');
                link.href = project.link;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.setAttribute('aria-label', `${project.nome} - opens in new tab`);

                const title = document.createElement('strong');
                title.textContent = project.nome;
                link.appendChild(title);

                li.appendChild(link);
            } else {
                const title = document.createElement('strong');
                title.textContent = project.nome;
                li.appendChild(title);
            }

            if (project.descricao) {
                const description = document.createElement('span');
                description.textContent = ` - ${project.descricao}`;
                li.appendChild(description);
            }

            fragment.appendChild(li);
        });

        this.elements.projetos.innerHTML = '';
        this.elements.projetos.appendChild(fragment);
    }

    /**
     * Creates and populates experience timeline with semantic structure
     * @param {Array} experiences - Array of experience objects
     */
    populateExperience(experiences) {
        const fragment = document.createDocumentFragment();

        experiences.forEach((exp, index) => {
            const div = document.createElement('div');
            div.className = 'experience-item';
            div.setAttribute('role', 'listitem');

            // Job title and company
            const header = document.createElement('h3');
            header.innerHTML = `${exp.cargo} <strong>- ${exp.empresa}</strong>`;
            div.appendChild(header);

            // Employment period
            if (exp.periodo) {
                const period = document.createElement('p');
                period.innerHTML = `<strong>Período:</strong> ${exp.periodo}`;
                div.appendChild(period);
            }

            // Responsibilities
            if (exp.tarefas && exp.tarefas.length > 0) {
                const tasksList = document.createElement('ul');
                tasksList.setAttribute('role', 'list');

                exp.tarefas.forEach(task => {
                    const taskItem = document.createElement('li');
                    taskItem.setAttribute('role', 'listitem');
                    taskItem.textContent = task;
                    tasksList.appendChild(taskItem);
                });

                div.appendChild(tasksList);
            }

            fragment.appendChild(div);
        });

        this.elements.experiencia.innerHTML = '';
        this.elements.experiencia.appendChild(fragment);
    }

    /**
     * Creates interactive skills display with responsive behavior
     * @param {Array} skills - Array of skill strings
     */
    populateSkills(skills) {
        const fragment = document.createDocumentFragment();

        skills.forEach((skill, index) => {
            const li = document.createElement('li');
            li.textContent = skill;
            li.setAttribute('role', 'listitem');
            li.setAttribute('tabindex', '0');
            li.setAttribute('aria-label', `Skill: ${skill}`);

            // Add keyboard interaction
            li.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    li.classList.toggle('highlighted');
                }
            });

            fragment.appendChild(li);
        });

        this.elements.habilidades.innerHTML = '';
        this.elements.habilidades.appendChild(fragment);
    }

    /**
     * Creates certifications list with proper semantic structure
     * @param {Array} certifications - Array of certification strings
     */
    populateCertifications(certifications) {
        const fragment = document.createDocumentFragment();

        certifications.forEach((cert, index) => {
            const li = document.createElement('li');
            li.textContent = cert;
            li.setAttribute('role', 'listitem');
            fragment.appendChild(li);
        });

        this.elements.certificacoes.innerHTML = '';
        this.elements.certificacoes.appendChild(fragment);
    }

    /**
     * Updates section titles with localized text
     * @param {Object} sectionTitles - Localized section titles
     */
    updateSectionTitles(sectionTitles) {
        Object.keys(sectionTitles).forEach(sectionKey => {
            const titleElement = this.elements[`${sectionKey}Title`];
            if (titleElement && sectionTitles[sectionKey]) {
                titleElement.textContent = sectionTitles[sectionKey];
            }
        });
    }

    /**
     * Updates language button states and interface text
     * @param {string} language - Active language code
     */
    updateLanguageButtons(language) {
        this.currentLanguage = language;

        if (this.elements.languageButtons) {
            this.elements.languageButtons.forEach(button => {
                const buttonLang = button.getAttribute('data-lang');
                const isActive = buttonLang === language;

                button.setAttribute('aria-pressed', isActive.toString());
                button.classList.toggle('active', isActive);
            });
        }

        // Update interface text
        this.updateInterfaceTexts(language);

        // Update document language
        document.documentElement.lang = language === 'en' ? 'en-US' : 'pt-BR';
    }

    /**
     * Updates UI texts based on current language
     * @param {string} language - Current language code
     */
    updateInterfaceTexts(language) {
        const texts = AppConfig.INTERFACE_TEXTS[language] || AppConfig.INTERFACE_TEXTS.pt;

        // Update theme toggle button
        if (this.elements.themeToggle) {
            const themeText = this.currentTheme === 'dark' ? texts.lightTheme : texts.darkTheme;
            this.elements.themeToggle.textContent = themeText;
        }

        // Update export button
        if (this.elements.exportPdf) {
            this.elements.exportPdf.textContent = texts.exportPdf;
        }
    }

    /**
     * Toggles theme with smooth transition and persistence
     */
    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    /**
     * Sets specific theme with state management
     * @param {string} theme - Theme to apply ('light' or 'dark')
     */
    setTheme(theme) {
        this.currentTheme = theme;

        document.body.classList.toggle(AppConfig.THEME_CONFIG.darkClass, theme === 'dark');

        // Persist theme preference
        localStorage.setItem(AppConfig.THEME_CONFIG.storageKey, theme);

        // Update button text
        this.updateInterfaceTexts(this.currentLanguage);

        // Announce theme change to screen readers
        const announcement = theme === 'dark' ? 'Dark theme activated' : 'Light theme activated';
        this.announceToScreenReader(announcement);

        if (AppConfig.DEBUG) {
            console.log(`[UIManager] Theme changed to: ${theme}`);
        }
    }

    /**
     * Loads and applies saved theme preference
     */
    loadSavedTheme() {
        const savedTheme = localStorage.getItem(AppConfig.THEME_CONFIG.storageKey) ||
            AppConfig.THEME_CONFIG.defaultTheme;

        this.setTheme(savedTheme);
    }

    /**
     * Displays error message with accessibility support
     * @param {string} message - Error message to display
     * @param {string} language - Current language for localization
     */
    showError(message, language = this.currentLanguage) {
        console.error('[UIManager] Displaying error:', message);

        // Hide loading state
        this.hideLoading();

        // Create error display
        const errorContainer = document.createElement('div');
        errorContainer.className = 'error-message';
        errorContainer.setAttribute('role', 'alert');
        errorContainer.setAttribute('aria-live', 'assertive');

        const errorText = document.createElement('p');
        errorText.textContent = message;
        errorContainer.appendChild(errorText);

        // Insert error before main content
        if (this.elements.mainContent && this.elements.mainContent.parentNode) {
            this.elements.mainContent.parentNode.insertBefore(errorContainer, this.elements.mainContent);
        }

        // Announce to screen readers
        this.announceToScreenReader(`Error: ${message}`);

        // Auto-hide after delay
        setTimeout(() => {
            if (errorContainer.parentNode) {
                errorContainer.parentNode.removeChild(errorContainer);
            }
        }, 10000);
    }

    /**
     * Announces message to screen readers
     * @param {string} message - Message to announce
     */
    announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;

        document.body.appendChild(announcement);

        // Remove after announcement
        setTimeout(() => {
            if (announcement.parentNode) {
                announcement.parentNode.removeChild(announcement);
            }
        }, 1000);
    }

    /**
     * Cleanup method for removing observers and event listeners
     */
    cleanup() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }

        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }

        if (AppConfig.DEBUG) {
            console.log('[UIManager] Cleanup completed');
        }
    }

    /**
     * Gets current UI state for debugging
     * @returns {Object} Current UI state
     */
    getState() {
        return {
            currentTheme: this.currentTheme,
            currentLanguage: this.currentLanguage,
            isInitialized: this.isInitialized,
            elementsCount: Object.keys(this.elements).length
        };
    }
}

// Export to global scope
window.UIManager = UIManager;

if (AppConfig.DEBUG) {
    console.log('[UIManager] Module loaded successfully');
}