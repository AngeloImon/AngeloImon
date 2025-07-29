/**
 * PDF Generation Module
 * 
 * Handles professional PDF export functionality with optimized layout,
 * typography, and formatting. Implements multi-page support, proper
 * content flow, and accessibility considerations for generated documents.
 * 
 * @author Angelo Ferdinand Imon Spanó
 * @version 2.0.0
 * @since 2025-01-29
 */

class PDFGenerator {
    /**
     * Initialize PDF generator with configuration and state management
     */
    constructor() {
        /** @type {Object} jsPDF instance reference */
        this.pdf = null;

        /** @type {Object} Current document configuration */
        this.config = AppConfig.PDF_CONFIG;

        /** @type {number} Current Y position for content placement */
        this.currentY = this.config.margin;

        /** @type {number} Current page number */
        this.currentPage = 1;

        /** @type {boolean} PDF library loading state */
        this.isLibraryLoaded = false;

        /** @type {Object} Font metrics for text measurement */
        this.fontMetrics = {};

        this.checkLibraryAvailability();
    }

    /**
     * Verifies jsPDF library availability with enhanced detection and timing
     * Implements multiple detection methods and delayed initialization to handle
     * asynchronous library loading scenarios in different environments
     */
    checkLibraryAvailability() {
        // Implement delayed verification to accommodate asynchronous library loading
        setTimeout(() => {
            // Multi-method library detection for comprehensive compatibility
            const jsPDFAvailable = typeof window.jsPDF !== 'undefined' ||
                typeof jsPDF !== 'undefined' ||
                (window.jspdf && window.jspdf.jsPDF);

            if (jsPDFAvailable) {
                this.isLibraryLoaded = true;
                this.initializeFontMetrics();

                if (AppConfig.DEBUG) {
                    console.log('[PDFGenerator] jsPDF library detected and verified successfully');
                }
            } else {
                console.warn('[PDFGenerator] jsPDF library not available, attempting dynamic load');
                // Fallback to dynamic library loading for improved reliability
                this.loadLibraryDynamically();
            }
        }, 100); // Strategic delay for library initialization completion
    }

    /**
     * Dynamically loads jsPDF library if not available
     */
    async loadLibraryDynamically() {
        try {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script.onload = () => {
                this.isLibraryLoaded = true;
                this.initializeFontMetrics();
                console.log('[PDFGenerator] jsPDF library loaded dynamically');
            };

            document.head.appendChild(script);
        } catch (error) {
            console.error('[PDFGenerator] Failed to load jsPDF library:', error);
        }
    }

    /**
     * Initializes comprehensive font metrics system for precise text measurement
     * Calculates character widths and line heights across all font sizes with
     * robust error handling and fallback metric generation
     */
    initializeFontMetrics() {
        if (!this.isLibraryLoaded) return;

        try {
            // Create temporary PDF instance for metric calculation
            const PDFConstructor = window.jsPDF || jsPDF || (window.jspdf && window.jspdf.jsPDF);
            const tempPdf = new PDFConstructor();

            // Generate precise metrics for each configured font size
            Object.keys(this.config.fontSize).forEach(key => {
                const fontSize = this.config.fontSize[key];
                tempPdf.setFontSize(fontSize);

                this.fontMetrics[key] = {
                    fontSize: fontSize,
                    charWidth: tempPdf.getTextWidth('W') / fontSize,
                    lineHeight: fontSize * 1.2
                };
            });

            if (AppConfig.DEBUG) {
                console.log('[PDFGenerator] Font metrics calculation completed:', this.fontMetrics);
            }
        } catch (error) {
            console.error('[PDFGenerator] Font metrics initialization failed, applying fallback values:', error);

            // Implement fallback metrics for graceful degradation
            Object.keys(this.config.fontSize).forEach(key => {
                this.fontMetrics[key] = {
                    fontSize: this.config.fontSize[key],
                    charWidth: 0.6, // Standard character width approximation
                    lineHeight: this.config.fontSize[key] * 1.2 // Standard line height ratio
                };
            });
        }
    }

    /**
     * Generates complete PDF document from CV data
     * @param {Object} cvData - Complete CV data object
     * @param {string} language - Current language for localization
     * @returns {Promise<void>} Resolves when PDF generation is complete
     * @throws {Error} If PDF generation fails
     */
    async generatePDF(cvData, language = 'pt') {
        PerformanceMonitor.start('generatePDF');

        if (!this.isLibraryLoaded) {
            throw new Error(AppConfig.INTERFACE_TEXTS[language].errors.pdfLibraryNotLoaded);
        }

        if (!cvData || Object.keys(cvData).length === 0) {
            throw new Error(AppConfig.INTERFACE_TEXTS[language].errors.dataNotLoaded);
        }

        try {
            this.initializeDocument();
            this.generateHeader(cvData);
            this.generateContent(cvData, language);
            this.addFooter(cvData);
            this.savePDF(cvData.nome || 'CV');

            if (AppConfig.DEBUG) {
                console.log('[PDFGenerator] PDF generated successfully');
            }

        } catch (error) {
            console.error('[PDFGenerator] PDF generation failed:', error);
            throw new Error(AppConfig.INTERFACE_TEXTS[language].errors.pdfGenerationError);
        } finally {
            PerformanceMonitor.end('generatePDF');
        }
    }

    /**
     * Initializes new PDF document with comprehensive configuration and error handling
     * Implements fallback constructor detection and optimal document settings
     * for professional CV generation with proper metadata
     */
    initializeDocument() {
        // Multi-source constructor resolution for maximum compatibility
        const PDFConstructor = window.jsPDF || jsPDF || (window.jspdf && window.jspdf.jsPDF);

        if (!PDFConstructor) {
            throw new Error('jsPDF library constructor not accessible');
        }

        // Initialize PDF with professional A4 portrait configuration
        this.pdf = new PDFConstructor('portrait', 'mm', 'a4');
        this.currentY = this.config.margin;
        this.currentPage = 1;

        // Configure document metadata for professional presentation
        this.pdf.setProperties({
            title: 'Professional CV',
            subject: 'Curriculum Vitae',
            author: 'Angelo Ferdinand Imon Spanó',
            creator: 'CV Application',
            producer: 'jsPDF'
        });

        // Establish default typography settings for consistent formatting
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.setFontSize(this.config.fontSize.normal);
    }

    /**
     * Generates professional document header with contact information
     * @param {Object} cvData - CV data containing personal information
     */
    generateHeader(cvData) {
        const centerX = this.pdf.internal.pageSize.getWidth() / 2;

        // Main name title
        this.pdf.setFontSize(this.config.fontSize.title);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.setTextColor(this.config.colors.primary);

        const nameText = cvData.nome || 'Professional CV';
        const nameWidth = this.pdf.getTextWidth(nameText);
        this.pdf.text(nameText, centerX - nameWidth / 2, this.currentY);

        this.currentY += 12;

        // Contact information
        this.pdf.setFontSize(this.config.fontSize.normal);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.setTextColor(this.config.colors.text);

        // Email
        if (cvData.email) {
            const emailText = `📧 ${cvData.email}`;
            const emailWidth = this.pdf.getTextWidth(emailText);
            this.pdf.text(emailText, centerX - emailWidth / 2, this.currentY);
            this.currentY += 6;
        }

        // Links
        if (cvData.links) {
            let linksText = '';

            if (cvData.links.github) {
                linksText += `🔗 GitHub: ${cvData.links.github}`;
            }

            if (cvData.links.linkedin) {
                if (linksText) linksText += ' | ';
                linksText += `💼 LinkedIn: ${cvData.links.linkedin}`;
            }

            if (linksText) {
                this.pdf.setFontSize(this.config.fontSize.link);
                const linksWidth = this.pdf.getTextWidth(linksText);
                this.pdf.text(linksText, centerX - linksWidth / 2, this.currentY);
                this.currentY += 8;
            }
        }

        // Separator line
        this.pdf.setDrawColor(this.config.colors.primary);
        this.pdf.setLineWidth(0.5);
        this.pdf.line(this.config.margin, this.currentY,
            this.pdf.internal.pageSize.getWidth() - this.config.margin, this.currentY);

        this.currentY += 10;
    }

    /**
     * Generates main content sections with proper formatting
     * @param {Object} cvData - Complete CV data
     * @param {string} language - Current language
     */
    generateContent(cvData, language) {
        // Professional summary
        if (cvData.resumo) {
            this.addSection(cvData.secoes?.resumo || 'Resumo', cvData.resumo);
        }

        // Professional experience
        if (cvData.experiencia && cvData.experiencia.length > 0) {
            this.addExperienceSection(cvData.experiencia, cvData.secoes?.experiencia || 'Experiência Profissional');
        }

        // Projects
        if (cvData.projetos && cvData.projetos.length > 0) {
            this.addProjectsSection(cvData.projetos, cvData.secoes?.projetos || 'Projetos');
        }

        // Technical skills
        if (cvData.habilidades && cvData.habilidades.length > 0) {
            this.addSkillsSection(cvData.habilidades, cvData.secoes?.habilidades || 'Habilidades Técnicas');
        }

        // Education
        if (cvData.formacao) {
            this.addSection(cvData.secoes?.formacao || 'Formação', cvData.formacao);
        }

        // Certifications
        if (cvData.certificacoes && cvData.certificacoes.length > 0) {
            this.addCertificationsSection(cvData.certificacoes, cvData.secoes?.certificacoes || 'Certificações');
        }
    }

    /**
     * Adds a standard section with title and content
     * @param {string} title - Section title
     * @param {string} content - Section content
     */
    addSection(title, content) {
        this.checkPageBreak(30);

        // Section title
        this.pdf.setFontSize(this.config.fontSize.sectionTitle);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.setTextColor(this.config.colors.primary);
        this.pdf.text(title, this.config.margin, this.currentY);

        this.currentY += 8;

        // Section content
        this.pdf.setFontSize(this.config.fontSize.normal);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.setTextColor(this.config.colors.text);

        const wrappedText = this.wrapText(content, this.config.maxWidth);
        this.addWrappedText(wrappedText);

        this.currentY += 10;
    }

    /**
     * Adds professional experience section with structured formatting
     * @param {Array} experiences - Array of experience objects
     * @param {string} title - Section title
     */
    addExperienceSection(experiences, title) {
        this.checkPageBreak(40);

        // Section title
        this.addSectionTitle(title);

        experiences.forEach((exp, index) => {
            this.checkPageBreak(25);

            // Job title and company
            this.pdf.setFontSize(this.config.fontSize.jobTitle);
            this.pdf.setFont('helvetica', 'bold');
            this.pdf.setTextColor(this.config.colors.primary);

            const jobTitle = `${exp.cargo} - ${exp.empresa}`;
            this.pdf.text(jobTitle, this.config.margin, this.currentY);
            this.currentY += 6;

            // Period
            if (exp.periodo) {
                this.pdf.setFontSize(this.config.fontSize.small);
                this.pdf.setFont('helvetica', 'italic');
                this.pdf.setTextColor(this.config.colors.secondary);
                this.pdf.text(exp.periodo, this.config.margin, this.currentY);
                this.currentY += 6;
            }

            // Tasks
            if (exp.tarefas && exp.tarefas.length > 0) {
                this.pdf.setFontSize(this.config.fontSize.normal);
                this.pdf.setFont('helvetica', 'normal');
                this.pdf.setTextColor(this.config.colors.text);

                exp.tarefas.forEach(task => {
                    this.checkPageBreak(8);
                    const bulletText = `• ${task}`;
                    const wrappedBullet = this.wrapText(bulletText, this.config.maxWidth - 5);
                    this.addWrappedText(wrappedBullet, this.config.margin + 5);
                });
            }

            this.currentY += 5;
        });

        this.currentY += 5;
    }

    /**
     * Adds projects section with links and descriptions
     * @param {Array} projects - Array of project objects
     * @param {string} title - Section title
     */
    addProjectsSection(projects, title) {
        this.checkPageBreak(30);

        this.addSectionTitle(title);

        projects.forEach((project, index) => {
            this.checkPageBreak(15);

            // Project name
            this.pdf.setFontSize(this.config.fontSize.jobTitle);
            this.pdf.setFont('helvetica', 'bold');
            this.pdf.setTextColor(this.config.colors.primary);
            this.pdf.text(project.nome, this.config.margin, this.currentY);
            this.currentY += 6;

            // Project description
            if (project.descricao) {
                this.pdf.setFontSize(this.config.fontSize.normal);
                this.pdf.setFont('helvetica', 'normal');
                this.pdf.setTextColor(this.config.colors.text);

                const wrappedDesc = this.wrapText(project.descricao, this.config.maxWidth);
                this.addWrappedText(wrappedDesc);
            }

            // Project link
            if (project.link) {
                this.pdf.setFontSize(this.config.fontSize.link);
                this.pdf.setFont('helvetica', 'normal');
                this.pdf.setTextColor(this.config.colors.primary);
                this.pdf.text(`🔗 ${project.link}`, this.config.margin, this.currentY);
                this.currentY += 6;
            }

            this.currentY += 3;
        });

        this.currentY += 5;
    }

    /**
     * Adds technical skills section with organized layout
     * @param {Array} skills - Array of skill strings
     * @param {string} title - Section title
     */
    addSkillsSection(skills, title) {
        this.checkPageBreak(20);

        this.addSectionTitle(title);

        this.pdf.setFontSize(this.config.fontSize.normal);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.setTextColor(this.config.colors.text);

        const skillsText = skills.join(' • ');
        const wrappedSkills = this.wrapText(skillsText, this.config.maxWidth);
        this.addWrappedText(wrappedSkills);

        this.currentY += 10;
    }

    /**
     * Adds certifications section with bullet points
     * @param {Array} certifications - Array of certification strings
     * @param {string} title - Section title
     */
    addCertificationsSection(certifications, title) {
        this.checkPageBreak(20);

        this.addSectionTitle(title);

        this.pdf.setFontSize(this.config.fontSize.normal);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.setTextColor(this.config.colors.text);

        certifications.forEach(cert => {
            this.checkPageBreak(6);
            const bulletText = `• ${cert}`;
            this.pdf.text(bulletText, this.config.margin, this.currentY);
            this.currentY += 6;
        });

        this.currentY += 5;
    }

    /**
     * Adds formatted section title
     * @param {string} title - Section title text
     */
    addSectionTitle(title) {
        this.pdf.setFontSize(this.config.fontSize.sectionTitle);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.setTextColor(this.config.colors.primary);
        this.pdf.text(title, this.config.margin, this.currentY);
        this.currentY += 10;
    }

    /**
     * Wraps text to fit within specified width
     * @param {string} text - Text to wrap
     * @param {number} maxWidth - Maximum width in mm
     * @returns {Array<string>} Array of wrapped text lines
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
                    // Word is too long, force break
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
     * Adds wrapped text with proper line spacing
     * @param {Array<string>} lines - Array of text lines
     * @param {number} leftMargin - Left margin for text
     */
    addWrappedText(lines, leftMargin = null) {
        const margin = leftMargin || this.config.margin;

        lines.forEach(line => {
            this.checkPageBreak(this.config.lineHeight);
            this.pdf.text(line, margin, this.currentY);
            this.currentY += this.config.lineHeight;
        });
    }

    /**
     * Checks if page break is needed and creates new page if necessary
     * @param {number} requiredSpace - Required space in mm
     */
    checkPageBreak(requiredSpace) {
        const pageHeight = this.pdf.internal.pageSize.getHeight();
        const bottomMargin = 30;

        if (this.currentY + requiredSpace > pageHeight - bottomMargin) {
            this.addPageBreak();
        }
    }

    /**
     * Adds a new page with proper initialization
     */
    addPageBreak() {
        this.pdf.addPage();
        this.currentPage++;
        this.currentY = this.config.margin;

        if (AppConfig.DEBUG) {
            console.log(`[PDFGenerator] Added page ${this.currentPage}`);
        }
    }

    /**
     * Adds professional footer to the document
     * @param {Object} cvData - CV data for footer content
     */
    addFooter(cvData) {
        const pageCount = this.pdf.internal.getNumberOfPages();

        for (let i = 1; i <= pageCount; i++) {
            this.pdf.setPage(i);

            const pageHeight = this.pdf.internal.pageSize.getHeight();
            const pageWidth = this.pdf.internal.pageSize.getWidth();

            // Footer text
            this.pdf.setFontSize(this.config.fontSize.tiny);
            this.pdf.setFont('helvetica', 'normal');
            this.pdf.setTextColor(this.config.colors.secondary);

            const footerText = `Generated on ${new Date().toLocaleDateString()} - Page ${i} of ${pageCount}`;
            const footerWidth = this.pdf.getTextWidth(footerText);

            this.pdf.text(footerText, (pageWidth - footerWidth) / 2, pageHeight - 10);
        }
    }

    /**
     * Saves the generated PDF with appropriate filename
     * @param {string} name - Base name for the file
     */
    savePDF(name) {
        const sanitizedName = name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `${sanitizedName}_CV_${timestamp}.pdf`;

        this.pdf.save(filename);

        if (AppConfig.DEBUG) {
            console.log(`[PDFGenerator] PDF saved as: ${filename}`);
        }
    }

    /**
     * Gets PDF generation statistics for debugging
     * @returns {Object} Generation statistics
     */
    getStats() {
        return {
            isLibraryLoaded: this.isLibraryLoaded,
            currentPage: this.currentPage,
            currentY: this.currentY,
            fontMetrics: Object.keys(this.fontMetrics),
            hasActivePDF: !!this.pdf
        };
    }

    /**
     * Cleanup method for resetting generator state
     */
    cleanup() {
        this.pdf = null;
        this.currentY = this.config.margin;
        this.currentPage = 1;

        if (AppConfig.DEBUG) {
            console.log('[PDFGenerator] Cleanup completed');
        }
    }
}

// Export to global scope
window.PDFGenerator = PDFGenerator;

if (AppConfig.DEBUG) {
    console.log('[PDFGenerator] Module loaded successfully');
}