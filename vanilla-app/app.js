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

// --- Analysis Logic (The Robust Logic) ---

async function startAnalysis() {
    analyzeBtn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Analyzing...';
    analyzeBtn.disabled = true;

    try {
        const allTestResults = [];

        for (const file of state.files) {
            const data = await parseExcelFile(file);
            const stats = processClassData(data);
            allTestResults.push({
                fileName: file.name,
                data: data,
                stats: stats
            });
        }

        // Sort tests by filename (simple alphanumeric sort)
        allTestResults.sort((a, b) => a.fileName.localeCompare(b.fileName, undefined, { numeric: true, sensitivity: 'base' }));

        // Find Student
        const studentHistory = matchStudent(state.studentId, allTestResults);

        if (studentHistory.length === 0) {
            alert('Student ID not found in any uploaded files!');
            analyzeBtn.innerHTML = 'Analyze Now <i class="ri-arrow-right-line"></i>';
            analyzeBtn.disabled = false;
            return;
        }

        // Render Dashboard
        renderDashboard(studentHistory);

    } catch (err) {
        console.error(err);
        alert('Error processing files: ' + err.message);
        analyzeBtn.innerHTML = 'Analyze Now <i class="ri-arrow-right-line"></i>';
        analyzeBtn.disabled = false;
    }
}

// --- Parsing Logic (Header Scanning) ---

async function parseExcelFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

                // Read as Array of Arrays to find header manually
                const rawRows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

                // 1. Scan for Header Row
                let headerRowIndex = -1;
                let columnMap = {};

                for (let i = 0; i < Math.min(rawRows.length, 25); i++) {
                    const row = rawRows[i];
                    if (!row || row.length === 0) continue;

                    const rowStr = row.map(c => String(c).toLowerCase().replace(/[^a-z0-9]/g, ''));

                    // Fuzzy match keywords
                    const hasID = rowStr.some(c => ['studentid', 'id', 'regno', 'rollno'].some(k => c.includes(k)));
                    const hasCorrect = rowStr.some(c => ['correct', 'right'].some(k => c.includes(k)));

                    if (hasID || hasCorrect) {
                        headerRowIndex = i;
                        // Build Map
                        rowStr.forEach((cell, idx) => {
                            if (['studentid', 'id', 'regno', 'rollno', 'admissionno'].some(k => cell.includes(k)) && !cell.includes('email') && !cell.includes('name')) columnMap.id = idx;
                            else if (['studentname', 'name', 'candidate'].some(k => cell.includes(k)) && !cell.includes('id')) columnMap.name = idx;
                            else if (['correct', 'right'].some(k => cell.includes(k)) && !cell.includes('incorrect')) columnMap.correct = idx;
                            else if (['wrong', 'incorrect', 'negative'].some(k => cell.includes(k))) columnMap.wrong = idx;
                            else if (['totalmarks', 'score'].some(k => cell.includes(k))) columnMap.score = idx;
                        });
                        break; // Found header
                    }
                }

                if (headerRowIndex === -1) {
                    console.warn('No clear header row found. Assuming Row 1 (Index 0) is header or data starts immediately.');
                    headerRowIndex = 0;
                    columnMap = { id: 0, series: 1, name: 2, correct: 3, wrong: 4, score: 5 }; // Fallback
                }

                // 2. Extract Data
                const cleanedData = [];
                for (let i = headerRowIndex + 1; i < rawRows.length; i++) {
                    const row = rawRows[i];
                    if (!row || row.length === 0) continue;

                    const newRow = {};

                    if (columnMap.id !== undefined) newRow.id = String(row[columnMap.id] || '').trim();
                    else continue; // No ID, skip

                    if (!newRow.id) continue;

                    if (columnMap.name !== undefined) newRow.name = row[columnMap.name];

                    const correctVal = columnMap.correct !== undefined ? row[columnMap.correct] : 0;
                    const wrongVal = columnMap.wrong !== undefined ? row[columnMap.wrong] : 0;

                    newRow.correct = Number(correctVal) || 0;
                    newRow.wrong = Number(wrongVal) || 0;

                    // FORCED CALCULATION
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

    // Add Rank
    let currentRank = 1;
    const processed = sorted.map((student, index) => {
        if (index > 0) {
            if (student.score < sorted[index - 1].score) currentRank = index + 1;
        } else {
            currentRank = 1;
        }

        const studentsWithLessOrEqual = sorted.filter(s => s.score <= student.score).length;
        const percentile = (studentsWithLessOrEqual / totalStudents) * 100;

        return {
            ...student,
            rank: currentRank,
            percentile: Number(percentile.toFixed(2))
        };
    });

    // Calculate Stats
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

    // Text
    document.getElementById('studentNameDisplay').innerHTML = `Hello, <span class="text-gradient">${current.name || state.studentId}</span>`;
    document.getElementById('analysisMeta').textContent = `ID: ${state.studentId} • ${current.testName}`;

    // Stats
    document.getElementById('statScore').innerText = current.score;
    document.getElementById('statAttempted').innerText = `/${current.correct + current.wrong} Attempted`;

    document.getElementById('statRank').innerText = `#${current.rank}`;
    document.getElementById('statTop').innerText = `Top ${current.percentile > 90 ? '10' : '50'}%`;

    document.getElementById('statPercentile').innerText = `${current.percentile}%`;

    // Trend Indicator
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

    // Charts
    renderCharts(history);
}

let trendChartInstance = null;
let comparisonChartInstance = null;

function renderCharts(history) {
    const current = history[history.length - 1];

    // 1. Trend Chart
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

    // 2. Comparison Chart
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
    document.getElementById('studentIdInput').value = state.studentId; // Keep ID for convenience
    analyzeBtn.disabled = false;
    analyzeBtn.innerHTML = 'Analyze Now <i class="ri-arrow-right-line"></i>';
};
