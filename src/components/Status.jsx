function Status(props) {
  const { status } = props

  const radiusDotColorClass = status ? 'bg-emerald-500/20' : 'bg-red-500/20'
  const dotColorClass = status ? 'bg-emerald-500' : 'bg-red-500'

  return (
    <div className="flex flex-col items-end">
      <div className="mt-1 flex items-center gap-x-1.5">
        <div className={`flex-none rounded-full ${radiusDotColorClass} p-1`}>
          <div className={`h-1.5 w-1.5 rounded-full ${dotColorClass}`}></div>
        </div>
        <p className="text-xs leading-5 text-gray-500">{status ? 'Online' : 'Offline'}</p>
      </div>
    </div>
  )
}

export default Status