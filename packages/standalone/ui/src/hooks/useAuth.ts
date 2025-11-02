import { useState, useEffect } from 'react';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const response = await fetch('/api/v1/auth/me', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(data.authenticated);
        setUser(data.user);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to check authentication:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(username: string, password: string) {
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    setIsAuthenticated(true);
    setUser(data.user);
    return data;
  }

  async function logout() {
    await fetch('/api/v1/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });

    setIsAuthenticated(false);
    setUser(null);
  }

  return {
    isAuthenticated,
    loading,
    user,
    login,
    logout,
    checkAuth,
  };
}
