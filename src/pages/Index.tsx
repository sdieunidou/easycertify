import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Menu, Loader2 } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { ContentViewer, ContentViewerHandle } from '@/components/ContentViewer';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { MarkAsReadDialog } from '@/components/MarkAsReadDialog';
import { SEO, TopicSEO } from '@/components/SEO';
import { StreakDisplay } from '@/components/StreakDisplay';
import { FocusMode, FocusModeButton } from '@/components/FocusMode';
import { PrintButton } from '@/components/PrintButton';
import { ExamSimulator, ExamResult } from '@/components/ExamSimulator';
import { ExamConfigDialog, ExamConfig } from '@/components/ExamConfigDialog';
import { certifications, Category, Topic } from '@/data/certificationData';
import { useProgress } from '@/hooks/useProgress';
import { useStreaks } from '@/hooks/useStreaks';
import { useExamHistory } from '@/hooks/useExamHistory';
import { useMarkdown } from '@/hooks/useMarkdown';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SelectedTopic {
  certificationId: string;
  categoryId: string;
  topicId: string;
}

const Index = () => {
  const { certificationId, categoryId, topicId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [selectedCertification, setSelectedCertification] = useState<string | null>(certificationId || null);
  const [selectedTopic, setSelectedTopic] = useState<SelectedTopic | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showMarkAsReadDialog, setShowMarkAsReadDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<'prev' | 'next' | null>(null);
  const [currentHasQuiz, setCurrentHasQuiz] = useState(false);
  const [currentQuizCompleted, setCurrentQuizCompleted] = useState(false);
  const [focusModeOpen, setFocusModeOpen] = useState(false);
  const [examConfigOpen, setExamConfigOpen] = useState(false);
  const [examCertification, setExamCertification] = useState<string | null>(null);
  const [examQuestions, setExamQuestions] = useState<any[]>([]);
  const [examRunning, setExamRunning] = useState(false);
  const [examConfig, setExamConfig] = useState<ExamConfig | null>(null);
  const [examLoading, setExamLoading] = useState(false);
  const [examLoadingProgress, setExamLoadingProgress] = useState({ current: 0, total: 0, found: 0 });
  
  const contentViewerRef = useRef<ContentViewerHandle>(null);
  
  const {
    completed,
    toggleCompleted,
    toggleFavorite,
    isCompleted,
    isFavorite,
    setLastVisited,
  } = useProgress();

  const {
    currentStreak,
    bestStreak,
    isActiveToday,
    canUseFreeze,
    useFreeze,
    recordActivity,
    activityHistory,
  } = useStreaks();

  const { addResult } = useExamHistory();

  // Initialize from URL params
  useEffect(() => {
    if (certificationId) {
      const cert = certifications.find(c => c.id === certificationId);
      if (cert) {
        setSelectedCertification(certificationId);
        
        if (categoryId && topicId) {
          const category = cert.categories.find(c => c.id === categoryId);
          if (category) {
            const topic = category.topics.find(t => t.id === topicId);
            if (topic) {
              setSelectedTopic({
                certificationId,
                categoryId,
                topicId,
              });
            }
          }
        }
      }
    }
  }, [certificationId, categoryId, topicId]);

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

  const currentCert = selectedCertification ? certifications.find(c => c.id === selectedCertification) : null;
  const currentTotal = selectedCertification ? (totalCounts[selectedCertification] || 0) : 0;
  const currentCompleted = selectedCertification ? (completedCounts[selectedCertification] || 0) : 0;

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
    navigate(`/${certId}/${catId}/${topicId}`);
    recordActivity(); // Record streak activity
  }, [setLastVisited, navigate, recordActivity]);

  const handleSelectFirstTopic = useCallback((certId: string) => {
    setSelectedCertification(certId);
    const cert = certifications.find(c => c.id === certId);
    if (cert && cert.categories.length > 0 && cert.categories[0].topics.length > 0) {
      const firstCat = cert.categories[0];
      const firstTopic = firstCat.topics[0];
      handleSelectTopic(certId, firstCat.id, firstTopic.id);
    }
  }, [handleSelectTopic]);

  const performNavigation = useCallback((direction: 'prev' | 'next') => {
    if (currentTopicIndex === -1) return;
    
    const newIndex = direction === 'prev' ? currentTopicIndex - 1 : currentTopicIndex + 1;
    if (newIndex >= 0 && newIndex < allTopics.length) {
      const newTopic = allTopics[newIndex];
      handleSelectTopic(newTopic.certId, newTopic.catId, newTopic.topicId);
    }
  }, [currentTopicIndex, allTopics, handleSelectTopic]);

  const handleNavigate = useCallback((direction: 'prev' | 'next') => {
    if (direction === 'next' && selectedTopic) {
      const topicFullId = `${selectedTopic.certificationId}-${selectedTopic.categoryId}-${selectedTopic.topicId}`;
      // Show dialog if not completed OR if there's an incomplete quiz
      if (!isCompleted(topicFullId) || (currentHasQuiz && !currentQuizCompleted)) {
        setPendingNavigation(direction);
        setShowMarkAsReadDialog(true);
        return;
      }
    }
    performNavigation(direction);
  }, [selectedTopic, isCompleted, performNavigation, currentHasQuiz, currentQuizCompleted]);

  const handleQuizStateChange = useCallback((hasQuiz: boolean, quizCompleted: boolean) => {
    setCurrentHasQuiz(hasQuiz);
    setCurrentQuizCompleted(quizCompleted);
  }, []);

  const handleDoQuiz = useCallback(() => {
    contentViewerRef.current?.scrollToQuiz();
    setPendingNavigation(null);
  }, []);

  const handleMarkAsReadAndNavigate = useCallback(() => {
    if (selectedTopic && pendingNavigation) {
      const topicFullId = `${selectedTopic.certificationId}-${selectedTopic.categoryId}-${selectedTopic.topicId}`;
      toggleCompleted(topicFullId);
      performNavigation(pendingNavigation);
    }
    setShowMarkAsReadDialog(false);
    setPendingNavigation(null);
  }, [selectedTopic, pendingNavigation, toggleCompleted, performNavigation]);

  const handleSkipNavigation = useCallback(() => {
    if (pendingNavigation) {
      performNavigation(pendingNavigation);
    }
    setShowMarkAsReadDialog(false);
    setPendingNavigation(null);
  }, [pendingNavigation, performNavigation]);

  // Get current topic details
  const currentTopicData = useMemo(() => {
    if (!selectedTopic || !currentCert) return null;
    const category = currentCert.categories.find(c => c.id === selectedTopic.categoryId);
    if (!category) return null;
    const topic = category.topics.find(t => t.id === selectedTopic.topicId);
    if (!topic) return null;
    return { certification: currentCert, category, topic };
  }, [selectedTopic, currentCert]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (focusModeOpen || examRunning) return; // Let focus mode handle its own keys
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleNavigate('prev');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNavigate('next');
      } else if (e.key === 'f' || e.key === 'F') {
        if (currentTopicData) {
          e.preventDefault();
          setFocusModeOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNavigate, focusModeOpen, examRunning, currentTopicData]);

  // Handle starting exam
  const handleStartExam = useCallback((certId: string) => {
    setExamCertification(certId);
    setExamConfigOpen(true);
  }, []);

  const handleExamConfigConfirm = useCallback(async (config: ExamConfig) => {
    setExamConfig(config);
    setExamConfigOpen(false);
    setExamLoading(true);
    
    // Fetch quiz questions from selected categories
    const cert = certifications.find(c => c.id === examCertification);
    if (!cert) {
      setExamLoading(false);
      return;
    }

    const questions: any[] = [];
    const selectedCategories = cert.categories.filter(c => config.categories.includes(c.id));
    
    // Calculate total topics to fetch
    const allTopics: { category: typeof selectedCategories[0]; topic: typeof selectedCategories[0]['topics'][0] }[] = [];
    selectedCategories.forEach(category => {
      category.topics.forEach(topic => {
        allTopics.push({ category, topic });
      });
    });
    
    setExamLoadingProgress({ current: 0, total: allTopics.length, found: 0 });

    for (let i = 0; i < allTopics.length; i++) {
      const { category, topic } = allTopics[i];
      const quizUrl = `${cert.baseUrl}${category.folder}/${topic.path}.json`;
      
      try {
        const response = await fetch(quizUrl);
        if (response.ok) {
          const data = await response.json();
          if (data.questions) {
            data.questions.forEach((q: any) => {
              questions.push({
                ...q,
                id: `${category.id}-${topic.id}-${q.id}`,
                topicId: topic.id,
                topicTitle: topic.title,
                categoryTitle: category.title,
              });
            });
          }
        }
      } catch {}
      
      setExamLoadingProgress({ current: i + 1, total: allTopics.length, found: questions.length });
    }

    setExamLoading(false);

    // Check if we have enough questions
    if (questions.length === 0) {
      alert('Aucune question trouvée pour les catégories sélectionnées. Les fichiers quiz ne sont peut-être pas encore disponibles.');
      return;
    }

    // Shuffle and limit questions
    const shuffled = questions.sort(() => Math.random() - 0.5);
    const limited = shuffled.slice(0, Math.min(config.questionsCount, questions.length));
    
    setExamQuestions(limited);
    setExamRunning(true);
  }, [examCertification]);

  const handleExamComplete = useCallback((result: ExamResult) => {
    if (examCertification && examConfig) {
      addResult({
        certificationId: examCertification,
        categories: examConfig.categories,
        questionsCount: result.questionsCount,
        timeLimit: examConfig.timeLimit,
        timeUsed: result.timeUsed,
        correctAnswers: result.correctAnswers,
        totalQuestions: result.questionsCount,
        score: Math.round((result.correctAnswers / result.questionsCount) * 100),
      });
    }
  }, [examCertification, examConfig, addResult]);

  const handleExamClose = useCallback(() => {
    setExamRunning(false);
    setExamQuestions([]);
    setExamConfig(null);
  }, []);

  // Get markdown content for focus mode
  const currentContentUrl = currentTopicData 
    ? `${currentTopicData.certification.baseUrl}${currentTopicData.category.folder}/${currentTopicData.topic.path}`
    : '';
  const { content: focusModeContent } = useMarkdown(focusModeOpen ? currentContentUrl : '');

  const topicFullId = selectedTopic
    ? `${selectedTopic.certificationId}-${selectedTopic.categoryId}-${selectedTopic.topicId}`
    : '';

  const handleGoHome = useCallback(() => {
    setSelectedTopic(null);
    setSelectedCertification(null);
    navigate('/');
  }, [navigate]);

  const handleSelectCertification = useCallback((id: string) => {
    setSelectedCertification(id);
    setSelectedTopic(null);
    navigate(`/${id}`);
  }, [navigate]);

  return (
    <>
      {/* SEO */}
      {currentTopicData ? (
        <TopicSEO
          certificationName={currentTopicData.certification.name}
          certificationVersion={currentTopicData.certification.version}
          categoryTitle={currentTopicData.category.title}
          topicTitle={currentTopicData.topic.title}
          path={location.pathname}
        />
      ) : (
        <SEO path={location.pathname} />
      )}

      <div className="flex h-screen overflow-hidden dark">
      {/* Mobile overlay */}
      {sidebarOpen && selectedCertification && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - only show when certification is selected */}
      {selectedCertification && (
        <Sidebar
          certifications={certifications}
          selectedCertification={selectedCertification}
          selectedTopic={topicFullId || null}
          onSelectCertification={handleSelectCertification}
          onSelectTopic={handleSelectTopic}
          onGoHome={handleGoHome}
          isCompleted={isCompleted}
          isFavorite={isFavorite}
          completedCount={currentCompleted}
          totalTopics={currentTotal}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header - only show when certification is selected */}
        {selectedCertification && (
          <header className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-background">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <span className="font-semibold text-foreground">CertifyHub</span>
            <StreakDisplay
              currentStreak={currentStreak}
              bestStreak={bestStreak}
              isActiveToday={isActiveToday()}
              canUseFreeze={canUseFreeze()}
              onUseFreeze={useFreeze}
              activityHistory={activityHistory}
            />
          </header>
        )}

        {currentTopicData ? (
          <>
            {/* Action buttons for focus and print */}
            <div className="hidden lg:flex items-center justify-end gap-2 px-6 py-2 border-b border-border bg-background">
              <StreakDisplay
                currentStreak={currentStreak}
                bestStreak={bestStreak}
                isActiveToday={isActiveToday()}
                canUseFreeze={canUseFreeze()}
                onUseFreeze={useFreeze}
                activityHistory={activityHistory}
              />
              <FocusModeButton onClick={() => setFocusModeOpen(true)} />
              <PrintButton
                title={currentTopicData.topic.title}
                categoryTitle={currentTopicData.category.title}
                certificationName={currentTopicData.certification.name}
              />
            </div>
            <ContentViewer
            ref={contentViewerRef}
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
            onQuizStateChange={handleQuizStateChange}
          />
          </>
        ) : (
          <WelcomeScreen
            certifications={certifications}
            onSelectFirstTopic={handleSelectFirstTopic}
            completedCounts={completedCounts}
            totalCounts={totalCounts}
            onStartExam={handleStartExam}
          />
        )}
      </div>

      {/* Mark as read dialog */}
      {currentTopicData && (
        <MarkAsReadDialog
          open={showMarkAsReadDialog}
          onOpenChange={setShowMarkAsReadDialog}
          onMarkAsRead={handleMarkAsReadAndNavigate}
          onSkip={handleSkipNavigation}
          onDoQuiz={handleDoQuiz}
          topicTitle={currentTopicData.topic.title}
          hasQuiz={currentHasQuiz}
          quizCompleted={currentQuizCompleted}
        />
      )}

      {/* Focus Mode */}
      {currentTopicData && (
        <FocusMode
          isOpen={focusModeOpen}
          onClose={() => setFocusModeOpen(false)}
          content={focusModeContent}
          title={currentTopicData.topic.title}
          categoryTitle={currentTopicData.category.title}
          certificationName={currentTopicData.certification.name}
          onNavigate={(dir) => {
            setFocusModeOpen(false);
            handleNavigate(dir);
          }}
          hasPrev={currentTopicIndex > 0}
          hasNext={currentTopicIndex < allTopics.length - 1}
        />
      )}

      {/* Exam Config Dialog */}
      {examCertification && (
        <ExamConfigDialog
          open={examConfigOpen}
          onOpenChange={setExamConfigOpen}
          certification={certifications.find(c => c.id === examCertification)!}
          onStart={handleExamConfigConfirm}
        />
      )}

      {/* Exam Loading Dialog */}
      <Dialog open={examLoading} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Préparation de l'examen...
            </DialogTitle>
            <DialogDescription>
              Récupération des questions depuis les fichiers quiz
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Progress 
              value={examLoadingProgress.total > 0 
                ? (examLoadingProgress.current / examLoadingProgress.total) * 100 
                : 0
              } 
              className="h-2"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Fiches analysées: {examLoadingProgress.current}/{examLoadingProgress.total}</span>
              <span className="text-accent">{examLoadingProgress.found} questions trouvées</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Exam Simulator */}
      {examRunning && examQuestions.length > 0 && examConfig && examCertification && (
        <ExamSimulator
          questions={examQuestions}
          timeLimit={examConfig.timeLimit}
          certificationName={certifications.find(c => c.id === examCertification)?.name || ''}
          onComplete={handleExamComplete}
          onClose={handleExamClose}
        />
      )}
      </div>
    </>
  );
};

export default Index;
