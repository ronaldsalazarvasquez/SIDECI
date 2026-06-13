import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Download, Share2, FileText, ArrowRight } from "lucide-react";
import { useDenuncia } from "@/lib/denuncia-store";
import { toast } from "sonner";

function QrSvg({ value }: { value: string }) {
  const size = 21;
  const cells: boolean[] = [];
  let h = 0;
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) >>> 0;
  for (let i = 0; i < size * size; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    cells.push((h & 7) > 3);
  }
  const isCorner = (x: number, y: number) =>
    (x < 7 && y < 7) || (x >= size - 7 && y < 7) || (x < 7 && y >= size - 7);
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="h-40 w-40 rounded-md border bg-white p-2">
      {Array.from({ length: size }).map((_, y) =>
        Array.from({ length: size }).map((__, x) => {
          if (isCorner(x, y)) {
            const lx = x < 7 ? x : x - (size - 7);
            const ly = y < 7 ? y : y - (size - 7);
            const on = lx === 0 || lx === 6 || ly === 0 || ly === 6 || (lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4);
            return on ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="#0b1f4a" /> : null;
          }
          return cells[y * size + x] ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="#0b1f4a" /> : null;
        }),
      )}
    </svg>
  );
}

export function Module4Confirmacion() {
  const { denuncia, setActiveModule } = useDenuncia();

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-police-green/40">
        <div className="bg-gradient-to-r from-police-green to-primary-deep px-6 py-8 text-white">
          <div className="flex flex-col items-center text-center">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-white/20 ring-8 ring-white/10">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <h2 className="mt-4 text-2xl font-bold">¡Denuncia registrada con éxito!</h2>
            <p className="mt-1 text-sm text-white/90">Evidencia inmediata para el ciudadano · Validez legal SIDPOL</p>
          </div>
        </div>
        <CardContent className="grid gap-6 p-6 md:grid-cols-[1fr_auto]">
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">N° de Expediente</p>
              <p className="font-mono text-3xl font-bold text-primary-deep sm:text-4xl">N° {denuncia.expediente}</p>
            </div>

            <Card className="border-primary/20 bg-primary-soft/30">
              <CardContent className="space-y-2 p-4 text-sm">
                <div className="mb-2 flex items-center gap-2 font-semibold text-primary-deep">
                  <FileText className="h-4 w-4" /> Ficha técnica
                </div>
                <Field k="Tipo" v={denuncia.tipo} />
                <Field k="Denunciante (DNI)" v={denuncia.dni} />
                <Field k="Lugar" v={denuncia.ubicacion.direccion} />
                <Field k="Fecha del hecho" v={denuncia.fechaHecho} />
                <Field k="Evidencias" v={`${denuncia.evidencias.length} archivos`} />
                <Field k="Agravantes detectados" v={denuncia.agravantes.join(", ") || "—"} />
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-2">
              <Button onClick={() => toast.success("PDF generado (simulado) — listo para SIDPOL")}>
                <Download className="mr-2 h-4 w-4" /> Descargar PDF
              </Button>
              <Button variant="outline" onClick={() => toast.success("Enlace copiado al portapapeles")}>
                <Share2 className="mr-2 h-4 w-4" /> Compartir
              </Button>
              <Button variant="ghost" onClick={() => setActiveModule("seguimiento")}>
                Ver seguimiento <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <QrSvg value={denuncia.expediente} />
            <Badge variant="outline" className="border-police-green text-police-green">Código QR del expediente</Badge>
            <p className="max-w-[10rem] text-center text-xs text-muted-foreground">Escanee para validar el documento.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-primary/10 py-1.5 last:border-0">
      <span className="text-muted-foreground">{k}</span>
      <span className="text-right font-medium">{v}</span>
    </div>
  );
}