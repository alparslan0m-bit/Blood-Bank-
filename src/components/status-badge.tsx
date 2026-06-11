import { Badge } from '@/components/ui/badge'
import { getStatusConfig } from '@/lib/utils'

interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = getStatusConfig(status)
  return (
    <Badge className={config.color}>
      {config.label}
    </Badge>
  )
}
