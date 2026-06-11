import { Badge } from '@/components/ui/badge'
import { Droplets } from 'lucide-react'

interface BloodTypeBadgeProps {
  code: string
  isRare?: boolean
}

export function BloodTypeBadge({ code, isRare }: BloodTypeBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Badge variant={isRare ? 'error' : 'default'}>
        <Droplets className="h-3 w-3 mr-1" />
        {code}
      </Badge>
      {isRare && (
        <span className="text-caption text-error font-medium">Rare</span>
      )}
    </span>
  )
}
