import { createContext, useContext, useState, useEffect } from 'react';
import { fetchSettings } from '../services/settingsService';

const SettingsContext = createContext();

const SETTINGS_CACHE_KEY = 'jdy_settings_cache';

// Try to get cached settings from localStorage for instant load
const getCachedSettings = () => {
  try {
    const cached = localStorage.getItem(SETTINGS_CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      // Use cache if it's less than 5 minutes old
      if (Date.now() - timestamp < 5 * 60 * 1000) {
        return data;
      }
    }
  } catch {
    // Ignore parse errors
  }
  return null;
};

const cacheSettings = (data) => {
  try {
    localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {
    // Ignore storage errors
  }
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const cachedSettings = getCachedSettings();
  // If we have cached settings, use them immediately (loading = false)
  // If not, default to non-maintenance so the app renders instantly
  const [settings, setSettings] = useState(cachedSettings || { website: { maintenance: false } });
  const [loading, setLoading] = useState(false); // Never block initial render
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        // 5-second timeout so we don't wait forever for a cold-starting backend
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const data = await fetchSettings('', controller.signal);
        clearTimeout(timeoutId);

        setSettings(data);
        cacheSettings(data);
      } catch (err) {
        if (err.name === 'AbortError') {
          console.warn('Settings fetch timed out, using defaults');
        } else {
          console.error('Failed to load settings:', err);
        }
        setError(err.message);
        // Keep using cached/default settings — don't block the app
      }
    };

    loadSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, error }}>
      {children}
    </SettingsContext.Provider>
  );
};
