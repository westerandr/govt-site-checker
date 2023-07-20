import React from 'react'
import sitesData from '../assets/sites.json'
import ListItem from './ListItem.jsx'

export default function List() {
  const [refresh, setRefresh] = React.useState(false)

  React.useEffect(() => {
    let duration;
    if (refresh) {
      duration = setTimeout(() => setRefresh(false), 500)
    }
    return () => {
      if (duration) clearTimeout(duration)
    }
  }, [refresh])

  return <div className='flex flex-col justify-center items-center'>
    <button disabled={refresh} onClick={() => setRefresh(true)} className="btn bg-slate-800 text-white mb-8 w-36 hover:bg-slate-500">
      <svg className={refresh ? 'animate-spin' : ''} width="20px" height="20px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="none"><path fill="#fff" d="M7.248 1.307A.75.75 0 118.252.193l2.5 2.25a.75.75 0 010 1.114l-2.5 2.25a.75.75 0 01-1.004-1.114l1.29-1.161a4.5 4.5 0 103.655 2.832.75.75 0 111.398-.546A6 6 0 118.018 2l-.77-.693z" /></svg>
      Refresh</button>
    <ul role="list" className="divide-y divide-gray-100 m-w-7/12 lg:w-11/12 mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 md:gap-x-11">
      {sitesData.sites.map((site, index) => (<ListItem key={index} title={site.name} url={site.site} refresh={refresh} />))}
    </ul>
  </div>
}