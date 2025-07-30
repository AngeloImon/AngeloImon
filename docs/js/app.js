/**
 * CV Application - Complete Refactor
 * 
 * Ultra-simplified version combining all functionality.
 * Single file, maximum efficiency, same functionality.
 * 
 * @author Angelo Ferdinand Imon Spanó
 * @version 3.0.0 - Complete Rebuild
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

    async init() {
        log('Initializing app...');

        // Setup events
        this.bindEvents();

        // Load saved preferences
        this.loadPreferences();

        // Load initial data
        await this.loadData(this.lang);

        // Show content
        this.toggleLoading(false);

        log('App ready');
    }

    loadPreferences() {
        // Load saved theme
        const savedTheme = localStorage.getItem('cv-theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
        }

        // Load saved language
        const savedLang = localStorage.getItem('cv-lang');
        if (savedLang && Config.files[savedLang]) {
            this.lang = savedLang;
        }
    }

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
            this.showError('Erro ao carregar dados');
        } finally {
            this.toggleLoading(false);
        }
    }

    updateUI() {
        const d = this.data;

        // Basic info
        this.setText('#nome', d.nome);
        this.setText('#email', d.email);
        this.setText('#github', d.links?.github);
        this.setText('#linkedin', d.links?.linkedin);
        this.setText('#resumo', d.resumo);
        this.setText('#formacao', d.formacao);

        // Lists
        this.updateList('#experiencia', d.experiencia, 'experience');
        this.updateList('#habilidades', d.habilidades, 'skills');
        this.updateList('#certificacoes', d.certificacoes, 'simple');
        this.updateList('#projetos', d.projetos, 'projects');

        // Update UI texts
        this.updateTexts();
    }

    setText(selector, text) {
        const el = $(selector);
        if (el) el.textContent = text || '';
    }

    updateList(selector, items, type) {
        const el = $(selector);
        if (!el || !items) return;

        if (type === 'simple') {
            el.innerHTML = items.map(item => `<li>${item}</li>`).join('');
        } else if (type === 'skills') {
            el.innerHTML = items.map(skill => `<li>${skill}</li>`).join('');
        } else if (type === 'experience') {
            el.innerHTML = items.map(exp => `
                <div class="experience-item">
                    <h3>${exp.cargo}</h3>
                    <p><strong>${exp.empresa}</strong> | ${exp.periodo}</p>
                    <ul>${exp.tarefas?.map(t => `<li>${t}</li>`).join('') || ''}</ul>
                </div>
            `).join('');
        } else if (type === 'projects') {
            el.innerHTML = items.map(proj => `
                <div class="project-item">
                    <h3>${proj.nome}</h3>
                    <p>${proj.descricao}</p>
                    ${proj.link ? `<a href="${proj.link}" target="_blank">Ver projeto</a>` : ''}
                </div>
            `).join('');
        }
    }

    updateTexts() {
        const texts = Config.ui[this.lang];

        // Theme button
        const isDark = document.body.classList.contains('dark-theme');
        const themeBtn = $('#theme-toggle');
        if (themeBtn) {
            themeBtn.textContent = isDark ? texts.lightTheme : texts.darkTheme;
        }

        // Export button
        const exportBtn = $('#export-pdf');
        if (exportBtn) {
            exportBtn.textContent = texts.exportPdf;
        }
    }

    async switchLanguage(lang) {
        if (lang === this.lang) return;

        log(`Switching to ${lang}`);
        await this.loadData(lang);

        // Update language buttons
        $$('[data-action="language"]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });

        // Save preference
        localStorage.setItem('cv-lang', lang);
    }

    toggleTheme() {
        const isDark = document.body.classList.toggle('dark-theme');
        localStorage.setItem('cv-theme', isDark ? 'dark' : 'light');
        this.updateTexts();
    }

    toggleLoading(show) {
        const loading = $('#main-loading');
        const content = $('#main-content');

        if (loading) loading.style.display = show ? 'flex' : 'none';
        if (content) content.style.display = show ? 'none' : 'block';
    }

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
        `;
        errorDiv.textContent = message;

        document.body.appendChild(errorDiv);

        setTimeout(() => errorDiv.remove(), 5000);
    }

    async exportPDF() {
        if (!window.PDFGenerator) {
            this.showError('PDF Generator não carregado');
            return;
        }

        const btn = $('#export-pdf');
        const originalText = btn?.textContent;

        try {
            if (btn) {
                btn.textContent = '⏳ Gerando...';
                btn.disabled = true;
            }

            const generator = new PDFGenerator();
            await generator.generatePDF(this.data, this.lang);

            if (btn) {
                btn.textContent = '✅ Gerado!';
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.disabled = false;
                }, 2000);
            }

        } catch (error) {
            console.error('PDF error:', error);
            this.showError('Erro ao gerar PDF');
            if (btn) {
                btn.textContent = '❌ Erro';
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
    // Start app
    window.cvApp = new CVApp();

    log('DOM ready, app started');
});

// Development helpers
if (Config.isDev) {
    window.Config = Config;
    window.getAppState = () => ({
        data: window.cvApp?.data,
        lang: window.cvApp?.lang
    });
}