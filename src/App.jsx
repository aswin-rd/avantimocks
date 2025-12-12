import React, { useState, useEffect } from 'react';
import Landing from './components/Landing';
import Dashboard from './components/Dashboard';
import Archive from './components/Archive';
import { parseExcel, processClassData, matchStudentAcrossTests, fetchGoogleSheet } from './utils/dataProcessor';

function App() {
  const [view, setView] = useState('landing'); // 'landing', 'dashboard'
  const [loading, setLoading] = useState(false);
  const [studentHistory, setStudentHistory] = useState(null);
  const [studentId, setStudentId] = useState('');
  const [allTests, setAllTests] = useState([]);

  // Hardcoded Sheet URL (Updated to point to exact sheet ID, we will append export format in utility or here)
  // Actually utility replaces format=csv with format=xlsx, so we just give the base or keep as is provided it has query params.
  const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1Y2wwVeuZno3I3YJQPglFCh0E5JCA7NTWQaO9yo4kiMg/export?format=xlsx';

  // Fetch data ON MOUNT
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      console.log("Prefetching data from Google Sheet...");
      try {
        const sheetTests = await fetchGoogleSheet(SHEET_URL);
        if (sheetTests && sheetTests.length > 0) {
          // Sort tests by name (M1, M2...)
          sheetTests.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
          setAllTests(sheetTests);
        }
      } catch (e) {
        console.error("Failed to prefetch Google Sheet", e);
        // Silent fail on prefetch? Or show error? 
        // We'll let handleAnalyze retry or show error if user tries to analyze with empty data.
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAnalyze = async (files, id) => {
    // We expect data to be pre-fetched, but if it failed or is empty, try once more?
    // For now, let's assume pre-fetch attempted.

    if (allTests.length === 0) {
      alert("Data is still loading or failed to load. Please wait a moment or refresh.");
      return;
    }

    setLoading(true);
    try {
      // Find student history from PRE-LOADED allTests
      const history = matchStudentAcrossTests(id, allTests);

      if (history.length === 0) {
        alert('Student ID not found in the Class Sheet.');
        setLoading(false);
        return;
      }

      setStudentHistory(history);
      setStudentId(id);
      setView('dashboard');

    } catch (error) {
      console.error(error);
      alert('Error processing data.');
      setLoading(false);
    }
  };

  const handleBack = () => {
    setView('landing');
    setStudentHistory(null);
    setStudentId('');
    setAllTests([]);
    setLoading(false); // Ensure loading is reset
  };

  return (
    <div>
      {view === 'landing' && (
        <Landing
          onAnalyze={handleAnalyze}
          loading={loading}
          allTests={allTests}
          onOpenArchive={() => setView('archive')}
        />
      )}
      {view === 'dashboard' && studentHistory && (
        <Dashboard
          studentHistory={studentHistory}
          studentId={studentId}
          allTests={allTests}
          onBack={handleBack}
        />
      )}
      {view === 'archive' && (
        <Archive onBack={handleBack} />
      )}
    </div>
  );
}

export default App;
