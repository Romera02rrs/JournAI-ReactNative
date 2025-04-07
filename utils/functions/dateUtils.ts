export function getToday() {
  const baseDate = new Date();
  baseDate.setHours(0, 0, 0, 0);
  const year = baseDate.getFullYear();
  const month = String(baseDate.getMonth() + 1).padStart(2, "0");
  const day = String(baseDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDay(date: Date) {
  date.setHours(0, 0, 0, 0);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`; // Devuelve formato YYYY-MM-DD
}

export function isRecentEntry(entryDate: string, today: Date) {
  if (!entryDate) return false;
  const entryDay = new Date(entryDate).setHours(0, 0, 0, 0);
  const todayDay = today.setHours(0, 0, 0, 0);
  const yesterdayDay = new Date(today);
  yesterdayDay.setDate(today.getDate() - 1);
  const dayBeforeYesterday = new Date(today);
  dayBeforeYesterday.setDate(today.getDate() - 2);

  return (
    entryDay === todayDay ||
    entryDay === yesterdayDay.setHours(0, 0, 0, 0) ||
    entryDay === dayBeforeYesterday.setHours(0, 0, 0, 0)
  );
};

export function isEntryExpired(entryDate: string): boolean {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 2);
  const limitDateId = getDay(threeDaysAgo);
  return entryDate < limitDateId;
}