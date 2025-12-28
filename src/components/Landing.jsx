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
            {/* Responsive layout: leaderboard on left, all other content on right */}
            <div className="desktop-flex">
                {/* Leaderboard column */}
                {allTests && allTests.length > 0 && (
                    <div className="leaderboard-wrapper">
                        <div className="leaderboard-wrapper">
                            <Leaderboard
                                allTests={allTests}
                                currentStudentId={null}
                                onStudentClick={(studentId) => onAnalyze([], studentId)}
                            />
                        </div>
                    </div>
                )}

                {/* Right panel: header + upload card */}
                <div className="right-panel">
                    <header>
                        <div className="badge">
                            <Activity size={16} /> Advanced Analytics
                        </div>
                        {/* Hidden/Subtle Archive Link */}

                        <h1>Mock <span className="text-gradient">Analysis</span> Portal</h1>
                        <p>Enter your Student ID to fetch results from the Live Class Sheet.</p>
                    </header>

                    {/* Upload / analysis card */}
                    <div className="glass-card upload-card" style={{ padding: '2rem' }}>
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
                </div>
            </div>
        </div>
    );
};


export default Landing;
