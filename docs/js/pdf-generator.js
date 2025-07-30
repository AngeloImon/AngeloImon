/**
 * Enhanced Professional PDF Generation Module
 * 
 * Creates visually appealing, ATS-compliant PDF resumes with modern design,
 * interactive hyperlinks, professional typography, and optimized layout structure.
 * Implements advanced formatting techniques for superior presentation quality.
 * 
 * @author Angelo Ferdinand Imon Spanó
 * @version 5.0.0
 * @since 2025-01-29
 */

class PDFGenerator {
    /**
     * Static constants for enhanced visual design and layout control
     */
    static CONSTANTS = {
        // Library loading configuration
        MAX_LOAD_ATTEMPTS: 50,
        LOAD_CHECK_INTERVAL: 200,

        // Enhanced visual spacing for professional appearance
        SPACING: {
            SECTION_MARGIN: 15,
            ITEM_MARGIN: 8,
            LINE_HEIGHT: 5,
            PARAGRAPH_SPACING: 3,
            HEADER_SPACING: 20
        },

        // Professional color palette in RGB format
        COLORS: {
            PRIMARY: [44, 62, 80],      // Professional dark blue
            SECONDARY: [52, 152, 219],   // Accent blue for highlights
            TEXT: [33, 37, 41],          // Dark gray for readability
            LIGHT_GRAY: [108, 117, 125], // Subtle gray for metadata
            BACKGROUND: [248, 249, 250], // Light background for sections
            WHITE: [255, 255, 255],      // Pure white
            SUCCESS: [40, 167, 69]       // Green for highlights
        },

        // Enhanced typography scale for visual hierarchy
        FONT_SIZES: {
            NAME: 24,           // Primary name title
            SECTION: 16,        // Major section headers
            SUBSECTION: 14,     // Job titles and project names
            BODY: 11,           // Standard body text
            SMALL: 9,           // Supporting information
            TINY: 8             // Footer and metadata
        },

        // Document structure constants
        PAGE_MARGINS: {
            TOP: 25,
            BOTTOM: 25,
            LEFT: 20,
            RIGHT: 20
        },

        // Interactive element styling
        LINK_COLORS: {
            NORMAL: [52, 152, 219],
            HOVER: [23, 162, 184]
        }
    };

    /**
     * Initialize enhanced PDF generator with professional configuration
     */
    constructor() {
        /** @type {Object} jsPDF instance reference */
        this.pdf = null;

        /** @type {Object} Enhanced document configuration */
        this.config = this.initializeAdvancedConfiguration();

        /** @type {number} Current Y position tracking */
        this.currentY = PDFGenerator.CONSTANTS.PAGE_MARGINS.TOP;

        /** @type {boolean} PDF library availability status */
        this.isLibraryLoaded = false;

        /** @type {Object} Page dimension calculations */
        this.pageInfo = {};

        this.checkLibraryAvailability();
    }

    /**
     * Initializes advanced PDF configuration with enhanced visual settings
     * @returns {Object} Complete configuration for professional PDF generation
     */
    initializeAdvancedConfiguration() {
        return {
            // Enhanced margin configuration for better visual balance
            margins: PDFGenerator.CONSTANTS.PAGE_MARGINS,

            // Professional color scheme
            colors: PDFGenerator.CONSTANTS.COLORS,

            // Responsive font sizing for optimal readability
            fontSize: PDFGenerator.CONSTANTS.FONT_SIZES,

            // Advanced spacing for superior layout
            spacing: PDFGenerator.CONSTANTS.SPACING,

            // Content width calculation for text wrapping
            get contentWidth() {
                return 210 - this.margins.LEFT - this.margins.RIGHT; // A4 width minus margins
            }
        };
    }

    /**
     * Enhanced library availability detection with improved error handling
     */
    checkLibraryAvailability() {
        let attempts = 0;

        const checkInterval = setInterval(() => {
            attempts++;

            if (this.isJsPDFAvailable()) {
                clearInterval(checkInterval);
                this.isLibraryLoaded = true;
                console.log('[PDFGenerator] Enhanced PDF library loaded successfully');
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
     * Enhanced PDF constructor resolution with comprehensive fallback support
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
     * Advanced PDF generation with enhanced visual design and interactivity
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
            this.initializeEnhancedDocument();
            this.generateProfessionalHeader(cvData);
            this.generateEnhancedContent(cvData, language);
            this.addProfessionalFooter(cvData);
            this.saveEnhancedPDF(cvData.nome);
            this.showSuccessNotification();
        } catch (error) {
            console.error('[PDFGenerator] Enhanced generation failed:', error);
            this.showErrorNotification();
            throw error;
        }
    }

    /**
     * Initializes PDF document with enhanced professional settings
     */
    initializeEnhancedDocument() {
        const PDFConstructor = this.getPDFConstructor();
        this.pdf = new PDFConstructor('portrait', 'mm', 'a4');

        // Calculate page dimensions for responsive layout
        this.pageInfo = {
            width: this.pdf.internal.pageSize.getWidth(),
            height: this.pdf.internal.pageSize.getHeight(),
            centerX: this.pdf.internal.pageSize.getWidth() / 2
        };

        this.currentY = this.config.margins.TOP;

        // Enhanced document metadata
        this.pdf.setProperties({
            title: 'Professional Curriculum Vitae',
            subject: 'Resume - Angelo Ferdinand Imon Spanó',
            author: 'Angelo Ferdinand Imon Spanó',
            creator: 'Enhanced CV Application v5.0',
            producer: 'jsPDF Enhanced Generator'
        });

        // Set optimal default typography
        this.pdf.setFont('helvetica', 'normal');
        this.setTextColor('TEXT');
    }

    /**
     * Generates visually enhanced professional header with improved layout
     * @param {Object} cvData - Personal and contact information
     */
    generateProfessionalHeader(cvData) {
        // Professional background header section
        this.addColoredRectangle(0, 0, this.pageInfo.width, 50, 'PRIMARY');

        // Enhanced name presentation with superior typography
        this.pdf.setFontSize(this.config.fontSize.NAME);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.setTextColor(255, 255, 255); // White text on colored background

        const name = cvData.nome.toUpperCase();
        this.centerText(name, 20);

        // Professional subtitle positioning
        if (cvData.cargo || cvData.area) {
            this.pdf.setFontSize(this.config.fontSize.SUBSECTION);
            this.pdf.setFont('helvetica', 'normal');
            const subtitle = cvData.cargo || cvData.area || 'DESENVOLVEDOR PROFISSIONAL';
            this.centerText(subtitle, 30);
        }

        // Enhanced contact information with improved spacing
        this.currentY = 65;
        this.addContactInformation(cvData);
    }

    /**
     * Adds enhanced contact information with interactive hyperlinks
     * @param {Object} cvData - Contact data including email and social links
     */
    addContactInformation(cvData) {
        this.pdf.setFontSize(this.config.fontSize.BODY);
        this.pdf.setFont('helvetica', 'normal');
        this.setTextColor('TEXT');

        const contactItems = [];

        // Email with interactive hyperlink functionality
        if (cvData.email) {
            contactItems.push({
                icon: '📧',
                label: 'Email',
                value: cvData.email,
                link: `mailto:${cvData.email}`,
                type: 'email'
            });
        }

        // GitHub profile with enhanced hyperlink
        if (cvData.links?.github) {
            contactItems.push({
                icon: '💻',
                label: 'GitHub',
                value: cvData.links.github.replace('https://github.com/', ''),
                link: cvData.links.github,
                type: 'url'
            });
        }

        // LinkedIn profile with professional hyperlink
        if (cvData.links?.linkedin) {
            contactItems.push({
                icon: '💼',
                label: 'LinkedIn',
                value: cvData.links.linkedin.replace('https://linkedin.com/in/', ''),
                link: cvData.links.linkedin,
                type: 'url'
            });
        }

        // Enhanced contact layout with proper spacing
        const itemsPerRow = 3;
        const itemWidth = this.config.contentWidth / itemsPerRow;

        contactItems.forEach((item, index) => {
            const row = Math.floor(index / itemsPerRow);
            const col = index % itemsPerRow;

            const x = this.config.margins.LEFT + (col * itemWidth);
            const y = this.currentY + (row * 10);

            // Icon and label presentation
            this.pdf.setTextColor(...this.config.colors.LIGHT_GRAY);
            this.pdf.text(`${item.icon} ${item.label}:`, x, y);

            // Interactive hyperlink implementation
            const linkX = x + this.pdf.getTextWidth(`${item.icon} ${item.label}: `);
            this.pdf.setTextColor(...this.config.colors.SECONDARY);

            if (item.type === 'email') {
                this.pdf.textWithLink(item.value, linkX, y, { url: item.link });
            } else {
                this.pdf.textWithLink(item.value, linkX, y, { url: item.link });
            }
        });

        this.currentY += Math.ceil(contactItems.length / itemsPerRow) * 10 + this.config.spacing.HEADER_SPACING;
    }

    /**
     * Generates enhanced main content with superior visual hierarchy
     * @param {Object} cvData - Complete curriculum data structure
     * @param {string} language - Content localization language
     */
    generateEnhancedContent(cvData, language) {
        // Professional summary with enhanced presentation
        if (cvData.resumo) {
            this.addEnhancedSection('RESUMO PROFISSIONAL', cvData.resumo, '📋');
        }

        // Experience section with superior formatting
        if (cvData.experiencia?.length > 0) {
            this.addExperienceSection(cvData.experiencia);
        }

        // Projects portfolio with enhanced visual appeal
        if (cvData.projetos?.length > 0) {
            this.addProjectsSection(cvData.projetos);
        }

        // Skills section with modern presentation
        if (cvData.habilidades?.length > 0) {
            this.addSkillsSection(cvData.habilidades);
        }

        // Education with professional formatting
        if (cvData.formacao) {
            this.addEnhancedSection('FORMAÇÃO ACADÊMICA', cvData.formacao, '🎓');
        }

        // Certifications with enhanced layout
        if (cvData.certificacoes?.length > 0) {
            this.addCertificationsSection(cvData.certificacoes);
        }
    }

    /**
     * Adds visually enhanced section with superior typography and spacing
     * @param {string} title - Section title with professional emphasis
     * @param {string} content - Section content for presentation
     * @param {string} icon - Visual icon for section identification
     */
    addEnhancedSection(title, content, icon = '') {
        this.checkPageBreak(25);

        // Enhanced section header with visual separator
        this.addSectionHeader(title, icon);

        // Professional content presentation with improved readability
        this.pdf.setFontSize(this.config.fontSize.BODY);
        this.pdf.setFont('helvetica', 'normal');
        this.setTextColor('TEXT');

        const wrappedContent = this.wrapTextAdvanced(content, this.config.contentWidth);
        this.addWrappedTextEnhanced(wrappedContent);

        this.currentY += this.config.spacing.SECTION_MARGIN;
    }

    /**
     * Enhanced section header with superior visual design
     * @param {string} title - Section title text
     * @param {string} icon - Optional section icon
     */
    addSectionHeader(title, icon = '') {
        // Subtle background for section separation
        this.addColoredRectangle(
            this.config.margins.LEFT - 5,
            this.currentY - 3,
            this.config.contentWidth + 10,
            12,
            'BACKGROUND'
        );

        // Enhanced section title typography
        this.pdf.setFontSize(this.config.fontSize.SECTION);
        this.pdf.setFont('helvetica', 'bold');
        this.setTextColor('PRIMARY');

        const headerText = icon ? `${icon} ${title}` : title;
        this.pdf.text(headerText, this.config.margins.LEFT, this.currentY + 5);

        this.currentY += this.config.spacing.SECTION_MARGIN;
    }

    /**
     * Enhanced experience section with superior professional formatting
     * @param {Array} experiences - Professional experience data array
     */
    addExperienceSection(experiences) {
        this.addSectionHeader('EXPERIÊNCIA PROFISSIONAL', '💼');

        experiences.forEach((exp, index) => {
            this.checkPageBreak(30);

            // Job title with enhanced visual emphasis
            this.pdf.setFontSize(this.config.fontSize.SUBSECTION);
            this.pdf.setFont('helvetica', 'bold');
            this.setTextColor('PRIMARY');
            this.pdf.text(exp.cargo || 'Cargo', this.config.margins.LEFT, this.currentY);
            this.currentY += 6;

            // Company and period with professional styling
            this.pdf.setFontSize(this.config.fontSize.BODY);
            this.pdf.setFont('helvetica', 'normal');
            this.setTextColor('SECONDARY');

            const companyText = `${exp.empresa || 'Empresa'} | ${exp.periodo || 'Período'}`;
            this.pdf.text(companyText, this.config.margins.LEFT, this.currentY);
            this.currentY += 8;

            // Responsibilities with enhanced bullet formatting
            if (exp.tarefas?.length > 0) {
                this.setTextColor('TEXT');
                exp.tarefas.forEach(task => {
                    this.checkPageBreak(6);
                    const bulletText = `• ${task}`;
                    const wrappedTask = this.wrapTextAdvanced(bulletText, this.config.contentWidth - 10);
                    this.addWrappedTextEnhanced(wrappedTask, this.config.margins.LEFT + 5);
                });
            }

            this.currentY += this.config.spacing.ITEM_MARGIN;
        });
    }

    /**
     * Enhanced projects section with superior visual presentation
     * @param {Array} projects - Project portfolio data
     */
    addProjectsSection(projects) {
        this.addSectionHeader('PROJETOS DESTACADOS', '🚀');

        projects.forEach((project, index) => {
            this.checkPageBreak(20);

            // Project name with enhanced typography
            this.pdf.setFontSize(this.config.fontSize.SUBSECTION);
            this.pdf.setFont('helvetica', 'bold');
            this.setTextColor('PRIMARY');
            this.pdf.text(project.nome || 'Projeto', this.config.margins.LEFT, this.currentY);
            this.currentY += 6;

            // Project description with improved readability
            if (project.descricao) {
                this.pdf.setFontSize(this.config.fontSize.BODY);
                this.pdf.setFont('helvetica', 'normal');
                this.setTextColor('TEXT');

                const wrappedDesc = this.wrapTextAdvanced(project.descricao, this.config.contentWidth);
                this.addWrappedTextEnhanced(wrappedDesc);
            }

            // Interactive project link
            if (project.link) {
                this.pdf.setFontSize(this.config.fontSize.SMALL);
                this.setTextColor('SECONDARY');
                this.pdf.textWithLink(`🔗 Ver projeto`, this.config.margins.LEFT, this.currentY, {
                    url: project.link
                });
                this.currentY += 6;
            }

            this.currentY += this.config.spacing.ITEM_MARGIN;
        });
    }

    /**
     * Enhanced skills section with modern tag-like presentation
     * @param {Array} skills - Technical skills array
     */
    addSkillsSection(skills) {
        this.addSectionHeader('HABILIDADES TÉCNICAS', '⚡');

        this.pdf.setFontSize(this.config.fontSize.BODY);
        this.pdf.setFont('helvetica', 'normal');
        this.setTextColor('TEXT');

        // Enhanced skills presentation with visual separators
        const skillsText = skills.join(' • ');
        const wrappedSkills = this.wrapTextAdvanced(skillsText, this.config.contentWidth);
        this.addWrappedTextEnhanced(wrappedSkills);

        this.currentY += this.config.spacing.SECTION_MARGIN;
    }

    /**
     * Enhanced certifications with professional bullet formatting
     * @param {Array} certifications - Professional certifications array
     */
    addCertificationsSection(certifications) {
        this.addSectionHeader('CERTIFICAÇÕES', '🏆');

        this.pdf.setFontSize(this.config.fontSize.BODY);
        this.pdf.setFont('helvetica', 'normal');
        this.setTextColor('TEXT');

        certifications.forEach(cert => {
            this.checkPageBreak(6);
            this.pdf.text(`🎖️ ${cert}`, this.config.margins.LEFT, this.currentY);
            this.currentY += 6;
        });

        this.currentY += this.config.spacing.SECTION_MARGIN;
    }

    /**
     * Advanced text wrapping with improved word break handling
     * @param {string} text - Text content for wrapping
     * @param {number} maxWidth - Maximum line width constraint
     * @returns {Array<string>} Optimally wrapped text lines
     */
    wrapTextAdvanced(text, maxWidth) {
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
     * Enhanced wrapped text rendering with superior spacing control
     * @param {Array<string>} lines - Text lines for rendering
     * @param {number} leftMargin - Optional left margin override
     */
    addWrappedTextEnhanced(lines, leftMargin = null) {
        const margin = leftMargin || this.config.margins.LEFT;

        lines.forEach(line => {
            this.checkPageBreak(this.config.spacing.LINE_HEIGHT);
            this.pdf.text(line, margin, this.currentY);
            this.currentY += this.config.spacing.LINE_HEIGHT;
        });
    }

    /**
     * Intelligent page break management with enhanced spacing
     * @param {number} requiredSpace - Required vertical space in millimeters
     */
    checkPageBreak(requiredSpace) {
        if (this.currentY + requiredSpace > this.pageInfo.height - this.config.margins.BOTTOM) {
            this.pdf.addPage();
            this.currentY = this.config.margins.TOP;
        }
    }

    /**
     * Enhanced color management with theme-aware settings
     * @param {string} colorName - Color identifier from theme palette
     */
    setTextColor(colorName) {
        const color = this.config.colors[colorName] || this.config.colors.TEXT;
        this.pdf.setTextColor(...color);
    }

    /**
     * Adds colored rectangle for enhanced visual design
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate  
     * @param {number} width - Rectangle width
     * @param {number} height - Rectangle height
     * @param {string} colorName - Color theme identifier
     */
    addColoredRectangle(x, y, width, height, colorName) {
        const color = this.config.colors[colorName] || this.config.colors.BACKGROUND;
        this.pdf.setFillColor(...color);
        this.pdf.rect(x, y, width, height, 'F');
    }

    /**
     * Centers text horizontally with precise calculation
     * @param {string} text - Text content for centering
     * @param {number} y - Y coordinate for text placement
     */
    centerText(text, y) {
        const textWidth = this.pdf.getTextWidth(text);
        const x = (this.pageInfo.width - textWidth) / 2;
        this.pdf.text(text, x, y);
    }

    /**
     * Enhanced footer with professional metadata presentation
     * @param {Object} cvData - CV data for personalization
     */
    addProfessionalFooter(cvData) {
        const pageCount = this.pdf.internal.getNumberOfPages();

        for (let i = 1; i <= pageCount; i++) {
            this.pdf.setPage(i);

            // Professional footer separator line
            this.pdf.setLineWidth(0.3);
            this.pdf.setDrawColor(...this.config.colors.LIGHT_GRAY);
            this.pdf.line(
                this.config.margins.LEFT,
                this.pageInfo.height - 20,
                this.pageInfo.width - this.config.margins.RIGHT,
                this.pageInfo.height - 20
            );

            // Enhanced footer content
            this.pdf.setFontSize(this.config.fontSize.TINY);
            this.pdf.setFont('helvetica', 'normal');
            this.setTextColor('LIGHT_GRAY');

            // Professional footer text
            const footerLeft = `${cvData.nome || 'Angelo Ferdinand Imon Spanó'} - Desenvolvedor`;
            this.pdf.text(footerLeft, this.config.margins.LEFT, this.pageInfo.height - 12);

            // Page numbering
            const footerRight = `Página ${i} de ${pageCount}`;
            const rightWidth = this.pdf.getTextWidth(footerRight);
            this.pdf.text(footerRight, this.pageInfo.width - this.config.margins.RIGHT - rightWidth, this.pageInfo.height - 12);
        }
    }

    /**
     * Enhanced PDF saving with descriptive filename generation
     * @param {string} name - Base name for file generation
     */
    saveEnhancedPDF(name) {
        const sanitizedName = name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `${sanitizedName}_CV_Professional_${timestamp}.pdf`;
        this.pdf.save(filename);
    }

    /**
     * Enhanced success notification with improved styling
     */
    showSuccessNotification() {
        const notification = this.createNotification(
            '#27ae60',
            '✅ PDF Profissional Gerado com Sucesso!'
        );
        this.displayNotification(notification);
    }

    /**
     * Enhanced error notification with improved user feedback
     */
    showErrorNotification() {
        const notification = this.createNotification(
            '#e74c3c',
            '❌ Erro na Geração do PDF!'
        );
        this.displayNotification(notification);
    }

    /**
     * Creates enhanced notification element with superior styling
     * @param {string} backgroundColor - Notification background color
     * @param {string} message - Notification message content
     * @returns {HTMLElement} Styled notification element
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
     * Enhanced notification display with improved timing
     * @param {HTMLElement} notification - Notification element for display
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

// Enhanced global export with version identification
window.PDFGenerator = PDFGenerator;
console.log('[PDFGenerator] Enhanced Professional PDF Generator v5.0.0 loaded successfully');