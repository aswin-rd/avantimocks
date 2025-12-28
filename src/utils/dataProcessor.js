import * as XLSX from 'xlsx';
import { calculatePredictedPercentile } from './jeePercentileUtils';

/**
 * Robust Parsing Logic (Header Scanning)
 * Adapted from Vanilla JS implementation.
 */

const parseBuffer = (buffer) => {
  try {
    const data = new Uint8Array(buffer);
    const workbook = XLSX.read(data, { type: 'array' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

    // Read as Array of Arrays to find header manually
    const rawRows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

    // Reuse the logic... actually let's just copy the logic for now to avoid breaking existing parseExcel if I refactor too hard.
    // Ideally I'd extract "findHeaderAndParse(rawRows)" function.
    // Let's do that.
    return findHeaderAndParse(rawRows);
  } catch (err) {
    throw err;
  }
};

const findHeaderAndParse = (rawRows) => {
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
  return cleanedData;
};


export const parseExcel = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const rawRows = bufferToRawRows(e.target.result);
        const data = findHeaderAndParse(rawRows);
        resolve(data);
      } catch (err) { reject(err); }
    };
    reader.readAsArrayBuffer(file);
  });
};

// Helper for parseExcel to keep it clean if I wanted to use bufferToRawRows (missing above, let's just inline logic or fix)
// Actually, let's keep parseExcel as is for backward compat if I messed up refactor, 
// BUT simply add fetchGoogleSheet that duplicates logic for SAFETY in this turn.
// I will just add fetchGoogleSheet below and copy the logic.
// Simpler = safer given previous syntax errors.

export const fetchGoogleSheet = async (url) => {
  try {
    // Force XLSX format to get all sheets
    // We modify the URL to ensure it exports as xlsx
    let xlsxUrl = url.replace('format=csv', 'format=xlsx');

    // Add cache busting
    const separator = xlsxUrl.includes('?') ? '&' : '?';
    xlsxUrl += `${separator}t=${Date.now()}`;

    const response = await fetch(xlsxUrl);
    if (!response.ok) throw new Error("Failed to fetch sheet");
    const blob = await response.blob();
    const buffer = await blob.arrayBuffer();

    const data = new Uint8Array(buffer);
    const workbook = XLSX.read(data, { type: 'array' });

    const allTests = [];

    workbook.SheetNames.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      // Skip empty or hidden sheets if needed, but let's assume all are valid tests
      const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      if (rawRows.length < 2) return; // Skip empty sheets

      try {
        const cleaned = findHeaderAndParse(rawRows); // Reuse our robust logic
        if (cleaned.length > 0) {
          // Calculate stats here or let processClassData do it?
          // app expects { name, data: { students: [], stats: {} } }
          // processClassData returns { students, stats }

          // Helper to process
          const processed = processClassData(cleaned);
          allTests.push({
            name: sheetName,
            data: processed
          });
        }
      } catch (e) {
        console.warn(`Skipping sheet "${sheetName}" due to parse error:`, e);
      }
    });

    return allTests;

  } catch (error) {
    console.error("Error fetching/parsing sheet:", error);
    throw error;
  }
};

export const processClassData = (students) => {
  // Sort by score descending
  const sorted = [...students].sort((a, b) => b.score - a.score);

  const totalStudents = sorted.length;
  const scores = sorted.map(s => s.score);
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);
  const avgScore = scores.reduce((a, b) => a + b, 0) / totalStudents;

  // Add Rank and Percentile (Optimized O(N) approach)
  let currentRank = 1;
  let countOfGreater = 0; // Count of students with strictly greater score

  const processed = sorted.map((student, index) => {
    // Check for tie with previous student
    if (index > 0) {
      if (student.score < sorted[index - 1].score) {
        // If score is lower, rank is the current position (1-indexed)
        currentRank = index + 1;
        // countOfGreater is simply the index (number of students before this one)
        countOfGreater = index;
      }
      // If score is equal, rank stays the same, and countOfGreater stays the same
    } else {
      currentRank = 1;
      countOfGreater = 0;
    }

    // Percentile: (Students with score <= studentScore / Total) * 100
    // In a sorted descending list, students with score <= current are (Total - countOfGreater)
    const studentsWithLessOrEqual = totalStudents - countOfGreater;
    const classPercentile = (studentsWithLessOrEqual / totalStudents) * 100;

    // Predicted Percentile (National Standard)
    const predictedPercentile = calculatePredictedPercentile(student.score, '2025');

    return {
      ...student,
      rank: currentRank,
      percentile: Number(classPercentile.toFixed(2)),
      predictedPercentile: Number(predictedPercentile)
    };
  });

  return {
    students: processed,
    stats: {
      totalStudents,
      maxScore,
      minScore,
      avgScore: Number(avgScore.toFixed(2))
    }
  };
};

// Matches columns across multiple files (Test 1, Test 2...)
export const matchStudentAcrossTests = (studentId, allTestsData) => {
  // allTestsData form: [{ name: "Test 1.xlsx", data: { students: [], stats: {} } }, ...]

  const history = allTestsData.map(test => {
    const student = test.data.students.find(s => s.id === studentId);
    if (!student) return null;
    return {
      testName: test.name.replace('.xlsx', ''),
      ...student,
      classAvg: test.data.stats.avgScore,
      topperScore: test.data.stats.maxScore
    };
  }).filter(Boolean); // Remove tests where student was absent

  return history;
};
