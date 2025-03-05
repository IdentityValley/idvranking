import { database } from './config.js';
import { rankCompanies } from './scoreCalculator.js';

class RankingDisplay {
    constructor() {
        this.container = document.getElementById('ranking-container');
        if (!this.container) {
            console.error('Could not find ranking container element');
            return;
        }
        this.setupRealtimeListener();
    }

    setupRealtimeListener() {
        const companiesRef = database.ref('companies');
        companiesRef.on('value', (snapshot) => {
            const companies = snapshot.val() || {};
            console.log('Received companies data:', companies);
            const rankedCompanies = rankCompanies(companies);
            console.log('Ranked companies:', rankedCompanies);
            this.displayRankings(rankedCompanies);
        }, (error) => {
            console.error('Error reading companies data:', error);
            this.showError('Error loading rankings');
        });
    }

    displayRankings(companies) {
        if (!companies || companies.length === 0) {
            this.container.innerHTML = '<div class="no-data">No companies found</div>';
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