import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    ConfigProvider,
    theme,
    Layout,
    Row,
    Col,
    Card,
    Statistic,
    Tabs,
    Table,
    Tag,
    Progress,
    List,
    Typography,
    Button,
    Alert,
    Spin,
    Space,
    Input,
    Tooltip
} from 'antd';
import {
    ArrowLeftOutlined,
    HomeOutlined,
    ExportOutlined,
    ThunderboltOutlined,
    TrophyOutlined,
    AimOutlined,
    AlertTwoTone,
    FireOutlined,
    StopOutlined
} from '@ant-design/icons';
import { Brain, TrendingUp, BarChart2 } from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { calculateSHI, classifyChapter, analyzeQuadrant, generateInsights, generateActionPlan, calculateAdvancedStats } from '../utils/analysisUtils';

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;

const AdvancedAnalysis = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { testData, studentId } = location.state || {};

    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState(null);
    const [error, setError] = useState(null);
    const [manualUrl, setManualUrl] = useState('');
    const [targetUrl, setTargetUrl] = useState(null);
    const [insights, setInsights] = useState([]);
    const [actionPlan, setActionPlan] = useState([]);

    // Initialize targetUrl from props or logic
    useEffect(() => {
        let derivedUrl = testData?.reportUrl;
        if (!derivedUrl && testData?.reportBaseUrl && studentId) {
            const baseUrl = testData.reportBaseUrl.endsWith('/') ? testData.reportBaseUrl : `${testData.reportBaseUrl}/`;
            derivedUrl = `${baseUrl}${studentId}/`;
        }

        if (derivedUrl) {
            setTargetUrl(derivedUrl);
        } else {
            setLoading(false);
            setError("No official report URL found. Please enter it manually.");
        }
    }, [testData, studentId]);

    // Fetch Report
    useEffect(() => {
        if (!targetUrl) return;

        const fetchReport = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch('https://mockserver-ujt5.onrender.com/scrape', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: targetUrl })
                });

                if (!response.ok) {
                    throw new Error(`API Error ${response.status}: ${response.statusText}`);
                }

                const apiData = await response.json();
                const data = transformApiResponse(apiData);

                setReportData(data);
                setInsights(generateInsights(data.overall, data.subjects));
                setActionPlan(generateActionPlan(data.subjects, data.overall));
                setError(null);
            } catch (err) {
                console.error("Fetch error details:", err);
                setError(`Could not retrieve the report. ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [targetUrl]);

    const transformApiResponse = (apiData) => {
        const overall = apiData.overallPerformance || {};
        const subjects = (apiData.subjectPerformance || []).map(sub => ({
            name: sub.subject,
            stats: sub.stats,
            chapters: (sub.chapters || []).map(chap => ({
                name: chap.chapter,
                score: chap.score,
                accuracy: chap.accuracy,
                attempt: chap.attemptRate
            }))
        }));
        return { overall, subjects };
    };

    if (!testData) {
        return (
            <div style={{ padding: 50, textAlign: 'center' }}>
                <Alert
                    title="Session Expired"
                    description="Please return to home and start the analysis again."
                    type="error"
                    showIcon
                />
                <Button type="primary" onClick={() => navigate('/')} style={{ marginTop: 20 }}>
                    Go Home
                </Button>
            </div>
        );
    }

    // --- RENDER HELPERS ---

    const renderSubjectTab = (sub) => {
        const shi = calculateSHI(sub.stats);
        const quadrant = analyzeQuadrant(sub.chapters);

        // Table Columns
        const columns = [
            {
                title: 'Chapter',
                dataIndex: 'name',
                width: '40%',
            },
            {
                title: 'Status',
                key: 'status',
                render: (_, record) => {
                    const cls = classifyChapter(record);
                    let color = 'default';
                    if (cls.status === 'Trap') color = 'error';
                    if (cls.status === 'Strong') color = 'success';
                    if (cls.status === 'Partial') color = 'warning';

                    return (
                        <Space>
                            <Tag color={color}>{cls.status.toUpperCase()}</Tag>
                            {cls.status === 'Trap' && (
                                <Tooltip title="High attempts with low accuracy. You are losing marks here!">
                                    <AlertTwoTone twoToneColor="#f5222d" />
                                </Tooltip>
                            )}
                        </Space>
                    );
                }
            },
            {
                title: 'Score',
                dataIndex: 'score',
                key: 'score',
                sorter: (a, b) => Number(a.score) - Number(b.score),
                render: (val) => <Text type={Number(val) < 0 ? 'danger' : Number(val) > 0 ? 'success' : 'secondary'} strong>{val}</Text>
            },
            {
                title: 'Acc %',
                dataIndex: 'accuracy',
                key: 'accuracy',
                sorter: (a, b) => Number(a.accuracy) - Number(b.accuracy),
                render: val => `${val}%`
            },
            {
                title: 'Att %',
                dataIndex: 'attempt',
                key: 'attempt',
                sorter: (a, b) => Number(a.attempt) - Number(b.attempt),
                render: val => `${val}%`
            }
        ];

        return (
            <Row gutter={[24, 24]}>
                {/* Left: Health Index & Zone Analysis */}
                <Col xs={24} md={8}>
                    <Card title="Subject Health Index" className="glass-card" variant="borderless">
                        <div style={{ textAlign: 'center', marginBottom: 20 }}>
                            <Progress
                                type="dashboard"
                                percent={Number(shi.score)}
                                format={percent => percent}
                                size={180}
                                strokeColor={shi.color === 'green' ? '#52c41a' : shi.color === 'red' ? '#ff4d4f' : '#faad14'}
                            />
                            <Title level={4} style={{ marginTop: 10, color: 'white' }}>{shi.tag}</Title>
                            <Text type="secondary">Mix of Accuracy, Attempts & Rank</Text>
                        </div>

                        <Title level={5}>Zone Analysis</Title>
                        <Row gutter={[12, 12]}>
                            <Col span={12}>
                                <Card size="small" variant="outlined" style={{ background: 'rgba(82, 196, 26, 0.1)', borderColor: '#52c41a' }}>
                                    <Statistic title="Dominating" value={quadrant.strength.length} styles={{ content: { color: '#52c41a' } }} />
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card size="small" variant="outlined" style={{ background: 'rgba(250, 173, 20, 0.1)', borderColor: '#faad14' }}>
                                    <Statistic title="Missed Opp." value={quadrant.underutilized.length} styles={{ content: { color: '#faad14' } }} />
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card size="small" variant="outlined" style={{ background: 'rgba(255, 77, 79, 0.1)', borderColor: '#ff4d4f' }}>
                                    <Statistic title="High Risk" value={quadrant.risk.length} styles={{ content: { color: '#ff4d4f' } }} />
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card size="small" variant="outlined" style={{ background: 'rgba(255, 145, 0, 0.1)', borderColor: '#fa8c16' }}>
                                    <Statistic title="Weak" value={quadrant.weak.length} styles={{ content: { color: '#fa8c16' } }} />
                                </Card>
                            </Col>
                        </Row>

                    </Card>
                </Col>

                {/* Right: Chapter Table */}
                <Col xs={24} md={16}>
                    <Card title={`${sub.name} Deep Dive`} className="glass-card" variant="borderless">
                        <Table
                            dataSource={sub.chapters.map((c, i) => ({ ...c, key: i }))}
                            columns={columns}
                            pagination={{ pageSize: 8 }}
                            size="middle"
                        />
                    </Card>
                </Col>
            </Row>
        );
    };

    return (
        <ConfigProvider
            theme={{
                algorithm: theme.darkAlgorithm,
                token: {
                    colorPrimary: '#00f3ff',
                    colorBgContainer: 'rgba(30,30,40,0.6)',
                    fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                }
            }}
        >
            <div className="fade-in" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>

                {/* Header */}
                <Row justify="space-between" align="middle" style={{ marginBottom: 32 }}>
                    <Col>
                        <Space>
                            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
                            <div>
                                <Title level={2} style={{ margin: 0 }}>Advanced Analysis</Title>
                                <Text type="secondary">Deep dive into {testData.testName}</Text>
                            </div>
                        </Space>
                    </Col>
                    <Col>
                        <Button icon={<HomeOutlined />} onClick={() => navigate('/')}>Home</Button>
                    </Col>
                </Row>

                {/* Loading / Error / Content */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 100 }}>
                        <Spin size="large" />
                        <Title level={4} style={{ marginTop: 24, color: '#00f3ff' }}>Fetching Intelligence...</Title>
                    </div>
                ) : error ? (
                    <Row justify="center">
                        <Col xs={24} md={12}>
                            <Card className="glass-card" variant="borderless">
                                <Alert
                                    title="Manual Entry Required"
                                    description={error}
                                    type="warning"
                                    showIcon
                                    style={{ marginBottom: 16 }}
                                />
                                <Space.Compact style={{ width: '100%' }}>
                                    <Input
                                        placeholder="Paste Report URL here..."
                                        value={manualUrl}
                                        onChange={(e) => setManualUrl(e.target.value)}
                                    />
                                    <Button type="primary" onClick={() => manualUrl && setTargetUrl(manualUrl)}>
                                        Analyze Now
                                    </Button>
                                </Space.Compact>
                            </Card>
                        </Col>
                    </Row>
                ) : reportData ? (
                    <>
                        {/* 1. Executive Performance Summary */}
                        <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
                            <Col xs={24} sm={8}>
                                <Card variant="borderless" className="glass-card">
                                    <Statistic
                                        title={<Space><TrophyOutlined /> Total Score</Space>}
                                        value={reportData.overall['Marks']}
                                        suffix="/ 300"
                                        styles={{ content: { color: '#fff', fontWeight: 'bold' } }}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={8}>
                                <Card variant="borderless" className="glass-card">
                                    <Statistic
                                        title={<Space><ThunderboltOutlined /> Percentile</Space>}
                                        value={reportData.overall['Percentile']}
                                        precision={2}
                                        styles={{ content: { color: '#00f3ff', fontWeight: 'bold' } }}
                                        suffix={<Tag color="blue" style={{ marginLeft: 8 }}>Rank #{reportData.overall['Rank']}</Tag>}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={8}>
                                <Card variant="borderless" className="glass-card">
                                    <Statistic
                                        title={<Space><AimOutlined /> Accuracy</Space>}
                                        value={reportData.overall['Accuracy']}
                                        suffix="%"
                                        styles={{ content: { color: '#faad14', fontWeight: 'bold' } }}
                                    />
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        {Number(reportData.overall['Accuracy']) > 80 ? 'High accuracy – safe to increase attempts' : 'Focus on reducing negative marks'}
                                    </Text>
                                </Card>
                            </Col>
                        </Row>

                        {/* 2. GAP ANALYSIS & LEAK TRACKER */}
                        {(() => {
                            const advancedStats = calculateAdvancedStats(reportData.subjects);
                            const chartData = reportData.subjects.map(sub => ({
                                name: sub.name,
                                You: Number(sub.stats.Marks),
                                Topper: Number(sub.stats['Topper Marks']),
                            }));

                            return (
                                <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
                                    {/* Gap Analysis Chart */}
                                    <Col xs={24} lg={12}>
                                        <Card
                                            title={<Space><BarChart2 size={18} color="#00f3ff" /> Competitive Gap Analysis</Space>}
                                            className="glass-card"
                                            variant="borderless"
                                            style={{ height: '100%' }}
                                        >
                                            <div style={{ width: '100%', height: 300 }}>
                                                <ResponsiveContainer>
                                                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                                        <XAxis dataKey="name" stroke="#fff" tick={{ fontSize: 12 }} />
                                                        <YAxis stroke="#fff" tick={{ fontSize: 12 }} />
                                                        <RechartsTooltip
                                                            contentStyle={{ backgroundColor: '#1f1f2e', border: '1px solid #333', borderRadius: 8 }}
                                                            itemStyle={{ color: '#fff' }}
                                                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                                        />
                                                        <Legend wrapperStyle={{ paddingTop: 10 }} />
                                                        <Bar dataKey="You" fill="#00f3ff" radius={[4, 4, 0, 0]} barSize={20} />
                                                        <Bar dataKey="Topper" fill="#faad14" radius={[4, 4, 0, 0]} barSize={20} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </Card>
                                    </Col>

                                    {/* Leak Tracker & Missed Opps */}
                                    <Col xs={24} lg={12}>
                                        <Row gutter={[24, 24]} style={{ height: '100%' }}>
                                            {/* Negative Marks (Leak) */}
                                            <Col span={24}>
                                                <Card
                                                    className="glass-card"
                                                    variant="borderless"
                                                    style={{ background: 'rgba(255, 77, 79, 0.05)', border: '1px solid rgba(255, 77, 79, 0.2)' }}
                                                >
                                                    <Row align="middle" justify="space-between">
                                                        <Col>
                                                            <Title level={5} style={{ color: '#ff4d4f', margin: 0 }}>
                                                                <FireOutlined /> The Leak Tracker
                                                            </Title>
                                                            <Text type="secondary">Marks lost due to negative marking</Text>
                                                        </Col>
                                                        <Col>
                                                            <Title level={2} style={{ color: '#ff4d4f', margin: 0 }}>-{advancedStats.totalNegative}</Title>
                                                        </Col>
                                                    </Row>
                                                    <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                                        {advancedStats.negativeChapters.slice(0, 4).map((c, i) => (
                                                            <Tag key={i} color="error" style={{ margin: 0 }}>{c.subject}: {c.name}</Tag>
                                                        ))}
                                                        {advancedStats.negativeChapters.length > 4 && <Tag>+{advancedStats.negativeChapters.length - 4} more</Tag>}
                                                    </div>
                                                </Card>
                                            </Col>

                                            {/* Missed Opportunities */}
                                            <Col span={24}>
                                                <Card
                                                    className="glass-card"
                                                    variant="borderless"
                                                    style={{ background: 'rgba(250, 173, 20, 0.05)', border: '1px solid rgba(250, 173, 20, 0.2)' }}
                                                >
                                                    <Row align="middle" justify="space-between">
                                                        <Col>
                                                            <Title level={5} style={{ color: '#faad14', margin: 0 }}>
                                                                <StopOutlined /> Missed Opportunities
                                                            </Title>
                                                            <Text type="secondary">Potential from unattempted questions</Text>
                                                        </Col>
                                                        <Col>
                                                            <Title level={2} style={{ color: '#faad14', margin: 0 }}>+{advancedStats.missedOpp}</Title>
                                                        </Col>
                                                    </Row>
                                                    <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                                        {advancedStats.missedChapters.slice(0, 4).map((c, i) => (
                                                            <Tag key={i} color="warning" style={{ margin: 0 }}>{c.subject}: {c.name}</Tag>
                                                        ))}
                                                    </div>
                                                </Card>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            );
                        })()}

                        {/* 3. Insights & Action Plan */}
                        <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>

                            {/* Action Plan */}
                            <Col xs={24} md={14}>
                                <Card
                                    title={<Space><TrendingUp size={18} color="#52c41a" /> Improvement Protocol (Next 14 Days)</Space>}
                                    className="glass-card"
                                    variant="borderless"
                                    style={{ height: '100%' }}
                                    extra={<Tag color="green">Potential: +{actionPlan.reduce((acc, item) => acc + item.potential, 0)} Marks</Tag>}
                                >
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', maxHeight: '400px', paddingRight: 4 }}>
                                        {actionPlan.length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: 20 }}>
                                                <Text type="secondary" italic>No specific weak chapters detected!</Text>
                                            </div>
                                        ) : (
                                            actionPlan.map((item, index) => (
                                                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                        <Tag color="blue">#{index + 1}</Tag>
                                                        <div>
                                                            <Text strong style={{ color: '#fff', display: 'block', marginBottom: 4 }}>{item.name}</Text>
                                                            <Space size={4}>
                                                                <Tag>{item.subject}</Tag>
                                                                {item.reason === 'Trap' && <Tag color="error">TRAP</Tag>}
                                                            </Space>
                                                        </div>
                                                    </div>
                                                    <div style={{ textAlign: 'right', minWidth: 80 }}>
                                                        <Text type="secondary" style={{ fontSize: 10, display: 'block', textTransform: 'uppercase' }}>Potential</Text>
                                                        <Text strong type="success" style={{ fontSize: 16 }}>+{item.potential}</Text>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </Card>
                            </Col>

                            {/* Smart Insights */}
                            <Col xs={24} md={10}>
                                <Card
                                    title={<Space><Brain size={18} color="#bc13fe" /> Smart Insights</Space>}
                                    className="glass-card"
                                    variant="borderless"
                                    style={{ height: '100%', background: 'linear-gradient(135deg, rgba(20,20,35,0.8) 0%, rgba(20,20,50,0.8) 100%)' }}
                                >
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {insights.map((insight, idx) => (
                                            <Alert
                                                key={idx}
                                                title={<Text strong style={{ color: '#d3adf7' }}>{insight.title}</Text>} // Purple text
                                                description={<Text style={{ color: 'rgba(255,255,255,0.8)' }}>{insight.text}</Text>}
                                                type={insight.title.includes('Dominating') ? 'success' : 'info'}
                                                style={{
                                                    background: insight.title.includes('Dominating') ? 'rgba(82, 196, 26, 0.15)' : 'rgba(114, 46, 209, 0.15)',
                                                    border: insight.title.includes('Dominating') ? '1px solid rgba(82, 196, 26, 0.3)' : '1px solid rgba(114, 46, 209, 0.3)'
                                                }}
                                                showIcon={input => !input}
                                                icon={insight.title.includes('Dominating') ? <TrophyOutlined /> : <Brain size={16} />}
                                            />
                                        ))}
                                    </div>
                                </Card>
                            </Col>
                        </Row>

                        {/* 3. Subject Tabs */}
                        <div style={{ marginTop: 20 }}>
                            <Title level={3}>Subject-wise Diagnostics</Title>
                            <Tabs
                                defaultActiveKey="0"
                                type="card"
                                size="large"
                                items={reportData.subjects.map((sub, i) => ({
                                    key: String(i),
                                    label: sub.name,
                                    children: renderSubjectTab(sub)
                                }))}
                            />
                        </div>

                    </>
                ) : null}
            </div>
        </ConfigProvider>
    );
};

export default AdvancedAnalysis;
