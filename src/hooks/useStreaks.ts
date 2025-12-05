import { useState, useEffect, useCallback } from 'react';

interface StreakData {
  currentStreak: number;
  bestStreak: number;
  lastActivityDate: string | null;
  freezesUsed: number;
  lastFreezeWeek: string | null;
  activityHistory: string[]; // Array of dates in YYYY-MM-DD format
}

const STORAGE_KEY = 'certification-streaks';
const MAX_FREEZES_PER_WEEK = 1;

const getInitialData = (): StreakData => {
  if (typeof window === 'undefined') {
    return {
      currentStreak: 0,
      bestStreak: 0,
      lastActivityDate: null,
      freezesUsed: 0,
      lastFreezeWeek: null,
      activityHistory: [],
    };
  }
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return {
        currentStreak: 0,
        bestStreak: 0,
        lastActivityDate: null,
        freezesUsed: 0,
        lastFreezeWeek: null,
        activityHistory: [],
      };
    }
  }
  return {
    currentStreak: 0,
    bestStreak: 0,
    lastActivityDate: null,
    freezesUsed: 0,
    lastFreezeWeek: null,
    activityHistory: [],
  };
};

const getDateString = (date: Date = new Date()): string => {
  return date.toISOString().split('T')[0];
};

const getWeekString = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const firstDayOfYear = new Date(year, 0, 1);
  const days = Math.floor((date.getTime() - firstDayOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const week = Math.ceil((days + firstDayOfYear.getDay() + 1) / 7);
  return `${year}-W${week}`;
};

const daysDifference = (date1: string, date2: string): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diff = Math.abs(d1.getTime() - d2.getTime());
  return Math.floor(diff / (24 * 60 * 60 * 1000));
};

export function useStreaks() {
  const [data, setData] = useState<StreakData>(getInitialData);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  // Check and update streak on mount
  useEffect(() => {
    const today = getDateString();
    const yesterday = getDateString(new Date(Date.now() - 24 * 60 * 60 * 1000));
    
    if (data.lastActivityDate && data.lastActivityDate !== today && data.lastActivityDate !== yesterday) {
      // Streak broken - reset unless we have a freeze available
      const currentWeek = getWeekString();
      const canUseFreeze = data.lastFreezeWeek !== currentWeek && data.freezesUsed < MAX_FREEZES_PER_WEEK;
      
      if (!canUseFreeze) {
        setData(prev => ({
          ...prev,
          currentStreak: 0,
        }));
      }
    }
  }, []);

  const recordActivity = useCallback(() => {
    const today = getDateString();
    
    setData(prev => {
      // Already recorded today
      if (prev.lastActivityDate === today) {
        return prev;
      }

      const yesterday = getDateString(new Date(Date.now() - 24 * 60 * 60 * 1000));
      let newStreak = prev.currentStreak;

      if (prev.lastActivityDate === yesterday) {
        // Consecutive day
        newStreak = prev.currentStreak + 1;
      } else if (prev.lastActivityDate === null || daysDifference(prev.lastActivityDate, today) > 1) {
        // First activity or streak broken
        newStreak = 1;
      }

      const newBestStreak = Math.max(prev.bestStreak, newStreak);
      const newHistory = prev.activityHistory.includes(today)
        ? prev.activityHistory
        : [...prev.activityHistory, today].slice(-90); // Keep last 90 days

      return {
        ...prev,
        currentStreak: newStreak,
        bestStreak: newBestStreak,
        lastActivityDate: today,
        activityHistory: newHistory,
      };
    });
  }, []);

  const useFreeze = useCallback(() => {
    const currentWeek = getWeekString();
    
    setData(prev => {
      if (prev.lastFreezeWeek === currentWeek) {
        return prev; // Already used freeze this week
      }

      return {
        ...prev,
        freezesUsed: 0,
        lastFreezeWeek: currentWeek,
      };
    });
  }, []);

  const canUseFreeze = useCallback(() => {
    const currentWeek = getWeekString();
    return data.lastFreezeWeek !== currentWeek;
  }, [data.lastFreezeWeek]);

  const isActiveToday = useCallback(() => {
    return data.lastActivityDate === getDateString();
  }, [data.lastActivityDate]);

  const getActivityForMonth = useCallback((year: number, month: number): string[] => {
    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
    return data.activityHistory.filter(date => date.startsWith(monthStr));
  }, [data.activityHistory]);

  const resetStreaks = useCallback(() => {
    setData({
      currentStreak: 0,
      bestStreak: 0,
      lastActivityDate: null,
      freezesUsed: 0,
      lastFreezeWeek: null,
      activityHistory: [],
    });
  }, []);

  return {
    currentStreak: data.currentStreak,
    bestStreak: data.bestStreak,
    lastActivityDate: data.lastActivityDate,
    activityHistory: data.activityHistory,
    recordActivity,
    useFreeze,
    canUseFreeze,
    isActiveToday,
    getActivityForMonth,
    resetStreaks,
  };
}
