import { HistoryItem } from '../types';

const HISTORY_LIMIT = 50; // Keep the last 50 items

const getHistoryKey = (userId: string): string => `velora-history-${userId}`;

export const getHistory = (userId: string): HistoryItem[] => {
    if (!userId) return [];
    try {
        const historyJson = localStorage.getItem(getHistoryKey(userId));
        return historyJson ? JSON.parse(historyJson) : [];
    } catch (error) {
        console.error("Failed to parse history from localStorage", error);
        return [];
    }
};

export const addHistoryItem = (userId: string, itemData: Omit<HistoryItem, 'id' | 'createdAt'>): void => {
    if (!userId) return;
    try {
        const currentHistory = getHistory(userId);
        const newItem: HistoryItem = {
            ...itemData,
            id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
        };

        const updatedHistory = [newItem, ...currentHistory].slice(0, HISTORY_LIMIT);
        localStorage.setItem(getHistoryKey(userId), JSON.stringify(updatedHistory));
    } catch (error) {
        console.error("Failed to save history item to localStorage", error);
        // Could implement more robust error handling, like clearing old history if storage is full.
    }
};

export const deleteHistoryItem = (userId: string, itemId: string): void => {
    if (!userId) return;
    try {
        const currentHistory = getHistory(userId);
        const updatedHistory = currentHistory.filter(item => item.id !== itemId);
        localStorage.setItem(getHistoryKey(userId), JSON.stringify(updatedHistory));
    } catch (error) {
        console.error("Failed to delete history item from localStorage", error);
    }
};

export const clearHistory = (userId: string): void => {
    if (!userId) return;
    try {
        localStorage.removeItem(getHistoryKey(userId));
    } catch (error) {
        console.error("Failed to clear history from localStorage", error);
    }
};
