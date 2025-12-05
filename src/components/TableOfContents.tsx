import { useMemo, useCallback } from 'react';
import { List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
  scrollContainer?: HTMLElement | null;
}

export function TableOfContents({ content, scrollContainer }: TableOfContentsProps) {
  const headings = useMemo(() => {
    if (!content) return [];
    
    const lines = content.split('\n');
    const result: Heading[] = [];
    
    lines.forEach((line, index) => {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        // Create a slug-like ID
        const id = text
          .toLowerCase()
          .replace(/[^a-z0-9àâäéèêëïîôùûüç\s-]/gi, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-');
        result.push({ id, text, level });
      }
    });
    
    return result;
  }, [content]);

  const handleScrollTo = useCallback((headingText: string) => {
    // Find the heading in the DOM by text content
    const container = scrollContainer || document;
    const allHeadings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    for (const heading of allHeadings) {
      if (heading.textContent?.trim() === headingText) {
        heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
        break;
      }
    }
  }, [scrollContainer]);

  if (headings.length === 0) {
    return null;
  }

  const minLevel = Math.min(...headings.map(h => h.level));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          title="Plan de l'article"
        >
          <List className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        align="end" 
        className="w-72 p-0 max-h-[70vh] flex flex-col"
        sideOffset={8}
      >
        <div className="px-4 py-3 border-b border-border shrink-0">
          <h3 className="font-semibold text-sm">Plan de l'article</h3>
        </div>
        <div className="overflow-y-auto flex-1 max-h-[60vh]">
          <nav className="p-2">
            {headings.map((heading, index) => (
              <button
                key={`${heading.id}-${index}`}
                onClick={() => handleScrollTo(heading.text)}
                className={cn(
                  "w-full text-left px-3 py-2 text-sm rounded-md transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  "truncate block"
                )}
                style={{ paddingLeft: `${(heading.level - minLevel) * 12 + 12}px` }}
              >
                {heading.text}
              </button>
            ))}
          </nav>
        </div>
      </PopoverContent>
    </Popover>
  );
}
