import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { Github, LogOut, Activity, Copy, Send, AlertCircle, RefreshCw, FileJson } from 'lucide-react';
import { Logo } from './Logo';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [passportLoading, setPassportLoading] = useState(false);
  const [passportData, setPassportData] = useState<any>(null);
  const [capsuleCopied, setCapsuleCopied] = useState(false);
  const [exportCopied, setExportCopied] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGitHubLogin = async () => {
    setLoading(true);
    
    if (typeof chrome === 'undefined' || !chrome.identity) {
       await supabase.auth.signInWithOAuth({
         provider: 'github',
         options: {
           redirectTo: window.location.origin
         }
       });
       return;
    }

    try {
      const redirectUrl = chrome.identity.getRedirectURL();
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error || !data?.url) throw error || new Error('No URL returned');

      chrome.identity.launchWebAuthFlow(
        {
          url: data.url,
          interactive: true,
        },
        async (redirectUrl) => {
          if (chrome.runtime.lastError || !redirectUrl) {
            console.error(chrome.runtime.lastError);
            setLoading(false);
            return;
          }

          const url = new URL(redirectUrl);
          const hashParams = new URLSearchParams(url.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');

          if (accessToken && refreshToken) {
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
          }
          setLoading(false);
        }
      );
    } catch (err) {
      console.error('Auth Error:', err);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-bg">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="text-white/50"
        >
          <Logo />
        </motion.div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-bg p-6 text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 bg-glass rounded-3xl flex items-center justify-center mb-8 border border-glassborder shadow-2xl"
        >
          <Logo className="w-10 h-10 text-white" />
        </motion.div>
        
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-bold tracking-tight mb-3"
        >
          ContextOS
        </motion.h1>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-white/60 mb-10 leading-relaxed"
        >
          The User Context Layer For AI Applications.<br/>Sign in to sync your local context.
        </motion.p>

        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.9)' }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGitHubLogin}
          className="w-full flex items-center justify-center gap-3 bg-white text-black font-semibold py-4 px-4 rounded-2xl shadow-lg mb-6"
        >
          <Github className="w-5 h-5" />
          Continue with GitHub
        </motion.button>
      </div>
    );
  }

  const extractLocalChat = async () => {
    // Query all tabs in current window
    let tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    let tab = tabs.find(t => t.url && !t.url.startsWith('chrome-extension://'));
    
    // Fallback to last focused window
    if (!tab || !tab.id) {
      tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
      tab = tabs.find(t => t.url && !t.url.startsWith('chrome-extension://'));
    }
    
    // Deep fallback: just find ANY open supported AI tab
    if (!tab || !tab.id) {
      tabs = await chrome.tabs.query({ url: ["*://chatgpt.com/*", "*://claude.ai/*", "*://gemini.google.com/*", "*://chat.deepseek.com/*"] });
      tab = tabs[0];
    }

    if (!tab || !tab.id) {
      throw new Error("Cannot find an active AI tab.");
    }

    let response;
    try {
      response = await new Promise<any>((resolve, reject) => {
        chrome.tabs.sendMessage(tab.id!, { type: 'EXPORT_CHAT' }, (res) => {
          if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
          else resolve(res);
        });
      });
    } catch (err: any) {
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
            const isUser = node.matches(platform.user);
            history.push({ role: isUser ? 'user' : 'assistant', content: text });
          });
          
          // Deep Fallback: If UI changed and selectors failed, grab raw text
          if (history.length === 0) {
            const rawText = document.body.innerText || "";
            if (rawText.length > 50) {
              history.push({ role: 'user', content: rawText.substring(0, 40000) });
            }
          }
          
          return { history };
        }
      });
      
      if (results && results[0] && results[0].result) response = results[0].result;
      else throw new Error("Could not extract chat from page.");
    }

    if (!response || !response.history || response.history.length === 0) {
      throw new Error("No chat history found on this page.");
    }

    return response.history;
  };

  const handleSavePassport = async () => {
    setPassportLoading(true);
    setFetchError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("You must be logged in to save a passport.");

      const history = await extractLocalChat();

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const apiRes = await fetch(`${API_URL}/api/passport/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ history })
      });

      if (!apiRes.ok) {
        const errorData = await apiRes.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || "Failed to generate passport from backend.");
      }

      const result = await apiRes.json();
      setPassportData(result.data);
      
    } catch (err: any) {
      console.error("Passport Save error:", err);
      setFetchError(`Save failed: ${err.message}`);
    }
    setPassportLoading(false);
  };

  const copyToClipboard = async (text: string, setter: (val: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text);
      setter(true);
      setTimeout(() => setter(false), 2000);
    } catch (clipboardErr) {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setter(true);
      setTimeout(() => setter(false), 2000);
    }
  };

  const handleCopyPassport = async () => {
    if (!passportData) return;
    const jsonPassport = JSON.stringify({
      passport_type: "AI_CONTEXT_PASSPORT",
      project: passportData.project,
      goal: passportData.goal,
      current_tasks: passportData.tasks,
      recent_decisions: passportData.decisions,
      context_summary: passportData.summary
    }, null, 2);
    
    const template = `\`\`\`json\n${jsonPassport}\n\`\`\``;
    await copyToClipboard(template, setCapsuleCopied);
  };

  const handleContinueProject = async () => {
    if (!passportData) return;
    
    const jsonPassport = JSON.stringify({
      project: passportData.project,
      goal: passportData.goal,
      pending_tasks: passportData.tasks,
      decisions_made: passportData.decisions,
      summary: passportData.summary
    }, null, 2);

    const prompt = `I am porting an existing project to this chat. Please ingest the following AI Context Passport which outlines the exact state, goals, and pending tasks of the project.

\`\`\`json
${jsonPassport}
\`\`\`

Please acknowledge this context, review the pending tasks, and let me know when you are ready to continue the project.`;
    
    // Try to magically auto-paste it into the chat input
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        // ALWAYS copy to clipboard first as a bulletproof fallback!
        await copyToClipboard(prompt, setExportCopied);
        
        if (tabs.length > 0 && tabs[0].id) {
          chrome.tabs.sendMessage(tabs[0].id, { type: 'DROP_CAPSULE', payload: { text: prompt } }, (res) => {
            // Silently attempt auto-paste in the background
          });
        }
      });
    } catch (e) {
      copyToClipboard(prompt, setExportCopied);
    }
  };



  return (
    <div className="flex flex-col h-full w-full bg-bg overflow-y-auto text-accent font-sans">
      <motion.div 
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        className="flex items-center justify-between p-4 border-b border-glassborder sticky top-0 bg-bg/80 backdrop-blur-xl z-20"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-glass rounded-lg border border-glassborder">
            <Logo className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold tracking-tight">ContextOS</span>
        </div>
        <button onClick={handleLogout} className="p-2 bg-glass border border-glassborder hover:bg-white/10 rounded-xl transition-colors text-muted hover:text-white" title="Logout">
          <LogOut className="w-4 h-4" />
        </button>
      </motion.div>

      <div className="p-5 flex-1 flex flex-col relative z-10">
        
        <AnimatePresence>
          {fetchError && (
            <motion.div 
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-red-500/10 border border-red-500/20 text-red-200 text-xs p-3 rounded-xl flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-semibold block mb-0.5 text-red-300">Connection Failed</span>
                  {fetchError}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-4 mb-8 bg-glass p-4 rounded-2xl border border-glassborder"
        >
          <img src={session.user.user_metadata.avatar_url} alt="Avatar" className="w-14 h-14 rounded-full border border-glassborder shadow-lg" />
          <div>
            <div className="font-medium text-[15px]">{session.user.user_metadata.full_name || session.user.email}</div>
            <div className="text-[11px] text-green-400 flex items-center gap-1.5 mt-1 font-medium tracking-wide">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse-slow shadow-[0_0_8px_rgba(74,222,128,0.6)]"></div> 
              Connected to Context Engine
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col gap-3 mb-10">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSavePassport}
            disabled={passportLoading}
            className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-4 px-4 rounded-2xl shadow-lg border border-blue-400/30 transition-all disabled:opacity-50 relative overflow-hidden"
          >
            {passportLoading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : passportData ? (
              <>
                <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </motion.svg>
                Passport Saved!
              </>
            ) : (
              <>
                <FileJson className="w-5 h-5" />
                Save Passport
              </>
            )}
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleContinueProject}
            disabled={!passportData}
            className="w-full flex items-center justify-center gap-2.5 bg-glass/80 backdrop-blur-md text-white font-medium py-4 px-4 rounded-2xl border border-white/10 hover:border-white/30 hover:bg-white/10 transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)] disabled:opacity-50"
          >
            {exportCopied ? (
              <>
                <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </motion.svg>
                <span className="text-green-300">Copied Prompt!</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5 text-white/60" />
                Continue Project
              </>
            )}
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCopyPassport}
            disabled={!passportData}
            className="w-full flex items-center justify-center gap-2.5 bg-glass/80 backdrop-blur-md text-white font-medium py-4 px-4 rounded-2xl border border-white/10 hover:border-white/30 hover:bg-white/10 transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)] disabled:opacity-50"
          >
            {capsuleCopied ? (
              <>
                <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </motion.svg>
                <span className="text-green-300">Copied JSON!</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5 text-white/60" />
                Copy Passport JSON
              </>
            )}
          </motion.button>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <h3 className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-3 px-1">Live Context Stream</h3>
          
          <div className="space-y-3">
            <div className="p-3.5 border border-glassborder rounded-xl bg-glass text-xs flex gap-3 items-center backdrop-blur-sm shadow-sm relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50"></div>
               <Activity className="w-4 h-4 text-blue-400 shrink-0" />
               <div className="text-white/70 leading-relaxed font-medium">Listening for interactions on supported AI platforms...</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default App;
