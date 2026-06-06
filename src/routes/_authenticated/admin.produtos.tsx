import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { brl } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/produtos")({ component: ProductsPage });

type Form = { id?: string; name: string; short_description: string; long_description: string; price: number; category_id: string | null; image_url: string; available: boolean; featured: boolean; bestseller: boolean; is_new: boolean };
const empty: Form = { name: "", short_description: "", long_description: "", price: 0, category_id: null, image_url: "", available: true, featured: false, bestseller: false, is_new: false };

function ProductsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(empty);

  const { data: products } = useQuery({ queryKey: ["adm-products"], queryFn: async () => (await supabase.from("products").select("*, categories(name)").order("created_at", { ascending: false })).data });
  const { data: cats } = useQuery({ queryKey: ["adm-cats"], queryFn: async () => (await supabase.from("categories").select("*").order("sort_order")).data });

  const save = async () => {
    const payload = { ...form, price: Number(form.price) };
    const { error } = form.id ? await supabase.from("products").update(payload).eq("id", form.id) : await supabase.from("products").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Salvo!"); setOpen(false); setForm(empty); qc.invalidateQueries({ queryKey: ["adm-products"] });
  };
  const del = async (id: string) => { if (!confirm("Excluir?")) return; await supabase.from("products").delete().eq("id", id); qc.invalidateQueries({ queryKey: ["adm-products"] }); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Produtos</h1>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setForm(empty); }}>
          <DialogTrigger asChild><Button onClick={() => setForm(empty)}><Plus className="mr-1 h-4 w-4" />Novo</Button></DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{form.id ? "Editar" : "Novo"} produto</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Nome</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Descrição curta</Label><Input value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} /></div>
              <div><Label>Descrição completa</Label><Textarea value={form.long_description} onChange={(e) => setForm({ ...form, long_description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Preço (R$)</Label><Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} /></div>
                <div><Label>Categoria</Label>
                  <select value={form.category_id ?? ""} onChange={(e) => setForm({ ...form, category_id: e.target.value || null })} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                    <option value="">—</option>{cats?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div><Label>URL da imagem</Label><Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." /></div>
              <div className="flex flex-wrap gap-4 pt-2">
                {[["available","Disponível"],["featured","Destaque"],["bestseller","Mais vendido"],["is_new","Novo"]].map(([k, l]) => (
                  <label key={k} className="flex items-center gap-2 text-sm"><Switch checked={(form as any)[k]} onCheckedChange={(v) => setForm({ ...form, [k]: v })} />{l}</label>
                ))}
              </div>
              <Button onClick={save} className="w-full">Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-2">
        {products?.map((p: any) => (
          <div key={p.id} className="flex items-center gap-3 rounded-xl border bg-card p-3">
            <div className="h-14 w-14 overflow-hidden rounded-lg bg-muted">{p.image_url && <img src={p.image_url} className="h-full w-full object-cover" />}</div>
            <div className="flex-1"><div className="font-bold">{p.name}</div><div className="text-xs text-muted-foreground">{p.categories?.name ?? "—"} • {brl(Number(p.price))} {!p.available && "• Indisponível"}</div></div>
            <Button size="icon" variant="ghost" onClick={() => { setForm({ ...p, price: Number(p.price), short_description: p.short_description ?? "", long_description: p.long_description ?? "", image_url: p.image_url ?? "" }); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
            <Button size="icon" variant="ghost" onClick={() => del(p.id)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}