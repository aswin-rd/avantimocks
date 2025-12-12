import * as XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Defined Schema
const headers = [
    'STUDENT ID',
    'Serial No.',
    'Student Name',
    'Correct Question',
    'Wrong Question',
    'Total Marks' // We will leave this empty or partial to test the calculator
];

const data = [
    { 'STUDENT ID': 'STU001', 'Serial No.': 1, 'Student Name': 'Alice Johnson', 'Correct Question': 50, 'Wrong Question': 10, 'Total Marks': 190 },
    { 'STUDENT ID': 'STU002', 'Serial No.': 2, 'Student Name': 'Bob Smith', 'Correct Question': 40, 'Wrong Question': 20, 'Total Marks': 140 }, // 40*4 - 20 = 140
    { 'STUDENT ID': 'STU003', 'Serial No.': 3, 'Student Name': 'Charlie Brown', 'Correct Question': 60, 'Wrong Question': 5, 'Total Marks': 235 },
    { 'STUDENT ID': 'STU004', 'Serial No.': 4, 'Student Name': 'David Lee', 'Correct Question': 25, 'Wrong Question': 15, 'Total Marks': 85 },
    { 'STUDENT ID': 'STU005', 'Serial No.': 5, 'Student Name': 'Eve Davis', 'Correct Question': 70, 'Wrong Question': 0, 'Total Marks': 280 },
    { 'STUDENT ID': 'STU006', 'Serial No.': 6, 'Student Name': 'Frank White', 'Correct Question': 10, 'Wrong Question': 40, 'Total Marks': 0 }
];

// Create Sheet
const ws = XLSX.utils.json_to_sheet(data, { header: headers });
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Result Sheet");

// Write to vanilla-app folder
const outputPath = path.join(__dirname, 'vanilla-app', 'Sample_Mock_Test.xlsx');
XLSX.writeFile(wb, outputPath);

console.log(`Sample file created at: ${outputPath}`);
