import React, { useState, useEffect, useRef } from 'react';
import {
    Box, Paper, Typography, TextField, Button, IconButton,
    Drawer, Avatar, CircularProgress, Divider, Alert
} from '@mui/material';
import {
    MessageSquare, X, Send, Image as ImageIcon, Sparkles,
    Key, Eraser, Bot, User
} from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { motion, AnimatePresence } from 'framer-motion';

const AITutor = ({ isOpen, onClose, contextText = "" }) => {
    const [apiKey, setApiKey] = useState(localStorage.getItem('min_gemini_key') || '');
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { role: 'model', text: 'Hello! I am your AI Tutor. Paste a question or ask me anything about your mock test.' }
    ]);
    const [loading, setLoading] = useState(false);
    const [showKeyInput, setShowKeyInput] = useState(!localStorage.getItem('min_gemini_key'));

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Save/Clear Key
    const handleSaveKey = () => {
        if (apiKey.trim().startsWith('AIza')) {
            localStorage.setItem('min_gemini_key', apiKey);
            setShowKeyInput(false);
        } else {
            alert('Invalid Key format? Usually starts with AIza...');
        }
    };

    const handleClearKey = () => {
        localStorage.removeItem('min_gemini_key');
        setApiKey('');
        setShowKeyInput(true);
    };

    const [selectedImage, setSelectedImage] = useState(null);
    const fileInputRef = useRef(null);

    const handleImageSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setSelectedImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    // Send Message
    const handleSend = async () => {
        if (!input.trim() && !selectedImage) return;
        if (!apiKey) { setShowKeyInput(true); return; }

        const userMsg = input;
        const currentImage = selectedImage;

        // Add User Message to UI
        setMessages(prev => [...prev, {
            role: 'user',
            text: userMsg,
            image: currentImage
        }]);

        setInput('');
        setSelectedImage(null);
        setLoading(true);

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            let promptParts = [];

            // System Instruction (Strict Math Mode)
            const systemInstruction = `
You are an expert Tutor.
RULES:
1. Wrap ALL math in LaTeX delimiters.
2. Inline: $ E = mc^2 $
3. Block: $$ x = 5 $$
4. Boxed: $ \\boxed{answer} $ (Always wrap boxed in $)
5. No bold '**' inside math.
`;
            promptParts.push(systemInstruction + "\n\n");

            // Add Context
            if (contextText) {
                promptParts.push(`Context: ${contextText}\n\n`);
            }

            // Add Text
            if (userMsg) promptParts.push(userMsg);

            // Add Image
            if (currentImage) {
                // Remove data:image/jpeg;base64, prefix
                const base64Data = currentImage.split(',')[1];
                promptParts.push({
                    inlineData: {
                        data: base64Data,
                        mimeType: "image/jpeg"
                    }
                });
            }

            const result = await model.generateContent(promptParts);
            const response = await result.response;
            const text = response.text();

            setMessages(prev => [...prev, { role: 'model', text: text }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'model', text: "Error: " + (error.message || "Failed to generate response.") }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Drawer
            anchor="right"
            open={isOpen}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: { xs: '100%', sm: 450 },
                    bgcolor: '#020617', // Deep Space Black
                    height: '100dvh',
                    overflow: 'hidden',
                    backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(124, 58, 237, 0.15), transparent 40%)'
                }
            }}
        >
            {/* Header */}
            <Box sx={{
                p: 2.5,
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backdropFilter: 'blur(10px)',
                bgcolor: 'rgba(15, 23, 42, 0.6)',
                flexShrink: 0,
                zIndex: 10
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                        p: 1, borderRadius: '12px',
                        background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                        boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
                    }}>
                        <Sparkles size={20} color="white" />
                    </Box>
                    <Box>
                        <Typography variant="subtitle1" fontWeight="700" sx={{ color: '#fff', letterSpacing: '0.5px' }}>
                            Mock Master AI
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Bot size={12} /> Gemini 2.5 Flash
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                        onClick={() => setShowKeyInput(!showKeyInput)}
                        size="small"
                        sx={{ color: '#64748b', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}
                    >
                        <Key size={18} />
                    </IconButton>
                    <IconButton
                        onClick={onClose}
                        sx={{ color: '#94a3b8', '&:hover': { color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.1)' } }}
                    >
                        <X />
                    </IconButton>
                </Box>
            </Box>

            {/* API Key Input */}
            <AnimatePresence>
                {showKeyInput && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                        <Box sx={{ p: 3, bgcolor: 'rgba(30, 41, 59, 0.5)', borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
                            <Alert severity="info" sx={{ mb: 2, bgcolor: 'rgba(6, 182, 212, 0.1)', color: '#22d3ee', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
                                Privacy First: Your Key is stored locally.
                            </Alert>
                            <TextField
                                fullWidth size="small" placeholder="Paste Gemini API Key (AIza...)"
                                value={apiKey} onChange={(e) => setApiKey(e.target.value)}
                                type="password"
                                sx={{
                                    bgcolor: 'rgba(0,0,0,0.3)',
                                    borderRadius: 2,
                                    input: { color: 'white', fontFamily: 'monospace' },
                                    fieldset: { border: '1px solid rgba(255,255,255,0.1)' }
                                }}
                            />
                            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                                <Button disableElevation variant="contained" onClick={handleSaveKey} sx={{ bgcolor: '#7c3aed', '&:hover': { bgcolor: '#6d28d9' } }}>Save Locally</Button>
                                <Button onClick={handleClearKey} sx={{ color: '#ef4444' }}>Clear</Button>
                            </Box>
                        </Box>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Messages Area */}
            <Box sx={{
                flexGrow: 1,
                overflowY: 'auto',
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                scrollBehavior: 'smooth',
                '&::-webkit-scrollbar': { display: 'none' },
                msOverflowStyle: 'none',
                scrollbarWidth: 'none',
            }}>
                {messages.map((msg, idx) => (
                    <Box key={idx} sx={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%', flexShrink: 0 }}>

                        {/* Name Label */}
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', ml: msg.role === 'user' ? 0 : 1, mr: msg.role === 'user' ? 1 : 0, mb: 0.5, display: 'block', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                            {msg.role === 'user' ? 'You' : 'AI Assistant'}
                        </Typography>

                        <Paper elevation={0} sx={{
                            p: 2,
                            borderRadius: '16px',
                            borderTopRightRadius: msg.role === 'user' ? '4px' : '16px',
                            borderTopLeftRadius: msg.role === 'user' ? '16px' : '4px',
                            background: msg.role === 'user'
                                ? 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)'
                                : 'rgba(30, 41, 59, 0.7)',
                            backdropFilter: msg.role === 'model' ? 'blur(10px)' : 'none',
                            color: msg.role === 'user' ? '#fff' : '#e2e8f0',
                            border: msg.role === 'model' ? '1px solid rgba(255,255,255,0.05)' : 'none',
                            boxShadow: msg.role === 'user' ? '0 4px 12px rgba(6, 182, 212, 0.2)' : 'none'
                        }}>
                            {/* Show uploaded image in chat history */}
                            {msg.image && (
                                <Box
                                    component="img"
                                    src={msg.image}
                                    sx={{
                                        maxWidth: '100%',
                                        borderRadius: '12px',
                                        mb: 1.5,
                                        border: '1px solid rgba(255,255,255,0.2)'
                                    }}
                                />
                            )}

                            {msg.role === 'model' ? (
                                <ReactMarkdown
                                    remarkPlugins={[remarkMath]}
                                    rehypePlugins={[rehypeKatex]}
                                    components={{
                                        code: ({ node, ...props }) => <code style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace', color: '#fcd34d' }} {...props} />,
                                        p: ({ node, ...props }) => <Typography variant="body2" sx={{ lineHeight: 1.6, mb: 1, '&:last-child': { mb: 0 } }} {...props} />,
                                        strong: ({ node, ...props }) => <span style={{ color: '#fff', fontWeight: 600 }} {...props} />
                                    }}
                                >
                                    {msg.text}
                                </ReactMarkdown>
                            ) : (
                                <Typography variant="body2" sx={{ lineHeight: 1.6 }}>{msg.text}</Typography>
                            )}
                        </Paper>
                    </Box>
                ))}
                {loading && (
                    <Box sx={{ alignSelf: 'flex-start', p: 2, borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                                <Box sx={{ width: 8, height: 8, bgcolor: '#7c3aed', borderRadius: '50%' }} />
                            </motion.div>
                            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}>
                                <Box sx={{ width: 8, height: 8, bgcolor: '#06b6d4', borderRadius: '50%' }} />
                            </motion.div>
                            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}>
                                <Box sx={{ width: 8, height: 8, bgcolor: '#f472b6', borderRadius: '50%' }} />
                            </motion.div>
                        </Box>
                    </Box>
                )}
                <div ref={messagesEndRef} />
            </Box>

            {/* Input Area */}
            <Box sx={{
                p: 1.5,
                borderTop: '1px solid rgba(255,255,255,0.1)',
                bgcolor: '#0f172a',
                flexShrink: 0, // Stick to bottom
                marginTop: 'auto' // Belt and suspenders
            }}>

                {/* Image Preview */}
                {selectedImage && (
                    <Box sx={{ position: 'relative', display: 'inline-block', mb: 1 }}>
                        <Box component="img" src={selectedImage} sx={{ height: 60, borderRadius: 1, border: '1px solid #7c3aed' }} />
                        <IconButton
                            size="small"
                            onClick={() => setSelectedImage(null)}
                            sx={{ position: 'absolute', top: -8, right: -8, bgcolor: '#ef4444', color: 'white', '&:hover': { bgcolor: '#dc2626' }, p: 0.5 }}
                        >
                            <X size={12} />
                        </IconButton>
                    </Box>
                )}

                <Box sx={{ display: 'flex', gap: 1 }}>
                    <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        ref={fileInputRef}
                        onChange={handleImageSelect}
                    />
                    <IconButton
                        onClick={() => fileInputRef.current.click()}
                        sx={{ color: '#94a3b8', bgcolor: '#1e293b', borderRadius: 2, border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                        <ImageIcon size={20} />
                    </IconButton>

                    <TextField
                        fullWidth
                        multiline
                        maxRows={4}
                        placeholder={selectedImage ? "Ask about this image..." : "Type text or upload image..."}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        onPaste={(e) => {
                            const items = e.clipboardData.items;
                            for (let item of items) {
                                if (item.type.indexOf("image") === 0) {
                                    const blob = item.getAsFile();
                                    const reader = new FileReader();
                                    reader.onloadend = () => setSelectedImage(reader.result);
                                    reader.readAsDataURL(blob);
                                }
                            }
                        }}
                        variant="outlined"
                        size="small"
                        sx={{
                            bgcolor: '#1e293b',
                            '& .MuiOutlinedInput-root': {
                                color: 'white',
                                padding: '8px' // Consistent padding
                            },
                            '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }
                        }}
                    />
                    <IconButton
                        onClick={handleSend}
                        disabled={loading || (!input.trim() && !selectedImage)}
                        sx={{
                            bgcolor: '#06b6d4', color: 'white', borderRadius: 2,
                            '&:hover': { bgcolor: '#0891b2' },
                            '&:disabled': { bgcolor: '#334155', color: '#64748b' }
                        }}
                    >
                        <Send size={20} />
                    </IconButton>
                </Box>
            </Box>
        </Drawer>
    );
};

export default AITutor;
