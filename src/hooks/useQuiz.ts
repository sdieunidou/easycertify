import { useState, useEffect, useMemo } from 'react';

export interface QuizQuestion {
  id: number;
  question: string;
  type: 'single_choice' | 'multiple_choice';
  options: string[];
  correct_answers: string[];
  explanation: string;
}

export interface QuizData {
  source_file: string;
  title: string;
  questions: QuizQuestion[];
}

interface ShuffledQuestion extends QuizQuestion {
  shuffledOptions: string[];
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function useQuiz(quizUrl: string) {
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasQuiz, setHasQuiz] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      setIsLoading(true);
      setHasQuiz(false);
      setQuizData(null);

      try {
        const response = await fetch(quizUrl);
        if (response.ok) {
          const data = await response.json();
          setQuizData(data);
          setHasQuiz(true);
        }
      } catch {
        // Quiz file doesn't exist or error - that's fine
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuiz();
  }, [quizUrl]);

  // Shuffle questions and options each time quizData changes
  const shuffledQuestions = useMemo((): ShuffledQuestion[] => {
    if (!quizData?.questions) return [];
    
    const shuffledQs = shuffleArray(quizData.questions);
    return shuffledQs.map(q => ({
      ...q,
      shuffledOptions: shuffleArray(q.options)
    }));
  }, [quizData]);

  return { quizData, shuffledQuestions, isLoading, hasQuiz };
}
