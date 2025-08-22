'use client';

import { useState, useEffect, useRef } from 'react';
import type { ElementRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { generateExplanations, type GenerateExplanationsInput } from '@/ai/flows/generate-explanations';
import { Loader2, ArrowRight, HelpCircle, Trophy, Upload, Mic, Type } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import type { Profile } from '@/lib/profiles';

interface ProblemSolverProps {
  profile: Profile;
}

export function ProblemSolver({ profile }: ProblemSolverProps) {
  const [explanations, setExplanations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [currentStepContent, setCurrentStepContent] = useState('');
  const [problemStatement, setProblemStatement] = useState('Find the value of x if 2x + 5 = 15.');
  const [photo, setPhoto] = useState<File | null>(null);
  
  const scrollViewportRef = useRef<ElementRef<"div">>(null);
  const { toast } = useToast();

  const startProblem = async () => {
    setExplanations([]);
    setIsFinished(false);
    setIsLoading(true);

    let photoDataUri: string | undefined = undefined;
    if (photo) {
        const reader = new FileReader();
        reader.onload = async (e) => {
            photoDataUri = e.target?.result as string;
            await fetchExplanation('Start of problem', 'Explain the problem statement and what is given and what we need to find.', photoDataUri);
        };
        reader.readAsDataURL(photo);
    } else {
        await fetchExplanation('Start of problem', 'Explain the problem statement and what is given and what we need to find.');
    }
  }

  const fetchExplanation = async (stepContent: string, preference: string, photoDataUri?: string) => {
    if (isFinished && preference !== 'I did not understand. Please re-explain this step more slowly using simpler examples from Indian teaching style, daily life metaphors, and common objects.') return;
    setIsLoading(true);
    try {
      const input: GenerateExplanationsInput = {
        problemStatement,
        currentStep: stepContent,
        studentProfile: `${profile.name}, ${profile.class}, ${profile.description}`,
        explanationPreference: preference,
        photoDataUri: photoDataUri
      };
      const result = await generateExplanations(input);
      const newExplanation = result.explanation;

      setExplanations((prev) => [...prev, newExplanation]);
      setCurrentStepContent(newExplanation);

      if (newExplanation.toLowerCase().includes('final answer')) {
        setIsFinished(true);
      }
    } catch (error) {
      console.error('Error generating explanation:', error);
      toast({
        variant: 'destructive',
        title: 'Error generating explanation',
        description: 'There was a problem communicating with the AI tutor. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const reFetchExplanation = async () => {
    if (explanations.length === 0 || isLoading) return;
    setIsLoading(true);
    try {
        const lastExplanation = explanations[explanations.length - 1];
        const input: GenerateExplanationsInput = {
            problemStatement,
            currentStep: lastExplanation,
            studentProfile: `${profile.name}, ${profile.class}, ${profile.description}`,
            explanationPreference: 'I did not understand. Please re-explain this step more slowly using simpler examples from Indian teaching style, daily life metaphors, and common objects.',
        };
        const result = await generateExplanations(input);
        const newExplanation = result.explanation;

        setExplanations((prev) => {
            const updatedExplanations = [...prev];
            updatedExplanations[updatedExplanations.length - 1] = newExplanation;
            return updatedExplanations;
        });
        setCurrentStepContent(newExplanation);
    } catch (error) {
        console.error('Error re-generating explanation:', error);
        toast({
            variant: 'destructive',
            title: 'Error re-generating explanation',
            description: 'There was a problem communicating with the AI tutor. Please try again.',
        });
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    if (scrollViewportRef.current) {
        scrollViewportRef.current.scrollTop = scrollViewportRef.current.scrollHeight;
    }
  }, [explanations]);

  return (
    <Card className="flex h-full flex-col shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-primary">
          Problem to Solve
        </CardTitle>
        <CardDescription className="pt-2">
            Enter the problem below, upload an image, or use your voice.
        </CardDescription>
        <div className="space-y-2 pt-2">
            <div className="relative">
                <Textarea 
                    placeholder="Type your math problem here..."
                    value={problemStatement}
                    onChange={(e) => setProblemStatement(e.target.value)}
                    className="pr-10"
                />
                 <Type className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex gap-2">
                 <div className="relative flex-1">
                    <Input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)} className="pl-10" />
                    <Upload className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                 </div>
                 <Button variant="outline" size="icon" onClick={() => toast({ title: "Voice input coming soon!"})}>
                    <Mic className="h-5 w-5" />
                 </Button>
            </div>
        </div>
        <div className="pt-4">
            <Button onClick={startProblem} disabled={isLoading || !problemStatement}>
                <ArrowRight className="mr-2" />
                Start Solving
            </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-[450px] w-full pr-4" viewportRef={scrollViewportRef}>
          <div className="space-y-6">
            {explanations.map((exp, index) => (
              <div key={index} className="animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
                    {index + 1}
                  </div>
                  <div className="flex-1 rounded-md border bg-secondary/50 p-4">
                    <p className="whitespace-pre-wrap font-body leading-relaxed text-foreground">
                        {exp}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && explanations.length === 0 && (
              <div className="flex items-center justify-center text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Your AI tutor is preparing your first explanation...
              </div>
            )}
            {isLoading && explanations.length > 0 && (
              <div className="flex items-center gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
                <div className="flex-1 rounded-md border bg-secondary/50 p-4 text-muted-foreground">
                    Your tutor is thinking...
                </div>
              </div>
            )}
            {isFinished && (
                <div className="flex items-center gap-4 rounded-lg border-2 border-green-500 bg-green-50 p-4 text-green-800 animate-in fade-in duration-500">
                    <Trophy className="h-8 w-8 flex-shrink-0 text-green-600" />
                    <div>
                        <h3 className="font-bold">Great job, {profile.name}!</h3>
                        <p>You have successfully solved the problem.</p>
                    </div>
                </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      {explanations.length > 0 && (
        <CardFooter className="border-t bg-slate-50 pt-6">
            <div className="flex w-full flex-col-reverse gap-4 sm:flex-row sm:justify-between">
            <Button
                variant="outline"
                onClick={reFetchExplanation}
                disabled={isLoading || isFinished}
                className="border-accent text-accent-foreground hover:bg-accent/10 hover:text-accent-foreground"
            >
                <HelpCircle />
                I didn't understand
            </Button>
            <Button
                onClick={() => fetchExplanation(currentStepContent, 'Explain the next step.')}
                disabled={isLoading || isFinished}
                className="bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
            >
                {isFinished ? "Problem Solved!" : (isLoading ? "Thinking..." : "Next Step")}
                {isLoading ? <Loader2 className="animate-spin" /> : <ArrowRight />}
            </Button>
            </div>
        </CardFooter>
      )}
    </Card>
  );
}
