import React, { createContext, useContext, ReactNode, useRef } from 'react';
import { useRecipeLike } from '@/services/userRecipeLike';

type LikeUpdateCallback = (recipeId: string, delta: number) => void;

type RecipeLikeContextType = ReturnType<typeof useRecipeLike> & {
    registerLikeUpdateCallback: (callback: LikeUpdateCallback) => void;
    unregisterLikeUpdateCallback: (callback: LikeUpdateCallback) => void;
};

const RecipeLikeContext = createContext<RecipeLikeContextType | undefined>(undefined);

export const RecipeLikeProvider = ({ children }: { children: ReactNode }) => {
    const likeHook = useRecipeLike();
    const callbacksRef = useRef<Set<LikeUpdateCallback>>(new Set());

    const registerLikeUpdateCallback = (callback: LikeUpdateCallback) => {
        callbacksRef.current.add(callback);
    };

    const unregisterLikeUpdateCallback = (callback: LikeUpdateCallback) => {
        callbacksRef.current.delete(callback);
    };

    // Wrap toggleLike to notify callbacks
    const toggleLikeWithNotify: typeof likeHook.toggleLike = async (recipeId, onUpdateCount, onSuccess) => {
        const wrappedUpdateCount = (delta: number) => {
            // Call local callback if provided
            if (onUpdateCount) {
                onUpdateCount(delta);
            }
            // Notify all registered callbacks
            callbacksRef.current.forEach(cb => cb(recipeId, delta));
        };

        await likeHook.toggleLike(recipeId, wrappedUpdateCount, onSuccess);
    };

    return (
        <RecipeLikeContext.Provider value={{
            ...likeHook,
            toggleLike: toggleLikeWithNotify,
            registerLikeUpdateCallback,
            unregisterLikeUpdateCallback,
        }}>
            {children}
        </RecipeLikeContext.Provider>
    );
};

export const useRecipeLikeContext = () => {
    const context = useContext(RecipeLikeContext);
    if (!context) {
        throw new Error('useRecipeLikeContext must be used within RecipeLikeProvider');
    }
    return context;
};
