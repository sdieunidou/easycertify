import { useRef, useEffect, useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Check, Star, ChevronLeft, ChevronRight, Loader2, AlertCircle, ExternalLink, HelpCircle } from 'lucide-react';
import { CodeBlock } from '@/components/CodeBlock';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMarkdown } from '@/hooks/useMarkdown';
import { useQuiz } from '@/hooks/useQuiz';
import { Quiz } from '@/components/Quiz';
import { Category, Topic, Certification } from '@/data/certificationData';

interface ContentViewerProps {
  certification: Certification;
  category: Category;
  topic: Topic;
  topicFullId: string;
  isCompleted: boolean;
  isFavorite: boolean;
  onToggleCompleted: () => void;
  onToggleFavorite: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  hasPrev: boolean;
  hasNext: boolean;
}

export function ContentViewer({
  certification,
  category,
  topic,
  topicFullId,
  isCompleted,
  isFavorite,
  onToggleCompleted,
  onToggleFavorite,
  onNavigate,
  hasPrev,
  hasNext,
}: ContentViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [quizKey, setQuizKey] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  
  const contentUrl = `${certification.baseUrl}${category.folder}/${topic.path}`;
  const quizUrl = `${contentUrl}.json`;
  
  const { content, isLoading, error } = useMarkdown(contentUrl);
  const { shuffledQuestions, hasQuiz, isLoading: isQuizLoading } = useQuiz(quizUrl);

  const githubUrl = `https://github.com/sdieunidou/${certification.id}-certification/blob/main/${category.folder}/${topic.path}`;

  // Reset quiz state when topic changes
  useEffect(() => {
    setShowQuiz(false);
    setQuizKey(prev => prev + 1);
  }, [topicFullId]);

  const handleQuizReset = useCallback(() => {
    setQuizKey(prev => prev + 1);
  }, []);

  // Reset scroll to top when topic changes
  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = 0;
      }
    }
  }, [topicFullId]);

  return (
    <div className="flex-1 flex flex-col h-full bg-background min-h-0">
      {/* Header */}
      <header className="border-b border-border px-4 sm:px-6 py-3 sm:py-4 shrink-0">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <span className={cn(
                "px-2 py-0.5 rounded text-xs font-medium shrink-0",
                certification.color === 'symfony' 
                  ? "bg-foreground text-background" 
                  : "bg-sylius text-white"
              )}>
                {certification.name}
              </span>
              <span className="hidden sm:inline">/</span>
              <span className="hidden sm:inline truncate">{category.title}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleFavorite}
              className={cn(
                "transition-colors p-2",
                isFavorite && "text-yellow-500"
              )}
            >
              <Star className={cn("h-4 w-4", isFavorite && "fill-yellow-500")} />
            </Button>
            <Button
              variant={isCompleted ? "default" : "outline"}
              size="sm"
              onClick={onToggleCompleted}
              className={cn(
                "gap-1 sm:gap-2 transition-all text-xs sm:text-sm",
                isCompleted && "bg-progress-complete hover:bg-progress-complete/90"
              )}
            >
              <Check className="h-4 w-4" />
              <span className="hidden sm:inline">{isCompleted ? 'Terminé' : 'Marquer comme lu'}</span>
            </Button>
          </div>
        </div>
        <h1 className="text-lg sm:text-2xl font-bold mt-2 sm:mt-3 text-foreground">{topic.title}</h1>
      </header>

      {/* Content */}
      <ScrollArea ref={scrollRef} className="flex-1 min-h-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Chargement du contenu...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-destructive">
              <AlertCircle className="h-8 w-8" />
              <p>{error}</p>
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2"
              >
                Voir sur GitHub
              </a>
            </div>
          ) : (
            <>
              <article className="markdown-content animate-fade-in">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, className, children, ...props }) {
                      const inline = !className && !String(children).includes('\n');
                      return (
                        <CodeBlock 
                          className={className} 
                          inline={inline}
                        >
                          {String(children).replace(/\n$/, '')}
                        </CodeBlock>
                      );
                    },
                  }}
                >
                  {content}
                </ReactMarkdown>
              </article>

              {/* Quiz Section */}
              {!isQuizLoading && hasQuiz && shuffledQuestions.length > 0 && (
                <div className="mt-8 pt-8 border-t border-border">
                  {!showQuiz ? (
                    <Button 
                      onClick={() => setShowQuiz(true)} 
                      variant="outline" 
                      className="w-full gap-2"
                    >
                      <HelpCircle className="h-4 w-4" />
                      Tester vos connaissances ({shuffledQuestions.length} questions)
                    </Button>
                  ) : (
                    <Quiz 
                      key={quizKey}
                      title="Quiz"
                      questions={shuffledQuestions}
                      onReset={handleQuizReset}
                    />
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Navigation Footer */}
      <footer className="border-t border-border px-4 sm:px-6 py-3 sm:py-4 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            onClick={() => onNavigate('prev')}
            disabled={!hasPrev}
            size="sm"
            className="gap-1 sm:gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Précédent</span>
          </Button>
          <div className="text-xs sm:text-sm text-muted-foreground hidden md:block">
            Utilisez les flèches ← → pour naviguer
          </div>
          <Button
            variant="outline"
            onClick={() => onNavigate('next')}
            disabled={!hasNext}
            size="sm"
            className="gap-1 sm:gap-2"
          >
            <span className="hidden sm:inline">Suivant</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </footer>
    </div>
  );
}
