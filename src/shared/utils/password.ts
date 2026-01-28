// password.ts
import { randomBytes, scryptSync, timingSafeEqual } from "crypto"

const SCRYPT_PARAMS = {
  N: 16384, // CPU/memory cost
  r: 8,
  p: 1,
  keyLength: 64,
}

/**
 * Hash a password using scrypt (OWASP-recommended).
 * Format:
 * scrypt$N=16384,r=8,p=1$salt$hash
 */
function hashPasswordSync(password: string): string {
  const salt = randomBytes(16).toString("hex")

  const hash = scryptSync(
    password,
    salt,
    SCRYPT_PARAMS.keyLength,
    {
      N: SCRYPT_PARAMS.N,
      r: SCRYPT_PARAMS.r,
      p: SCRYPT_PARAMS.p,
    }
  ).toString("hex")

  return `scrypt$N=${SCRYPT_PARAMS.N},r=${SCRYPT_PARAMS.r},p=${SCRYPT_PARAMS.p}$${salt}$${hash}`
}

/**
 * Async wrapper for better-auth compatibility
 */
export async function hashPassword(password: string): Promise<string> {
  return hashPasswordSync(password)
}


/**
 * Verify a password against a stored scrypt hash (Sync version)
 */
function verifyPasswordSync(
  password: string,
  storedHash: string
): boolean {
  const [algorithm, params, salt, hash] = storedHash.split("$")

  if (algorithm !== "scrypt") {
    throw new Error("Unsupported hash algorithm")
  }

  const paramMap = Object.fromEntries(
    params.split(",").map(p => p.split("="))
  )

  const derivedKey = scryptSync(
    password,
    salt,
    Buffer.from(hash, "hex").length,
    {
      N: Number(paramMap.N),
      r: Number(paramMap.r),
      p: Number(paramMap.p),
    }
  )

  return timingSafeEqual(
    derivedKey,
    Buffer.from(hash, "hex")
  )
}

/**
 * Async wrapper for better-auth compatibility
 */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  return verifyPasswordSync(password, storedHash)
}

