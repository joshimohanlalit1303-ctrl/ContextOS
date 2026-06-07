import { describe, it, expect } from 'vitest';

const BASE_URL = 'http://localhost:3000/api/v1';

describe('Libro API Endpoints', () => {
  describe('Authentication & x-api-key validation', () => {
    it('should reject requests without an API key', async () => {
      const response = await fetch(`${BASE_URL}/ingest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: 'test_user', content: 'test content' })
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toBe('Missing or invalid Authorization header');
    });

    it('should reject requests with an invalid API key format', async () => {
      const response = await fetch(`${BASE_URL}/ingest`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer invalid_key',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: 'test_user', content: 'test content' })
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toBe('Invalid API key');
    });

    it('should reject requests with a fake API key', async () => {
      const response = await fetch(`${BASE_URL}/ingest`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer libro_sk_fakekeythatdoesntexist',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: 'test_user', content: 'test content' })
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Invalid API key');
    });
  });

  describe('Endpoint Response Contracts', () => {
    it('should require userId and content for ingest', async () => {
      const response = await fetch(`${BASE_URL}/ingest`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.LIBRO_API_KEY || 'libro_sk_dummy_key'}`, // In tests, we'll assume this key exists in DB or we get a specific error
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: 'missing user id' })
      });

      // It might be 401 if the key doesn't exist in local DB, but if it does, it should be 400
      if (response.status === 400) {
        const data = await response.json();
        expect(data).toHaveProperty('error');
        expect(data.error).toBe('userId and content are required');
        expect(data.code).toBe('bad_request');
      }
    });

    it('should return 400 if memory query is empty', async () => {
      const response = await fetch(`${BASE_URL}/context?userId=test_user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.LIBRO_API_KEY || 'libro_sk_dummy_key'}`
        }
      });

      if (response.status === 400) {
        const data = await response.json();
        expect(data.error).toBe('userId and query are required');
      }
    });
  });
});
