/**
 * ATS-Optimized Professional PDF Generator
 * 
 * Clean, machine-readable CV generation with perfect ATS compatibility.
 * No visual interference, pure text structure, intelligent pagination.
 * 
 * @author Angelo Ferdinand Imon Spanó
 * @version 7.0.0 - Complete Rebuild for ATS Excellence
 * @since 2025-01-29
 */

class PDFGenerator {
    /**
     * Generate a summarized PDF version of the CV
     * Includes: header, objective, summary, up to 3 projects, up to 3 skills (flat),
     * and a combined Education & Certifications section (first education, last 3 certifications)
     * @param {Object} cvData - CV data object
     * @param {string} language - Language code ('pt' or 'en')
     */
    async generateSummaryPDF(cvData, language = 'pt') {
        if (!this.isReady) {
            throw new Error('PDF library not ready');
        }
        if (!cvData?.nome) {
            throw new Error('Invalid CV data');
        }
        try {
            this.language = language;
            this.initDocument();
            this.addHeader(cvData);

            // Objective
            if (cvData.objetivo) {
                this.addSection(this.getTitle('OBJECTIVE'), cvData.objetivo);
            }

            // Summary
            if (cvData.resumo) {
                this.addSection(this.getTitle('SUMMARY'), cvData.resumo);
            }

            // Projects (up to 3)
            if (cvData.projetos?.length > 0) {
                this.addProjects(cvData.projetos.slice(0, 3));
            }

            // Skills: first 3 of each category, sequentially
            if (cvData.habilidades && typeof cvData.habilidades === 'object') {
                let selectedSkills = [];
                for (const key of Object.keys(cvData.habilidades)) {
                    const arr = cvData.habilidades[key];
                    if (Array.isArray(arr)) {
                        selectedSkills.push(...arr.slice(0, 3));
                    }
                }
                if (selectedSkills.length > 0) {
                    const skillsTitle = this.getTitle('SKILLS');
                    this.addSection(skillsTitle, selectedSkills.join(', '));
                }
            }

            // Education & Certifications (first education and last 3 certifications)
            const eduCertTitle = (this.language === 'en') ? 'EDUCATION & CERTIFICATIONS' : 'FORMAÇÃO & CERTIFICAÇÕES';
            let eduCertLines = [];
            // First education
            if (Array.isArray(cvData.formacao) && cvData.formacao.length > 0) {
                const edu = cvData.formacao[0];
                eduCertLines.push(`${edu.curso} - ${edu.instituicao} (${edu.periodo}, ${edu.status})`);
                if (edu.gpa || edu.gpa_equivalente) {
                    const gpa = edu.gpa || edu.gpa_equivalente;
                    eduCertLines.push((this.language === 'en' ? 'GPA equivalent: ' : 'Média/GPA: ') + gpa);
                }
            }
            // First 3 certifications (most recent)
            if (Array.isArray(cvData.certificacoes) && cvData.certificacoes.length > 0) {
                const recentCerts = cvData.certificacoes.slice(0, 3);
                if (recentCerts.length > 0) {
                    eduCertLines.push((this.language === 'en' ? 'Certifications:' : 'Certificações:'));
                    recentCerts.forEach(cert => eduCertLines.push(`- ${cert}`));
                }
            }
            if (eduCertLines.length > 0) {
                // Add the section, but each line as a separate item
                this.checkPageBreak(20);
                this.currentY += PDFGenerator.CONFIG.SPACING.SECTION;
                this.pdf.setFontSize(PDFGenerator.CONFIG.FONTS.SECTION);
                this.pdf.setFont('DejaVuSans', 'bold');
                this.setColor('BLACK');
                this.pdf.text(eduCertTitle, PDFGenerator.CONFIG.MARGINS.LEFT, this.currentY);
                this.currentY += PDFGenerator.CONFIG.SPACING.HEADER;

                this.pdf.setFontSize(PDFGenerator.CONFIG.FONTS.BODY);
                this.pdf.setFont('DejaVuSans', 'normal');
                for (const line of eduCertLines) {
                    const lines = this.wrapText(line, this.contentWidth);
                    this.addTextBlock(lines);
                }
                this.currentY += PDFGenerator.CONFIG.SPACING.SECTION;
            }

            this.addFooter(cvData);
            let fileName;
            if (this.language === 'pt') {
                fileName = cvData.nome + ' - Resumo';
            } else {
                fileName = cvData.nome + ' - Summary';
            }
            this.savePDF(fileName);
            this.showSuccess();
        } catch (error) {
            console.error('[PDFGenerator] Summary generation failed:', error);
            this.showError();
            throw error;
        }
    }

    /**
     * Configuration constants for ATS optimization
     */
    static CONFIG = {
        // Page settings
        MARGINS: { TOP: 20, BOTTOM: 20, LEFT: 20, RIGHT: 20 },

        // Typography (ATS-friendly sizes)
        FONTS: {
            NAME: 16,
            SECTION: 12,
            SUBTITLE: 10,
            BODY: 10,
            SMALL: 9
        },

        // Spacing (clean separation)
        SPACING: {
            SECTION: 6,
            ITEM: 4.5,
            LINE: 3.5,
            HEADER: 6
        },

        // Colors (minimal for ATS)
        COLORS: {
            BLACK: [0, 0, 0],
            NAVY: [44, 62, 80],
            GRAY: [100, 100, 100]
        },

        // Section titles by language
        TITLES: {
            pt: {
                SUMMARY: 'RESUMO PROFISSIONAL',
                EXPERIENCE: 'EXPERIENCIA PROFISSIONAL',
                PROJECTS: 'PROJETOS DESTACADOS',
                SKILLS: 'HABILIDADES TECNICAS',
                EDUCATION: 'FORMACAO ACADEMICA',
                CERTIFICATIONS: 'CERTIFICACOES',
                OBJECTIVE: 'OBJETIVO'
            },
            en: {
                SUMMARY: 'PROFESSIONAL SUMMARY',
                EXPERIENCE: 'PROFESSIONAL EXPERIENCE',
                PROJECTS: 'FEATURED PROJECTS',
                SKILLS: 'TECHNICAL SKILLS',
                EDUCATION: 'EDUCATION',
                CERTIFICATIONS: 'CERTIFICATIONS',
                OBJECTIVE: 'OBJECTIVE'
            }
        }
    };

    constructor() {
        this.pdf = null;
        this.currentY = 0;
        this.pageWidth = 210;
        this.pageHeight = 297;
        this.contentWidth = this.pageWidth - PDFGenerator.CONFIG.MARGINS.LEFT - PDFGenerator.CONFIG.MARGINS.RIGHT;
        this.language = 'pt';
        this.isReady = false;

        this.initLibrary();
    }

    /**
     * Initialize PDF library
     */
    async initLibrary() {
        let attempts = 0;
        const maxAttempts = 50;

        const checkLibrary = () => {
            if (window.jspdf?.jsPDF || window.jsPDF || typeof jsPDF !== 'undefined') {
                this.isReady = true;
                console.log('[PDFGenerator] Library ready');
                return true;
            }

            attempts++;
            if (attempts >= maxAttempts) {
                console.error('[PDFGenerator] Library load failed');
                return false;
            }

            setTimeout(checkLibrary, 100);
        };

        checkLibrary();
    }

    /**
     * Get PDF constructor
     */
    getPDFConstructor() {
        if (window.jspdf?.jsPDF) return window.jspdf.jsPDF;
        if (window.jsPDF) return window.jsPDF;
        if (typeof jsPDF !== 'undefined') return jsPDF;
        throw new Error('PDF library not available');
    }

    /**
     * Get localized title
     */
    getTitle(key) {
        return PDFGenerator.CONFIG.TITLES[this.language]?.[key] || key;
    }

    /**
     * Main PDF generation
     */
    async generatePDF(cvData, language = 'pt') {
        if (!this.isReady) {
            throw new Error('PDF library not ready');
        }

        if (!cvData?.nome) {
            throw new Error('Invalid CV data');
        }

        try {
            this.language = language;
            this.initDocument();
            this.addHeader(cvData);
            this.addContent(cvData);
            this.addFooter(cvData);
            let fileName;
            if (this.language === 'pt') {
                fileName = 'Currículo Angelo Ferdinand Imon Spanó';
            } else {
                fileName = 'Résumé Angelo Ferdinand Imon Spanó';
            }
            this.savePDF(fileName);
            this.showSuccess();
        } catch (error) {
            console.error('[PDFGenerator] Generation failed:', error);
            this.showError();
            throw error;
        }
    }

    /**
     * Initialize document
     */
    initDocument() {
        const PDFConstructor = this.getPDFConstructor();
        this.pdf = new PDFConstructor('portrait', 'mm', 'a4');
        this.currentY = PDFGenerator.CONFIG.MARGINS.TOP;

        // Set properties
        this.pdf.setProperties({
            title: 'Professional Resume',
            author: 'Angelo Ferdinand Imon Spanó',
            creator: 'ATS PDF Generator v7.0'
        });

        // Default font
        this.pdf.setFont('DejaVuSans', 'normal');
        this.setColor('BLACK');
    }

    /**
     * Set text color
     */
    setColor(colorName) {
        const color = PDFGenerator.CONFIG.COLORS[colorName] || PDFGenerator.CONFIG.COLORS.BLACK;
        this.pdf.setTextColor(...color);
    }

    /**
     * Check page break
     */
    checkPageBreak(space = 10) {
        if (this.currentY + space > this.pageHeight - PDFGenerator.CONFIG.MARGINS.BOTTOM) {
            this.pdf.addPage();
            this.currentY = PDFGenerator.CONFIG.MARGINS.TOP;
        }
    }

    /**
     * Center text
     */
    centerText(text, y) {
        const textWidth = this.pdf.getTextWidth(text);
        const x = (this.pageWidth - textWidth) / 2;
        this.pdf.text(text, x, y);
    }

    /**
     * Wrap text
     */
    wrapText(text, maxWidth) {
        if (!text) return [''];

        if (this.pdf.getTextWidth(text) <= maxWidth) {
            return [text];
        }

        const words = text.split(' ');
        const lines = [];
        let currentLine = '';

        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            const testLine = currentLine ? `${currentLine} ${word}` : word;

            if (this.pdf.getTextWidth(word) > maxWidth) {
                if (currentLine) {
                    lines.push(currentLine);
                    currentLine = '';
                }

                let remainingWord = word;
                while (remainingWord.length > 0) {
                    let chunk = '';
                    for (let j = 1; j <= remainingWord.length; j++) {
                        const testChunk = remainingWord.substring(0, j);
                        if (this.pdf.getTextWidth(testChunk) <= maxWidth) {
                            chunk = testChunk;
                        } else {
                            break;
                        }
                    }

                    if (chunk.length === 0) chunk = remainingWord.substring(0, 1);
                    lines.push(chunk);
                    remainingWord = remainingWord.substring(chunk.length);
                }
            } else if (this.pdf.getTextWidth(testLine) <= maxWidth) {
                currentLine = testLine;
            } else {
                if (currentLine) lines.push(currentLine);
                currentLine = word;
            }
        }

        if (currentLine) lines.push(currentLine);
        return lines.length > 0 ? lines : [''];
    }

    /**
     * Add text block
     */
    addTextBlock(lines, leftMargin = null) {
        const margin = leftMargin || PDFGenerator.CONFIG.MARGINS.LEFT;

        for (const line of lines) {
            this.checkPageBreak(PDFGenerator.CONFIG.SPACING.LINE);
            this.pdf.text(line, margin, this.currentY);
            this.currentY += PDFGenerator.CONFIG.SPACING.LINE;
        }
    }

    /**
     * Add header
     */
    addHeader(cvData) {

        // Name (only colored element)
        this.pdf.setFontSize(PDFGenerator.CONFIG.FONTS.NAME);
        this.pdf.setFont('DejaVuSans', 'bold');
        this.setColor('NAVY');
        this.centerText(cvData.nome.toUpperCase(), this.currentY);
        this.currentY += PDFGenerator.CONFIG.SPACING.HEADER;

        // Subtitle
        if (cvData.subtitulo) {
            this.pdf.setFontSize(PDFGenerator.CONFIG.FONTS.SUBTITLE);
            this.pdf.setFont('DejaVuSans', 'normal');
            this.setColor('BLACK');
            const lines = this.wrapText(cvData.subtitulo, this.contentWidth);
            for (const line of lines) {
                this.centerText(line, this.currentY);
                this.currentY += PDFGenerator.CONFIG.SPACING.LINE;
            }
            this.currentY += PDFGenerator.CONFIG.SPACING.HEADER / 2;
        }

        // Contact info
        this.addContactInfo(cvData);

        // Separator
        this.addSeparator();
    }

    /**
     * Add contact information
     */
    addContactInfo(cvData) {
        this.pdf.setFontSize(PDFGenerator.CONFIG.FONTS.BODY);
        this.pdf.setFont('DejaVuSans', 'normal');
        this.setColor('BLACK');

        const contacts = [];

        if (cvData.email) contacts.push(`Email: ${cvData.email}`);
        if (cvData.links?.github) contacts.push(`GitHub: ${cvData.links.github}`);
        if (cvData.links?.linkedin) contacts.push(`LinkedIn: ${cvData.links.linkedin}`);
        contacts.push(`Complete CV PT - EN: https://angeloimon.github.io/AngeloImon`);
        for (const contact of contacts) {
            this.centerText(contact, this.currentY);
            this.currentY += 5;
        }

        this.currentY += PDFGenerator.CONFIG.SPACING.HEADER;
    }

    /**
     * Add separator line
     */
    addSeparator() {
        this.pdf.setLineWidth(0.2);
        this.pdf.setDrawColor(150, 150, 150);
        this.pdf.line(
            PDFGenerator.CONFIG.MARGINS.LEFT + 20,
            this.currentY,
            this.pageWidth - PDFGenerator.CONFIG.MARGINS.RIGHT - 20,
            this.currentY
        );
        this.currentY += PDFGenerator.CONFIG.SPACING.SECTION;
    }

    /**
     * Add main content
     */
    addContent(cvData) {

        // Objective
        if (cvData.objetivo) {
            this.addSection(this.getTitle('OBJECTIVE'), cvData.objetivo);
        }

        // Summary
        if (cvData.resumo) {
            this.addSection(this.getTitle('SUMMARY'), cvData.resumo);
        }

        // Projects
        if (cvData.projetos?.length > 0) {
            this.addProjects(cvData.projetos);
        }

        // Skills
        if (cvData.habilidades && Object.keys(cvData.habilidades).length > 0) {
            this.addSkills(cvData.habilidades);
        }

        // Education
        if (Array.isArray(cvData.formacao) && cvData.formacao.length > 0) {
            this.addEducation(cvData.formacao);
        }

        // Certifications
        if (cvData.certificacoes?.length > 0) {
            this.addCertifications(cvData.certificacoes);
        }

        // Experience
        if (cvData.experiencia?.length > 0) {
            this.addExperience(cvData.experiencia);
        }
    }

    /**
     * Add section
     */
    addSection(title, content) {
        this.checkPageBreak(20);

        // Section title
        this.currentY += PDFGenerator.CONFIG.SPACING.SECTION;
        this.pdf.setFontSize(PDFGenerator.CONFIG.FONTS.SECTION);
        this.pdf.setFont('DejaVuSans', 'bold');
        this.setColor('BLACK');
        this.pdf.text(title, PDFGenerator.CONFIG.MARGINS.LEFT, this.currentY);
        this.currentY += PDFGenerator.CONFIG.SPACING.HEADER;

        // Content
        this.pdf.setFontSize(PDFGenerator.CONFIG.FONTS.BODY);
        this.pdf.setFont('DejaVuSans', 'normal');
        const lines = this.wrapText(content, this.contentWidth);
        this.addTextBlock(lines);

        // Espaçamento extra após a seção
        this.currentY += PDFGenerator.CONFIG.SPACING.SECTION;
    }

    /**
     * Add experience section
     */
    addExperience(experiences) {
        this.checkPageBreak(30);

        // Section title
        this.currentY += PDFGenerator.CONFIG.SPACING.SECTION;
        this.pdf.setFontSize(PDFGenerator.CONFIG.FONTS.SECTION);
        this.pdf.setFont('DejaVuSans', 'bold');
        this.setColor('BLACK');
        this.pdf.text(this.getTitle('EXPERIENCE'), PDFGenerator.CONFIG.MARGINS.LEFT, this.currentY);
        this.currentY += PDFGenerator.CONFIG.SPACING.HEADER;

        for (const exp of experiences) {
            this.checkPageBreak(20);

            // Job title
            this.pdf.setFontSize(PDFGenerator.CONFIG.FONTS.SUBTITLE);
            this.pdf.setFont('DejaVuSans', 'bold');
            this.pdf.text(exp.cargo || 'Cargo', PDFGenerator.CONFIG.MARGINS.LEFT, this.currentY);
            this.currentY += 5;

            // Company
            this.pdf.setFontSize(PDFGenerator.CONFIG.FONTS.BODY);
            this.pdf.setFont('DejaVuSans', 'normal');
            const company = `${exp.empresa || 'Empresa'} | ${exp.periodo || 'Período'}`;
            this.pdf.text(company, PDFGenerator.CONFIG.MARGINS.LEFT, this.currentY);
            this.currentY += 6;

            // Tasks
            if (exp.tarefas?.length > 0) {
                for (const task of exp.tarefas) {
                    this.checkPageBreak(5);
                    const bullet = `• ${task}`;
                    const lines = this.wrapText(bullet, this.contentWidth - 5);
                    this.addTextBlock(lines, PDFGenerator.CONFIG.MARGINS.LEFT + 3);
                }
            }

            this.currentY += PDFGenerator.CONFIG.SPACING.ITEM;
        }
    }

    /**
     * Add projects section
     */
    addProjects(projects) {
        this.checkPageBreak(25);

        // Section title
        this.currentY += PDFGenerator.CONFIG.SPACING.SECTION;
        this.pdf.setFontSize(PDFGenerator.CONFIG.FONTS.SECTION);
        this.pdf.setFont('DejaVuSans', 'bold');
        this.setColor('BLACK');
        this.pdf.text(this.getTitle('PROJECTS'), PDFGenerator.CONFIG.MARGINS.LEFT, this.currentY);
        this.currentY += PDFGenerator.CONFIG.SPACING.HEADER;

    for (const project of projects) {
            this.checkPageBreak(15);

            // Project name
            this.pdf.setFontSize(PDFGenerator.CONFIG.FONTS.SUBTITLE);
            this.pdf.setFont('DejaVuSans', 'bold');
            const projectNameLines = this.wrapText(project.nome || 'Projeto', this.contentWidth);
            this.addTextBlock(projectNameLines, PDFGenerator.CONFIG.MARGINS.LEFT);

            // Description
            if (project.descricao) {
                this.pdf.setFontSize(PDFGenerator.CONFIG.FONTS.BODY);
                this.pdf.setFont('DejaVuSans', 'normal');
                const lines = this.wrapText(project.descricao, this.contentWidth);
                this.addTextBlock(lines);
            }

            // Link
            if (project.link) {
                this.checkPageBreak(5);
                this.pdf.setFontSize(PDFGenerator.CONFIG.FONTS.BODY);
                this.pdf.setFont('DejaVuSans', 'normal');

                // Quebrar link longo também
                const linkText = `Link: ${project.link}`;
                const linkLines = this.wrapText(linkText, this.contentWidth);
                this.addTextBlock(linkLines, PDFGenerator.CONFIG.MARGINS.LEFT);
            }

            this.currentY += PDFGenerator.CONFIG.SPACING.ITEM;
        }
    }

    /**
     * Add skills section
     */
    addSkills(skills) {
        this.checkPageBreak(20);

        // Section title
        this.currentY += PDFGenerator.CONFIG.SPACING.SECTION;
        this.pdf.setFontSize(PDFGenerator.CONFIG.FONTS.SECTION);
        this.pdf.setFont('DejaVuSans', 'bold');
        this.setColor('BLACK');
        this.pdf.text(this.getTitle('SKILLS'), PDFGenerator.CONFIG.MARGINS.LEFT, this.currentY);
        this.currentY += PDFGenerator.CONFIG.SPACING.HEADER;

        this.pdf.setFontSize(PDFGenerator.CONFIG.FONTS.BODY);
        this.pdf.setFont('DejaVuSans', 'normal');

        // Check if skills are categorized (object) or simple array
        if (typeof skills === 'object' && !Array.isArray(skills)) {
            // Categorized skills
            const categories = {
                linguagens: this.language === 'pt' ? 'Linguagens' : 'Languages',
                tecnologias: this.language === 'pt' ? 'Tecnologias' : 'Technologies',
                bancoDados: this.language === 'pt' ? 'Banco de Dados' : 'Databases',
                infraestrutura: this.language === 'pt' ? 'Infraestrutura' : 'Infrastructure',
                metodologias: this.language === 'pt' ? 'Metodologias' : 'Methodologies',
                softSkills: 'Soft Skills',
                conceitos: this.language === 'pt' ? 'Conceitos' : 'Concepts'
            };

            for (const [category, skillList] of Object.entries(skills)) {
                if (!skillList?.length) continue;

                this.checkPageBreak(10);

                // Category title
                this.pdf.setFont('DejaVuSans', 'bold');
                const categoryTitle = categories[category] || category;
                this.pdf.text(`${categoryTitle}:`, PDFGenerator.CONFIG.MARGINS.LEFT, this.currentY);
                this.currentY += 5;

                // Skills in category
                this.pdf.setFont('DejaVuSans', 'normal');
                const skillsText = skillList.join(', ');
                const lines = this.wrapText(skillsText, this.contentWidth - 5);
                this.addTextBlock(lines, PDFGenerator.CONFIG.MARGINS.LEFT + 3);

                this.currentY += 3;
            }
        } else {
            // Simple array of skills
            const skillsArray = Array.isArray(skills) ? skills : Object.values(skills).flat();
            const skillsText = skillsArray.join(', ');
            const lines = this.wrapText(skillsText, this.contentWidth);
            this.addTextBlock(lines);
        }

        this.currentY += PDFGenerator.CONFIG.SPACING.SECTION;
    }

    /**
     * Add certifications section
     */
    addCertifications(certifications) {
        this.checkPageBreak(15);

        // Section title
        this.currentY += PDFGenerator.CONFIG.SPACING.SECTION;
        this.pdf.setFontSize(PDFGenerator.CONFIG.FONTS.SECTION);
        this.pdf.setFont('DejaVuSans', 'bold');
        this.setColor('BLACK');
        this.pdf.text(this.getTitle('CERTIFICATIONS'), PDFGenerator.CONFIG.MARGINS.LEFT, this.currentY);
        this.currentY += PDFGenerator.CONFIG.SPACING.HEADER;

        // Certifications list
        this.pdf.setFontSize(PDFGenerator.CONFIG.FONTS.BODY);
        this.pdf.setFont('DejaVuSans', 'normal');

        for (const cert of certifications) {
            this.checkPageBreak(5);
            this.pdf.text(`• ${cert}`, PDFGenerator.CONFIG.MARGINS.LEFT, this.currentY);
            this.currentY += 5;
        }

        this.currentY += PDFGenerator.CONFIG.SPACING.SECTION;
    }

    /**
     * Add education section
     */
    addEducation(education) {
        this.checkPageBreak(20);

        // Section title
        this.currentY += PDFGenerator.CONFIG.SPACING.SECTION;
        this.pdf.setFontSize(PDFGenerator.CONFIG.FONTS.SECTION);
        this.pdf.setFont('DejaVuSans', 'bold');
        this.setColor('BLACK');
        this.pdf.text(this.getTitle('EDUCATION'), PDFGenerator.CONFIG.MARGINS.LEFT, this.currentY);
        this.currentY += PDFGenerator.CONFIG.SPACING.HEADER;

        this.pdf.setFontSize(PDFGenerator.CONFIG.FONTS.BODY);
        this.pdf.setFont('DejaVuSans', 'normal');

        for (const edu of education) {
            this.checkPageBreak(15);

            // Course title
            this.pdf.setFont('DejaVuSans', 'bold');
            const lines = this.wrapText(edu.curso, this.contentWidth);
            this.addTextBlock(lines, PDFGenerator.CONFIG.MARGINS.LEFT);

            // Institution, period and status
            this.pdf.setFont('DejaVuSans', 'normal');
            const institutionText = `${edu.instituicao} • ${edu.periodo} • ${edu.status}`;
            this.pdf.text(institutionText, PDFGenerator.CONFIG.MARGINS.LEFT, this.currentY);
            this.currentY += 5;

            // Description if available
            if (edu.descricao) {
                const descLines = this.wrapText(edu.descricao, this.contentWidth);
                this.addTextBlock(descLines, PDFGenerator.CONFIG.MARGINS.LEFT);
            }

            this.currentY += 3;
        }

        this.currentY += PDFGenerator.CONFIG.SPACING.SECTION;
    }

    /**
     * Add footer
     */
    addFooter(cvData) {
        const pageCount = this.pdf.internal.getNumberOfPages();

        for (let i = 1; i <= pageCount; i++) {
            this.pdf.setPage(i);
            this.pdf.setFontSize(PDFGenerator.CONFIG.FONTS.SMALL);
            this.pdf.setFont('DejaVuSans', 'normal');
            this.setColor('GRAY');

            const pageText = this.language === 'en' ? 'Page' : 'Página';
            const ofText = this.language === 'en' ? 'of' : 'de';
            const footer = `${cvData.nome} - ${pageText} ${i} ${ofText} ${pageCount}`;

            const footerWidth = this.pdf.getTextWidth(footer);
            const footerX = (this.pageWidth - footerWidth) / 2;
            this.pdf.text(footer, footerX, this.pageHeight - 10);
        }
    }

    /**
     * Save PDF
     */
    savePDF(name) {
    const filename = `${name}.pdf`;
    this.pdf.save(filename);
    }

    /**
     * Show success notification
     */
    showSuccess() {
        const message = this.language === 'en'
            ? '✅ ATS-Optimized PDF Generated!'
            : '✅ PDF ATS-Otimizado Gerado!';
        this.notify('#27ae60', message);
    }

    /**
     * Show error notification
     */
    showError() {
        const message = this.language === 'en'
            ? '❌ PDF Generation Error!'
            : '❌ Erro na Geração do PDF!';
        this.notify('#e74c3c', message);
    }

    /**
     * Show notification
     */
    notify(color, message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${color};
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 14px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            font-family: system-ui, sans-serif;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Animate in
        requestAnimationFrame(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        });

        // Animate out
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Export
window.PDFGenerator = PDFGenerator;
console.log('[PDFGenerator] ATS-Optimized PDF Generator v7.0.0 loaded successfully');