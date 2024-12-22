//JWT 생성 및 검증
import pkg from 'jsonwebtoken';
const { sign, verify } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET_KEY;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

if (!SECRET_KEY) {
    throw new Error('JWT_SECRET_KEY is not defined in the environment variables');
}

// JWT 생성
export function generateToken(payload) {
  const token = sign(payload, SECRET_KEY, { expiresIn: EXPIRES_IN });
  return token;
}

// JWT 검증
export function verifyToken(token) {
  try {
    const decoded = verify(token, SECRET_KEY);
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

export default {
  generateToken,
  verifyToken,
};
