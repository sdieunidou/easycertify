import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  children: string;
  className?: string;
  inline?: boolean;
}

export function CodeBlock({ children, className, inline }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : 'text';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (inline) {
    return (
      <code className="px-1.5 py-0.5 rounded text-sm font-medium bg-code-bg border border-code-border text-primary font-mono break-all">
        {children}
      </code>
    );
  }

  return (
    <div className="relative group my-4 max-w-full overflow-x-auto">
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          onClick={handleCopy}
          className={cn(
            "p-2 rounded-md transition-colors",
            "bg-secondary/80 hover:bg-secondary text-secondary-foreground"
          )}
          title="Copier le code"
        >
          {copied ? (
            <Check className="h-4 w-4 text-progress-complete" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
      {language !== 'text' && (
        <div className="absolute left-3 top-0 -translate-y-1/2 px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded border border-primary/20">
          {language}
        </div>
      )}
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: '1.5rem 1rem 1rem',
          borderRadius: '0.75rem',
          fontSize: '0.875rem',
          lineHeight: '1.6',
          maxWidth: '100%',
          overflowX: 'auto',
        }}
        codeTagProps={{
          style: {
            fontFamily: "'JetBrains Mono', monospace",
          }
        }}
        wrapLongLines={false}
      >
        {children.trim()}
      </SyntaxHighlighter>
    </div>
  );
}
