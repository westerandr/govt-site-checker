import React from 'react'
import List from './List.jsx'
import { useSitesContext } from '../context/SitesContext.jsx'

export default function SitesLayout({ refreshStore, refreshSites }) {
  const {
    allSitesStore,
    offlineSitesStore,
    onlineSitesStore,
    showOfflineSection,
    showOnlineSection,
    searchTerm,
    setSearchTerm,
  } = useSitesContext()

  React.useEffect(() => {
    let duration
    if (refreshStore) {
      duration = setTimeout(() => refreshStore.set(false), 500)
    }
    return () => {
      if (duration) clearTimeout(duration)
    }
  }, [refreshStore])

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="mb-6 flex w-full max-w-2xl flex-col gap-3 px-4">
        <input
          type="search"
          value={searchTerm}
          onChange={event => setSearchTerm(event.target.value)}
          placeholder="Search sites by name or domain"
          className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
          aria-label="Filter sites by name or domain"
        />
        <button
          disabled={refreshStore}
          onClick={refreshSites}
          className="btn bg-slate-800 text-white w-full hover:bg-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg
            className={refreshStore ? 'animate-spin' : ''}
            width="20px"
            height="20px"
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
          >
            <path
              fill="#fff"
              d="M7.248 1.307A.75.75 0 118.252.193l2.5 2.25a.75.75 0 010 1.114l-2.5 2.25a.75.75 0 01-1.004-1.114l1.29-1.161a4.5 4.5 0 103.655 2.832.75.75 0 111.398-.546A6 6 0 118.018 2l-.77-.693z"
            />
          </svg>
          Refresh
        </button>
      </div>
      <div>
        {allSitesStore.length > 0 && <List name="All Sites" sites={allSitesStore} searchTerm={searchTerm} />}
        {showOfflineSection && (
          <>
              <span className="relative flex justify-center">
                <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-transparent bg-gradient-to-r from-transparent via-gray-500 to-transparent opacity-75"></div>
              <span className="my-5 relative z-10 bg-slate-50 px-6">Offline Sites</span>
            </span>
          <List name="Offline Sites" sites={offlineSitesStore} searchTerm={searchTerm} />
          </>
        )}
        {showOnlineSection && (
          <>
            <span className="relative flex justify-center">
              <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-transparent bg-gradient-to-r from-transparent via-gray-500 to-transparent opacity-75"></div>

              <span className="my-5 relative z-10 bg-slate-50 px-6">Available Sites</span>
            </span>
            <List name="Online Sites" sites={onlineSitesStore} searchTerm={searchTerm} />
          </>
        )}
      </div>
    </div>
  )
}

