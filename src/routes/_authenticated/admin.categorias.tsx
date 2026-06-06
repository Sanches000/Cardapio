import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/categorias")({ component: CategoriesPage });

function CategoriesPage() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const { data } = useQuery({ queryKey: ["adm-cats-list"], queryFn: async () => (await supabase.from("categories").select("*").order("sort_order")).data });
  const add = async () => {
    if (!name) return;
    const { error } = await supabase.from("categories").insert({ name, sort_order: (data?.length ?? 0) });
    if (error) return toast.error(error.message);
    setName(""); qc.invalidateQueries({ queryKey: ["adm-cats-list"] });
  };
  const update = async (id: string, patch: any) => { await supabase.from("categories").update(patch).eq("id", id); qc.invalidateQueries({ queryKey: ["adm-cats-list"] }); };
  const del = async (id: string) => { if (!confirm("Excluir?")) return; await supabase.from("categories").delete().eq("id", id); qc.invalidateQueries({ queryKey: ["adm-cats-list"] }); };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">Categorias</h1>
      <div className="flex gap-2"><Input placeholder="Nova categoria..." value={name} onChange={(e) => setName(e.target.value)} /><Button onClick={add}><Plus className="h-4 w-4" /></Button></div>
      <div className="space-y-2">
        {data?.map((c) => (
          <div key={c.id} className="flex items-center gap-3 rounded-xl border bg-card p-3">
            <Input value={c.name} onChange={(e) => update(c.id, { name: e.target.value })} className="flex-1" />
            <Input type="number" value={c.sort_order} onChange={(e) => update(c.id, { sort_order: parseInt(e.target.value) || 0 })} className="w-20" />
            <Button size="icon" variant="ghost" onClick={() => del(c.id)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}