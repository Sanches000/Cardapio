import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { brl } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/relatorios")({ component: ReportsPage });

function ReportsPage() {
  const today = new Date().toISOString().slice(0, 10);
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const [from, setFrom] = useState(monthAgo);
  const [to, setTo] = useState(today);
  const { data } = useQuery({
    queryKey: ["reports", from, to],
    queryFn: async () => {
      const start = new Date(from + "T00:00:00").toISOString();
      const end = new Date(to + "T23:59:59").toISOString();
      const [orders, items, views] = await Promise.all([
        supabase.from("orders").select("id, total").gte("created_at", start).lte("created_at", end),
        supabase.from("order_items").select("name, quantity, total, orders!inner(created_at)").gte("orders.created_at", start).lte("orders.created_at", end),
        supabase.from("products").select("name, views").order("views", { ascending: false }).limit(10),
      ]);
      const top = new Map<string, number>();
      (items.data ?? []).forEach((i: any) => top.set(i.name, (top.get(i.name) ?? 0) + i.quantity));
      return {
        orders: orders.data?.length ?? 0,
        revenue: (orders.data ?? []).reduce((s, o: any) => s + Number(o.total), 0),
        top: [...top.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10),
        views: views.data ?? [],
      };
    },
  });
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">Relatórios</h1>
      <div className="flex gap-2"><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-44" /><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-44" /></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border bg-card p-4"><div className="text-xs text-muted-foreground">Pedidos</div><div className="text-2xl font-extrabold">{data?.orders ?? 0}</div></div>
        <div className="rounded-2xl border bg-card p-4"><div className="text-xs text-muted-foreground">Faturamento estimado</div><div className="text-2xl font-extrabold">{brl(data?.revenue ?? 0)}</div></div>
      </div>
      <div className="rounded-2xl border bg-card p-4"><h2 className="mb-2 font-bold">Produtos mais vendidos</h2>
        <ul className="space-y-1 text-sm">{data?.top.map(([n, q]) => <li key={n} className="flex justify-between"><span>{n}</span><span className="font-bold">{q}</span></li>)}</ul>
      </div>
      <div className="rounded-2xl border bg-card p-4"><h2 className="mb-2 font-bold">Mais visualizados</h2>
        <ul className="space-y-1 text-sm">{data?.views.map((v: any) => <li key={v.name} className="flex justify-between"><span>{v.name}</span><span className="font-bold">{v.views}</span></li>)}</ul>
      </div>
    </div>
  );
}