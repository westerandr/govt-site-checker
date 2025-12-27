import React from 'react'
import { useStore } from '@nanostores/react'

import { allSites, offlineSites, onlineSitesOrdered, onlineSitesUnordered } from '../stores/sites.js'
import { filterSitesForSearch } from '../components/List.jsx'

const SitesContext = React.createContext(null)

export function SitesProvider({ children }) {
  const allSitesStore = useStore(allSites)
  const offlineSitesStore = useStore(offlineSites)
  const onlineSitesOrderedStore = useStore(onlineSitesOrdered)
  const onlineSitesUnorderedStore = useStore(onlineSitesUnordered)
  const [searchTerm, setSearchTerm] = React.useState('')

  const onlineSitesStore = React.useMemo(
    () => [...onlineSitesOrderedStore, ...onlineSitesUnorderedStore],
    [onlineSitesOrderedStore, onlineSitesUnorderedStore],
  )

  const filteredAllSites = React.useMemo(
    () => filterSitesForSearch(allSitesStore, searchTerm),
    [allSitesStore, searchTerm],
  )
  const filteredOfflineSites = React.useMemo(
    () => filterSitesForSearch(offlineSitesStore, searchTerm),
    [offlineSitesStore, searchTerm],
  )
  const filteredOnlineSites = React.useMemo(
    () => filterSitesForSearch(onlineSitesStore, searchTerm),
    [onlineSitesStore, searchTerm],
  )

  const showOfflineSection = offlineSitesStore.length > 0 && filteredOfflineSites.length > 0
  const showOnlineSection = onlineSitesStore.length > 0 && filteredOnlineSites.length > 0

  const value = {
    allSitesStore,
    offlineSitesStore,
    onlineSitesStore,
    filteredAllSites,
    filteredOfflineSites,
    filteredOnlineSites,
    showOfflineSection,
    showOnlineSection,
    searchTerm,
    setSearchTerm,
  }

  return <SitesContext.Provider value={value}>{children}</SitesContext.Provider>
}

export function useSitesContext() {
  const context = React.useContext(SitesContext)
  if (!context) {
    throw new Error('useSitesContext must be used within a SitesProvider')
  }
  return context
}

