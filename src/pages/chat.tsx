// src/pages/chat.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { authService } from '@/lib/services/auth.service';

export default function Chat() {
  const router = useRouter();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto py-6 px-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-[var(--foreground)]">
            MotherFluxer Chat
          </h1>
          <button
            onClick={() => {
              authService.logout();
              router.push('/login');
            }}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4">
        <ErrorBoundary>
          <ChatInterface />  {/* This uses your existing ChatInterface component */}
        </ErrorBoundary>
      </main>
    </div>
  );
}