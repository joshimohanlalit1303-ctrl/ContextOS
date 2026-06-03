import { createClient } from '@supabase/supabase-js';

// Use the local project URL and Anon Key (from the main project)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlZmF1bHQiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY5NjQzMTEwMCwiZXhwIjoyMDEyMDA3MTAwfQ.1234567890';

// Using a custom storage adapter for chrome.storage.local
const chromeStorageAdapter = {
  getItem: (key: string) => {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.get([key], (result) => {
          resolve(result[key]);
        });
      } else {
        resolve(localStorage.getItem(key));
      }
    });
  },
  setItem: (key: string, value: string) => {
    return new Promise<void>((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.set({ [key]: value }, () => {
          resolve();
        });
      } else {
        localStorage.setItem(key, value);
        resolve();
      }
    });
  },
  removeItem: (key: string) => {
    return new Promise<void>((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.remove([key], () => {
          resolve();
        });
      } else {
        localStorage.removeItem(key);
        resolve();
      }
    });
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: chromeStorageAdapter as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
