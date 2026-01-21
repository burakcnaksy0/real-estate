import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import './CompareCheckbox.css';

interface CompareCheckboxProps {
    listingId: number;
    category: string;
    onToggle: () => void;
}

const CompareCheckbox: React.FC<CompareCheckboxProps> = ({ listingId, category, onToggle }) => {
    const { selectedListings, category: selectedCategory, maxSelections } = useSelector(
        (state: RootState) => state.comparison
    );

    const isSelected = selectedListings.includes(listingId);
    const isMaxReached = selectedListings.length >= maxSelections && !isSelected;
    const isDifferentCategory = selectedCategory !== null && selectedCategory !== category && !isSelected;
    const isDisabled = isMaxReached || isDifferentCategory;

    const getTooltip = () => {
        if (isDifferentCategory) {
            return 'Sadece aynı kategorideki ilanlar karşılaştırılabilir';
        }
        if (isMaxReached) {
            return `Maksimum ${maxSelections} ilan karşılaştırılabilir`;
        }
        return isSelected ? 'Karşılaştırmadan çıkar' : 'Karşılaştırmaya ekle';
    };

    return (
        <div className="compare-checkbox-wrapper" title={getTooltip()}>
            <label className={`compare-checkbox ${isDisabled ? 'disabled' : ''}`}>
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={onToggle}
                    disabled={isDisabled}
                />
                <span className="checkbox-label">Karşılaştır</span>
            </label>
        </div>
    );
};

export default CompareCheckbox;
