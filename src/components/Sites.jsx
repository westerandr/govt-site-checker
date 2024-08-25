import React from 'react'
import { useStore } from '@nanostores/react'

import { allSites, offlineSites, onlineSites, refresh, refreshSites } from '../stores/sites.js'
import List from './List.jsx'

export default function Sites() {
  const allSitesStore = useStore(allSites)
  const offlineSitesStore = useStore(offlineSites)
  const onlineSitesStore = useStore(onlineSites)
  const refreshStore = useStore(refresh)

  React.useEffect(() => {
    let duration;
    if (refreshStore) {
      duration = setTimeout(() => refreshStore.set(false), 500)
    }
    return () => {
      if (duration) clearTimeout(duration)
    }
  }, [refreshStore])

  // check when online
  React.useEffect(() => {
    if (onlineSitesStore.length > 0 && offlineSitesStore.every(site => site.fetched)) {
      console.log('All sites fetched')
      onlineSites.set(onlineSitesStore.sort((a, b) => a.latency - b.latency))
    }
  }, [onlineSitesStore])


  return <div className='flex flex-col justify-center items-center'>
    <button disabled={refreshStore} onClick={() => refreshSites()} className="btn bg-slate-800 text-white mb-8 w-36 hover:bg-slate-500">
      <svg className={refreshStore ? 'animate-spin' : ''} width="20px" height="20px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="none"><path fill="#fff" d="M7.248 1.307A.75.75 0 118.252.193l2.5 2.25a.75.75 0 010 1.114l-2.5 2.25a.75.75 0 01-1.004-1.114l1.29-1.161a4.5 4.5 0 103.655 2.832.75.75 0 111.398-.546A6 6 0 118.018 2l-.77-.693z" /></svg>
      Refresh</button>
    <div>
      {allSitesStore.length > 0 && <List name="All Sites" sites={allSitesStore} />}
      {offlineSitesStore.length > 0 && <List name="Offline Sites" sites={offlineSitesStore} />}
      <span className="relative flex justify-center">
        <div
          className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-transparent bg-gradient-to-r from-transparent via-gray-500 to-transparent opacity-75"
        ></div>

        <span className="my-5 relative z-10 bg-slate-50 px-6">Available Sites</span>
      </span>
      {onlineSitesStore.length > 0 && <List name="Online Sites" sites={onlineSitesStore} />}
    </div>
  </div>
}