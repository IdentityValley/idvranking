/**
 * Calculates the overall score for a company based on applicable indicators
 * @param {Object} indicators - Company indicators object containing indicator scores
 * @returns {Object} - Object containing score and metadata
 */
export function calculateScore(indicators) {
    // Filter out N/A values and calculate average
    const applicableScores = Object.values(indicators)
        .filter(indicator => indicator.value !== null)
        .map(indicator => indicator.value);

    if (applicableScores.length === 0) {
        return {
            score: 0,
            applicableIndicators: 0,
            totalIndicators: Object.keys(indicators).length,
            scoreBar: '[]'
        };
    }

    const average = applicableScores.reduce((sum, score) => sum + score, 0) / applicableScores.length;
    
    // Scale from 0-3 to 0-10
    const scaledScore = (average / 3) * 10;

    // Create ASCII bar visualization (10 segments)
    const filledSegments = Math.round(scaledScore);
    const scoreBar = '[' + '█'.repeat(filledSegments) + '░'.repeat(10 - filledSegments) + ']';

    return {
        score: scaledScore,
        applicableIndicators: applicableScores.length,
        totalIndicators: Object.keys(indicators).length,
        scoreBar
    };
}

/**
 * Ranks companies based on their scores
 * @param {Array} companies - Array of company objects with scores
 * @returns {Array} - Sorted array of companies with ranks
 */
export function rankCompanies(companies) {
    // Convert companies object to array and sort by score
    return Object.entries(companies)
        .map(([id, company]) => ({
            id,
            ...company,
            ...calculateScore(company.indicators)
        }))
        .sort((a, b) => {
            // Primary sort by score
            if (b.score !== a.score) {
                return b.score - a.score;
            }
            // Secondary sort by number of applicable indicators (tie breaker)
            return b.applicableIndicators - a.applicableIndicators;
        });
} 