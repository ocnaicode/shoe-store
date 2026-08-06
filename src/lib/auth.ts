import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getFallbackUsers, saveFallbackUsers, getSettings } from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "hoko_secret_2026";

export type AuthUser = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  provider: string;
  avatar?: string;
  role: string;
};

export function hashPassword(password: string) {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compareSync(password, hash);
}

export function generateToken(user: AuthUser) {
  return jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "30d" });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// Fallback user operations
export function findUserByEmail(email: string) {
  const users = getFallbackUsers();
  return users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
}

export function findUserById(id: string) {
  const users = getFallbackUsers();
  return users.find((u: any) => u._id === id || u.id === id);
}

export function createUser(data: any) {
  const users = getFallbackUsers();
  const existing = findUserByEmail(data.email);
  if (existing) return existing;
  const newUser = {
    _id: Date.now().toString(),
    id: Date.now().toString(),
    name: data.name,
    email: data.email.toLowerCase(),
    phone: data.phone || "",
    password: data.password ? hashPassword(data.password) : undefined,
    provider: data.provider || "credentials",
    providerId: data.providerId || undefined,
    avatar: data.avatar || `https://i.pravatar.cc/100?u=${data.email}`,
    role: data.role || "customer",
    emailVerified: data.provider !== "credentials" ? true : false,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  saveFallbackUsers(users);
  return newUser;
}

export function updateUserPassword(email: string, newPassword: string) {
  const users = getFallbackUsers();
  const idx = users.findIndex((u: any) => u.email.toLowerCase() === email.toLowerCase());
  if (idx === -1) return null;
  users[idx].password = hashPassword(newPassword);
  saveFallbackUsers(users);
  return users[idx];
}
