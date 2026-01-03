import https from 'https';
import fs from 'fs';

const data = JSON.stringify({
    url: "https://reports.avantifellows.org/reports/student_quiz_report/EnableStudents_692b4154e168fe8c247f533f/2631206382"
});

const options = {
    hostname: 'mockserver-ujt5.onrender.com',
    path: '/scrape',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = https.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let body = '';

    res.on('data', (chunk) => {
        body += chunk;
    });

    res.on('end', () => {
        console.log('BODY received based on length: ' + body.length);
        try {
            const parsed = JSON.parse(body);
            fs.writeFileSync('fetch_output.json', JSON.stringify(parsed, null, 2));
            console.log('Written to fetch_output.json');
        } catch (e) {
            console.log('Error parsing JSON');
            console.log(body);
        }
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
