/**
 * Authentication service
 */

import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { createUser, getUserByUsername, updateLastLogin } from '../database';

export interface User {
  id: string;
  username: string;
  email?: string;
  created_at: string;
  last_login_at?: string;
}

export async function createAdminUser(
  username: string,
  password: string,
  email?: string
): Promise<User> {
  // Hash password
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);

  // Generate user ID
  const id = randomBytes(16).toString('hex');

  // Create user in database
  await createUser({
    id,
    username,
    password_hash,
    email,
  });

  return {
    id,
    username,
    email,
    created_at: new Date().toISOString(),
  };
}

export async function validateCredentials(
  username: string,
  password: string
): Promise<User | null> {
  const user = await getUserByUsername(username);
  if (!user) {
    return null;
  }

  // Compare password
  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    return null;
  }

  // Update last login
  await updateLastLogin(user.id);

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    created_at: user.created_at,
    last_login_at: new Date().toISOString(),
  };
}
