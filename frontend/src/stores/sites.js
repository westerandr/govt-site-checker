import { atom, map } from 'nanostores';
import sitesData from '../assets/sites.json';

export const allSites = map(sitesData.sites);
export const onlineSitesOrdered = map([]);
export const onlineSitesUnordered = map([]);
export const offlineSites = map([]);
export const refresh = atom(false)

export const resetSites = () => {
  allSites.set(sitesData.sites);
  onlineSitesOrdered.set([]);
  onlineSitesUnordered.set([]);
  offlineSites.set([]);
};

export const refreshSites = () => {
  refresh.set(true);
  resetSites();
  refresh.set(false);
};

export const getSiteData = (id) => {

  const site = allSites.get().find((site) => site.id === id);
  if (site) return site;

  const orderedSite = onlineSitesOrdered.get().find((site) => site.id === id);
  if (orderedSite) return orderedSite;

  const unorderedSite = onlineSitesUnordered.get().find((site) => site.id === id);
  if (unorderedSite) return unorderedSite;

  // Check offlineSites
  const offlineSite = offlineSites.get().find((site) => site.id === id);
  if (offlineSite) return offlineSite;

  return null;
}

// Helper function to sort sites by latency
const sortByLatency = (a, b) => {
  if (a.latency == null && b.latency == null) return 0;
  if (a.latency == null) return 1;
  if (b.latency == null) return -1;
  return a.latency - b.latency;
};

export const updateSite = (id, data) => {
  const siteIndex = allSites.get().findIndex((site) => site.id === id);
  const site = allSites.get()[siteIndex];
  const updatedSite = { ...site, ...data };
  allSites.set(allSites.get().filter((site) => site.id !== id));

  if (data.status) {
    const ordered = onlineSitesOrdered.get().filter((site) => site.id !== id);
    const unordered = onlineSitesUnordered.get().filter((site) => site.id !== id);

    if (data.latency != null) {
      // Site has latency - add to ordered list and sort
      ordered.push(updatedSite);
      ordered.sort(sortByLatency);
      onlineSitesOrdered.set(ordered);
    } else {
      // Site doesn't have latency yet - keep in unordered
      if (!unordered.find((site) => site.id === id)) {
        unordered.push(updatedSite);
        onlineSitesUnordered.set(unordered);
      }
    }
  } else {
    if (!offlineSites.get().find((site) => site.id === id)) {
      offlineSites.set([...offlineSites.get(), updatedSite]);
    }
  }
};