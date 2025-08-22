'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { ProblemSolver } from '@/components/ProblemSolver';
import { ProgressTracker } from '@/components/ProgressTracker';

export default function Home() {
  const [progress, setProgress] = useState(0);

  const handleProgressUpdate = (newProgress: number) => {
    setProgress(Math.min(100, newProgress));
  };

  return (
    <div className="flex min-h-full flex-col bg-background">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ProblemSolver onProgressUpdate={handleProgressUpdate} />
            </div>
            <div className="lg:col-span-1">
              <div className="space-y-8 sticky top-8">
                <ProgressTracker currentProgress={progress} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
