import { Phone, MapPin, Clock, Instagram, Facebook, MessageCircle, ShoppingBag, UtensilsCrossed } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { Tables } from "@/integrations/supabase/types";
import { useCart } from "@/lib/cart";
import heroBanner from "@/assets/hero-banner.jpg";
import { onlyDigits } from "@/lib/format";

type Props = {
  settings: Tables<"settings"> | null;
  open: boolean;
};

export function MenuHeader({ settings, open }: Props) {
  const { count } = useCart();
  const whatsapp = settings?.whatsapp ? onlyDigits(settings.whatsapp) : null;
  const bg = settings?.banner_url || heroBanner;

  return (
    <header className="relative w-full overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={bg}
          alt={settings?.establishment_name ?? "Banner"}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-background" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col px-4 pb-8 pt-6 sm:pb-12 sm:pt-10">
        <div className="flex items-center justify-between">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              open ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"
            }`}
          >
            <span className="size-2 rounded-full bg-current opacity-80" />
            {open ? "Aberto agora" : "Fechado"}
          </span>

          <Link
            to="/carrinho"
            className="relative inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-2 text-sm font-semibold text-foreground shadow-md backdrop-blur transition hover:bg-white"
          >
            <ShoppingBag className="h-4 w-4" />
            Carrinho
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">
                {count}
              </span>
            )}
          </Link>
        </div>

        <div className="mt-16 flex flex-col items-start gap-3 sm:mt-24">
          <div className="flex items-center gap-3">
            {settings?.logo_url ? (
              <img src={settings.logo_url} alt="" className="size-16 rounded-2xl object-cover ring-2 ring-white/40" />
            ) : (
              <div className="flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                <UtensilsCrossed className="h-7 w-7" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white drop-shadow sm:text-3xl">
                {settings?.establishment_name ?? "Cardápio Digital"}
              </h1>
              <p className="flex items-center gap-1 text-sm text-white/85">
                <Clock className="h-3.5 w-3.5" /> {settings?.estimated_delivery_time ?? "30-45 min"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
            {settings?.phone && (
              <a href={`tel:${onlyDigits(settings.phone)}`} className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-white backdrop-blur transition hover:bg-white/25">
                <Phone className="h-3.5 w-3.5" /> {settings.phone}
              </a>
            )}
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-success px-3 py-1.5 font-semibold text-success-foreground shadow transition hover:opacity-90"
              >
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
              </a>
            )}
            {settings?.instagram && (
              <a href={settings.instagram} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-white backdrop-blur transition hover:bg-white/25">
                <Instagram className="h-3.5 w-3.5" /> Instagram
              </a>
            )}
            {settings?.facebook && (
              <a href={settings.facebook} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-white backdrop-blur transition hover:bg-white/25">
                <Facebook className="h-3.5 w-3.5" /> Facebook
              </a>
            )}
            {settings?.address && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-white backdrop-blur">
                <MapPin className="h-3.5 w-3.5" /> {settings.address}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}