import { database } from './config.js';

class AdminForm {
    constructor() {
        this.form = document.getElementById('company-form');
        this.indicatorsContainer = document.getElementById('indicators-container');
        this.indicators = null;
        
        this.loadIndicators();
        this.setupFormSubmission();
    }

    async loadIndicators() {
        try {
            const response = await fetch('indicators.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Loaded data:', data); // Debug log
            
            // Get the indicators array from the data
            this.indicators = data.indicators || [];
            
            if (this.indicators.length === 0) {
                throw new Error('No indicators found in the data');
            }
            
            this.generateFormFields();
            console.log('Indicators loaded successfully');
        } catch (error) {
            console.error('Error loading indicators:', error);
            this.showError('Failed to load indicators. Please refresh the page.');
        }
    }

    generateFormFields() {
        if (!this.indicators) {
            console.error('No indicators loaded');
            return;
        }

        // Clear any existing fields
        this.indicatorsContainer.innerHTML = '';

        // Create introductory text
        const introDiv = document.createElement('div');
        introDiv.className = 'intro-text';
        introDiv.innerHTML = `
            <h3>Digital Responsibility Evaluation Form</h3>
            
            <p>This evaluation form is designed to assess a company's digital responsibility practices 
            across 8 key categories and 25 specific indicators.</p>
            
            <p>Each indicator is scored on a scale of 0-4, with detailed scoring criteria provided 
            to guide your assessment.</p>
            
            <p><small>The colored badges represent the digital responsibility goals: 
            <img src="media/cybersecurity.png" style="width: 20px; height: 20px; vertical-align: middle; margin: 0 2px;"> Cybersecurity, 
            <img src="media/digital_literacy.png" style="width: 20px; height: 20px; vertical-align: middle; margin: 0 2px;"> Digital Literacy, 
            <img src="media/data_fairness.png" style="width: 20px; height: 20px; vertical-align: middle; margin: 0 2px;"> Data Fairness, 
            <img src="media/privacy.png" style="width: 20px; height: 20px; vertical-align: middle; margin: 0 2px;"> Privacy, 
            <img src="media/transparency.png" style="width: 20px; height: 20px; vertical-align: middle; margin: 0 2px;"> Transparency, 
            <img src="media/human_agency.png" style="width: 20px; height: 20px; vertical-align: middle; margin: 0 2px;"> Human Agency,
            <img src="media/trustworthy_algorithms.png" style="width: 20px; height: 20px; vertical-align: middle; margin: 0 2px;"> Trustworthy Algorithms</small></p>
        `;
        this.indicatorsContainer.appendChild(introDiv);

        // Group indicators by category
        const categories = {
            'Security & Risk Management': this.indicators.filter(i => 
                i.id.startsWith('cyber_') || 
                i.id.startsWith('incident_') || 
                i.id.startsWith('vulnerability_')),
            'Data Governance & Privacy': this.indicators.filter(i => 
                i.id.startsWith('data_')),
            'Identity & Access': this.indicators.filter(i => 
                i.id.startsWith('identity_') || 
                i.id.startsWith('user_') || 
                i.id.startsWith('digital_identity_')),
            'Development & System Quality': this.indicators.filter(i => 
                i.id.startsWith('secure_') || 
                i.id.startsWith('service_') || 
                i.id.startsWith('interoperability_')),
            'Education & Documentation': this.indicators.filter(i => 
                i.id.startsWith('employee_') || 
                i.id.startsWith('customer_') || 
                i.id.startsWith('security_privacy_')),
            'Inclusivity & Accessibility': this.indicators.filter(i => 
                i.id.startsWith('digital_accessibility_') || 
                i.id.startsWith('digital_literacy_')),
            'Ethical Governance': this.indicators.filter(i => 
                i.id.startsWith('responsible_') || 
                i.id.startsWith('stakeholder_') || 
                i.id.startsWith('algorithmic_') || 
                i.id.startsWith('open_source_')),
            'Sustainable Digital Practices': this.indicators.filter(i => 
                i.id.startsWith('responsible_sunsetting_') || 
                i.id.startsWith('digital_sustainability_') || 
                i.id.startsWith('content_moderation_') || 
                i.id.startsWith('youth_protection_') || 
                i.id.startsWith('digital_workforce_'))
        };

        // Generate form fields for each category
        Object.entries(categories).forEach(([category, indicators]) => {
            if (indicators.length === 0) return; // Skip empty categories
            
            const categoryGroup = document.createElement('div');
            categoryGroup.className = 'indicator-group';
            
            const categoryTitle = document.createElement('h3');
            categoryTitle.textContent = category;
            categoryGroup.appendChild(categoryTitle);

            indicators.forEach(indicator => {
                const formGroup = document.createElement('div');
                formGroup.className = 'form-group';

                // Create label with name and badges
                const labelHeader = document.createElement('label');
                labelHeader.htmlFor = indicator.id;
                labelHeader.innerHTML = `
                    <strong>${indicator.name}</strong>
                    ${this.createGoalBadges(indicator.goals)}
                `;
                formGroup.appendChild(labelHeader);

                // Add description as separate element
                const description = document.createElement('small');
                description.textContent = indicator.description;
                description.style.display = 'block';
                description.style.marginTop = '8px';
                formGroup.appendChild(description);

                // Add verification as separate element with bold label
                const verification = document.createElement('small');
                verification.innerHTML = `<strong>Verification:</strong> ${indicator.verification}`;
                verification.style.display = 'block';
                verification.style.marginTop = '12px';
                verification.style.marginBottom = '16px';
                formGroup.appendChild(verification);

                // Create select element
                const select = document.createElement('select');
                select.id = indicator.id;
                select.name = indicator.id;
                select.required = true;
                select.style.marginTop = '8px';

                // Add options based on scoring
                const options = [
                    { value: '', text: 'Select a score' },
                    ...Object.entries(indicator.scoring).map(([score, desc]) => ({
                        value: score,
                        text: `${score} - ${desc}`
                    }))
                ];

                options.forEach(option => {
                    const optionElement = document.createElement('option');
                    optionElement.value = option.value;
                    optionElement.textContent = option.text;
                    select.appendChild(optionElement);
                });

                formGroup.appendChild(select);

                // Add comment textarea
                const commentInput = document.createElement('textarea');
                commentInput.id = `${indicator.id}_comment`;
                commentInput.name = `${indicator.id}_comment`;
                commentInput.placeholder = 'Add a comment about this indicator...';
                commentInput.className = 'indicator-comment';
                commentInput.style.marginTop = '12px';
                formGroup.appendChild(commentInput);

                categoryGroup.appendChild(formGroup);
            });

            this.indicatorsContainer.appendChild(categoryGroup);
        });
    }

    setupFormSubmission() {
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitButton = this.form.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Submitting...';
            
            try {
                const formData = new FormData(this.form);
                const companyData = {
                    name: document.getElementById('company-name').value,
                    sector: document.getElementById('company-sector').value,
                    comment: document.getElementById('company-comment').value,
                    indicators: {}
                };

                // Collect all indicator values and comments
                this.indicators.forEach(indicator => {
                    const value = formData.get(indicator.id);
                    const comment = formData.get(`${indicator.id}_comment`);
                    companyData.indicators[indicator.id] = {
                        value: value === 'N/A' ? null : Number(value),
                        comment: comment || null
                    };
                });

                // Save to Firebase
                const companiesRef = database.ref('companies');
                const newCompanyRef = companiesRef.push();
                await newCompanyRef.set(companyData);

                // Reset form
                this.form.reset();
                alert('Company assessment submitted successfully!');
                console.log('Company data saved successfully');
            } catch (error) {
                console.error('Error submitting form:', error);
                alert('Error submitting form. Please try again.');
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = 'Submit Assessment';
            }
        });
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        this.indicatorsContainer.insertBefore(errorDiv, this.indicatorsContainer.firstChild);
    }

    createGoalBadges(goals) {
        const badgeMap = {
            'cybersecurity': 'media/cybersecurity.png',
            'digital_literacy': 'media/digital_literacy.png',
            'data_fairness': 'media/data_fairness.png',
            'privacy': 'media/privacy.png',
            'transparency': 'media/transparency.png',
            'human_agency': 'media/human_agency.png',
            'trustworthy_algorithms': 'media/trustworthy_algorithms.png'
        };

        if (!goals || goals.length === 0) return '';

        const badgeHtml = goals.map(goal => `
            <img src="${badgeMap[goal] || 'media/default.png'}" 
                 alt="${goal.replace('_', ' ')}" 
                 class="goal-badge"
                 title="${goal.replace('_', ' ')}"
                 style="width: 24px; height: 24px; max-width: 24px; max-height: 24px; object-fit: contain;"
                 loading="lazy">
        `).join('');

        return `<div class="goal-badges" style="display: inline-flex; gap: 4px; margin-left: 8px; vertical-align: middle; align-items: center;">${badgeHtml}</div>`;
    }
}

// Initialize the form when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AdminForm();
}); 