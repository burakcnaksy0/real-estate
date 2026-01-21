import React from 'react';
import { ComparisonResponse } from '../types';
import { getImageUrl } from '../utils/imageUtils';
import './ComparisonTable.css';

interface ComparisonTableProps {
    data: ComparisonResponse;
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({ data }) => {
    const listingIds = Object.keys(data.listings);

    return (
        <div className="comparison-table-wrapper">
            <div className="comparison-table-scroll">
                <table className="comparison-table">
                    <thead>
                        <tr>
                            <th className="field-name-header">Özellik</th>
                            {listingIds.map((id) => {
                                const listing = data.listings[id];
                                return (
                                    <th key={id} className="listing-header">
                                        <div className="listing-header-content">
                                            {listing.imageUrl && (
                                                <div className="listing-header-image">
                                                    <img
                                                        src={getImageUrl(listing.imageUrl) || ''}
                                                        alt={listing.title}
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            <h3 className="listing-title">{listing.title}</h3>
                                            <p className="listing-price">{listing.price}</p>
                                            <p className="listing-location">
                                                {listing.city}, {listing.district}
                                            </p>
                                        </div>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {data.fields.map((field, index) => (
                            <tr key={index} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                                <td className="field-name">{field.fieldName}</td>
                                {listingIds.map((id) => (
                                    <td key={id} className="field-value">
                                        {field.values[id] || '—'}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ComparisonTable;
