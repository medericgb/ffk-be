import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import * as userService from './user.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_OPTIONS = { expiresIn: '7d' };

async function login(username, password) {
  const user = await userService.findByUsernameOrEmail(username);
  if (!user) return null;
  const ok = await bcrypt.compare(String(password || ''), user.password);
  if (!ok) return null;
  const accessToken = jwt.sign(
    { email: user.email },
    JWT_SECRET,
    JWT_OPTIONS
  );
  return { accessToken };
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export {
  login,
  verifyToken,
};
