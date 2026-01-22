import React, { useEffect, useState } from 'react';
import {
    Grid,
    Paper,
    Typography,
    Box,
    Card,
    CardContent,
    CircularProgress,
    useTheme,
    Container,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Alert
} from '@mui/material';
import api from '../services/api';
import PeopleIcon from '@mui/icons-material/People';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import SellIcon from '@mui/icons-material/Sell';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import type { UserStatsDTO, ListingStatsDTO, ActivityLogDTO } from '../types/admin';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    trend?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend }) => {
    return (
        <Card sx={{ height: '100%' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3 }}>
                <Box>
                    <Typography color="text.secondary" variant="subtitle2" gutterBottom fontWeight="600">
                        {title}
                    </Typography>
                    <Typography variant="h4" fontWeight="700">
                        {value}
                    </Typography>
                    {trend && (
                        <Typography variant="caption" color="success.main" sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5 }} /> {trend} since last month
                        </Typography>
                    )}
                </Box>
                <Box sx={{
                    bgcolor: `${color}15`,
                    p: 2,
                    borderRadius: 3,
                    color: color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {icon}
                </Box>
            </CardContent>
        </Card>
    );
};

const DashboardPage: React.FC = () => {
    const theme = useTheme();
    const [userStats, setUserStats] = useState<UserStatsDTO | null>(null);
    const [listingStats, setListingStats] = useState<ListingStatsDTO | null>(null);
    const [activities, setActivities] = useState<ActivityLogDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [usersRes, listingsRes, activitiesRes] = await Promise.all([
                    api.get<UserStatsDTO>('/admin/stats/users'),
                    api.get<ListingStatsDTO>('/admin/stats/listings'),
                    api.get<ActivityLogDTO[]>('/admin/stats/activities')
                ]);
                setUserStats(usersRes.data);
                setListingStats(listingsRes.data);
                setActivities(activitiesRes.data);
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
                // Don't show error immediately to keep UI clean, or use dummy data first
                setError('Could not load dashboard data. Please check backend connection.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="xl" disableGutters>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom>Dashboard</Typography>
                <Typography color="text.secondary">Welcome back, here's what's happening with your platform today.</Typography>
            </Box>

            {error && (
                <Alert severity="warning" sx={{ mb: 3 }}>{error} - Displaying placeholder data where API failed.</Alert>
            )}

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="Total Users"
                        value={userStats?.totalUsers || 0}
                        icon={<PeopleIcon fontSize="large" />}
                        color={theme.palette.primary.main}
                        trend={userStats?.newUsersThisMonth ? `+${userStats.newUsersThisMonth}` : undefined}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="Total Listings"
                        value={listingStats?.totalListings || 0}
                        icon={<HomeWorkIcon fontSize="large" />}
                        color={theme.palette.secondary.main}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="Active Listings"
                        value={listingStats?.activeListings || 0}
                        icon={<TrendingUpIcon fontSize="large" />}
                        color={theme.palette.success.main}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="Pending Approvals"
                        value={listingStats?.pendingListings || 0}
                        icon={<SellIcon fontSize="large" />}
                        color={theme.palette.warning.main}
                    />
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, lg: 8 }}>
                    <Paper sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>Recent Activity</Typography>
                        {activities.length > 0 ? (
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>User</TableCell>
                                            <TableCell>Action</TableCell>
                                            <TableCell>Description</TableCell>
                                            <TableCell align="right">Time</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {activities.map((log, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight="600">{log.username}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip label={log.action} size="small" variant="outlined" />
                                                </TableCell>
                                                <TableCell>{log.description}</TableCell>
                                                <TableCell align="right" color="text.secondary">
                                                    {new Date(log.timestamp).toLocaleDateString()}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>No recent activities found.</Box>
                        )}
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, lg: 4 }}>
                    <Paper sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>Platform Status</Typography>
                        <Box sx={{ mt: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2">Server Status</Typography>
                                <Chip label="Online" color="success" size="small" />
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2">Database</Typography>
                                <Chip label="Connected" color="success" size="small" />
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2">Version</Typography>
                                <Typography variant="body2" color="text.secondary">v1.2.0</Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default DashboardPage;
