'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { ProblemSolver } from '@/components/ProblemSolver';
import { ProfileSelector } from '@/components/ProfileSelector';
import type { Profile } from '@/lib/profiles';

export default function Home() {
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  return (
    <div className="flex h-screen flex-col bg-background">
      <ProfileSelector
        isOpen={!selectedProfile}
        onProfileSelect={setSelectedProfile}
      />
      {selectedProfile && (
        <>
          <Header profile={selectedProfile} />
          <main className="flex-grow overflow-y-auto">
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
              <div className="grid grid-cols-1 gap-8">
                <ProblemSolver profile={selectedProfile} />
              </div>
            </div>
          </main>
          <footer className="py-2 text-center text-sm text-muted-foreground border-t">
            <p>Created by Jaswanth Satya Dev</p>
          </footer>
        </>
      )}
    </div>
  );
}
