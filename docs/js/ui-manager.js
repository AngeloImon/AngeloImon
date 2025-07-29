/**
 * Gerenciador de Interface do Usuário
 * Responsável por todas as interações e atualizações da interface
 */
class UIManager {
    /**
     * Inicializa o gerenciador de UI
     * @param {DataManager} dataManager - Instância do gerenciador de dados
     */
    constructor(dataManager) {
        /** @type {DataManager} Referência ao gerenciador de dados */
        this.dataManager = dataManager;

        /** @type {string} Idioma atual da interface */
        this.currentUILanguage = 'pt';

        this.initializeEventListeners();
        this.loadSavedTheme();
    }

    /**
     * Inicializa os event listeners da aplicação
     * Utiliza event delegation para melhor performance
     */
    initializeEventListeners() {
        document.addEventListener('click', (event) => {
            const action = event.target.dataset.action;

            switch (action) {
                case AppConfig.ACTIONS.LANGUAGE:
                    this.handleLanguageChange(event.target.dataset.lang);
                    break;
                case AppConfig.ACTIONS.TOGGLE_THEME:
                    this.toggleTheme();
                    break;
                case AppConfig.ACTIONS.EXPORT_PDF:
                    this.handlePDFExport();
                    break;
            }
        });

        console.log('[UIManager] Event listeners inicializados');
    }

    /**
     * Manipula mudança de idioma
     * @param {string} language - Novo idioma
     */
    async handleLanguageChange(language) {
        if (language === this.dataManager.getCurrentLanguage()) {
            console.log(`[UIManager] Idioma já está definido como: ${language}`);
            return;
        }

        try {
            this.showLoading();
            await this.dataManager.loadCVData(language);
            this.currentUILanguage = language;
            this.renderAllContent();
            this.updateInterfaceTexts();
            console.log(`[UIManager] Idioma alterado para: ${language}`);
        } catch (error) {
            console.error('[UIManager] Erro ao trocar idioma:', error);
            this.showError(error.message);
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Manipula exportação de PDF
     */
    async handlePDFExport() {
        if (!window.jspdf) {
            this.showError(AppConfig.INTERFACE_TEXTS[this.currentUILanguage].errors.pdfLibraryNotLoaded);
            return;
        }

        if (!this.dataManager.isDataLoaded()) {
            this.showError(AppConfig.INTERFACE_TEXTS[this.currentUILanguage].errors.dataNotLoaded);
            return;
        }

        try {
            const pdfGenerator = new PDFGenerator(
                this.dataManager.getCVData(),
                this.currentUILanguage
            );
            await pdfGenerator.generate();
            console.log('[UIManager] PDF gerado com sucesso');
        } catch (error) {
            console.error('[UIManager] Erro ao gerar PDF:', error);
            this.showError(AppConfig.INTERFACE_TEXTS[this.currentUILanguage].errors.pdfGenerationError);
        }
    }

    /**
     * Alterna entre tema claro e escuro
     */
    toggleTheme() {
        document.body.classList.toggle(AppConfig.THEME_CONFIG.darkClass);
        const isDark = document.body.classList.contains(AppConfig.THEME_CONFIG.darkClass);

        localStorage.setItem(
            AppConfig.THEME_CONFIG.storageKey,
            isDark ? AppConfig.THEME_CONFIG.values.dark : AppConfig.THEME_CONFIG.values.light
        );

        this.updateInterfaceTexts();
        console.log(`[UIManager] Tema alterado para: ${isDark ? 'escuro' : 'claro'}`);
    }

    /**
     * Carrega tema salvo do localStorage
     */
    loadSavedTheme() {
        const savedTheme = localStorage.getItem(AppConfig.THEME_CONFIG.storageKey);

        if (savedTheme === AppConfig.THEME_CONFIG.values.dark) {
            document.body.classList.add(AppConfig.THEME_CONFIG.darkClass);
            console.log('[UIManager] Tema escuro carregado do storage');
        }
    }

    /**
     * Atualiza textos da interface baseado no idioma e tema atuais
     */
    updateInterfaceTexts() {
        const themeButton = document.querySelector(AppConfig.SELECTORS.themeToggle);
        const exportButton = document.querySelector(AppConfig.SELECTORS.exportPdf);

        if (!themeButton || !exportButton) {
            console.warn('[UIManager] Botões da interface não encontrados');
            return;
        }

        const isDarkTheme = document.body.classList.contains(AppConfig.THEME_CONFIG.darkClass);
        const texts = AppConfig.INTERFACE_TEXTS[this.currentUILanguage];

        themeButton.textContent = isDarkTheme ? texts.lightTheme : texts.darkTheme;
        exportButton.textContent = texts.exportPdf;

        this.updateLoadingText();
    }

    /**
     * Atualiza texto de carregamento
     */
    updateLoadingText() {
        const loadingText = document.querySelector(AppConfig.SELECTORS.loadingText);
        if (loadingText) {
            loadingText.textContent = AppConfig.INTERFACE_TEXTS[this.currentUILanguage].loading;
        }
    }

    /**
     * Mostra estado de carregamento
     */
    showLoading() {
        const loading = document.querySelector(AppConfig.SELECTORS.loading);
        const content = document.querySelector(AppConfig.SELECTORS.mainContent);

        if (loading && content) {
            loading.style.display = 'flex';
            content.style.display = 'none';
        }
    }

    /**
     * Esconde estado de carregamento
     */
    hideLoading() {
        const loading = document.querySelector(AppConfig.SELECTORS.loading);
        const content = document.querySelector(AppConfig.SELECTORS.mainContent);

        if (loading && content) {
            loading.style.display = 'none';
            content.style.display = 'grid';
        }
    }

    /**
     * Renderiza todo o conteúdo do CV
     */
    renderAllContent() {
        if (!this.dataManager.isDataLoaded()) {
            console.warn('[UIManager] Tentativa de renderizar sem dados carregados');
            return;
        }

        const cvData = this.dataManager.getCVData();

        this.renderBasicInfo(cvData);
        this.renderExperience(cvData.experiencia);
        this.renderSkills(cvData.habilidades);
        this.renderCertifications(cvData.certificacoes);
        this.renderProjects(cvData.projetos);
        this.renderSectionTitles(cvData.secoes);

        console.log('[UIManager] Conteúdo renderizado completamente');
    }

    /**
     * Renderiza informações básicas do CV
     * @param {Object} cvData - Dados do CV
     */
    renderBasicInfo(cvData) {
        this.safeUpdateElement('nome', cvData.nome);
        this.safeUpdateElement('email', cvData.email);
        this.safeUpdateElement('resumo', cvData.resumo);
        this.safeUpdateElement('formacao', cvData.formacao);

        this.safeUpdateAttribute('github', 'href', cvData.links?.github);
        this.safeUpdateAttribute('linkedin', 'href', cvData.links?.linkedin);
    }

    /**
     * Renderiza seção de experiência profissional
     * @param {Array} experienceData - Dados de experiência
     */
    renderExperience(experienceData) {
        const container = document.querySelector(AppConfig.SELECTORS.elements.experiencia);
        if (!container || !experienceData) return;

        container.innerHTML = '';

        experienceData.forEach(exp => {
            const expElement = document.createElement('div');
            expElement.className = 'experience-item';
            expElement.innerHTML = `
        <h3>${exp.cargo}</h3>
        <p><strong>${exp.empresa}</strong> | ${exp.periodo}</p>
        <div class="tasks">
          ${exp.tarefas.map(tarefa => `<p>• ${tarefa}</p>`).join('')}
        </div>
      `;
            container.appendChild(expElement);
        });
    }

    /**
     * Renderiza seção de habilidades
     * @param {Array} skillsData - Dados de habilidades
     */
    renderSkills(skillsData) {
        const container = document.querySelector(AppConfig.SELECTORS.elements.habilidades);
        if (!container || !skillsData) return;

        container.innerHTML = '';
        skillsData.forEach(skill => {
            const li = document.createElement('li');
            li.textContent = skill;
            container.appendChild(li);
        });
    }

    /**
     * Renderiza seção de certificações
     * @param {Array} certificationsData - Dados de certificações
     */
    renderCertifications(certificationsData) {
        const container = document.querySelector(AppConfig.SELECTORS.elements.certificacoes);
        if (!container || !certificationsData) return;

        container.innerHTML = '';
        certificationsData.forEach(cert => {
            const li = document.createElement('li');
            li.textContent = cert;
            container.appendChild(li);
        });
    }

    /**
     * Renderiza seção de projetos
     * @param {Array} projectsData - Dados de projetos
     */
    renderProjects(projectsData) {
        const container = document.querySelector(AppConfig.SELECTORS.elements.projetos);
        if (!container || !projectsData) return;

        container.innerHTML = '';
        projectsData.forEach(project => {
            const li = document.createElement('li');

            if (typeof project === 'object' && project.nome) {
                li.innerHTML = `
          <strong>
            <a href="${project.link}" target="_blank" rel="noopener">${project.nome}</a>
          </strong>
          ${project.descricao ? `<br><span class="project-description">${project.descricao}</span>` : ''}
        `;
            } else {
                li.textContent = project;
            }

            container.appendChild(li);
        });
    }

    /**
     * Renderiza títulos das seções
     * @param {Object} sectionsData - Dados dos títulos das seções
     */
    renderSectionTitles(sectionsData) {
        if (!sectionsData) return;

        Object.keys(AppConfig.SELECTORS.titles).forEach(section => {
            if (sectionsData[section]) {
                this.safeUpdateElement(`${section}-title`, sectionsData[section]);
            }
        });
    }

    /**
     * Atualiza elemento DOM de forma segura
     * @param {string} id - ID do elemento
     * @param {string} content - Conteúdo a ser inserido
     * @param {string} property - Propriedade a ser atualizada (default: textContent)
     */
    safeUpdateElement(id, content, property = 'textContent') {
        const element = document.getElementById(id);
        if (element && content) {
            element[property] = content;
        }
    }

    /**
     * Atualiza atributo de elemento DOM de forma segura
     * @param {string} id - ID do elemento
     * @param {string} attribute - Nome do atributo
     * @param {string} value - Valor do atributo
     */
    safeUpdateAttribute(id, attribute, value) {
        const element = document.getElementById(id);
        if (element && value) {
            element[attribute] = value;
        }
    }

    /**
     * Exibe erro ao usuário
     * @param {string} message - Mensagem de erro
     */
    showError(message) {
        // TODO: Implementar sistema de notificações mais sofisticado
        alert(message);
        console.error('[UIManager] Erro exibido ao usuário:', message);
    }
}

// Torna a classe globalmente acessível
window.UIManager = UIManager;