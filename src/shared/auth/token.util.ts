import { createHash, randomBytes } from 'crypto';

export function parseDurationToSeconds(value: string): number {
  const match = /^(\d+)([smhd])$/.exec(value.trim());
  if (!match) {
    const asNumber = Number(value);
    return Number.isFinite(asNumber) && asNumber > 0 ? asNumber : 900;
  }

  const amount = Number(match[1]);
  switch (match[2]) {
    case 's':
      return amount;
    case 'm':
      return amount * 60;
    case 'h':
      return amount * 3600;
    case 'd':
      return amount * 86400;
    default:
      return 900;
  }
}

export function generateRefreshToken(): string {
  return randomBytes(48).toString('base64url');
}

export function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
