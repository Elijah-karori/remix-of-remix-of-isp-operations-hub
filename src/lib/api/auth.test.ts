import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authApi } from './auth';

// Mock fetch
global.fetch = vi.fn();

describe('Auth API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const mockResponse = { status: 'success' };
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await authApi.login('test@example.com', 'password123');
      
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/auth/login'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: expect.stringContaining('username=test%40example.com'),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error with invalid credentials', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ detail: 'Invalid credentials' }),
      });

      await expect(authApi.login('test@example.com', 'wrongpassword'))
        .rejects.toThrow('Invalid credentials');
    });
  });

  describe('requestOTP', () => {
    it('should successfully request OTP', async () => {
      const mockResponse = { message: 'OTP sent to your email' };
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await authApi.requestOTP('test@example.com', 'password123');
      
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/auth/otp/request'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: expect.stringContaining('grant_type=password'),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when OTP request fails', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ detail: 'Failed to request OTP' }),
      });

      await expect(authApi.requestOTP('test@example.com', 'password123'))
        .rejects.toThrow('Failed to request OTP');
    });
  });

  describe('verifyOTPLogin', () => {
    it('should successfully verify OTP and return token', async () => {
      const mockToken = {
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        token_type: 'bearer'
      };
      
      // Mock apiFetch function
      const mockApiFetch = vi.fn().mockResolvedValue(mockToken);
      vi.doMock('./base', () => ({
        apiFetch: mockApiFetch,
        setAccessToken: vi.fn()
      }));

      const result = await authApi.verifyOTPLogin('test@example.com', '123456');
      
      expect(mockApiFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/auth/otp/login?email=test%40example.com&otp=123456'),
        expect.objectContaining({ method: 'POST' }),
        { handle401: false }
      );
      expect(result).toEqual(mockToken);
    });
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        full_name: 'Test User',
        is_active: true,
        is_superuser: false,
        created_at: '2024-01-01T00:00:00Z'
      };
      
      const mockApiFetch = vi.fn().mockResolvedValue(mockUser);
      vi.doMock('./base', () => ({
        apiFetch: mockApiFetch
      }));

      const userData = {
        email: 'test@example.com',
        full_name: 'Test User',
        password: 'password123'
      };

      const result = await authApi.register(userData);
      
      expect(mockApiFetch).toHaveBeenCalledWith(
        '/api/v1/auth/register',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(userData)
        })
      );
      expect(result).toEqual(mockUser);
    });
  });
});
