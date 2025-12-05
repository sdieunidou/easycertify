import { BookOpen, Target, Star, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Certification } from '@/data/certificationData';

interface WelcomeScreenProps {
  certifications: Certification[];
  onSelectFirstTopic: (certId: string) => void;
  completedCounts: Record<string, number>;
  totalCounts: Record<string, number>;
}

export function WelcomeScreen({
  certifications,
  onSelectFirstTopic,
  completedCounts,
  totalCounts,
}: WelcomeScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-background">
      <div className="max-w-3xl w-full animate-fade-in">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Bienvenue sur CertifPrep
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">
            Préparez vos certifications Symfony et Sylius avec des fiches pédagogiques
            structurées et un suivi de progression.
          </p>
        </div>

        {/* Certification Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {certifications.map(cert => {
            const completed = completedCounts[cert.id] || 0;
            const total = totalCounts[cert.id] || 0;
            const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

            return (
              <Card
                key={cert.id}
                className="p-6 hover:border-primary/50 transition-all cursor-pointer group"
                onClick={() => onSelectFirstTopic(cert.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium mb-2 ${
                      cert.color === 'symfony' 
                        ? 'bg-foreground text-background' 
                        : 'bg-sylius text-white'
                    }`}>
                      {cert.name} {cert.version}
                    </span>
                    <h3 className="text-lg font-semibold text-foreground">
                      Certification {cert.name}
                    </h3>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {cert.categories.length} catégories • {total} fiches
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Progression</span>
                    <span className="text-foreground font-medium">{percent}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-progress-complete transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-muted mb-3">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <h4 className="font-medium text-foreground text-sm mb-1">Suivi de progression</h4>
            <p className="text-xs text-muted-foreground">
              Marquez les fiches lues et suivez votre avancement
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-muted mb-3">
              <Star className="h-5 w-5 text-yellow-500" />
            </div>
            <h4 className="font-medium text-foreground text-sm mb-1">Favoris</h4>
            <p className="text-xs text-muted-foreground">
              Ajoutez des fiches en favoris pour y revenir facilement
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-muted mb-3">
              <CheckCircle className="h-5 w-5 text-progress-complete" />
            </div>
            <h4 className="font-medium text-foreground text-sm mb-1">Navigation rapide</h4>
            <p className="text-xs text-muted-foreground">
              Recherche et navigation au clavier
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
