"use client";

import { useState } from "react";
import { createApiKey } from "./actions";

export default function CreateKeyButton({ projectId }: { projectId: string }) {
  const [loading, setLoading] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);

  const handleCreate = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append("projectId", projectId);
    
    const result = await createApiKey(formData);
    if (result?.fullKey) {
      setNewKey(result.fullKey);
    }
    setLoading(false);
  };

  const copyToClipboard = () => {
    if (newKey) {
      navigator.clipboard.writeText(newKey);
      alert("API Key copied to clipboard! Please save it securely, as you won't be able to see it again.");
    }
  };

  return (
    <>
      <button 
        onClick={handleCreate} 
        disabled={loading}
        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm shadow-sm transition-colors disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create New Key"}
      </button>

      {newKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl border border-gray-100">
            <h2 className="text-2xl font-bold text-black mb-2">Save your API Key</h2>
            <p className="text-gray-500 mb-6">
              Please copy this key and save it securely. For your protection, you will <strong>never be able to view it again</strong>.
            </p>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 flex items-center justify-between">
              <code className="text-sm font-mono text-gray-800 break-all pr-4">
                {newKey}
              </code>
              <button 
                onClick={copyToClipboard}
                className="shrink-0 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md text-sm font-medium transition-colors"
              >
                Copy
              </button>
            </div>

            <button 
              onClick={() => setNewKey(null)}
              className="w-full px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors"
            >
              I have saved my key
            </button>
          </div>
        </div>
      )}
    </>
  );
}
