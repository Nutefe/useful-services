import { randomBytes } from 'crypto';

export function generateUniqueCode(length = 8): string {
  return randomBytes(length).toString('hex');
}
