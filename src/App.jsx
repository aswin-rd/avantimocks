import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Landing from './components/Landing';
import Dashboard from './components/Dashboard';
import Archive from './components/Archive';
import { Analytics } from "@vercel/analytics/react"
import { matchStudentAcrossTests, fetchGoogleSheet } from './utils/dataProcessor';
import LoadingScreen from './components/LoadingScreen';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [studentHistory, setStudentHistory] = useState(null);
  const [studentId, setStudentId] = useState('');
  const [allTests, setAllTests] = useState([]);

  // Hardcoded Sheet URL
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
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAnalyze = async (files, id) => {
    if (allTests.length === 0) {
      alert("Data is still loading or failed to load. Please wait a moment or refresh.");
      return;
    }

    setLoading(true);
    // Artificial minimum delay to show off the fancy new loading screen
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const history = matchStudentAcrossTests(id, allTests);

      if (history.length === 0) {
        alert('Student ID not found in the Class Sheet.');
        setLoading(false);
        return;
      }

      setStudentHistory(history);
      setStudentId(id);

      setLoading(false); // <--- FIXED: Ensure loading is turned off
      navigate('/dashboard');

    } catch (error) {
      console.error(error);
      alert('Error processing data.');
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStudentHistory(null);
    setStudentId('');
    setLoading(false);
    navigate('/');
  };

  return (
    <div>
      {/* Global Loading Overlay */}
      {loading && <LoadingScreen />}
      <Analytics />

      <Routes>
        <Route path="/" element={
          <Landing
            onAnalyze={handleAnalyze}
            loading={loading}
            allTests={allTests}
            onOpenArchive={() => navigate('/archive')}
          />
        } />

        <Route path="/dashboard" element={
          studentHistory ? (
            <Dashboard
              studentHistory={studentHistory}
              studentId={studentId}
              allTests={allTests}
              onBack={handleBack}
            />
          ) : (
            // Redirect to home if no history (e.g. direct access)
            <Landing
              onAnalyze={handleAnalyze}
              loading={loading}
              allTests={allTests}
              onOpenArchive={() => navigate('/archive')}
            />
          )
        } />

        <Route path="/archive" element={
          <Archive onBack={handleBack} />
        } />
      </Routes>
    </div>
  );
}

export default App;
