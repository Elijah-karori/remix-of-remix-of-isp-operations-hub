/**
 * Frontend rate limiting for login attempts
 * Prevents brute force attacks by limiting failed login attempts
 */

interface RateLimitConfig {
    maxAttempts: number;
    lockoutDuration: number; // in milliseconds
    storageKey: string;
}

interface RateLimitState {
    attempts: number;
    lockoutUntil: number | null;
    lastAttempt: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
    maxAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
    storageKey: 'auth_rate_limit',
};

class RateLimiter {
    private config: RateLimitConfig;

    constructor(config: Partial<RateLimitConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
    }

    private getState(): RateLimitState {
        try {
            const stored = sessionStorage.getItem(this.config.storageKey);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to parse rate limit state:', error);
        }
        return { attempts: 0, lockoutUntil: null, lastAttempt: 0 };
    }

    private setState(state: RateLimitState): void {
        try {
            sessionStorage.setItem(this.config.storageKey, JSON.stringify(state));
        } catch (error) {
            console.error('Failed to save rate limit state:', error);
        }
    }

    /**
     * Check if the user is currently locked out
     */
    isLockedOut(): boolean {
        const state = this.getState();
        if (!state.lockoutUntil) return false;

        const now = Date.now();
        if (now < state.lockoutUntil) {
            return true;
        }

        // Lockout expired, reset state
        this.reset();
        return false;
    }

    /**
     * Get remaining lockout time in seconds
     */
    getRemainingLockoutTime(): number {
        const state = this.getState();
        if (!state.lockoutUntil) return 0;

        const now = Date.now();
        const remaining = Math.max(0, state.lockoutUntil - now);
        return Math.ceil(remaining / 1000);
    }

    /**
     * Record a failed login attempt
     */
    recordFailedAttempt(): void {
        const state = this.getState();
        const now = Date.now();

        // Reset if last attempt was more than lockout duration ago
        if (now - state.lastAttempt > this.config.lockoutDuration) {
            state.attempts = 0;
        }

        state.attempts += 1;
        state.lastAttempt = now;

        // Trigger lockout if max attempts reached
        if (state.attempts >= this.config.maxAttempts) {
            state.lockoutUntil = now + this.config.lockoutDuration;
        }

        this.setState(state);
    }

    /**
     * Record a successful login (resets attempts)
     */
    recordSuccess(): void {
        this.reset();
    }

    /**
     * Reset rate limit state
     */
    reset(): void {
        this.setState({ attempts: 0, lockoutUntil: null, lastAttempt: 0 });
    }

    /**
     * Get current attempt count
     */
    getAttemptCount(): number {
        return this.getState().attempts;
    }

    /**
     * Get remaining attempts before lockout
     */
    getRemainingAttempts(): number {
        const state = this.getState();
        return Math.max(0, this.config.maxAttempts - state.attempts);
    }
}

// Export singleton instance
export const loginRateLimiter = new RateLimiter();

// Export class for custom instances
export { RateLimiter };
export type { RateLimitConfig, RateLimitState };
