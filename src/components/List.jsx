import React from 'react'
import ListItem from './ListItem.jsx'

export default function List({ name, sites }) {
  return <div className='flex flex-col justify-center items-center'>
    <ul role="list" className="divide-y divide-slate-50 m-w-7/12 lg:w-11/12 mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 md:gap-x-11">
      <span className='hidden' aria-details={name}></span>
      { Array.isArray(sites) && sites?.map((site) => (<ListItem key={site.id} id={site.id} title={site.name} url={site.site} />))}
    </ul>
  </div>
}