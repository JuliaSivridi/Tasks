import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'
import { ListTodo, Chrome } from 'lucide-react'

export function LoginPage() {
  const [loading, setLoading] = useState(false)
  const { refreshToken } = useAuthStore()

  const handleLogin = async () => {
    setLoading(true)
    try {
      await refreshToken()
    } catch (err) {
      console.error('Login failed', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6 p-8 max-w-sm w-full">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <ListTodo size={24} className="text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Tasks</h1>
            <p className="text-sm text-muted-foreground">Personal task manager</p>
          </div>
        </div>

        <div className="text-center space-y-1">
          <p className="text-muted-foreground">
            Data stored in your Google Sheets.
          </p>
          <p className="text-muted-foreground">
            Works offline with automatic sync.
          </p>
        </div>

        <Button
          onClick={() => void handleLogin()}
          disabled={loading}
          className="w-full gap-2"
          size="lg"
        >
          <Chrome size={18} />
          {loading ? 'Signing in...' : 'Sign in with Google'}
        </Button>
      </div>
    </div>
  )
}
