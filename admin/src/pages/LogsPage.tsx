import React, { useEffect, useState } from 'react';
import {
    Typography, Box, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TablePagination,
    Chip, CircularProgress, Alert, TextField, InputAdornment,
    FormControl, InputLabel, Select, MenuItem, Stack, Card, CardContent
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import api from '../services/api';

interface ActivityLog {
    id: number;
    username: string;
    action: string;
    description: string;
    ipAddress: string;
    timestamp: string;
}

const LogsPage: React.FC = () => {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalLogs, setTotalLogs] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionFilter, setActionFilter] = useState<string>('ALL');

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/admin/logs?page=${page}&size=${rowsPerPage}`);
            setLogs(response.data.content || []);
            setTotalLogs(response.data.totalElements || 0);
            setError(null);
        } catch (err: any) {
            console.error("Failed to fetch logs", err);
            setError(err.response?.data?.message || "Failed to load logs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, rowsPerPage]);

    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const getActionColor = (action: string): "default" | "success" | "info" | "error" | "warning" => {
        if (action.includes('LOGIN')) return 'success';
        if (action.includes('REGISTER')) return 'info';
        if (action.includes('DELETE')) return 'error';
        if (action.includes('UPDATE') || action.includes('ENABLED') || action.includes('DISABLED')) return 'warning';
        return 'default';
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch = searchTerm === '' ||
            log.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
        return matchesSearch && matchesAction;
    });

    const uniqueActions = Array.from(new Set(logs.map(log => log.action)));

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>System Activity Logs</Typography>

            {/* Stats Cards */}
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                <Card sx={{ flex: 1 }}>
                    <CardContent>
                        <Typography color="text.secondary" gutterBottom variant="body2">
                            Total Logs
                        </Typography>
                        <Typography variant="h4">{totalLogs}</Typography>
                    </CardContent>
                </Card>
                <Card sx={{ flex: 1 }}>
                    <CardContent>
                        <Typography color="text.secondary" gutterBottom variant="body2">
                            Filtered Results
                        </Typography>
                        <Typography variant="h4">{filteredLogs.length}</Typography>
                    </CardContent>
                </Card>
            </Stack>

            {/* Filters */}
            <Paper sx={{ p: 2, mb: 2 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                        placeholder="Search by user or description..."
                        size="small"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ flex: 1 }}
                    />
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Action Type</InputLabel>
                        <Select
                            value={actionFilter}
                            label="Action Type"
                            onChange={(e) => setActionFilter(e.target.value)}
                        >
                            <MenuItem value="ALL">All Actions</MenuItem>
                            {uniqueActions.map(action => (
                                <MenuItem key={action} value={action}>{action}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Stack>
            </Paper>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Paper sx={{ width: '100%', mb: 2 }}>
                <TableContainer>
                    <Table sx={{ minWidth: 750 }} aria-label="system logs table">
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'grey.100' }}>
                                <TableCell sx={{ fontWeight: 'bold' }}>Timestamp</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>User</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>IP Address</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : filteredLogs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                        <Typography color="text.secondary">
                                            {searchTerm || actionFilter !== 'ALL' ? 'No logs match your filters' : 'No logs found'}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredLogs.map((log) => (
                                    <TableRow key={log.id} hover sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                                {new Date(log.timestamp).toLocaleString('tr-TR')}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="600" color="primary.main">
                                                {log.username || 'Anonymous'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={log.action.replace(/_/g, ' ')}
                                                color={getActionColor(log.action)}
                                                size="small"
                                                sx={{ fontWeight: 'bold' }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {log.description}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                                {log.ipAddress}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    component="div"
                    count={totalLogs}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </Box>
    );
}

export default LogsPage;
