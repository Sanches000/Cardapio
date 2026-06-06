import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({ component: AuthPage });

function AuthPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) navigate({ to: "/admin", replace: true }); }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/admin" } });
      if (res.error) throw res.error;
      if (mode === "signup") toast.success("Conta criada! Verifique seu email se solicitado.");
    } catch (err: any) { toast.error(err.message); } finally { setLoading(false); }
  };

  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/admin" });
    if (r.error) toast.error("Erro Google: " + (r.error as any).message);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-3xl border bg-card p-8 shadow-[var(--shadow-elegant)]">
        <Link to="/" className="text-xs text-muted-foreground hover:text-primary">← Voltar ao cardápio</Link>
        <h1 className="mt-3 text-2xl font-extrabold">Área Administrativa</h1>
        <p className="text-sm text-muted-foreground">{mode === "login" ? "Entre para gerenciar seu cardápio" : "Crie sua conta de administrador"}</p>

        <form onSubmit={submit} className="mt-6 space-y-3">
          <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div><Label>Senha</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
          <Button type="submit" disabled={loading} className="h-11 w-full rounded-full font-bold">{loading ? "..." : mode === "login" ? "Entrar" : "Criar conta"}</Button>
        </form>

        <div className="my-4 flex items-center gap-2 text-xs text-muted-foreground"><div className="h-px flex-1 bg-border" />ou<div className="h-px flex-1 bg-border" /></div>
        <Button variant="outline" onClick={google} className="h-11 w-full rounded-full">Entrar com Google</Button>

        <button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-primary">
          {mode === "login" ? "Não tem conta? Criar uma" : "Já tem conta? Entrar"}
        </button>
      </div>
    </div>
  );
}