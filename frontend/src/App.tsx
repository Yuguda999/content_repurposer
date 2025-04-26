import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import './App.css';

// Theme
import { ThemeProvider } from './theme/ThemeProvider';

// Components
import Layout from './components/Layout';
import PageTransition from './components/PageTransition';
import LoadingSpinner from './components/LoadingSpinner';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import NewContent from './pages/NewContent';
import JobList from './pages/JobList';
import JobDetail from './pages/JobDetail';
import NotFound from './pages/NotFound';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <LoadingSpinner message="Authenticating..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

// AppContent component to use hooks that require Router context
const AppContent = () => {
  const location = useLocation();

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/login" element={
            <PageTransition>
              <Login />
            </PageTransition>
          } />
          <Route path="/signup" element={
            <PageTransition>
              <Signup />
            </PageTransition>
          } />
          <Route path="/" element={<Layout />}>
            <Route index element={
              <ProtectedRoute>
                <PageTransition>
                  <Dashboard />
                </PageTransition>
              </ProtectedRoute>
            } />
            <Route path="new" element={
              <ProtectedRoute>
                <PageTransition>
                  <NewContent />
                </PageTransition>
              </ProtectedRoute>
            } />
            <Route path="jobs" element={
              <ProtectedRoute>
                <PageTransition>
                  <JobList />
                </PageTransition>
              </ProtectedRoute>
            } />
            <Route path="jobs/:jobId" element={
              <ProtectedRoute>
                <PageTransition>
                  <JobDetail />
                </PageTransition>
              </ProtectedRoute>
            } />
            <Route path="*" element={
              <PageTransition>
                <NotFound />
              </PageTransition>
            } />
          </Route>
        </Routes>
      </AnimatePresence>
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AppContent />
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
