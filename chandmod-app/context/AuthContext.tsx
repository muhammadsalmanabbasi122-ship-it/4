import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  photoUrl: string | null;
  createdAt: string;
  apkCount: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const USERS_KEY = "@chandmod_users";
const CURRENT_USER_KEY = "@chandmod_current_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const stored = await AsyncStorage.getItem(CURRENT_USER_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
    } finally {
      setIsLoading(false);
    }
  }

  async function getUsers(): Promise<Record<string, User & { password: string }>> {
    const stored = await AsyncStorage.getItem(USERS_KEY);
    return stored ? JSON.parse(stored) : {};
  }

  async function login(email: string, password: string) {
    const users = await getUsers();
    const found = Object.values(users).find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) throw new Error("Incorrect email or password.");
    const { password: _, ...userWithoutPass } = found;
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPass));
    setUser(userWithoutPass);
  }

  async function signup(name: string, email: string, password: string) {
    const users = await getUsers();
    const exists = Object.values(users).find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (exists) throw new Error("This email is already registered.");

    const newUser: User & { password: string } = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name,
      email,
      password,
      photoUrl: null,
      createdAt: new Date().toISOString(),
      apkCount: 0,
    };

    users[newUser.id] = newUser;
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    const { password: _, ...userWithoutPass } = newUser;
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPass));
    setUser(userWithoutPass);
  }

  async function logout() {
    await AsyncStorage.removeItem(CURRENT_USER_KEY);
    setUser(null);
  }

  async function updateProfile(updates: Partial<User>) {
    if (!user) return;
    const updated = { ...user, ...updates };
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));

    const users = await getUsers();
    if (users[user.id]) {
      users[user.id] = { ...users[user.id], ...updates };
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    setUser(updated);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
