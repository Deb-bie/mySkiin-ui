
'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { appStore, AppState } from '../lib/store'

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(appStore.getState())

  useEffect(() => {
    const unsubscribe = appStore.subscribe(setState)
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe()
      }
    }
  }, [])

  return (
    <AppContext.Provider value={state}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider')
  }
  return context
}