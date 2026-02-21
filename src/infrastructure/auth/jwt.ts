// JWT utility — sign & verify tokens using djwt
import { create, decode, getNumericDate, verify } from 'djwt';
import { config } from '../config/env.ts';

// Token constants
const ACCESS_TOKEN_EXPIRY = 10 * 60; // 10 minutes in seconds
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 days in seconds
const ISSUER = 'yndu-api';
const AUDIENCE = 'yndu-client';

// Derive a CryptoKey from the JWT_SECRET string
let _key: CryptoKey | null = null;

async function getKey(): Promise<CryptoKey> {
  if (_key) return _key;
  const encoder = new TextEncoder();
  _key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(config.jwt.secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
  return _key;
}

export interface TokenPayload {
  sub: string; // user ID
  email: string;
  iat: number;
  exp: number;
  jti: string; // JWT ID for revocation tracking
  iss: string; // Issuer
  aud: string; // Audience
  type: 'access' | 'refresh';
}

/**
 * Create an access token (10 minutes)
 */
export async function createAccessToken(
  userId: string,
  email: string,
): Promise<string> {
  const key = await getKey();
  const now = Math.floor(Date.now() / 1000);

  return await create(
    { alg: 'HS256', typ: 'JWT' },
    {
      sub: userId,
      email,
      iat: now,
      exp: getNumericDate(ACCESS_TOKEN_EXPIRY),
      jti: crypto.randomUUID(),
      iss: ISSUER,
      aud: AUDIENCE,
      type: 'access',
    },
    key,
  );
}

/**
 * Create a refresh token (7 days)
 */
export async function createRefreshToken(userId: string): Promise<string> {
  const key = await getKey();
  const now = Math.floor(Date.now() / 1000);

  return await create(
    { alg: 'HS256', typ: 'JWT' },
    {
      sub: userId,
      type: 'refresh',
      email: '', // Refresh tokens don't need email but interface requires it
      iat: now,
      exp: getNumericDate(REFRESH_TOKEN_EXPIRY),
      jti: crypto.randomUUID(),
      iss: ISSUER,
      aud: AUDIENCE,
    },
    key,
  );
}

/**
 * Verify and decode a JWT token
 * Throws on invalid/expired tokens
 */
export async function verifyToken(token: string): Promise<TokenPayload> {
  const key = await getKey();
  const payload = await verify(token, key);
  return payload as unknown as TokenPayload;
}

/**
 * Verify an access token with strict validation
 * - Validates token type is 'access'
 * - Validates issuer
 * - Validates audience
 * Throws on invalid/expired tokens
 */
export async function verifyAccessToken(token: string): Promise<TokenPayload> {
  const key = await getKey();
  const payload = await verify(token, key) as unknown as TokenPayload;

  // Strict validation for access tokens
  if (payload.type !== 'access') {
    throw new Error('Invalid token type: expected access token');
  }
  if (payload.iss !== ISSUER) {
    throw new Error('Invalid token issuer');
  }
  if (payload.aud !== AUDIENCE) {
    throw new Error('Invalid token audience');
  }

  return payload;
}

/**
 * Verify a refresh token with strict validation
 * - Validates token type is 'refresh'
 * - Validates issuer
 * - Validates audience
 * Throws on invalid/expired tokens
 */
export async function verifyRefreshToken(token: string): Promise<TokenPayload> {
  const key = await getKey();
  const payload = await verify(token, key) as unknown as TokenPayload;

  // Strict validation for refresh tokens
  if (payload.type !== 'refresh') {
    throw new Error('Invalid token type: expected refresh token');
  }
  if (payload.iss !== ISSUER) {
    throw new Error('Invalid token issuer');
  }
  if (payload.aud !== AUDIENCE) {
    throw new Error('Invalid token audience');
  }

  return payload;
}

/**
 * Decode a token without verification
 * Use this to extract the jti (token ID) for blacklisting
 * Returns null if token is malformed
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    const [_header, payload, _signature] = decode(token);
    return payload as unknown as TokenPayload;
  } catch (_error) {
    return null;
  }
}

// Export constants for use in other modules
export { ACCESS_TOKEN_EXPIRY, AUDIENCE, ISSUER, REFRESH_TOKEN_EXPIRY };
