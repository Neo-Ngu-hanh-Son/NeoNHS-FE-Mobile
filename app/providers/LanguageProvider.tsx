import React, {
  createContext, useContext, useEffect,
  useState, useCallback, useMemo, ReactNode,
} from 'react';
import { storage } from '@/utils/storage';
import i18n, { SupportedLanguage, SUPPORTED_LANGUAGES } from '@/lib/i18n';

interface LanguageContextValue {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => Promise<void>;
  isLoading: boolean;
}

const LANGUAGE_STORAGE_KEY = '@NeoNHS/language_preference';
const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>('vi');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const saved = await storage.getItem<SupportedLanguage>(LANGUAGE_STORAGE_KEY);
        if (saved && SUPPORTED_LANGUAGES.includes(saved)) {
          setLanguageState(saved);
          await i18n.changeLanguage(saved);
        }
      } catch (e) {
        console.error('Failed to load language preference:', e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const setLanguage = useCallback(async (lang: SupportedLanguage) => {
    setLanguageState(lang);
    await storage.setItem(LANGUAGE_STORAGE_KEY, lang);
    await i18n.changeLanguage(lang);
  }, []);

  const value = useMemo(
    () => ({ language, setLanguage, isLoading }),
    [language, setLanguage, isLoading]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}
