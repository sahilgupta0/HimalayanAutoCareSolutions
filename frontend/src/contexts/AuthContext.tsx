import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import { mockUsers } from '@/data/mockData';
import { login as apiLogin } from '@/api/apiCall';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('inventoryUser');
    if (storedUser) {
      try {
        const id = localStorage.getItem('id');
        const name = localStorage.getItem('name');
        const role = localStorage.getItem('role');
        const email = localStorage.getItem('email');

        setUser({
          id: id,
          name: name,
          role: role as UserRole,
          email: email,
        });
      } catch {
        // localStorage.removeItem('inventoryUser');
        console.error('Failed to parse stored user data');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock authentication - in real app, this would call an API
    // const foundUser = mockUsers.find(u => u.email === email );
    const result = await apiLogin(email, password);

    if (result.success === false) {
      return { success: false, error: 'Invalid email or password' };
    }

    // For demo, any password works for valid emails
    // if (password.length < 1) {
    //   return { success: false, error: 'Password is required' };
    // }

    setUser(result.data.user);
    localStorage.setItem('inventoryUser', result.data.token);
    localStorage.setItem('id', result.data.user._id);
    localStorage.setItem('name', result.data.user.name);
    localStorage.setItem('role', result.data.user.role);
    localStorage.setItem('email', result.data.user.email);

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('id');
    localStorage.removeItem('inventoryUser');
    localStorage.removeItem('name');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
  };

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasRole,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
