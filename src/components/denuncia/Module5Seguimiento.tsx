import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Bell, CheckCircle2, Clock, FileWarning, Loader2, MessageSquare } from "lucide-react";
import { useDenuncia, type EstadoStatus } from "@/lib/denuncia-store";
import { toast } from "sonner";

const colorOf = (s: EstadoStatus) => {
  switch (s) {
    case "completado": return "bg-success text-success-foreground border-success";
    case "en_proceso": return "bg-police-green text-white border-police-green";
    case "pendiente": return "bg-warning text-warning-foreground border-warning";
    case "archivado": return "bg-muted text-muted-foreground border-border";
  }
};
const labelOf = (s: EstadoStatus) => ({ completado: "Completado", en_proceso: "En proceso", pendiente: "Pendiente", archivado: "Archivado" }[s]);

export function Module5Seguimiento() {
  const { denuncia, archivar, addMensaje } = useDenuncia();

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        {denuncia.archivado && (
          <Card className="border-destructive bg-destructive/5">
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-destructive" />
                <div>
                  <p className="font-semibold text-destructive">Caso archivado provisionalmente</p>
                  <p className="text-sm text-muted-foreground">Tiene <b>{denuncia.diasParaApelar} días</b> hábiles para presentar observaciones.</p>
                </div>
              </div>
              <Button variant="destructive" onClick={() => { toast.success("Escrito de subsanación generado"); addMensaje({ autor: "ciudadano", texto: "He generado un escrito de subsanación." }); }}>
                <FileWarning className="mr-2 h-4 w-4" /> Generar escrito automático
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <Badge className="w-fit bg-primary-soft text-primary-deep hover:bg-primary-soft">Módulo 5</Badge>
            <CardTitle className="text-xl text-primary-deep">Seguimiento de su caso</CardTitle>
            <p className="text-sm text-muted-foreground">Expediente N° <b>{denuncia.expediente}</b> · Información en tiempo real</p>
          </CardHeader>
          <CardContent>
            <ol className="relative ml-3 border-l-2 border-dashed border-border">
              {denuncia.timeline.map((t) => (
                <li key={t.key} className="ml-6 pb-6 last:pb-0">
                  <span className={`absolute -left-[11px] grid h-5 w-5 place-items-center rounded-full border-2 ${colorOf(t.status)}`}>
                    {t.status === "completado" ? <CheckCircle2 className="h-3 w-3" /> : t.status === "en_proceso" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Clock className="h-3 w-3" />}
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-semibold text-primary-deep">{t.label}</h4>
                    <Badge variant="outline" className={colorOf(t.status)}>{labelOf(t.status)}</Badge>
                    {t.fecha && <span className="text-xs text-muted-foreground">· {t.fecha}</span>}
                  </div>
                  {t.detalle && <p className="mt-1 text-sm text-muted-foreground">{t.detalle}</p>}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><Bell className="h-4 w-4 text-primary" /> Notificaciones</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {denuncia.mensajes.slice(-5).reverse().map((m) => (
              <div key={m.id} className="rounded-md border bg-secondary/40 p-2 text-sm">
                <div className="mb-0.5 flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] uppercase">{m.autor}</Badge>
                  <span className="text-xs text-muted-foreground">{m.fecha}</span>
                </div>
                <p>{m.texto}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Requerimientos</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="rounded-md border border-primary/30 bg-primary-soft p-3">
              <p className="font-medium text-primary-deep">Caso derivable a Fiscalía</p>
              <p className="text-xs text-muted-foreground">Se le notificará el número fiscal asignado.</p>
            </div>
            <Button variant="outline" className="w-full" onClick={() => archivar()}>
              <AlertTriangle className="mr-2 h-4 w-4" /> Simular archivamiento
            </Button>
            <p className="text-[11px] text-muted-foreground">(Desde la vista de Operador puede cambiar todos los estados del timeline.)</p>
          </CardContent>
        </Card>

        <Card className="border-police-green/30 bg-police-green-soft">
          <CardContent className="flex items-center gap-3 p-4">
            <MessageSquare className="h-5 w-5 text-police-green" />
            <p className="text-sm">Usted está <b>informado siempre</b>. Use el módulo de soporte para consultas.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}