import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/configuracoes")({ component: SettingsPage });

function SettingsPage() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["adm-settings"], queryFn: async () => (await supabase.from("settings").select("*").maybeSingle()).data });
  const [f, setF] = useState<any>(null);
  useEffect(() => { if (data) setF(data); }, [data]);
  if (!f) return <div>Carregando...</div>;
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target?.value ?? e });
  const save = async () => {
    const { error } = await supabase.from("settings").update({ ...f, delivery_fee: Number(f.delivery_fee) || 0 }).eq("id", 1);
    if (error) return toast.error(error.message);
    toast.success("Configurações salvas!"); qc.invalidateQueries();
  };

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-extrabold">Configurações</h1>
      <div><Label>Nome do estabelecimento</Label><Input value={f.establishment_name ?? ""} onChange={set("establishment_name")} /></div>
      <div><Label>URL Logo</Label><Input value={f.logo_url ?? ""} onChange={set("logo_url")} placeholder="https://..." /></div>
      <div><Label>URL Banner</Label><Input value={f.banner_url ?? ""} onChange={set("banner_url")} placeholder="https://..." /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Telefone</Label><Input value={f.phone ?? ""} onChange={set("phone")} /></div>
        <div><Label>WhatsApp (com DDD/DDI)</Label><Input value={f.whatsapp ?? ""} onChange={set("whatsapp")} placeholder="5511999999999" /></div>
        <div><Label>Instagram (URL)</Label><Input value={f.instagram ?? ""} onChange={set("instagram")} /></div>
        <div><Label>Facebook (URL)</Label><Input value={f.facebook ?? ""} onChange={set("facebook")} /></div>
        <div><Label>Taxa de entrega (R$)</Label><Input type="number" step="0.01" value={f.delivery_fee ?? 0} onChange={set("delivery_fee")} /></div>
        <div><Label>Tempo estimado</Label><Input value={f.estimated_delivery_time ?? ""} onChange={set("estimated_delivery_time")} /></div>
      </div>
      <div><Label>Endereço</Label><Textarea value={f.address ?? ""} onChange={set("address")} /></div>
      <label className="flex items-center gap-2 text-sm"><Switch checked={!!f.accept_orders} onCheckedChange={(v) => setF({ ...f, accept_orders: v })} />Aceitando pedidos</label>
      <Button onClick={save} className="w-full">Salvar</Button>
    </div>
  );
}