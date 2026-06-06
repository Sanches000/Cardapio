import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MenuHeader } from "@/components/menu/MenuHeader";
import { ProductCard } from "@/components/menu/ProductCard";
import { Input } from "@/components/ui/input";
import { isOpenNow } from "@/lib/hours";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cardápio Digital Pro" },
      { name: "description", content: "Cardápio online — peça pelo WhatsApp em segundos." },
    ],
  }),
  component: Index,
  errorComponent: ({ error }) => (
    <div className="p-6 text-sm text-destructive">Erro ao carregar: {error.message}</div>
  ),
});

function Index() {
  const [activeCat, setActiveCat] = useState<string | "all">("all");
  const [q, setQ] = useState("");

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("settings").select("*").maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: hours } = useQuery({
    queryKey: ["hours"],
    queryFn: async () => {
      const { data, error } = await supabase.from("business_hours").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const open = useMemo(() => (settings?.accept_orders ?? true) && isOpenNow(hours), [hours, settings]);

  const filtered = useMemo(() => {
    if (!products) return [];
    return products.filter((p) => {
      if (activeCat !== "all" && p.category_id !== activeCat) return false;
      if (q && !`${p.name} ${p.short_description ?? ""}`.toLowerCase().includes(q.toLowerCase()))
        return false;
      return true;
    });
  }, [products, activeCat, q]);

  const grouped = useMemo(() => {
    if (!categories) return [];
    if (activeCat !== "all" || q) {
      return [{ id: "results", name: q ? `Resultados para "${q}"` : "Resultados", products: filtered }];
    }
    return categories.map((c) => ({
      id: c.id,
      name: c.name,
      products: filtered.filter((p) => p.category_id === c.id),
    }));
  }, [categories, filtered, activeCat, q]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <MenuHeader settings={settings ?? null} open={open} />

      <div className="sticky top-0 z-30 -mt-8 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar no cardápio..."
              className="h-11 rounded-full border-border bg-card pl-10 text-sm shadow-sm"
            />
          </div>
          <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              onClick={() => setActiveCat("all")}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                activeCat === "all"
                  ? "bg-primary text-primary-foreground shadow"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              Tudo
            </button>
            {categories?.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCat(c.id)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                  activeCat === c.id
                    ? "bg-primary text-primary-foreground shadow"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {grouped.length === 0 || grouped.every((g) => g.products.length === 0) ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
            Nenhum produto encontrado.
          </div>
        ) : (
          grouped.map((g) =>
            g.products.length === 0 ? null : (
              <section key={g.id} className="mb-8">
                <h2 className="mb-3 text-lg font-extrabold tracking-tight text-foreground">{g.name}</h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {g.products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </section>
            ),
          )
        )}
      </main>
    </div>
  );
}
