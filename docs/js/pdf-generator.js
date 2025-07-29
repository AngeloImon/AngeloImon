/**
 * Gerador de PDF para o currículo
 * Responsável por criar e formatar o PDF do CV
 */
class PDFGenerator {
    /**
     * Inicializa o gerador de PDF
     * @param {Object} cvData - Dados do CV
     * @param {string} language - Idioma do CV
     */
    constructor(cvData, language) {
        /** @type {Object} Dados do CV */
        this.cvData = cvData;

        /** @type {string} Idioma atual */
        this.language = language;

        /** @type {jsPDF} Instância do jsPDF */
        this.pdf = new window.jspdf.jsPDF();

        /** @type {number} Posição Y atual no documento */
        this.yPosition = AppConfig.PDF_CONFIG.margin;

        this.initializePDF();
    }

    /**
     * Inicializa configurações do PDF
     */
    initializePDF() {
        console.log('[PDFGenerator] Inicializando geração de PDF');
    }

    /**
     * Gera o PDF completo
     * @returns {Promise<void>}
     */
    async generate() {
        try {
            this.addHeader();
            this.addContactInfo();
            this.addSection('resumo', this.cvData.resumo);
            this.addProjectsSection();
            this.addExperienceSection();
            this.addSection('habilidades', this.cvData.habilidades.join(', '));
            this.addSection('formacao', this.cvData.formacao);
            this.addCertificationsSection();

            this.savePDF();

        } catch (error) {
            console.error('[PDFGenerator] Erro durante geração:', error);
            throw error;
        }
    }

    /**
     * Adiciona cabeçalho com nome
     */
    addHeader() {
        this.addText(
            this.cvData.nome,
            AppConfig.PDF_CONFIG.fontSize.title,
            true
        );
        this.yPosition += 5;
    }

    /**
     * Adiciona informações de contato
     */
    addContactInfo() {
        this.addText(`Email: ${this.cvData.email}`);
        this.addText(`GitHub: ${this.cvData.links.github}`);
        this.addText(`LinkedIn: ${this.cvData.links.linkedin}`);
        this.yPosition += 10;
    }

    /**
     * Adiciona seção genérica
     * @param {string} sectionKey - Chave da seção
     * @param {string} content - Conteúdo da seção
     */
    addSection(sectionKey, content) {
        this.checkNewPage();

        const title = this.getSectionTitle(sectionKey);
        this.addText(title, AppConfig.PDF_CONFIG.fontSize.sectionTitle, true);
        this.yPosition += 3;
        this.addText(content);
        this.yPosition += 10;
    }

    /**
     * Adiciona seção de projetos
     */
    addProjectsSection() {
        this.checkNewPage();

        const title = this.getSectionTitle('projetos');
        this.addText(title, AppConfig.PDF_CONFIG.fontSize.sectionTitle, true);
        this.yPosition += 3;

        this.cvData.projetos.forEach(project => {
            if (typeof project === 'object') {
                // Projeto com estrutura completa
                this.addText(
                    `• ${project.nome}`,
                    AppConfig.PDF_CONFIG.fontSize.small,
                    true
                );

                if (project.descricao) {
                    this.addText(
                        `  ${project.descricao}`,
                        AppConfig.PDF_CONFIG.fontSize.tiny
                    );
                }

                if (project.link) {
                    this.addText(
                        `  Link: ${project.link}`,
                        AppConfig.PDF_CONFIG.fontSize.link
                    );
                }
            } else {
                // Projeto simples (string)
                this.addText(
                    `• ${project}`,
                    AppConfig.PDF_CONFIG.fontSize.small
                );
            }
            this.yPosition += 2;
        });

        this.yPosition += 10;
    }

    /**
     * Adiciona seção de experiência profissional
     */
    addExperienceSection() {
        this.checkNewPage();

        const title = this.getSectionTitle('experiencia');
        this.addText(title, AppConfig.PDF_CONFIG.fontSize.sectionTitle, true);
        this.yPosition += 3;

        this.cvData.experiencia.forEach(exp => {
            this.checkNewPage();

            // Cargo e empresa
            this.addText(
                `${exp.cargo} - ${exp.empresa}`,
                AppConfig.PDF_CONFIG.fontSize.jobTitle,
                true
            );

            // Período
            this.addText(exp.periodo, AppConfig.PDF_CONFIG.fontSize.small);

            // Tarefas
            exp.tarefas.forEach(task => {
                this.addText(
                    `• ${task}`,
                    AppConfig.PDF_CONFIG.fontSize.small
                );
            });

            this.yPosition += 5;
        });
    }

    /**
     * Adiciona seção de certificações
     */
    addCertificationsSection() {
        this.checkNewPage();

        const title = this.getSectionTitle('certificacoes');
        this.addText(title, AppConfig.PDF_CONFIG.fontSize.sectionTitle, true);
        this.yPosition += 3;

        this.cvData.certificacoes.forEach(cert => {
            this.addText(
                `• ${cert}`,
                AppConfig.PDF_CONFIG.fontSize.small
            );
        });
    }

    /**
     * Adiciona texto ao PDF
     * @param {string} text - Texto a ser adicionado
     * @param {number} fontSize - Tamanho da fonte
     * @param {boolean} isBold - Se o texto deve ser negrito
     */
    addText(text, fontSize = AppConfig.PDF_CONFIG.fontSize.normal, isBold = false) {
        this.pdf.setFontSize(fontSize);
        this.pdf.setFont(undefined, isBold ? 'bold' : 'normal');

        const lines = this.pdf.splitTextToSize(text, AppConfig.PDF_CONFIG.maxWidth);
        this.pdf.text(lines, AppConfig.PDF_CONFIG.margin, this.yPosition);
        this.yPosition += lines.length * AppConfig.PDF_CONFIG.lineHeight;
    }

    /**
     * Verifica se é necessário adicionar nova página
     */
    checkNewPage() {
        if (this.yPosition > AppConfig.PDF_CONFIG.pageHeight) {
            this.pdf.addPage();
            this.yPosition = AppConfig.PDF_CONFIG.margin;
        }
    }

    /**
     * Obtém título traduzido de uma seção
     * @param {string} sectionKey - Chave da seção
     * @returns {string} Título da seção
     */
    getSectionTitle(sectionKey) {
        return this.cvData.secoes?.[sectionKey] || sectionKey;
    }

    /**
     * Salva o PDF com nome formatado
     */
    savePDF() {
        const fileName = `CV_${this.cvData.nome.replace(/\s+/g, '_')}_${this.language.toUpperCase()}.pdf`;
        this.pdf.save(fileName);
        console.log(`[PDFGenerator] PDF salvo como: ${fileName}`);
    }
}

// Torna a classe globalmente acessível
window.PDFGenerator = PDFGenerator;