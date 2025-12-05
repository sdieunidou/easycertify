import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  X,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ExamQuestion {
  id: string;
  topicId: string;
  topicTitle: string;
  categoryTitle: string;
  question: string;
  type: 'single_choice' | 'multiple_choice';
  options: string[];
  correct_answers: string[];
  explanation: string;
}

interface ExamSimulatorProps {
  questions: ExamQuestion[];
  timeLimit: number; // in minutes
  certificationName: string;
  onComplete: (result: ExamResult) => void;
  onClose: () => void;
}

export interface ExamResult {
  questionsCount: number;
  correctAnswers: number;
  timeUsed: number;
  answers: {
    questionId: string;
    userAnswers: string[];
    isCorrect: boolean;
  }[];
}

export function ExamSimulator({
  questions,
  timeLimit,
  certificationName,
  onComplete,
  onClose,
}: ExamSimulatorProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, string[]>>(new Map());
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);

  const currentQuestion = questions[currentIndex];

  // Timer
  useEffect(() => {
    if (isSubmitted || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted, timeRemaining]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (option: string) => {
    const questionId = currentQuestion.id;
    const currentAnswers = answers.get(questionId) || [];

    if (currentQuestion.type === 'single_choice') {
      setAnswers(new Map(answers.set(questionId, [option])));
    } else {
      if (currentAnswers.includes(option)) {
        setAnswers(
          new Map(
            answers.set(
              questionId,
              currentAnswers.filter((a) => a !== option)
            )
          )
        );
      } else {
        setAnswers(new Map(answers.set(questionId, [...currentAnswers, option])));
      }
    }
  };

  const toggleFlag = () => {
    const newFlagged = new Set(flagged);
    if (newFlagged.has(currentQuestion.id)) {
      newFlagged.delete(currentQuestion.id);
    } else {
      newFlagged.add(currentQuestion.id);
    }
    setFlagged(newFlagged);
  };

  const handleSubmit = useCallback(() => {
    const timeUsed = timeLimit * 60 - timeRemaining;
    const results: ExamResult['answers'] = [];
    let correctCount = 0;

    questions.forEach((q) => {
      const userAnswers = answers.get(q.id) || [];
      const isCorrect =
        userAnswers.length === q.correct_answers.length &&
        userAnswers.every((a) => q.correct_answers.includes(a));

      if (isCorrect) correctCount++;

      results.push({
        questionId: q.id,
        userAnswers,
        isCorrect,
      });
    });

    const result: ExamResult = {
      questionsCount: questions.length,
      correctAnswers: correctCount,
      timeUsed,
      answers: results,
    };

    setExamResult(result);
    setIsSubmitted(true);
    onComplete(result);
  }, [questions, answers, timeLimit, timeRemaining, onComplete]);

  const answeredCount = answers.size;
  const unansweredCount = questions.length - answeredCount;
  const progress = (answeredCount / questions.length) * 100;

  const getTimeColor = () => {
    const percentage = (timeRemaining / (timeLimit * 60)) * 100;
    if (percentage <= 10) return 'text-destructive';
    if (percentage <= 25) return 'text-yellow-500';
    return 'text-foreground';
  };

  if (isSubmitted && examResult) {
    const score = Math.round((examResult.correctAnswers / examResult.questionsCount) * 100);
    const passed = score >= 70;

    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        <header className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Résultats de l'examen</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto space-y-8">
            {/* Score card */}
            <div
              className={cn(
                'p-8 rounded-xl text-center',
                passed ? 'bg-accent/20' : 'bg-destructive/20'
              )}
            >
              <div
                className={cn(
                  'text-6xl font-bold mb-2',
                  passed ? 'text-accent' : 'text-destructive'
                )}
              >
                {score}%
              </div>
              <div className={cn('text-lg', passed ? 'text-accent' : 'text-destructive')}>
                {passed ? 'Réussi !' : 'Échoué'}
              </div>
              <div className="mt-4 text-muted-foreground">
                {examResult.correctAnswers} / {examResult.questionsCount} réponses correctes
              </div>
              <div className="text-sm text-muted-foreground">
                Temps utilisé: {formatTime(examResult.timeUsed)}
              </div>
            </div>

            {/* Detailed results */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Détail des réponses</h3>
              {questions.map((q, index) => {
                const result = examResult.answers.find((a) => a.questionId === q.id);
                const isCorrect = result?.isCorrect;

                return (
                  <div
                    key={q.id}
                    className={cn(
                      'p-4 rounded-lg border',
                      isCorrect ? 'border-accent/50 bg-accent/5' : 'border-destructive/50 bg-destructive/5'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-muted-foreground mb-1">
                          Question {index + 1} - {q.categoryTitle}
                        </div>
                        <div className="font-medium text-foreground mb-2">{q.question}</div>
                        {!isCorrect && (
                          <div className="text-sm space-y-1">
                            <div className="text-destructive">
                              Votre réponse: {result?.userAnswers.join(', ') || 'Aucune'}
                            </div>
                            <div className="text-accent">
                              Réponse correcte: {q.correct_answers.join(', ')}
                            </div>
                            {q.explanation && (
                              <div className="text-muted-foreground mt-2 p-2 bg-muted/50 rounded">
                                {q.explanation}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center gap-4 pt-4">
              <Button variant="outline" onClick={onClose}>
                Fermer
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-foreground">{certificationName}</span>
          <span className="text-sm text-muted-foreground">
            Question {currentIndex + 1} / {questions.length}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className={cn('flex items-center gap-2 font-mono text-lg', getTimeColor())}>
            <Clock className="h-5 w-5" />
            {formatTime(timeRemaining)}
          </div>
          <Button variant="ghost" size="icon" onClick={() => setShowConfirmClose(true)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Progress */}
      <div className="px-4 py-2 border-b border-border">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{answeredCount} répondu(es)</span>
          <span>{unansweredCount} restante(s)</span>
        </div>
      </div>

      {/* Question navigator */}
      <div className="px-4 py-2 border-b border-border overflow-x-auto">
        <div className="flex gap-1">
          {questions.map((q, index) => {
            const isAnswered = answers.has(q.id);
            const isFlagged = flagged.has(q.id);
            const isCurrent = index === currentIndex;

            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  'w-8 h-8 rounded text-xs font-medium transition-colors relative',
                  isCurrent && 'ring-2 ring-primary ring-offset-1',
                  isAnswered && !isCurrent && 'bg-accent/20 text-accent',
                  !isAnswered && !isCurrent && 'bg-muted text-muted-foreground',
                  isCurrent && 'bg-primary text-primary-foreground'
                )}
              >
                {index + 1}
                {isFlagged && (
                  <Flag className="absolute -top-1 -right-1 h-3 w-3 text-yellow-500 fill-yellow-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Question content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-sm text-muted-foreground mb-2">
            {currentQuestion.categoryTitle} • {currentQuestion.topicTitle}
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-6">{currentQuestion.question}</h2>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = (answers.get(currentQuestion.id) || []).includes(option);

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  className={cn(
                    'w-full text-left p-4 rounded-lg border transition-all',
                    isSelected
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border hover:border-primary/50 text-foreground'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0',
                        currentQuestion.type === 'single_choice' ? 'rounded-full' : 'rounded-md',
                        isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'
                      )}
                    >
                      {isSelected && <div className="w-2 h-2 bg-primary-foreground rounded-full" />}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-6 text-sm text-muted-foreground">
            {currentQuestion.type === 'multiple_choice'
              ? 'Sélectionnez toutes les réponses correctes'
              : 'Sélectionnez une seule réponse'}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="flex items-center justify-between px-4 py-3 border-t border-border shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleFlag}
          className={cn('gap-2', flagged.has(currentQuestion.id) && 'text-yellow-500')}
        >
          <Flag
            className={cn('h-4 w-4', flagged.has(currentQuestion.id) && 'fill-yellow-500')}
          />
          {flagged.has(currentQuestion.id) ? 'Retirer le flag' : 'Marquer pour révision'}
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {currentIndex === questions.length - 1 ? (
            <Button size="sm" onClick={() => setShowConfirmSubmit(true)} className="gap-2">
              Terminer l'examen
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </footer>

      {/* Confirm submit dialog */}
      <AlertDialog open={showConfirmSubmit} onOpenChange={setShowConfirmSubmit}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Terminer l'examen ?</AlertDialogTitle>
            <AlertDialogDescription>
              {unansweredCount > 0 && (
                <span className="flex items-center gap-2 text-yellow-600 mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  Vous avez {unansweredCount} question(s) sans réponse.
                </span>
              )}
              {flagged.size > 0 && (
                <span className="flex items-center gap-2 text-yellow-600">
                  <Flag className="h-4 w-4" />
                  Vous avez {flagged.size} question(s) marquée(s) pour révision.
                </span>
              )}
              {unansweredCount === 0 && flagged.size === 0 && (
                <span>Êtes-vous sûr de vouloir terminer l'examen ?</span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuer l'examen</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>Terminer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm close dialog */}
      <AlertDialog open={showConfirmClose} onOpenChange={setShowConfirmClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Quitter l'examen ?</AlertDialogTitle>
            <AlertDialogDescription>
              Votre progression sera perdue. Voulez-vous vraiment quitter ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuer</AlertDialogCancel>
            <AlertDialogAction onClick={onClose} className="bg-destructive hover:bg-destructive/90">
              Quitter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
