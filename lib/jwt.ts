// JWT Secret (ในการใช้งานจริงควรเก็บใน environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-2025';

// Interface สำหรับ JWT Payload
export interface JWTPayload {
    userId: number;
    email: string;
    firstName: string;
    lastName: string;
    exp?: number;
    iat?: number;
}

// Helper functions for Base64 encoding/decoding
function base64UrlEncode(str: string): string {
    return btoa(str)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

function base64UrlDecode(str: string): string {
    // Add padding if needed
    str += '='.repeat((4 - str.length % 4) % 4);
    // Replace URL-safe characters
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    return atob(str);
}

// สร้าง JWT Token (ใช้ simple implementation)
export function generateToken(payload: JWTPayload): string {
    const header = {
        alg: 'HS256',
        typ: 'JWT'
    };

    const now = Math.floor(Date.now() / 1000);
    const tokenPayload = {
        ...payload,
        iat: now,
        exp: now + (24 * 60 * 60) // 24 hours
    };

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(tokenPayload));
    
    const signature = base64UrlEncode(JWT_SECRET + encodedHeader + encodedPayload);
    
    return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// ตรวจสอบและ decode JWT Token (simple implementation)
export function verifyToken(token: string): JWTPayload | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }

        const [encodedHeader, encodedPayload, signature] = parts;
        
        // Verify signature (simple check)
        const expectedSignature = base64UrlEncode(JWT_SECRET + encodedHeader + encodedPayload);
        if (signature !== expectedSignature) {
            return null;
        }

        // Decode payload
        const payloadStr = base64UrlDecode(encodedPayload);
        const payload = JSON.parse(payloadStr) as JWTPayload;

        // Check expiration
        if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
            return null;
        }

        return payload;
    } catch (error) {
        console.error('JWT verification failed:', error);
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