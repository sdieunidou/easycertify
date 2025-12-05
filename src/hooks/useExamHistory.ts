import { useState, useEffect, useCallback } from 'react';

export interface ExamResult {
  id: string;
  date: string;
  certificationId: string;
  categories: string[];
  questionsCount: number;
  timeLimit: number; // in minutes
  timeUsed: number; // in seconds
  correctAnswers: number;
  totalQuestions: number;
  score: number; // percentage
}

interface ExamHistoryData {
  results: ExamResult[];
}

const STORAGE_KEY = 'certification-exam-history';

const getInitialData = (): ExamHistoryData => {
  if (typeof window === 'undefined') {
    return { results: [] };
  }
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return { results: [] };
    }
  }
  return { results: [] };
};

export function useExamHistory() {
  const [data, setData] = useState<ExamHistoryData>(getInitialData);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const addResult = useCallback((result: Omit<ExamResult, 'id' | 'date'>) => {
    const newResult: ExamResult = {
      ...result,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    };

    setData(prev => ({
      results: [newResult, ...prev.results].slice(0, 50), // Keep last 50 exams
    }));

    return newResult;
  }, []);

  const getResultsForCertification = useCallback((certificationId: string) => {
    return data.results.filter(r => r.certificationId === certificationId);
  }, [data.results]);

  const getAverageScore = useCallback((certificationId?: string) => {
    const results = certificationId
      ? data.results.filter(r => r.certificationId === certificationId)
      : data.results;
    
    if (results.length === 0) return 0;
    return results.reduce((acc, r) => acc + r.score, 0) / results.length;
  }, [data.results]);

  const getBestScore = useCallback((certificationId?: string) => {
    const results = certificationId
      ? data.results.filter(r => r.certificationId === certificationId)
      : data.results;
    
    if (results.length === 0) return 0;
    return Math.max(...results.map(r => r.score));
  }, [data.results]);

  const clearHistory = useCallback(() => {
    setData({ results: [] });
  }, []);

  return {
    results: data.results,
    addResult,
    getResultsForCertification,
    getAverageScore,
    getBestScore,
    clearHistory,
  };
}
