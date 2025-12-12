import React, { useState } from 'react';
import {
    Grid, Box, Typography, Paper, Button, keyframes, Chip,
    TextField, IconButton, ToggleButton, ToggleButtonGroup,
    Dialog, DialogTitle, DialogContent, Fab
} from '@mui/material';
import {
    Library, FileText, CheckCircle, HelpCircle,
    ArrowLeft, Search, Brain, Eye, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AITutor from './AITutor';

// --- MOCK DATA FOR ARCHIVE ---
// In a real app, this would be fetched from an API or config file
const ARCHIVE_DATA = [
    {
        id: 'm1',
        title: 'Mock Test 01',
        date: '2024-02-10',
        subjects: ['Physics', 'Chemistry', 'Maths'],
        pdfUrl: null, // Placeholder: Add your PDF link here
        answerKey: { 1: 'A', 2: 'C', 3: 'B', 4: 'D', 5: 'A' } // Sample Key
    },
    {
        id: 'm2',
        title: 'Mock Test 02',
        date: '2024-02-24',
        subjects: ['Physics', 'Chemistry', 'Maths'],
        pdfUrl: 'https://drive.google.com/file/d/1kmSUwWgwA73vTwoIyXdbj8bJkRXCMPAJ/preview',
        answerKey: {}
    },
    {
        id: 'm3',
        title: 'Mega Mock: Full Syllabus',
        date: '2024-03-05',
        subjects: ['Full Portfolio'],
        pdfUrl: null,
        answerKey: {}
    }
];

const Archive = ({ onBack }) => {
    const [selectedMock, setSelectedMock] = useState(null);
    const [mode, setMode] = useState('view'); // 'view' or 'practice'
    const [answers, setAnswers] = useState({});
    const [showScore, setShowScore] = useState(false);
    const [tutorOpen, setTutorOpen] = useState(false);

    // --- SUB_COMPONENTS ---

    // 1. OMR Sheet Component
    const OMRSheet = ({ mock }) => {
        const questions = Object.keys(mock.answerKey).length || 20; // Default to 20 if no key

        return (
            <Paper sx={{ p: 2, height: '100%', overflowY: 'auto', bgcolor: 'rgba(0,0,0,0.4)', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" color="primary">Answer Grid</Typography>
                    {showScore && <Chip label="Graded" color="success" size="small" />}
                </Box>

                <Grid container spacing={1}>
                    {Array.from({ length: questions }).map((_, i) => {
                        const qNum = i + 1;
                        const correct = mock.answerKey[qNum];
                        const userAns = answers[qNum];

                        let statusColor = 'default';
                        if (showScore) {
                            if (userAns === correct) statusColor = 'success';
                            else if (userAns) statusColor = 'error';
                        }

                        return (
                            <Grid item xs={12} key={qNum} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Typography variant="caption" sx={{ width: 20, color: 'text.secondary' }}>{qNum}.</Typography>
                                <ToggleButtonGroup
                                    size="small"
                                    value={answers[qNum]}
                                    exclusive
                                    onChange={(e, val) => !showScore && setAnswers({ ...answers, [qNum]: val })}
                                    sx={{ height: 24 }}
                                >
                                    {['A', 'B', 'C', 'D'].map((opt) => (
                                        <ToggleButton
                                            key={opt}
                                            value={opt}
                                            sx={{
                                                width: 30,
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                color: showScore && correct === opt ? '#4ade80 !important' : 'text.secondary',
                                                bgcolor: showScore && correct === opt ? 'rgba(74, 222, 128, 0.1) !important' : 'transparent',
                                                '&.Mui-selected': {
                                                    color: 'white',
                                                    bgcolor: showScore
                                                        ? (correct === opt ? 'success.main' : 'error.main')
                                                        : 'primary.main'
                                                }
                                            }}
                                        >
                                            {opt}
                                        </ToggleButton>
                                    ))}
                                </ToggleButtonGroup>
                            </Grid>
                        );
                    })}
                </Grid>

                <Button
                    variant="contained"
                    fullWidth
                    sx={{ mt: 3, background: 'linear-gradient(45deg, #06b6d4, #3b82f6)' }}
                    onClick={() => setShowScore(true)}
                    disabled={showScore}
                >
                    {showScore ? "Submitted" : "Submit Test"}
                </Button>
            </Paper>
        );
    };

    // 2. Mock Gallery Grid
    if (!selectedMock) {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>

                    {/* Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                        <Button onClick={onBack} startIcon={<ArrowLeft />} sx={{ color: 'text.secondary' }}>
                            Back
                        </Button>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                            <span className="text-gradient">Question Archive</span>
                        </Typography>
                    </Box>

                    {/* Search Bar */}
                    <Paper sx={{ mb: 4, p: '2px 4px', display: 'flex', alignItems: 'center', maxWidth: 400, bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <IconButton sx={{ p: '10px', color: 'text.secondary' }}><Search size={20} /></IconButton>
                        <TextField
                            fullWidth
                            placeholder="Search papers..."
                            variant="standard"
                            InputProps={{ disableUnderline: true, sx: { color: 'white' } }}
                        />
                    </Paper>

                    {/* Grid */}
                    <Grid container spacing={3}>
                        {ARCHIVE_DATA.map((mock, idx) => (
                            <Grid item xs={12} sm={6} md={4} key={mock.id}>
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <Paper
                                        sx={{
                                            p: 3,
                                            bgcolor: 'rgba(20, 20, 35, 0.6)',
                                            backdropFilter: 'blur(10px)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: 4,
                                            cursor: 'pointer',
                                            transition: 'all 0.3s',
                                            '&:hover': { transform: 'translateY(-5px)', borderColor: 'primary.main', boxShadow: '0 0 20px rgba(6,182,212,0.2)' }
                                        }}
                                        onClick={() => {
                                            setSelectedMock(mock);
                                            setAnswers({});
                                            setShowScore(false);
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                            <Chip label={mock.date} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: 'text.secondary' }} />
                                            <FileText size={20} className="text-cyan-400" />
                                        </Box>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>{mock.title}</Typography>
                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                            {mock.subjects.map(sub => (
                                                <Typography key={sub} variant="caption" sx={{ color: 'text.secondary' }}>• {sub}</Typography>
                                            ))}
                                        </Box>
                                    </Paper>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </motion.div>
        );
    }



    // 3. Exam View Mode
    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#050511' }}>
            {/* Toolbar */}
            <Paper square sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'rgba(0,0,0,0.5)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button onClick={() => setSelectedMock(null)} startIcon={<ArrowLeft />} color="inherit">Exit</Button>
                    <Typography variant="subtitle1" fontWeight="bold">{selectedMock.title}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <ToggleButtonGroup
                        value={mode}
                        exclusive
                        onChange={(e, val) => val && setMode(val)}
                        size="small"
                        sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}
                    >
                        <ToggleButton value="view"><Eye size={16} style={{ marginRight: 8 }} /> View</ToggleButton>
                        <ToggleButton value="practice"><CheckCircle size={16} style={{ marginRight: 8 }} /> Practice</ToggleButton>
                    </ToggleButtonGroup>
                    <Button
                        variant="outlined"
                        startIcon={<Sparkles size={18} />}
                        sx={{ borderColor: '#8b5cf6', color: '#a78bfa', '&:hover': { bgcolor: 'rgba(139, 92, 246, 0.1)' } }}
                        onClick={() => setTutorOpen(true)}
                    >
                        AI Tutor
                    </Button>
                </Box>
            </Paper>

            {/* Split Content */}
            <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* PDF Viewer (Left) */}
                <Box sx={{ flex: 1, bgcolor: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                    {selectedMock.pdfUrl ? (
                        <iframe src={selectedMock.pdfUrl} width="100%" height="100%" style={{ border: 0 }} />
                    ) : (
                        <Box sx={{ textAlign: 'center', color: 'text.secondary', p: 4 }}>
                            <FileText size={64} style={{ opacity: 0.2, marginBottom: 16 }} />
                            <Typography variant="h6">No PDF Linked</Typography>
                            <Typography variant="body2">To add a paper, place the PDF in <code>public/papers/</code> and update <code>Archive.jsx</code>.</Typography>
                        </Box>
                    )}
                </Box>

                {/* Right Panel (OMR or Tools) */}
                {mode === 'practice' && (
                    <Box sx={{ width: 350, borderLeft: '1px solid rgba(255,255,255,0.1)', bgcolor: '#0a0a0f', p: 2 }}>
                        <OMRSheet mock={selectedMock} />
                    </Box>
                )}
            </Box>

            {/* AI Tutor Drawer */}
            <AITutor
                isOpen={tutorOpen}
                onClose={() => setTutorOpen(false)}
                contextText={`Current Paper: ${selectedMock.title}. Subjects: ${selectedMock.subjects.join(', ')}`}
            />
        </Box>
    );
};

export default Archive;
