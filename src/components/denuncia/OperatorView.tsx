import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDenuncia, type EstadoKey, type EstadoStatus } from "@/lib/denuncia-store";
import { ShieldCheck, Activity, Database, Archive, Eye, Sparkles, Landmark, Scale, Send } from "lucide-react";
import { toast } from "sonner";

const STATUSES: EstadoStatus[] = ["pendiente", "en_proceso", "completado", "archivado"];
const statusBadge = (s: EstadoStatus) =>
  s === "completado" ? "bg-success text-success-foreground" :
  s === "en_proceso" ? "bg-police-green text-white" :
  s === "archivado" ? "bg-muted text-muted-foreground" :
  "bg-warning text-warning-foreground";

export function OperatorView() {
  const { denuncia, denuncias, setEstado, archivar, setRole, setActiveModule, addMensaje, role } = useDenuncia();
  const isFiscal = role === "fiscal";

  const handleDeriveToCourt = () => {
    setEstado("resultado", "completado", "Caso judicializado y derivado al Juzgado Penal de Turno de Lima.");
    addMensaje({
      autor: "legal",
      texto: "El Ministerio Público ha concluido la calificación penal del caso y procedió a formular denuncia fiscal ante el Juzgado Penal de Turno de Lima."
    });
    toast.success("Denuncia derivada con éxito al Juzgado Penal de Turno.");
  };

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      {/* Dynamic Header based on Role */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`grid h-10 w-10 place-items-center rounded-lg text-white ${isFiscal ? "bg-indigo-600" : "bg-police-green"}`}>
            {isFiscal ? <Landmark className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
          </div>
          <div>
            <h2 className="text-xl font-bold text-primary-deep">
              {isFiscal ? "Panel de Calificación y Control Fiscal" : "Panel de Operador / Supervisor PNP"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isFiscal 
                ? "Ministerio Público · Fiscalía de la Nación del Perú" 
                : "Gestión, auditoría y actualización de estados de SIDECI"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Stat icon={Database} label={isFiscal ? "Expedientes en Fiscalía" : "Denuncias totales"} v={denuncias.length.toString()} />
        <Stat icon={Activity} label="En investigación" v={denuncia.timeline.filter(t => t.status === "en_proceso").length.toString()} />
        <Stat icon={isFiscal ? "Calificados" : "Completadas"} iconComponent={isFiscal ? Landmark : undefined} v={denuncia.timeline.filter(t => t.status === "completado").length.toString()} />
        <Stat icon={Archive} label="Casos Archivados" v={denuncia.archivado ? "1" : "0"} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {isFiscal ? "Bandeja de Calificación Fiscal (Ingresos SIDECI)" : "Bandeja de denuncias policiales"}
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Expediente</TableHead>
                <TableHead>Tipo de Delito</TableHead>
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
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => { 
                          setRole(isFiscal ? "fiscal" : "ciudadano"); 
                          setActiveModule("seguimiento"); 
                        }}
                      >
                        <Eye className="mr-1 h-4 w-4" /> Inspeccionar
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">
              {isFiscal ? "Control de Providencias y Medidas Fiscales" : "Editor de estados de SIDECI — Expediente " + denuncia.expediente}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {isFiscal 
                ? "Califique la denuncia, formule el dictamen penal y actualice los hitos del proceso fiscal."
                : "Cambie estados para ver cómo reacciona la vista del ciudadano (Módulo 5)."}
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {denuncia.timeline.map((t) => (
              <div key={t.key} className="grid grid-cols-1 items-center gap-3 rounded-md border p-3 sm:grid-cols-[1fr_180px_auto]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-primary-deep text-sm">{t.label}</span>
                    <Badge className={statusBadge(t.status)}>{t.status}</Badge>
                  </div>
                  {t.detalle && <p className="text-[11px] text-muted-foreground">{t.detalle}</p>}
                </div>
                <Select value={t.status} onValueChange={(v) => { setEstado(t.key as EstadoKey, v as EstadoStatus); toast.success(`${t.label} → ${v}`); }}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 text-xs hover:bg-slate-100" 
                  onClick={() => { 
                    addMensaje({ 
                      autor: isFiscal ? "legal" : "pnp", 
                      texto: isFiscal 
                        ? `Dictamen fiscal actualizado para el hito "${t.label}".`
                        : `Notificación del oficial instructor sobre hito "${t.label}".` 
                    }); 
                    toast.success("Notificación judicial enviada al ciudadano"); 
                  }}
                >
                  Notificar
                </Button>
              </div>
            ))}
            
            {/* Fiscal or Police Action Buttons */}
            <div className="flex flex-wrap gap-2 pt-3 border-t">
              {isFiscal ? (
                <>
                  <Button 
                    onClick={handleDeriveToCourt}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
                    size="sm"
                  >
                    <Scale className="mr-2 h-4 w-4" /> Formular Denuncia Fiscal / Derivar a Juzgado
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="text-xs font-semibold"
                    onClick={() => { 
                      archivar(); 
                      toast.warning("Caso archivado provisionalmente por falta de elementos de juicio."); 
                    }}
                  >
                    <Archive className="mr-2 h-4 w-4" /> Archivar Caso (Provisional)
                  </Button>
                </>
              ) : (
                <Button variant="destructive" size="sm" onClick={() => { archivar(); toast("Caso archivado", { description: "Banner de apelación activado en vista ciudadana." }); }}>
                  <Archive className="mr-2 h-4 w-4" /> Archivar provisionalmente
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Conversation Logs */}
        <Card className="flex flex-col h-[520px]">
          <CardHeader className="py-4 border-b shrink-0">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className={`h-4.5 w-4.5 ${isFiscal ? "text-indigo-600" : "text-police-green"}`} /> 
              Historial de Conversación Ciudadano - IA (Evidencia)
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {isFiscal 
                ? "Transcripción oficial del interrogatorio de voz digital para auditoría jurídica."
                : "Registro de audio transcrito y respuestas del asistente IA."}
            </p>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
            {denuncia.narradorChat && denuncia.narradorChat.length > 0 ? (
              denuncia.narradorChat.map((m, i) => (
                <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <span className="text-[9px] uppercase font-bold text-muted-foreground mb-0.5">
                    {m.role === 'user' ? 'Ciudadano' : 'Asistente IA'}
                  </span>
                  <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs shadow-sm leading-relaxed ${
                    m.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-white border text-foreground rounded-tl-none'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex h-full items-center justify-center text-center text-xs text-muted-foreground italic">
                No hay historial de conversación por voz registrado para este expediente.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Modelo de datos modular (auditoría)</CardTitle></CardHeader>
        <CardContent className="grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
          {[
            { t: "denuncias", n: denuncias.length, c: "Expediente, tipo, ubicación, fecha" },
            { t: "evidencias", n: denuncia.evidencias.length, c: "Foto / video / audio / documento" },
            { t: "estados", n: denuncia.timeline.length, c: "Timeline de seguimiento" },
            { t: "mensajes", n: denuncia.mensajes.length, c: "Bitácora de comunicaciones MP/PNP" },
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

// Adjusted Stat Component
function Stat({ icon: Icon, iconComponent: IconComp, label, v }: { icon: React.ComponentType<{ className?: string }>; iconComponent?: React.ComponentType<{ className?: string }>; label: string; v: string }) {
  const RenderIcon = IconComp || Icon;
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary-soft text-primary">
          <RenderIcon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold text-primary-deep">{v}</p>
        </div>
      </CardContent>
    </Card>
  );
}