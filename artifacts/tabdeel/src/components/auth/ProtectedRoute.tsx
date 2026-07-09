import { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';

export function ProtectedRoute({ children, requireAdmin = false }: { children: ReactNode, requireAdmin?: boolean }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    setLocation('/login');
    return null;
  }

  if (requireAdmin && !user?.isAdmin) {
    setLocation('/');
    return null;
  }

  return <>{children}</>;
}
