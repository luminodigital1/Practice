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
      // Replace '@SMA' with your actual secret key used during login
      const decoded = jwt.verify(token, '@SMA') as { userId: number; email: string };
  
      // Fetch userId from cache
      const userId = tokenCache.get(decoded.userId.toString());
  
      // Check if userId is found in the cache
      if (!userId) {
        console.error('UserId not found in cache');
        return null;
      }
  
      // Return userId and email
      return { userId: parseInt(decoded.userId.toString()), email: decoded.email };
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }
