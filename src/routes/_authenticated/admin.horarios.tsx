import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { DAYS_PT } from "@/lib/hours";

export const Route = createFileRoute("/_authenticated/admin/horarios")({ component: HoursPage });

function HoursPage() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["adm-hours"], queryFn: async () => (await supabase.from("business_hours").select("*").order("day_of_week")).data });
  const update = async (id: string, patch: any) => { await supabase.from("business_hours").update(patch).eq("id", id); qc.invalidateQueries({ queryKey: ["adm-hours"] }); };
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Horários</h1>
      <div className="space-y-2">
        {data?.map((h) => (
          <div key={h.id} className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-3">
            <div className="w-24 font-semibold">{DAYS_PT[h.day_of_week]}</div>
            <label className="flex items-center gap-2 text-sm"><Switch checked={!h.closed} onCheckedChange={(v) => update(h.id, { closed: !v })} />Aberto</label>
            <Input type="time" value={h.open_time ?? ""} onChange={(e) => update(h.id, { open_time: e.target.value })} className="w-32" disabled={h.closed} />
            <span>até</span>
            <Input type="time" value={h.close_time ?? ""} onChange={(e) => update(h.id, { close_time: e.target.value })} className="w-32" disabled={h.closed} />
          </div>
        ))}
      </div>
    </div>
  );
}