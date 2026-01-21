import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { clearComparison } from '../store/slices/comparisonSlice';
import comparisonService from '../services/comparisonService';
import ComparisonTable from '../components/ComparisonTable';
import { ComparisonResponse } from '../types';
import { toast } from 'react-toastify';
import { ArrowLeft, Printer, Trash2 } from 'lucide-react';
import './ComparePage.css';

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
            <div className="compare-page">
                <div className="compare-container">
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Karşılaştırma hazırlanıyor...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !comparisonData) {
        return (
            <div className="compare-page">
                <div className="compare-container">
                    <div className="error-state">
                        <h2>Hata</h2>
                        <p>{error || 'Karşılaştırma verileri yüklenemedi'}</p>
                        <button onClick={handleBack} className="back-button">
                            Geri Dön
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="compare-page">
            <div className="compare-container">
                <div className="compare-header">
                    <div className="compare-header-left">
                        <button onClick={handleBack} className="back-button">
                            <ArrowLeft size={20} />
                            <span>Geri Dön</span>
                        </button>
                        <h1 className="compare-title">İlan Karşılaştırma</h1>
                    </div>
                    <div className="compare-header-actions">
                        <button onClick={handleClearAndBack} className="clear-button">
                            <Trash2 size={18} />
                            <span>Temizle ve Çık</span>
                        </button>
                        <button onClick={() => window.print()} className="print-button">
                            <Printer size={18} />
                            <span>Yazdır</span>
                        </button>
                    </div>
                </div>

                <ComparisonTable data={comparisonData} />

                <div className="compare-footer">
                    <p className="compare-footer-text">
                        {selectedListings.length} ilan karşılaştırılıyor
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ComparePage;
