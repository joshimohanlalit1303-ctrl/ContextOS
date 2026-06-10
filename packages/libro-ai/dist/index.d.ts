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
export declare class LibroClient {
    private apiKey;
    private baseUrl;
    constructor(config: LibroConfig);
    private request;
    /**
     * Ingest a new memory into the Libro AMM Layer.
     */
    ingest(options: IngestOptions): Promise<{
        id: string;
    }>;
    /**
     * Retrieve the most semantically relevant memories based on a query.
     */
    getContext(options: GetContextOptions): Promise<MemoryRecord[]>;
    /**
     * Delete a specific memory by ID.
     */
    forget(memoryId: string): Promise<{
        success: boolean;
    }>;
}
