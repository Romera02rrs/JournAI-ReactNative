export const dateFormatOptions: Intl.DateTimeFormatOptions = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
};

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
}

export function isEntryExpired(entryDate: string): boolean {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 2);
  const limitDateId = getDay(threeDaysAgo);
  return entryDate < limitDateId;
}

export function editableEntriesDates(allEntries: { id: string }[]): string[] {
  // Si no hay entradas registradas, se retorna un arreglo vacío.
  if (allEntries.length === 0) {
    return [];
  }

  // Obtenemos la fecha de hoy en formato "YYYY-MM-DD"
  const todayStr = getToday();
  // Creamos un objeto Date para hoy (asegurándonos de que la hora sea 00:00)
  const today = new Date(todayStr);
  today.setHours(0, 0, 0, 0);

  // Convertimos las entradas almacenadas a un Set para facilitar la búsqueda
  const storedDates = new Set(allEntries.map(entry => entry.id));

  // Arreglo donde se guardarán las fechas faltantes (máximo 2)
  const missingDates: string[] = [];
  
  // Variable para ir retrocediendo día a día desde ayer
  let dayOffset = 1;
  
  // Se itera hasta encontrar 2 días sin entrada o hasta que se encuentre un día con entrada
  while (missingDates.length < 2) {
    // Se crea la fecha para el día actual de la iteración
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() - dayOffset);
    const currentDateFormatted = getDay(currentDate);

    // Si para el día actual existe una entrada registrada, se detiene la búsqueda
    if (storedDates.has(currentDateFormatted)) {
      break;
    }

    // Si no existe entrada para este día, se agrega al arreglo de fechas faltantes
    missingDates.push(currentDateFormatted);

    // Se incrementa el contador para retroceder al siguiente día
    dayOffset++;
  }

  // Se devuelve el arreglo con las fechas faltantes en orden cronológico (la más antigua primero)
  return missingDates.reverse();
}
