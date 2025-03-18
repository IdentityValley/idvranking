import { database } from './config.js';
import { calculateScore } from './scoreCalculator.js';

class CompanyDetail {
    constructor() {
        this.container = document.getElementById('company-details');
        this.indicators = null;
        this.companyId = this.getCompanyIdFromUrl();
        
        this.loadIndicators();
        this.loadCompanyData();
        this.setupDeleteButton();
    }

    getCompanyIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    setupDeleteButton() {
        const deleteButton = document.getElementById('delete-company');
        if (deleteButton) {
            deleteButton.addEventListener('click', () => this.handleDelete());
        }
    }

    async handleDelete() {
        if (!this.companyId) return;

        const confirmed = confirm('Are you sure you want to delete this company? This action cannot be undone.');
        if (!confirmed) return;

        try {
            const companyRef = database.ref(`companies/${this.companyId}`);
            await companyRef.remove();
            alert('Company deleted successfully');
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Error deleting company:', error);
            alert('Error deleting company. Please try again.');
        }
    }

    async loadIndicators() {
        try {
            const response = await fetch('indicators.json');
            const data = await response.json();
            this.indicators = data.indicators || [];
        } catch (error) {
            console.error('Error loading indicators:', error);
        }
    }

    async loadCompanyData() {
        if (!this.companyId) {
            this.showError('No company ID provided');
            return;
        }

        try {
            const companyRef = database.ref(`companies/${this.companyId}`);
            const snapshot = await companyRef.once('value');
            const company = snapshot.val();

            if (!company) {
                this.showError('Company not found');
                return;
            }

            this.displayCompanyDetails(company);
        } catch (error) {
            console.error('Error loading company data:', error);
            this.showError('Error loading company data');
        }
    }

    displayCompanyDetails(company) {
        if (!company) {
            this.container.innerHTML = '<div class="error-message">Company not found</div>';
            return;
        }

        if (!this.indicators) {
            this.container.innerHTML = '<div class="error-message">Error: Indicators not loaded</div>';
            return;
        }

        console.log('Company data:', company);
        console.log('Indicators:', this.indicators);

        // Calculate the score first
        const { score, scoreBar } = calculateScore(company.indicators);

        // Create company info section
        const companyInfo = document.createElement('div');
        companyInfo.className = 'company-info';
        
        companyInfo.innerHTML = `
            <h2>${company.name}</h2>
            ${company.sector ? `<div class="company-sector-info">Sector: ${company.sector}</div>` : ''}
            ${company.comment ? `<div class="company-comment">${company.comment}</div>` : ''}
            <div class="score-summary">
                <div class="score-item">
                    <div class="value">${score.toFixed(1)}</div>
                    <div>Overall Score</div>
                </div>
                <div class="score-item">
                    <div class="value">${scoreBar}</div>
                    <div>Score Bar</div>
                </div>
            </div>
        `;
        this.container.appendChild(companyInfo);

        // Group indicators by category
        const categories = {
            'Security & Risk Management': this.indicators.filter(i => 
                i.id.startsWith('cyber_') || 
                i.id.startsWith('incident_') || 
                i.id.startsWith('vulnerability_')),
            'Data Governance & Privacy': this.indicators.filter(i => 
                i.id.startsWith('data_') || 
                i.id.startsWith('data_governance_')),
            'Identity & Access': this.indicators.filter(i => 
                i.id.startsWith('identity_') || 
                i.id.startsWith('access_')),
            'Development & System Quality': this.indicators.filter(i => 
                i.id.startsWith('secure_') || 
                i.id.startsWith('service_')),
            'Education & Documentation': this.indicators.filter(i => 
                i.id.startsWith('employee_') || 
                i.id.startsWith('customer_') || 
                i.id.startsWith('security_')),
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

        // Display indicators by category
        Object.entries(categories).forEach(([category, indicators]) => {
            if (indicators.length === 0) return; // Skip empty categories
            
            const categoryGroup = document.createElement('div');
            categoryGroup.className = 'indicator-group';
            
            const categoryTitle = document.createElement('h3');
            categoryTitle.textContent = category;
            categoryGroup.appendChild(categoryTitle);

            indicators.forEach(indicator => {
                const indicatorData = company.indicators[indicator.id];
                const value = indicatorData ? indicatorData.value : null;
                const comment = indicatorData ? indicatorData.comment : '';
                const scoreText = value === null ? 'Not Applicable' : value;
                const progressText = value !== null ? ` (${value}/4)` : '';
                
                // Generate recommendations based on current score
                let recommendation = '';
                if (value !== null && value < 4) {
                    const nextLevel = value + 1;
                    recommendation = `
                        <div class="recommendation-tooltip">
                            <h4>Recommendations to reach level ${nextLevel}:</h4>
                            <p>${indicator.scoring[nextLevel]}</p>
                            ${nextLevel < 4 ? `<p class="next-milestone">Next milestone: ${indicator.scoring[nextLevel + 1]}</p>` : ''}
                        </div>
                    `;
                }

                const segments = Array(4).fill('').map((_, i) => {
                    if (value === null) return '<div class="score-segment not-applicable" style="width: 14px;"></div>';
                    return `<div class="score-segment ${i < value ? 'filled' : ''}" style="width: 14px;"></div>`;
                }).join('');

                const indicatorItem = document.createElement('div');
                indicatorItem.className = 'indicator-item';
                indicatorItem.innerHTML = `
                    <div class="indicator-name">
                        <strong>${indicator.name}</strong>
                        ${this.createGoalBadges(indicator.goals)}
                        <div style="font-size: 0.9em; color: var(--secondary-text); margin-top: 4px;">${indicator.description}</div>
                        ${comment ? `<div class="indicator-comment">${comment}</div>` : ''}
                    </div>
                    <div class="indicator-score">
                        <div class="score-value">${scoreText}${progressText}</div>
                        <div class="score-segments-container">
                            <div class="score-segments" style="gap: 2px;">${segments}</div>
                            ${recommendation}
                        </div>
                    </div>
                `;
                categoryGroup.appendChild(indicatorItem);
            });

            this.container.appendChild(categoryGroup);
        });
    }

    createScoreSegments(value) {
        if (value === null) {
            return '<div class="score-segments"><div class="score-segment na"></div><div class="score-segment na"></div><div class="score-segment na"></div></div>';
        }
        
        const segments = document.createElement('div');
        segments.className = 'score-segments';
        
        for (let i = 0; i < 3; i++) {
            const segment = document.createElement('div');
            segment.className = 'score-segment';
            if (i < value) {
                segment.classList.add('filled');
            }
            segments.appendChild(segment);
        }
        
        return segments.outerHTML;
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

    showError(message) {
        this.container.innerHTML = `
            <div class="error">
                <h2>Error</h2>
                <p>${message}</p>
                <a href="index.html">Return to Rankings</a>
            </div>
        `;
    }
}

// Initialize the display when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CompanyDetail();
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
             title="${badge.replace('_', ' ')}">
    `).join('');

    return `<div class="goal-badges">${badgeHtml}</div>`;
}

// Update the display function
function displayCompanyDetails(company) {
    // ... existing code ...
    
    // Inside the loop where indicators are displayed
    Object.entries(company.indicators).forEach(([indicatorId, rating]) => {
        const indicator = indicators.find(i => i.id === indicatorId);
        if (indicator) {
            const indicatorHtml = `
                <div class="indicator-item">
                    <div class="indicator-header">
                        <h3>${indicator.name}</h3>
                        ${this.createGoalBadges(indicatorId)}
                    </div>
                    <div class="rating">Rating: ${rating}</div>
                    <div class="description">${indicator.description}</div>
                </div>
            `;
            indicatorsContainer.insertAdjacentHTML('beforeend', indicatorHtml);
        }
    });
    
    // ... rest of existing code ...
}

// ... rest of existing code ... 