import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { authService } from '@/lib/services/auth.service';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (authService.isAuthenticated()) {
      router.push('/chat');
    } else {
      router.push('/login');
    }
  }, [router]);

  return null; // No need to render anything as we're redirecting
} 