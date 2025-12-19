import { describe, it, expect, beforeEach } from 'vitest';
import snapshotCache, { 
  isInFailureCooldown, 
  recordFailure, 
  clearFailure, 
  getFailureInfo 
} from './snapshotCache.js';

describe('snapshotCache', () => {
  beforeEach(() => {
    // Clear cache before each test
    snapshotCache.clear();
    // Note: failureCache is not exported, so we can't clear it directly
    // But we can test with fresh URLs or wait for cooldown to expire
  });

  describe('snapshotCache basic operations', () => {
    it('should store and retrieve snapshots', () => {
      const url = 'test.com';
      const snapshot = 'base64encodedimage';
      
      snapshotCache.set(url, snapshot);
      
      expect(snapshotCache.has(url)).toBe(true);
      expect(snapshotCache.get(url)).toBe(snapshot);
    });

    it('should return false for non-existent URLs', () => {
      expect(snapshotCache.has('nonexistent.com')).toBe(false);
      expect(snapshotCache.get('nonexistent.com')).toBeUndefined();
    });
  });

  describe('failure cooldown', () => {
    it('should not be in cooldown for new URLs', () => {
      expect(isInFailureCooldown('newurl.com')).toBe(false);
    });

    it('should be in cooldown after recording failure', () => {
      const url = 'failed.com';
      recordFailure(url);
      
      expect(isInFailureCooldown(url)).toBe(true);
    });

    it('should track failure attempts', () => {
      const url = 'test.com';
      
      recordFailure(url);
      const info1 = getFailureInfo(url);
      expect(info1.attempts).toBe(1);
      
      recordFailure(url);
      const info2 = getFailureInfo(url);
      expect(info2.attempts).toBe(2);
    });

    it('should clear failure after clearFailure is called', () => {
      const url = 'test.com';
      recordFailure(url);
      
      expect(isInFailureCooldown(url)).toBe(true);
      
      clearFailure(url);
      
      expect(isInFailureCooldown(url)).toBe(false);
      expect(getFailureInfo(url)).toBeNull();
    });

    it('should return failure info', () => {
      const url = 'test.com';
      recordFailure(url);
      
      const info = getFailureInfo(url);
      expect(info).toBeDefined();
      expect(info.timestamp).toBeTypeOf('number');
      expect(info.attempts).toBe(1);
    });

    it('should return null for non-existent failure info', () => {
      expect(getFailureInfo('nonexistent.com')).toBeNull();
    });
  });
});
