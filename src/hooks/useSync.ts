import { useEffect } from 'react'
import { useSyncStore } from '@/store/syncStore'
import { fullSync } from '@/services/syncService'

export function useSync() {
  const { isOnline, setOnline, lastSyncAt } = useSyncStore()

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true)
      void fullSync()
    }
    const handleOffline = () => setOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Sync on tab focus if last sync > 5 min ago
    const handleFocus = () => {
      if (!lastSyncAt) return
      const age = Date.now() - new Date(lastSyncAt).getTime()
      if (age > 5 * 60 * 1000) void fullSync()
    }
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') handleFocus()
    })

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [setOnline, lastSyncAt])

  return { isOnline }
}
