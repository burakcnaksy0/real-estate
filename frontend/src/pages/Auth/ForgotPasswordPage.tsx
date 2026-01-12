import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { AuthService } from '../../services/authService';
import { toast } from 'react-toastify';

interface ForgotPasswordForm {
    email?: string;
    phoneNumber?: string;
    method: 'EMAIL' | 'SMS';
}

export const ForgotPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<ForgotPasswordForm>({
        defaultValues: { method: 'EMAIL' }
    });

    const method = watch('method');

    const onSubmit = async (data: ForgotPasswordForm) => {
        try {
            await AuthService.forgotPassword({
                email: data.email,
                phoneNumber: data.phoneNumber,
                method: data.method
            });

            const message = data.method === 'SMS'
                ? 'Doğrulama kodu telefonunuza gönderildi.'
                : 'Doğrulama kodu e-posta adresinize gönderildi.';

            toast.success(`${message} (Geliştirme ortamında Backend loglarına bakın)`);
            navigate('/reset-password', { state: { email: data.email || data.phoneNumber } }); // Pass either identifier
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
                        Doğrulama yönteminizi seçin ve bilgilerinizi girin.
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Method Selection */}
                    <div className="grid grid-cols-2 gap-4">
                        <label className={`
                            relative flex flex-col items-center p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-all
                            ${method === 'EMAIL' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                        `}>
                            <input
                                {...register('method')}
                                type="radio"
                                value="EMAIL"
                                className="peer sr-only"
                            />
                            <Mail className="w-6 h-6 mb-2 text-gray-600 peer-checked:text-blue-600" />
                            <span className="text-sm font-medium text-gray-900">E-posta</span>
                            <div className="absolute inset-0 border-2 border-transparent peer-checked:border-blue-500 rounded-xl pointer-events-none"></div>
                        </label>

                        <label className={`
                            relative flex flex-col items-center p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-all
                            ${method === 'SMS' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                        `}>
                            <input
                                {...register('method')}
                                type="radio"
                                value="SMS"
                                className="peer sr-only"
                            />
                            <div className="w-6 h-6 mb-2 flex items-center justify-center">
                                {/* Simple Phone Icon */}
                                <svg className="w-6 h-6 text-gray-600 peer-checked:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <span className="text-sm font-medium text-gray-900">SMS</span>
                            <div className="absolute inset-0 border-2 border-transparent peer-checked:border-blue-500 rounded-xl pointer-events-none"></div>
                        </label>
                    </div>

                    {method === 'EMAIL' && (
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                E-posta Adresi
                            </label>
                            <input
                                {...register('email', {
                                    required: method === 'EMAIL' ? 'E-posta adresi gereklidir' : false,
                                    pattern: { value: /^\S+@\S+$/i, message: 'Geçerli bir e-posta adresi girin' }
                                })}
                                type="email"
                                className={`w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100 transition-all ${errors.email ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                                placeholder="ornek@email.com"
                            />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                        </div>
                    )}

                    {method === 'SMS' && (
                        <div>
                            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                Telefon Numarası
                            </label>
                            <input
                                {...register('phoneNumber', {
                                    required: method === 'SMS' ? 'Telefon numarası gereklidir' : false,
                                    pattern: { value: /^[0-9]+$/, message: 'Sadece rakam giriniz' },
                                    minLength: { value: 10, message: 'En az 10 hane olmalıdır' }
                                })}
                                type="tel"
                                className={`w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100 transition-all ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                                placeholder="5XXXXXXXXX"
                            />
                            {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>}
                        </div>
                    )}

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
