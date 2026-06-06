import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { brl } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/pedidos")({ component: OrdersPage });

const STATUSES = ["recebido", "em_preparo", "saiu_entrega", "entregue", "cancelado"] as const;
const LABEL: Record<string, string> = { recebido: "Recebido", em_preparo: "Em preparo", saiu_entrega: "Saiu p/ entrega", entregue: "Entregue", cancelado: "Cancelado" };

function OrdersPage() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["adm-orders"],
    queryFn: async () => (await supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false })).data,
  });
  const setStatus = async (id: string, status: any) => { await supabase.from("orders").update({ status }).eq("id", id); qc.invalidateQueries({ queryKey: ["adm-orders"] }); };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Pedidos</h1>
      {data?.map((o: any) => (
        <div key={o.id} className="rounded-2xl border bg-card p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div><div className="font-bold">#{o.order_number} • {o.customer_name}</div><div className="text-xs text-muted-foreground">{o.phone} • {new Date(o.created_at).toLocaleString("pt-BR")}</div></div>
            <select value={o.status} onChange={(e) => setStatus(o.id, e.target.value)} className="h-9 rounded-md border bg-background px-2 text-sm">
              {STATUSES.map((s) => <option key={s} value={s}>{LABEL[s]}</option>)}
            </select>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">{o.address}, {o.number} - {o.neighborhood}</div>
          <ul className="mt-2 space-y-1 text-sm">{o.order_items?.map((it: any) => <li key={it.id}>{it.quantity}x {it.name} — {brl(Number(it.total))}</li>)}</ul>
          <div className="mt-2 text-right font-extrabold text-primary">Total: {brl(Number(o.total))}</div>
        </div>
      ))}
      {!data?.length && <p className="text-sm text-muted-foreground">Nenhum pedido ainda.</p>}
    </div>
  );
}