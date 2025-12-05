import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, RotateCcw, HelpCircle, ChevronRight } from 'lucide-react';

interface QuizQuestion {
  id: number;
  question: string;
  type: 'single_choice' | 'multiple_choice';
  options: string[];
  correct_answers: string[];
  explanation: string;
  shuffledOptions: string[];
}

interface QuizProps {
  title: string;
  questions: QuizQuestion[];
  onReset: () => void;
  onComplete?: () => void;
}

export function Quiz({ title, questions, onReset, onComplete }: QuizProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [results, setResults] = useState<{ correct: number; total: number } | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<Map<number, { selected: string[]; isCorrect: boolean }>>(new Map());

  // Scroll to bottom of card when answer is submitted
  useEffect(() => {
    if (hasSubmitted && cardRef.current) {
      setTimeout(() => {
        cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    }
  }, [hasSubmitted]);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  const isCorrectAnswer = useMemo(() => {
    if (!currentQuestion || !hasSubmitted) return false;
    const correctSet = new Set(currentQuestion.correct_answers);
    const selectedSet = new Set(selectedAnswers);
    if (correctSet.size !== selectedSet.size) return false;
    return [...correctSet].every(answer => selectedSet.has(answer));
  }, [currentQuestion, selectedAnswers, hasSubmitted]);

  const handleSelectOption = useCallback((option: string) => {
    if (hasSubmitted) return;

    if (currentQuestion.type === 'single_choice') {
      setSelectedAnswers([option]);
    } else {
      setSelectedAnswers(prev => 
        prev.includes(option) 
          ? prev.filter(o => o !== option)
          : [...prev, option]
      );
    }
  }, [currentQuestion?.type, hasSubmitted]);

  const handleSubmit = useCallback(() => {
    if (selectedAnswers.length === 0) return;
    setHasSubmitted(true);
    
    setAnsweredQuestions(prev => {
      const newMap = new Map(prev);
      newMap.set(currentIndex, { selected: selectedAnswers, isCorrect: isCorrectAnswer });
      return newMap;
    });
  }, [selectedAnswers, currentIndex, isCorrectAnswer]);

  const handleNext = useCallback(() => {
    if (isLastQuestion) {
      // Calculate final results
      const correctCount = [...answeredQuestions.values()].filter(a => a.isCorrect).length + (isCorrectAnswer ? 1 : 0);
      setResults({ correct: correctCount, total: questions.length });
      onComplete?.();
    } else {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswers([]);
      setHasSubmitted(false);
    }
  }, [isLastQuestion, answeredQuestions, isCorrectAnswer, questions.length, onComplete]);

  const handleReset = useCallback(() => {
    setCurrentIndex(0);
    setSelectedAnswers([]);
    setHasSubmitted(false);
    setResults(null);
    setAnsweredQuestions(new Map());
    onReset();
  }, [onReset]);

  if (results) {
    const percentage = Math.round((results.correct / results.total) * 100);
    const isGood = percentage >= 70;

  return (
    <Card ref={cardRef} className="border-border bg-card">
        <CardContent className="pt-6 text-center">
          <div className={cn(
            "text-6xl font-bold mb-4",
            isGood ? "text-progress-complete" : "text-destructive"
          )}>
            {percentage}%
          </div>
          <p className="text-lg text-foreground mb-2">
            {results.correct} / {results.total} réponses correctes
          </p>
          <p className="text-muted-foreground mb-6">
            {isGood ? "Excellent travail ! 🎉" : "Continue à réviser, tu vas y arriver !"}
          </p>
          <Button onClick={handleReset} variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Refaire le quiz
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!currentQuestion) return null;

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            {title}
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="font-medium text-foreground">{currentQuestion.question}</p>
        
        {currentQuestion.type === 'multiple_choice' && (
          <p className="text-xs text-muted-foreground italic">
            Plusieurs réponses possibles
          </p>
        )}

        <div className="space-y-2">
          {currentQuestion.shuffledOptions.map((option, idx) => {
            const isSelected = selectedAnswers.includes(option);
            const isCorrect = currentQuestion.correct_answers.includes(option);
            
            let optionClass = "border-border bg-background hover:bg-accent/50";
            if (hasSubmitted) {
              if (isCorrect) {
                optionClass = "border-progress-complete bg-progress-complete/10";
              } else if (isSelected && !isCorrect) {
                optionClass = "border-destructive bg-destructive/10";
              }
            } else if (isSelected) {
              optionClass = "border-primary bg-primary/10";
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(option)}
                disabled={hasSubmitted}
                className={cn(
                  "w-full text-left p-3 rounded-lg border transition-all flex items-center gap-3",
                  optionClass,
                  !hasSubmitted && "cursor-pointer"
                )}
              >
                {currentQuestion.type === 'multiple_choice' ? (
                  <Checkbox 
                    checked={isSelected} 
                    disabled={hasSubmitted}
                    className="pointer-events-none"
                  />
                ) : (
                  <div className={cn(
                    "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0",
                    isSelected ? "border-primary" : "border-muted-foreground"
                  )}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                )}
                <span className="flex-1 text-foreground">{option}</span>
                {hasSubmitted && isCorrect && (
                  <CheckCircle className="h-5 w-5 text-progress-complete shrink-0" />
                )}
                {hasSubmitted && isSelected && !isCorrect && (
                  <XCircle className="h-5 w-5 text-destructive shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {hasSubmitted && (
          <div className={cn(
            "p-4 rounded-lg text-sm",
            isCorrectAnswer 
              ? "bg-progress-complete/10 border border-progress-complete/30" 
              : "bg-destructive/10 border border-destructive/30"
          )}>
            <p className="font-medium mb-1">
              {isCorrectAnswer ? "✓ Bonne réponse !" : "✗ Mauvaise réponse"}
            </p>
            <p className="text-muted-foreground">{currentQuestion.explanation}</p>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          {!hasSubmitted ? (
            <Button 
              onClick={handleSubmit} 
              disabled={selectedAnswers.length === 0}
            >
              Valider
            </Button>
          ) : (
            <Button onClick={handleNext} className="gap-1">
              {isLastQuestion ? "Voir les résultats" : "Suivant"}
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
