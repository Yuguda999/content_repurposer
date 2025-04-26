import { useState, useEffect } from 'react';
import { User, AuthResponse } from '../types';
import { authAPI } from '../services/api';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // In a real app, you would validate the token with the server
          // For now, we'll just assume the token is valid and set a mock user
          setUser({
            id: '1',
            email: 'user@example.com',
            full_name: 'Example User',
          });
        } catch (error) {
          console.error('Error validating token:', error);
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      // In a real app, you would make an API call here
      // For now, we'll just simulate a successful login
      // const response: AuthResponse = await authAPI.login(email, password);
      // localStorage.setItem('token', response.access_token);

      // Simulate successful login
      localStorage.setItem('token', 'mock-token');

      // Set user data
      setUser({
        id: '1',
        email,
        full_name: 'Example User',
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };
};
