/**
 * PDF Generation Module
 * 
 * Handles professional PDF export functionality with optimized layout,
 * typography, and formatting. Implements multi-page support, proper
 * content flow, and accessibility considerations for generated documents.
 * 
 * @author Angelo Ferdinand Imon Spanó
 * @version 2.0.1
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
     * Verifies jsPDF library availability with enhanced detection methods
     * Implements multiple detection strategies and delayed initialization to handle
     * asynchronous library loading scenarios across different environments
     */
    checkLibraryAvailability() {
        let attempts = 0;
        const maxAttempts = 50; // 10 seconds total timeout

        const checkInterval = setInterval(() => {
            attempts++;

            // Multi-scope jsPDF detection for maximum compatibility
            const jsPDFAvailable = (window.jspdf && typeof window.jspdf.jsPDF === 'function') ||
                (typeof window.jsPDF === 'function') ||
                (typeof jsPDF === 'function');

            if (jsPDFAvailable) {
                clearInterval(checkInterval);
                this.isLibraryLoaded = true;
                this.initializeFontMetrics();

                if (AppConfig.DEBUG) {
                    console.log('[PDFGenerator] jsPDF library detected and verified successfully');
                    console.log('[PDFGenerator] Available scope:',
                        window.jspdf ? 'window.jspdf.jsPDF' :
                            window.jsPDF ? 'window.jsPDF' : 'global jsPDF');
                }
            } else if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                console.error('[PDFGenerator] jsPDF library failed to load after timeout');
                this.isLibraryLoaded = false;
                this.loadLibraryDynamically();
            }

            if (AppConfig.DEBUG && attempts % 10 === 0) {
                console.log(`[PDFGenerator] Detection attempt ${attempts}: checking jsPDF availability`);
            }
        }, 200);
    }

    /**
     * Dynamically loads jsPDF library as fallback mechanism
     * Provides robust error handling and callback initialization
     */
    async loadLibraryDynamically() {
        try {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script.crossOrigin = 'anonymous';

            script.onload = () => {
                this.isLibraryLoaded = true;
                this.initializeFontMetrics();
                console.log('[PDFGenerator] jsPDF library loaded dynamically and initialized');
            };

            script.onerror = () => {
                console.error('[PDFGenerator] Dynamic library loading failed');
            };

            document.head.appendChild(script);
        } catch (error) {
            console.error('[PDFGenerator] Failed to dynamically load jsPDF library:', error);
        }
    }

    /**
     * Initializes comprehensive font metrics system for precise text measurement
     * Calculates character widths and line heights across all configured font sizes
     * with robust error handling and fallback metric generation
     */
    initializeFontMetrics() {
        if (!this.isLibraryLoaded) return;

        try {
            // Determine correct jsPDF constructor based on available scope
            const PDFConstructor = this.getPDFConstructor();
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
                console.log('[PDFGenerator] Font metrics calculation completed successfully');
            }
        } catch (error) {
            console.error('[PDFGenerator] Font metrics initialization failed, applying fallback values:', error);

            // Implement comprehensive fallback metrics for graceful degradation
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
     * Resolves correct jsPDF constructor across different loading scenarios
     * @returns {Function} jsPDF constructor function
     * @throws {Error} If no valid constructor is found
     */
    getPDFConstructor() {
        // Priority-based constructor resolution
        if (window.jspdf && typeof window.jspdf.jsPDF === 'function') {
            return window.jspdf.jsPDF;
        }

        if (typeof window.jsPDF === 'function') {
            return window.jsPDF;
        }

        if (typeof jsPDF === 'function') {
            return jsPDF;
        }

        throw new Error('jsPDF constructor not accessible in any expected scope');
    }

    /**
     * Generates complete PDF document from CV data with comprehensive error handling
     * @param {Object} cvData - Complete CV data object
     * @param {string} language - Current language for localization
     * @returns {Promise<void>} Resolves when PDF generation completes successfully
     * @throws {Error} If PDF generation fails at any stage
     */
    async generatePDF(cvData, language = 'pt') {
        PerformanceMonitor.start('generatePDF');

        // Pre-generation validation
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
                console.log('[PDFGenerator] PDF generation completed successfully');
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
        try {
            // Multi-source constructor resolution for maximum compatibility
            const PDFConstructor = this.getPDFConstructor();

            // Initialize PDF with professional A4 portrait configuration
            this.pdf = new PDFConstructor('portrait', 'mm', 'a4');
            this.currentY = this.config.margin;
            this.currentPage = 1;

            // Configure comprehensive document metadata for professional presentation
            this.pdf.setProperties({
                title: 'Professional CV',
                subject: 'Curriculum Vitae',
                author: 'Angelo Ferdinand Imon Spanó',
                creator: 'CV Application',
                producer: 'jsPDF Library'
            });

            // Establish default typography settings for consistent formatting
            this.pdf.setFont('helvetica', 'normal');
            this.pdf.setFontSize(this.config.fontSize.normal);

            if (AppConfig.DEBUG) {
                console.log('[PDFGenerator] PDF document initialized successfully');
            }
        } catch (error) {
            throw new Error(`Failed to initialize PDF document: ${error.message}`);
        }
    }

    /**
     * Generates professional document header with comprehensive contact information
     * @param {Object} cvData - CV data containing personal information and contact details
     */
    generateHeader(cvData) {
        const centerX = this.pdf.internal.pageSize.getWidth() / 2;

        // Professional name title with enhanced typography
        this.pdf.setFontSize(this.config.fontSize.title);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.setTextColor(this.config.colors.primary);

        const nameText = cvData.nome || 'Professional CV';
        const nameWidth = this.pdf.getTextWidth(nameText);
        this.pdf.text(nameText, centerX - nameWidth / 2, this.currentY);

        this.currentY += 12;

        // Contact information section with structured layout
        this.pdf.setFontSize(this.config.fontSize.normal);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.setTextColor(this.config.colors.text);

        // Email contact with professional formatting
        if (cvData.email) {
            const emailText = `📧 ${cvData.email}`;
            const emailWidth = this.pdf.getTextWidth(emailText);
            this.pdf.text(emailText, centerX - emailWidth / 2, this.currentY);
            this.currentY += 6;
        }

        // Professional links section with organized presentation
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

        // Professional separator line for visual hierarchy
        this.pdf.setDrawColor(this.config.colors.primary);
        this.pdf.setLineWidth(0.5);
        this.pdf.line(this.config.margin, this.currentY,
            this.pdf.internal.pageSize.getWidth() - this.config.margin, this.currentY);

        this.currentY += 10;
    }

    /**
     * Generates comprehensive main content sections with structured formatting
     * @param {Object} cvData - Complete CV data structure
     * @param {string} language - Current language for section localization
     */
    generateContent(cvData, language) {
        // Professional summary section
        if (cvData.resumo) {
            this.addSection(cvData.secoes?.resumo || 'Resumo Profissional', cvData.resumo);
        }

        // Professional experience with detailed formatting
        if (cvData.experiencia && cvData.experiencia.length > 0) {
            this.addExperienceSection(cvData.experiencia, cvData.secoes?.experiencia || 'Experiência Profissional');
        }

        // Projects portfolio with links and descriptions
        if (cvData.projetos && cvData.projetos.length > 0) {
            this.addProjectsSection(cvData.projetos, cvData.secoes?.projetos || 'Projetos');
        }

        // Technical skills with organized presentation
        if (cvData.habilidades && cvData.habilidades.length > 0) {
            this.addSkillsSection(cvData.habilidades, cvData.secoes?.habilidades || 'Habilidades Técnicas');
        }

        // Educational background
        if (cvData.formacao) {
            this.addSection(cvData.secoes?.formacao || 'Formação Acadêmica', cvData.formacao);
        }

        // Professional certifications
        if (cvData.certificacoes && cvData.certificacoes.length > 0) {
            this.addCertificationsSection(cvData.certificacoes, cvData.secoes?.certificacoes || 'Certificações');
        }
    }

    /**
     * Adds standard section with professional title and formatted content
     * @param {string} title - Section title with appropriate hierarchy
     * @param {string} content - Section content for detailed presentation
     */
    addSection(title, content) {
        this.checkPageBreak(30);

        // Professional section title formatting
        this.pdf.setFontSize(this.config.fontSize.sectionTitle);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.setTextColor(this.config.colors.primary);
        this.pdf.text(title, this.config.margin, this.currentY);

        this.currentY += 8;

        // Structured section content with proper typography
        this.pdf.setFontSize(this.config.fontSize.normal);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.setTextColor(this.config.colors.text);

        const wrappedText = this.wrapText(content, this.config.maxWidth);
        this.addWrappedText(wrappedText);

        this.currentY += 10;
    }

    /**
     * Adds professional experience section with comprehensive structured formatting
     * @param {Array} experiences - Array of experience objects with detailed information
     * @param {string} title - Section title for professional presentation
     */
    addExperienceSection(experiences, title) {
        this.checkPageBreak(40);

        this.addSectionTitle(title);

        experiences.forEach((exp, index) => {
            this.checkPageBreak(25);

            // Job title and company with professional emphasis
            this.pdf.setFontSize(this.config.fontSize.jobTitle);
            this.pdf.setFont('helvetica', 'bold');
            this.pdf.setTextColor(this.config.colors.primary);

            const jobTitle = `${exp.cargo} - ${exp.empresa}`;
            this.pdf.text(jobTitle, this.config.margin, this.currentY);
            this.currentY += 6;

            // Employment period with subtle formatting
            if (exp.periodo) {
                this.pdf.setFontSize(this.config.fontSize.small);
                this.pdf.setFont('helvetica', 'italic');
                this.pdf.setTextColor(this.config.colors.secondary);
                this.pdf.text(exp.periodo, this.config.margin, this.currentY);
                this.currentY += 6;
            }

            // Key responsibilities and achievements with bullet formatting
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
     * Adds projects section with comprehensive links and detailed descriptions
     * @param {Array} projects - Array of project objects with technical details
     * @param {string} title - Section title for portfolio presentation
     */
    addProjectsSection(projects, title) {
        this.checkPageBreak(30);

        this.addSectionTitle(title);

        projects.forEach((project, index) => {
            this.checkPageBreak(15);

            // Project name with technical emphasis
            this.pdf.setFontSize(this.config.fontSize.jobTitle);
            this.pdf.setFont('helvetica', 'bold');
            this.pdf.setTextColor(this.config.colors.primary);
            this.pdf.text(project.nome, this.config.margin, this.currentY);
            this.currentY += 6;

            // Comprehensive project description
            if (project.descricao) {
                this.pdf.setFontSize(this.config.fontSize.normal);
                this.pdf.setFont('helvetica', 'normal');
                this.pdf.setTextColor(this.config.colors.text);

                const wrappedDesc = this.wrapText(project.descricao, this.config.maxWidth);
                this.addWrappedText(wrappedDesc);
            }

            // Project repository or demo link
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
     * Adds technical skills section with organized and comprehensive layout
     * @param {Array} skills - Array of technical skill strings
     * @param {string} title - Section title for skills presentation
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
     * Adds certifications section with professional bullet point formatting
     * @param {Array} certifications - Array of certification strings and achievements
     * @param {string} title - Section title for credentials presentation
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
     * Adds professionally formatted section title with consistent styling
     * @param {string} title - Section title text for hierarchical presentation
     */
    addSectionTitle(title) {
        this.pdf.setFontSize(this.config.fontSize.sectionTitle);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.setTextColor(this.config.colors.primary);
        this.pdf.text(title, this.config.margin, this.currentY);
        this.currentY += 10;
    }

    /**
     * Intelligently wraps text to fit within specified width constraints
     * @param {string} text - Text content requiring word wrapping
     * @param {number} maxWidth - Maximum width constraint in millimeters
     * @returns {Array<string>} Array of optimally wrapped text lines
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
                    // Handle exceptionally long words with forced break
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
     * Adds wrapped text with proper line spacing and margin control
     * @param {Array<string>} lines - Array of text lines for sequential placement
     * @param {number} leftMargin - Optional left margin override for indentation
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
     * Intelligently checks page break requirements and manages page transitions
     * @param {number} requiredSpace - Required vertical space in millimeters
     */
    checkPageBreak(requiredSpace) {
        const pageHeight = this.pdf.internal.pageSize.getHeight();
        const bottomMargin = 30;

        if (this.currentY + requiredSpace > pageHeight - bottomMargin) {
            this.addPageBreak();
        }
    }

    /**
     * Adds new page with proper initialization and state management
     */
    addPageBreak() {
        this.pdf.addPage();
        this.currentPage++;
        this.currentY = this.config.margin;

        if (AppConfig.DEBUG) {
            console.log(`[PDFGenerator] Added page ${this.currentPage} for continued content`);
        }
    }

    /**
     * Adds professional footer with document metadata to all pages
     * @param {Object} cvData - CV data for footer content personalization
     */
    addFooter(cvData) {
        const pageCount = this.pdf.internal.getNumberOfPages();

        for (let i = 1; i <= pageCount; i++) {
            this.pdf.setPage(i);

            const pageHeight = this.pdf.internal.pageSize.getHeight();
            const pageWidth = this.pdf.internal.pageSize.getWidth();

            // Professional footer text with generation metadata
            this.pdf.setFontSize(this.config.fontSize.tiny);
            this.pdf.setFont('helvetica', 'normal');
            this.pdf.setTextColor(this.config.colors.secondary);

            const footerText = `Generated on ${new Date().toLocaleDateString()} - Page ${i} of ${pageCount}`;
            const footerWidth = this.pdf.getTextWidth(footerText);

            this.pdf.text(footerText, (pageWidth - footerWidth) / 2, pageHeight - 10);
        }
    }

    /**
     * Saves generated PDF with descriptive filename and proper sanitization
     * @param {string} name - Base name for file generation
     */
    savePDF(name) {
        const sanitizedName = name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `${sanitizedName}_CV_${timestamp}.pdf`;

        this.pdf.save(filename);

        if (AppConfig.DEBUG) {
            console.log(`[PDFGenerator] PDF saved successfully as: ${filename}`);
        }
    }

    /**
     * Retrieves comprehensive PDF generation statistics for debugging and monitoring
     * @returns {Object} Detailed generation statistics and current state
     */
    getStats() {
        return {
            isLibraryLoaded: this.isLibraryLoaded,
            currentPage: this.currentPage,
            currentY: this.currentY,
            fontMetrics: Object.keys(this.fontMetrics),
            hasActivePDF: !!this.pdf,
            configurationLoaded: !!this.config
        };
    }

    /**
     * Comprehensive cleanup method for resetting generator state
     */
    cleanup() {
        this.pdf = null;
        this.currentY = this.config.margin;
        this.currentPage = 1;

        if (AppConfig.DEBUG) {
            console.log('[PDFGenerator] Cleanup completed successfully');
        }
    }
}

// Export to global scope for application integration
window.PDFGenerator = PDFGenerator;

if (AppConfig.DEBUG) {
    console.log('[PDFGenerator] Module loaded and initialized successfully');
}