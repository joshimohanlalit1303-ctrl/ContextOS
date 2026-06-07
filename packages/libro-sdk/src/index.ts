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
  query: string;
  limitTimeline?: number;
}

export interface GetTimelineRequest {
  userId: string;
}

export interface ForgetRequest {
  userId: string;
  memoryId?: string;
  query?: string;
}

export interface UpdateRequest {
  userId: string;
  memoryId: string;
  text?: string;
  metadata?: Record<string, any>;
}

export interface CacheEntry {
  data: any;
  expiresAt: number;
}

export class LibroClient {
  private apiKey: string;
  private baseUrl: string;
  private cache: Map<string, CacheEntry> = new Map();

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
    const payload = {
      endUserId: request.userId,
      content: request.text,
      metadata: request.metadata,
    };
    // Invalidate related cache
    for (const key of this.cache.keys()) {
      if (key.startsWith(`context:${request.userId}`)) {
        this.cache.delete(key);
      }
    }
    return this.fetchAPI("/api/v1/ingest", payload);
  }

  /**
   * Instantly fetch the structured user profile.
   */
  async getProfile(request: GetProfileRequest) {
    return this.fetchAPI("/api/v1/get-profile", request);
  }

  /**
   * Fetch an LLM-optimized context pack including profile and recent activity.
   * Features in-memory caching for performance.
   */
  async getContext(request: GetContextRequest) {
    const cacheKey = `context:${request.userId}:${request.query}:${request.limitTimeline || 10}`;
    const now = Date.now();
    
    // Check cache (TTL: 30 seconds)
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      return cached.data;
    }

    const payload = {
      endUserId: request.userId,
      query: request.query,
      limitTimeline: request.limitTimeline,
    };
    
    const result = await this.fetchAPI("/api/v1/get-context", payload);
    
    // Save to cache
    this.cache.set(cacheKey, {
      data: result,
      expiresAt: now + 30 * 1000 // 30 seconds
    });
    
    // Cleanup old entries to prevent memory leaks
    if (this.cache.size > 100) {
      for (const [key, entry] of this.cache.entries()) {
        if (entry.expiresAt <= now) {
          this.cache.delete(key);
        }
      }
    }
    
    return result;
  }

  /**
   * Fetch the chronological evolution timeline of the user.
   */
  async getTimeline(request: GetTimelineRequest) {
    return this.fetchAPI("/api/v1/get-timeline", request);
  }

  /**
   * Delete a specific memory by ID, or memories matching a query.
   */
  async forget(request: ForgetRequest) {
    // Invalidate related cache
    for (const key of this.cache.keys()) {
      if (key.startsWith(`context:${request.userId}`)) {
        this.cache.delete(key);
      }
    }
    return this.fetchAPI("/api/v1/forget", request);
  }

  /**
   * Update an existing memory's text or metadata.
   */
  async update(request: UpdateRequest) {
    // Invalidate related cache
    for (const key of this.cache.keys()) {
      if (key.startsWith(`context:${request.userId}`)) {
        this.cache.delete(key);
      }
    }
    return this.fetchAPI("/api/v1/update", request);
  }
}
