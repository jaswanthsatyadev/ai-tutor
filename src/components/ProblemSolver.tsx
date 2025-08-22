
'use client';

import { useState, useEffect, useRef } from 'react';
import type { ElementRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { generateExplanations, type GenerateExplanationsInput } from '@/ai/flows/generate-explanations';
import { generateMathSolution } from '@/ai/flows/generate-math-solution';
import { Loader2, ArrowRight, HelpCircle, Trophy, Upload, Mic, Type, Camera, Crop, FileText, Bot, PlayCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import type { Profile } from '@/lib/profiles';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import ReactCrop, { type Crop as ReactCropType, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';


interface ProblemSolverProps {
  profile: Profile;
}

function centerAspectCrop(
    mediaWidth: number,
    mediaHeight: number,
  ) {
    return centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        1, // Allow free aspect ratio
        mediaWidth,
        mediaHeight
      ),
      mediaWidth,
      mediaHeight
    )
}

export function ProblemSolver({ profile }: ProblemSolverProps) {
  const [explanations, setExplanations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [currentStepContent, setCurrentStepContent] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [photoDataUri, setPhotoDataUri] = useState<string | null>(null);
  
  const [fullSolution, setFullSolution] = useState<{english: string | null, telugu: string | null}>({ english: null, telugu: null });
  const [isFullSolutionLoading, setIsFullSolutionLoading] = useState(false);
  const [isProblemStarted, setIsProblemStarted] = useState(false);
  const [isExplanationStarted, setIsExplanationStarted] = useState(false);

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [crop, setCrop] = useState<ReactCropType>();
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollViewportRef = useRef<ElementRef<"div">>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isCameraOpen) {
      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setHasCameraPermission(true);
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings to use this feature.',
          });
        }
      };
      getCameraPermission();
    } else {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    }
  }, [isCameraOpen, toast]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUri = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUri);
        setIsCameraOpen(false);
        setIsCropOpen(true);
      }
    }
  };

  const handleCrop = () => {
    if (crop && imageRef.current && canvasRef.current) {
      const image = imageRef.current;
      const canvas = canvasRef.current;
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
  
      const cropX = crop.x * scaleX;
      const cropY = crop.y * scaleY;
      const cropWidth = crop.width * scaleX;
      const cropHeight = crop.height * scaleY;
  
      if (cropWidth === 0 || cropHeight === 0) {
        setPhotoDataUri(capturedImage);
        setIsCropOpen(false);
        setCapturedImage(null);
        setCrop(undefined);
        return;
      }
  
      canvas.width = cropWidth;
      canvas.height = cropHeight;
      const ctx = canvas.getContext('2d');
  
      if (ctx) {
        ctx.drawImage(
          image,
          cropX,
          cropY,
          cropWidth,
          cropHeight,
          0,
          0,
          cropWidth,
          cropHeight
        );
        const croppedDataUri = canvas.toDataURL('image/jpeg');
        setPhotoDataUri(croppedDataUri);
        setIsCropOpen(false);
        setCapturedImage(null);
        setCrop(undefined);
      }
    } else if (capturedImage) {
      setPhotoDataUri(capturedImage);
      setIsCropOpen(false);
      setCapturedImage(null);
    }
  };

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(
      width,
      height
    ));
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUri = event.target?.result as string;
        setCapturedImage(dataUri);
        setIsCropOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const startProblem = async () => {
    setExplanations([]);
    setIsFinished(false);
    setFullSolution({ english: null, telugu: null });
    setIsExplanationStarted(false);
    setIsProblemStarted(true);
  }

  const getFullAnswer = async (language: 'English' | 'Telugu') => {
    const langKey = language.toLowerCase() as 'english' | 'telugu';
    if (fullSolution[langKey] || isFullSolutionLoading) return;

    setIsFullSolutionLoading(true);
    try {
        const result = await generateMathSolution({
            problemStatement,
            photoDataUri: photoDataUri || undefined,
            studentProfile: `${profile.name}, ${profile.class}, ${profile.description}`,
            language,
        });
        setFullSolution(prev => ({ ...prev, [langKey]: result.solution }));
    } catch (error) {
        console.error(`Error generating ${language} answer:`, error);
        toast({
            variant: 'destructive',
            title: `Error generating ${language} answer`,
            description: 'There was a problem communicating with the AI tutor. Please try again.',
        });
    } finally {
        setIsFullSolutionLoading(false);
    }
  }
  
  const startStepByStepExplanation = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setIsExplanationStarted(true);
    setExplanations([]);
    try {
        const commonInput = {
            problemStatement,
            photoDataUri: photoDataUri || undefined,
            studentProfile: `${profile.name}, ${profile.class}, ${profile.description}`,
        };

        const explanationResult = await generateExplanations({
            ...commonInput,
            currentStep: 'Start of problem',
            explanationPreference: 'Explain the problem statement and what is given and what we need to find.',
        });
        
        const newExplanation = explanationResult.explanation;
        setExplanations([newExplanation]);
        setCurrentStepContent(newExplanation);

        if (newExplanation.toLowerCase().includes('final answer')) {
            setIsFinished(true);
        }
    } catch (error) {
        console.error('Error starting explanation:', error);
        toast({
            variant: 'destructive',
            title: 'Error starting explanation',
            description: 'There was a problem communicating with the AI tutor. Please try again.',
        });
    } finally {
        setIsLoading(false);
    }
  }


  const fetchNextStep = async () => {
    if (isFinished || isLoading) return;
    setIsLoading(true);
    try {
      const input: GenerateExplanationsInput = {
        problemStatement,
        currentStep: currentStepContent,
        studentProfile: `${profile.name}, ${profile.class}, ${profile.description}`,
        explanationPreference: 'Explain the next step.',
        photoDataUri: photoDataUri || undefined
      };
      const result = await generateExplanations(input);
      const newExplanation = result.explanation;

      setExplanations((prev) => [...prev, newExplanation]);
      setCurrentStepContent(newExplanation);

      if (newExplanation.toLowerCase().includes('final answer')) {
        setIsFinished(true);
      }
    } catch (error) {
      console.error('Error generating next step:', error);
      toast({
        variant: 'destructive',
        title: 'Error getting next step',
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
            photoDataUri: photoDataUri || undefined
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
    <>
    <Card className="flex h-full flex-col shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-primary">
          Problem to Solve
        </CardTitle>
        <CardDescription className="pt-2">
            Enter the problem below, upload an image, take a photo, or use your voice.
        </CardDescription>
        <div className="space-y-2 pt-2">
            <div className="relative">
                <Textarea 
                    placeholder="Type your math problem or instructions here..."
                    value={problemStatement}
                    onChange={(e) => setProblemStatement(e.target.value)}
                    className="pr-10"
                    rows={2}
                />
                 <Type className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
            </div>
            {photoDataUri && (
                <div className="relative group">
                    <img src={photoDataUri} alt="Problem preview" className="rounded-md max-h-40 w-auto" />
                    <Button variant="destructive" size="sm" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setPhotoDataUri(null)}>
                        Remove
                    </Button>
                </div>
            )}
            <div className="flex flex-col sm:flex-row gap-2">
                 <div className="flex-1">
                    <Input type="file" accept="image/*" onChange={handleFileChange} className="hidden" ref={fileInputRef} />
                    <Button variant="outline" className="w-full justify-start" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="mr-2" />
                        Select from Gallery
                    </Button>
                 </div>
                 <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="flex-1 sm:flex-none" onClick={() => setIsCameraOpen(true)}>
                        <Camera className="h-5 w-5" />
                    </Button>
                    <Button variant="outline" size="icon" className="flex-1 sm:flex-none" onClick={() => toast({ title: "Voice input coming soon!"})}>
                        <Mic className="h-5 w-5" />
                    </Button>
                 </div>
            </div>
        </div>
        <div className="pt-4 flex flex-wrap gap-2 items-center">
            <Button onClick={startProblem} disabled={isLoading || (!problemStatement && !photoDataUri) || isProblemStarted}>
              <ArrowRight className="mr-2" />
              Start Solving
            </Button>
             {isProblemStarted && !isExplanationStarted && !isLoading && (
                 <>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="secondary" onClick={() => getFullAnswer('English')}>
                                <FileText className="mr-2" />
                                Show Full Answer in English
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Full Answer (English)</DialogTitle>
                            </DialogHeader>
                            <ScrollArea className="max-h-[70vh] w-full pr-4 mt-4">
                                {(isFullSolutionLoading && !fullSolution.english) && (
                                    <div className="flex items-center justify-center text-muted-foreground p-8">
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Generating answer...
                                    </div>
                                )}
                                {fullSolution.english && (
                                    <p className="whitespace-pre-wrap font-code text-sm">
                                        {fullSolution.english}
                                    </p>
                                )}
                            </ScrollArea>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button>Close</Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="secondary" onClick={() => getFullAnswer('Telugu')}>
                                <FileText className="mr-2" />
                                Show Full Answer in Telugu
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Full Answer (Telugu)</DialogTitle>
                            </DialogHeader>
                            <ScrollArea className="max-h-[70vh] w-full pr-4 mt-4">
                                {(isFullSolutionLoading && !fullSolution.telugu) && (
                                    <div className="flex items-center justify-center text-muted-foreground p-8">
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Generating answer...
                                    </div>
                                )}
                                {fullSolution.telugu && (
                                    <p className="whitespace-pre-wrap font-code text-sm">
                                        {fullSolution.telugu}
                                    </p>
                                )}
                            </ScrollArea>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button>Close</Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Button variant="secondary" onClick={startStepByStepExplanation}>
                        <PlayCircle className="mr-2" />
                        Start Step-by-Step Explanation
                    </Button>
                 </>
            )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-[40vh] sm:h-[450px] w-full pr-4" viewportRef={scrollViewportRef}>
          <div className="space-y-6">
            {!isProblemStarted && !isLoading && (
              <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-full">
                <Bot className="h-12 w-12 mb-4" />
                <h3 className="text-lg font-semibold">Ready to learn?</h3>
                <p className="max-w-sm">Enter a problem and click "Start Solving" to begin.</p>
              </div>
            )}
            {isProblemStarted && !isExplanationStarted && !isLoading && (
              <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-full">
                <FileText className="h-12 w-12 mb-4" />
                <h3 className="text-lg font-semibold">Problem Ready</h3>
                <p className="max-w-sm">You can view the full answer or start a detailed step-by-step explanation.</p>
              </div>
            )}
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
            {isLoading && isExplanationStarted && explanations.length === 0 && (
              <div className="flex items-center justify-center text-muted-foreground h-full">
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
      {isExplanationStarted && explanations.length > 0 && (
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
                onClick={fetchNextStep}
                disabled={isLoading || isFinished}
                className="bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
            >
                {isFinished ? "Problem Solved!" : (isLoading ? "Thinking..." : "Next Step")}
                {isLoading ? <Loader2 className="ml-2 animate-spin" /> : <ArrowRight className="ml-2" />}
            </Button>
            </div>
        </CardFooter>
      )}
    </Card>
    <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Take a Photo</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            <div className="w-full relative">
              <video ref={videoRef} className="w-full aspect-video rounded-md bg-black" autoPlay muted playsInline />
              <canvas ref={canvasRef} className="hidden" />
              {hasCameraPermission === false && (
                 <div className="absolute inset-0 flex items-center justify-center">
                    <Alert variant="destructive" className="w-auto">
                        <AlertTitle>Camera Access Denied</AlertTitle>
                        <AlertDescription>
                            Please enable camera access in your browser.
                        </AlertDescription>
                    </Alert>
                 </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="secondary">Cancel</Button>
            </DialogClose>
            <Button onClick={handleCapture} disabled={!hasCameraPermission}>
              Capture
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isCropOpen} onOpenChange={(isOpen) => {
        setIsCropOpen(isOpen);
        if (!isOpen) {
            setCapturedImage(null);
            setCrop(undefined);
        }
      }}>
        <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
                <DialogTitle>Crop Image</DialogTitle>
            </DialogHeader>
            {capturedImage && (
                <div className="flex justify-center">
                    <ReactCrop
                        crop={crop}
                        onChange={(_, percentCrop) => setCrop(percentCrop)}
                    >
                        <img ref={imageRef} src={capturedImage} alt="To crop" style={{maxHeight: "70vh"}} onLoad={onImageLoad}/>
                    </ReactCrop>
                </div>
            )}
            <DialogFooter>
                <Button variant="secondary" onClick={() => { setIsCropOpen(false); setCapturedImage(null); setCrop(undefined)}}>Cancel</Button>
                <Button onClick={handleCrop}>
                    <Crop className="mr-2" />
                    Crop and Use Image
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
