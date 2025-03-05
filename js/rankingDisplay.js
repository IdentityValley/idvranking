import { database } from './config.js';
import { rankCompanies } from './scoreCalculator.js';

class RankingDisplay {
    constructor() {
        this.container = document.getElementById('ranking-container');
        this.sectorSelect = document.getElementById('sector-select');
        this.currentSector = 'All';
        this.allCompanies = [];
        
        if (!this.container) {
            console.error('Could not find ranking container element');
            return;
        }
        
        this.setupSectorFilter();
        this.setupRealtimeListener();
    }

    setupSectorFilter() {
        this.sectorSelect.addEventListener('change', () => {
            this.currentSector = this.sectorSelect.value;
            this.filterAndDisplayCompanies();
        });
    }

    setupRealtimeListener() {
        const companiesRef = database.ref('companies');
        companiesRef.on('value', (snapshot) => {
            const companies = snapshot.val() || {};
            console.log('Received companies data:', companies);
            this.allCompanies = rankCompanies(companies);
            console.log('Ranked companies:', this.allCompanies);
            this.filterAndDisplayCompanies();
        }, (error) => {
            console.error('Error reading companies data:', error);
            this.showError('Error loading rankings');
        });
    }

    filterAndDisplayCompanies() {
        let filteredCompanies = this.allCompanies;
        
        // Apply sector filter if not "All"
        if (this.currentSector !== 'All') {
            filteredCompanies = this.allCompanies.filter(company => 
                company.sector === this.currentSector
            );
        }
        
        this.displayRankings(filteredCompanies);
    }

    displayRankings(companies) {
        if (!companies || companies.length === 0) {
            this.container.innerHTML = '<div class="no-data">No companies found for the selected sector</div>';
            return;
        }

        this.container.innerHTML = '';
        
        companies.forEach((company, index) => {
            const row = document.createElement('div');
            row.className = 'ranking-row';
            row.innerHTML = `
                <div class="rank">${index + 1}</div>
                <div class="company-name">
                    <a href="company-detail.html?id=${company.id}">${company.name}</a>
                    <span class="company-sector">${company.sector}</span>
                </div>
                <div class="score">${company.score.toFixed(1)}</div>
                <div class="score-bar">${company.scoreBar}</div>
            `;
            this.container.appendChild(row);
        });
    }

    showError(message) {
        this.container.innerHTML = `
            <div class="error-message">
                <h2>Error</h2>
                <p>${message}</p>
            </div>
        `;
    }
}

// Initialize the display when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new RankingDisplay();
}); 