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
            this.indicators = [...data.core_indicators, ...data.specialized_indicators];
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

        // Display indicators by category
        Object.entries(categories).forEach(([category, indicators]) => {
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
                const progressText = value !== null ? ` (${value}/3)` : '';
                const segments = Array(3).fill('').map((_, i) => {
                    if (value === null) return '<div class="score-segment not-applicable"></div>';
                    return `<div class="score-segment ${i < value ? 'filled' : ''}"></div>`;
                }).join('');

                const indicatorItem = document.createElement('div');
                indicatorItem.className = 'indicator-item';
                indicatorItem.innerHTML = `
                    <div class="indicator-name">
                        <strong>${indicator.name}</strong>
                        <div>${indicator.description}</div>
                        ${comment ? `<div class="indicator-comment">${comment}</div>` : ''}
                    </div>
                    <div class="indicator-score">
                        <div class="score-value">${scoreText}${progressText}</div>
                        <div class="score-segments">${segments}</div>
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