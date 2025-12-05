import { BookOpen, Target, Star, CheckCircle, ArrowRight, HelpCircle, Flame, Play, Maximize2, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Certification } from '@/data/certificationData';

interface WelcomeScreenProps {
  certifications: Certification[];
  onSelectFirstTopic: (certId: string) => void;
  completedCounts: Record<string, number>;
  totalCounts: Record<string, number>;
  onStartExam?: (certId: string) => void;
}

export function WelcomeScreen({
  certifications,
  onSelectFirstTopic,
  completedCounts,
  totalCounts,
  onStartExam,
}: WelcomeScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 bg-background overflow-auto">
      <div className="max-w-3xl w-full animate-fade-in">
        {/* Hero */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-primary/10 mb-4 sm:mb-6">
            <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-foreground mb-3 sm:mb-4">
            Bienvenue sur CertifyHub
          </h1>
          <p className="text-sm sm:text-lg text-muted-foreground max-w-lg mx-auto px-4">
            Préparez vos certifications Symfony et Sylius avec des fiches pédagogiques
            structurées et un suivi de progression.
          </p>
          <p className="text-xs text-muted-foreground/70 mt-3 px-4">
            Contenu généré par IA sans vérification humaine. Référez-vous à la documentation officielle.
          </p>
        </div>

        {/* Certification Cards */}
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {certifications.map(cert => {
            const completed = completedCounts[cert.id] || 0;
            const total = totalCounts[cert.id] || 0;
            const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

            return (
              <Card
                key={cert.id}
                className="p-4 sm:p-6 hover:border-primary/50 transition-all group"
              >
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium mb-2 ${
                      cert.color === 'symfony' 
                        ? 'bg-foreground text-background' 
                        : 'bg-sylius text-white'
                    }`}>
                      {cert.name} {cert.version}
                    </span>
                    <h3 className="text-base sm:text-lg font-semibold text-foreground">
                      Certification {cert.name}
                    </h3>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                  {cert.categories.length} catégories • {total} fiches
                </p>
                <div className="space-y-2 mb-4">
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
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => onSelectFirstTopic(cert.id)}
                  >
                    <ArrowRight className="h-4 w-4" />
                    Commencer
                  </Button>
                  {onStartExam && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => onStartExam(cert.id)}
                    >
                      <Play className="h-4 w-4" />
                      Examen
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <div className="text-center p-3 sm:p-4 bg-card rounded-lg border border-border">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-muted mb-3">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <h4 className="font-medium text-foreground text-sm mb-1">Progression</h4>
            <p className="text-xs text-muted-foreground">
              Suivez votre avancement
            </p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-card rounded-lg border border-border">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-muted mb-3">
              <HelpCircle className="h-5 w-5 text-primary" />
            </div>
            <h4 className="font-medium text-foreground text-sm mb-1">Quiz</h4>
            <p className="text-xs text-muted-foreground">
              Testez vos connaissances
            </p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-card rounded-lg border border-border">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-muted mb-3">
              <Play className="h-5 w-5 text-primary" />
            </div>
            <h4 className="font-medium text-foreground text-sm mb-1">Examen simulé</h4>
            <p className="text-xs text-muted-foreground">
              Conditions réelles
            </p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-card rounded-lg border border-border">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-muted mb-3">
              <Flame className="h-5 w-5 text-orange-500" />
            </div>
            <h4 className="font-medium text-foreground text-sm mb-1">Streaks</h4>
            <p className="text-xs text-muted-foreground">
              Gardez le rythme
            </p>
          </div>
        </div>

        {/* Secondary features */}
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="p-2">
            <Star className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
            <span className="text-xs text-muted-foreground">Favoris</span>
          </div>
          <div className="p-2">
            <Maximize2 className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
            <span className="text-xs text-muted-foreground">Mode focus</span>
          </div>
          <div className="p-2">
            <Printer className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
            <span className="text-xs text-muted-foreground">Impression</span>
          </div>
          <div className="p-2">
            <CheckCircle className="h-5 w-5 text-accent mx-auto mb-1" />
            <span className="text-xs text-muted-foreground">Clavier</span>
          </div>
        </div>
      </div>
    </div>
  );
}
