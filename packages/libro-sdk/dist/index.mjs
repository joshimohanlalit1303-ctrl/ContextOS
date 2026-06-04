// src/index.ts
var ContextOSClient = class {
  constructor(options) {
    if (!options.apiKey) {
      throw new Error("ContextOS: API Key is required.");
    }
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl || "https://api.contextos.dev";
  }
  async fetchAPI(endpoint, payload) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(`ContextOS API Error: ${response.status} ${response.statusText} - ${JSON.stringify(err)}`);
    }
    return response.json();
  }
  /**
   * Ingest a new memory or conversation turn for a user.
   */
  async ingest(request) {
    return this.fetchAPI("/api/v1/ingest", request);
  }
  /**
   * Instantly fetch the structured user profile.
   */
  async getProfile(request) {
    return this.fetchAPI("/api/v1/get-profile", request);
  }
  /**
   * Fetch an LLM-optimized context pack including profile and recent activity.
   */
  async getContext(request) {
    return this.fetchAPI("/api/v1/get-context", request);
  }
  /**
   * Fetch the chronological evolution timeline of the user.
   */
  async getTimeline(request) {
    return this.fetchAPI("/api/v1/get-timeline", request);
  }
};
export {
  ContextOSClient
};
