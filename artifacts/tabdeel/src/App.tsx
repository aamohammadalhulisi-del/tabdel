import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Layout } from '@/components/layout/Layout';
import WelcomeAd from '@/components/ads/WelcomeAd';
// Pages
import Home from '@/pages/Home';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import Browse from '@/pages/listings/Browse';
import CreateListing from '@/pages/listings/CreateListing';
import ListingDetail from '@/pages/listings/ListingDetail';
import Profile from '@/pages/profile/Profile';
import SwapRequests from '@/pages/swap/SwapRequests';
import Conversations from '@/pages/chat/Conversations';
import Chat from '@/pages/chat/Chat';
import Notifications from '@/pages/notifications/Notifications';
import AdminDashboard from '@/pages/admin/AdminDashboard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        
        <Route path="/listings" component={Browse} />
        <Route path="/listings/new">
          <ProtectedRoute>
            <CreateListing />
          </ProtectedRoute>
        </Route>
        <Route path="/listings/:id" component={ListingDetail} />
        
        <Route path="/profile">
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        </Route>
        <Route path="/profile/:id" component={Profile} />
        
        <Route path="/swap-requests">
          <ProtectedRoute>
            <SwapRequests />
          </ProtectedRoute>
        </Route>
        
        <Route path="/conversations">
          <ProtectedRoute>
            <Conversations />
          </ProtectedRoute>
        </Route>
        <Route path="/conversations/:id">
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        </Route>
        
        <Route path="/notifications">
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        </Route>
        
        <Route path="/admin">
          <ProtectedRoute requireAdmin={true}>
            <AdminDashboard />
          </ProtectedRoute>
        </Route>
        
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <AuthProvider>
          <TooltipProvider>
            <Router />
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;