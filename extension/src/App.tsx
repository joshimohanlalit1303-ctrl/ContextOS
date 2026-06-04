import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { supabase } from './lib/supabase';
import { Github, LogOut, Activity, Copy, Send, AlertCircle, RefreshCw, FileJson } from 'lucide-react';
import { Logo } from './Logo';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [passportLoading, setPassportLoading] = useState(false);
  const [passportData, setPassportData] = useState<any>(null);
  const [capsuleCopied, setCapsuleCopied] = useState(false);
  const [exportCopied, setExportCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => {
      subscription.unsubscribe();
      abortRef.current?.abort();
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    };
  }, []);

  // Auto-dismiss errors after 5 seconds
  const showError = useCallback((msg: string) => {
    setFetchError(msg);
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    errorTimerRef.current = setTimeout(() => setFetchError(null), 5000);
  }, []);

  const handleGitHubLogin = useCallback(async () => {
    setLoading(true);
    if (typeof chrome === 'undefined' || !chrome.identity) {
      await supabase.auth.signInWithOAuth({ provider: 'github', options: { redirectTo: window.location.origin } });
      return;
    }
    try {
      const redirectUrl = chrome.identity.getRedirectURL();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: { redirectTo: redirectUrl, skipBrowserRedirect: true },
      });
      if (error || !data?.url) throw error || new Error('No URL returned');
      chrome.identity.launchWebAuthFlow({ url: data.url, interactive: true }, async (redirectUrl) => {
        if (chrome.runtime.lastError || !redirectUrl) { setLoading(false); return; }
        const url = new URL(redirectUrl);
        const hashParams = new URLSearchParams(url.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        if (accessToken && refreshToken) {
          await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        }
        setLoading(false);
      });
    } catch (err) {
      console.error('Auth Error:', err);
      setLoading(false);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const extractLocalChat = useCallback(async () => {
    let tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    let tab = tabs.find(t => t.url && !t.url.startsWith('chrome-extension://'));
    if (!tab?.id) {
      tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
      tab = tabs.find(t => t.url && !t.url.startsWith('chrome-extension://'));
    }
    if (!tab?.id) {
      tabs = await chrome.tabs.query({ url: ["*://chatgpt.com/*", "*://claude.ai/*", "*://gemini.google.com/*", "*://chat.deepseek.com/*"] });
      tab = tabs[0];
    }
    if (!tab?.id) throw new Error("Cannot find an active AI tab.");

    let response: any;
    try {
      response = await new Promise<any>((resolve, reject) => {
        chrome.tabs.sendMessage(tab!.id!, { type: 'EXPORT_CHAT' }, (res) => {
          if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
          else resolve(res);
        });
      });
    } catch {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id! },
        func: () => {
          const PLATFORMS = [
            { host: 'claude.ai', user: '.font-user-message', ai: '.font-claude-message' },
            { host: 'chatgpt.com', user: 'div[data-message-author-role="user"]', ai: 'div[data-message-author-role="assistant"]' },
            { host: 'gemini.google.com', user: 'user-query, .user-query', ai: 'model-response, .model-response' },
            { host: 'chat.deepseek.com', user: 'div[dir="auto"]', ai: 'div[dir="auto"]' }
          ];
          const platform = PLATFORMS.find(p => window.location.hostname.includes(p.host));
          if (!platform) return { history: [] };
          const nodes = document.querySelectorAll(`${platform.user}, ${platform.ai}`);
          const history: { role: string, content: string }[] = [];
          nodes.forEach(node => {
            const text = node.textContent?.trim();
            if (!text) return;
            history.push({ role: node.matches(platform.user) ? 'user' : 'assistant', content: text });
          });
          if (history.length === 0) {
            const rawText = document.body.innerText || "";
            if (rawText.length > 50) history.push({ role: 'user', content: rawText.substring(0, 40000) });
          }
          return { history };
        }
      });
      if (results?.[0]?.result) response = results[0].result;
      else throw new Error("Could not extract chat from page.");
    }
    if (!response?.history?.length) throw new Error("No chat history found on this page.");
    return response.history;
  }, []);

  const handleSavePassport = useCallback(async () => {
    setPassportLoading(true);
    setFetchError(null);
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    try {
      // Reuse existing session from state — avoid redundant network call
      if (!session) throw new Error("You must be logged in to save a passport.");
      const history = await extractLocalChat();
      const apiRes = await fetch(`${API_URL}/api/passport/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ history }),
        signal: abortRef.current.signal,
      });
      if (!apiRes.ok) {
        const errorData = await apiRes.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || "Failed to generate passport from backend.");
      }
      const result = await apiRes.json();
      setPassportData(result.data);
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.error("Passport Save error:", err);
      showError(`Save failed: ${err.message}`);
    } finally {
      setPassportLoading(false);
    }
  }, [session, extractLocalChat, showError]);

  const copyToClipboard = useCallback(async (text: string, setter: (val: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    setter(true);
    setTimeout(() => setter(false), 2000);
  }, []);

  // Memoize passport JSONs — only recompute when passportData changes
  const passportJson = useMemo(() => {
    if (!passportData) return null;
    return {
      display: JSON.stringify({
        passport_type: "AI_CONTEXT_PASSPORT",
        project: passportData.project,
        goal: passportData.goal,
        current_tasks: passportData.tasks,
        recent_decisions: passportData.decisions,
        context_summary: passportData.summary,
      }, null, 2),
      prompt: JSON.stringify({
        project: passportData.project,
        goal: passportData.goal,
        pending_tasks: passportData.tasks,
        decisions_made: passportData.decisions,
        summary: passportData.summary,
      }, null, 2),
    };
  }, [passportData]);

  const handleCopyPassport = useCallback(async () => {
    if (!passportJson) return;
    await copyToClipboard(`\`\`\`json\n${passportJson.display}\n\`\`\``, setCapsuleCopied);
  }, [passportJson, copyToClipboard]);

  const handleContinueProject = useCallback(async () => {
    if (!passportJson) return;
    const prompt = `I am porting an existing project to this chat. Please ingest the following AI Context Passport which outlines the exact state, goals, and pending tasks of the project.\n\n\`\`\`json\n${passportJson.prompt}\n\`\`\`\n\nPlease acknowledge this context, review the pending tasks, and let me know when you are ready to continue the project.`;
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        await copyToClipboard(prompt, setExportCopied);
        if (tabs.length > 0 && tabs[0].id) {
          chrome.tabs.sendMessage(tabs[0].id, { type: 'DROP_CAPSULE', payload: { text: prompt } });
        }
      });
    } catch {
      copyToClipboard(prompt, setExportCopied);
    }
  }, [passportJson, copyToClipboard]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-bg">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} className="text-gray-400">
          <Logo />
        </motion.div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-bg p-6 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-20 h-20 bg-glass rounded-3xl flex items-center justify-center mb-8 border border-glassborder shadow-sm">
          <Logo className="w-10 h-10 text-black" />
        </motion.div>
        <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-3xl font-bold tracking-tight mb-3 text-black">Libro</motion.h1>
        <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-sm text-gray-500 mb-10 leading-relaxed font-medium">
          The User Context Layer For AI Applications.<br/>Sign in to sync your local context.
        </motion.p>
        <motion.button
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02, backgroundColor: '#f3f4f6' }} whileTap={{ scale: 0.98 }}
          onClick={handleGitHubLogin}
          className="w-full flex items-center justify-center gap-3 bg-white text-black font-semibold py-4 px-4 rounded-2xl border border-gray-200 shadow-sm mb-6"
        >
          <Github className="w-5 h-5" />
          Continue with GitHub
        </motion.button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-bg text-accent font-sans selection:bg-blue-100">
      {/* Top Header */}
      <motion.div initial={{ y: -50 }} animate={{ y: 0 }} className="flex items-center justify-between px-6 py-4 bg-white/70 backdrop-blur-2xl border-b border-gray-100 z-20 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-black to-gray-700 flex items-center justify-center shadow-md">
            <Logo className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold tracking-tight text-gray-900 text-lg">Libro</span>
        </div>
        <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all" title="Logout">
          <LogOut className="w-4 h-4" />
        </button>
      </motion.div>

      <div className="p-6 flex-1 flex flex-col relative z-10">
        <AnimatePresence>
          {fetchError && (
            <motion.div initial={{ opacity: 0, height: 0, marginBottom: 0 }} animate={{ opacity: 1, height: 'auto', marginBottom: 24 }} exit={{ opacity: 0, height: 0, marginBottom: 0 }} className="overflow-hidden">
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-2xl flex items-start gap-3 shadow-sm">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-semibold block mb-0.5 text-red-800">Connection Failed</span>
                  {fetchError}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-8 bg-white p-5 rounded-[20px] border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
          <img src={session.user.user_metadata.avatar_url} alt="Avatar" className="w-12 h-12 rounded-full border border-gray-100 shadow-sm" />
          <div>
            <div className="font-bold text-[16px] text-gray-900 leading-tight">{session.user.user_metadata.full_name || session.user.email}</div>
            <div className="text-[12px] text-emerald-500 flex items-center gap-1.5 mt-1 font-medium tracking-wide">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-slow shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              Engine Active
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3.5 mb-10">
          <motion.button whileHover={{ scale: 1.01, y: -1 }} whileTap={{ scale: 0.98 }} onClick={handleSavePassport} disabled={passportLoading}
            className="w-full flex items-center justify-center gap-3 bg-black hover:bg-gray-900 text-white font-medium py-4 px-5 rounded-[16px] shadow-[0_8px_20px_-8px_rgba(0,0,0,0.3)] transition-all disabled:opacity-50 disabled:hover:scale-100 relative overflow-hidden group">
            {passportLoading ? (
              <RefreshCw className="w-5 h-5 animate-spin text-white/80" />
            ) : passportData ? (
              <>
                <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </motion.svg>
                Passport Saved!
              </>
            ) : (
              <>
                <FileJson className="w-5 h-5 text-white/80 group-hover:text-white transition-colors" />
                Save Context Passport
              </>
            )}
          </motion.button>

          <motion.button whileHover={{ scale: 1.01, y: -1 }} whileTap={{ scale: 0.98 }} onClick={handleContinueProject} disabled={!passportData}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-medium py-4 px-5 rounded-[16px] border border-gray-200 hover:border-gray-300 hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.05)] transition-all disabled:opacity-50 disabled:hover:scale-100 group">
            {exportCopied ? (
              <>
                <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </motion.svg>
                <span className="text-emerald-600 font-semibold">Prompt Copied!</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                Continue Project
              </>
            )}
          </motion.button>

          <motion.button whileHover={{ scale: 1.01, y: -1 }} whileTap={{ scale: 0.98 }} onClick={handleCopyPassport} disabled={!passportData}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-medium py-4 px-5 rounded-[16px] border border-gray-200 hover:border-gray-300 hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.05)] transition-all disabled:opacity-50 disabled:hover:scale-100 group">
            {capsuleCopied ? (
              <>
                <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </motion.svg>
                <span className="text-emerald-600 font-semibold">JSON Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors" />
                Copy Raw JSON
              </>
            )}
          </motion.button>
        </div>

        {/* Status Stream */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-auto">
          <h3 className="text-[11px] uppercase tracking-widest text-gray-400 font-bold mb-3 px-1">System Status</h3>
          <div className="bg-white p-4 border border-gray-100 rounded-[16px] text-[13px] flex gap-3.5 items-center shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] relative overflow-hidden group hover:border-blue-100 transition-colors">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 group-hover:w-1.5 transition-all"></div>
            <Activity className="w-4 h-4 text-blue-500 shrink-0" />
            <div className="text-gray-600 font-medium leading-relaxed">Listening for AI interactions...</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default App;
