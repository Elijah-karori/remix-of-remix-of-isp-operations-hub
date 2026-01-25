/**
 * Content Security Policy (CSP) configuration and HTTPS enforcement
 */

/**
 * Enforce HTTPS in production environment
 */
export const enforceHTTPS = (): void => {
    if (import.meta.env.PROD && typeof window !== 'undefined') {
        if (window.location.protocol !== 'https:') {
            console.warn('Redirecting to HTTPS...');
            window.location.href = window.location.href.replace('http:', 'https:');
        }
    }
};

/**
 * Content Security Policy directives
 */
export const CSP_DIRECTIVES = {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'"], // unsafe-inline needed for Vite in dev
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'https:'],
    'font-src': ["'self'", 'data:'],
    'connect-src': [
        "'self'",
        import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
    ],
    'frame-ancestors': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
};

/**
 * Generate CSP header value from directives
 */
export const generateCSPHeader = (): string => {
    return Object.entries(CSP_DIRECTIVES)
        .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
        .join('; ');
};

/**
 * Apply CSP via meta tag (fallback if server headers not available)
 */
export const applyCSPMetaTag = (): void => {
    if (typeof document === 'undefined') return;

    const existingMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (existingMeta) return; // Already applied

    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = generateCSPHeader();
    document.head.appendChild(meta);
};

/**
 * Security headers to check (for debugging)
 */
export const SECURITY_HEADERS = {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
};

/**
 * Initialize security features
 */
export const initializeSecurity = (): void => {
    enforceHTTPS();

    // Apply CSP in production
    if (import.meta.env.PROD) {
        applyCSPMetaTag();
    }

    // Log security status in development
    if (import.meta.env.DEV) {
        console.log('🔒 Security Configuration:');
        console.log('- HTTPS Enforcement:', import.meta.env.PROD ? 'Enabled' : 'Disabled (Dev)');
        console.log('- CSP:', import.meta.env.PROD ? 'Enabled' : 'Disabled (Dev)');
        console.log('- API Base URL:', import.meta.env.VITE_API_BASE_URL);
    }
};
