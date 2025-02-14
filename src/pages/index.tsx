import { ChatInterface } from '@/components/chat/ChatInterface';
import { ModelSelector } from '@/components/model/ModelSelector';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold text-[var(--foreground)]">
            MotherFluxer UI
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4">
        <ErrorBoundary>
          <div className="space-y-8">
            <ModelSelector />
            <ChatInterface />
          </div>
        </ErrorBoundary>
      </main>
    </div>
  );
} 