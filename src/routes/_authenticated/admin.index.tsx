import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Package, FolderTree, ShoppingBag, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { brl } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/")({ component: Dashboard });

function Dashboard() {
  const { data } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const month = new Date(); month.setDate(1); month.setHours(0, 0, 0, 0);
      const [prods, cats, ordersToday, ordersMonth, items] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("categories").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id, total", { count: "exact" }).gte("created_at", today.toISOString()),
        supabase.from("orders").select("id, total").gte("created_at", month.toISOString()),
        supabase.from("order_items").select("name, quantity").limit(500),
      ]);
      const topMap = new Map<string, number>();
      (items.data ?? []).forEach((i: any) => topMap.set(i.name, (topMap.get(i.name) ?? 0) + i.quantity));
      const top = [...topMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, qty]) => ({ name, qty }));
      return {
        products: prods.count ?? 0,
        categories: cats.count ?? 0,
        ordersToday: ordersToday.count ?? 0,
        revenueMonth: (ordersMonth.data ?? []).reduce((s, o: any) => s + Number(o.total), 0),
        top,
      };
    },
  });

  const cards = [
    { label: "Produtos", value: data?.products ?? 0, icon: Package },
    { label: "Categorias", value: data?.categories ?? 0, icon: FolderTree },
    { label: "Pedidos hoje", value: data?.ordersToday ?? 0, icon: ShoppingBag },
    { label: "Faturamento mês", value: brl(data?.revenueMonth ?? 0), icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border bg-card p-4 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">{c.label}</span><c.icon className="h-4 w-4 text-primary" /></div>
            <div className="mt-2 text-2xl font-extrabold">{c.value}</div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border bg-card p-4">
        <h2 className="mb-3 font-bold">Mais vendidos</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.top ?? []}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="qty" fill="oklch(0.64 0.22 35)" radius={[8, 8, 0, 0]} /></BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}