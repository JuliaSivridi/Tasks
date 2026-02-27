import { useEffect, useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { LoginPage } from '@/components/layout/LoginPage'
import { useAuthStore } from '@/store/authStore'
import { initAuth } from '@/services/authService'

export default function App() {
  const { isAuthenticated, refreshToken } = useAuthStore()
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    const init = async () => {
      await initAuth()
      // If we have a remembered user but no token (e.g. after page refresh),
      // attempt a silent token request — GIS will grant it without a popup
      // if the user already authorized the app.
      const state = useAuthStore.getState()
      if (!state.isAuthenticated) {
        if (state.accessToken && state.tokenExpiry && Date.now() < state.tokenExpiry - 60_000) {
          // Token from localStorage is still valid — restore session without a network call
          useAuthStore.getState().setToken(state.accessToken, (state.tokenExpiry - Date.now()) / 1000)
        } else if (state.user) {
          // Token expired but user is known — attempt silent GIS refresh
          try {
            await refreshToken()
          } catch {
            // Silent refresh failed — user will see the login button
          }
        }
      }
      setInitializing(false)
    }
    void init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (initializing) {
    return (
      <div className="min-h-dvh flex items-center justify-center text-muted-foreground">
        Loading...
      </div>
    )
  }

  return isAuthenticated ? <AppShell /> : <LoginPage />
}
