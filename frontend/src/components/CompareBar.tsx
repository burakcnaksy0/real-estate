import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { removeListing, clearComparison } from '../store/slices/comparisonSlice';
import { X, ArrowRight, Trash2, Layers } from 'lucide-react';

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
        <div className="fixed bottom-6 left-0 right-0 z-50 px-4 pointer-events-none">
            <div className="max-w-3xl mx-auto pointer-events-auto">
                <div className="bg-gray-900/90 backdrop-blur-xl text-white rounded-2xl p-4 shadow-2xl shadow-gray-900/50 flex items-center justify-between gap-4 border border-white/10 ring-1 ring-white/10 animate-in slide-in-from-bottom-6 duration-300">
                    <div className="flex items-center gap-4 flex-1 overflow-hidden">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg shrink-0">
                            <Layers className="w-4 h-4 text-emerald-400" />
                            <span className="font-bold text-sm tracking-wide">{selectedListings.length}</span>
                        </div>

                        <div className="flex gap-2 overflow-x-auto hide-scrollbar py-1">
                            {selectedListings.map((id) => (
                                <div
                                    key={id}
                                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg pl-3 pr-1 py-1 transition-colors shrink-0 group"
                                >
                                    <span className="text-xs font-medium text-gray-300 whitespace-nowrap">İlan #{id}</span>
                                    <button
                                        onClick={() => handleRemove(id)}
                                        className="p-1 text-gray-400 group-hover:text-red-400 group-hover:bg-red-400/10 rounded-md transition-all"
                                        aria-label="Kaldır"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 pl-4 border-l border-white/10">
                        <button
                            onClick={handleClearAll}
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                            title="Tümünü Temizle"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleCompare}
                            disabled={selectedListings.length < 2}
                            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-600 text-white px-5 py-2 rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-900/20 active:scale-[0.98]"
                        >
                            <span className="hidden sm:inline">Karşılaştır</span>
                            <span className="sm:hidden">Git</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompareBar;
