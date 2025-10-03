// Simple token system for Edge Runtime compatibility

// Interface สำหรับ Token Payload
export interface TokenPayload {
    userId: number;
    email: string;
    firstName: string;
    lastName: string;
    timestamp?: number;
}

// Secret key for token signing
const TOKEN_SECRET = process.env.TOKEN_SECRET || 'your-super-secret-token-key-2025';

// Token expiry time (24 hours in milliseconds)
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000;

// Helper function to create a simple hash
function simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
}

// สร้าง Token
export function generateToken(payload: TokenPayload): string {
    const timestamp = Date.now();
    const tokenData = {
        ...payload,
        timestamp
    };
    
    const tokenString = JSON.stringify(tokenData);
    const encodedToken = btoa(tokenString);
    const signature = simpleHash(encodedToken + TOKEN_SECRET);
    
    return `${encodedToken}.${signature}`;
}

// ตรวจสอบและ decode Token
export function verifyToken(token: string): TokenPayload | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 2) {
            return null;
        }

        const [encodedToken, signature] = parts;
        
        // Verify signature
        const expectedSignature = simpleHash(encodedToken + TOKEN_SECRET);
        if (signature !== expectedSignature) {
            return null;
        }

        // Decode token
        const tokenString = atob(encodedToken);
        const tokenData = JSON.parse(tokenString) as TokenPayload;

        // Check expiration
        const now = Date.now();
        if (tokenData.timestamp && now - tokenData.timestamp > TOKEN_EXPIRY) {
            return null;
        }

        return tokenData;
    } catch (error) {
        console.error('Token verification failed:', error);
        return null;
    }
}

// สร้าง secure cookie options
export const cookieOptions = {
    httpOnly: true,        // ป้องกัน XSS attacks
    secure: process.env.NODE_ENV === 'production', // HTTPS only ใน production
    sameSite: 'strict' as const,     // ป้องกัน CSRF attacks
    maxAge: 24 * 60 * 60 * 1000,    // 24 ชั่วโมง (milliseconds)
    path: '/'              // Cookie ใช้ได้ทั้งเว็บไซต์
};