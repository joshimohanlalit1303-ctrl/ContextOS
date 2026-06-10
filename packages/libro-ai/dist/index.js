"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LibroClient = void 0;
class LibroClient {
    apiKey;
    baseUrl;
    constructor(config) {
        if (!config.apiKey) {
            throw new Error('LibroClient requires an apiKey');
        }
        this.apiKey = config.apiKey;
        this.baseUrl = config.baseUrl || 'https://libro.co.in/api/v1';
    }
    async request(endpoint, options) {
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
        return response.json();
    }
    /**
     * Ingest a new memory into the Libro AMM Layer.
     */
    async ingest(options) {
        const payload = {
            text: options.content,
            metadata: options.metadata || {}
        };
        return this.request('/ingest', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }
    /**
     * Retrieve the most semantically relevant memories based on a query.
     */
    async getContext(options) {
        const payload = {
            query: options.query,
            metadata: options.metadata, // Enables namespace filtering!
            limit: options.limit || 5
        };
        const res = await this.request('/get-context', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        return res.context;
    }
    /**
     * Delete a specific memory by ID.
     */
    async forget(memoryId) {
        return this.request('/forget', {
            method: 'DELETE',
            body: JSON.stringify({ memoryId })
        });
    }
}
exports.LibroClient = LibroClient;
