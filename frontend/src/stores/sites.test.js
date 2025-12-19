import { describe, it, expect, beforeEach } from 'vitest';
import { 
  allSites, 
  onlineSitesOrdered, 
  onlineSitesUnordered, 
  offlineSites, 
  refresh,
  resetSites,
  refreshSites,
  getSiteData,
  updateSite
} from './sites.js';
import sitesData from '../assets/sites.json';

describe('sites store', () => {
  beforeEach(() => {
    // Reset all stores before each test
    resetSites();
    refresh.set(false);
  });

  describe('resetSites', () => {
    it('should reset all sites to initial state', () => {
      // Modify stores
      onlineSitesOrdered.set([{ id: 1, site: 'test.com', name: 'Test' }]);
      offlineSites.set([{ id: 2, site: 'test2.com', name: 'Test 2' }]);
      
      resetSites();
      
      expect(allSites.get().length).toBeGreaterThan(0);
      expect(onlineSitesOrdered.get().length).toBe(0);
      expect(onlineSitesUnordered.get().length).toBe(0);
      expect(offlineSites.get().length).toBe(0);
    });
  });

  describe('refreshSites', () => {
    it('should set refresh flag and reset sites', () => {
      refreshSites();
      
      // refresh flag should be set to false after reset
      expect(refresh.get()).toBe(false);
      expect(allSites.get().length).toBeGreaterThan(0);
    });
  });

  describe('getSiteData', () => {
    it('should find site in allSites', () => {
      const firstSite = sitesData.sites[0];
      const site = getSiteData(firstSite.id);
      
      expect(site).toBeDefined();
      expect(site.id).toBe(firstSite.id);
      expect(site.site).toBe(firstSite.site);
    });

    it('should return null for non-existent site', () => {
      const site = getSiteData(99999);
      expect(site).toBeNull();
    });

    it('should find site in onlineSitesOrdered', () => {
      const testSite = { id: 100, site: 'test.com', name: 'Test', status: true, latency: 50 };
      onlineSitesOrdered.set([testSite]);
      
      const site = getSiteData(100);
      expect(site).toBeDefined();
      expect(site.id).toBe(100);
    });

    it('should find site in offlineSites', () => {
      const testSite = { id: 200, site: 'offline.com', name: 'Offline', status: false };
      offlineSites.set([testSite]);
      
      const site = getSiteData(200);
      expect(site).toBeDefined();
      expect(site.id).toBe(200);
    });
  });

  describe('updateSite', () => {
    it('should update site and add to onlineSitesOrdered when status is true and latency exists', () => {
      const firstSite = sitesData.sites[0];
      const updatedData = { status: true, latency: 50 };
      
      updateSite(firstSite.id, updatedData);
      
      const ordered = onlineSitesOrdered.get();
      expect(ordered.length).toBe(1);
      expect(ordered[0].id).toBe(firstSite.id);
      expect(ordered[0].status).toBe(true);
      expect(ordered[0].latency).toBe(50);
    });

    it('should update site and add to onlineSitesUnordered when status is true but no latency', () => {
      const firstSite = sitesData.sites[0];
      const updatedData = { status: true };
      
      updateSite(firstSite.id, updatedData);
      
      const unordered = onlineSitesUnordered.get();
      expect(unordered.length).toBe(1);
      expect(unordered[0].id).toBe(firstSite.id);
      expect(unordered[0].status).toBe(true);
    });

    it('should update site and add to offlineSites when status is false', () => {
      const firstSite = sitesData.sites[0];
      const updatedData = { status: false };
      
      updateSite(firstSite.id, updatedData);
      
      const offline = offlineSites.get();
      expect(offline.length).toBe(1);
      expect(offline[0].id).toBe(firstSite.id);
      expect(offline[0].status).toBe(false);
    });

    it('should sort onlineSitesOrdered by latency', () => {
      const site1 = sitesData.sites[0];
      const site2 = sitesData.sites[1];
      
      updateSite(site2.id, { status: true, latency: 100 });
      updateSite(site1.id, { status: true, latency: 50 });
      
      const ordered = onlineSitesOrdered.get();
      expect(ordered.length).toBe(2);
      expect(ordered[0].latency).toBe(50);
      expect(ordered[1].latency).toBe(100);
    });

    it('should not add duplicate sites to offlineSites', () => {
      const firstSite = sitesData.sites[0];
      const updatedData = { status: false };
      
      updateSite(firstSite.id, updatedData);
      updateSite(firstSite.id, updatedData);
      
      const offline = offlineSites.get();
      expect(offline.length).toBe(1);
    });
  });
});
