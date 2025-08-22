import { BookOpen, User } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b bg-card sticky top-0 z-10">
      <div className="container mx-auto flex h-16 items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BookOpen className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold text-primary sm:text-2xl">
            IIT Foundation Ace
          </h1>
        </div>
        <div className="hidden items-center gap-3 rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground sm:flex">
          <User className="h-5 w-5 text-primary" />
          <span>Student: <strong>Deepak (9th Class)</strong></span>
        </div>
      </div>
    </header>
  );
}
