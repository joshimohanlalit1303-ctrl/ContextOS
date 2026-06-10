"use client";

import { useState, useEffect } from "react";
import { Copy, CheckCircle2, ChevronRight, Terminal, Box, Globe, ExternalLink } from "lucide-react";
import clsx from "clsx";

const TABS = [
  { id: "claude", name: "Claude Desktop", icon: Box },
  { id: "cursor", name: "Cursor / Windsurf", icon: Terminal },
  { id: "antigravity", name: "Antigravity IDE", icon: Globe },
];

export default function MCPSetupWizard({ apiKey, userId }: { apiKey: string, userId: string }) {
  const [activeTab, setActiveTab] = useState("claude");
  const [copied, setCopied] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState("http://localhost:3000");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const getClaudeConfig = () => `{
  "mcpServers": {
    "libro": {
      "command": "npx",
      "args": ["-y", "libro-mcp-server@latest"],
      "env": {
        "LIBRO_API_KEY": "${apiKey}",
        "LIBRO_USER_ID": "${userId}",
        "LIBRO_BASE_URL": "${baseUrl}"
      }
    }
  }
}`;

  return (
    <div className="bg-[#111] border border-white/10 rounded-2xl p-6 text-white w-full max-w-4xl mx-auto shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-500/10 rounded-lg">
          <Box className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Connect to your Hive Mind</h2>
          <p className="text-sm text-gray-400">Install the Libro MCP Server in your favorite AI clients.</p>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
          Ready-to-use MCP Server URL
        </h3>
        <div className="bg-[#1a1a1a] p-4 rounded-xl border border-white/5 flex items-center justify-between group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <code className="text-sm text-indigo-300 font-mono truncate mr-4 relative z-10 select-all">
            https://libro-mcp-server.onrender.com/sse?apiKey={apiKey}&userId={userId}
          </code>
          <button 
            onClick={() => handleCopy(`https://libro-mcp-server.onrender.com/sse?apiKey=${apiKey}&userId=${userId}`, "sse")}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors relative z-10 shrink-0"
          >
            {copied === "sse" ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Paste this URL into Claude Desktop, Cursor, Windsurf, or Antigravity to connect instantly.
        </p>
      </div>

      <div className="flex gap-2 border-b border-white/10 pb-4 mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
              activeTab === tab.id 
                ? "bg-white text-black" 
                : "text-gray-400 hover:text-white hover:bg-white/5"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.name}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {activeTab === "claude" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/10 text-xs">1</span>
              Open Claude Desktop config file
            </h3>
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Mac</span>
                <div className="bg-black/50 p-4 rounded-xl border border-white/5 flex items-center justify-between group">
                  <code className="text-sm text-blue-300">nano ~/Library/Application\ Support/Claude/claude_desktop_config.json</code>
                  <button 
                    onClick={() => handleCopy("nano ~/Library/Application\\ Support/Claude/claude_desktop_config.json", "mac-path")}
                    className="p-2 hover:bg-white/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                  >
                    {copied === "mac-path" ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Windows (Command Prompt)</span>
                <div className="bg-black/50 p-4 rounded-xl border border-white/5 flex items-center justify-between group">
                  <code className="text-sm text-blue-300">notepad %APPDATA%\Claude\claude_desktop_config.json</code>
                  <button 
                    onClick={() => handleCopy("notepad %APPDATA%\\Claude\\claude_desktop_config.json", "win-path")}
                    className="p-2 hover:bg-white/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                  >
                    {copied === "win-path" ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-medium mt-8 mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/10 text-xs">2</span>
              Add the Libro server
            </h3>
            <div className="relative group">
              <pre className="bg-black/50 p-4 rounded-xl border border-white/5 overflow-x-auto text-sm text-gray-300">
                <code>{getClaudeConfig()}</code>
              </pre>
              <button 
                onClick={() => handleCopy(getClaudeConfig(), "config")}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-md transition-colors backdrop-blur-sm opacity-0 group-hover:opacity-100"
              >
                {copied === "config" ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="mt-6 flex items-center gap-2 text-sm text-yellow-400/80 bg-yellow-400/10 p-4 rounded-xl border border-yellow-400/20">
              <ChevronRight className="w-4 h-4 shrink-0" />
              <p>Restart Claude Desktop completely after modifying this file.</p>
            </div>
          </div>
        )}

        {activeTab === "cursor" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
             <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/10 text-xs">1</span>
              Open Cursor Settings
            </h3>
            <p className="text-gray-400 text-sm mb-4">Go to Cursor Settings &gt; Features &gt; MCP.</p>
            
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/10 text-xs">2</span>
              Add a new MCP Server
            </h3>
            <ul className="space-y-4 text-sm">
              <li className="flex justify-between items-center bg-black/50 p-3 rounded-lg border border-white/5">
                <span className="text-gray-400">Type:</span>
                <span className="font-mono">command</span>
              </li>
              <li className="flex justify-between items-center bg-black/50 p-3 rounded-lg border border-white/5">
                <span className="text-gray-400">Name:</span>
                <span className="font-mono">libro</span>
              </li>
              <li className="flex justify-between items-center bg-black/50 p-3 rounded-lg border border-white/5 group">
                <span className="text-gray-400">Command:</span>
                <div className="flex items-center gap-2">
                  <code className="text-blue-300 font-mono bg-blue-500/10 px-2 py-1 rounded">npx -y libro-mcp-server@latest</code>
                  <button onClick={() => handleCopy("npx -y libro-mcp-server@latest", "cmd")} className="hover:text-white">
                    {copied === "cmd" ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-500" />}
                  </button>
                </div>
              </li>
            </ul>

            <h3 className="text-lg font-medium mt-8 mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/10 text-xs">3</span>
              Set Environment Variables
            </h3>
            <div className="bg-black/50 p-4 rounded-xl border border-white/5 space-y-4">
              <div className="flex justify-between items-center group">
                <span className="font-mono text-sm text-gray-300">LIBRO_API_KEY={apiKey}</span>
                <button onClick={() => handleCopy(`LIBRO_API_KEY=${apiKey}`, "env1")}>
                   {copied === "env1" ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-500 hover:text-white" />}
                </button>
              </div>
              <div className="flex justify-between items-center group">
                <span className="font-mono text-sm text-gray-300">LIBRO_USER_ID={userId}</span>
                <button onClick={() => handleCopy(`LIBRO_USER_ID=${userId}`, "env2")}>
                   {copied === "env2" ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-500 hover:text-white" />}
                </button>
              </div>
              <div className="flex justify-between items-center group">
                <span className="font-mono text-sm text-gray-300">LIBRO_BASE_URL={baseUrl}</span>
                <button onClick={() => handleCopy(`LIBRO_BASE_URL=${baseUrl}`, "env3")}>
                   {copied === "env3" ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-500 hover:text-white" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "antigravity" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="text-center py-12 px-4 border border-dashed border-white/20 rounded-xl bg-white/5">
              <Globe className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">Antigravity IDE Config</h3>
              <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">
                Edit your ~/.gemini/config/mcp_servers.json to include the Libro configuration block shown in the Claude tab, then Reload your Window.
              </p>
              <button 
                onClick={() => setActiveTab("claude")}
                className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                View JSON Config
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
