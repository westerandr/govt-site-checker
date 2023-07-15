import React from 'react'
import Loader from './Loader.jsx'
import Status from './Status.jsx'

export default function ListItem(props){
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState(false);
  const { title, url } = props

  const isOk = (r) => r.ok || r.status === 200 || (r.status === 0 && r.type === 'opaque')

  React.useEffect(() => {
    setLoading(true)
    try{
    fetch(`https://${url}`,
    {
      method: "GET",
      mode: "no-cors",
      cache: "no-cache",
      referrerPolicy: "no-referrer"
    })
    .then(res =>  setStatus(isOk(res)))
    .catch(_err => setStatus(false))
    .finally(() => setLoading(false))
  }catch(err){
    alert(JSON.stringify(err))
  }
  }, [])

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
    {!loading && <Status status={status} />}
  </div>
</li>
}