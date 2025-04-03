import { getTodayId } from "@/utils/functions/getTodayId";

test("Devuelve una fecha en formato YYYY-MM-DD", () => {
  const todayId = getTodayId();
  // Verifica que tenga longitud 10 y guiones
  expect(typeof todayId).toBe("string");
  expect(todayId).toHaveLength(10);
  expect(todayId).toMatch(/^\d{4}-\d{2}-\d{2}$/);
});