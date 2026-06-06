import { createFileRoute, Outlet, Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Package, FolderTree, ShoppingBag, Tag, Clock, Settings as SettingsIcon, QrCode, BarChart3, LogOut, Menu, X, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/admin")({ component: AdminLayout });

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/produtos", label: "Produtos", icon: Package },
  { to: "/admin/categorias", label: "Categorias", icon: FolderTree },
  { to: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag },
  { to: "/admin/promocoes", label: "Promoções", icon: Tag },
  { to: "/admin/horarios", label: "Horários", icon: Clock },
  { to: "/admin/configuracoes", label: "Configurações", icon: SettingsIcon },
  { to: "/admin/qrcode", label: "QR Code", icon: QrCode },
  { to: "/admin/relatorios", label: "Relatórios", icon: BarChart3 },
];

function AdminLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform lg:static lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center justify-between px-5">
          <span className="text-lg font-extrabold">Cardápio Pro</span>
          <button onClick={() => setOpen(false)} className="lg:hidden"><X className="h-5 w-5" /></button>
        </div>
        <nav className="space-y-1 px-3">
          {NAV.map((n) => {
            const active = n.exact ? path === n.to : path.startsWith(n.to);
            return (
              <Link key={n.to} to={n.to as any} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "hover:bg-sidebar-accent"}`}>
                <n.icon className="h-4 w-4" /> {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute inset-x-0 bottom-0 space-y-1 border-t border-sidebar-border p-3">
          <a href="/" target="_blank" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-sidebar-accent"><ExternalLink className="h-4 w-4" /> Ver cardápio</a>
          <button onClick={async () => { await signOut(); navigate({ to: "/auth" }); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-sidebar-accent">
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur lg:hidden">
          <button onClick={() => setOpen(true)}><Menu className="h-5 w-5" /></button>
          <span className="font-bold">Cardápio Pro</span>
        </header>
        <main className="flex-1 p-4 lg:p-8"><Outlet /></main>
      </div>
    </div>
  );
}