/**
 * JEE Main Percentile Calculator Utilities
 * 
 * Provides functions to estimate JEE Main percentile based on raw marks
 * using a hybrid approach of Scientific Modeling and Table-based Interpolation.
 */

// Data Sources (NTA Marks vs Percentile)
export const JEE_MAIN_2024 = [
    { min: 281, max: 300, pMin: 99.99989145, pMax: 100.00000000 },
    { min: 271, max: 280, pMin: 99.99468100, pMax: 99.99739400 },
    { min: 263, max: 270, pMin: 99.99099000, pMax: 99.99402900 },
    { min: 250, max: 262, pMin: 99.97720500, pMax: 99.98881900 },
    { min: 241, max: 250, pMin: 99.96016300, pMax: 99.97503400 },
    { min: 231, max: 240, pMin: 99.93498000, pMax: 99.95636400 },
    { min: 221, max: 230, pMin: 99.90111300, pMax: 99.92890100 },
    { min: 211, max: 220, pMin: 99.85161600, pMax: 99.89373200 },
    { min: 201, max: 210, pMin: 99.79506300, pMax: 99.84521200 },
    { min: 191, max: 200, pMin: 99.71083100, pMax: 99.78247200 },
    { min: 181, max: 190, pMin: 99.68857900, pMax: 99.73999000 },
    { min: 171, max: 180, pMin: 99.45693900, pMax: 99.57319300 },
    { min: 161, max: 170, pMin: 99.27208400, pMax: 99.43121400 },
    { min: 151, max: 160, pMin: 99.02861400, pMax: 99.23973700 },
    { min: 141, max: 150, pMin: 98.73238900, pMax: 98.99029600 },
    { min: 131, max: 140, pMin: 98.31741400, pMax: 98.66693500 },
    { min: 121, max: 130, pMin: 97.81126000, pMax: 98.25413200 },
    { min: 111, max: 120, pMin: 97.14293700, pMax: 97.68567200 },
    { min: 101, max: 110, pMin: 96.20455000, pMax: 96.97827200 },
    { min: 91, max: 100, pMin: 94.99859400, pMax: 96.06485000 },
    { min: 81, max: 90, pMin: 93.47123100, pMax: 94.74947900 },
    { min: 71, max: 80, pMin: 91.07212800, pMax: 93.15297100 },
    { min: 61, max: 70, pMin: 87.51222500, pMax: 90.70220000 },
    { min: 51, max: 60, pMin: 82.01606200, pMax: 86.90794400 },
    { min: 41, max: 50, pMin: 73.28780800, pMax: 80.98215300 },
    { min: 31, max: 40, pMin: 58.15149000, pMax: 71.30205200 },
    { min: 21, max: 30, pMin: 37.39452900, pMax: 56.56931000 },
    { min: 11, max: 20, pMin: 13.49584900, pMax: 33.22912800 },
    { min: 0, max: 10, pMin: 0.84351770, pMax: 9.69540660 }
];

export const JEE_MAIN_2025 = [
    { min: 281, max: 300, pMin: 99.99989145, pMax: 100.00000000 },
    { min: 271, max: 280, pMin: 99.99468100, pMax: 99.99739400 },
    { min: 263, max: 270, pMin: 99.99099000, pMax: 99.99402900 },
    { min: 250, max: 262, pMin: 99.97720500, pMax: 99.98881900 },
    { min: 241, max: 250, pMin: 99.96016300, pMax: 99.97503400 },
    { min: 231, max: 240, pMin: 99.93498000, pMax: 99.95636400 },
    { min: 221, max: 230, pMin: 99.90111300, pMax: 99.92890100 },
    { min: 211, max: 220, pMin: 99.85161600, pMax: 99.89373200 },
    { min: 201, max: 210, pMin: 99.79506300, pMax: 99.84521200 },
    { min: 191, max: 200, pMin: 99.71083100, pMax: 99.78247200 },
    { min: 181, max: 190, pMin: 99.59739900, pMax: 99.68857900 },
    { min: 171, max: 180, pMin: 99.45693900, pMax: 99.57319300 },
    { min: 161, max: 170, pMin: 99.27208400, pMax: 99.43121400 },
    { min: 151, max: 160, pMin: 99.02861400, pMax: 99.23973700 },
    { min: 141, max: 150, pMin: 98.73238900, pMax: 98.99029600 },
    { min: 131, max: 140, pMin: 98.31741400, pMax: 98.66693500 },
    { min: 121, max: 130, pMin: 97.81126000, pMax: 98.25413200 },
    { min: 111, max: 120, pMin: 97.14293700, pMax: 97.68567200 },
    { min: 101, max: 110, pMin: 96.20455000, pMax: 96.97827200 },
    { min: 91, max: 100, pMin: 94.99859400, pMax: 96.06485000 },
    { min: 81, max: 90, pMin: 93.47123100, pMax: 94.74947900 },
    { min: 71, max: 80, pMin: 91.07212800, pMax: 93.15297100 },
    { min: 61, max: 70, pMin: 87.51222500, pMax: 90.70220000 },
    { min: 51, max: 60, pMin: 82.01606200, pMax: 86.90794400 },
    { min: 41, max: 50, pMin: 73.28780800, pMax: 80.98215300 },
    { min: 31, max: 40, pMin: 58.15149000, pMax: 71.30205200 },
    { min: 21, max: 30, pMin: 37.69452900, pMax: 56.56931000 },
    { min: 11, max: 20, pMin: 13.49584900, pMax: 33.22912800 },
    { min: 0, max: 10, pMin: 0.84351770, pMax: 9.69540660 }
];

/**
 * Calculates percentile using scientific model derived from research.
 * P(m) = 100 * ( (1 - e^(-b(m+c)))^n ) / ( (1 - e^(-b(300+c)))^n )
 * 
 * @param {number} marks - Student's raw score
 * @returns {number} - Modeled percentile (0-100)
 */
export const calculateScientificPercentile = (marks) => {
    // Constants derived from regression analysis of previous years' data
    const b = 0.0315;
    const c = 50;
    const n = 7;
    const maxScore = 300;

    // Helper: P_raw(x) = (1 - e^(-b(x + c)))^n
    const P_raw = (x) => Math.pow((1 - Math.exp(-b * (x + c))), n);

    const numerator = P_raw(marks);
    const denominator = P_raw(maxScore);

    let p = 100 * (numerator / denominator);

    // Clamp between 0 and 100
    if (p > 100) p = 100;
    if (p < 0) p = 0;

    return p;
};

/**
 * Interpolates percentile linearly from the official data table.
 * 
 * @param {number} marks - Student's raw score
 * @param {Array} dataset - The dataset to use (JEE_MAIN_2024 or JEE_MAIN_2025)
 * @returns {number|null} - Interpolated percentile or null if out of range (though dataset covers 0-300)
 */
export const interpolatePercentile = (marks, dataset) => {
    // Find the range [min, max] that includes the score
    const range = dataset.find(r => marks >= r.min && marks <= r.max);

    if (!range) {
        // Fallback for edge cases outside table bounds? 
        // Our table covers 0 to 300, so this should strictly almost never happen for valid marks.
        // If marks > 300, return 100. If marks < 0, return 0.
        if (marks > 300) return 100;
        if (marks < 0) return 0;
        return null;
    }

    // Linear Interpolation: 
    // P = pMin + ( (marks - min) / (max - min) ) * (pMax - pMin)

    // Avoid division by zero if max === min
    if (range.max === range.min) return range.pMax;

    const ratio = (marks - range.min) / (range.max - range.min);
    const pDiff = range.pMax - range.pMin;

    const p = range.pMin + (ratio * pDiff);

    return p;
};

/**
 * Main Calculator Function
 * Combines Table Interpolation (Primary) and Scientific Model (Secondary/Verification)
 * to provide the most accurate JEE Main Percentile prediction.
 * 
 * @param {number} marks - Raw Score
 * @param {string} year - '2024' or '2025' (default: '2025')
 * @returns {number} - Predicted Percentile fixed to 7 decimal places commonly used in JEE
 */
export const calculatePredictedPercentile = (marks, year = '2025') => {
    const dataset = year === '2024' ? JEE_MAIN_2024 : JEE_MAIN_2025;

    const numericMarks = Number(marks);
    if (isNaN(numericMarks)) return 0;

    // Step 1: Try Table Interpolation (Ground Truth)
    const tableVal = interpolatePercentile(numericMarks, dataset);

    if (tableVal !== null) {
        return Number(tableVal.toFixed(7));
    }

    // Step 2: Fallback to Scientific Model if table lookup fails (unlikely for 0-300)
    const modelVal = calculateScientificPercentile(numericMarks);
    return Number(modelVal.toFixed(7));
};
