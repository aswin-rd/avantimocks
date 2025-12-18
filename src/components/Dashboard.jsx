import React, { useMemo } from 'react';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Trophy, Target, Award, ArrowUp, ArrowDown, Activity, LineChart as ChartIcon, BarChart2, Home } from 'lucide-react';
import Leaderboard from './Leaderboard';
import CollegePredictor from './CollegePredictor';

const Dashboard = ({ studentHistory, studentId, allTests, onBack }) => {
    const currentTest = studentHistory[studentHistory.length - 1];
    const previousTest = studentHistory.length > 1 ? studentHistory[studentHistory.length - 2] : null;

    // Trend Data
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
                    <div>
                        <h2 className="text-2xl font-bold text-white">Hello, <span className="text-gradient">{currentTest.name || studentId}</span></h2>
                        <p id="analysisMeta">ID: {studentId} • Analysis Result for {currentTest.testName}</p>
                    </div>
                    <button className="btn-ghost flex items-center gap-2" onClick={onBack}>
                        <Home size={16} /> Home
                    </button>
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
                        <h3>{currentTest.predictedPercentile || '--'}</h3>
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

