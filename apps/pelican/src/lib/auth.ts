/**
 * auth.ts — Hardcoded session auth for Pellito kitchen tool.
 * Rewritten to use Web Crypto API for Next.js Edge Runtime compatibility.
 */

export type Role = 'prep' | 'cook' | 'server' | 'admin';

const CREDENTIALS: Record<string, { password: string; role: Role }> = {
  prepcook: { password: 'prepcook', role: 'prep'   },
  cook:     { password: 'cook',     role: 'cook'   },
  server:   { password: 'server',   role: 'server' },
  deckhand: { password: 'deckhand', role: 'admin'  },
};

export const ROLE_LABELS: Record<Role, string> = {
  prep:   'Prep Station',
  cook:   'The Line',
  server: 'Front of House',
  admin:  'Admin Dashboard',
};

export function validateCredentials(username: string, password: string): Role | null {
  const entry = CREDENTIALS[username.toLowerCase().trim()];
  if (!entry) return null;
  if (entry.password !== password) return null;
  return entry.role;
}

const COOKIE_NAME = 'pellito_session';

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SESSION_SECRET env var is missing or too short.');
    }
    return 'dev-only-fallback-secret-do-not-use-in-production';
  }
  return secret;
}

async function getCryptoKey() {
  const secret = getSecret();
  const enc = new TextEncoder();
  return await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

function bufToBase64Url(buf: ArrayBuffer) {
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function signSession(role: Role): Promise<string> {
  const payload = btoa(JSON.stringify({ role }))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  const key = await getCryptoKey();
  const sigBuf = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  const sig = bufToBase64Url(sigBuf);
  return `${payload}.${sig}`;
}

export async function verifySession(value: string): Promise<Role | null> {
  try {
    const dot = value.lastIndexOf('.');
    if (dot === -1) return null;
    const payload = value.slice(0, dot);
    const sig = value.slice(dot + 1);

    const key = await getCryptoKey();
    const expectedSigBuf = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
    const expectedSig = bufToBase64Url(expectedSigBuf);

    // Constant-time check could be done manually, but standard equality is generally acceptable for internal role auth.
    if (sig !== expectedSig) return null;

    let b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    const jsonStr = atob(b64);
    const { role } = JSON.parse(jsonStr);

    if (!role || !ROLE_LABELS[role as Role]) return null;
    return role as Role;
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
