
import * as XLSX from 'xlsx';

async function fetchGoogleSheet(url) {
    try {
        let xlsxUrl = url.replace('format=csv', 'format=xlsx');
        const separator = xlsxUrl.includes('?') ? '&' : '?';
        xlsxUrl += `${separator}t=${Date.now()}`;

        console.log("Fetching:", xlsxUrl);
        const response = await fetch(xlsxUrl);
        if (!response.ok) throw new Error("Failed to fetch sheet");
        const blob = await response.blob();
        const buffer = await blob.arrayBuffer();

        const data = new Uint8Array(buffer);
        const workbook = XLSX.read(data, { type: 'array' });

        workbook.SheetNames.forEach(sheetName => {
            console.log(`\n--- Sheet: ${sheetName} ---`);
            const sheet = workbook.Sheets[sheetName];
            const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            if (rawRows.length > 0) {
                console.log(`Row 0 (Header/Meta):`, JSON.stringify(rawRows[0]));
                // Check finding 'Report' keyword anywhere in Row 0
                rawRows[0].forEach((cell, idx) => {
                    if (String(cell).includes('http')) console.log(`Files Link found at Index ${idx}: ${cell}`);
                });
            }

            if (rawRows.length > 2) {
                console.log(`Row 2 (Student):`, JSON.stringify(rawRows[2]));
            }
        });

    } catch (error) {
        console.error("Error:", error);
    }
}

fetchGoogleSheet('https://docs.google.com/spreadsheets/d/1Y2wwVeuZno3I3YJQPglFCh0E5JCA7NTWQaO9yo4kiMg/export?format=csv');
