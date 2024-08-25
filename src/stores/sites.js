import { atom, map } from 'nanostores';
import sitesData from '../assets/sites.json';

export const allSites = map(sitesData.sites);
export const onlineSites = map([]);
export const offlineSites = map([]);
export const refresh = atom(false)

export const resetSites = () => {
  allSites.set(sitesData.sites);
  onlineSites.set([]);
  offlineSites.set([]);
};

export const refreshSites = () => {
  refresh.set(true);
  resetSites();
  refresh.set(false);
};

export const getSiteData = (id) => {
  return allSites.get().find((site) => site.id === id);
}

export const updateSite = (id, data) => {
  const siteIndex = allSites.get().findIndex((site) => site.id === id);
  const site = allSites.get()[siteIndex];
  const updatedSite = { ...site, ...data };
  allSites.set(allSites.get().filter((site) => site.id !== id));
  if (data.status) {
    if (!onlineSites.get().find((site) => site.id === id)) {
      onlineSites.set([...onlineSites.get(), updatedSite]);
    }
  } else {
    if (!offlineSites.get().find((site) => site.id === id)) {
      offlineSites.set([...offlineSites.get(), updatedSite]);
    }
  }
};