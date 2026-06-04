interface LibroOptions {
    apiKey: string;
    baseUrl?: string;
}
interface IngestRequest {
    userId: string;
    text: string;
    metadata?: Record<string, any>;
}
interface GetProfileRequest {
    userId: string;
}
interface GetContextRequest {
    userId: string;
    limitTimeline?: number;
}
interface GetTimelineRequest {
    userId: string;
}
declare class LibroClient {
    private apiKey;
    private baseUrl;
    constructor(options: LibroOptions);
    private fetchAPI;
    /**
     * Ingest a new memory or conversation turn for a user.
     */
    ingest(request: IngestRequest): Promise<any>;
    /**
     * Instantly fetch the structured user profile.
     */
    getProfile(request: GetProfileRequest): Promise<any>;
    /**
     * Fetch an LLM-optimized context pack including profile and recent activity.
     */
    getContext(request: GetContextRequest): Promise<any>;
    /**
     * Fetch the chronological evolution timeline of the user.
     */
    getTimeline(request: GetTimelineRequest): Promise<any>;
}

export { type GetContextRequest, type GetProfileRequest, type GetTimelineRequest, type IngestRequest, LibroClient, type LibroOptions };
