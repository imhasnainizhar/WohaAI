import { seal, unseal, defaults, Password, algorithms } from 'iron-webcrypto';
import { envConfigs as env } from '@packages/config';

const SECRET = env.ENCRYPTION_SECRET!;

export async function createToken(payload: any) {
  // Add a timestamp to enforce an expiration time (e.g., 15 minutes)
  const dataToEncrypt = { ...payload, expiresAt: Date.now() + 15 * 60 * 1000 };
  return await seal(dataToEncrypt, SECRET, defaults);
}

export async function verifyAndReadToken(token: string) {
  try {
    const decrypted = await unseal(token, SECRET, defaults) as any;
    
    // Check if token has expired
    if (Date.now() > decrypted.expiresAt) {
      throw new Error("Flow token expired");
    }
    return decrypted;
  } catch (err) {
    return null; // Token was tampered with or expired
  }
}