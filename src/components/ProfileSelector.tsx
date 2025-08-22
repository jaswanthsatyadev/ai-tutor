'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { profiles, type Profile } from '@/lib/profiles';
import { User } from 'lucide-react';

interface ProfileSelectorProps {
  isOpen: boolean;
  onProfileSelect: (profile: Profile) => void;
}

export function ProfileSelector({ isOpen, onProfileSelect }: ProfileSelectorProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Who are you?</DialogTitle>
          <DialogDescription>
            Select your profile to start learning.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {profiles.map((profile) => (
            <Card
              key={profile.id}
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => onProfileSelect(profile)}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={profile.avatar} alt={profile.name} />
                  <AvatarFallback>
                    <User className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{profile.name}</h3>
                  <p className="text-sm text-muted-foreground">{profile.class}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
