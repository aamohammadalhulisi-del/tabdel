import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useGetMe, User, useLogout, getGetMeQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading, error } = useGetMe({
    query: {
      retry: false,
      queryKey: getGetMeQueryKey(),
    }
  });
  const logoutMutation = useLogout();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        queryClient.setQueryData(getGetMeQueryKey(), null);
        setLocation('/login');
      }
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        isAuthenticated: !!user,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
