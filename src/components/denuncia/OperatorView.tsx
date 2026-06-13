import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDenuncia, type EstadoKey, type EstadoStatus } from "@/lib/denuncia-store";
import { ShieldCheck, Activity, Database, Archive, Eye } from "lucide-react";
import { toast } from "sonner";

const STATUSES: EstadoStatus[] = ["pendiente", "en_proceso", "completado", "archivado"];
const statusBadge = (s: EstadoStatus) =>
  s === "completado" ? "bg-success text-success-foreground" :
  s === "en_proceso" ? "bg-police-green text-white" :
  s === "archivado" ? "bg-muted text-muted-foreground" :
  "bg-warning text-warning-foreground";

export function OperatorView() {
  const { denuncia, denuncias, setEstado, archivar, setRole, setActiveModule, addMensaje } = useDenuncia();

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-police-green text-white"><ShieldCheck className="h-5 w-5" /></div>
          <div>
            <h2 className="text-xl font-bold text-primary-deep">Panel de Operador / Supervisor PNP</h2>
            <p className="text-sm text-muted-foreground">Gestión, auditoría y actualización de estados</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Stat icon={Database} label="Denuncias totales" v={denuncias.length.toString()} />
        <Stat icon={Activity} label="En proceso" v={denuncia.timeline.filter(t => t.status === "en_proceso").length.toString()} />
        <Stat icon={ShieldCheck} label="Completadas" v={denuncia.timeline.filter(t => t.status === "completado").length.toString()} />
        <Stat icon={Archive} label="Archivadas" v={denuncia.archivado ? "1" : "0"} />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Bandeja de denuncias</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Expediente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Evidencias</TableHead>
                <TableHead>Estado actual</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {denuncias.map((d) => {
                const completados = d.timeline.filter(t => t.status === "completado");
                const current = d.timeline.find(t => t.status === "en_proceso") ?? completados[completados.length - 1] ?? d.timeline[0];
                return (
                  <TableRow key={d.id}>
                    <TableCell className="font-mono text-primary-deep">{d.expediente}</TableCell>
                    <TableCell>{d.tipo}</TableCell>
                    <TableCell className="max-w-[14rem] truncate text-muted-foreground">{d.ubicacion.direccion}</TableCell>
                    <TableCell>{d.evidencias.length}</TableCell>
                    <TableCell><Badge className={statusBadge(current.status)}>{current.label}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => { setRole("ciudadano"); setActiveModule("seguimiento"); }}>
                        <Eye className="mr-1 h-4 w-4" /> Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Editor de estados — Expediente {denuncia.expediente}</CardTitle>
          <p className="text-xs text-muted-foreground">Cambie estados para ver cómo reacciona la vista del ciudadano (Módulo 5).</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {denuncia.timeline.map((t) => (
            <div key={t.key} className="grid grid-cols-1 items-center gap-3 rounded-md border p-3 sm:grid-cols-[1fr_200px_auto]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-primary-deep">{t.label}</span>
                  <Badge className={statusBadge(t.status)}>{t.status}</Badge>
                </div>
                {t.detalle && <p className="text-xs text-muted-foreground">{t.detalle}</p>}
              </div>
              <Select value={t.status} onValueChange={(v) => { setEstado(t.key as EstadoKey, v as EstadoStatus); toast.success(`${t.label} → ${v}`); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button variant="ghost" size="sm" onClick={() => { addMensaje({ autor: "pnp", texto: `Actualización en "${t.label}".` }); toast.success("Notificación enviada al ciudadano"); }}>
                Notificar
              </Button>
            </div>
          ))}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button variant="destructive" onClick={() => { archivar(); toast("Caso archivado", { description: "Banner de apelación activado en vista ciudadana." }); }}>
              <Archive className="mr-2 h-4 w-4" /> Archivar provisionalmente
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Modelo de datos modular (auditoría)</CardTitle></CardHeader>
        <CardContent className="grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
          {[
            { t: "denuncias", n: denuncias.length, c: "Expediente, tipo, ubicación, fecha" },
            { t: "evidencias", n: denuncia.evidencias.length, c: "Foto / video / audio / documento" },
            { t: "estados", n: denuncia.timeline.length, c: "Timeline de seguimiento" },
            { t: "mensajes", n: denuncia.mensajes.length, c: "Bitácora de comunicaciones" },
          ].map((x) => (
            <div key={x.t} className="rounded-lg border bg-secondary/40 p-3">
              <div className="flex items-center justify-between">
                <span className="font-mono font-semibold text-primary-deep">{x.t}</span>
                <Badge variant="outline">{x.n}</Badge>
              </div>
              <p className="mt-1 text-muted-foreground">{x.c}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}

function Stat({ icon: Icon, label, v }: { icon: React.ComponentType<{ className?: string }>; label: string; v: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary-soft text-primary"><Icon className="h-5 w-5" /></div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold text-primary-deep">{v}</p>
        </div>
      </CardContent>
    </Card>
  );
}