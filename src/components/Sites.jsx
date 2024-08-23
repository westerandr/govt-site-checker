import React from 'react'
import List from './List.jsx'

export default function Sites() {
  const [sites, setSites] = React.useState([])
  const [offlineSites, setOfflineSites] = React.useState([])
  const [onlineSites, setOnlineSites] = React.useState([])
  const [loading, setLoading] = React.useState(false)

  return <div>
    <List />
  </div>
}