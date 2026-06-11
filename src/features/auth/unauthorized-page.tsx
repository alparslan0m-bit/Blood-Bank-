import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/auth-provider'
import { ShieldX } from 'lucide-react'

export function UnauthorizedPage() {
  const { signOut } = useAuth()

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas-soft">
      <div className="text-center max-w-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-error-soft mx-auto mb-4">
          <ShieldX className="h-6 w-6 text-error" />
        </div>
        <h1 className="text-display-sm text-ink mb-2">Access Denied</h1>
        <p className="text-body-sm text-body mb-6">
          You don't have administrator privileges to access this dashboard. Contact your system administrator for access.
        </p>
        <Button variant="secondary" onClick={signOut}>
          Sign out
        </Button>
      </div>
    </div>
  )
}
