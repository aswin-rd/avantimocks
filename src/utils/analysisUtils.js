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
export const generateInsights = (overall, subjects) => {
    const tips = [];

    // Overall Strategy
    if (parseFloat(overall.Accuracy) > 85 && parseFloat(overall.Percentage) < 60) {
        tips.push({ title: "High Accuracy, Low Volume", text: "You are playing too safe. Your accuracy is elite, but you aren't attempting enough questions. Try to increase your attempt rate by 10-15% in the next mock." });
    }
    if (parseFloat(overall.Accuracy) < 70) {
        tips.push({ title: "Negative Marking Alert", text: "You are losing significant marks to guesses. Focus on eliminating 'Trap' chapters where you attempt a lot but score low." });
    }

    // Subject Specifics
    subjects.forEach(sub => {
        const shi = calculateSHI(sub.stats);
        if (shi.score < 40) {
            tips.push({ title: `Critical: ${sub.name}`, text: `${sub.name} needs immediate intervention. It is dragging down your total rank.` });
        }

        // Check for specific chapter patterns
        const traps = sub.chapters.filter(c => parseFloat(c.attempt) > 80 && parseFloat(c.accuracy) < 40);
        if (traps.length > 0) {
            tips.push({
                title: `${sub.name} Traps`,
                text: `Stop blind attempts in: ${traps.map(c => c.name).slice(0, 3).join(', ')}. Revising these concepts > solving new ones.`
            });
        }
    });

    return tips;
};

// --- 5. Action Plan Generator ---
export const generateActionPlan = (subjects) => {
    // Identify top 3 weak areas
    let weakChapters = [];
    subjects.forEach(sub => {
        sub.chapters.forEach(chap => {
            const cls = classifyChapter(chap);
            if (cls.status === "Trap" || cls.status === "Weak") {
                weakChapters.push({ ...chap, subject: sub.name, reason: cls.status });
            }
        });
    });

    // Sort by "Potential Loss" (High attempt but low score means high pain)
    weakChapters.sort((a, b) => {
        // Prioritize Trap chapters (high attempt, low accuracy)
        if (a.reason === "Trap" && b.reason !== "Trap") return -1;
        if (b.reason === "Trap" && a.reason !== "Trap") return 1;
        return parseFloat(a.score) - parseFloat(b.score);
    });

    return weakChapters.slice(0, 5); // Return top 5 actionable chapters
};
