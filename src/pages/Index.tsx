import { useState } from 'react';
import { ImageUpload } from '@/components/ImageUpload';
import { ExplanationCard } from '@/components/ExplanationCard';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, PlayCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Explanation {
  term: string;
  explanation: string;
}

const Index = () => {
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [explanations, setExplanations] = useState<Explanation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSpeakingAll, setIsSpeakingAll] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!imageBase64) {
      toast({
        title: 'No image uploaded',
        description: 'Please upload a flowchart first',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);
    setExplanations([]);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-flowchart', {
        body: { imageBase64 },
      });

      if (error) throw error;

      if (data?.explanations) {
        setExplanations(Array.isArray(data.explanations) ? data.explanations : []);
        toast({
          title: 'Analysis complete!',
          description: `Found ${data.explanations.length} concepts to explain`,
        });
      } else {
        throw new Error('No explanations received');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: 'Analysis failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSpeakAll = () => {
    if (isSpeakingAll) {
      window.speechSynthesis.cancel();
      setIsSpeakingAll(false);
      return;
    }

    setIsSpeakingAll(true);
    
    const fullText = explanations
      .map(exp => `${exp.term}: ${exp.explanation}`)
      .join('. Next topic: ');

    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onend = () => setIsSpeakingAll(false);
    utterance.onerror = () => setIsSpeakingAll(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 space-y-8">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              AI-Powered Learning
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Flowchart
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              {' '}Explainer
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload any flowchart and get instant AI-powered explanations with text and audio support
          </p>
        </div>

        {/* Upload Section */}
        <div className="space-y-6">
          <ImageUpload 
            onImageUpload={setImageBase64} 
            isLoading={isAnalyzing}
          />
          
          {imageBase64 && !isAnalyzing && explanations.length === 0 && (
            <div className="text-center">
              <Button 
                onClick={handleAnalyze}
                size="lg"
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity shadow-medium"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Analyze Flowchart
              </Button>
            </div>
          )}

          {isAnalyzing && (
            <div className="text-center py-12 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <div className="space-y-2">
                <p className="text-lg font-medium">Analyzing your flowchart...</p>
                <p className="text-sm text-muted-foreground">
                  AI is identifying and explaining each concept
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        {explanations.length > 0 && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                Explanations ({explanations.length})
              </h2>
              <Button
                onClick={handleSpeakAll}
                variant="outline"
                className="gap-2"
              >
                <PlayCircle className="h-4 w-4" />
                {isSpeakingAll ? 'Stop All' : 'Play All'}
              </Button>
            </div>

            <div className="grid gap-4">
              {explanations.map((exp, index) => (
                <ExplanationCard
                  key={index}
                  term={exp.term}
                  explanation={exp.explanation}
                  index={index}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Index;
