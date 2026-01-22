import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Eye, EyeOff, Mail, Lock, User, Phone, Upload, Check, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { RegisterRequest } from '../../types';

// Validation schema
const registerSchema = yup.object({
  name: yup
    .string()
    .required('Ad gereklidir')
    .min(2, 'Ad en az 2 karakter olmalıdır')
    .max(50, 'Ad 50 karakterden uzun olamaz')
    .matches(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/, 'Ad sadece harf içerebilir'),
  surname: yup
    .string()
    .required('Soyad gereklidir')
    .min(2, 'Soyad en az 2 karakter olmalıdır')
    .max(50, 'Soyad 50 karakterden uzun olamaz')
    .matches(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/, 'Soyad sadece harf içerebilir'),
  username: yup
    .string()
    .required('Kullanıcı adı gereklidir')
    .min(3, 'Kullanıcı adı en az 3 karakter olmalıdır')
    .max(50, 'Kullanıcı adı 50 karakterden uzun olamaz')
    .matches(/^[a-zA-Z0-9_]+$/, 'Kullanıcı adı sadece harf, rakam ve _ içerebilir'),
  email: yup
    .string()
    .required('E-posta gereklidir')
    .email('Geçerli bir e-posta adresi girin')
    .max(100, 'E-posta 100 karakterden uzun olamaz'),
  phoneNumber: yup
    .string()
    .matches(/^[0-9+\-\s()]*$/, 'Geçerli bir telefon numarası girin')
    .max(20, 'Telefon numarası 20 karakterden uzun olamaz'),
  password: yup
    .string()
    .required('Şifre gereklidir')
    .min(6, 'Şifre en az 6 karakter olmalıdır')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Şifre en az 1 küçük harf, 1 büyük harf ve 1 rakam içermelidir'),
  confirmPassword: yup
    .string()
    .required('Şifre tekrarı gereklidir')
    .oneOf([yup.ref('password')], 'Şifreler eşleşmiyor'),
  profilePicture: yup.mixed().test('fileSize', 'Dosya boyutu 5MB dan küçük olmalı', (value: any) => {
    if (!value || value.length === 0) return true;
    return value[0].size <= 5000000;
  })
});

type RegisterFormData = RegisterRequest & {
  confirmPassword: string;
  profilePicture?: FileList;
};

export const RegisterPage: React.FC = () => {
  const { register: registerUser, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema) as any,
  });

  const password = watch('password');

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { strength: 0, label: '', color: 'bg-gray-200' };
    let strength = 0;
    if (pwd.length >= 6) strength++;
    if (pwd.length >= 10) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[!@#$%^&*]/.test(pwd)) strength++;

    if (strength <= 2) return { strength: 33, label: 'Zayıf', color: 'bg-red-500' };
    if (strength <= 3) return { strength: 66, label: 'Orta', color: 'bg-yellow-500' };
    return { strength: 100, label: 'Güçlü', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const { confirmPassword, profilePicture, ...registerData } = data;
      const file = profilePicture && profilePicture.length > 0 ? profilePicture[0] : undefined;

      // @ts-ignore
      await registerUser({ ...registerData, profilePicture: file });

      navigate('/login', {
        state: {
          message: 'Kayıt başarıyla tamamlandı! Şimdi giriş yapabilirsiniz.'
        }
      });
    } catch (error) {
      // Error handling is done in the auth slice
    }
  };

  return (
    <div className="min-h-screen flex bg-white h-screen overflow-hidden">
      {/* Left Side - Image & Copy */}
      <div className="hidden lg:flex w-1/2 bg-cover bg-center relative"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80")' }}>
        <div className="absolute inset-0 bg-blue-900/40 mix-blend-multiply transition-opacity duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <div className="relative z-10 w-full flex flex-col justify-end p-16 text-white pb-24">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 mb-8">
            <img src="/vesta-logo.png" alt="Vesta" className="w-10 h-10 object-contain drop-shadow-md" />
          </div>
          <h1 className="text-5xl font-bold leading-tight mb-6 tracking-tight">
            Yeni Başlangıçlar<br />
            <span className="text-blue-200">Burada Başlar.</span>
          </h1>
          <p className="text-xl text-blue-50 max-w-lg leading-relaxed font-light">
            Vesta ailesine katılın ve hayallerinizdeki eve ulaşmanın en güvenli yolunu keşfedin.
          </p>
        </div>
      </div>

      {/* Right Side - Scrollable Form */}
      <div className="w-full lg:w-1/2 h-full overflow-y-auto bg-gray-50/30">
        <div className="min-h-full flex items-center justify-center p-6 lg:p-12 xl:p-20">
          <div className="w-full max-w-md">
            <div className="text-center lg:text-left mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Hesap Oluştur 🚀</h2>
              <p className="text-gray-500">
                Zaten hesabın var mı?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                  Giriş yap
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm font-medium border border-red-100 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  {error}
                </div>
              )}

              {/* Profile Picture */}
              <div className="flex justify-center mb-6">
                <div className="relative group">
                  <input
                    {...register('profilePicture')}
                    type="file"
                    id="profilePicture"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      register('profilePicture').onChange(e);
                      handleImageChange(e);
                    }}
                  />
                  <label htmlFor="profilePicture" className="cursor-pointer block relative">
                    <div className="w-28 h-28 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 group-hover:ring-4 ring-blue-500/20 transition-all duration-300">
                      {previewImage ? (
                        <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                          <ImageIcon className="w-8 h-8 mb-1" />
                          <span className="text-[10px] font-medium uppercase tracking-wide">Fotoğraf</span>
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-md border-2 border-white hover:bg-blue-700 transition-colors">
                      <Upload className="w-4 h-4" />
                    </div>
                  </label>
                  {errors.profilePicture && (
                    <p className="mt-2 text-xs text-red-500 text-center">{errors.profilePicture.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Ad</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      {...register('name')}
                      type="text"
                      className={`w-full bg-white pl-10 pr-4 py-3 rounded-xl border outline-none transition-all duration-200 ${errors.name
                          ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                          : 'border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
                        }`}
                      placeholder="Adınız"
                    />
                  </div>
                  {errors.name && <p className="text-xs text-red-500 ml-1">{errors.name.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Soyad</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      {...register('surname')}
                      type="text"
                      className={`w-full bg-white pl-10 pr-4 py-3 rounded-xl border outline-none transition-all duration-200 ${errors.surname
                          ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                          : 'border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
                        }`}
                      placeholder="Soyadınız"
                    />
                  </div>
                  {errors.surname && <p className="text-xs text-red-500 ml-1">{errors.surname.message}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 ml-1">Kullanıcı Adı</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 font-medium transition-colors">@</span>
                  <input
                    {...register('username')}
                    type="text"
                    className={`w-full bg-white pl-10 pr-4 py-3 rounded-xl border outline-none transition-all duration-200 ${errors.username
                        ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                        : 'border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
                      }`}
                    placeholder="kullanici_adi"
                  />
                </div>
                {errors.username && <p className="text-xs text-red-500 ml-1">{errors.username.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 ml-1">E-posta</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    {...register('email')}
                    type="email"
                    className={`w-full bg-white pl-10 pr-4 py-3 rounded-xl border outline-none transition-all duration-200 ${errors.email
                        ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                        : 'border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
                      }`}
                    placeholder="ornek@email.com"
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500 ml-1">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 ml-1">Telefon</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    {...register('phoneNumber')}
                    type="tel"
                    className={`w-full bg-white pl-10 pr-4 py-3 rounded-xl border outline-none transition-all duration-200 ${errors.phoneNumber
                        ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                        : 'border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
                      }`}
                    placeholder="+90 (555) 000 0000"
                  />
                </div>
                {errors.phoneNumber && <p className="text-xs text-red-500 ml-1">{errors.phoneNumber.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Şifre</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      className={`w-full bg-white pl-10 pr-10 py-3 rounded-xl border outline-none transition-all duration-200 ${errors.password
                          ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                          : 'border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
                        }`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-500 ml-1">{errors.password.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Şifre Tekrar</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      {...register('confirmPassword')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      className={`w-full bg-white pl-10 pr-10 py-3 rounded-xl border outline-none transition-all duration-200 ${errors.confirmPassword
                          ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                          : 'border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
                        }`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-red-500 ml-1">{errors.confirmPassword.message}</p>}
                </div>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="space-y-2 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-gray-600">Şifre Gücü</span>
                    <span className={`text-xs font-bold ${passwordStrength.color.replace('bg-', 'text-')
                      }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${passwordStrength.strength}%` }}
                    ></div>
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-2">
                    <li className={`text-xs flex items-center gap-1.5 ${password.length >= 6 ? 'text-green-600' : 'text-gray-400'}`}>
                      <Check className="w-3 h-3" /> En az 6 karakter
                    </li>
                    <li className={`text-xs flex items-center gap-1.5 ${/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                      <Check className="w-3 h-3" /> Büyük harf
                    </li>
                    <li className={`text-xs flex items-center gap-1.5 ${/\d/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                      <Check className="w-3 h-3" /> Rakam
                    </li>
                    <li className={`text-xs flex items-center gap-1.5 ${/[!@#$%^&*]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                      <Check className="w-3 h-3" /> Özel karakter
                    </li>
                  </ul>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Kayıt Ol <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <div className="pt-6 relative text-center">
                <p className="text-xs text-gray-400 max-w-xs mx-auto">
                  Kayıt olarak <a href="#" className="underline hover:text-gray-600">Kullanım Koşulları</a>'nı ve <a href="#" className="underline hover:text-gray-600">Gizlilik Politikası</a>'nı kabul etmiş olursunuz.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};