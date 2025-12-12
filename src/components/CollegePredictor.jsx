import React from 'react';
import {
    Paper, Typography, Box, LinearProgress, Chip,
    List, ListItem, ListItemText, ListItemIcon, Divider
} from '@mui/material';
import { CheckCircle, AlertCircle, Lock, GraduationCap } from 'lucide-react';
import { NIT_DATA } from '../utils/collegeData';

const CollegePredictor = ({ currentScore }) => {

    // Logic to categorize colleges
    const categorizedColleges = NIT_DATA.map(college => {
        const diff = currentScore - college.score;
        let status = 'dream'; // Default
        let color = 'error'; // Mapping to MUI color (default error=red) - but we override

        if (diff >= 0) {
            status = 'secure';
            color = 'success';
        } else if (diff >= -20) {
            status = 'reachable';
            color = 'warning';
        }

        return { ...college, status, color, diff };
    });

    // Stats
    const secureCount = categorizedColleges.filter(c => c.status === 'secure').length;
    const nextTarget = categorizedColleges.filter(c => c.status !== 'secure').slice(-1)[0]; // Easiest 'Unsecured' college

    return (
        <Paper
            className="glass-card"
            sx={{
                p: 3,
                height: '100%',
                bgcolor: 'rgba(20, 20, 35, 0.6)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 4,
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(0, 243, 255, 0.1)', border: '1px solid rgba(0, 243, 255, 0.3)', color: '#00f3ff' }}>
                    <GraduationCap size={24} />
                </Box>
                <Box>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: '#fff' }}>College Predictor</Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>Top 20 NIT CSE (General)</Typography>
                </Box>
            </Box>

            {/* Score Summary */}
            <Box sx={{ mb: 3, p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Your Score</Typography>
                    <Typography variant="h5" fontWeight="900" sx={{ color: '#00f3ff', textShadow: '0 0 10px rgba(0,243,255,0.3)' }}>{currentScore}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Unlocked</Typography>
                    <Chip
                        label={`${secureCount} / 20`}
                        size="small"
                        sx={{
                            height: 24,
                            bgcolor: secureCount > 0 ? 'rgba(0, 255, 157, 0.1)' : 'rgba(255,255,255,0.05)',
                            color: secureCount > 0 ? '#00ff9d' : '#888',
                            border: '1px solid',
                            borderColor: secureCount > 0 ? 'rgba(0, 255, 157, 0.3)' : 'rgba(255,255,255,0.1)'
                        }}
                    />
                </Box>
            </Box>

            {/* Next Target Progress */}
            {nextTarget && (
                <Box sx={{ mb: 3 }}>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                        Next Target: <span style={{ color: '#fff' }}>{nextTarget.name}</span> ({Math.abs(nextTarget.diff)} marks away)
                    </Typography>
                    <LinearProgress
                        variant="determinate"
                        value={Math.min(100, (currentScore / nextTarget.score) * 100)}
                        sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#bc13fe' } }}
                    />
                </Box>
            )}

            {/* College List */}
            <Box sx={{
                flex: 1,
                overflowY: 'auto',
                pr: 1,
                mr: -1,
                // Hide scrollbar styles
                '&::-webkit-scrollbar': { display: 'none' },
                'msOverflowStyle': 'none',
                'scrollbarWidth': 'none',
            }}>
                <List disablePadding>
                    {categorizedColleges.map((college, idx) => (
                        <React.Fragment key={college.rank}>
                            <ListItem sx={{ px: 1, py: 1.5, borderRadius: 2 }}>
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                    {/* Forced Hex Colors for visibility */}
                                    {college.status === 'secure' && <CheckCircle size={18} color="#00f3ff" />}
                                    {college.status === 'reachable' && <AlertCircle size={18} color="#facc15" />}
                                    {college.status === 'dream' && <Lock size={18} color="#ef4444" />}
                                </ListItemIcon>
                                <ListItemText
                                    primary={<Typography variant="body2" fontWeight="bold" sx={{ color: '#fff' }}>{college.name}</Typography>}
                                    secondary={<Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>Safe Score: {college.score}</Typography>}
                                />
                                <Box sx={{ textAlign: 'right', ml: 'auto' }}>
                                    <Chip
                                        label={college.status === 'secure' ? 'Likely' : (college.status === 'reachable' ? 'Close' : 'Dream')}
                                        size="small"
                                        variant="outlined"
                                        // Specific semantic colors for the outlined chips
                                        color={college.status === 'secure' ? 'success' : (college.status === 'reachable' ? 'warning' : 'error')}
                                        sx={{
                                            height: 22,
                                            fontSize: '0.65rem',
                                            fontWeight: 'bold',
                                            borderWidth: '1px'
                                        }}
                                    />
                                </Box>
                            </ListItem>
                            {idx < categorizedColleges.length - 1 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />}
                        </React.Fragment>
                    ))}
                </List>
            </Box>

        </Paper>
    );
};

export default CollegePredictor;
