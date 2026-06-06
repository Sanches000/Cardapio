import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/lib/cart";
import { brl, onlyDigits } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({ component: CheckoutPage });

function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => (await supabase.from("settings").select("*").maybeSingle()).data,
  });
  const fee = Number(settings?.delivery_fee ?? 0);
  const total = subtotal + fee;

  const [f, setF] = useState({
    customer_name: "", phone: "", address: "", neighborhood: "", number: "",
    complement: "", payment_method: "Dinheiro", notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  if (items.length === 0) {
    return <div className="p-6">Carrinho vazio. <Link to="/" className="text-primary">Voltar</Link></div>;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.customer_name || !f.phone) { toast.error("Nome e telefone são obrigatórios"); return; }
    setSubmitting(true);
    try {
      const { data: order, error } = await supabase.from("orders").insert({
        ...f, subtotal, delivery_fee: fee, total, status: "recebido",
      }).select().single();
      if (error) throw error;
      await supabase.from("order_items").insert(items.map((it) => ({
        order_id: order.id, product_id: it.productId, name: it.name,
        quantity: it.quantity, unit_price: it.unitPrice, total: it.unitPrice * it.quantity,
        options: { size: it.size, addons: it.addons }, notes: it.notes,
      })));

      const msg = [
        `*Novo Pedido #${order.order_number}*`,
        `*Cliente:* ${f.customer_name}`,
        `*Telefone:* ${f.phone}`,
        `*Endereço:* ${f.address}, ${f.number} - ${f.neighborhood}${f.complement ? ` (${f.complement})` : ""}`,
        ``, `*Itens:*`,
        ...items.map((i) => `• ${i.quantity}x ${i.name}${i.size ? ` (${i.size.name})` : ""}${i.addons.length ? ` + ${i.addons.map((a) => a.name).join(", ")}` : ""} — ${brl(i.unitPrice * i.quantity)}${i.notes ? `\n   Obs: ${i.notes}` : ""}`),
        ``, `*Subtotal:* ${brl(subtotal)}`, `*Entrega:* ${brl(fee)}`, `*Total:* ${brl(total)}`,
        `*Pagamento:* ${f.payment_method}`,
        f.notes ? `\n*Observações:* ${f.notes}` : "",
      ].filter(Boolean).join("\n");

      const wpp = settings?.whatsapp ? onlyDigits(settings.whatsapp) : "";
      if (wpp) window.open(`https://wa.me/${wpp}?text=${encodeURIComponent(msg)}`, "_blank");
      clear();
      toast.success("Pedido enviado!");
      navigate({ to: "/" });
    } catch (err: any) {
      toast.error(err.message);
    } finally { setSubmitting(false); }
  };

  const set = (k: keyof typeof f) => (e: any) => setF({ ...f, [k]: e.target.value });

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b bg-background/95 px-4 py-3 backdrop-blur">
        <Link to="/carrinho" className="rounded-full p-2 hover:bg-muted"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-lg font-bold">Finalizar pedido</h1>
      </header>
      <form onSubmit={submit} className="mx-auto max-w-2xl space-y-4 px-4 py-6">
        <div><Label>Nome completo *</Label><Input value={f.customer_name} onChange={set("customer_name")} required /></div>
        <div><Label>Telefone / WhatsApp *</Label><Input value={f.phone} onChange={set("phone")} required /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><Label>Endereço</Label><Input value={f.address} onChange={set("address")} /></div>
          <div><Label>Número</Label><Input value={f.number} onChange={set("number")} /></div>
          <div><Label>Bairro</Label><Input value={f.neighborhood} onChange={set("neighborhood")} /></div>
          <div className="col-span-2"><Label>Complemento</Label><Input value={f.complement} onChange={set("complement")} /></div>
        </div>
        <div>
          <Label>Forma de pagamento</Label>
          <select value={f.payment_method} onChange={set("payment_method")} className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
            <option>Dinheiro</option><option>PIX</option><option>Cartão de Crédito</option><option>Cartão de Débito</option>
          </select>
        </div>
        <div><Label>Observações</Label><Textarea value={f.notes} onChange={set("notes")} /></div>

        <div className="rounded-2xl border bg-card p-4">
          <div className="flex justify-between text-sm"><span>Subtotal</span><span>{brl(subtotal)}</span></div>
          <div className="flex justify-between text-sm"><span>Entrega</span><span>{brl(fee)}</span></div>
          <div className="mt-2 flex justify-between border-t pt-2 font-extrabold"><span>Total</span><span className="text-primary">{brl(total)}</span></div>
        </div>

        <Button type="submit" disabled={submitting} className="h-12 w-full rounded-full text-base font-bold shadow-[var(--shadow-elegant)]">
          {submitting ? "Enviando..." : "Enviar pedido pelo WhatsApp"}
        </Button>
      </form>
    </div>
  );
}