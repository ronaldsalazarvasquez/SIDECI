import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  FileWarning,
  Loader2,
  MessageSquare,
  Search,
  ArrowLeft,
  MapPin,
  Calendar,
  ShieldAlert,
  ArrowRight,
  ClipboardList
} from "lucide-react";
import { useDenuncia, type EstadoStatus, type Denuncia } from "@/lib/denuncia-store";
import { toast } from "sonner";

const colorOf = (s: EstadoStatus) => {
  switch (s) {
    case "completado": return "bg-success text-success-foreground border-success";
    case "en_proceso": return "bg-police-green text-white border-police-green animate-pulse";
    case "pendiente": return "bg-warning text-warning-foreground border-warning";
    case "archivado": return "bg-muted text-muted-foreground border-border";
  }
};

const labelOf = (s: EstadoStatus) => ({
  completado: "Completado",
  en_proceso: "En proceso",
  pendiente: "Pendiente",
  archivado: "Archivado"
}[s]);

export function Module5Seguimiento() {
  const { denuncias, archivar, addMensaje } = useDenuncia();
  const [selectedExpedienteId, setSelectedExpedienteId] = useState<string | null>(null);

  // Customize seed cases for high-fidelity demonstration
  const customizedDenuncias = useMemo(() => {
    return denuncias.map((d) => {
      if (d.id === "d-2026-001244") {
        return {
          ...d,
          relatoEstructurado: "El día 10/06/2026, el denunciante estacionó su camioneta Toyota Hilux en la Av. Brasil cdra 15, percatándose minutos después de que delincuentes violentaron la chapa de la puerta del conductor y sustrajeron la radio y accesorios de valor.",
          timeline: d.timeline.map(t => {
            if (t.key === "registro") return { ...t, status: "completado" as const, fecha: "10/06 14:00", detalle: "Recibido digitalmente." };
            if (t.key === "validacion") return { ...t, status: "completado" as const, fecha: "10/06 14:15", detalle: "Datos de placa y propietario verificados en SUNARP." };
            if (t.key === "asignacion") return { ...t, status: "completado" as const, fecha: "10/06 15:30", detalle: "Asignado al Mayor PNP Torres - Comisaría Jesús María." };
            if (t.key === "revision") return { ...t, status: "en_proceso" as const, fecha: "Hoy 09:00", detalle: "Enviando solicitud de cámaras de seguridad a la Municipalidad." };
            return { ...t, status: "pendiente" as const };
          }),
          mensajes: [
            { id: "m1", autor: "sistema" as const, texto: "Denuncia de vehículo registrada.", fecha: "10/06 14:00" },
            { id: "m2", autor: "pnp" as const, texto: "Se ha asignado el Mayor PNP Carlos Torres para la investigación. Se solicitó peritaje.", fecha: "10/06 15:45" },
            { id: "m3", autor: "pnp" as const, texto: "Por favor, acérquese a la comisaría para firmar el acta si cuenta con fotos físicas.", fecha: "Hoy 09:15" }
          ]
        };
      }
      if (d.id === "d-2026-001243") {
        return {
          ...d,
          relatoEstructurado: "El día 08/06/2026 en el cruce de Av. Larco con Tarata, Miraflores, el denunciante fue víctima del arrebato de su laptop marca Asus por parte de un sujeto en una motocicleta lineal de color negro.",
          timeline: d.timeline.map(t => {
            if (t.key === "registro") return { ...t, status: "completado" as const, fecha: "08/06 18:30", detalle: "Recibido." };
            if (t.key === "validacion") return { ...t, status: "completado" as const, fecha: "08/06 18:45", detalle: "DNI y datos validados." };
            if (t.key === "asignacion") return { ...t, status: "completado" as const, fecha: "08/06 19:10", detalle: "Derivado a la DEPINCRI Miraflores." };
            if (t.key === "revision") return { ...t, status: "completado" as const, fecha: "09/06 10:00", detalle: "Fiscalía informada del inicio de diligencias preliminares." };
            if (t.key === "investigacion") return { ...t, status: "en_proceso" as const, fecha: "Hoy 10:30", detalle: "Visualizando grabaciones de cámaras del serenazgo." };
            return { ...t, status: "pendiente" as const };
          }),
          mensajes: [
            { id: "m1", autor: "sistema" as const, texto: "Denuncia ingresada formalmente.", fecha: "08/06 18:30" },
            { id: "m2", autor: "pnp" as const, texto: "Caso derivado a DEPINCRI para análisis de cámaras en Av. Larco.", fecha: "09/06 11:20" },
            { id: "m3", autor: "legal" as const, texto: "Fiscalía Penal de Miraflores asumió conducción jurídica del caso.", fecha: "Hoy 10:45" }
          ]
        };
      }
      return d; // Active case remains as is
    });
  }, [denuncias]);

  // Find the selected case
  const activeCase = customizedDenuncias.find(d => d.id === selectedExpedienteId) || customizedDenuncias[0];

  // Helper to get active step label
  const getActiveStepLabel = (d: Denuncia) => {
    const activeStep = [...d.timeline].reverse().find(t => t.status === "completado" || t.status === "en_proceso");
    return activeStep ? activeStep.label : "Pendiente";
  };

  const getGeneralStatusType = (d: Denuncia): EstadoStatus => {
    if (d.archivado) return "archivado";
    const activeStep = [...d.timeline].reverse().find(t => t.status === "completado" || t.status === "en_proceso");
    return activeStep ? activeStep.status : "pendiente";
  };

  return (
    <div className="space-y-6">
      {selectedExpedienteId === null ? (
        /* VISTA MAESTRO: LISTADO DE EXPEDIENTES */
        <Card className="border-border bg-white shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge className="bg-primary-soft text-primary-deep hover:bg-primary-soft">Bandeja Ciudadana</Badge>
              <span className="text-xs text-muted-foreground">Consulta de Casos</span>
            </div>
            <CardTitle className="text-2xl text-primary-deep flex items-center gap-2">
              <ClipboardList className="h-6 w-6 text-primary" />
              Tus Expedientes Policiales
            </CardTitle>
            <CardDescription>
              Haga clic en cualquiera de las denuncias registradas para realizar el seguimiento, ver el estado actual del trámite y notificaciones fiscales.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {customizedDenuncias.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No tiene expedientes de denuncias registrados en este momento.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {customizedDenuncias.map((item) => {
                  const statusType = getGeneralStatusType(item);
                  const activeStepLabel = getActiveStepLabel(item);
                  return (
                    <Card 
                      key={item.id}
                      onClick={() => setSelectedExpedienteId(item.id)}
                      className="border-slate-200 hover:border-primary hover:shadow-md transition-all cursor-pointer bg-white group flex flex-col justify-between"
                    >
                      <div className="p-4 space-y-3">
                        {/* Header Row */}
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Exp. N° {item.expediente}
                          </span>
                          <Badge className={colorOf(statusType)}>
                            {item.archivado ? "Archivado" : activeStepLabel}
                          </Badge>
                        </div>

                        {/* Title */}
                        <div>
                          <h4 className="font-bold text-base text-primary-deep group-hover:text-primary transition-colors leading-snug line-clamp-1">
                            {item.tipo || "Denuncia General"}
                          </h4>
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {item.relatoEstructurado || "Procesando acta estructurada..."}
                          </p>
                        </div>

                        {/* Details Grid */}
                        <div className="space-y-1 pt-2 border-t text-[11px] text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span>{item.fechaHecho || "Pendiente"}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{item.ubicacion?.direccion || "No especificada"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Footer Action */}
                      <div className="bg-slate-50 px-4 py-2 border-t flex items-center justify-between text-xs font-semibold text-primary group-hover:bg-primary-soft/20 transition-all rounded-b-xl">
                        <span>Ver Trazabilidad</span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        /* VISTA DETALLE: TIMELINE Y DETALLES */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedExpedienteId(null)}
              className="flex items-center gap-2 border-slate-200 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a la Lista de Expedientes
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Column 1 & 2: Timeline Details */}
            <div className="space-y-6 lg:col-span-2">
              {activeCase.archivado && (
                <Card className="border-destructive bg-destructive/5">
                  <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-destructive" />
                      <div>
                        <p className="font-semibold text-destructive">Caso archivado provisionalmente</p>
                        <p className="text-sm text-muted-foreground">Tiene <b>{activeCase.diasParaApelar} días</b> hábiles para presentar observaciones.</p>
                      </div>
                    </div>
                    <Button variant="destructive" onClick={() => { toast.success("Escrito de subsanación generado"); addMensaje({ autor: "ciudadano", texto: "He generado un escrito de subsanación." }); }}>
                      <FileWarning className="mr-2 h-4 w-4" /> Generar escrito automático
                    </Button>
                  </CardContent>
                </Card>
              )}

              <Card className="border-border bg-white shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-primary-soft text-primary-deep hover:bg-primary-soft">Expediente Oficial</Badge>
                    <span className="text-xs text-muted-foreground font-mono">Exp. ID: {activeCase.id}</span>
                  </div>
                  <CardTitle className="text-2xl text-primary-deep mt-1">{activeCase.tipo || "Denuncia General"}</CardTitle>
                  <p className="text-xs text-muted-foreground">Expediente N° <b>{activeCase.expediente}</b> · Línea de Trazabilidad Policial</p>
                </CardHeader>
                <CardContent>
                  <ol className="relative ml-3 border-l-2 border-dashed border-border space-y-6">
                    {activeCase.timeline.map((t) => (
                      <li key={t.key} className="ml-6 relative">
                        <span className={`absolute -left-[35px] top-0.5 grid h-6 w-6 place-items-center rounded-full border-2 ${colorOf(t.status)}`}>
                          {t.status === "completado" ? <CheckCircle2 className="h-3.5 w-3.5 text-white bg-success rounded-full" /> : t.status === "en_proceso" ? <Loader2 className="h-3.5 w-3.5 text-white animate-spin bg-police-green rounded-full p-0.5" /> : <Clock className="h-3.5 w-3.5 text-slate-400" />}
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-sm text-primary-deep">{t.label}</h4>
                          <Badge variant="outline" className={`text-[9px] px-1.5 py-0.5 font-semibold ${colorOf(t.status)}`}>
                            {labelOf(t.status)}
                          </Badge>
                          {t.fecha && <span className="text-xs text-muted-foreground font-semibold">· {t.fecha}</span>}
                        </div>
                        {t.detalle && <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{t.detalle}</p>}
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>

              {/* Case Relato Preview */}
              <Card className="border-slate-200 bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold text-primary-deep flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4 text-primary" />
                    Hechos Declarados (Resumen Policial)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-slate-600 leading-relaxed italic bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                    "{activeCase.relatoEstructurado || "El acta se encuentra en validación por el oficial virtual."}"
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Column 3: Notifications & Details */}
            <div className="space-y-4">
              <Card className="border-slate-200 bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm text-primary-deep">
                    <Bell className="h-4 w-4 text-primary" /> Notificaciones del Caso
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {activeCase.mensajes.slice(-5).reverse().map((m) => (
                    <div key={m.id} className="rounded-lg border bg-slate-50 p-2.5 text-xs">
                      <div className="mb-1 flex items-center justify-between">
                        <Badge variant="outline" className="text-[8px] uppercase tracking-wide px-1.5">
                          {m.autor}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground font-medium">{m.fecha}</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{m.texto}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold text-primary-deep">Garantías Fiscales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="rounded-lg border border-primary/20 bg-primary-soft/30 p-3 leading-relaxed">
                    <p className="font-bold text-primary-deep">Fiscalía Informada</p>
                    <p className="text-muted-foreground mt-0.5">
                      Este expediente cuenta con firma y código de trazabilidad único enlazado al SIDPOL, garantizando transparencia inmediata.
                    </p>
                  </div>
                  <Button variant="outline" className="w-full text-xs" onClick={() => archivar()}>
                    <AlertTriangle className="mr-1.5 h-3.5 w-3.5" /> Simular Archivamiento
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-police-green/30 bg-police-green-soft/40">
                <CardContent className="flex items-center gap-2.5 p-3.5">
                  <MessageSquare className="h-5 w-5 text-police-green shrink-0" />
                  <p className="text-xs text-slate-700">
                    Manténgase al tanto. Utilice el canal de <b>Soporte</b> si requiere contactar con el fiscal asignado.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}