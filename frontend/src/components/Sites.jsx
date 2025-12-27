import SitesLayout from './SitesLayout.jsx'
import React from 'react'
import { useStore } from '@nanostores/react'
import { refresh, refreshSites } from '../stores/sites.js'
import { SitesProvider } from '../context/SitesContext.jsx'

export default function Sites() {
  const refreshStore = useStore(refresh)

  return (
    <SitesProvider>
      <SitesLayout refreshStore={refreshStore} refreshSites={refreshSites} />
    </SitesProvider>
  )
}