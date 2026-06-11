import { useQuery } from "@tanstack/react-query";
import * as activityService from "@/services/activity-service";

export function useEntityActivities(entityId: string, limit = 5) {
  return useQuery({
    queryKey: ["activities", "entity", entityId, limit],
    queryFn: () => activityService.fetchActivitiesByEntityId(entityId, limit),
    enabled: !!entityId,
  });
}
