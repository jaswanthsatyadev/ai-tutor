'use client';

import { useState, useEffect, useRef } from 'react';
import type { ElementRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { generateExplanations, type GenerateExplanationsInput } from '@/ai/flows/generate-explanations';
import { Loader2, ArrowRight, HelpCircle, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

const problemStatement = 'Find the value of x if 2x + 5 = 15.';
const studentProfile = 'Deepak, 9th class, IIT Foundation track, focus: Mathematics first, then Science. Slow learner.';
const totalSteps = 5; // An estimate for the progress bar

interface ProblemSolverProps {
  onProgressUpdate: (progress: number) => void;
}

export function ProblemSolver({ onProgressUpdate }: ProblemSolverProps) {
  const [explanations, setExplanations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [currentStepContent, setCurrentStepContent] = useState('Start of problem');
  const scrollViewportRef = useRef<ElementRef<"div">>(null);
  const { toast } = useToast();

  const fetchExplanation = async (stepContent: string, preference: string) => {
    if (isFinished) return;
    setIsLoading(true);
    try {
      const input: GenerateExplanationsInput = {
        problemStatement,
        currentStep: stepContent,
        studentProfile,
        explanationPreference: preference,
      };
      const result = await generateExplanations(input);
      const newExplanation = result.explanation;

      setExplanations((prev) => [...prev, newExplanation]);
      setCurrentStepContent(newExplanation);
      onProgressUpdate(((explanations.length + 1) / totalSteps) * 100);

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
            studentProfile,
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
    fetchExplanation('Start of problem', 'Explain the problem statement and what is given and what we need to find.');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        <CardDescription className="pt-2 font-code text-lg">
          {problemStatement}
        </CardDescription>
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
            {isLoading && (
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
                        <h3 className="font-bold">Great job, Deepak!</h3>
                        <p>You have successfully solved the problem.</p>
                    </div>
                </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t bg-slate-50 pt-6">
        <div className="flex w-full flex-col-reverse gap-4 sm:flex-row sm:justify-between">
          <Button
            variant="outline"
            onClick={reFetchExplanation}
            disabled={isLoading || explanations.length === 0 || isFinished}
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
    </Card>
  );
}
