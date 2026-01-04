/**
 * Deep Analysis Intelligence Engine
 * Calculates metrics for Subject Health, Chapter Quadrants, and Action Plans.
 */

// --- 1. Subject Health Index (SHI) ---
// SHI = (Accuracy * 0.4) + (AttemptRate * 0.4) + (Score/Topper * 0.2)
// Score/Topper is capped at 1 (in case of data anomalies)
export const calculateSHI = (stats) => {
    const accuracy = parseFloat(stats.Accuracy) || 0;
    const attemptRate = (parseFloat(stats['Correct Answers'] || 0) + parseFloat(stats['Wrong Answers'] || 0)) / (parseFloat(stats['Total Questions'] || 1)) * 100; // Estimate if not provided, usually redundant if Percentage exists
    // Fallback if total questions not explicit, use Percentage which is score based. 
    // Let's use the user's formula weights directly on available percentage-like stats.

    // Normalized inputs (0-100 scale)
    const normAccuracy = accuracy;
    // Attempt Rate isn't directly in stats usually, but we can infer or simpler: use "Percentage" as proxy for score capture? 
    // Actually, let's look at the data structure. 'Percentage' is marks obtained %. 
    // Let's assume stats has 'Percentage' (Marks %) and 'Accuracy'. 
    // We need 'Attempt Rate'. If missing, we can estimate: (Correct+Wrong)/Total. 
    // Current stats structure from previous `fetch_output.json`: 
    // { "Marks": "57", "Questions Skipped": "2", "Wrong Answers": "7", "Correct Answers": "16", ... }
    const totalQ = parseInt(stats['Correct Answers']) + parseInt(stats['Wrong Answers']) + parseInt(stats['Questions Skipped']);
    const attemptedQ = parseInt(stats['Correct Answers']) + parseInt(stats['Wrong Answers']);
    const normAttempt = totalQ > 0 ? (attemptedQ / totalQ) * 100 : 0;

    const topperMarks = parseFloat(stats['Topper Marks']) || 100; // Avoid Div/0
    const myMarks = parseFloat(stats['Marks']) || 0;
    const performanceRatio = Math.min(Math.max(myMarks / topperMarks, 0), 1) * 100;

    const shi = (normAccuracy * 0.4) + (normAttempt * 0.4) + (performanceRatio * 0.2);

    // Health Tag
    let tag = "Critical";
    let color = "red";
    if (shi >= 80) { tag = "Excellent"; color = "green"; }
    else if (shi >= 60) { tag = "Good / Stable"; color = "cyan"; }
    else if (shi >= 40) { tag = "Medium Risk"; color = "yellow"; }

    return { score: shi.toFixed(1), tag, color, attemptRate: normAttempt.toFixed(1) };
};

// --- 2. Chapter Classification Engine ---
export const classifyChapter = (chapter) => {
    const acc = parseFloat(chapter.accuracy) || 0;
    const score = parseFloat(chapter.score) || 0;
    const attempt = parseFloat(chapter.attempt) || 0; // "attemptRate" from API mapped to "attempt" in UI

    let status = "Neutral";
    let color = "gray";
    let message = "";

    // Trap: High Attempt, Low Accuracy (Negative Score usually)
    if (attempt > 80 && acc < 30) {
        status = "Trap";
        color = "red";
        message = "High negative marks! Concept revision needed.";
    }
    // Strong: High Accuracy, High Score
    else if (acc >= 90 && score >= 4) {
        status = "Strong";
        color = "green"; // text-green-400
        message = "Bankable chapter. Maintain revision.";
    }
    // Avoided: Low Attempt
    else if (attempt === 0) {
        status = "Unattempted";
        color = "stone";
        message = "Potential scoring opportunity if easy.";
    }
    // Partial: Mid Accuracy
    else if (acc >= 50 && acc < 90) {
        status = "Partial";
        color = "yellow";
        message = "Accuracy needs improvement.";
    }
    else {
        status = "Weak";
        color = "orange";
        message = "Re-learn basics.";
    }

    return { status, color, message };
};

// --- 3. Quadrant Analyzer ---
export const analyzeQuadrant = (chapters) => {
    // Return counts for 4 quadrants
    const result = {
        strength: [], // High Acc, High Att
        underutilized: [], // High Acc, Low Att
        risk: [], // Low Acc, High Att
        weak: [] // Low Acc, Low Att
    };

    chapters.forEach(chap => {
        const acc = parseFloat(chap.accuracy);
        const attempt = parseFloat(chap.attempt);

        if (acc >= 70 && attempt >= 70) result.strength.push(chap);
        else if (acc >= 70 && attempt < 70) result.underutilized.push(chap);
        else if (acc < 70 && attempt >= 70) result.risk.push(chap);
        else result.weak.push(chap);
    });

    return result;
};

// --- 4. Insights Generator ---
// --- 4. Insights Generator ---
export const generateInsights = (overall, subjects) => {
    const tips = [];

    // 1. Accuracy - Volume Balance
    if (parseFloat(overall.Accuracy) > 85 && parseFloat(overall.Percentage) < 60) {
        tips.push({
            title: "Strategy Alert: Play Bolder",
            text: "Your accuracy is elite (>85%), but you aren't attempting enough. Safe to increase attempts by 10-15% next mock."
        });
    } else if (parseFloat(overall.Accuracy) < 75) {
        tips.push({
            title: "Negative Marking Alert",
            text: "You are losing rank to guesses. Prioritize eliminating 'High Risk' chapters."
        });
    }

    // 2. Positive Reinforcement (High Performers)
    const strongSubjects = subjects.filter(s => calculateSHI(s.stats).score > 75);
    if (strongSubjects.length > 0) {
        const names = strongSubjects.map(s => s.name).join(' & ');
        tips.push({
            title: `Dominating ${names}`,
            text: `Your foundation in ${names} is rock solid. Focus mainly on maintaining speed here.`
        });
    }

    // 3. Critical Intervention
    const criticalSub = subjects.find(s => calculateSHI(s.stats).score < 40);
    if (criticalSub) {
        tips.push({
            title: `Critical: ${criticalSub.name}`,
            text: `${criticalSub.name} is dragging down your total rank. Immediate intervention needed.`
        });
    }

    // 4. Trap Detection (Only if no critical alert to avoid noise)
    if (!criticalSub) {
        const allTraps = subjects.flatMap(s => s.chapters.filter(c => parseFloat(c.attempt) > 80 && parseFloat(c.accuracy) < 40));
        if (allTraps.length > 0) {
            tips.push({
                title: "Trap Detection",
                text: `Stop blind attempts in: ${allTraps.slice(0, 3).map(c => c.name).join(', ')}.`
            });
        }
    }

    return tips.slice(0, isHighPerformer(overall) ? 4 : 5);
};

// Guardrail Helper
const isHighPerformer = (overall) => parseFloat(overall.Percentile) >= 97;
/**
 * Generates actionable improvement plan
 */
export const generateActionPlan = (subjects, overall) => {
    let plan = [];
    // ... existing logic but enhanced with categories ...
    // Actually, let's keep the existing logic simpler for now and just add the new function below.
    // I Will rewrite generateActionPlan to include the categorization logic directly in the object.

    subjects.forEach(sub => {
        sub.chapters.forEach(chap => {
            const classification = classifyChapter(chap);
            // ... (rest of logic handles filtering)
            if (classification.status === 'Trap' || classification.status === 'Weak') {
                // Calculate Potential
                let potential = 0;
                if (classification.status === 'Trap') potential = Math.abs(Number(chap.score)) + 4; // Recover lost + gain marks
                if (classification.status === 'Weak') potential = 4; // Gain marks

                plan.push({
                    subject: sub.name,
                    name: chap.name,
                    reason: classification.status,
                    potential: potential,
                    // New: Add category
                    category: classification.status === 'Trap' ? 'Immediate' : 'Strategic'
                });
            }
        });
    });

    // Add missed opportunities (Skipped high weightage?) -> For now based on attempt rate
    subjects.forEach(sub => {
        sub.chapters.forEach(chap => {
            if (Number(chap.attempt) === 0 || Number(chap.attempt) < 50) {
                // Check if already in plan (Weak might cover it)
                const exists = plan.find(p => p.name === chap.name);
                if (!exists) {
                    plan.push({
                        subject: sub.name,
                        name: chap.name,
                        reason: 'Missed',
                        potential: 4,
                        category: 'Strategic'
                    });
                }
            }
        });
    });

    return plan.sort((a, b) => b.potential - a.potential).slice(0, overall.Percentile >= 97 ? 6 : 10);
};

export const calculateAdvancedStats = (subjects) => {
    let totalNegative = 0;
    let negativeChapters = [];
    let missedOpp = 0;
    let missedChapters = [];

    subjects.forEach(sub => {
        sub.chapters.forEach(chap => {
            const score = Number(chap.score);
            if (score < 0) {
                totalNegative += Math.abs(score);
                negativeChapters.push({ ...chap, subject: sub.name });
            }
            if (Number(chap.attempt) === 0) {
                missedOpp += 4; // Assuming 4 marks per question potential
                missedChapters.push({ ...chap, subject: sub.name });
            }
        });
    });

    return {
        totalNegative,
        negativeChapters,
        missedOpp,
        missedChapters
    };
};
