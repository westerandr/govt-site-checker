import React from 'react'
import Loader from './Loader.jsx'
import Status from './Status.jsx'
// get env type

export default function ListItem(props) {
  const ENV = import.meta.env.MODE;
  const { title, url, refresh } = props
  const [loading, setLoading] = React.useState(false);
  const [fetched, setFetched] = React.useState(false)
  const [status, setStatus] = React.useState(false);
  const [latency, setLatency] = React.useState(-1);
  const functionsEndPoint = '/.netlify/functions/ping'
  const isOk = (data) => data.status

  React.useEffect(() => {
    setLoading(true)
    const link = ENV === 'development' ? url : `${functionsEndPoint}?${new URLSearchParams({ url })}`
    try{
    fetch(link)
    .then(res =>  res.json())
    .then(data => {
       setLatency(data.latency)
       setStatus(isOk(data))
    })
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
      <a href={`https://${url}`} target="_blank" className="text-xs leading-6 text-blue-500 cursor-pointer underline z-20"><svg className='text-blue-500 text-sm inline-block mr-1' width="11px" height="11px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9.16488 17.6505C8.92513 17.8743 8.73958 18.0241 8.54996 18.1336C7.62175 18.6695 6.47816 18.6695 5.54996 18.1336C5.20791 17.9361 4.87912 17.6073 4.22153 16.9498C3.56394 16.2922 3.23514 15.9634 3.03767 15.6213C2.50177 14.6931 2.50177 13.5495 3.03767 12.6213C3.23514 12.2793 3.56394 11.9505 4.22153 11.2929L7.04996 8.46448C7.70755 7.80689 8.03634 7.47809 8.37838 7.28062C9.30659 6.74472 10.4502 6.74472 11.3784 7.28061C11.7204 7.47809 12.0492 7.80689 12.7068 8.46448C13.3644 9.12207 13.6932 9.45086 13.8907 9.7929C14.4266 10.7211 14.4266 11.8647 13.8907 12.7929C13.7812 12.9825 13.6314 13.1681 13.4075 13.4078M10.5919 10.5922C10.368 10.8319 10.2182 11.0175 10.1087 11.2071C9.57284 12.1353 9.57284 13.2789 10.1087 14.2071C10.3062 14.5492 10.635 14.878 11.2926 15.5355C11.9502 16.1931 12.279 16.5219 12.621 16.7194C13.5492 17.2553 14.6928 17.2553 15.621 16.7194C15.9631 16.5219 16.2919 16.1931 16.9495 15.5355L19.7779 12.7071C20.4355 12.0495 20.7643 11.7207 20.9617 11.3787C21.4976 10.4505 21.4976 9.30689 20.9617 8.37869C20.7643 8.03665 20.4355 7.70785 19.7779 7.05026C19.1203 6.39267 18.7915 6.06388 18.4495 5.8664C17.5212 5.3305 16.3777 5.3305 15.4495 5.8664C15.2598 5.97588 15.0743 6.12571 14.8345 6.34955" stroke="#0000ff" strokeWidth="2" strokeLinecap="round"/>
</svg>{url}</a>
    </div>
  </div>
  <div className="flex items-center gap-x-4">
    {loading && <Loader />}
    {!loading && fetched && <Status latency={latency} status={status} />}
  </div>
</li>
}