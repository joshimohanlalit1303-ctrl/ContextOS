export interface LibroConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface IngestOptions {
  content: string;
  metadata?: Record<string, any>;
}

export interface GetContextOptions {
  query: string;
  metadata?: Record<string, any>;
  limit?: number;
}

export interface MemoryRecord {
  id: string;
  content: string;
  metadata: Record<string, any>;
  similarity?: number;
}

export class LibroClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: LibroConfig) {
    if (!config.apiKey) {
      throw new Error('LibroClient requires an apiKey');
    }
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://libro.co.in/api/v1';
  }

  private async request<T>(endpoint: string, options: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Libro API Error (${response.status}): ${errorText}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Ingest a new memory into the Libro AMM Layer.
   */
  async ingest(options: IngestOptions): Promise<{ id: string }> {
    const payload = {
      text: options.content,
      metadata: options.metadata || {}
    };
    return this.request<{ id: string }>('/ingest', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  /**
   * Retrieve the most semantically relevant memories based on a query.
   */
  async getContext(options: GetContextOptions): Promise<MemoryRecord[]> {
    const payload = {
      query: options.query,
      metadata: options.metadata, // Enables namespace filtering!
      limit: options.limit || 5
    };
    const res = await this.request<{ context: MemoryRecord[] }>('/get-context', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return res.context;
  }

  /**
   * Delete a specific memory by ID.
   */
  async forget(memoryId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/forget', {
      method: 'DELETE',
      body: JSON.stringify({ memoryId })
    });
  }
}
