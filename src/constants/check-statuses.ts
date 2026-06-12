export const CHECK_STATUSES = [
  { value: "all", label: "All Statuses" },
  { value: "created", label: "Created" },
  { value: "transferred", label: "Transferred" },
  { value: "blood_recorded", label: "Blood Recorded" },
  { value: "patient_served", label: "Patient Served" },
] as const;

export const ACTIVE_CHECK_STATUSES = CHECK_STATUSES.filter(
  (s) => s.value !== "all" && s.value !== "patient_served",
);

export const BOTTLENECK_STATUSES = ["created", "blood_recorded"] as const;
