import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema) as any,
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const { confirmPassword, profilePicture, ...registerData } = data;

      const file = profilePicture && profilePicture.length > 0 ? profilePicture[0] : undefined;

      // @ts-ignore
      await registerUser({ ...registerData, profilePicture: file });

      // Kayıt başarılı olduktan sonra login sayfasına yönlendir
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
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* Logo and Header... */}
          <div className="mx-auto mb-6 flex justify-center">
            <img
              src="/vesta-logo.png"
              alt="Vesta Logo"
              className="h-20 w-auto"
            />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Kayıt Ol</h2>
          <p className="mt-2 text-gray-600">
            Yeni hesap oluşturun veya{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              mevcut hesabınızla giriş yapın
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-4">

            {/* Profile Picture Upload */}
            <div>
              <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700 mb-1">
                Profil Fotoğrafı
              </label>
              <input
                {...register('profilePicture')}
                type="file"
                id="profilePicture"
                accept="image/*"
                className={`input-field ${errors.profilePicture ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              <p className="mt-1 text-xs text-gray-500">İsteğe bağlı. JPG, PNG (Max 5MB)</p>
              {errors.profilePicture && (
                <p className="mt-1 text-sm text-red-600">{errors.profilePicture.message}</p>
              )}
            </div>

            {/* Name & Surname */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Ad *
                </label>
                <input
                  {...register('name')}
                  type="text"
                  id="name"
                  className={`input-field ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Adınız"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="surname" className="block text-sm font-medium text-gray-700 mb-1">
                  Soyad *
                </label>
                <input
                  {...register('surname')}
                  type="text"
                  id="surname"
                  className={`input-field ${errors.surname ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Soyadınız"
                />
                {errors.surname && (
                  <p className="mt-1 text-sm text-red-600">{errors.surname.message}</p>
                )}
              </div>
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Kullanıcı Adı *
              </label>
              <input
                {...register('username')}
                type="text"
                id="username"
                className={`input-field ${errors.username ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Kullanıcı adınız"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-posta *
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                className={`input-field ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="ornek@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Telefon Numarası
              </label>
              <input
                {...register('phoneNumber')}
                type="tel"
                id="phoneNumber"
                className={`input-field ${errors.phoneNumber ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="0555 123 45 67"
              />
              {errors.phoneNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Şifre *
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className={`input-field pr-10 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="En az 6 karakter"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Şifre Tekrarı *
              </label>
              <div className="relative">
                <input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  className={`input-field pr-10 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Şifrenizi tekrar girin"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
              <a href="#" className="text-primary-600 hover:text-primary-700">
                Kullanım şartlarını
              </a>{' '}
              ve{' '}
              <a href="#" className="text-primary-600 hover:text-primary-700">
                gizlilik politikasını
              </a>{' '}
              kabul ediyorum
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Kayıt oluşturuluyor...</span>
              </>
            ) : (
              <>
                <UserPlus className="h-5 w-5" />
                <span>Kayıt Ol</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};