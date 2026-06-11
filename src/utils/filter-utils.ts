export function matchesDateRange(
  isoDate: string,
  startDate: string,
  endDate: string,
): boolean {
  const recordDate = new Date(isoDate);
  const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
  const end = endDate ? new Date(`${endDate}T23:59:59.999`) : null;
  return (!start || recordDate >= start) && (!end || recordDate <= end);
}

export function matchesSearch(value: string, search: string): boolean {
  return value.toLowerCase().includes(search.toLowerCase());
}
