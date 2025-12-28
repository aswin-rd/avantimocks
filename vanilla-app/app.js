const state = {
    files: [],
    studentId: '',
    results: [] // Processed data from all files
};

// DOM Elements
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('file-list');
const studentIdInput = document.getElementById('studentIdInput');
const analyzeBtn = document.getElementById('analyzeBtn');
const loadingScreen = document.getElementById('loading-screen'); // New Loader

// --- JEE Percentile Utilities (Ported) ---

const JEE_MAIN_2024 = [
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

const JEE_MAIN_2025 = [
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

function calculateScientificPercentile(marks) {
    const b = 0.0315;
    const c = 50;
    const n = 7;
    const maxScore = 300;
    const P_raw = (x) => Math.pow((1 - Math.exp(-b * (x + c))), n);
    const numerator = P_raw(marks);
    const denominator = P_raw(maxScore);
    let p = 100 * (numerator / denominator);
    if (p > 100) p = 100;
    if (p < 0) p = 0;
    return p;
}

function interpolatePercentile(marks, dataset) {
    const range = dataset.find(r => marks >= r.min && marks <= r.max);
    if (!range) {
        if (marks > 300) return 100;
        if (marks < 0) return 0;
        return null;
    }
    if (range.max === range.min) return range.pMax;
    const ratio = (marks - range.min) / (range.max - range.min);
    const pDiff = range.pMax - range.pMin;
    return range.pMin + (ratio * pDiff);
}

function calculatePredictedPercentile(marks, year = '2025') {
    const dataset = year === '2024' ? JEE_MAIN_2024 : JEE_MAIN_2025;
    const numericMarks = Number(marks);
    if (isNaN(numericMarks)) return 0;
    const tableVal = interpolatePercentile(numericMarks, dataset);
    if (tableVal !== null) return Number(tableVal.toFixed(7));
    const modelVal = calculateScientificPercentile(numericMarks);
    return Number(modelVal.toFixed(7));
}

// --- Event Listeners ---

dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
});

fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

studentIdInput.addEventListener('input', (e) => {
    state.studentId = e.target.value.trim();
    checkCanAnalyze();
});

analyzeBtn.addEventListener('click', startAnalysis);

// --- File Handling ---

function handleFiles(fileListObj) {
    const newFiles = Array.from(fileListObj).filter(f => f.name.endsWith('.xlsx') || f.name.endsWith('.xls'));
    state.files = [...state.files, ...newFiles];
    renderFileList();
    checkCanAnalyze();
}

function renderFileList() {
    fileList.innerHTML = '';
    state.files.forEach((file, idx) => {
        const div = document.createElement('div');
        div.className = 'file-item';
        div.innerHTML = `
            <span><i class="ri-file-excel-line" style="color:#00ff9d; margin-right:8px;"></i> ${file.name}</span>
            <i class="ri-close-line" style="cursor:pointer; color:#ff0055;" onclick="removeFile(${idx})"></i>
        `;
        fileList.appendChild(div);
    });
}

window.removeFile = (idx) => {
    state.files.splice(idx, 1);
    renderFileList();
    checkCanAnalyze();
};

function checkCanAnalyze() {
    analyzeBtn.disabled = !(state.files.length > 0 && state.studentId.length > 0);
}

// --- Analysis Logic ---

async function startAnalysis() {
    // Show Loading Screen
    loadingScreen.classList.remove('hidden');

    // Slight delay to allow UI to update and show the animation
    await new Promise(r => setTimeout(r, 100));

    try {
        const allTestResults = [];

        // Artificial delay for effect (minimum 2s) if analysis is too fast
        const startTime = Date.now();

        for (const file of state.files) {
            const data = await parseExcelFile(file);
            const stats = processClassData(data); // Uses new percentile logic
            allTestResults.push({
                fileName: file.name,
                data: data,
                stats: stats
            });
        }

        allTestResults.sort((a, b) => a.fileName.localeCompare(b.fileName, undefined, { numeric: true, sensitivity: 'base' }));

        const studentHistory = matchStudent(state.studentId, allTestResults);

        if (studentHistory.length === 0) {
            alert('Student ID not found in any uploaded files!');
            loadingScreen.classList.add('hidden');
            return;
        }

        // Ensure loader shows for at least 2.5 seconds total for the 'cool factor'
        const elapsed = Date.now() - startTime;
        if (elapsed < 2500) {
            await new Promise(r => setTimeout(r, 2500 - elapsed));
        }

        renderDashboard(studentHistory);
        loadingScreen.classList.add('hidden');

    } catch (err) {
        console.error(err);
        alert('Error processing files: ' + err.message);
        loadingScreen.classList.add('hidden');
    }
}

// --- Parsing Logic ---

async function parseExcelFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const rawRows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

                let headerRowIndex = -1;
                let columnMap = {};

                for (let i = 0; i < Math.min(rawRows.length, 25); i++) {
                    const row = rawRows[i];
                    if (!row || row.length === 0) continue;
                    const rowStr = row.map(c => String(c).toLowerCase().replace(/[^a-z0-9]/g, ''));
                    const hasID = rowStr.some(c => ['studentid', 'id', 'regno', 'rollno'].some(k => c.includes(k)));
                    const hasCorrect = rowStr.some(c => ['correct', 'right'].some(k => c.includes(k)));

                    if (hasID || hasCorrect) {
                        headerRowIndex = i;
                        rowStr.forEach((cell, idx) => {
                            if (['studentid', 'id', 'regno', 'rollno', 'admissionno'].some(k => cell.includes(k)) && !cell.includes('email') && !cell.includes('name')) columnMap.id = idx;
                            else if (['studentname', 'name', 'candidate'].some(k => cell.includes(k)) && !cell.includes('id')) columnMap.name = idx;
                            else if (['correct', 'right'].some(k => cell.includes(k)) && !cell.includes('incorrect')) columnMap.correct = idx;
                            else if (['wrong', 'incorrect', 'negative'].some(k => cell.includes(k))) columnMap.wrong = idx;
                            else if (['totalmarks', 'score'].some(k => cell.includes(k))) columnMap.score = idx;
                        });
                        break;
                    }
                }

                if (headerRowIndex === -1) {
                    headerRowIndex = 0;
                    columnMap = { id: 0, series: 1, name: 2, correct: 3, wrong: 4, score: 5 };
                }

                const cleanedData = [];
                for (let i = headerRowIndex + 1; i < rawRows.length; i++) {
                    const row = rawRows[i];
                    if (!row || row.length === 0) continue;
                    const newRow = {};

                    if (columnMap.id !== undefined) newRow.id = String(row[columnMap.id] || '').trim();
                    else continue;

                    if (!newRow.id) continue;
                    if (columnMap.name !== undefined) newRow.name = row[columnMap.name];

                    const correctVal = columnMap.correct !== undefined ? row[columnMap.correct] : 0;
                    const wrongVal = columnMap.wrong !== undefined ? row[columnMap.wrong] : 0;

                    newRow.correct = Number(correctVal) || 0;
                    newRow.wrong = Number(wrongVal) || 0;
                    newRow.score = (newRow.correct * 4) - (newRow.wrong * 1);

                    cleanedData.push(newRow);
                }
                resolve(cleanedData);

            } catch (err) { reject(err); }
        };
        reader.readAsArrayBuffer(file);
    });
}

function processClassData(students) {
    const sorted = [...students].sort((a, b) => b.score - a.score);
    const totalStudents = sorted.length;

    let currentRank = 1;
    let countOfGreater = 0;

    const processed = sorted.map((student, index) => {
        if (index > 0) {
            if (student.score < sorted[index - 1].score) {
                currentRank = index + 1;
                countOfGreater = index;
            }
        } else {
            currentRank = 1;
            countOfGreater = 0;
        }

        // Updated Percentile Logic
        const studentsWithLessOrEqual = totalStudents - countOfGreater;
        // Standard Class Percentile
        const classPercentile = (studentsWithLessOrEqual / totalStudents) * 100;

        // PREDICTED JEE PERCENTILE (Using our ported utility)
        const predictedPercentile = calculatePredictedPercentile(student.score, '2025');

        return {
            ...student,
            rank: currentRank,
            percentile: Number(classPercentile.toFixed(2)),
            predictedPercentile: predictedPercentile // Add this new field
        };
    });

    const scores = sorted.map(s => s.score);
    const avgScore = scores.reduce((a, b) => a + b, 0) / totalStudents;
    const maxScore = Math.max(...scores);

    return {
        students: processed,
        avgScore: avgScore,
        maxScore: maxScore,
        totalStudents: totalStudents
    };
}

function matchStudent(id, allResults) {
    return allResults.map(res => {
        const student = res.stats.students.find(s => s.id === id);
        if (!student) return null;
        return {
            testName: res.fileName.replace('.xlsx', ''),
            ...student,
            classAvg: res.stats.avgScore,
            topperScore: res.stats.maxScore
        };
    }).filter(Boolean);
}

// --- Rendering ---

function renderDashboard(history) {
    document.getElementById('landing-section').classList.add('hidden');
    document.getElementById('dashboard-section').classList.remove('hidden');

    const current = history[history.length - 1];
    const prev = history.length > 1 ? history[history.length - 2] : null;

    document.getElementById('studentNameDisplay').innerHTML = `Hello, <span class="text-gradient">${current.name || state.studentId}</span>`;
    document.getElementById('analysisMeta').textContent = `ID: ${state.studentId} • ${current.testName}`;

    document.getElementById('statScore').innerText = current.score;
    document.getElementById('statAttempted').innerText = `/${current.correct + current.wrong} Attempted`;

    document.getElementById('statRank').innerText = `#${current.rank}`;
    document.getElementById('statTop').innerText = `Top ${current.percentile > 90 ? '10' : '50'}%`;

    // SHOW PREDICTED PERCENTILE INSTEAD OF GENERIC CLASS PERCENTILE IN THE MAIN CARD?
    // User requested "percentile by analysis of this data", implying the predicted one is important.
    // Let's assume the Percentile Card should show the PREDICTED one as it is "Standard".
    // Or maybe show both? Layout only has one big card.
    // Let's show Predicted as the main number, and "Class Percentile" as subtext.

    document.getElementById('statPercentile').innerText = `${current.predictedPercentile}%`;
    // was `${current.percentile}%`

    // Update subtext to be clear
    // It was "Vs Classmates". Now it is "JEE Predicted"
    const percentileSubLabel = document.querySelector('.card-purple .stat-sub');
    if (percentileSubLabel) percentileSubLabel.innerText = "JEE 2025 Predicted";


    const trendContainer = document.getElementById('trendIndicator');
    if (prev) {
        const diff = current.score - prev.score;
        const isHyped = diff >= 0;
        trendContainer.innerHTML = `
            <div style="font-size:2rem; font-weight:bold; color: ${isHyped ? '#00ff9d' : '#ff0055'}; display:flex; align-items:center; justify-content:center; gap:10px;">
                <i class="${isHyped ? 'ri-arrow-up-line' : 'ri-arrow-down-line'}"></i> ${Math.abs(diff)}
            </div>
            <p style="text-align:center; color:#888; margin-top:5px;">Marks since last test</p>
        `;
    } else {
        trendContainer.innerHTML = `
            <div style="text-align:center; color:#888;">
                <i class="ri-line-chart-line" style="font-size:2rem; opacity:0.5;"></i>
                <p>Upload another test<br>to see improvement</p>
            </div>
        `;
    }

    renderCharts(history);
}

let trendChartInstance = null;
let comparisonChartInstance = null;

function renderCharts(history) {
    const current = history[history.length - 1];
    const ctxTrend = document.getElementById('trendChart').getContext('2d');
    if (trendChartInstance) trendChartInstance.destroy();

    trendChartInstance = new Chart(ctxTrend, {
        type: 'line',
        data: {
            labels: history.map(h => h.testName),
            datasets: [{
                label: 'Score',
                data: history.map(h => h.score),
                borderColor: '#00f3ff',
                backgroundColor: 'rgba(0, 243, 255, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#050511',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#ffffff33',
                    borderWidth: 1
                }
            },
            scales: {
                y: { grid: { color: '#ffffff10' }, ticks: { color: '#ffffff80' } },
                x: { grid: { display: false }, ticks: { color: '#ffffff80' } }
            }
        }
    });

    const ctxComp = document.getElementById('comparisonChart').getContext('2d');
    if (comparisonChartInstance) comparisonChartInstance.destroy();

    comparisonChartInstance = new Chart(ctxComp, {
        type: 'bar',
        data: {
            labels: ['You', 'Class Avg', 'Topper'],
            datasets: [{
                data: [current.score, current.classAvg, current.topperScore],
                backgroundColor: ['#00f3ff', '#bc13fe', '#00ff9d'],
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: { legend: { display: false } },
            scales: {
                x: { display: false },
                y: { ticks: { color: '#ffffff' }, grid: { display: false } }
            }
        }
    });
}

window.resetApp = () => {
    document.getElementById('landing-section').classList.remove('hidden');
    document.getElementById('dashboard-section').classList.add('hidden');
    document.getElementById('studentIdInput').value = state.studentId;
    analyzeBtn.disabled = false;
    // Reset loader text if needed, but we handle that in startAnalysis by adding 'hidden'
};
