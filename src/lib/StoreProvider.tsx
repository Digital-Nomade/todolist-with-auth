"use client"

import { useRef } from "react"
import { Provider } from "react-redux"
import { AppStore, makeStore } from "../lib/store"
import { AuthBootstrap } from "./auth/AuthBootstrap"
import { TodoSyncProvider } from "./features/todos/offline/TodoSyncProvider"

interface Props {
  children: React.ReactNode
}

export default function StoreProvider({ children }: Props) {
  const storeRef = useRef<AppStore>()
  
  if (!storeRef.current) {
    storeRef.current = makeStore()
  }

  return (
    <Provider store={storeRef.current}>
      <AuthBootstrap>
        <TodoSyncProvider>{children}</TodoSyncProvider>
      </AuthBootstrap>
    </Provider>
  )
}