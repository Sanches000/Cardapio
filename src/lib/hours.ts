import type { Tables } from "@/integrations/supabase/types";

export function isOpenNow(hours: Tables<"business_hours">[] | undefined | null) {
  if (!hours || hours.length === 0) return false;
  const now = new Date();
  const dow = now.getDay();
  const today = hours.find((h) => h.day_of_week === dow);
  if (!today || today.closed || !today.open_time || !today.close_time) return false;
  const cur = now.getHours() * 60 + now.getMinutes();
  const [oh, om] = today.open_time.split(":").map(Number);
  const [ch, cm] = today.close_time.split(":").map(Number);
  const open = oh * 60 + om;
  let close = ch * 60 + cm;
  if (close <= open) close += 24 * 60; // past midnight
  const curAdj = cur < open ? cur + 24 * 60 : cur;
  return curAdj >= open && curAdj <= close;
}

export const DAYS_PT = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];