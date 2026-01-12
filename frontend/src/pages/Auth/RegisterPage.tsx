import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Eye, EyeOff, UserPlus, Upload, Check, Sparkles } from 'lucide-react';
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
    if (!pwd) return { strength: 0, label: '', color: '' };
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-2xl w-full relative">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="p-8 sm:p-12">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="mx-auto mb-6 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur-lg opacity-50"></div>
                  <img
                    src="/vesta-logo.png"
                    alt="Vesta Logo"
                    className="h-20 w-auto relative z-10"
                  />
                </div>
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Aramıza Katıl
              </h2>
              <p className="text-gray-600 flex items-center justify-center gap-1">
                Zaten hesabın var mı?
                <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold inline-flex items-center gap-1 group">
                  Giriş Yap
                  <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </Link>
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg animate-shake">
                  <p className="font-medium">{error}</p>
                </div>
              )}

              {/* Profile Picture Upload */}
              <div className="flex justify-center">
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
                  <label
                    htmlFor="profilePicture"
                    className="cursor-pointer block"
                  >
                    <div className="w-32 h-32 rounded-full border-4 border-dashed border-indigo-300 hover:border-indigo-500 transition-all duration-300 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 group-hover:scale-105 overflow-hidden">
                      {previewImage ? (
                        <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center">
                          <Upload className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                          <span className="text-xs text-gray-600">Fotoğraf Ekle</span>
                        </div>
                      )}
                    </div>
                  </label>
                  {errors.profilePicture && (
                    <p className="mt-2 text-sm text-red-600 text-center">{errors.profilePicture.message}</p>
                  )}
                </div>
              </div>

              {/* Name & Surname */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                    Ad <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('name')}
                    type="text"
                    id="name"
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none ${errors.name
                        ? 'border-red-300 focus:border-red-500 bg-red-50'
                        : 'border-gray-200 focus:border-indigo-500 bg-white/50'
                      }`}
                    placeholder="Adınız"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <span className="inline-block w-1 h-1 rounded-full bg-red-600"></span>
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="surname" className="block text-sm font-semibold text-gray-700">
                    Soyad <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('surname')}
                    type="text"
                    id="surname"
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none ${errors.surname
                        ? 'border-red-300 focus:border-red-500 bg-red-50'
                        : 'border-gray-200 focus:border-indigo-500 bg-white/50'
                      }`}
                    placeholder="Soyadınız"
                  />
                  {errors.surname && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <span className="inline-block w-1 h-1 rounded-full bg-red-600"></span>
                      {errors.surname.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Username & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="username" className="block text-sm font-semibold text-gray-700">
                    Kullanıcı Adı <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('username')}
                    type="text"
                    id="username"
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none ${errors.username
                        ? 'border-red-300 focus:border-red-500 bg-red-50'
                        : 'border-gray-200 focus:border-indigo-500 bg-white/50'
                      }`}
                    placeholder="kullanici_adi"
                  />
                  {errors.username && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <span className="inline-block w-1 h-1 rounded-full bg-red-600"></span>
                      {errors.username.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                    E-posta <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    id="email"
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none ${errors.email
                        ? 'border-red-300 focus:border-red-500 bg-red-50'
                        : 'border-gray-200 focus:border-indigo-500 bg-white/50'
                      }`}
                    placeholder="ornek@email.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <span className="inline-block w-1 h-1 rounded-full bg-red-600"></span>
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label htmlFor="phoneNumber" className="block text-sm font-semibold text-gray-700">
                  Telefon Numarası
                </label>
                <input
                  {...register('phoneNumber')}
                  type="tel"
                  id="phoneNumber"
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none ${errors.phoneNumber
                      ? 'border-red-300 focus:border-red-500 bg-red-50'
                      : 'border-gray-200 focus:border-indigo-500 bg-white/50'
                    }`}
                  placeholder="0555 123 45 67"
                />
                {errors.phoneNumber && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-red-600"></span>
                    {errors.phoneNumber.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Şifre <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none pr-12 ${errors.password
                        ? 'border-red-300 focus:border-red-500 bg-red-50'
                        : 'border-gray-200 focus:border-indigo-500 bg-white/50'
                      }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {password && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${passwordStrength.color} transition-all duration-300`}
                          style={{ width: `${passwordStrength.strength}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-semibold text-gray-600">{passwordStrength.label}</span>
                    </div>
                  </div>
                )}
                {errors.password && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-red-600"></span>
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700">
                  Şifre Tekrarı <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    {...register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none pr-12 ${errors.confirmPassword
                        ? 'border-red-300 focus:border-red-500 bg-red-50'
                        : 'border-gray-200 focus:border-indigo-500 bg-white/50'
                      }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-red-600"></span>
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Terms & Conditions */}
              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="mt-1 h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="terms" className="text-sm text-gray-700 leading-relaxed cursor-pointer">
                  <a href="#" className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline">
                    Kullanım şartlarını
                  </a>
                  {' '}ve{' '}
                  <a href="#" className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline">
                    gizlilik politikasını
                  </a>
                  {' '}okudum ve kabul ediyorum
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] group"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent"></div>
                    <span>Kayıt Oluşturuluyor...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-6 w-6 group-hover:scale-110 transition-transform" />
                    <span>Hesap Oluştur</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-sm text-gray-600">
          Güvenli ve hızlı kayıt işlemi
        </p>
      </div>
    </div>
  );
};