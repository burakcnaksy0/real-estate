import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Eye, EyeOff, LogIn, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { LoginRequest } from '../../types';

// Validation schema
const loginSchema = yup.object({
  username: yup
    .string()
    .required('Kullanıcı adı veya e-posta gereklidir')
    .min(3, 'Kullanıcı adı veya e-posta en az 3 karakter olmalıdır'),
  password: yup
    .string()
    .required('Şifre gereklidir')
    .min(6, 'Şifre en az 6 karakter olmalıdır'),
});

export const LoginPage: React.FC = () => {
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/';
  const successMessage = (location.state as any)?.message;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: yupResolver(loginSchema) as any,
  });

  const onSubmit = async (data: LoginRequest) => {
    try {
      await login(data);
      navigate(from, { replace: true });
    } catch (error) {
      // Error handling is done in the auth slice
    }
  };

  const handleGoogleLogin = () => {
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';
    window.location.href = `${apiBaseUrl.replace('/api', '')}/oauth2/authorization/google`;
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Image Section (Desktop Only) */}
      <div className="hidden lg:flex w-1/2 bg-cover bg-center relative"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1600596542815-60c37cabc38d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80")' }}>
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/80 to-purple-900/40 mix-blend-multiply" />
        <div className="relative z-10 w-full flex flex-col justify-center px-12 xl:px-24 text-white">
          <div className="mb-8">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-lg rounded-2xl flex items-center justify-center border border-white/20 mb-6">
              <img src="/vesta-logo.png" alt="Vesta" className="w-10 h-10 object-contain" />
            </div>
            <h1 className="text-5xl font-bold leading-tight mb-6">
              Hayalindeki Eve<br />
              <span className="text-blue-300">Hoş Geldin.</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-lg leading-relaxed">
              Vesta ile binlerce premium ilanı keşfet, favorile ve hayallerini gerçeğe dönüştür. Güvenli ve hızlı emlak deneyimi.
            </p>
          </div>
          <div className="flex gap-4 mt-8">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <img key={i} className="w-10 h-10 rounded-full border-2 border-blue-900" src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
              ))}
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-bold text-white">10k+</span>
              <span className="text-xs text-blue-200">Mutlu Müşteri</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 xl:p-24 bg-gray-50/50">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Tekrar Hoş Geldin 👋</h2>
            <p className="text-gray-500">
              Hesabınıza giriş yapın veya{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                yeni bir hesap oluşturun
              </Link>
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Success/Error Messages */}
            {successMessage && (
              <div className="p-4 rounded-xl bg-green-50 text-green-700 text-sm font-medium border border-green-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                {successMessage}
              </div>
            )}
            {error && (
              <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm font-medium border border-red-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 ml-1">Kullanıcı Adı veya E-posta</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    {...register('username')}
                    type="text"
                    className={`w-full bg-white pl-12 pr-4 py-3.5 rounded-xl border-2 outline-none transition-all duration-200 ${errors.username
                        ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                        : 'border-gray-100 hover:border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
                      }`}
                    placeholder="ornek@email.com"
                  />
                </div>
                {errors.username && <p className="text-xs text-red-500 font-medium ml-1">{errors.username.message}</p>}
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-semibold text-gray-700">Şifre</label>
                  <Link to="/forgot-password" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                    Şifremi unuttum?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    className={`w-full bg-white pl-12 pr-12 py-3.5 rounded-xl border-2 outline-none transition-all duration-200 ${errors.password
                        ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                        : 'border-gray-100 hover:border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
                      }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 font-medium ml-1">{errors.password.message}</p>}
              </div>
            </div>

            <div className="flex items-center">
              <label className="flex items-center cursor-pointer select-none group">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <div className="w-5 h-5 border-2 border-gray-300 rounded peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors"></div>
                  <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <span className="ml-2.5 text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">Beni hatırla</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Giriş Yap
                </>
              )}
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-medium">veya</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex items-center justify-center gap-2.5 py-3 px-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.98]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="text-sm font-semibold text-gray-700">Google</span>
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2.5 py-3 px-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.98]"
              >
                <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="text-sm font-semibold text-gray-700">Facebook</span>
              </button>
            </div>

            <div className="pt-6 text-center">
              <a
                href="http://localhost:5174/login"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin Girişi
              </a>
            </div>
          </form>

          <p className="text-center mt-12 text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Vesta Inc. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </div>
  );
};