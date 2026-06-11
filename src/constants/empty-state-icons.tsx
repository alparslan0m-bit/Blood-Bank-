import {
  Heart,
  ClipboardCheck,
  Users,
  UserCog,
  TrendingUp,
  LayoutDashboard,
  Building2,
  Droplets,
  Inbox,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const EMPTY_STATE_ENTITIES = {
  checks: ClipboardCheck,
  donors: Heart,
  patients: Users,
  users: UserCog,
  receivers: TrendingUp,
  distributors: TrendingUp,
  dashboard: LayoutDashboard,
  department: Building2,
  blood: Droplets,
  generic: Inbox,
} as const satisfies Record<string, LucideIcon>;

export type EmptyStateEntity = keyof typeof EMPTY_STATE_ENTITIES;

interface EntityEmptyIconProps {
  entity: EmptyStateEntity;
  className?: string;
}

export function EntityEmptyIcon({ entity, className }: EntityEmptyIconProps) {
  const Icon = EMPTY_STATE_ENTITIES[entity];
  return <Icon className={cn("h-6 w-6 text-mute", className)} aria-hidden />;
}
