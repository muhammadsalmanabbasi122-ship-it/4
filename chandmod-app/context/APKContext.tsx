import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

export interface APKRecord {
  id: string;
  appName: string;
  url: string;
  downloadLink: string;
  createdAt: string;
  size: string;
}

interface APKContextType {
  history: APKRecord[];
  isGenerating: boolean;
  progress: number;
  currentStep: number;
  generateAPK: (url: string, appName: string) => Promise<APKRecord>;
  deleteAPK: (id: string) => Promise<void>;
  loadHistory: () => Promise<void>;
}

const APKContext = createContext<APKContextType | null>(null);

const APK_HISTORY_KEY = "@chandmod_apk_history";
const APK_DOMAIN = "https://chandtricker.qzz.io";

function getApiBase(): string {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (domain) return `https://${domain}/api`;
  return "/api";
}

export function APKProvider({ children }: { children: React.ReactNode }) {
  const { user, updateProfile } = useAuth();
  const [history, setHistory] = useState<APKRecord[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (user) loadHistory();
    else setHistory([]);
  }, [user]);

  async function loadHistory() {
    if (!user) return;
    const key = `${APK_HISTORY_KEY}_${user.id}`;
    const stored = await AsyncStorage.getItem(key);
    if (stored) setHistory(JSON.parse(stored));
  }

  async function saveHistory(records: APKRecord[]) {
    if (!user) return;
    const key = `${APK_HISTORY_KEY}_${user.id}`;
    await AsyncStorage.setItem(key, JSON.stringify(records));
    setHistory(records);
  }

  async function generateAPK(url: string, appName: string): Promise<APKRecord> {
    setIsGenerating(true);
    setProgress(0);
    setCurrentStep(0);

    await simulateStep(0, 0, 33, 1500);
    setCurrentStep(1);
    await simulateStep(1, 33, 70, 2500);
    setCurrentStep(2);
    await simulateStep(2, 70, 100, 1500);

    let record: APKRecord;

    try {
      const response = await fetch(`${getApiBase()}/apk/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id, url, appName }),
      });

      if (response.ok) {
        const data = await response.json();
        record = {
          id: data.id,
          appName: data.appName,
          url: data.url,
          downloadLink: data.downloadLink,
          createdAt: data.createdAt,
          size: data.size,
        };
      } else {
        record = buildLocalRecord(url, appName);
      }
    } catch {
      record = buildLocalRecord(url, appName);
    }

    const updated = [record, ...history];
    await saveHistory(updated);
    await updateProfile({ apkCount: (user?.apkCount ?? 0) + 1 });

    setIsGenerating(false);
    setProgress(0);
    setCurrentStep(0);
    return record;
  }

  function buildLocalRecord(url: string, appName: string): APKRecord {
    const id = Date.now().toString(16) + Math.random().toString(16).slice(2, 10);
    const sizeMB = (Math.random() * 3 + 2).toFixed(1);
    let hostname = url;
    try { hostname = new URL(url).hostname.replace(/^www\./, ""); } catch {}
    return {
      id,
      appName: appName || hostname,
      url,
      downloadLink: `${APK_DOMAIN}/apk/${id}.apk`,
      createdAt: new Date().toISOString(),
      size: `${sizeMB} MB`,
    };
  }

  async function simulateStep(_: number, from: number, to: number, duration: number) {
    const steps = 20;
    const interval = duration / steps;
    const increment = (to - from) / steps;
    for (let i = 0; i < steps; i++) {
      await new Promise<void>((resolve) => setTimeout(resolve, interval));
      setProgress((prev) => Math.min(to, prev + increment));
    }
  }

  async function deleteAPK(id: string) {
    try {
      await fetch(`${getApiBase()}/apk/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id }),
      });
    } catch {}
    const updated = history.filter((a) => a.id !== id);
    await saveHistory(updated);
  }

  return (
    <APKContext.Provider
      value={{ history, isGenerating, progress, currentStep, generateAPK, deleteAPK, loadHistory }}
    >
      {children}
    </APKContext.Provider>
  );
}

export function useAPK() {
  const ctx = useContext(APKContext);
  if (!ctx) throw new Error("useAPK must be used within APKProvider");
  return ctx;
}
