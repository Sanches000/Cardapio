import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ArrowLeft, Minus, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { brl } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";

export const Route = createFileRoute("/produto/$id")({
  component: ProductDetail,
  errorComponent: ({ error }) => <div className="p-6 text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-6">Produto não encontrado.</div>,
});

function ProductDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { add } = useCart();

  const [qty, setQty] = useState(1);
  const [sizeId, setSizeId] = useState<string | null>(null);
  const [addonIds, setAddonIds] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const [{ data: prod, error }, { data: sizes }, { data: addons }] = await Promise.all([
        supabase.from("products").select("*").eq("id", id).maybeSingle(),
        supabase.from("product_sizes").select("*").eq("product_id", id).order("sort_order"),
        supabase.from("product_addons").select("*").eq("product_id", id).order("sort_order"),
      ]);
      if (error) throw error;
      return { product: prod, sizes: sizes ?? [], addons: addons ?? [] };
    },
  });

  const unit = useMemo(() => {
    if (!data?.product) return 0;
    const base = Number(data.product.price);
    const size = data.sizes.find((s) => s.id === sizeId);
    const sizePrice = size ? Number(size.price) : 0;
    const addonsPrice = data.addons
      .filter((a) => addonIds.includes(a.id))
      .reduce((sum, a) => sum + Number(a.price), 0);
    return base + sizePrice + addonsPrice;
  }, [data, sizeId, addonIds]);

  if (isLoading) return <div className="p-6">Carregando...</div>;
  if (!data?.product) return <div className="p-6">Produto não encontrado.</div>;

  const p = data.product;

  const handleAdd = () => {
    const size = data.sizes.find((s) => s.id === sizeId);
    const addons = data.addons.filter((a) => addonIds.includes(a.id));
    add({
      key: `${p.id}-${sizeId ?? ""}-${addonIds.join("|")}-${notes}`,
      productId: p.id,
      name: p.name,
      unitPrice: unit,
      quantity: qty,
      size: size ? { name: size.name, price: Number(size.price) } : null,
      addons: addons.map((a) => ({ name: a.name, price: Number(a.price) })),
      notes: notes || undefined,
      imageUrl: p.image_url,
    });
    toast.success(`${qty}x ${p.name} adicionado ao carrinho`);
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="relative h-72 w-full overflow-hidden bg-muted sm:h-96">
        {p.image_url ? (
          <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-6xl">🍽️</div>
        )}
        <Link
          to="/"
          className="absolute left-4 top-4 inline-flex items-center justify-center rounded-full bg-white/95 p-2 text-foreground shadow-md backdrop-blur transition hover:bg-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="text-2xl font-extrabold tracking-tight">{p.name}</h1>
        <p className="mt-2 text-muted-foreground">{p.long_description ?? p.short_description}</p>
        <div className="mt-3 text-2xl font-extrabold text-primary">{brl(Number(p.price))}</div>

        {data.sizes.length > 0 && (
          <section className="mt-6">
            <h3 className="mb-2 font-bold">Tamanho</h3>
            <div className="space-y-2">
              {data.sizes.map((s) => (
                <label
                  key={s.id}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border border-border bg-card p-3 transition ${
                    sizeId === s.id ? "ring-2 ring-primary" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={sizeId === s.id}
                      onChange={() => setSizeId(s.id)}
                      className="accent-primary"
                    />
                    <span>{s.name}</span>
                  </div>
                  <span className="font-semibold">+ {brl(Number(s.price))}</span>
                </label>
              ))}
            </div>
          </section>
        )}

        {data.addons.length > 0 && (
          <section className="mt-6">
            <h3 className="mb-2 font-bold">Adicionais</h3>
            <div className="space-y-2">
              {data.addons.map((a) => (
                <label
                  key={a.id}
                  className="flex cursor-pointer items-center justify-between rounded-xl border border-border bg-card p-3"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={addonIds.includes(a.id)}
                      onChange={(e) =>
                        setAddonIds((prev) =>
                          e.target.checked ? [...prev, a.id] : prev.filter((i) => i !== a.id),
                        )
                      }
                      className="accent-primary"
                    />
                    <span>{a.name}</span>
                  </div>
                  <span className="font-semibold">+ {brl(Number(a.price))}</span>
                </label>
              ))}
            </div>
          </section>
        )}

        <section className="mt-6">
          <h3 className="mb-2 font-bold">Observações</h3>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ex: sem cebola, ponto da carne..." />
        </section>

        <section className="mt-6 flex items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card p-1">
            <button onClick={() => setQty(Math.max(1, qty - 1))} className="rounded-full p-2 hover:bg-muted">
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-6 text-center font-bold">{qty}</span>
            <button onClick={() => setQty(qty + 1)} className="rounded-full p-2 hover:bg-muted">
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <Button
            onClick={handleAdd}
            disabled={!p.available}
            className="h-12 flex-1 rounded-full text-base font-bold shadow-[var(--shadow-elegant)]"
          >
            Adicionar • {brl(unit * qty)}
          </Button>
        </div>
      </div>
    </div>
  );
}