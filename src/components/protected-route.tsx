import { Navigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/auth-provider'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, isAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-canvas-soft">
        <div className="animate-spin h-6 w-6 border-2 border-ink border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (!isAdmin) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}
