/**
 * ATS-Optimized PDF Generation Module
 * 
 * Generates ATS (Applicant Tracking System) compliant PDF resumes with plain text
 * formatting, standardized section headers, and machine-readable content structure.
 * Prioritizes text extractability and keyword recognition over visual styling.
 * 
 * @author Angelo Ferdinand Imon Spanó
 * @version 4.0.0
 * @since 2025-01-29
 */

class PDFGenerator {
    /**
     * Static constants to eliminate magic numbers and improve maintainability
     */
    static CONSTANTS = {
        // Library loading configuration
        MAX_LOAD_ATTEMPTS: 50,
        LOAD_CHECK_INTERVAL: 200,

        // User interface timing
        NOTIFICATION_DURATION: 4000,

        // PDF layout constants
        PAGE_BOTTOM_MARGIN: 20,
        BULLET_INDENT: 5,
        CENTER_DIVISOR: 2,

        // Document properties
        PAGE_FORMAT: 'a4',
        PAGE_ORIENTATION: 'portrait',
        MEASUREMENT_UNIT: 'mm',

        // File naming
        FILENAME_SEPARATOR: '_',
        DATE_SEPARATOR: 'T'
    };

    /**
     * Initialize ATS-optimized PDF generator with machine-readable configuration
     */
    constructor() {
        /** @type {Object} jsPDF instance reference */
        this.pdf = null;

        /** @type {Object} ATS-optimized document configuration */
        this.config = this.initializeConfiguration();

        /** @type {number} Current Y position for content placement */
        this.currentY = this.config.margin;

        /** @type {boolean} PDF library loading state */
        this.isLibraryLoaded = false;

        this.checkLibraryAvailability();
    }

    /**
     * Initializes PDF generator configuration with ATS-optimized settings
     * @returns {Object} Complete configuration object
     */
    initializeConfiguration() {
        return {
            // Standard margins for ATS parsing
            margin: 20,
            maxWidth: 170,

            // ATS-friendly font sizes (avoid decorative fonts)
            fontSize: {
                name: 18,           // Name should be largest
                section: 14,        // Section headers
                normal: 11,         // Body text
                contact: 10         // Contact info
            },

            // Minimal spacing for content density
            spacing: {
                afterName: 8,
                afterContact: 12,
                afterSection: 6,
                betweenItems: 4,
                lineHeight: 5
            },

            // ATS-readable colors (black text only)
            colors: {
                text: [0, 0, 0],        // Pure black for maximum readability
                section: [0, 0, 0]       // Black section headers
            },

            // Document metadata for ATS parsing
            metadata: {
                title: 'Resume - Curriculum Vitae',
                subject: 'Professional Resume',
                author: 'CV Application',
                keywords: 'resume, cv, curriculum vitae, professional'
            }
        };
    }

    /**
     * Verifies jsPDF library availability with enhanced detection methods
     * Implements multiple detection strategies for cross-browser compatibility
     */
    checkLibraryAvailability() {
        let attempts = 0;

        const checkInterval = setInterval(() => {
            attempts++;

            if (this.isJsPDFAvailable()) {
                clearInterval(checkInterval);
                this.isLibraryLoaded = true;
                console.log('[PDFGenerator] jsPDF library loaded successfully');
            } else if (attempts >= PDFGenerator.CONSTANTS.MAX_LOAD_ATTEMPTS) {
                clearInterval(checkInterval);
                this.isLibraryLoaded = false;
                this.loadLibraryDynamically();
            }
        }, PDFGenerator.CONSTANTS.LOAD_CHECK_INTERVAL);
    }

    /**
     * Checks if jsPDF library is available in multiple global scopes
     * @returns {boolean} True if jsPDF is accessible
     */
    isJsPDFAvailable() {
        return (window.jspdf && typeof window.jspdf.jsPDF === 'function') ||
            (typeof window.jsPDF === 'function') ||
            (typeof jsPDF === 'function');
    }

    /**
     * Dynamically loads jsPDF library as fallback mechanism
     */
    async loadLibraryDynamically() {
        try {
            const script = this.createLibraryScript();
            document.head.appendChild(script);
        } catch (error) {
            console.error('[PDFGenerator] Failed to load jsPDF library:', error);
        }
    }

    /**
     * Creates and configures script element for dynamic library loading
     * @returns {HTMLScriptElement} Configured script element
     */
    createLibraryScript() {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.crossOrigin = 'anonymous';

        script.onload = () => {
            this.isLibraryLoaded = true;
            console.log('[PDFGenerator] jsPDF library loaded dynamically');
        };

        script.onerror = () => {
            console.error('[PDFGenerator] Dynamic library loading failed');
        };

        return script;
    }

    /**
     * Resolves correct jsPDF constructor across different loading scenarios
     * @returns {Function} jsPDF constructor function
     * @throws {Error} When jsPDF constructor is not accessible
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
        throw new Error('jsPDF constructor not accessible');
    }

    /**
     * Validates CV data structure and required fields
     * @param {Object} cvData - CV data to validate
     * @returns {boolean} True if data is valid
     * @throws {Error} When validation fails
     */
    validateCVData(cvData) {
        if (!cvData || typeof cvData !== 'object') {
            throw new Error('CV data must be a valid object');
        }

        if (!cvData.nome || typeof cvData.nome !== 'string' || cvData.nome.trim() === '') {
            throw new Error('CV data must contain a valid name');
        }

        return true;
    }

    /**
     * Generates ATS-optimized PDF document from CV data
     * @param {Object} cvData - Complete CV data object
     * @param {string} language - Current language for localization
     * @returns {Promise<void>} Resolves when PDF generation completes
     * @throws {Error} When PDF generation fails
     */
    async generatePDF(cvData, language = 'pt') {
        if (!this.isLibraryLoaded) {
            throw new Error('PDF library not loaded');
        }

        this.validateCVData(cvData);

        try {
            this.initializeDocument();
            this.generateATSHeader(cvData);
            this.generateATSContent(cvData, language);
            this.savePDF(cvData.nome);
            this.showSuccessNotification();
        } catch (error) {
            console.error('[PDFGenerator] PDF generation failed:', error);
            this.showErrorNotification();
            throw error;
        }
    }

    /**
     * Initializes PDF document with ATS-optimized settings
     */
    initializeDocument() {
        const PDFConstructor = this.getPDFConstructor();
        this.pdf = new PDFConstructor(
            PDFGenerator.CONSTANTS.PAGE_ORIENTATION,
            PDFGenerator.CONSTANTS.MEASUREMENT_UNIT,
            PDFGenerator.CONSTANTS.PAGE_FORMAT
        );

        this.currentY = this.config.margin;
        this.setDocumentDefaults();
        this.setDocumentMetadata();
    }

    /**
     * Sets default font and color settings for ATS compatibility
     */
    setDocumentDefaults() {
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.setTextColor(...this.config.colors.text);
    }

    /**
     * Sets document metadata for ATS parsing optimization
     */
    setDocumentMetadata() {
        this.pdf.setProperties(this.config.metadata);
    }

    /**
     * Generates ATS-optimized header with standard contact information layout
     * @param {Object} cvData - CV data containing personal information
     */
    generateATSHeader(cvData) {
        this.addCenteredName(cvData);
        this.addCenteredContactInfo(cvData);
    }

    /**
     * Adds centered name to PDF header
     * @param {Object} cvData - CV data containing name
     */
    addCenteredName(cvData) {
        this.pdf.setFontSize(this.config.fontSize.name);
        this.pdf.setFont('helvetica', 'bold');

        const name = (cvData.nome || 'PROFESSIONAL NAME').toUpperCase();
        this.centerText(name, this.currentY);
        this.currentY += this.config.spacing.afterName;
    }

    /**
     * Adds centered contact information to PDF header
     * @param {Object} cvData - CV data containing contact information
     */
    addCenteredContactInfo(cvData) {
        this.pdf.setFontSize(this.config.fontSize.contact);
        this.pdf.setFont('helvetica', 'normal');

        const contactInfo = this.buildContactInfo(cvData);
        if (contactInfo) {
            this.centerText(contactInfo, this.currentY);
            this.currentY += this.config.spacing.afterContact;
        }
    }

    /**
     * Builds contact information string from CV data
     * @param {Object} cvData - CV data object
     * @returns {string} Formatted contact information
     */
    buildContactInfo(cvData) {
        const contactParts = [];

        if (cvData.email) contactParts.push(cvData.email);
        if (cvData.telefone) contactParts.push(cvData.telefone);
        if (cvData.links?.linkedin) contactParts.push(cvData.links.linkedin);
        if (cvData.links?.github) contactParts.push(cvData.links.github);

        return contactParts.join(' | ');
    }

    /**
     * Centers text horizontally on the current page
     * @param {string} text - Text to center
     * @param {number} y - Y position for text placement
     */
    centerText(text, y) {
        const centerX = this.pdf.internal.pageSize.getWidth() / PDFGenerator.CONSTANTS.CENTER_DIVISOR;
        const textWidth = this.pdf.getTextWidth(text);
        this.pdf.text(text, centerX - textWidth / PDFGenerator.CONSTANTS.CENTER_DIVISOR, y);
    }

    /**
     * Generates ATS-optimized main content with standard section formatting
     * @param {Object} cvData - Complete CV data structure
     * @param {string} language - Current language for section titles
     */
    generateATSContent(cvData, language) {
        this.addProfessionalSummary(cvData);
        this.addWorkExperience(cvData);
        this.addEducation(cvData);
        this.addTechnicalSkills(cvData);
        this.addProjects(cvData);
        this.addCertifications(cvData);
    }

    /**
     * Adds professional summary section if available
     * @param {Object} cvData - CV data containing summary
     */
    addProfessionalSummary(cvData) {
        if (cvData.resumo) {
            this.addATSSection('PROFESSIONAL SUMMARY', cvData.resumo);
        }
    }

    /**
     * Adds work experience section if available
     * @param {Object} cvData - CV data containing work experience
     */
    addWorkExperience(cvData) {
        if (cvData.experiencia && cvData.experiencia.length > 0) {
            this.addExperienceSection(cvData.experiencia);
        }
    }

    /**
     * Adds education section if available
     * @param {Object} cvData - CV data containing education information
     */
    addEducation(cvData) {
        if (cvData.formacao) {
            this.addATSSection('EDUCATION', cvData.formacao);
        }
    }

    /**
     * Adds technical skills section if available
     * @param {Object} cvData - CV data containing technical skills
     */
    addTechnicalSkills(cvData) {
        if (cvData.habilidades && cvData.habilidades.length > 0) {
            this.addSkillsSection(cvData.habilidades);
        }
    }

    /**
     * Adds projects section if available
     * @param {Object} cvData - CV data containing projects
     */
    addProjects(cvData) {
        if (cvData.projetos && cvData.projetos.length > 0) {
            this.addProjectsSection(cvData.projetos);
        }
    }

    /**
     * Adds certifications section if available
     * @param {Object} cvData - CV data containing certifications
     */
    addCertifications(cvData) {
        if (cvData.certificacoes && cvData.certificacoes.length > 0) {
            this.addCertificationsSection(cvData.certificacoes);
        }
    }

    /**
     * Adds ATS-optimized section with standard formatting
     * @param {string} title - Section title in uppercase
     * @param {string} content - Section content
     */
    addATSSection(title, content) {
        this.checkPageBreak(20);
        this.addSectionHeader(title);
        this.addSectionContent(content);
        this.addSectionSpacing();
    }

    /**
     * Adds formatted section header
     * @param {string} title - Section title
     */
    addSectionHeader(title) {
        this.pdf.setFontSize(this.config.fontSize.section);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.text(title.toUpperCase(), this.config.margin, this.currentY);
        this.currentY += this.config.spacing.afterSection;
    }

    /**
     * Adds wrapped section content
     * @param {string} content - Section content
     */
    addSectionContent(content) {
        this.pdf.setFontSize(this.config.fontSize.normal);
        this.pdf.setFont('helvetica', 'normal');

        const wrappedText = this.wrapText(content, this.config.maxWidth);
        wrappedText.forEach(line => {
            this.checkPageBreak(this.config.spacing.lineHeight);
            this.pdf.text(line, this.config.margin, this.currentY);
            this.currentY += this.config.spacing.lineHeight;
        });
    }

    /**
     * Adds spacing after section content
     */
    addSectionSpacing() {
        this.currentY += this.config.spacing.betweenItems;
    }

    /**
     * Adds work experience section with ATS-standard formatting
     * @param {Array} experiences - Array of work experience objects
     */
    addExperienceSection(experiences) {
        this.checkPageBreak(20);
        this.addSectionHeader('WORK EXPERIENCE');

        experiences.forEach(experience => {
            this.addSingleExperience(experience);
        });
    }

    /**
     * Adds single work experience entry
     * @param {Object} experience - Work experience object
     */
    addSingleExperience(experience) {
        this.checkPageBreak(15);
        this.addJobHeader(experience);
        this.addJobResponsibilities(experience);
        this.addSectionSpacing();
    }

    /**
     * Adds job header with title, company, and dates
     * @param {Object} experience - Work experience object
     */
    addJobHeader(experience) {
        this.pdf.setFontSize(this.config.fontSize.normal);
        this.pdf.setFont('helvetica', 'bold');

        const jobLine = `${experience.cargo || 'Position'} | ${experience.empresa || 'Company'} | ${experience.periodo || 'Dates'}`;
        this.pdf.text(jobLine, this.config.margin, this.currentY);
        this.currentY += this.config.spacing.lineHeight;
    }

    /**
     * Adds job responsibilities as bullet points
     * @param {Object} experience - Work experience object
     */
    addJobResponsibilities(experience) {
        if (experience.tarefas && experience.tarefas.length > 0) {
            this.pdf.setFont('helvetica', 'normal');

            experience.tarefas.forEach(task => {
                this.addBulletPoint(task);
            });
        }
    }

    /**
     * Adds formatted bullet point with indentation
     * @param {string} text - Bullet point text
     */
    addBulletPoint(text) {
        this.checkPageBreak(this.config.spacing.lineHeight);

        const bulletText = `• ${text}`;
        const wrappedBullet = this.wrapText(bulletText, this.config.maxWidth - PDFGenerator.CONSTANTS.BULLET_INDENT);

        wrappedBullet.forEach(line => {
            this.pdf.text(line, this.config.margin + PDFGenerator.CONSTANTS.BULLET_INDENT, this.currentY);
            this.currentY += this.config.spacing.lineHeight;
        });
    }

    /**
     * Adds technical skills section optimized for ATS keyword scanning
     * @param {Array} skills - Array of technical skills
     */
    addSkillsSection(skills) {
        this.checkPageBreak(15);
        this.addSectionHeader('TECHNICAL SKILLS');

        this.pdf.setFontSize(this.config.fontSize.normal);
        this.pdf.setFont('helvetica', 'normal');

        const skillsText = skills.join(', ');
        this.addWrappedText(skillsText);
        this.addSectionSpacing();
    }

    /**
     * Adds projects section with ATS-friendly formatting
     * @param {Array} projects - Array of project objects
     */
    addProjectsSection(projects) {
        this.checkPageBreak(15);
        this.addSectionHeader('PROJECTS');

        projects.forEach(project => {
            this.addSingleProject(project);
        });
    }

    /**
     * Adds single project entry
     * @param {Object} project - Project object
     */
    addSingleProject(project) {
        this.checkPageBreak(10);
        this.addProjectName(project);
        this.addProjectDescription(project);
        this.addProjectLink(project);
        this.addSectionSpacing();
    }

    /**
     * Adds project name
     * @param {Object} project - Project object
     */
    addProjectName(project) {
        this.pdf.setFontSize(this.config.fontSize.normal);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.text(project.nome || 'Project Name', this.config.margin, this.currentY);
        this.currentY += this.config.spacing.lineHeight;
    }

    /**
     * Adds project description
     * @param {Object} project - Project object
     */
    addProjectDescription(project) {
        if (project.descricao) {
            this.pdf.setFont('helvetica', 'normal');
            this.addWrappedText(project.descricao);
        }
    }

    /**
     * Adds project link if available
     * @param {Object} project - Project object
     */
    addProjectLink(project) {
        if (project.link) {
            this.pdf.text(`Link: ${project.link}`, this.config.margin, this.currentY);
            this.currentY += this.config.spacing.lineHeight;
        }
    }

    /**
     * Adds certifications section with standard bullet formatting
     * @param {Array} certifications - Array of certification strings
     */
    addCertificationsSection(certifications) {
        this.checkPageBreak(15);
        this.addSectionHeader('CERTIFICATIONS');

        this.pdf.setFontSize(this.config.fontSize.normal);
        this.pdf.setFont('helvetica', 'normal');

        certifications.forEach(certification => {
            this.checkPageBreak(this.config.spacing.lineHeight);
            this.pdf.text(`• ${certification}`, this.config.margin, this.currentY);
            this.currentY += this.config.spacing.lineHeight;
        });

        this.addSectionSpacing();
    }

    /**
     * Adds wrapped text content to PDF
     * @param {string} text - Text to add
     */
    addWrappedText(text) {
        const wrappedText = this.wrapText(text, this.config.maxWidth);
        wrappedText.forEach(line => {
            this.checkPageBreak(this.config.spacing.lineHeight);
            this.pdf.text(line, this.config.margin, this.currentY);
            this.currentY += this.config.spacing.lineHeight;
        });
    }

    /**
     * Wraps text to fit within specified width constraints
     * @param {string} text - Text content to wrap
     * @param {number} maxWidth - Maximum width in millimeters
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
     * Checks if page break is needed and adds new page if necessary
     * @param {number} requiredSpace - Required space in millimeters
     */
    checkPageBreak(requiredSpace) {
        const pageHeight = this.pdf.internal.pageSize.getHeight();

        if (this.currentY + requiredSpace > pageHeight - PDFGenerator.CONSTANTS.PAGE_BOTTOM_MARGIN) {
            this.pdf.addPage();
            this.currentY = this.config.margin;
        }
    }

    /**
     * Saves PDF with ATS-friendly filename
     * @param {string} name - Base name for file
     */
    savePDF(name) {
        const sanitizedName = this.sanitizeFilename(name);
        const timestamp = this.getCurrentDateString();
        const filename = `${sanitizedName}${PDFGenerator.CONSTANTS.FILENAME_SEPARATOR}Resume${PDFGenerator.CONSTANTS.FILENAME_SEPARATOR}${timestamp}.pdf`;
        this.pdf.save(filename);
    }

    /**
     * Sanitizes filename to remove invalid characters
     * @param {string} name - Original filename
     * @returns {string} Sanitized filename
     */
    sanitizeFilename(name) {
        return name.replace(/[^a-zA-Z0-9]/g, PDFGenerator.CONSTANTS.FILENAME_SEPARATOR);
    }

    /**
     * Gets current date as string for filename
     * @returns {string} Current date in YYYY-MM-DD format
     */
    getCurrentDateString() {
        return new Date().toISOString().split(PDFGenerator.CONSTANTS.DATE_SEPARATOR)[0];
    }

    /**
     * Shows success notification for PDF generation
     */
    showSuccessNotification() {
        const notification = this.createNotification(
            '#27ae60',
            '✅ ATS-Optimized PDF Generated Successfully!'
        );
        this.displayNotification(notification);
    }

    /**
     * Shows error notification for PDF generation failure
     */
    showErrorNotification() {
        const notification = this.createNotification(
            '#e74c3c',
            '❌ PDF Generation Failed!'
        );
        this.displayNotification(notification);
    }

    /**
     * Creates notification element with specified styling
     * @param {string} backgroundColor - Background color for notification
     * @param {string} message - Notification message
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
            padding: 15px 25px;
            border-radius: 8px;
            font-weight: bold;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            font-family: Arial, sans-serif;
        `;
        notification.textContent = message;
        return notification;
    }

    /**
     * Displays notification and auto-removes after timeout
     * @param {HTMLElement} notification - Notification element to display
     */
    displayNotification(notification) {
        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, PDFGenerator.CONSTANTS.NOTIFICATION_DURATION);
    }
}

// Export to global scope for application integration
window.PDFGenerator = PDFGenerator;
console.log('[PDFGenerator] ATS-Optimized PDF Generator v4.0.0 loaded successfully');