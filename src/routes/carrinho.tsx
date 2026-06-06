import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Minus, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { brl } from "@/lib/format";

export const Route = createFileRoute("/carrinho")({ component: CartPage });

function CartPage() {
  const { items, setQty, remove, subtotal } = useCart();
  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => (await supabase.from("settings").select("*").maybeSingle()).data,
  });
  const fee = Number(settings?.delivery_fee ?? 0);
  const total = subtotal + fee;

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b bg-background/95 px-4 py-3 backdrop-blur">
        <Link to="/" className="rounded-full p-2 hover:bg-muted"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-lg font-bold">Carrinho</h1>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
            Seu carrinho está vazio. <Link to="/" className="font-semibold text-primary">Ver cardápio</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((it) => (
              <div key={it.key} className="flex gap-3 rounded-2xl border bg-card p-3">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                  {it.imageUrl ? <img src={it.imageUrl} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-2xl">🍽️</div>}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold">{it.name}</h3>
                    <button onClick={() => remove(it.key)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </div>
                  {it.size && <p className="text-xs text-muted-foreground">Tamanho: {it.size.name}</p>}
                  {it.addons.length > 0 && <p className="text-xs text-muted-foreground">+ {it.addons.map((a) => a.name).join(", ")}</p>}
                  {it.notes && <p className="text-xs italic text-muted-foreground">Obs: {it.notes}</p>}
                  <div className="mt-2 flex items-center justify-between">
                    <div className="inline-flex items-center gap-1 rounded-full border p-1">
                      <button onClick={() => setQty(it.key, it.quantity - 1)} className="rounded-full p-1 hover:bg-muted"><Minus className="h-3 w-3" /></button>
                      <span className="w-6 text-center text-sm font-bold">{it.quantity}</span>
                      <button onClick={() => setQty(it.key, it.quantity + 1)} className="rounded-full p-1 hover:bg-muted"><Plus className="h-3 w-3" /></button>
                    </div>
                    <span className="font-extrabold text-primary">{brl(it.unitPrice * it.quantity)}</span>
                  </div>
                </div>
              </div>
            ))}

            <div className="rounded-2xl border bg-card p-4">
              <div className="flex justify-between text-sm"><span>Subtotal</span><span>{brl(subtotal)}</span></div>
              <div className="flex justify-between text-sm"><span>Taxa de entrega</span><span>{brl(fee)}</span></div>
              <div className="mt-2 flex justify-between border-t pt-2 text-base font-extrabold"><span>Total</span><span className="text-primary">{brl(total)}</span></div>
            </div>
          </div>
        )}
      </main>
      {items.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 px-4 py-3 backdrop-blur">
          <div className="mx-auto max-w-3xl">
            <Link to="/checkout">
              <Button className="h-12 w-full rounded-full text-base font-bold shadow-[var(--shadow-elegant)]">Finalizar pedido • {brl(total)}</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}