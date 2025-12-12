import * as XLSX from 'xlsx';

const students = [
    { id: 'STU001', name: 'Aswin', t1Score: 120, t2Score: 160 }, // Improved
    { id: 'STU002', name: 'John Doe', t1Score: 200, t2Score: 190 }, // Declined
    { id: 'STU003', name: 'Jane Smith', t1Score: 250, t2Score: 260 }, // Topper
    { id: 'STU004', name: 'Bob Brown', t1Score: 80, t2Score: 95 },
    { id: 'STU005', name: 'Alice White', t1Score: 150, t2Score: 145 },
];

const createSheet = (testNum) => {
    return students.map((s, i) => {
        const score = testNum === 1 ? s.t1Score : s.t2Score;
        const correct = Math.floor(score / 4);
        const wrong = 0; // Simplified
        return {
            'STUDENT ID': s.id,
            'Serial No.': i + 1,
            'Student Name': s.name,
            'Correct Question': correct,
            'Wrong Question': wrong,
            'Total Marks': score
        };
    });
};

const wb1 = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb1, XLSX.utils.json_to_sheet(createSheet(1)), 'Sheet1');
XLSX.writeFile(wb1, 'Mock Test 1.xlsx');

const wb2 = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb2, XLSX.utils.json_to_sheet(createSheet(2)), 'Sheet1');
XLSX.writeFile(wb2, 'Mock Test 2.xlsx');

console.log('Created Mock Test 1.xlsx and Mock Test 2.xlsx');
