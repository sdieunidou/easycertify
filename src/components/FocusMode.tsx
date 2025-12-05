import { useEffect, useCallback, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from '@/components/CodeBlock';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FocusModeProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  title: string;
  categoryTitle: string;
  certificationName: string;
  onNavigate: (direction: 'prev' | 'next') => void;
  hasPrev: boolean;
  hasNext: boolean;
}

export function FocusMode({
  isOpen,
  onClose,
  content,
  title,
  categoryTitle,
  certificationName,
  onNavigate,
  hasPrev,
  hasNext,
}: FocusModeProps) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  }, [onClose]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      } else if (e.key === 'ArrowLeft' && hasPrev) {
        e.preventDefault();
        onNavigate('prev');
      } else if (e.key === 'ArrowRight' && hasNext) {
        e.preventDefault();
        onNavigate('next');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose, onNavigate, hasPrev, hasNext]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-background flex flex-col transition-opacity duration-200",
        isClosing ? "opacity-0" : "opacity-100"
      )}
    >
      {/* Minimal header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border/50 shrink-0">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{certificationName}</span>
          <span>/</span>
          <span>{categoryTitle}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </Button>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <h1 className="text-3xl font-bold mb-8 text-foreground">{title}</h1>
          <article className="markdown-content focus-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, className, children, ...props }) {
                  const inline = !className && !String(children).includes('\n');
                  return (
                    <CodeBlock className={className} inline={inline}>
                      {String(children).replace(/\n$/, '')}
                    </CodeBlock>
                  );
                },
              }}
            >
              {content}
            </ReactMarkdown>
          </article>
        </div>
      </main>

      {/* Navigation footer */}
      <footer className="flex items-center justify-center gap-8 px-6 py-4 border-t border-border/50 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate('prev')}
          disabled={!hasPrev}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Précédent
        </Button>
        <span className="text-xs text-muted-foreground">
          ← → pour naviguer • Échap pour quitter
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate('next')}
          disabled={!hasNext}
          className="gap-2"
        >
          Suivant
          <ChevronRight className="h-4 w-4" />
        </Button>
      </footer>
    </div>
  );
}

// Button to trigger focus mode
export function FocusModeButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="gap-2 text-muted-foreground hover:text-foreground"
      title="Mode focus (F)"
    >
      <Maximize2 className="h-4 w-4" />
      <span className="hidden sm:inline">Focus</span>
    </Button>
  );
}
