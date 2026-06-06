import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/qrcode")({ component: QRPage });

function QRPage() {
  const ref = useRef<HTMLDivElement>(null);
  const url = typeof window !== "undefined" ? window.location.origin : "";
  const download = () => {
    const canvas = ref.current?.querySelector("canvas") as HTMLCanvasElement | null;
    if (!canvas) return;
    const a = document.createElement("a"); a.href = canvas.toDataURL("image/png"); a.download = "cardapio-qrcode.png"; a.click();
  };
  return (
    <div className="max-w-md space-y-4">
      <h1 className="text-2xl font-extrabold">QR Code do cardápio</h1>
      <p className="text-sm text-muted-foreground">Aponte para: {url}</p>
      <div ref={ref} className="flex justify-center rounded-2xl border bg-card p-6"><QRCodeCanvas value={url} size={256} /></div>
      <Button onClick={download} className="w-full"><Download className="mr-2 h-4 w-4" />Baixar PNG</Button>
    </div>
  );
}