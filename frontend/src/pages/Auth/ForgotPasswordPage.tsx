import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { AuthService } from '../../services/authService';
import { toast } from 'react-toastify';

interface ForgotPasswordForm {
    email: string;
}

export const ForgotPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordForm>();

    const onSubmit = async (data: ForgotPasswordForm) => {
        try {
            await AuthService.forgotPassword({ email: data.email });
            toast.success('Doğrulama kodu e-posta adresinize gönderildi. (Geliştirme ortamında Backend loglarına bakın)');
            navigate('/reset-password', { state: { email: data.email } });
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'İşlem başarısız oldu.');
        }
    };

    return (
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-8 h-8 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Şifremi Unuttum</h2>
                    <p className="text-gray-500 mt-2">
                        Hesabınıza ait e-posta adresini girin, size şifrenizi sıfırlamanız için bir kod gönderelim.
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            E-posta Adresi
                        </label>
                        <input
                            {...register('email', {
                                required: 'E-posta adresi gereklidir',
                                pattern: { value: /^\S+@\S+$/i, message: 'Geçerli bir e-posta adresi girin' }
                            })}
                            type="email"
                            className={`w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100 transition-all ${errors.email ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                            placeholder="ornek@email.com"
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 text-white rounded-lg py-3 font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Gönderiliyor...' : <><Send className="w-4 h-4" /> Kod Gönder</>}
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
