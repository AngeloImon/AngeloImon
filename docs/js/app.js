/**
 * CV Application - Complete Refactor
 * 
 * Ultra-simplified version combining all functionality.
 * Single file, maximum efficiency, same functionality.
 * 
 * @author Angelo Ferdinand Imon Spanó
 * @version 3.1.0 - Fixed Loading & Language Switch
 * @since 2025-01-29
 */

// ===== CONFIGURATION =====
const Config = {
    isDev: ['localhost', '127.0.0.1', ''].includes(window.location.hostname) ||
        window.location.protocol === 'file:',

    files: { pt: 'cv.json', en: 'cv.en.json' },

    ui: {
        pt: {
            loading: 'Carregando currículo...',
            darkTheme: '🌙 Tema Escuro',
            lightTheme: '☀️ Tema Claro',
            exportPdf: '📄 Exportar PDF'
        },
        en: {
            loading: 'Loading resume...',
            darkTheme: '🌙 Dark Theme',
            lightTheme: '☀️ Light Theme',
            exportPdf: '📄 Export PDF'
        }
    }
};

// ===== UTILITIES =====
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
const log = (...args) => Config.isDev && console.log('[CV]', ...args);

// ===== MAIN APPLICATION =====
class CVApp {
    constructor() {
        this.data = {};
        this.lang = 'pt';
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        log('Initializing app...');

        // Setup events
        this.bindEvents();

        // Load saved preferences and URL parameters
        this.loadPreferences();

        // Load initial data
        await this.loadData(this.lang);

        // Show content
        this.toggleLoading(false);

        // Clean URL from any parameters
        this.cleanURL();

        log('App ready');
    }

    /**
     * Load user preferences from localStorage and URL parameters
     */
    loadPreferences() {
        // Check URL parameters first (one-time read)
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang');

        // Load saved theme
        const savedTheme = localStorage.getItem('cv-theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
        }

        // Load language: URL -> LocalStorage -> Default
        if (urlLang && Config.files[urlLang]) {
            this.lang = urlLang;
            log(`Language from URL: ${urlLang}`);
        } else {
            const savedLang = localStorage.getItem('cv-lang');
            if (savedLang && Config.files[savedLang]) {
                this.lang = savedLang;
                log(`Language from storage: ${savedLang}`);
            }
        }

        // Update language buttons to reflect current language
        this.updateLanguageButtons();
    }

    /**
     * Bind event listeners to UI elements
     */
    bindEvents() {
        // Theme toggle
        $('#theme-toggle')?.addEventListener('click', () => this.toggleTheme());

        // Language switches
        $$('[data-action="language"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = e.target.dataset.lang;
                if (lang) this.switchLanguage(lang);
            });
        });

        // PDF export
        $('#export-pdf')?.addEventListener('click', () => this.exportPDF());
    }

    /**
     * Load CV data from JSON file
     * @param {string} lang - Language code (pt/en)
     */
    async loadData(lang) {
        log(`Loading ${lang} data...`);
        this.toggleLoading(true);

        try {
            const response = await fetch(Config.files[lang], { cache: 'no-cache' });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            this.data = await response.json();
            this.lang = lang;
            this.updateUI();
        } catch (error) {
            console.error('Load error:', error);
            this.showError(this.lang === 'pt' ? 'Erro ao carregar dados' : 'Error loading data');
        } finally {
            this.toggleLoading(false);
        }
    }

    /**
     * Update the user interface with loaded data
     */
    updateUI() {
        const d = this.data;
        this.setText('#subtitulo', d.subtitulo);

        // Basic personal information
        this.setText('#nome', d.nome);
        this.setLink('#email', `mailto:${d.email}`, 'Email');
        this.setLink('#github', d.links?.github, 'GitHub');
        this.setLink('#linkedin', d.links?.linkedin, 'LinkedIn');
        this.setText('#resumo', d.resumo);
        this.setText('#formacao', d.formacao);

        // Update section titles based on language
        this.updateSectionTitles();

        // Populate content lists
        this.updateList('#experiencia', d.experiencia, 'experience');
        this.updateList('#habilidades', d.habilidades, 'skills');
        this.updateList('#certificacoes', d.certificacoes, 'simple');
        this.updateList('#projetos', d.projetos, 'projects');

        // Update UI text elements
        this.updateTexts();
    }

    /**
     * Update section titles based on current language
     */
    updateSectionTitles() {
        const titles = this.data.titles || {};

        // Update section titles using JSON data or fallback to defaults
        this.setText('#resumo-title', titles.resumo || (this.lang === 'pt' ? 'Resumo' : 'Summary'));
        this.setText('#experiencia-title', titles.experiencia || (this.lang === 'pt' ? 'Experiência Profissional' : 'Professional Experience'));
        this.setText('#habilidades-title', titles.habilidades || (this.lang === 'pt' ? 'Habilidades Técnicas' : 'Technical Skills'));
        this.setText('#formacao-title', titles.formacao || (this.lang === 'pt' ? 'Formação' : 'Education'));
        this.setText('#certificacoes-title', titles.certificacoes || (this.lang === 'pt' ? 'Certificações' : 'Certifications'));
        this.setText('#projetos-title', titles.projetos || (this.lang === 'pt' ? 'Projetos' : 'Projects'));
    }

    /**
     * Set text content of an element
     * @param {string} selector - CSS selector
     * @param {string} text - Text to set
     */
    setText(selector, text) {
        const el = $(selector);
        if (el) el.textContent = text || '';
    }

    /**
     * Set link content with title text
     * @param {string} selector - CSS selector
     * @param {string} href - Link URL
     * @param {string} title - Link title text
     */
    setLink(selector, href, title) {
        const el = $(selector);
        if (el && href) {
            if (el.tagName === 'A') {
                el.href = href;
                el.textContent = title;
                el.setAttribute('target', '_blank');
                el.setAttribute('rel', 'noopener');
            } else {
                el.innerHTML = `<a href="${href}" target="_blank" rel="noopener">${title}</a>`;
            }
        }
    }

    /**
     * Update list content based on type
     * @param {string} selector - CSS selector for the list container
     * @param {Array} items - Array of items to display
     * @param {string} type - Type of list (simple, skills, experience, projects)
     */
    updateList(selector, items, type) {
        const el = $(selector);
        if (!el || !items) return;

        switch (type) {
            case 'simple':
                // Simple list items (certifications)
                el.innerHTML = items.map(item => `<li>${item}</li>`).join('');
                break;

            case 'skills':
                // Skills as individual list items for CSS styling
                el.innerHTML = items.map(skill => `<li>${skill}</li>`).join('');
                break;

            case 'experience':
                // Professional experience cards
                el.innerHTML = items.map(exp => `
                    <div class="experience-item">
                        <h3>${exp.cargo}</h3>
                        <p><strong>${exp.empresa}</strong> | ${exp.periodo}</p>
                        <ul>${exp.tarefas?.map(t => `<li>${t}</li>`).join('') || ''}</ul>
                    </div>
                `).join('');
                break;

            case 'projects':
                // Project showcase cards
                el.innerHTML = items.map(proj => `
                    <div class="project-item">
                        <h3>${proj.nome}</h3>
                        <p>${proj.descricao}</p>
                        ${proj.link ? `<a href="${proj.link}" target="_blank" rel="noopener">${this.lang === 'pt' ? 'Ver projeto' : 'View project'}</a>` : ''}
                    </div>
                `).join('');
                break;
        }
    }

    /**
     * Update UI texts based on current language
     */
    updateTexts() {
        const texts = Config.ui[this.lang];

        // Theme toggle button
        const isDark = document.body.classList.contains('dark-theme');
        const themeBtn = $('#theme-toggle');
        if (themeBtn) {
            themeBtn.textContent = isDark ? texts.lightTheme : texts.darkTheme;
        }

        // PDF export button
        const exportBtn = $('#export-pdf');
        if (exportBtn) {
            exportBtn.textContent = texts.exportPdf;
        }

        // Loading text
        const loadingText = $('.loading-content p');
        if (loadingText) {
            loadingText.textContent = texts.loading;
        }
    }

    /**
     * Update language button states
     */
    updateLanguageButtons() {
        $$('[data-action="language"]').forEach(btn => {
            const isActive = btn.dataset.lang === this.lang;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-pressed', isActive.toString());
        });
    }

    /**
     * Switch application language
     * @param {string} lang - Target language code
     */
    async switchLanguage(lang) {
        if (lang === this.lang) return;

        log(`Switching to ${lang}`);
        await this.loadData(lang);

        // Update language button states
        this.updateLanguageButtons();

        // Clean URL and save preference
        this.cleanURL();
        localStorage.setItem('cv-lang', lang);
    }

    /**
     * Toggle between light and dark themes
     */
    toggleTheme() {
        const isDark = document.body.classList.toggle('dark-theme');
        localStorage.setItem('cv-theme', isDark ? 'dark' : 'light');
        this.updateTexts();
        log(`Theme switched to: ${isDark ? 'dark' : 'light'}`);
    }

    /**
     * Toggle loading state visibility
     * @param {boolean} show - Whether to show loading state
     */
    toggleLoading(show) {
        const loading = $('#main-loading');
        const content = $('#main-content');

        if (loading) loading.style.display = show ? 'flex' : 'none';
        if (content) content.style.display = show ? 'none' : 'block';
    }

    /**
     * Clean URL parameters to keep it neat
     */
    cleanURL() {
        if (window.history && window.history.replaceState) {
            const url = new URL(window.location);
            if (url.search) {
                window.history.replaceState({}, '', url.pathname);
                log('URL cleaned');
            }
        }
    }

    /**
     * Display error message to user
     * @param {string} message - Error message to display
     */
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f44336;
            color: white;
            padding: 16px;
            border-radius: 8px;
            z-index: 10000;
            font-family: system-ui, sans-serif;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease;
        `;
        errorDiv.textContent = message;

        document.body.appendChild(errorDiv);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            errorDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => errorDiv.remove(), 300);
        }, 5000);
    }

    /**
     * Export CV as PDF using PDFGenerator
     */
    async exportPDF() {
        if (!window.PDFGenerator) {
            this.showError(this.lang === 'pt' ? 'PDF Generator não carregado' : 'PDF Generator not loaded');
            return;
        }

        const btn = $('#export-pdf');
        const originalText = btn?.textContent;

        try {
            if (btn) {
                btn.textContent = this.lang === 'pt' ? '⏳ Gerando...' : '⏳ Generating...';
                btn.disabled = true;
            }

            const generator = new PDFGenerator();
            await generator.generatePDF(this.data, this.lang);

            if (btn) {
                btn.textContent = this.lang === 'pt' ? '✅ Gerado!' : '✅ Generated!';
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.disabled = false;
                }, 2000);
            }

        } catch (error) {
            console.error('PDF generation error:', error);
            this.showError(this.lang === 'pt' ? 'Erro ao gerar PDF' : 'Error generating PDF');

            if (btn) {
                btn.textContent = this.lang === 'pt' ? '❌ Erro' : '❌ Error';
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.disabled = false;
                }, 3000);
            }
        }
    }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the application
    window.cvApp = new CVApp();
    log('DOM ready, app started');
});

// ===== DEVELOPMENT HELPERS =====
if (Config.isDev) {
    // Expose configuration and app state for debugging
    window.Config = Config;
    window.getAppState = () => ({
        data: window.cvApp?.data,
        lang: window.cvApp?.lang,
        theme: document.body.classList.contains('dark-theme') ? 'dark' : 'light'
    });

    // Add CSS for error animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}