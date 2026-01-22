import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    Chip,
    IconButton,
    Tooltip,
    TablePagination,
    TextField,
    InputAdornment,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    OutlinedInput,
    type SelectChangeEvent
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../services/api';
import type { User as AuthUser } from '../types/auth'; // Re-use basic user type
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Extended User type for full admin view
interface AdminUser extends AuthUser {
    enabled: boolean;
    createdAt?: string;
}

interface PageResponse {
    content: AdminUser[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

const UsersPage: React.FC = () => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalUsers, setTotalUsers] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal States
    const [openRoleModal, setOpenRoleModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // Note: searchTerm is placeholder, backend needs filtering impl if we want search
            const response = await api.get<PageResponse>(`/admin/users?page=${page}&size=${rowsPerPage}`);
            setUsers(response.data.content);
            setTotalUsers(response.data.totalElements);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page, rowsPerPage]);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
        try {
            await api.put(`/admin/users/${userId}/status`);
            toast.success(`User ${currentStatus ? 'banned' : 'activated'} successfully`);
            fetchUsers(); // Refresh
        } catch (error) {
            toast.error('Failed to update user status');
        }
    };

    const handleDeleteUser = async (userId: number) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                await api.delete(`/admin/users/${userId}`);
                toast.success('User deleted successfully');
                fetchUsers();
            } catch (error) {
                toast.error('Failed to delete user');
            }
        }
    };

    const handleEditRoles = (user: AdminUser) => {
        setSelectedUser(user);
        // Keep full role names for logic, strip for display only
        setSelectedRoles(user.roles);
        setOpenRoleModal(true);
    };

    const handleSaveRoles = async () => {
        if (!selectedUser) return;
        try {
            const rolesToSend = selectedRoles;
            await api.put(`/admin/users/${selectedUser.id}/roles`, rolesToSend);
            toast.success('Roles updated successfully');
            setOpenRoleModal(false);
            fetchUsers();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update roles');
        }
    };

    const handleRoleChange = (event: SelectChangeEvent<typeof selectedRoles>) => {
        const {
            target: { value },
        } = event;
        setSelectedRoles(
            // On autofill we get a stringified value.
            typeof value === 'string' ? value.split(',') : value,
        );
    };


    return (
        <Box>
            <ToastContainer />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">User Management</Typography>
                <TextField
                    placeholder="Search users..."
                    size="small"
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>
                    }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
                />
            </Box>

            <Paper sx={{ width: '100%', mb: 2 }}>
                <TableContainer>
                    <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
                        <TableHead>
                            <TableRow>
                                <TableCell>User</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Roles</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Joined Date</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">No users found.</TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow hover key={user.id}>
                                        <TableCell component="th" scope="row">
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Avatar src={user.profilePicture} sx={{ mr: 2 }}>{user.username[0].toUpperCase()}</Avatar>
                                                <Box>
                                                    <Typography variant="subtitle2">{user.name} {user.surname}</Typography>
                                                    <Typography variant="caption" color="text.secondary">@{user.username}</Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            {user.roles.map((role) => (
                                                <Chip
                                                    key={role}
                                                    label={role.replace('ROLE_', '')}
                                                    size="small"
                                                    color={role.includes('ADMIN') ? 'primary' : 'default'}
                                                    sx={{ mr: 0.5 }}
                                                />
                                            ))}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={user.enabled ? 'Active' : 'Banned'}
                                                color={user.enabled ? 'success' : 'error'}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Edit Roles">
                                                <IconButton size="small" onClick={() => handleEditRoles(user)}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={user.enabled ? "Ban User" : "Activate User"}>
                                                <IconButton
                                                    size="small"
                                                    color={user.enabled ? 'warning' : 'success'}
                                                    onClick={() => handleToggleStatus(user.id, user.enabled)}
                                                >
                                                    {user.enabled ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDeleteUser(user.id)}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={totalUsers}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>

            {/* Roles Edit Modal */}
            <Dialog open={openRoleModal} onClose={() => setOpenRoleModal(false)}>
                <DialogTitle>Edit User Roles</DialogTitle>
                <DialogContent sx={{ minWidth: 300, pt: 2 }}>
                    <FormControl fullWidth sx={{ mt: 1 }}>
                        <InputLabel>Roles</InputLabel>
                        <Select
                            multiple
                            value={selectedRoles}
                            onChange={handleRoleChange}
                            input={<OutlinedInput label="Roles" />}
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((value) => (
                                        <Chip key={value} label={value.replace('ROLE_', '')} size="small" />
                                    ))}
                                </Box>
                            )}
                        >
                            <MenuItem value="ROLE_USER">USER</MenuItem>
                            <MenuItem value="ROLE_ADMIN">ADMIN</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenRoleModal(false)}>Cancel</Button>
                    <Button onClick={handleSaveRoles} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UsersPage;
