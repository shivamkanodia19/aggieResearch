import { SignJWT, jwtVerify } from 'jose';

const getSecret = () =>
  new TextEncoder().encode(
    process.env.UNSUBSCRIBE_SECRET || process.env.CRON_SECRET || 'dev-fallback-secret'
  );

export async function generateUnsubscribeToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('365d')
    .sign(getSecret());
}

export async function verifyUnsubscribeToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return (payload.sub as string) ?? null;
  } catch {
    return null;
  }
}

export function getUnsubscribeUrl(token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aggieresearchfinder.com';
  return `${baseUrl}/unsubscribe?token=${token}`;
}
