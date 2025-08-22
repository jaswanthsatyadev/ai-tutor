import { Target, Trophy } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ProgressTrackerProps {
  currentProgress: number;
}

export function ProgressTracker({ currentProgress }: ProgressTrackerProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-accent" />
          <span>Your Progress</span>
        </CardTitle>
        <CardDescription>Subject: 9th Class Mathematics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="mb-2 flex justify-between text-sm font-medium text-muted-foreground">
            <span>Problem Completion</span>
            <span className="font-bold text-primary">{Math.round(currentProgress)}%</span>
          </div>
          <Progress value={currentProgress} className="h-2 [&>div]:bg-primary" />
        </div>
        <div className="flex items-start gap-3 rounded-md border border-dashed p-3 text-sm text-muted-foreground">
          <Target className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
          <span><span className="font-semibold text-foreground">Current Focus:</span> Solving Linear Equations</span>
        </div>
      </CardContent>
    </Card>
  );
}
