import { useState, useEffect } from 'react';

interface UseMarkdownResult {
  content: string;
  isLoading: boolean;
  error: string | null;
}

export function useMarkdown(url: string | null): UseMarkdownResult {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setContent('');
      setError(null);
      return;
    }

    const fetchContent = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: Impossible de charger le contenu`);
        }
        const text = await response.text();
        setContent(text);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
        setContent('');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [url]);

  return { content, isLoading, error };
}
