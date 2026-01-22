import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { clearComparison } from '../store/slices/comparisonSlice';
import comparisonService from '../services/comparisonService';
import ComparisonTable from '../components/ComparisonTable';
import { ComparisonResponse } from '../types';
import { toast } from 'react-toastify';
import { ArrowLeft, Printer, Trash2, AlertCircle, GitCompare } from 'lucide-react';

const ComparePage: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { selectedListings } = useSelector((state: RootState) => state.comparison);
    const [comparisonData, setComparisonData] = useState<ComparisonResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (selectedListings.length < 2) {
            toast.error('Karşılaştırma için en az 2 ilan seçmelisiniz');
            navigate(-1);
            return;
        }

        const fetchComparison = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await comparisonService.compareListings(selectedListings);
                setComparisonData(data);
            } catch (err: any) {
                console.error('Comparison error:', err);
                const errorMessage = err.response?.data?.message || 'Karşılaştırma yapılırken bir hata oluştu';
                setError(errorMessage);
                toast.error(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchComparison();
    }, [selectedListings, navigate]);

    const handleBack = () => {
        navigate(-1);
    };

    const handleClearAndBack = () => {
        dispatch(clearComparison());
        navigate(-1);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Karşılaştırma hazırlanıyor...</p>
                </div>
            </div>
        );
    }

    if (error || !comparisonData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Bir Hata Oluştu</h2>
                    <p className="text-gray-500 mb-6">{error || 'Karşılaştırma verileri yüklenemedi'}</p>
                    <button
                        onClick={handleBack}
                        className="bg-gray-900 hover:bg-black text-white px-6 py-2 rounded-xl font-bold transition-colors"
                    >
                        Geri Dön
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 py-8 px-4 font-sans print:bg-white print:p-0">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden print:shadow-none print:border-none">
                    {/* Header */}
                    <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-white print:hidden">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <button
                                onClick={handleBack}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 hover:text-gray-900"
                                title="Geri Dön"
                            >
                                <ArrowLeft className="w-6 h-6" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <GitCompare className="w-6 h-6 text-blue-600" />
                                    İlan Karşılaştırma
                                </h1>
                                <p className="text-sm text-gray-500 mt-1">
                                    {selectedListings.length} ilan karşılaştırılıyor
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <button
                                onClick={handleClearAndBack}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors border border-transparent hover:border-red-100"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span className="text-sm">Temizle ve Çık</span>
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-gray-900 hover:bg-black text-white rounded-xl font-bold transition-colors shadow-lg shadow-gray-900/10"
                            >
                                <Printer className="w-4 h-4" />
                                <span>Yazdır</span>
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-0 md:p-8 overflow-x-auto print:p-0">
                        <div className="min-w-[800px]">
                            <ComparisonTable data={comparisonData} />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 p-4 text-center text-sm text-gray-400 border-t border-gray-100 print:hidden">
                        Karşılaştırma tablosu {new Date().toLocaleDateString('tr-TR')} tarihinde oluşturuldu.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComparePage;
