import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Trophy, Target, Award, ArrowUp, ArrowDown, Activity, LineChart as ChartIcon, BarChart2, Home } from 'lucide-react';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import Leaderboard from './Leaderboard';
import CollegePredictor from './CollegePredictor';

const Dashboard = ({ studentHistory, studentId, allTests, onBack }) => {
    const navigate = useNavigate();
    // State to track which test is currently being viewed
    // Default to the last (latest) test in history
    const [selectedTestIndex, setSelectedTestIndex] = React.useState(studentHistory.length - 1);

    const currentTest = studentHistory[selectedTestIndex];
    // Previous test is the one before the selected one, if it exists
    const previousTest = selectedTestIndex > 0 ? studentHistory[selectedTestIndex - 1] : null;

    // Handle test selection change
    const handleTestChange = (event) => {
        const newIndex = parseInt(event.target.value, 10);
        setSelectedTestIndex(newIndex);
    };

    // Trend Data (Show full history for context)
    const trendData = studentHistory.map(h => ({
        name: h.testName,
        Score: h.score,
        Rank: h.rank
    }));

    // Comparison Data (Me vs Class vs Topper)
    const comparisonData = useMemo(() => [
        { name: 'You', value: currentTest.score, color: '#00f3ff' },
        { name: 'Class Avg', value: currentTest.classAvg, color: '#bc13fe' },
        { name: 'Topper', value: currentTest.topperScore, color: '#00ff9d' },
    ], [currentTest]);


    const scoreDiff = previousTest ? currentTest.score - previousTest.score : 0;
    const isHyped = scoreDiff >= 0;

    return (
        <div className="container fade-in" style={{ alignItems: 'normal' }}> {/* Override center align for dashboard */}

            {/* Navbar */}
            <nav>
                <div className="nav-content">
                    {/* Left side: User Greeting */}
                    <div>
                        <h2 className="text-2xl font-bold text-white">Hello, <span className="text-gradient">{currentTest.name || studentId}</span></h2>
                        <p id="analysisMeta" style={{ margin: 0, opacity: 0.7 }}>ID: {studentId}</p>
                    </div>

                    {/* Right side: Actions */}
                    <div className="flex items-center gap-8"> {/* Horizontal layout with large gap */}

                        {/* Test Switcher Pill (Minimalistic MUI Version) */}
                        <div className="glass-card flex items-center"
                            style={{
                                borderRadius: '50px',
                                padding: '0.7rem 2rem', // Increased internal padding
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                gap: '1.5rem' // More spacing inside between label and dropdown
                            }}>
                            <span className="text-xs uppercase tracking-wider font-semibold" style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.6)', whiteSpace: 'nowrap' }}>Result:</span>
                            <FormControl variant="standard" sx={{ minWidth: 100, margin: 0 }}>
                                <Select
                                    value={selectedTestIndex}
                                    onChange={handleTestChange}
                                    disableUnderline
                                    sx={{
                                        color: 'white',
                                        fontSize: '0.9rem',
                                        fontWeight: '500',
                                        '.MuiSelect-icon': { color: 'rgba(255, 255, 255, 0.7)' },
                                        '& .MuiSelect-select': { paddingRight: '24px !important', paddingBottom: '2px', paddingTop: '2px' }
                                    }}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                bgcolor: '#0f0f13',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                color: 'white',
                                                '& .MuiMenuItem-root': {
                                                    fontSize: '0.9rem',
                                                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' },
                                                    '&.Mui-selected': { bgcolor: 'rgba(255, 255, 255, 0.1)', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.15)' } }
                                                }
                                            }
                                        }
                                    }}
                                >
                                    {studentHistory.map((test, index) => (
                                        <MenuItem key={index} value={index}>
                                            {test.testName}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </div>

                        <button
                            className="btn-neon flex items-center gap-2"
                            onClick={() => navigate('/advanced-analysis', { state: { testData: currentTest, studentId } })}
                            style={{
                                padding: '0.7rem 1.5rem',
                                border: '1px solid rgba(0, 243, 255, 0.4)',
                                boxShadow: '0 0 15px rgba(0, 243, 255, 0.2)'
                            }}
                        >
                            <Activity size={16} /> Deep Analysis
                        </button>

                        <button className="btn-ghost flex items-center gap-2" onClick={onBack} style={{ padding: '0.7rem 1.5rem' }}>
                            <Home size={16} /> Home
                        </button>
                    </div>
                </div>
            </nav>

            {/* Stats Grid */}
            <div className="stats-grid">

                {/* Score */}
                <div className="glass-card stat-card card-cyan">
                    <div className="stat-content">
                        <span className="stat-label">Total Score</span>
                        <h3>{currentTest.score}</h3>
                        <p className="stat-sub">/{currentTest.correct + currentTest.wrong} Attempted</p>
                    </div>
                    <div className="stat-icon"><Target size={24} /></div>
                </div>

                {/* Rank */}
                <div className="glass-card stat-card card-yellow">
                    <div className="stat-content">
                        <span className="stat-label">Class Rank</span>
                        <h3>#{currentTest.rank}</h3>
                        <p className="stat-sub">Top {currentTest.percentile > 90 ? '10' : '50'}%</p>
                    </div>
                    <div className="stat-icon"><Trophy size={24} /></div>
                </div>

                {/* Percentile */}
                <div className="glass-card stat-card card-purple">
                    <div className="stat-content">
                        <span className="stat-label">Predicted %ile</span>
                        <h3>{currentTest.predictedPercentile ? Number(currentTest.predictedPercentile).toFixed(2) : '--'}%</h3>
                        <p className="stat-sub">National Estimate (2025)</p>
                    </div>
                    <div className="stat-icon"><Award size={24} /></div>
                </div>

                
                {/* Trend */}
                <div className="glass-card stat-card">
                    <div className="w-full flex flex-col items-center justify-center">
                        {previousTest ? (
                            <>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: isHyped ? '#00ff9d' : '#ff0055', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    {isHyped ? <ArrowUp size={32} /> : <ArrowDown size={32} />} {Math.abs(scoreDiff)}
                                </div>
                                <p className="text-gray-500 text-sm mt-1">Marks since last test</p>
                            </>
                        ) : (
                            <div className="text-center text-gray-500">
                                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">Upload another file<br />to see improvement</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Charts Grid */}
            <div className="charts-grid" style={{ gridTemplateColumns: '2fr 1fr' }}> {/* Ensure 2:1 ratio */}

                {/* Left Column: Charts */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Performance Trend */}
                    <div className="glass-card chart-card">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <ChartIcon size={20} className="text-cyan-400" /> Performance Trend
                        </h3>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trendData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                    <XAxis dataKey="name" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0a0a1f', border: '1px solid #ffffff20', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="Score"
                                        stroke="#00f3ff"
                                        strokeWidth={3}
                                        dot={{ fill: '#00f3ff', strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 8, fill: '#fff' }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Comparison */}
                    <div className="glass-card chart-card">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <BarChart2 size={20} className="text-purple-400" /> Class Comparison
                        </h3>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={comparisonData} layout="vertical" barSize={32}>
                                    <XAxis type="number" hide />
                                    <YAxis type="category" dataKey="name" stroke="#ffffff80" fontSize={12} width={80} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ backgroundColor: '#0a0a1f', border: '1px solid #ffffff20', borderRadius: '8px' }}
                                    />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                        {comparisonData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Right Column: College Predictor */}
                <div style={{ maxHeight: '800px' }}>
                    <CollegePredictor currentScore={currentTest.score} />
                </div>

            </div>



        </div>
    );
};

export default Dashboard;

