import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { supabase } from './lib/supabase';
import { Github, LogOut, Activity, Copy, Send, AlertCircle, RefreshCw, FileJson } from 'lucide-react';
import { Logo } from './Logo';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const TypewriterText = () => {
  return (
    <span className="block opacity-100 translate-y-0">
      Engine healthy...
    </span>
  );
};

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [passportLoading, setPassportLoading] = useState(false);
  const [passportData, setPassportData] = useState<any>(null);
  const [capsuleCopied, setCapsuleCopied] = useState(false);
  const [exportCopied, setExportCopied] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Entrance Animations removed completely

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

  const showError = useCallback((msg: string) => {
    setFetchError(msg);
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    errorTimerRef.current = setTimeout(() => {
      setFetchError(null);
    }, 5000);
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
    let tab = tabs.find(t => t.url && !t.url.startsWith('chrome-extension://') && !t.url.startsWith('chrome://'));
    if (!tab?.id) {
      tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
      tab = tabs.find(t => t.url && !t.url.startsWith('chrome-extension://') && !t.url.startsWith('chrome://'));
    }
    if (!tab?.id) {
      tabs = await chrome.tabs.query({ url: ["*://chatgpt.com/*", "*://claude.ai/*", "*://gemini.google.com/*", "*://chat.deepseek.com/*"] });
      tab = tabs[0];
    }
    if (!tab?.id) throw new Error("Please open an active ChatGPT, Claude, or Gemini tab to extract context.");

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
      
      // Error banner renders natively via React state
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

  const handleHoverEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    // hover animations handled by css now
  };
  
  const handleHoverLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    // hover animations handled by css now
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    // hover animations handled by css now
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLButtonElement>) => {
    // hover animations handled by css now
  };

  if (loading) {
    return (
      <main ref={containerRef} className="flex items-center justify-center h-full w-full bg-bg" aria-busy="true" aria-label="Loading application">
        <div className="loader-logo text-gray-400">
          <Logo />
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main ref={containerRef} className="flex flex-col items-center justify-center h-full w-full bg-bg p-6 text-center">
        <div className="login-stagger w-20 h-20 bg-glass rounded-3xl flex items-center justify-center mb-8 border border-glassborder shadow-sm">
          <Logo className="w-10 h-10 text-black" />
        </div>
        <h1 className="login-stagger text-3xl font-bold tracking-tight mb-3 text-black">Libro</h1>
        <p className="login-stagger text-sm text-gray-500 mb-10 leading-relaxed font-medium">
          The User Context Layer For AI Applications.<br/>Sign in to sync your local context.
        </p>
        <button
          className="login-stagger w-full flex items-center justify-center gap-3 bg-white text-black font-semibold py-4 px-4 rounded-2xl border border-gray-200 shadow-sm mb-6"
          onClick={handleGitHubLogin}
          onMouseEnter={handleHoverEnter}
          onMouseLeave={handleHoverLeave}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          aria-label="Continue with GitHub"
        >
          <Github className="w-5 h-5" aria-hidden="true" />
          Continue with GitHub
        </button>
      </main>
    );
  }

  return (
    <main ref={containerRef} className="flex flex-col min-h-screen w-full bg-bg text-accent font-sans selection:bg-blue-100">
      {/* Top Header */}
      <header className="app-header flex items-center justify-between px-6 py-4 bg-white/70 backdrop-blur-2xl border-b border-gray-100 z-20 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-black to-gray-700 flex items-center justify-center shadow-md">
            <Logo className="w-4 h-4 text-white" aria-hidden="true" />
          </div>
          <span className="font-bold tracking-tight text-gray-900 text-lg">Libro</span>
        </div>
        <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all" aria-label="Logout">
          <LogOut className="w-4 h-4" aria-hidden="true" />
        </button>
      </header>

      <section className="p-6 flex-1 flex flex-col relative z-10" aria-label="Main Application Area">
        {fetchError && (
          <div className="error-banner overflow-hidden mb-6">
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-2xl flex items-start gap-3 shadow-sm">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="flex-1" role="alert">
                <span className="font-semibold block mb-0.5 text-red-800">Connection Failed</span>
                {fetchError}
              </div>
            </div>
          </div>
        )}

        {/* Profile Card */}
        <article className="app-card flex items-center gap-4 mb-8 bg-white p-5 rounded-[20px] border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
          <img src={session.user?.user_metadata?.avatar_url || 'https://www.gravatar.com/avatar/?d=mp'} alt={`${session.user?.email || 'User'} avatar`} className="w-12 h-12 rounded-full border border-gray-100 shadow-sm" />
          <div>
            <div className="font-bold text-[16px] text-gray-900 leading-tight">{session.user?.user_metadata?.full_name || session.user?.email || 'User'}</div>
            <div className="text-[12px] text-emerald-500 flex items-center gap-1.5 mt-1 font-medium tracking-wide">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-slow shadow-[0_0_8px_rgba(16,185,129,0.5)]" aria-hidden="true"></div>
              <span>Engine Active</span>
            </div>
          </div>
        </article>

        {/* Onboarding Instructions */}
        {!passportData && (
          <article className="app-card mb-4 bg-blue-50/50 p-4 rounded-[16px] border border-blue-100 shadow-sm" aria-label="Onboarding Instructions">
            <h4 className="text-blue-800 font-semibold text-[13px] mb-1">How to use Libro</h4>
            <p className="text-blue-600/90 text-[12px] leading-relaxed">
              1. Open an active tab with ChatGPT, Claude, or Gemini.<br/>
              2. Click <strong>Save Context Passport</strong> to extract the chat memory.<br/>
              3. Inject that memory into any other AI chat!
            </p>
          </article>
        )}

        {/* Action Buttons */}
        <nav className="flex flex-col gap-3.5 mb-10" aria-label="Action Navigation">
          <button 
            className="app-card w-full flex items-center justify-center gap-3 bg-black hover:bg-gray-900 text-white font-medium py-4 px-5 rounded-[16px] shadow-[0_8px_20px_-8px_rgba(0,0,0,0.3)] transition-all disabled:opacity-50 disabled:hover:scale-100 relative overflow-hidden group"
            onClick={handleSavePassport} 
            disabled={passportLoading}
            onMouseEnter={handleHoverEnter} onMouseLeave={handleHoverLeave} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}
            aria-label="Save Context Passport"
          >
            {passportLoading ? (
              <RefreshCw className="w-5 h-5 animate-spin text-white/80" aria-hidden="true" />
            ) : passportData ? (
              <>
                <svg className="success-icon w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span>Passport Saved!</span>
              </>
            ) : (
              <>
                <FileJson className="w-5 h-5 text-white/80 group-hover:text-white transition-colors" aria-hidden="true" />
                <span>Save Context Passport</span>
              </>
            )}
          </button>

          <button 
            className="app-card w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-medium py-4 px-5 rounded-[16px] border border-gray-200 hover:border-gray-300 hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.05)] transition-all disabled:opacity-50 disabled:hover:scale-100 group"
            onClick={handleContinueProject} 
            disabled={!passportData}
            onMouseEnter={handleHoverEnter} onMouseLeave={handleHoverLeave} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}
            aria-label="Continue Project"
          >
            {exportCopied ? (
              <>
                <svg className="copy-success-icon w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-emerald-600 font-semibold">Prompt Copied!</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" aria-hidden="true" />
                <span>Continue Project</span>
              </>
            )}
          </button>

          <button 
            className="app-card w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-medium py-4 px-5 rounded-[16px] border border-gray-200 hover:border-gray-300 hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.05)] transition-all disabled:opacity-50 disabled:hover:scale-100 group"
            onClick={handleCopyPassport} 
            disabled={!passportData}
            onMouseEnter={handleHoverEnter} onMouseLeave={handleHoverLeave} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}
            aria-label="Copy Raw JSON Passport"
          >
            {capsuleCopied ? (
              <>
                <svg className="copy-success-icon w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-emerald-600 font-semibold">JSON Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors" aria-hidden="true" />
                <span>Copy Raw JSON</span>
              </>
            )}
          </button>
        </nav>

        {/* Status Stream */}
        <article className="app-card mt-auto" aria-live="polite">
          <h3 className="text-[11px] uppercase tracking-widest text-gray-400 font-bold mb-3 px-1">System Status</h3>
          <div className="bg-white p-4 border border-gray-100 rounded-[16px] text-[13px] flex gap-3.5 items-center shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] relative overflow-hidden group hover:border-blue-100 transition-colors">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 group-hover:w-1.5 transition-all" aria-hidden="true"></div>
            <Activity className="w-4 h-4 text-blue-500 shrink-0 animate-pulse" aria-hidden="true" />
            <div className="text-gray-600 font-medium leading-relaxed">
              <TypewriterText />
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}

export default App;
