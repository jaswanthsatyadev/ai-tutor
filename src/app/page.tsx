'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { ProblemSolver } from '@/components/ProblemSolver';
import { ProfileSelector } from '@/components/ProfileSelector';
import type { Profile } from '@/lib/profiles';

export default function Home() {
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  return (
    <div className="flex min-h-full flex-col bg-background">
      <ProfileSelector
        isOpen={!selectedProfile}
        onProfileSelect={setSelectedProfile}
      />
      {selectedProfile && (
        <>
          <Header profile={selectedProfile} />
          <main className="flex-grow">
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
              <div className="grid grid-cols-1 gap-8">
                <ProblemSolver profile={selectedProfile} />
              </div>
            </div>
          </main>
        </>
      )}
    </div>
  );
}
