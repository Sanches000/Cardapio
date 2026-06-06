import { Link } from "@tanstack/react-router";
import { Flame, Sparkles, Star } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { brl } from "@/lib/format";

export function ProductCard({ product }: { product: Tables<"products"> }) {
  return (
    <Link
      to="/produto/$id"
      params={{ id: product.id }}
      className="group flex gap-3 rounded-2xl border border-border bg-card p-3 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-elegant)]"
    >
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted sm:h-28 sm:w-28">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl">🍽️</div>
        )}
        {!product.available && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs font-bold text-white">
            Indisponível
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-1">
          {product.featured && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
              <Star className="h-2.5 w-2.5" /> Destaque
            </span>
          )}
          {product.bestseller && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-destructive/10 px-1.5 py-0.5 text-[10px] font-bold text-destructive">
              <Flame className="h-2.5 w-2.5" /> Mais vendido
            </span>
          )}
          {product.is_new && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-success/15 px-1.5 py-0.5 text-[10px] font-bold text-success">
              <Sparkles className="h-2.5 w-2.5" /> Novo
            </span>
          )}
        </div>
        <h3 className="mt-1 line-clamp-1 font-bold text-foreground">{product.name}</h3>
        <p className="line-clamp-2 text-xs text-muted-foreground sm:text-sm">{product.short_description}</p>
        <div className="mt-auto pt-2 text-base font-extrabold text-primary">{brl(Number(product.price))}</div>
      </div>
    </Link>
  );
}