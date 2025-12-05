import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PrintButtonProps {
  title: string;
  categoryTitle: string;
  certificationName: string;
}

export function PrintButton({ title, categoryTitle, certificationName }: PrintButtonProps) {
  const handlePrint = () => {
    // Add print-specific class to body
    document.body.classList.add('printing');
    
    // Trigger print
    window.print();
    
    // Remove class after print dialog closes
    setTimeout(() => {
      document.body.classList.remove('printing');
    }, 1000);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handlePrint}
      className="gap-2 text-muted-foreground hover:text-foreground"
      title="Imprimer cette fiche"
    >
      <Printer className="h-4 w-4" />
      <span className="hidden sm:inline">Imprimer</span>
    </Button>
  );
}
