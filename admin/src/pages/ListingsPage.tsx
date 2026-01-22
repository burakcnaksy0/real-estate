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
    Button,
    Card,
    Stack,
    FormControl,
    Select,
    MenuItem,
    InputLabel,
    useTheme,
    alpha
} from '@mui/material';
import {
    Search as SearchIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
    FilterList as FilterListIcon,
    Download as DownloadIcon,
    Image as ImageIcon
} from '@mui/icons-material';
import api from '../services/api';
import { toast, ToastContainer } from 'react-toastify';

interface Listing {
    id: number;
    title: string;
    price: number;
    description: string;
    categorySlug: string;
    listingType: string;
    status: string; // ACTIVE, PASSIVE, SOLD
    createdAt: string;
    imageUrls: string[];
    imageUrl?: string; // Sometimes comes as imageUrl
    city: string;
    district: string;
    currency: string;
}

interface PageResponse {
    content: Listing[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

const ListingsPage: React.FC = () => {
    const theme = useTheme();
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalListings, setTotalListings] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('ALL');

    const fetchListings = async () => {
        setLoading(true);
        try {
            // Construct query
            let url = `/listings/page?page=${page}&size=${rowsPerPage}`;
            if (categoryFilter !== 'ALL') {
                // Backend might not support category filter on this generic endpoint perfectly yet, 
                // but let's assume we can pass it or handled in backend.
                // For now, fetching all (backend handles pagination).
                // If we want filtering, backend needs ?categorySlug=... support.
                // Assuming it might exist:
                // url += `&categorySlug=${categoryFilter}`;
            }

            const response = await api.get<PageResponse>(url);
            setListings(response.data.content);
            setTotalListings(response.data.totalElements);
        } catch (error) {
            console.error('Error fetching listings:', error);
            toast.error('İlanlar yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchListings();
    }, [page, rowsPerPage, categoryFilter]);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleDeleteListing = async (listing: Listing) => {
        if (window.confirm(`#${listing.id} ID'li ilanı silmek istediğinize emin misiniz?`)) {
            try {
                // Try specific endpoint based on category or generic
                // Assuming generic for now or specific per type logic
                let endpoint = `/listings/${listing.id}`;
                // If backend requires specific:
                // if(listing.categorySlug === 'emlak') endpoint = `/real-estates/${listing.id}`;
                // etc.

                await api.delete(endpoint);
                toast.success('İlan başarıyla silindi');
                fetchListings();
            } catch (error) {
                console.error('Delete error', error);
                toast.error('İlan silinemedi. Yetkiniz olmayabilir veya endpoint eksik.');
            }
        }
    };

    const getCategoryLabel = (slug: string) => {
        switch (slug) {
            case 'emlak': return { label: 'Emlak', color: 'primary' };
            case 'arac': return { label: 'Vasıta', color: 'secondary' };
            case 'arsa': return { label: 'Arsa', color: 'success' };
            case 'isyeri': return { label: 'İşyeri', color: 'warning' };
            default: return { label: slug, color: 'default' };
        }
    };

    const getStatusProps = (status: string) => {
        switch (status) {
            case 'ACTIVE': return { label: 'Aktif', color: 'success' as const, bgcolor: alpha(theme.palette.success.main, 0.1) };
            case 'PASSIVE': return { label: 'Pasif', color: 'default' as const, bgcolor: alpha(theme.palette.text.disabled, 0.1) };
            case 'SOLD': return { label: 'Satıldı', color: 'error' as const, bgcolor: alpha(theme.palette.error.main, 0.1) };
            default: return { label: status || 'Bilinmiyor', color: 'default' as const, bgcolor: 'transparent' };
        }
    };

    const formatPrice = (price: number, currency: string) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: currency || 'TRY',
            maximumFractionDigits: 0
        }).format(price);
    };

    const getImageUrl = (listing: Listing) => {
        let url = listing.imageUrl || (listing.imageUrls && listing.imageUrls.length > 0 ? listing.imageUrls[0] : null);
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `http://localhost:8080${url}`;
    };

    return (
        <Box sx={{ p: 3 }}>
            <ToastContainer />

            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" color="text.primary">
                        İlan Yönetimi
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                        Sistemdeki tüm ilanları buradan yönetebilirsiniz.
                    </Typography>
                </Box>
                {/* <Button 
                    variant="contained" 
                    startIcon={<DownloadIcon />}
                    sx={{ borderRadius: 2, textTransform: 'none' }}
                >
                    Excel'e Aktar
                </Button> */}
            </Box>

            {/* Filters */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    mb: 3,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    gap: 2,
                    flexWrap: 'wrap',
                    alignItems: 'center'
                }}
            >
                <TextField
                    placeholder="İlan başlığı, ID veya kullanıcı ara..."
                    size="small"
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" color="action" /></InputAdornment>
                    }}
                    sx={{ width: { xs: '100%', md: 300 } }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Kategori</InputLabel>
                    <Select
                        value={categoryFilter}
                        label="Kategori"
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <MenuItem value="ALL">Tümü</MenuItem>
                        <MenuItem value="emlak">Emlak</MenuItem>
                        <MenuItem value="arac">Vasıta</MenuItem>
                        <MenuItem value="arsa">Arsa</MenuItem>
                        <MenuItem value="isyeri">İşyeri</MenuItem>
                    </Select>
                </FormControl>

                <Box sx={{ flexGrow: 1 }} />

                <Tooltip title="Filtrele">
                    <IconButton>
                        <FilterListIcon />
                    </IconButton>
                </Tooltip>
            </Paper>

            {/* Listings Table */}
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <TableContainer>
                    <Table sx={{ minWidth: 800 }}>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'grey.50' }}>
                                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Görsel</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>İlan Bilgileri</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Kategori</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Fiyat</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Konum</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Durum</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>İşlemler</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : listings.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                                        <Typography color="text.secondary">Kriterlere uygun ilan bulunamadı.</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                listings.map((listing) => {
                                    const category = getCategoryLabel(listing.categorySlug);
                                    const status = getStatusProps(listing.status);
                                    const imgUrl = getImageUrl(listing);

                                    return (
                                        <TableRow
                                            hover
                                            key={listing.id}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <TableCell>
                                                <Avatar
                                                    variant="rounded"
                                                    src={imgUrl || undefined}
                                                    sx={{
                                                        width: 64,
                                                        height: 64,
                                                        bgcolor: 'grey.100',
                                                        border: '1px solid',
                                                        borderColor: 'divider'
                                                    }}
                                                >
                                                    <ImageIcon color="action" />
                                                </Avatar>
                                            </TableCell>
                                            <TableCell>
                                                <Box>
                                                    <Typography variant="subtitle2" fontWeight="bold" noWrap sx={{ maxWidth: 200 }}>
                                                        {listing.title}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary" display="block">
                                                        ID: #{listing.id}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary" display="block">
                                                        {new Date(listing.createdAt).toLocaleDateString('tr-TR')}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                {/* @ts-ignore */}
                                                <Chip
                                                    label={category.label}
                                                    size="small"
                                                    // @ts-ignore
                                                    color={category.color}
                                                    variant="outlined"
                                                    sx={{ fontWeight: 500 }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="subtitle2" fontWeight="bold" color={theme.palette.primary.main}>
                                                    {formatPrice(listing.price, listing.currency)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {listing.city}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {listing.district}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={status.label}
                                                    size="small"
                                                    color={status.color}
                                                    sx={{
                                                        bgcolor: status.bgcolor,
                                                        color: theme.palette[status.color === 'default' ? 'text' : status.color].main,
                                                        fontWeight: 'bold',
                                                        border: 'none',
                                                        '& .MuiChip-label': { px: 1.5 }
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                    <Tooltip title="Detayları Gör">
                                                        <IconButton size="small" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) } }}>
                                                            <VisibilityIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Sil">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleDeleteListing(listing)}
                                                            sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.main', '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.2) } }}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={totalListings}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Sayfa başına satır:"
                />
            </Card>
        </Box>
    );
};

export default ListingsPage;
