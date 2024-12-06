import { socket } from '@/services/socket'
import { useEffect, useState } from 'react'

export function NotificaitonMenu() {
  const [isConnected, setIsConnected] = useState(false)
  const [transport, setTransport] = useState('N/A')

  useEffect(() => {
    if (socket.connected) {
      onConnect()
    }

    function onConnect() {
      setIsConnected(true)
    }

    function onDisconnected() {
      setIsConnected(false)
      setTransport('N/A')
    }

    socket.on('connect', onConnect)
    socket.on('disconnet', onDisconnected)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnected)
    }
  }, [])

  return (
    <ul className='w-full bg-primary '>
      <li></li>
    </ul>
  )
}
