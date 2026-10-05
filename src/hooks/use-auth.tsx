
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { User, UserType, Role } from '@/lib/types';
import { USERS as initialUsers } from '@/lib/data';
import Loading from '@/app/loading';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  allUsers: User[];
  login: (usernameOrEmail: string, password?: string) => void;
  logout: () => void;
  isLoading: boolean;
  addUser: (user: Omit<User, 'id' | 'status' | 'password'>) => void;
  approveUser: (userId: string) => void;
  rejectUser: (userId: string) => void;
  updateUser: (userId: string, data: Partial<User>) => void;
  deleteUser: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const USERS_STORAGE_KEY = 'agilebridge-all-users';
const CURRENT_USER_STORAGE_KEY = 'agilebridge-user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize users from localStorage or initial data
  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      } else {
        setUsers(initialUsers);
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initialUsers));
      }
    } catch (error) {
      console.error("Failed to initialize users from localStorage", error);
      setUsers(initialUsers);
    }
  }, []);

  // Effect to manage the currently logged-in user
  useEffect(() => {
    // Only run this effect if the users array has been populated
    if (users.length === 0) return;

    try {
      const storedUser = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        const freshUser = users.find(u => u.id === parsedUser.id);
        if (freshUser && freshUser.status === 'active') {
          setUser(freshUser);
        } else {
          // If user is no longer valid (e.g. deleted or not active), log them out
          logout();
        }
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
      setUser(null);
    } finally {
      // We are done loading once we have checked for a user.
      setIsLoading(false);
    }
  }, [users]);
  
  const updateUsersState = (newUsers: User[]) => {
      setUsers(newUsers);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(newUsers));
  }


  const login = (usernameOrEmail: string, password?: string) => {
    const foundUser = users.find(u => (u.email === usernameOrEmail || u.username === usernameOrEmail));
    
    if (!foundUser) {
        throw new Error("Invalid credentials");
    }

    if (foundUser.status === 'pending') {
        throw new Error("Your account is pending approval.");
    }
    
    if (foundUser.password === password) {
        localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(foundUser));
        setUser(foundUser);
        router.push('/dashboard');
    } else {
        console.error("Login failed: Password incorrect");
        throw new Error("Invalid credentials");
    }
  };

  const logout = () => {
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    setUser(null);
    router.push('/login');
  };
  
  const addUser = (newUser: Omit<User, 'id' | 'status' | 'password'>) => {
    const userExists = users.some(u => u.email === newUser.email || u.username === newUser.username);
    if(userExists) {
        throw new Error("User with this email or username already exists.");
    }
    const userWithDefaults: User = {
        ...newUser,
        id: String(Date.now()), // Use a more unique ID
        password: newUser.password,
        userType: 'User',
        status: 'pending', // Default status
    };
    updateUsersState([...users, userWithDefaults]);
  };

  const approveUser = (userId: string) => {
    const newUsers = users.map(u => u.id === userId ? { ...u, status: 'active' as 'active' } : u);
    updateUsersState(newUsers);
  };

  const rejectUser = (userId: string) => {
    const newUsers = users.filter(u => u.id !== userId);
    updateUsersState(newUsers);
  }
  
  const deleteUser = (userId: string) => {
    const newUsers = users.filter(u => u.id !== userId);
    updateUsersState(newUsers);
  }

  const updateUser = (userId: string, data: Partial<User>) => {
    setUsers(currentUsers => {
        const newUsers = currentUsers.map(u => u.id === userId ? { ...u, ...data } : u);
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(newUsers));
        if (user?.id === userId) {
            const updatedCurrentUser = newUsers.find(u => u.id === userId);
            if (updatedCurrentUser) {
                setUser(updatedCurrentUser);
                localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(updatedCurrentUser));
            }
        }
        return newUsers;
    });
  };

  const value = {
    isAuthenticated: !!user,
    user,
    allUsers: users,
    login,
    logout,
    isLoading,
    addUser,
    approveUser,
    rejectUser,
    updateUser,
    deleteUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
