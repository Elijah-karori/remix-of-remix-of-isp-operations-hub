/**
 * Token Service - Centralized token management with expiration monitoring
 */

import { authApi } from '../lib/api/auth';
import { getAccessToken, setAccessToken } from '../lib/api/base';

interface TokenPayload {
    exp: number;
    sub: string;
    [key: string]: any;
}

/**
 * Decode JWT token without verification (client-side only)
 */
const decodeToken = (token: string): TokenPayload | null => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Failed to decode token:', error);
        return null;
    }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
    const payload = decodeToken(token);
    if (!payload || !payload.exp) return true;

    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
};

/**
 * Get token expiration time in seconds from now
 */
export const getTokenExpiresIn = (token: string): number => {
    const payload = decodeToken(token);
    if (!payload || !payload.exp) return 0;

    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, payload.exp - now);
};

/**
 * Get token expiration date
 */
export const getTokenExpirationDate = (token: string): Date | null => {
    const payload = decodeToken(token);
    if (!payload || !payload.exp) return null;

    return new Date(payload.exp * 1000);
};

/**
 * Check if token will expire soon (within threshold)
 */
export const willTokenExpireSoon = (token: string, thresholdSeconds = 300): boolean => {
    const expiresIn = getTokenExpiresIn(token);
    return expiresIn > 0 && expiresIn <= thresholdSeconds;
};

/**
 * Token refresh service
 */
class TokenService {
    private refreshTimer: NodeJS.Timeout | null = null;
    private warningTimer: NodeJS.Timeout | null = null;
    private onWarning?: (expiresIn: number) => void;
    private onExpired?: () => void;

    /**
     * Start monitoring token expiration
     */
    startMonitoring(
        onWarning?: (expiresIn: number) => void,
        onExpired?: () => void
    ): void {
        this.onWarning = onWarning;
        this.onExpired = onExpired;
        this.scheduleRefresh();
    }

    /**
     * Stop monitoring
     */
    stopMonitoring(): void {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
            this.refreshTimer = null;
        }
        if (this.warningTimer) {
            clearTimeout(this.warningTimer);
            this.warningTimer = null;
        }
    }

    /**
     * Schedule automatic token refresh
     */
    private scheduleRefresh(): void {
        const token = getAccessToken();
        if (!token) return;

        const expiresIn = getTokenExpiresIn(token);
        if (expiresIn <= 0) {
            // Token already expired
            this.onExpired?.();
            return;
        }

        // Schedule warning 5 minutes before expiration
        const warningTime = Math.max(0, (expiresIn - 300) * 1000);
        this.warningTimer = setTimeout(() => {
            const currentToken = getAccessToken();
            if (currentToken) {
                const remainingTime = getTokenExpiresIn(currentToken);
                this.onWarning?.(remainingTime);
            }
        }, warningTime);

        // Schedule refresh 1 minute before expiration
        const refreshTime = Math.max(0, (expiresIn - 60) * 1000);
        this.refreshTimer = setTimeout(async () => {
            await this.refreshToken();
        }, refreshTime);
    }

    /**
     * Manually refresh token
     */
    async refreshToken(): Promise<boolean> {
        try {
            await authApi.refresh();
            // Reschedule monitoring with new token
            this.stopMonitoring();
            this.scheduleRefresh();
            return true;
        } catch (error) {
            console.error('Token refresh failed:', error);
            this.onExpired?.();
            return false;
        }
    }

    /**
     * Get current token info
     */
    getTokenInfo(): {
        isValid: boolean;
        expiresIn: number;
        expirationDate: Date | null;
        willExpireSoon: boolean;
    } | null {
        const token = getAccessToken();
        if (!token) return null;

        return {
            isValid: !isTokenExpired(token),
            expiresIn: getTokenExpiresIn(token),
            expirationDate: getTokenExpirationDate(token),
            willExpireSoon: willTokenExpireSoon(token),
        };
    }
}

// Export singleton instance
export const tokenService = new TokenService();

// Export utility functions
export { decodeToken };
