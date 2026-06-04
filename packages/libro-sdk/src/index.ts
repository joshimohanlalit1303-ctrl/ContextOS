export interface LibroOptions {
  apiKey: string;
  baseUrl?: string;
}

export interface IngestRequest {
  userId: string;
  text: string;
  metadata?: Record<string, any>;
}

export interface GetProfileRequest {
  userId: string;
}

export interface GetContextRequest {
  userId: string;
  limitTimeline?: number;
}

export interface GetTimelineRequest {
  userId: string;
}

export class LibroClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(options: LibroOptions) {
    if (!options.apiKey) {
      throw new Error("Libro: API Key is required.");
    }
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl || "https://libro.co.in";
  }

  private async fetchAPI(endpoint: string, payload: any) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(`Libro API Error: ${response.status} ${response.statusText} - ${JSON.stringify(err)}`);
    }

    return response.json();
  }

  /**
   * Ingest a new memory or conversation turn for a user.
   */
  async ingest(request: IngestRequest) {
    return this.fetchAPI("/api/v1/ingest", request);
  }

  /**
   * Instantly fetch the structured user profile.
   */
  async getProfile(request: GetProfileRequest) {
    return this.fetchAPI("/api/v1/get-profile", request);
  }

  /**
   * Fetch an LLM-optimized context pack including profile and recent activity.
   */
  async getContext(request: GetContextRequest) {
    return this.fetchAPI("/api/v1/get-context", request);
  }

  /**
   * Fetch the chronological evolution timeline of the user.
   */
  async getTimeline(request: GetTimelineRequest) {
    return this.fetchAPI("/api/v1/get-timeline", request);
  }
}
