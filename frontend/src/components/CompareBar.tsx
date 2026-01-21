import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { removeListing, clearComparison } from '../store/slices/comparisonSlice';
import './CompareBar.css';

const CompareBar: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { selectedListings } = useSelector((state: RootState) => state.comparison);

    if (selectedListings.length === 0) {
        return null;
    }

    const handleCompare = () => {
        navigate('/compare');
    };

    const handleRemove = (id: number) => {
        dispatch(removeListing(id));
    };

    const handleClearAll = () => {
        dispatch(clearComparison());
    };

    return (
        <div className="compare-bar">
            <div className="compare-bar-content">
                <div className="compare-bar-left">
                    <h3 className="compare-bar-title">
                        Karşılaştırma ({selectedListings.length})
                    </h3>
                    <div className="compare-bar-items">
                        {selectedListings.map((id) => (
                            <div key={id} className="compare-bar-item">
                                <span>İlan #{id}</span>
                                <button
                                    className="compare-bar-remove"
                                    onClick={() => handleRemove(id)}
                                    aria-label="Kaldır"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="compare-bar-actions">
                    <button
                        className="compare-bar-clear"
                        onClick={handleClearAll}
                    >
                        Temizle
                    </button>
                    <button
                        className="compare-bar-button"
                        onClick={handleCompare}
                        disabled={selectedListings.length < 2}
                    >
                        Karşılaştır
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CompareBar;
