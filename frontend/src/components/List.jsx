import React from 'react'
import ListItem from './ListItem.jsx'
import { onlineSitesOrdered, onlineSitesUnordered } from '../stores/sites.js'
import { useStore } from '@nanostores/react'

export default function List({ name, sites }) {
  // Determine list type for animation direction
  const listType = name === 'Offline Sites' ? 'offline' : name === 'Online Sites' ? 'online' : 'all';
  
  // For online sites, combine ordered and unordered lists
  const onlineSitesOrderedStore = useStore(onlineSitesOrdered);
  const onlineSitesUnorderedStore = useStore(onlineSitesUnordered);
  
  // Combine online sites: ordered (sorted by latency) + unordered (waiting for latency)
  const sortedSites = React.useMemo(() => {
    if (listType === 'online') {
      // Ordered sites are already sorted by latency in the store
      // Unordered sites are still waiting for latency data
      return [...onlineSitesOrderedStore, ...onlineSitesUnorderedStore];
    }
    
    // For non-online lists, just use the provided sites
    return sites;
  }, [listType, onlineSitesOrderedStore, onlineSitesUnorderedStore, sites]);
  
  return <div className='flex flex-col justify-center items-center'>
    <ul role="list" className="divide-y divide-slate-50 m-w-7/12 lg:w-11/12 mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 md:gap-x-11 transition-all duration-300">
      <span className='hidden' aria-details={name}></span>
      { Array.isArray(sortedSites) && sortedSites?.map((site, index) => (
        <ListItem 
          key={site.id} 
          id={site.id} 
          title={site.name} 
          url={site.site} 
          listType={listType}
          index={index}
          site={site}
        />
      ))}
    </ul>
  </div>
}