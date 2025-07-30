/**
 * ATS-Optimized Professional PDF Generation Module
 * 
 * Creates ATS-compliant PDF resumes with clean design, plain text formatting,
 * and machine-readable structure. Prioritizes text extractability and keyword
 * recognition while maintaining professional visual appeal.
 * 
 * @author Angelo Ferdinand Imon Spanó
 * @version 6.0.0 - ATS Optimized
 * @since 2025-01-29
 */

class PDFGenerator {
    /**
     * Static constants optimized for ATS parsing and professional presentation
     */
    static CONSTANTS = {
        // Library loading configuration
        MAX_LOAD_ATTEMPTS: 50,
        LOAD_CHECK_INTERVAL: 200,

        // ATS-optimized spacing for clear section separation
        SPACING: {
            SECTION_MARGIN: 12,
            ITEM_MARGIN: 6,
            LINE_HEIGHT: 5,
            PARAGRAPH_SPACING: 4,
            HEADER_SPACING: 8
        },

        // ATS-friendly color palette (minimal colors for text differentiation)
        COLORS: {
            PRIMARY: [44, 62, 80],      // Navy blue for name only
            TEXT: [0, 0, 0],            // Pure black for maximum readability
            LIGHT_GRAY: [100, 100, 100] // Light gray for supporting text
        },

        // ATS-optimized typography (clear hierarchy without decorative elements)
        FONT_SIZES: {
            NAME: 20,           // Name title (large but not excessive)
            SECTION: 14,        // Section headers
            SUBSECTION: 12,     // Job titles and project names
            BODY: 11,           // Standard body text
            SMALL: 10           // Supporting information
        },

        // Standard document margins for ATS parsing
        PAGE_MARGINS: {
            TOP: 20,
            BOTTOM: 20,
            LEFT: 20,
            RIGHT: 20
        }
    };

    /**
     * Initialize ATS-optimized PDF generator
     */
    constructor() {
        /** @type {Object} jsPDF instance reference */
        this.pdf = null;

        /** @type {Object} ATS-optimized document configuration */
        this.config = this.initializeATSConfiguration();

        /** @type {number} Current Y position tracking */
        this.currentY = PDFGenerator.CONSTANTS.PAGE_MARGINS.TOP;

        /** @type {boolean} PDF library availability status */
        this.isLibraryLoaded = false;

        /** @type {Object} Page dimension calculations */
        this.pageInfo = {};

        this.checkLibraryAvailability();
    }

    /**
     * Initializes ATS-optimized configuration for maximum compatibility
     * @returns {Object} Complete ATS-friendly configuration
     */
    initializeATSConfiguration() {
        return {
            // Standard margins for consistent parsing
            margins: PDFGenerator.CONSTANTS.PAGE_MARGINS,

            // Minimal color scheme for ATS compatibility
            colors: PDFGenerator.CONSTANTS.COLORS,

            // Clear font hierarchy for machine reading
            fontSize: PDFGenerator.CONSTANTS.FONT_SIZES,

            // Optimized spacing for content separation
            spacing: PDFGenerator.CONSTANTS.SPACING,

            // Content width calculation for text wrapping
            get contentWidth() {
                return 210 - this.margins.LEFT - this.margins.RIGHT; // A4 width minus margins
            }
        };
    }

    /**
     * Enhanced library availability detection
     */
    checkLibraryAvailability() {
        let attempts = 0;

        const checkInterval = setInterval(() => {
            attempts++;

            if (this.isJsPDFAvailable()) {
                clearInterval(checkInterval);
                this.isLibraryLoaded = true;
                console.log('[PDFGenerator] ATS-Optimized PDF library loaded successfully');
            } else if (attempts >= PDFGenerator.CONSTANTS.MAX_LOAD_ATTEMPTS) {
                clearInterval(checkInterval);
                this.isLibraryLoaded = false;
                this.loadLibraryDynamically();
            }
        }, PDFGenerator.CONSTANTS.LOAD_CHECK_INTERVAL);
    }

    /**
     * Comprehensive jsPDF availability verification
     * @returns {boolean} Library availability status
     */
    isJsPDFAvailable() {
        return (window.jspdf && typeof window.jspdf.jsPDF === 'function') ||
            (typeof window.jsPDF === 'function') ||
            (typeof jsPDF === 'function');
    }

    /**
     * Dynamic library loading with enhanced error recovery
     */
    async loadLibraryDynamically() {
        try {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script.crossOrigin = 'anonymous';

            script.onload = () => {
                this.isLibraryLoaded = true;
                console.log('[PDFGenerator] Library loaded dynamically');
            };

            script.onerror = () => {
                console.error('[PDFGenerator] Dynamic loading failed');
            };

            document.head.appendChild(script);
        } catch (error) {
            console.error('[PDFGenerator] Library loading error:', error);
        }
    }

    /**
     * Enhanced PDF constructor resolution
     * @returns {Function} jsPDF constructor
     * @throws {Error} When no constructor is available
     */
    getPDFConstructor() {
        if (window.jspdf && typeof window.jspdf.jsPDF === 'function') {
            return window.jspdf.jsPDF;
        }
        if (typeof window.jsPDF === 'function') {
            return window.jsPDF;
        }
        if (typeof jsPDF === 'function') {
            return jsPDF;
        }
        throw new Error('PDF library constructor not accessible');
    }

    /**
     * ATS-optimized PDF generation with machine-readable structure
     * @param {Object} cvData - Complete curriculum vitae data
     * @param {string} language - Localization language code
     * @returns {Promise<void>} Generation completion promise
     */
    async generatePDF(cvData, language = 'pt') {
        if (!this.isLibraryLoaded) {
            throw new Error('PDF generation library not available');
        }

        if (!cvData || !cvData.nome) {
            throw new Error('Invalid CV data provided');
        }

        try {
            this.initializeATSDocument();
            this.generateATSHeader(cvData);
            this.generateATSContent(cvData, language);
            this.addATSFooter(cvData);
            this.saveATSPDF(cvData.nome);
            this.showSuccessNotification();
        } catch (error) {
            console.error('[PDFGenerator] ATS generation failed:', error);
            this.showErrorNotification();
            throw error;
        }
    }

    /**
     * Initializes PDF document with ATS-optimized settings
     */
    initializeATSDocument() {
        const PDFConstructor = this.getPDFConstructor();
        this.pdf = new PDFConstructor('portrait', 'mm', 'a4');

        // Calculate page dimensions
        this.pageInfo = {
            width: this.pdf.internal.pageSize.getWidth(),
            height: this.pdf.internal.pageSize.getHeight(),
            centerX: this.pdf.internal.pageSize.getWidth() / 2
        };

        this.currentY = this.config.margins.TOP;

        // ATS-friendly document metadata
        this.pdf.setProperties({
            title: 'Resume - Curriculum Vitae',
            subject: 'Professional Resume',
            author: 'Angelo Ferdinand Imon Spanó',
            creator: 'ATS-Optimized CV Generator v6.0',
            producer: 'jsPDF ATS Generator'
        });

        // Set standard font for maximum compatibility
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.setTextColor(0, 0, 0); // Pure black text
    }

    /**
     * Generates ATS-optimized header with clean linear layout
     * @param {Object} cvData - Personal and contact information
     */
    generateATSHeader(cvData) {
        // Professional name with navy blue color (only colored element)
        this.pdf.setFontSize(this.config.fontSize.NAME);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.setTextColor(...this.config.colors.PRIMARY); // Navy blue for name only

        const name = cvData.nome.toUpperCase();
        this.centerText(name, this.currentY);
        this.currentY += this.config.spacing.HEADER_SPACING;

        // Professional subtitle in black
        if (cvData.cargo || cvData.area) {
            this.pdf.setFontSize(this.config.fontSize.SUBSECTION);
            this.pdf.setFont('helvetica', 'normal');
            this.pdf.setTextColor(0, 0, 0); // Back to black
            const subtitle = cvData.cargo || cvData.area || 'Desenvolvedor Profissional';
            this.centerText(subtitle, this.currentY);
            this.currentY += this.config.spacing.HEADER_SPACING;
        }

        // ATS-friendly contact information (linear layout)
        this.addATSContactInformation(cvData);
    }

    /**
     * Adds ATS-optimized contact information with direct URLs
     * @param {Object} cvData - Contact data
     */
    addATSContactInformation(cvData) {
        this.pdf.setFontSize(this.config.fontSize.BODY);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.setTextColor(0, 0, 0); // Pure black for ATS

        const contactLines = [];

        // Email (direct text, no hyperlink)
        if (cvData.email) {
            contactLines.push(`Email: ${cvData.email}`);
        }

        // GitHub (full URL for ATS parsing)
        if (cvData.links?.github) {
            contactLines.push(`GitHub: ${cvData.links.github}`);
        }

        // LinkedIn (full URL for ATS parsing)
        if (cvData.links?.linkedin) {
            contactLines.push(`LinkedIn: ${cvData.links.linkedin}`);
        }

        // Phone if available
        if (cvData.telefone) {
            contactLines.push(`Telefone: ${cvData.telefone}`);
        }

        // Render contact information in clean lines
        contactLines.forEach(line => {
            this.centerText(line, this.currentY);
            this.currentY += 6;
        });

        this.currentY += this.config.spacing.HEADER_SPACING;

        // Add separator line for visual organization
        this.addSeparatorLine();
    }

    /**
     * Generates ATS-optimized main content with clear section structure
     * @param {Object} cvData - Complete curriculum data
     * @param {string} language - Content language
     */
    generateATSContent(cvData, language) {
        // Professional summary
        if (cvData.resumo) {
            this.addATSSection('RESUMO PROFISSIONAL', cvData.resumo);
        }

        // Work experience
        if (cvData.experiencia?.length > 0) {
            this.addATSExperienceSection(cvData.experiencia);
        }

        // Projects
        if (cvData.projetos?.length > 0) {
            this.addATSProjectsSection(cvData.projetos);
        }

        // Technical skills
        if (cvData.habilidades?.length > 0) {
            this.addATSSkillsSection(cvData.habilidades);
        }

        // Education
        if (cvData.formacao) {
            this.addATSSection('FORMACAO ACADEMICA', cvData.formacao);
        }

        // Certifications
        if (cvData.certificacoes?.length > 0) {
            this.addATSCertificationsSection(cvData.certificacoes);
        }
    }

    /**
     * Adds ATS-optimized section with clean formatting
     * @param {string} title - Section title
     * @param {string} content - Section content
     */
    addATSSection(title, content) {
        this.checkPageBreak(20);

        // Section header with clear separation
        this.addATSSectionHeader(title);

        // Clean content presentation
        this.pdf.setFontSize(this.config.fontSize.BODY);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.setTextColor(0, 0, 0);

        const wrappedContent = this.wrapText(content, this.config.contentWidth);
        this.addWrappedText(wrappedContent);

        this.currentY += this.config.spacing.SECTION_MARGIN;
    }

    /**
     * ATS-optimized section header with clear visual hierarchy
     * @param {string} title - Section title
     */
    addATSSectionHeader(title) {
        // Add some space before section
        this.currentY += this.config.spacing.SECTION_MARGIN;

        // Section title in bold black
        this.pdf.setFontSize(this.config.fontSize.SECTION);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.setTextColor(0, 0, 0);

        this.pdf.text(title, this.config.margins.LEFT, this.currentY);
        this.currentY += this.config.spacing.HEADER_SPACING;

        // Subtle underline for visual separation (ATS-friendly)
        this.pdf.setLineWidth(0.2);
        this.pdf.setDrawColor(0, 0, 0);
        this.pdf.line(
            this.config.margins.LEFT,
            this.currentY - 3,
            this.config.margins.LEFT + this.config.contentWidth,
            this.currentY - 3
        );
    }

    /**
     * ATS-optimized experience section
     * @param {Array} experiences - Work experience data
     */
    addATSExperienceSection(experiences) {
        this.addATSSectionHeader('EXPERIENCIA PROFISSIONAL');

        experiences.forEach((exp, index) => {
            this.checkPageBreak(25);

            // Job title
            this.pdf.setFontSize(this.config.fontSize.SUBSECTION);
            this.pdf.setFont('helvetica', 'bold');
            this.pdf.setTextColor(0, 0, 0);
            this.pdf.text(exp.cargo || 'Cargo', this.config.margins.LEFT, this.currentY);
            this.currentY += 6;

            // Company and period
            this.pdf.setFontSize(this.config.fontSize.BODY);
            this.pdf.setFont('helvetica', 'normal');

            const companyText = `${exp.empresa || 'Empresa'} | ${exp.periodo || 'Período'}`;
            this.pdf.text(companyText, this.config.margins.LEFT, this.currentY);
            this.currentY += 6;

            // Responsibilities with clean bullets
            if (exp.tarefas?.length > 0) {
                exp.tarefas.forEach(task => {
                    this.checkPageBreak(6);
                    const bulletText = `• ${task}`;
                    const wrappedTask = this.wrapText(bulletText, this.config.contentWidth - 5);
                    this.addWrappedText(wrappedTask, this.config.margins.LEFT + 3);
                });
            }

            this.currentY += this.config.spacing.ITEM_MARGIN;
        });
    }

    /**
     * ATS-optimized projects section
     * @param {Array} projects - Project data
     */
    addATSProjectsSection(projects) {
        this.addATSSectionHeader('PROJETOS DESTACADOS');

        projects.forEach((project, index) => {
            this.checkPageBreak(15);

            // Project name
            this.pdf.setFontSize(this.config.fontSize.SUBSECTION);
            this.pdf.setFont('helvetica', 'bold');
            this.pdf.setTextColor(0, 0, 0);
            this.pdf.text(project.nome || 'Projeto', this.config.margins.LEFT, this.currentY);
            this.currentY += 6;

            // Project description
            if (project.descricao) {
                this.pdf.setFontSize(this.config.fontSize.BODY);
                this.pdf.setFont('helvetica', 'normal');

                const wrappedDesc = this.wrapText(project.descricao, this.config.contentWidth);
                this.addWrappedText(wrappedDesc);
            }

            // Project link (direct URL for ATS)
            if (project.link) {
                this.pdf.setFontSize(this.config.fontSize.BODY);
                this.pdf.text(`Link: ${project.link}`, this.config.margins.LEFT, this.currentY);
                this.currentY += 6;
            }

            this.currentY += this.config.spacing.ITEM_MARGIN;
        });
    }

    /**
     * ATS-optimized skills section
     * @param {Array} skills - Technical skills
     */
    addATSSkillsSection(skills) {
        this.addATSSectionHeader('HABILIDADES TECNICAS');

        this.pdf.setFontSize(this.config.fontSize.BODY);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.setTextColor(0, 0, 0);

        // Skills as comma-separated list (ATS-friendly)
        const skillsText = skills.join(', ');
        const wrappedSkills = this.wrapText(skillsText, this.config.contentWidth);
        this.addWrappedText(wrappedSkills);

        this.currentY += this.config.spacing.SECTION_MARGIN;
    }

    /**
     * ATS-optimized certifications section
     * @param {Array} certifications - Certifications data
     */
    addATSCertificationsSection(certifications) {
        this.addATSSectionHeader('CERTIFICACOES');

        this.pdf.setFontSize(this.config.fontSize.BODY);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.setTextColor(0, 0, 0);

        certifications.forEach(cert => {
            this.checkPageBreak(6);
            this.pdf.text(`• ${cert}`, this.config.margins.LEFT, this.currentY);
            this.currentY += 6;
        });

        this.currentY += this.config.spacing.SECTION_MARGIN;
    }

    /**
     * Standard text wrapping for ATS compatibility
     * @param {string} text - Text to wrap
     * @param {number} maxWidth - Maximum width
     * @returns {Array<string>} Wrapped text lines
     */
    wrapText(text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';

        words.forEach(word => {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const testWidth = this.pdf.getTextWidth(testLine);

            if (testWidth <= maxWidth) {
                currentLine = testLine;
            } else {
                if (currentLine) {
                    lines.push(currentLine);
                    currentLine = word;
                } else {
                    lines.push(word);
                    currentLine = '';
                }
            }
        });

        if (currentLine) {
            lines.push(currentLine);
        }

        return lines;
    }

    /**
     * Adds wrapped text with consistent spacing
     * @param {Array<string>} lines - Text lines
     * @param {number} leftMargin - Left margin override
     */
    addWrappedText(lines, leftMargin = null) {
        const margin = leftMargin || this.config.margins.LEFT;

        lines.forEach(line => {
            this.checkPageBreak(this.config.spacing.LINE_HEIGHT);
            this.pdf.text(line, margin, this.currentY);
            this.currentY += this.config.spacing.LINE_HEIGHT;
        });
    }

    /**
     * Intelligent page break management
     * @param {number} requiredSpace - Required space
     */
    checkPageBreak(requiredSpace) {
        if (this.currentY + requiredSpace > this.pageInfo.height - this.config.margins.BOTTOM) {
            this.pdf.addPage();
            this.currentY = this.config.margins.TOP;
        }
    }

    /**
     * Centers text horizontally
     * @param {string} text - Text to center
     * @param {number} y - Y position
     */
    centerText(text, y) {
        const textWidth = this.pdf.getTextWidth(text);
        const x = (this.pageInfo.width - textWidth) / 2;
        this.pdf.text(text, x, y);
    }

    /**
     * Adds visual separator line
     */
    addSeparatorLine() {
        this.pdf.setLineWidth(0.3);
        this.pdf.setDrawColor(150, 150, 150);
        this.pdf.line(
            this.config.margins.LEFT + 30,
            this.currentY,
            this.pageInfo.width - this.config.margins.RIGHT - 30,
            this.currentY
        );
        this.currentY += this.config.spacing.HEADER_SPACING;
    }

    /**
     * ATS-friendly footer
     * @param {Object} cvData - CV data
     */
    addATSFooter(cvData) {
        const pageCount = this.pdf.internal.getNumberOfPages();

        for (let i = 1; i <= pageCount; i++) {
            this.pdf.setPage(i);

            this.pdf.setFontSize(this.config.fontSize.SMALL);
            this.pdf.setFont('helvetica', 'normal');
            this.pdf.setTextColor(100, 100, 100);

            // Simple footer
            const footerText = `${cvData.nome || 'Angelo Ferdinand Imon Spanó'} - Página ${i} de ${pageCount}`;
            const footerWidth = this.pdf.getTextWidth(footerText);
            const footerX = (this.pageInfo.width - footerWidth) / 2;
            this.pdf.text(footerText, footerX, this.pageInfo.height - 10);
        }
    }

    /**
     * Saves ATS-optimized PDF
     * @param {string} name - Base filename
     */
    saveATSPDF(name) {
        const sanitizedName = name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `${sanitizedName}_Resume_ATS_${timestamp}.pdf`;
        this.pdf.save(filename);
    }

    /**
     * Enhanced success notification
     */
    showSuccessNotification() {
        const notification = this.createNotification(
            '#27ae60',
            '✅ PDF ATS-Optimized Gerado com Sucesso!'
        );
        this.displayNotification(notification);
    }

    /**
     * Enhanced error notification
     */
    showErrorNotification() {
        const notification = this.createNotification(
            '#e74c3c',
            '❌ Erro na Geração do PDF!'
        );
        this.displayNotification(notification);
    }

    /**
     * Creates notification element
     * @param {string} backgroundColor - Background color
     * @param {string} message - Message text
     * @returns {HTMLElement} Notification element
     */
    createNotification(backgroundColor, message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${backgroundColor};
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 14px;
            z-index: 10000;
            box-shadow: 0 8px 32px rgba(0,0,0,0.12);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.1);
        `;
        notification.textContent = message;
        return notification;
    }

    /**
     * Displays notification with timing
     * @param {HTMLElement} notification - Notification element
     */
    displayNotification(notification) {
        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 300);
            }
        }, 4000);
    }
}

// Enhanced global export
window.PDFGenerator = PDFGenerator;
console.log('[PDFGenerator] ATS-Optimized Professional PDF Generator v6.0.0 loaded successfully');