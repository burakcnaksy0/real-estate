import { useState, useCallback } from 'react';
import { WorkplaceService } from '../services/workplaceService';
import { WorkplaceCreateRequest } from '../types';

export const useWorkplaces = () => {
    const [isLoading, setIsLoading] = useState(false);

    const update = useCallback(
        async (id: number, data: WorkplaceCreateRequest) => {
            setIsLoading(true);
            try {
                const result = await WorkplaceService.update(id, data);
                return result;
            } catch (error) {
                console.error('Error updating workplace:', error);
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
                await WorkplaceService.delete(id);
            } catch (error) {
                console.error('Error deleting workplace:', error);
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
