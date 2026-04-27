import { jwtVerify, SignJWT } from 'jose';

// [EDUCATIONAL] this secret is used to sign the JWT. In production, always use a long random string.
const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 
  process.env.AUTH_SECRET || 
  "default_fallback_secret_change_me"
);

/**
 * [EDUCATIONAL] Signs a JWT token with user information.
 * JWT (JSON Web Token) is a secure way to transmit information between parties.
 */
export async function signToken(payload: { userId: string, email: string, role: string }) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secret);
}

/**
 * [EDUCATIONAL] Verifies a JWT token from the request headers.
 * This function checks if the user is logged in before allowing API access.
 */
export async function verifyToken(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as { userId: string, email: string, role: string };
  } catch {
    return null;
  }
}
