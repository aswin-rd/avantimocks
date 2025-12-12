import React, { useState } from 'react';
import FileUpload from './FileUpload';
import Leaderboard from './Leaderboard';
import { Upload, Search, ArrowRight, Activity, Library } from 'lucide-react'; // Removed Pulse, changed UploadCloud to Upload

const Landing = ({ onAnalyze, loading, allTests, onOpenArchive }) => {
    const [id, setId] = useState('');

    const handleAnalyzeClick = () => {
        if (!id) return;
        onAnalyze([], id); // Pass empty files array, App will handle fetch
    };

    return (
        <div className="container fade-in">
            <header>
                <div className="badge" style={{ cursor: 'pointer' }} onClick={onOpenArchive}>
                    <Activity size={16} /> Advanced Analytics
                </div>
                {/* Hidden/Subtle Archive Link */}
                <div
                    onClick={onOpenArchive}
                    className="absolute top-4 right-4 text-xs text-gray-500 hover:text-cyan-400 cursor-pointer flex items-center gap-1 transition-colors z-50 p-2"
                >
                    <Library size={14} /> OLD PAPERS
                </div>
                <h1>Mock <span className="text-gradient">Analysis</span> Portal</h1>
                <p>Enter your Student ID to fetch results from the Live Class Sheet.</p>
            </header>

            <div className="glass-card upload-card" style={{ padding: '2rem', marginBottom: '3rem' }}>

                <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10 flex items-center gap-3">
                    <div className="p-2 bg-green-500/20 rounded-full text-green-400">
                        <Activity size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-white">Live Data Source</h3>
                        <p className="text-xs text-gray-400">Connected to Google Sheets</p>
                    </div>
                </div>

                <div className="input-group">
                    <label>Enter Student ID</label>
                    <div className="search-box">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="e.g., STU001"
                            value={id}
                            onChange={(e) => setId(e.target.value)}
                        />
                        <button
                            className="btn-neon"
                            onClick={handleAnalyzeClick}
                            disabled={!id || loading}
                        >
                            {loading ? 'Fetching...' : <>Analyze Now <ArrowRight size={18} /></>}
                        </button>
                    </div>
                </div>


            </div>

            {/* Global Leaderboard on Landing */}
            {allTests && allTests.length > 0 && (
                <div className="w-full max-w-4xl mx-auto">
                    <Leaderboard allTests={allTests} currentStudentId={null} />
                </div>
            )}
        </div>
    );
};


export default Landing;
