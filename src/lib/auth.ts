import bcrypt from "bcryptjs";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { getFallbackUsers, saveFallbackUsers } from "./db";

const TOKEN_NAME = "hoko_session";
const TOKEN_ISSUER = "hoko-lifestyle-bd";
const TOKEN_AUDIENCE = "hoko-store";
const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type Role = "customer" | "admin";
export type AuthUser = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  provider: string;
  avatar?: string;
  role: Role;
};

type SessionPayload = JwtPayload & { sub: string; email: string; role: Role };

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be configured with at least 32 characters.");
  }
  return secret;
}

export function hashPassword(password: string) { return bcrypt.hashSync(password, 12); }
export function verifyPassword(password: string, hash: string) { return bcrypt.compareSync(password, hash); }

export function generateToken(user: AuthUser) {
  return jwt.sign(
    { email: user.email, role: user.role },
    getJwtSecret(),
    { subject: user._id, issuer: TOKEN_ISSUER, audience: TOKEN_AUDIENCE, expiresIn: TOKEN_MAX_AGE_SECONDS, algorithm: "HS256" }
  );
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret(), { issuer: TOKEN_ISSUER, audience: TOKEN_AUDIENCE, algorithms: ["HS256"] });
    if (typeof decoded === "string" || !decoded.sub || !decoded.email || (decoded.role !== "admin" && decoded.role !== "customer")) return null;
    return decoded as SessionPayload;
  } catch { return null; }
}

export function getTokenFromRequest(request: Request): string | null {
  const authorization = request.headers.get("authorization");
  if (authorization?.startsWith("Bearer ")) return authorization.slice(7);
  const cookie = request.headers.get("cookie")?.match(new RegExp(`(?:^|; )${TOKEN_NAME}=([^;]+)`));
  return cookie?.[1] ? decodeURIComponent(cookie[1]) : null;
}

export function getSessionFromRequest(request: Request): SessionPayload | null {
  const token = getTokenFromRequest(request);
  return token ? verifyToken(token) : null;
}

export function sessionCookie(token: string) {
  return `${TOKEN_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${TOKEN_MAX_AGE_SECONDS}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
}
export function clearSessionCookie() {
  return `${TOKEN_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
}

export function findUserByEmail(email: string) {
  return getFallbackUsers().find((u: { email: string }) => u.email.toLowerCase() === email.toLowerCase());
}
export function findUserById(id: string) {
  return getFallbackUsers().find((u: { _id?: string; id?: string }) => u._id === id || u.id === id);
}
export function createUser(data: { name: string; email: string; password?: string; phone?: string; provider?: string; providerId?: string; avatar?: string }) {
  const users = getFallbackUsers();
  if (findUserByEmail(data.email)) throw new Error("Email already exists");
  const id = crypto.randomUUID();
  const user = { _id: id, id, name: data.name.trim(), email: data.email.toLowerCase().trim(), phone: data.phone || "", password: data.password ? hashPassword(data.password) : undefined, provider: data.provider || "credentials", providerId: data.providerId, avatar: data.avatar, role: "customer" as Role, emailVerified: false, createdAt: new Date().toISOString() };
  users.push(user);
  saveFallbackUsers(users);
  return user;
}
export function updateUserPasswordById(id: string, newPassword: string) {
  const users = getFallbackUsers();
  const index = users.findIndex((u: { _id?: string; id?: string }) => u._id === id || u.id === id);
  if (index < 0) return null;
  users[index].password = hashPassword(newPassword);
  saveFallbackUsers(users);
  return users[index];
}

export { TOKEN_NAME };
