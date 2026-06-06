import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/promocoes")({ component: PromosPage });

function PromosPage() {
  const qc = useQueryClient();
  const [f, setF] = useState({ name: "", description: "", promo_price: 0, start_date: "", end_date: "" });
  const { data } = useQuery({ queryKey: ["adm-promos"], queryFn: async () => (await supabase.from("promotions").select("*").order("created_at", { ascending: false })).data });
  const add = async () => {
    if (!f.name) return;
    const { error } = await supabase.from("promotions").insert({ ...f, promo_price: Number(f.promo_price) || null, start_date: f.start_date || new Date().toISOString(), end_date: f.end_date || null });
    if (error) return toast.error(error.message);
    setF({ name: "", description: "", promo_price: 0, start_date: "", end_date: "" }); qc.invalidateQueries({ queryKey: ["adm-promos"] });
  };
  const del = async (id: string) => { await supabase.from("promotions").delete().eq("id", id); qc.invalidateQueries({ queryKey: ["adm-promos"] }); };
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">Promoções</h1>
      <div className="space-y-2 rounded-2xl border bg-card p-4">
        <Input placeholder="Nome" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <Textarea placeholder="Descrição" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
        <div className="grid grid-cols-3 gap-2">
          <Input type="number" step="0.01" placeholder="Valor promo" value={f.promo_price} onChange={(e) => setF({ ...f, promo_price: parseFloat(e.target.value) || 0 })} />
          <Input type="date" value={f.start_date} onChange={(e) => setF({ ...f, start_date: e.target.value })} />
          <Input type="date" value={f.end_date} onChange={(e) => setF({ ...f, end_date: e.target.value })} />
        </div>
        <Button onClick={add}><Plus className="mr-1 h-4 w-4" />Adicionar</Button>
      </div>
      <div className="space-y-2">{data?.map((p) => (
        <div key={p.id} className="flex items-center justify-between rounded-xl border bg-card p-3">
          <div><div className="font-bold">{p.name}</div><div className="text-xs text-muted-foreground">{p.description}</div></div>
          <Button size="icon" variant="ghost" onClick={() => del(p.id)}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ))}</div>
    </div>
  );
}