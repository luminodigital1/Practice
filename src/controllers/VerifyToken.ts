import jwt from 'jsonwebtoken';
import { User } from '../entities/User';
import NodeCache from 'node-cache';

export const tokenCache = new NodeCache();

export function verifyToken(token: string | undefined) {
    try {
      if (!token) {
        console.error('Token not found');
        return null;
      }
      // Replace 'your-secret-key' with the actual secret key used during login
      const decoded = jwt.verify(token, '@SMA') as { userId: number; email: string };
      console.log('Decoded Token:', decoded);
      return decoded;
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }

  export function getUserInfoFromToken(token: string): { userId: number; email: string } | null {
    try {
      const decoded = jwt.verify(token, '@SMA') as { userId: number; email: string };
  
      const userId = tokenCache.get(decoded.userId.toString());
  
      if (!userId) {
        console.error('UserId not found in cache');
        return null;
      }
  
      return { userId: parseInt(decoded.userId.toString()), email: decoded.email };
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }
