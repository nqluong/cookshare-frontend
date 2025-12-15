import { createContext, useContext, ReactNode, useRef, useCallback, useState } from 'react';

type ViewUpdateCallback = (recipeId: string, delta: number) => void;

type RecipeViewContextType = {
    viewedRecipes: Map<string, number>;
    notifyViewUpdate: (recipeId: string) => void;
    registerViewUpdateCallback: (callback: ViewUpdateCallback) => void;
    unregisterViewUpdateCallback: (callback: ViewUpdateCallback) => void;
    getViewDelta: (recipeId: string) => number;
    clearViewDelta: (recipeId: string) => void;
};

const RecipeViewContext = createContext<RecipeViewContextType | undefined>(undefined);

export const RecipeViewProvider = ({ children }: { children: ReactNode }) => {
    const callbacksRef = useRef<Set<ViewUpdateCallback>>(new Set());
    // Store cumulative view deltas for each recipe
    const [viewedRecipes, setViewedRecipes] = useState<Map<string, number>>(new Map());

    const registerViewUpdateCallback = useCallback((callback: ViewUpdateCallback) => {
        callbacksRef.current.add(callback);
    }, []);

    const unregisterViewUpdateCallback = useCallback((callback: ViewUpdateCallback) => {
        callbacksRef.current.delete(callback);
    }, []);

    // Notify all registered callbacks that a recipe was viewed
    const notifyViewUpdate = useCallback((recipeId: string) => {
        console.log(`[RecipeViewContext] notifyViewUpdate called for: ${recipeId}`);
        console.log(`[RecipeViewContext] Number of registered callbacks: ${callbacksRef.current.size}`);

        // Store the view update
        setViewedRecipes(prev => {
            const newMap = new Map(prev);
            const newDelta = (prev.get(recipeId) || 0) + 1;
            newMap.set(recipeId, newDelta);
            console.log(`[RecipeViewContext] Stored view delta for ${recipeId}: ${newDelta}`);
            return newMap;
        });
        // Notify active callbacks
        callbacksRef.current.forEach(cb => {
            console.log(`[RecipeViewContext] Calling callback for ${recipeId}`);
            cb(recipeId, 1);
        });
    }, []);

    // Get accumulated view delta for a recipe
    const getViewDelta = useCallback((recipeId: string) => {
        return viewedRecipes.get(recipeId) || 0;
    }, [viewedRecipes]);

    // Clear view delta after applying
    const clearViewDelta = useCallback((recipeId: string) => {
        setViewedRecipes(prev => {
            const newMap = new Map(prev);
            newMap.delete(recipeId);
            return newMap;
        });
    }, []);

    return (
        <RecipeViewContext.Provider value={{
            viewedRecipes,
            notifyViewUpdate,
            registerViewUpdateCallback,
            unregisterViewUpdateCallback,
            getViewDelta,
            clearViewDelta,
        }}>
            {children}
        </RecipeViewContext.Provider>
    );
};

export const useRecipeViewContext = () => {
    const context = useContext(RecipeViewContext);
    if (!context) {
        throw new Error('useRecipeViewContext must be used within RecipeViewProvider');
    }
    return context;
};
