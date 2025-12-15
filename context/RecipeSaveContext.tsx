import { createContext, useContext, ReactNode, useRef, useCallback, useState } from 'react';

type SaveUpdateCallback = (recipeId: string, delta: number) => void;

type RecipeSaveContextType = {
    savedDeltas: Map<string, number>;
    notifySaveUpdate: (recipeId: string, delta: number) => void;
    registerSaveUpdateCallback: (callback: SaveUpdateCallback) => void;
    unregisterSaveUpdateCallback: (callback: SaveUpdateCallback) => void;
    getSaveDelta: (recipeId: string) => number;
    clearSaveDelta: (recipeId: string) => void;
};

const RecipeSaveContext = createContext<RecipeSaveContextType | undefined>(undefined);

export const RecipeSaveProvider = ({ children }: { children: ReactNode }) => {
    const callbacksRef = useRef<Set<SaveUpdateCallback>>(new Set());
    // Store cumulative save deltas for each recipe
    const [savedDeltas, setSavedDeltas] = useState<Map<string, number>>(new Map());

    const registerSaveUpdateCallback = useCallback((callback: SaveUpdateCallback) => {
        callbacksRef.current.add(callback);
    }, []);

    const unregisterSaveUpdateCallback = useCallback((callback: SaveUpdateCallback) => {
        callbacksRef.current.delete(callback);
    }, []);

    // Notify all registered callbacks that a recipe was saved/unsaved
    const notifySaveUpdate = useCallback((recipeId: string, delta: number) => {
        // Store the save update
        setSavedDeltas(prev => {
            const newMap = new Map(prev);
            newMap.set(recipeId, (prev.get(recipeId) || 0) + delta);
            return newMap;
        });
        // Notify active callbacks
        callbacksRef.current.forEach(cb => cb(recipeId, delta));
    }, []);

    // Get accumulated save delta for a recipe
    const getSaveDelta = useCallback((recipeId: string) => {
        return savedDeltas.get(recipeId) || 0;
    }, [savedDeltas]);

    // Clear save delta after applying
    const clearSaveDelta = useCallback((recipeId: string) => {
        setSavedDeltas(prev => {
            const newMap = new Map(prev);
            newMap.delete(recipeId);
            return newMap;
        });
    }, []);

    return (
        <RecipeSaveContext.Provider value={{
            savedDeltas,
            notifySaveUpdate,
            registerSaveUpdateCallback,
            unregisterSaveUpdateCallback,
            getSaveDelta,
            clearSaveDelta,
        }}>
            {children}
        </RecipeSaveContext.Provider>
    );
};

export const useRecipeSaveContext = () => {
    const context = useContext(RecipeSaveContext);
    if (!context) {
        throw new Error('useRecipeSaveContext must be used within RecipeSaveProvider');
    }
    return context;
};
