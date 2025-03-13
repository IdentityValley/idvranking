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
            // Combine core and specialized indicators
            this.indicators = [...data.core_indicators, ...data.specialized_indicators];
            this.generateFormFields();
            console.log('Indicators loaded successfully');
        } catch (error) {
            console.error('Error loading indicators:', error);
            this.showError('Failed to load indicators. Please refresh the page.');
        }
    }

    generateFormFields() {
        // Group indicators by category
        const categories = {
            'Core Indicators': this.indicators.filter(i => i.id.startsWith('employee_') || 
                                                         i.id.startsWith('data_') || 
                                                         i.id.startsWith('security_') || 
                                                         i.id.startsWith('cyber_')),
            'Specialized Indicators': this.indicators.filter(i => i.id.startsWith('cloud_') || 
                                                               i.id.startsWith('ai_') || 
                                                               i.id.startsWith('human_') || 
                                                               i.id.startsWith('algorithmic_') || 
                                                               i.id.startsWith('digital_') || 
                                                               i.id.startsWith('cognitive_') || 
                                                               i.id.startsWith('dark_') || 
                                                               i.id.startsWith('intergenerational_'))
        };

        // Generate form fields for each category
        Object.entries(categories).forEach(([category, indicators]) => {
            const categoryGroup = document.createElement('div');
            categoryGroup.className = 'indicator-group';
            
            const categoryTitle = document.createElement('h3');
            categoryTitle.textContent = category;
            categoryGroup.appendChild(categoryTitle);

            indicators.forEach(indicator => {
                const formGroup = document.createElement('div');
                formGroup.className = 'form-group';

                const label = document.createElement('label');
                label.htmlFor = indicator.id;
                label.innerHTML = `
                    <strong>${indicator.name}</strong>
                    ${createGoalBadges(indicator.id)}
                    <br>
                    <small>${indicator.description}</small><br>
                    <small>Verification: ${indicator.verification_method}</small>
                `;

                const select = document.createElement('select');
                select.id = indicator.id;
                select.name = indicator.id;
                select.required = true;

                // Add options
                const options = [
                    { value: '', text: 'Select a score' },
                    { value: '0', text: '0 - Not Implemented' },
                    { value: '1', text: '1 - Partially Implemented' },
                    { value: '2', text: '2 - Mostly Implemented' },
                    { value: '3', text: '3 - Fully Implemented' },
                    { value: 'N/A', text: 'N/A - Not Applicable' }
                ];

                options.forEach(option => {
                    const optionElement = document.createElement('option');
                    optionElement.value = option.value;
                    optionElement.textContent = option.text;
                    select.appendChild(optionElement);
                });

                const commentInput = document.createElement('textarea');
                commentInput.id = `${indicator.id}_comment`;
                commentInput.name = `${indicator.id}_comment`;
                commentInput.placeholder = 'Add a comment about this indicator...';
                commentInput.className = 'indicator-comment';

                formGroup.appendChild(label);
                formGroup.appendChild(select);
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
}

// Initialize the form when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AdminForm();
});

// Function to get relevant goal badges for an indicator
function getGoalBadges(indicatorId) {
    const badgeMap = {
        // Core Indicators
        'employee_security_training': ['cybersecurity', 'digital_literacy'],
        'data_minimization': ['privacy', 'data_fairness'],
        'security_privacy_documentation': ['cybersecurity', 'privacy', 'transparency'],
        'cyber_threat_intelligence': ['cybersecurity'],
        'data_subject_rights': ['privacy', 'human_agency'],
        'digital_dignity': ['human_agency', 'data_fairness'],
        
        // Specialized Indicators
        'cloud_security': ['cybersecurity'],
        'ai_governance': ['trustworthy_algorithms', 'transparency'],
        'human_oversight': ['human_agency', 'trustworthy_algorithms'],
        'algorithmic_fairness': ['data_fairness', 'trustworthy_algorithms'],
        'digital_twins_ethics': ['human_agency', 'privacy'],
        'cognitive_load': ['human_agency'],
        'dark_pattern_avoidance': ['human_agency', 'transparency'],
        'intergenerational_impact': ['human_agency', 'data_fairness']
    };

    return badgeMap[indicatorId] || [];
}

// Function to create goal badge HTML
function createGoalBadges(indicatorId) {
    const badges = getGoalBadges(indicatorId);
    if (badges.length === 0) return '';

    const badgeHtml = badges.map(badge => `
        <img src="media/${badge}.png" 
             alt="${badge.replace('_', ' ')}" 
             class="goal-badge"
             title="${badge.replace('_', ' ')}"
             style="width: 24px; height: 24px; max-width: 24px; max-height: 24px; object-fit: contain;"
             loading="lazy">
    `).join('');

    return `<div class="goal-badges" style="display: inline-flex; gap: 4px; margin-left: 8px; vertical-align: middle; align-items: center;">${badgeHtml}</div>`;
}

// Update the form generation code
function generateForm() {
    // ... existing code ...
    
    // Inside the loop where indicators are added
    indicators.forEach(indicator => {
        const indicatorHtml = `
            <div class="form-group">
                <label for="${indicator.id}">${indicator.name}</label>
                ${createGoalBadges(indicator.id)}
                <select id="${indicator.id}" name="${indicator.id}" required>
                    <option value="">Select rating</option>
                    ${Object.entries(indicator.scoring_logic).map(([score, desc]) => 
                        `<option value="${score}">${score} - ${desc}</option>`
                    ).join('')}
                </select>
                <div class="indicator-description">${indicator.description}</div>
            </div>
        `;
        indicatorsContainer.insertAdjacentHTML('beforeend', indicatorHtml);
    });
    
    // ... rest of existing code ...
}

// ... rest of existing code ... 