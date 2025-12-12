import React, { useState, useMemo } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Avatar, Chip, Typography, Box, Tabs, Tab, ThemeProvider, createTheme
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Crown, Star } from 'lucide-react';

// Create a custom dark theme for this component
const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#06b6d4', // Cyan-500
        },
        secondary: {
            main: '#8b5cf6', // Violet-500
        },
        background: {
            paper: 'rgba(10, 10, 15, 0.6)', // Glassy dark
            default: 'transparent'
        },
        text: {
            primary: '#e2e8f0',
            secondary: '#94a3b8',
        }
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h5: { fontWeight: 700 },
        subtitle2: { fontWeight: 600, letterSpacing: '0.05em' }
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 16,
                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
                }
            }
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    padding: '16px 24px'
                },
                head: {
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    letterSpacing: '0.1em',
                    color: '#94a3b8'
                }
            }
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    '&:last-child td, &:last-child th': { border: 0 },
                    transition: 'background-color 0.2s',
                    '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.05) !important'
                    }
                }
            }
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 600,
                    minWidth: 80,
                    borderRadius: 8,
                    marginRight: 8,
                    '&.Mui-selected': {
                        color: '#fff',
                        backgroundColor: 'rgba(6, 182, 212, 0.1)'
                    }
                }
            }
        }
    }
});

const Leaderboard = ({ currentTest, currentStudentId, allTests = [] }) => {
    const [view, setView] = useState('Overall');

    // Calculate Overall Data
    const overallData = useMemo(() => {
        if (!allTests || allTests.length === 0) return [];

        const studentMap = {};

        allTests.forEach(test => {
            if (!test.data || !test.data.students) return;
            test.data.students.forEach(student => {
                if (!student.id) return;

                if (!studentMap[student.id]) {
                    studentMap[student.id] = {
                        id: student.id,
                        name: student.name,
                        totalScore: 0,
                        testsTaken: 0,
                        scores: []
                    };
                }

                studentMap[student.id].totalScore += (Number(student.score) || 0);
                studentMap[student.id].testsTaken += 1;
                studentMap[student.id].scores.push(student.score);
            });
        });

        // Convert to array and sort
        return Object.values(studentMap)
            .sort((a, b) => b.totalScore - a.totalScore)
            .map((s, index) => ({ ...s, rank: index + 1 }));
    }, [allTests]);

    // Determine display data
    const displayData = useMemo(() => {
        if (view === 'Overall') {
            return overallData;
        } else {
            const targetTest = allTests.find(t => t.name === view);
            return targetTest && targetTest.data ? targetTest.data.students : [];
        }
    }, [view, allTests, overallData]);

    const getRankStyles = (rank) => {
        if (rank === 1) return { bg: 'linear-gradient(90deg, rgba(234,179,8,0.15) 0%, transparent 100%)', icon: <Crown size={20} className="text-yellow-400 fill-yellow-400/20" /> };
        if (rank === 2) return { bg: 'linear-gradient(90deg, rgba(148,163,184,0.15) 0%, transparent 100%)', icon: <Medal size={20} className="text-slate-400" /> };
        if (rank === 3) return { bg: 'linear-gradient(90deg, rgba(194,65,12,0.15) 0%, transparent 100%)', icon: <Medal size={20} className="text-orange-600" /> };
        return { bg: 'transparent', icon: <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.secondary', width: 24, textAlign: 'center' }}>#{rank}</Typography> };
    };

    const getAvatarColor = (name) => {
        const colors = ['#8b5cf6', '#06b6d4', '#10b981', '#f43f5e', '#f59e0b'];
        return colors[(name ? name.charCodeAt(0) : 0) % colors.length];
    };

    const handleChangeTab = (event, newValue) => {
        setView(newValue);
    };

    return (
        <ThemeProvider theme={darkTheme}>
            {/* CssBaseline removed to preserve global background */}
            <Box sx={{ width: '100%', maxWidth: 900, margin: '2rem auto', px: { xs: 1, md: 0 } }}>

                {/* Header */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'col', md: 'row' }, justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'rgba(6, 182, 212, 0.15)', color: 'primary.main' }}>
                            <Trophy size={20} />
                        </Avatar>
                        <Box>
                            <Typography variant="h5" color="text.primary">Leaderboard</Typography>
                            <Typography variant="body2" color="text.secondary">Top Performers</Typography>
                        </Box>
                    </Box>

                    <Paper sx={{ bgcolor: 'rgba(0,0,0,0.3)', p: 0.5, borderRadius: 3 }}>
                        <Tabs
                            value={view}
                            onChange={handleChangeTab}
                            variant="scrollable"
                            scrollButtons="auto"
                            indicatorColor="primary"
                            sx={{ minHeight: 40, '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' } }}
                        >
                            <Tab label="Overall" value="Overall" />
                            {allTests.map(test => (
                                <Tab key={test.name} label={test.name} value={test.name} />
                            ))}
                        </Tabs>
                    </Paper>
                </Box>

                {/* Table */}
                <TableContainer component={Paper}>
                    <Table stickyHeader aria-label="leaderboard table">
                        <TableHead>
                            <TableRow>
                                <TableCell width="15%" align="center">Rank</TableCell>
                                <TableCell width="60%">Student</TableCell>
                                <TableCell width="25%" align="right">{view === 'Overall' ? 'Total Points' : 'Score'}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody component={AnimatePresence}>
                            {displayData.slice(0, 50).map((student, index) => {
                                const styles = getRankStyles(student.rank);
                                const isMe = student.id === currentStudentId;

                                return (
                                    <TableRow
                                        key={student.id} // Stable key if possible, else index
                                        component={motion.tr}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.03, duration: 0.3 }}
                                        sx={{
                                            background: isMe ? 'rgba(6, 182, 212, 0.15) !important' : styles.bg,
                                            borderLeft: isMe ? '4px solid #06b6d4' : (student.rank <= 3 ? `4px solid ${student.rank === 1 ? '#eab308' : student.rank === 2 ? '#94a3b8' : '#c2410c'}` : '4px solid transparent')
                                        }}
                                    >
                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                {styles.icon}
                                            </Box>
                                        </TableCell>

                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Avatar
                                                    sx={{
                                                        bgcolor: getAvatarColor(student.name),
                                                        fontWeight: 'bold',
                                                        width: 32, height: 32,
                                                        fontSize: '0.875rem'
                                                    }}
                                                >
                                                    {student.name ? student.name.charAt(0) : '?'}
                                                </Avatar>
                                                <Box sx={{ overflow: 'hidden' }}>
                                                    <Typography variant="subtitle2" noWrap sx={{ color: isMe ? 'primary.main' : 'text.primary' }}>
                                                        {student.name || 'Unknown'} {isMe && <Chip label="YOU" size="small" color="primary" sx={{ height: 16, fontSize: '0.6rem', fontWeight: 'bold' }} />}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                                                        {student.id}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>

                                        <TableCell align="right">
                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontFamily: 'monospace', color: view === 'Overall' ? 'secondary.main' : 'primary.main' }}>
                                                {view === 'Overall' ? student.totalScore : student.score}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                {view === 'Overall' ? `${student.testsTaken} Tests` : `${student.percentile}%ile`}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}

                            {displayData.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} align="center" sx={{ py: 8 }}>
                                        <Typography variant="body1" color="text.secondary">No rankings available yet.</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* User Footer (Sticky) */}
                {(() => {
                    const myData = view === 'Overall'
                        ? overallData.find(s => s.id === currentStudentId)
                        : (allTests.find(t => t.name === view)?.data?.students.find(s => s.id === currentStudentId));

                    const isVisible = displayData.slice(0, 50).some(s => s.id === currentStudentId);

                    if (myData && !isVisible) {
                        return (
                            <Paper
                                component={motion.div}
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                sx={{
                                    position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
                                    width: '90%', maxWidth: 600, zIndex: 1000,
                                    bgcolor: 'rgba(15, 23, 42, 0.9)',
                                    border: '1px solid #06b6d4',
                                    boxShadow: '0 0 20px rgba(6, 182, 212, 0.2)'
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', p: 2, gap: 2 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 40, borderRight: '1px solid rgba(255,255,255,0.1)', mr: 1, pr: 2 }}>
                                        <Typography variant="h6" color="primary" sx={{ fontWeight: 900 }}>#{myData.rank}</Typography>
                                        <Typography variant="caption" color="text.secondary">RANK</Typography>
                                    </Box>
                                    <Box sx={{ flex: 1, overflow: 'hidden' }}>
                                        <Typography variant="subtitle2" color="white" noWrap>
                                            {myData.name || 'You'} <Chip label="YOU" size="small" color="primary" sx={{ height: 16, fontSize: '0.6rem' }} />
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">{myData.id}</Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography variant="h6" color="secondary.main" sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>
                                            {view === 'Overall' ? myData.totalScore : myData.score}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Paper>
                        );
                    }
                    return null;
                })()}

            </Box>
        </ThemeProvider>
    );
};

export default Leaderboard;
