import { useState, useCallback } from 'react';
import { LandService } from '../services/landService';
import { LandCreateRequest } from '../types';

export const useLands = () => {
    const [isLoading, setIsLoading] = useState(false);

    const update = useCallback(
        async (id: number, data: LandCreateRequest) => {
            setIsLoading(true);
            try {
                const result = await LandService.update(id, data);
                return result;
            } catch (error) {
                console.error('Error updating land:', error);
                throw error;
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    const remove = useCallback(
        async (id: number) => {
            setIsLoading(true);
            try {
                await LandService.delete(id);
            } catch (error) {
                console.error('Error deleting land:', error);
                throw error;
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    return {
        isLoading,
        update,
        remove,
    };
};
