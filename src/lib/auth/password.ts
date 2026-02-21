// Password hashing using Web Crypto API (Cloudflare Workers compatible)

const SALT_LENGTH = 16;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

// Generate a random salt
function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
}

// Convert ArrayBuffer to base64 string
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert base64 string to ArrayBuffer
function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Hash password using PBKDF2
export async function hashPassword(password: string): Promise<string> {
  const salt = generateSalt();
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  
  // Import password as key
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  
  // Derive bits - salt is converted to ArrayBuffer which is a BufferSource
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    KEY_LENGTH * 8
  );
  
  // Combine salt and hash, then encode to base64
  const result = new Uint8Array(SALT_LENGTH + KEY_LENGTH);
  result.set(salt);
  result.set(new Uint8Array(derivedBits), SALT_LENGTH);
  
  return bufferToBase64(result.buffer);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    
    // Decode hash
    const hashBuffer = base64ToBuffer(hash);
    const salt = new Uint8Array(hashBuffer.slice(0, SALT_LENGTH));
    const originalHash = new Uint8Array(hashBuffer.slice(SALT_LENGTH));
    
    // Import password as key
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );
    
    // Derive bits with same salt - convert to ArrayBuffer for proper typing
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt.buffer as ArrayBuffer,
        iterations: ITERATIONS,
        hash: 'SHA-256'
      },
      keyMaterial,
      KEY_LENGTH * 8
    );
    
    // Compare hashes
    const newHash = new Uint8Array(derivedBits);
    if (newHash.length !== originalHash.length) {
      return false;
    }
    
    // Constant time comparison
    let result = 0;
    for (let i = 0; i < newHash.length; i++) {
      result |= newHash[i] ^ originalHash[i];
    }
    
    return result === 0;
  } catch {
    return false;
  }
}
