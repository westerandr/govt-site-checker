import React from 'react'
import Loader from './Loader.jsx'
import Status from './Status.jsx'

export default function ListItem(props){
  const { title, url, refresh } = props
  const [loading, setLoading] = React.useState(false);
  const [fetched, setFetched] = React.useState(false)
  const [status, setStatus] = React.useState(false);
  const functionsEndPoint = '/.netlify/functions/ping'
  const isOk = (data) => data.status

  React.useEffect(() => {
    setLoading(true)
    try{
    fetch(`${functionsEndPoint}?${new URLSearchParams({ url })}`)
    .then(res =>  res.json())
    .then(data => setStatus(isOk(data)))
    .catch(_err => setStatus(false))
    .finally(() => {
      setLoading(false)
      setFetched(true)
    })
  }catch(err){
    console(JSON.stringify(err))
  }
  }, [refresh])

  return <li className="relative flex justify-between gap-x-6 mb-3">
  <div className="flex gap-x-4">
    <div className="min-w-0 flex-auto">
      <p className="text-sm font-semibold leading-6 text-gray-900">
        <span>
          {title}
        </span>
      </p>
      <a href={`https://${url}`} target="_blank" className="text-xs leading-6 text-blue-500 cursor-pointer underline z-20">{url}</a>
    </div>
  </div>
  <div className="flex items-center gap-x-4">
    {loading && <Loader />}
    {!loading && fetched && <Status status={status} />}
  </div>
</li>
}