import React from 'react';
import { Button } from "@/components/ui/button";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { AuthForm } from './auth-form';
import { ThemeToggle } from '@/components/theme-toggle';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const { user, signOut, authStatus } = useAuthenticator();

  if (authStatus !== 'authenticated') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>
        <AuthForm />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-14 items-center px-4">
          <div className="flex flex-1 items-center justify-between">
            <span className="font-semibold">Welcome, {user?.username}</span>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button variant="outline" onClick={signOut}>
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="container py-6">
        {children}
      </main>
    </div>
  );
}
