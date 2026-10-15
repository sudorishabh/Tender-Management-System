import bcrypt from "bcrypt";
import crypto from "crypto";

const SALT_ROUNDS = 12;

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// Compare password with hash
export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generate a cryptographically secure random alphanumeric code
export function generateCode(length: number = 8): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = crypto.randomBytes(length);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

// Generate a cryptographically secure random token
export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

// Normalize date (convert to Date or null)
export function normalizeDate(
  dateInput: string | Date | null | undefined,
): Date | null {
  if (!dateInput) return null;
  if (dateInput instanceof Date) return dateInput;
  return new Date(dateInput);
}
