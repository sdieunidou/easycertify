import { useState, useEffect, useCallback } from 'react';

interface ProgressData {
  completed: string[];
  favorites: string[];
  lastVisited: string | null;
}

const STORAGE_KEY = 'certification-progress';

const getInitialData = (): ProgressData => {
  if (typeof window === 'undefined') {
    return { completed: [], favorites: [], lastVisited: null };
  }
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return { completed: [], favorites: [], lastVisited: null };
    }
  }
  return { completed: [], favorites: [], lastVisited: null };
};

export function useProgress() {
  const [data, setData] = useState<ProgressData>(getInitialData);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const toggleCompleted = useCallback((topicId: string) => {
    setData(prev => ({
      ...prev,
      completed: prev.completed.includes(topicId)
        ? prev.completed.filter(id => id !== topicId)
        : [...prev.completed, topicId],
    }));
  }, []);

  const toggleFavorite = useCallback((topicId: string) => {
    setData(prev => ({
      ...prev,
      favorites: prev.favorites.includes(topicId)
        ? prev.favorites.filter(id => id !== topicId)
        : [...prev.favorites, topicId],
    }));
  }, []);

  const setLastVisited = useCallback((topicId: string) => {
    setData(prev => ({
      ...prev,
      lastVisited: topicId,
    }));
  }, []);

  const isCompleted = useCallback((topicId: string) => data.completed.includes(topicId), [data.completed]);
  const isFavorite = useCallback((topicId: string) => data.favorites.includes(topicId), [data.favorites]);

  const getProgress = useCallback((certificationId: string, categoryId?: string) => {
    const prefix = categoryId ? `${certificationId}-${categoryId}-` : `${certificationId}-`;
    const total = data.completed.filter(id => id.startsWith(prefix)).length;
    return total;
  }, [data.completed]);

  const resetProgress = useCallback(() => {
    setData({ completed: [], favorites: [], lastVisited: null });
  }, []);

  return {
    completed: data.completed,
    favorites: data.favorites,
    lastVisited: data.lastVisited,
    toggleCompleted,
    toggleFavorite,
    setLastVisited,
    isCompleted,
    isFavorite,
    getProgress,
    resetProgress,
  };
}
