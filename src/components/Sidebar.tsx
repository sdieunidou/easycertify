import { useState } from 'react';
import { ChevronDown, ChevronRight, Check, Star, Search, BookOpen, GraduationCap, Github, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Certification, Category, Topic } from '@/data/certificationData';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface SidebarProps {
  certifications: Certification[];
  selectedCertification: string | null;
  selectedTopic: string | null;
  onSelectCertification: (id: string) => void;
  onSelectTopic: (certId: string, catId: string, topicId: string) => void;
  onGoHome: () => void;
  isCompleted: (id: string) => boolean;
  isFavorite: (id: string) => boolean;
  completedCount: number;
  totalTopics: number;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({
  certifications,
  selectedCertification,
  selectedTopic,
  onSelectCertification,
  onSelectTopic,
  onGoHome,
  isCompleted,
  isFavorite,
  completedCount,
  totalTopics,
  isOpen = true,
  onClose,
}: SidebarProps) {
  // Extract current category from selectedTopic
  const currentCategoryId = selectedTopic ? selectedTopic.split('-')[1] : null;
  
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    currentCategoryId ? [currentCategoryId] : []
  );
  const [searchQuery, setSearchQuery] = useState('');

  // Keep the category of the selected topic always expanded
  const effectiveExpandedCategories = currentCategoryId 
    ? [...new Set([...expandedCategories, currentCategoryId])]
    : expandedCategories;

  const currentCert = selectedCertification ? certifications.find(c => c.id === selectedCertification) : null;

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const filterTopics = (topics: Topic[], categoryId: string) => {
    if (!searchQuery) return topics;
    return topics.filter(topic =>
      topic.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredCategories = currentCert?.categories.filter(cat => {
    if (!searchQuery) return true;
    const hasMatchingTopic = cat.topics.some(topic =>
      topic.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const categoryMatches = cat.title.toLowerCase().includes(searchQuery.toLowerCase());
    return hasMatchingTopic || categoryMatches;
  });

  const progressPercent = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

  const handleTopicClick = (certId: string, catId: string, topicId: string) => {
    onSelectTopic(certId, catId, topicId);
    onClose?.();
  };

  const handleGoHome = () => {
    onGoHome();
    onClose?.();
  };

  return (
    <aside className={cn(
      "w-80 border-r border-border bg-sidebar flex flex-col h-screen",
      "fixed lg:relative inset-y-0 left-0 z-50",
      "transition-transform duration-300 ease-in-out",
      isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={handleGoHome}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg text-sidebar-foreground">CertifyHub</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-sidebar-accent rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground leading-tight mb-4">
          Contenu généré par IA sans vérification humaine. Référez-vous à la documentation officielle.
        </p>

        {/* Certification Tabs */}
        <div className="flex gap-2 mb-4">
          {certifications.map(cert => (
            <button
              key={cert.id}
              onClick={() => onSelectCertification(cert.id)}
              className={cn(
                "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                selectedCertification === cert.id
                  ? cert.color === 'symfony'
                    ? "bg-foreground text-background"
                    : "bg-sylius text-white"
                  : "bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/80"
              )}
            >
              {cert.name}
            </button>
          ))}
        </div>

        {/* Progress Bar - only show when certification is selected */}
        {selectedCertification && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progression</span>
              <span>{completedCount}/{totalTopics} ({progressPercent}%)</span>
            </div>
            <div className="h-2 bg-progress-incomplete rounded-full overflow-hidden">
              <div
                className="h-full bg-progress-complete transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Search - only show when certification is selected */}
      {selectedCertification && (
        <div className="p-4 border-b border-sidebar-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une fiche..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-sidebar-accent border-sidebar-border"
            />
          </div>
        </div>
      )}

      {/* Categories - only show when certification is selected */}
      {selectedCertification && (
        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredCategories?.map(category => {
            const isExpanded = effectiveExpandedCategories.includes(category.id) || !!searchQuery;
            const topics = filterTopics(category.topics, category.id);
            const categoryCompletedCount = category.topics.filter(t => 
              isCompleted(`${selectedCertification}-${category.id}-${t.id}`)
            ).length;

            return (
              <div key={category.id} className="mb-1">
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-sidebar-accent transition-colors text-left"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <span className="flex-1 text-sm font-medium text-sidebar-foreground truncate">
                    {category.number}. {category.title}
                  </span>
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {categoryCompletedCount}/{category.topics.length}
                  </Badge>
                </button>

                {isExpanded && topics.length > 0 && (
                  <div className="ml-4 pl-2 border-l border-sidebar-border animate-fade-in">
                    {topics.map(topic => {
                      const topicFullId = `${selectedCertification}-${category.id}-${topic.id}`;
                      const isSelected = selectedTopic === topicFullId;
                      const completed = isCompleted(topicFullId);
                      const favorite = isFavorite(topicFullId);

                      return (
                        <button
                          key={topic.id}
                          onClick={() => handleTopicClick(selectedCertification, category.id, topic.id)}
                          className={cn(
                            "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all text-sm",
                            isSelected
                              ? "bg-primary/10 text-primary"
                              : "hover:bg-sidebar-accent text-sidebar-foreground/80"
                          )}
                        >
                          <div className={cn(
                            "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                            completed
                              ? "bg-progress-complete border-progress-complete"
                              : "border-border"
                          )}>
                            {completed && <Check className="h-3 w-3 text-white" />}
                          </div>
                          <span className="flex-1 truncate">{topic.title}</span>
                          {favorite && (
                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          </div>
        </ScrollArea>
      )}

      {/* Footer - only show when certification is selected */}
      {selectedCertification && currentCert && (
        <div className="p-4 border-t border-sidebar-border space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span>{currentCert.name} {currentCert.version}</span>
          </div>
          <a
            href={`https://github.com/sdieunidou/${currentCert.id}-certification`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <Github className="h-4 w-4" />
            <span>Voir le dépôt GitHub</span>
          </a>
        </div>
      )}
    </aside>
  );
}
