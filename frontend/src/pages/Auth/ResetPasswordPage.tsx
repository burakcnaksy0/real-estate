import React, { useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Lock, CheckCircle, ArrowLeft } from 'lucide-react';
import { AuthService } from '../../services/authService';
import { toast } from 'react-toastify';

interface ResetPasswordForm {
    code: string;
    newPassword: string;
    confirmPassword: string;
}

export const ResetPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const email = (location.state as any)?.email;

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetPasswordForm>();

    useEffect(() => {
        if (!email) {
            toast.error('E-posta bilgisi eksik. Lütfen baştan başlayın.');
            navigate('/forgot-password');
        }
    }, [email, navigate]);

    const onSubmit = async (data: ResetPasswordForm) => {
        if (data.newPassword !== data.confirmPassword) {
            toast.error('Şifreler eşleşmiyor.');
            return;
        }

        try {
            await AuthService.resetPassword({
                email,
                code: data.code,
                newPassword: data.newPassword
            });
            toast.success('Şifreniz başarıyla sıfırlandı. Giriş yapabilirsiniz.');
            navigate('/login');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Şifre sıfırlama başarısız.');
        }
    };

    if (!email) return null;

    return (
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Yeni Şifre Belirle</h2>
                    <p className="text-gray-500 mt-2">
                        E-posta adresinize ({email}) gönderilen kodu ve yeni şifrenizi girin.
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Doğrulama Kodu</label>
                        <input
                            {...register('code', { required: 'Kod gereklidir' })}
                            type="text"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-mono text-center tracking-widest text-lg"
                            placeholder="123456"
                            maxLength={6}
                        />
                        {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Yeni Şifre</label>
                        <input
                            {...register('newPassword', { required: 'Yeni şifre gereklidir', minLength: { value: 6, message: 'En az 6 karakter' } })}
                            type="password"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                            placeholder="Yeni şifreniz"
                        />
                        {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Yeni Şifre (Tekrar)</label>
                        <input
                            {...register('confirmPassword', { required: 'Tekrar girin' })}
                            type="password"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                            placeholder="Yeni şifreniz tekrar"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 text-white rounded-lg py-3 font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isSubmitting ? 'İşleniyor...' : <><CheckCircle className="w-4 h-4" /> Şifreyi Sıfırla</>}
                    </button>

                    <div className="text-center">
                        <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center gap-1">
                            <ArrowLeft className="w-4 h-4" /> Giriş sayfasına dön
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};
