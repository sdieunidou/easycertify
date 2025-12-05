import { useState, useEffect, useCallback, useMemo } from 'react';
import { Menu } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { ContentViewer } from '@/components/ContentViewer';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { certifications, Certification, Category, Topic } from '@/data/certificationData';
import { useProgress } from '@/hooks/useProgress';
import { Button } from '@/components/ui/button';

interface SelectedTopic {
  certificationId: string;
  categoryId: string;
  topicId: string;
}

const Index = () => {
  const [selectedCertification, setSelectedCertification] = useState<string>('symfony');
  const [selectedTopic, setSelectedTopic] = useState<SelectedTopic | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const {
    completed,
    toggleCompleted,
    toggleFavorite,
    isCompleted,
    isFavorite,
    setLastVisited,
  } = useProgress();

  // Calculate totals
  const totalCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    certifications.forEach(cert => {
      counts[cert.id] = cert.categories.reduce((acc, cat) => acc + cat.topics.length, 0);
    });
    return counts;
  }, []);

  const completedCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    certifications.forEach(cert => {
      counts[cert.id] = completed.filter(id => id.startsWith(`${cert.id}-`)).length;
    });
    return counts;
  }, [completed]);

  const currentCert = certifications.find(c => c.id === selectedCertification);
  const currentTotal = totalCounts[selectedCertification] || 0;
  const currentCompleted = completedCounts[selectedCertification] || 0;

  // Get flattened list of all topics for navigation
  const allTopics = useMemo(() => {
    if (!currentCert) return [];
    const topics: Array<{ certId: string; catId: string; topicId: string; category: Category; topic: Topic }> = [];
    currentCert.categories.forEach(cat => {
      cat.topics.forEach(topic => {
        topics.push({
          certId: currentCert.id,
          catId: cat.id,
          topicId: topic.id,
          category: cat,
          topic,
        });
      });
    });
    return topics;
  }, [currentCert]);

  const currentTopicIndex = useMemo(() => {
    if (!selectedTopic) return -1;
    return allTopics.findIndex(
      t => t.certId === selectedTopic.certificationId &&
           t.catId === selectedTopic.categoryId &&
           t.topicId === selectedTopic.topicId
    );
  }, [allTopics, selectedTopic]);

  const handleSelectTopic = useCallback((certId: string, catId: string, topicId: string) => {
    setSelectedTopic({ certificationId: certId, categoryId: catId, topicId });
    setLastVisited(`${certId}-${catId}-${topicId}`);
  }, [setLastVisited]);

  const handleSelectFirstTopic = useCallback((certId: string) => {
    setSelectedCertification(certId);
    const cert = certifications.find(c => c.id === certId);
    if (cert && cert.categories.length > 0 && cert.categories[0].topics.length > 0) {
      const firstCat = cert.categories[0];
      const firstTopic = firstCat.topics[0];
      handleSelectTopic(certId, firstCat.id, firstTopic.id);
    }
  }, [handleSelectTopic]);

  const handleNavigate = useCallback((direction: 'prev' | 'next') => {
    if (currentTopicIndex === -1) return;
    
    const newIndex = direction === 'prev' ? currentTopicIndex - 1 : currentTopicIndex + 1;
    if (newIndex >= 0 && newIndex < allTopics.length) {
      const newTopic = allTopics[newIndex];
      handleSelectTopic(newTopic.certId, newTopic.catId, newTopic.topicId);
    }
  }, [currentTopicIndex, allTopics, handleSelectTopic]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleNavigate('prev');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNavigate('next');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNavigate]);

  // Get current topic details
  const currentTopicData = useMemo(() => {
    if (!selectedTopic || !currentCert) return null;
    const category = currentCert.categories.find(c => c.id === selectedTopic.categoryId);
    if (!category) return null;
    const topic = category.topics.find(t => t.id === selectedTopic.topicId);
    if (!topic) return null;
    return { certification: currentCert, category, topic };
  }, [selectedTopic, currentCert]);

  const topicFullId = selectedTopic
    ? `${selectedTopic.certificationId}-${selectedTopic.categoryId}-${selectedTopic.topicId}`
    : '';

  return (
    <div className="flex h-screen overflow-hidden dark">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        certifications={certifications}
        selectedCertification={selectedCertification}
        selectedTopic={topicFullId || null}
        onSelectCertification={(id) => {
          setSelectedCertification(id);
          setSelectedTopic(null);
        }}
        onSelectTopic={handleSelectTopic}
        onGoHome={() => setSelectedTopic(null)}
        isCompleted={isCompleted}
        isFavorite={isFavorite}
        completedCount={currentCompleted}
        totalTopics={currentTotal}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-3 p-4 border-b border-border bg-background">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-semibold text-foreground">CertifPrep</span>
        </header>

        {currentTopicData ? (
          <ContentViewer
            certification={currentTopicData.certification}
            category={currentTopicData.category}
            topic={currentTopicData.topic}
            topicFullId={topicFullId}
            isCompleted={isCompleted(topicFullId)}
            isFavorite={isFavorite(topicFullId)}
            onToggleCompleted={() => toggleCompleted(topicFullId)}
            onToggleFavorite={() => toggleFavorite(topicFullId)}
            onNavigate={handleNavigate}
            hasPrev={currentTopicIndex > 0}
            hasNext={currentTopicIndex < allTopics.length - 1}
          />
        ) : (
          <WelcomeScreen
            certifications={certifications}
            onSelectFirstTopic={handleSelectFirstTopic}
            completedCounts={completedCounts}
            totalCounts={totalCounts}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
