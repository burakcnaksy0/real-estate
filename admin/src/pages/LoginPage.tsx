import React, { useState } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Alert,
    InputAdornment,
    IconButton,
    Paper,
    useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
    Visibility,
    VisibilityOff,
    PersonOutline as PersonIcon,
    LockOutlined as LockIcon,
    ArrowBack as ArrowBackIcon,
    AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const theme = useTheme();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login({ username, password });
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box sx={{
            display: 'flex',
            minHeight: '100vh',
            bgcolor: 'background.default',
            overflow: 'hidden'
        }}>
            {/* Left Side - Image Section */}
            <Box sx={{
                flex: 1,
                display: { xs: 'none', md: 'flex' },
                position: 'relative',
                backgroundImage: 'url("https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                flexDirection: 'column',
                justifyContent: 'space-between',
                p: 6,
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.7)', // Dark blue overlay
                    backdropFilter: 'blur(2px)'
                }
            }}>
                <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                        width: 48,
                        height: 48,
                        bgcolor: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid rgba(255,255,255,0.2)'
                    }}>
                        <AdminIcon sx={{ color: 'white', fontSize: 28 }} />
                    </Box>
                    <Typography variant="h5" color="white" fontWeight="700">
                        Vesta Admin
                    </Typography>
                </Box>

                <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 480 }}>
                    <Typography variant="h3" color="white" fontWeight="bold" gutterBottom sx={{ lineHeight: 1.2 }}>
                        Yönetim Paneline Hoş Geldiniz
                    </Typography>
                    <Typography variant="h6" color="rgba(255,255,255,0.8)" fontWeight="normal" sx={{ mt: 2, lineHeight: 1.6 }}>
                        Emlak, araç ve ilan yönetim süreçlerini tek bir yerden verimli bir şekilde yönetin.
                    </Typography>
                </Box>

                <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography variant="caption" color="rgba(255,255,255,0.5)">
                        © {new Date().getFullYear()} Vesta Inc. Admin Dashboard v1.0
                    </Typography>
                </Box>
            </Box>

            {/* Right Side - Login Form */}
            <Box sx={{
                flex: { xs: 1, md: 0 },
                minWidth: { md: '500px', lg: '600px' },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                p: { xs: 3, sm: 6 },
                bgcolor: 'white'
            }}>
                <Box sx={{ width: '100%', maxWidth: 400 }}>
                    <Box sx={{ mb: 5, textAlign: 'center' }}>
                        <Typography variant="h4" component="h1" fontWeight="800" color="text.primary" gutterBottom>
                            Giriş Yap
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Devam etmek için yönetici bilgilerinizi girin
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} variant="filled">
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <TextField
                            fullWidth
                            label="Kullanıcı Adı"
                            variant="outlined"
                            autoComplete="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PersonIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    bgcolor: 'grey.50'
                                }
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Şifre"
                            type={showPassword ? 'text' : 'password'}
                            variant="outlined"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockIcon color="action" />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    bgcolor: 'grey.50'
                                }
                            }}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={isLoading}
                            sx={{
                                py: 1.5,
                                fontSize: '1rem',
                                fontWeight: 600,
                                textTransform: 'none',
                                borderRadius: 2,
                                boxShadow: 2,
                                bgcolor: theme.palette.primary.main,
                                '&:hover': {
                                    bgcolor: theme.palette.primary.dark,
                                    transform: 'translateY(-1px)',
                                    boxShadow: 4
                                },
                                transition: 'all 0.2s'
                            }}
                        >
                            {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                        </Button>
                    </Box>

                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                        <Button
                            startIcon={<ArrowBackIcon />}
                            onClick={() => window.location.href = 'http://localhost:3000/login'}
                            sx={{
                                textTransform: 'none',
                                color: 'text.secondary',
                                borderRadius: 2,
                                px: 2,
                                '&:hover': {
                                    bgcolor: 'grey.100',
                                    color: 'text.primary'
                                }
                            }}
                        >
                            Ana Uygulamaya Dön
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default LoginPage;
