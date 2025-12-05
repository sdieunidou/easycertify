import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Check, SkipForward, HelpCircle, X } from 'lucide-react';

interface MarkAsReadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMarkAsRead: () => void;
  onSkip: () => void;
  onDoQuiz?: () => void;
  topicTitle: string;
  hasQuiz?: boolean;
  quizCompleted?: boolean;
}

export function MarkAsReadDialog({
  open,
  onOpenChange,
  onMarkAsRead,
  onSkip,
  onDoQuiz,
  topicTitle,
  hasQuiz = false,
  quizCompleted = false,
}: MarkAsReadDialogProps) {
  const showQuizOption = hasQuiz && !quizCompleted;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card border-border">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Fermer</span>
        </button>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground pr-6">
            {showQuizOption ? "Quiz disponible !" : "Marquer comme lu ?"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            {showQuizOption ? (
              <>
                Un quiz est disponible pour "<span className="font-medium text-foreground">{topicTitle}</span>". 
                Voulez-vous tester vos connaissances avant de continuer ?
              </>
            ) : (
              <>
                Voulez-vous marquer "<span className="font-medium text-foreground">{topicTitle}</span>" comme lu avant de passer à la fiche suivante ?
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            onClick={() => {
              onOpenChange(false);
              onSkip();
            }}
            variant="outline"
            className="gap-2"
          >
            <SkipForward className="h-4 w-4" />
            Passer sans marquer
          </Button>
          
          {showQuizOption && onDoQuiz && (
            <Button
              onClick={() => {
                onOpenChange(false);
                onDoQuiz();
              }}
              variant="outline"
              className="gap-2 border-primary text-primary hover:bg-primary/10"
            >
              <HelpCircle className="h-4 w-4" />
              Faire le quiz
            </Button>
          )}
          
          <AlertDialogAction
            onClick={onMarkAsRead}
            className="gap-2 bg-progress-complete hover:bg-progress-complete/90"
          >
            <Check className="h-4 w-4" />
            Marquer et continuer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
