export function getUnlockedDayCount(
  accessType: string | undefined,
  accessStartDate: string | null | undefined
): number {
  if (accessType !== 'jee15' && accessType !== 'neet15') {
    return 999; // free users, all stories unlocked
  }
  if (!accessStartDate) return 1; // fallback
  
  const start = new Date(accessStartDate);
  const today = new Date();
  
  // Use IST (UTC+5:30)
  const istOffset = 5.5 * 60 * 60 * 1000;
  const todayIST = new Date(today.getTime() + istOffset);
  const startIST = new Date(start.getTime() + istOffset);
  
  // Normalize to midnight
  todayIST.setHours(0, 0, 0, 0);
  startIST.setHours(0, 0, 0, 0);
  
  const diffDays = Math.floor(
    (todayIST.getTime() - startIST.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  return Math.min(Math.max(diffDays + 1, 1), 15); // Day 1 on start date, max 15
}
