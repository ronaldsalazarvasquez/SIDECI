import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  ClipboardList,
  Printer,
  Paperclip,
  Landmark,
  Copy,
  Eye,
  FileText
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

const getComisaria = (direccion: string) => {
  const dir = direccion.toLowerCase();
  if (dir.includes("lince")) return "Comisaría Lince";
  if (dir.includes("jesús maría") || dir.includes("jesus maria")) return "Comisaría Jesús María";
  if (dir.includes("san isidro")) return "Comisaría San Isidro";
  if (dir.includes("arequipa")) return "Comisaría de Arequipa";
  if (dir.includes("cusco")) return "Comisaría Cusco Centro";
  if (dir.includes("trujillo") || dir.includes("libertad")) return "Comisaría de Ayacucho (Trujillo)";
  return "Comisaría Metropolitana";
};

export function Module5Seguimiento() {
  const { denuncias, denuncia, archivar, addMensaje } = useDenuncia();
  const [selectedExpedienteId, setSelectedExpedienteId] = useState<string | null>(denuncia?.id || null);
  const [activeTab, setActiveTab] = useState<"trazabilidad" | "acta">("trazabilidad");

  // Sync selected case when global active case changes
  useEffect(() => {
    if (denuncia?.id) {
      setSelectedExpedienteId(denuncia.id);
      setActiveTab("trazabilidad"); // Reset tab to timeline view when switching case
    }
  }, [denuncia?.id]);

  // Customize seed cases for high-fidelity demonstration
  const customizedDenuncias = useMemo(() => {
    return denuncias.map((d) => {
      if (d.id === "d-2026-001244") {
        return {
          ...d,
          relatoEstructurado: "El día 10/06/2026, el denunciante estacionó su camioneta Toyota Hilux en la Av. Brasil cdra 15, percatándose minutos después de que delincuentes violentaron la chapa de la puerta del conductor y sustrajeron la radio y accesorios de valor.",
          timeline: d.archivado
            ? d.timeline
            : d.timeline.map(t => {
                if (t.key === "registro") return { ...t, status: "completado" as const, fecha: "10/06 14:00", detalle: "Recibido digitalmente." };
                if (t.key === "validacion") return { ...t, status: "completado" as const, fecha: "10/06 14:15", detalle: "Datos de placa y propietario verificados en SUNARP." };
                if (t.key === "asignacion") return { ...t, status: "completado" as const, fecha: "10/06 15:30", detalle: "Asignado al Mayor PNP Torres - Comisaría Jesús María." };
                if (t.key === "revision") return { ...t, status: "en_proceso" as const, fecha: "Hoy 09:00", detalle: "Enviando solicitud de cámaras de seguridad a la Municipalidad." };
                return { ...t, status: "pendiente" as const };
              }),
          mensajes: d.archivado ? d.mensajes : [
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
          timeline: d.archivado
            ? d.timeline
            : d.timeline.map(t => {
                if (t.key === "registro") return { ...t, status: "completado" as const, fecha: "08/06 18:30", detalle: "Recibido." };
                if (t.key === "validacion") return { ...t, status: "completado" as const, fecha: "08/06 18:45", detalle: "Datos validados por el Instructor PNP a cargo." };
                if (t.key === "asignacion") return { ...t, status: "completado" as const, fecha: "08/06 19:10", detalle: "Derivado a la DEPINCRI Miraflores." };
                if (t.key === "revision") return { ...t, status: "completado" as const, fecha: "09/06 10:00", detalle: "Fiscalía informada del inicio de diligencias preliminares." };
                if (t.key === "investigacion") return { ...t, status: "en_proceso" as const, fecha: "Hoy 10:30", detalle: "Visualizando grabaciones de cámaras del serenazgo." };
                return { ...t, status: "pendiente" as const };
              }),
          mensajes: d.archivado ? d.mensajes : [
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

  const handlePrint = (elementId: string, title: string) => {
    const printContent = document.getElementById(elementId);
    if (!printContent) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Georgia, serif; padding: 40px; color: #1a202c; font-size: 11px; line-height: 1.6; }
            .bg-slate-50 { background-color: #f7fafc !important; }
            .border { border: 1px solid #cbd5e0; }
            .p-3 { padding: 12px; }
            .rounded { border-radius: 4px; }
            .text-xs { font-size: 11px; }
            .font-sans { font-family: system-ui, -apple-system, sans-serif; }
            .font-mono { font-family: monospace; }
            .font-bold { font-weight: bold; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .uppercase { text-transform: uppercase; }
            .w-full { width: 100%; }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .items-center { align-items: center; }
            .border-b { border-bottom: 1px solid #cbd5e0; }
            .pb-4 { padding-bottom: 16px; }
            .mb-6 { margin-bottom: 24px; }
            .leading-tight { line-height: 1.25; }
            .tracking-wider { letter-spacing: 0.05em; }
            .text-\[8px\] { font-size: 8px; }
            .text-\[9px\] { font-size: 9px; }
            .text-sm { font-size: 13px; }
            .text-primary-deep { color: #1e3f20; }
            .border-double { border-style: double; }
            .border-4 { border-width: 4px; }
            .border-slate-700 { border-color: #4a5568; }
            .underline { text-decoration: underline; }
            .tracking-widest { letter-spacing: 0.1em; }
            .py-1 { padding-top: 4px; padding-bottom: 4px; }
            .w-1/4 { width: 25%; }
            .italic { font-style: italic; }
            .flex-wrap { flex-wrap: wrap; }
            .gap-2 { gap: 8px; }
            .px-2 { padding-left: 8px; padding-right: 8px; }
            .py-0\.5 { padding-top: 2px; padding-bottom: 2px; }
            .text-\[11px\] { font-size: 11px; }
            .grid { display: grid; }
            .grid-cols-2 { grid-template-cols: repeat(2, minmax(0, 1fr)); }
            .gap-3 { gap: 12px; }
            .h-20 { height: 80px; }
            .bg-slate-100 { background-color: #edf2f7; }
            .mb-1 { margin-bottom: 4px; }
            .relative { position: relative; }
            .overflow-hidden { overflow: hidden; }
            .h-16 { height: 64px; }
            .w-16 { width: 64px; }
            .pt-10 { padding-top: 40px; }
            .mt-8 { margin-top: 32px; }
            .grid-cols-3 { grid-template-cols: repeat(3, minmax(0, 1fr)); }
            .border-t { border-top: 1px solid #cbd5e0; }
            .text-police-green { color: #1e3f20 !important; }
            .bg-police-green-soft\/30 { background-color: rgba(30, 63, 32, 0.05) !important; }
            .border-police-green { border-color: #1e3f20; }
            .px-2\.5 { padding-left: 10px; padding-right: 10px; }
            .mb-1 { margin-bottom: 4px; }
            .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
            table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
            td, th { padding: 4px 8px; text-align: left; vertical-align: top; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div style="max-width: 800px; margin: 0 auto; border: double 4px #4a5568; padding: 30px;">
            ${printContent.innerHTML}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const archiveReasonNote = activeCase ? activeCase.timeline.find(t => t.key === "resultado")?.detalle : "";

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
              className="flex items-center gap-2 border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a la Lista de Expedientes
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              {activeCase.archivado && (
                <Card className="border-destructive bg-destructive/5 shadow-sm">
                  <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-destructive animate-bounce" />
                      <div className="space-y-1">
                        <p className="font-extrabold text-destructive">Caso Archivado Provisionalmente</p>
                        <div className="p-2.5 bg-white border border-destructive/20 text-xs rounded text-slate-700 italic">
                          <strong>Motivo de la Disposición Fiscal:</strong> "{archiveReasonNote || "Archivado por falta de elementos suficientes de convicción o presunto autor no identificado."}"
                        </div>
                        <p className="text-[10.5px] text-muted-foreground">
                          Nota: Tiene <b>{activeCase.diasParaApelar} días hábiles</b> para presentar observaciones o adjuntar nuevas pruebas para la reapertura del expediente.
                        </p>
                        <p className="text-[10.5px] text-police-green font-bold">
                          💡 Consejo: Puede visualizar y descargar el Acta Policial Oficial con el sello rojo y la fundamentación fiscal en la pestaña <button className="underline font-black cursor-pointer bg-transparent border-none p-0 inline" onClick={() => setActiveTab("acta")}>Acta Digital Oficial</button> (ubicada a continuación).
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="destructive" 
                      onClick={() => { 
                        toast.success("Escrito de subsanación generado"); 
                        addMensaje({ autor: "ciudadano", texto: "He generado un escrito de subsanación formal para reapertura de caso." }); 
                      }}
                      className="text-xs font-bold shrink-0 self-start sm:self-auto"
                    >
                      <FileWarning className="mr-1.5 h-4 w-4" /> Generar escrito de reapertura
                    </Button>
                  </CardContent>
                </Card>
              )}

              <Card className="border-border bg-white shadow-sm overflow-hidden">
                <CardHeader className="pb-3 border-b bg-slate-50/20">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-primary-soft text-primary-deep hover:bg-primary-soft">Expediente Oficial</Badge>
                    <span className="text-xs text-muted-foreground font-mono">Exp. ID: {activeCase.id}</span>
                  </div>
                  <CardTitle className="text-2xl text-primary-deep mt-1">{activeCase.tipo || "Denuncia General"}</CardTitle>
                  <p className="text-xs text-muted-foreground">Expediente N° <b>{activeCase.expediente}</b></p>
                  
                  {/* Tab Selector */}
                  <div className="flex gap-4 mt-4 border-b pb-0">
                    <button 
                      onClick={() => setActiveTab("trazabilidad")}
                      className={`pb-2 px-1 text-xs font-bold transition-all border-b-2 ${
                        activeTab === "trazabilidad" 
                          ? "border-primary text-primary" 
                          : "border-transparent text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Línea de Trazabilidad
                    </button>
                    <button 
                      onClick={() => setActiveTab("acta")}
                      className={`pb-2 px-1 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                        activeTab === "acta" 
                          ? "border-primary text-primary" 
                          : "border-transparent text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <FileText className="h-3.5 w-3.5" />
                      Acta Digital Oficial
                      {activeCase.archivado && (
                        <span className="bg-red-100 text-red-700 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-sm animate-pulse">
                          Archivado
                        </span>
                      )}
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {activeTab === "trazabilidad" ? (
                    <div className="space-y-6">
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
                            {t.detalle && <p className="mt-1 text-xs text-muted-foreground leading-relaxed bg-slate-50 border p-2 rounded">{t.detalle}</p>}
                          </li>
                        ))}
                      </ol>

                      {/* Case Relato Preview */}
                      <Card className="border-slate-200 bg-white mt-6">
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
                  ) : (
                    <div className="space-y-4">
                      {/* Acta Print/Download Header */}
                      <div className="flex justify-between items-center bg-slate-100 border p-2.5 rounded-lg">
                        <span className="text-[11px] font-bold text-slate-700">Documento Oficial Certificado</span>
                        <Button 
                          size="sm" 
                          onClick={() => handlePrint(`printable-acta-citizen-tab-${activeCase.id}`, `Acta de Denuncia - ${activeCase.expediente}`)} 
                          className="bg-primary text-white hover:bg-primary-deep font-bold text-xs h-8"
                        >
                          <Printer className="mr-1 h-3.5 w-3.5" /> Imprimir / Guardar PDF
                        </Button>
                      </div>

                      {/* A4 Sheet Container */}
                      <div className="w-full overflow-x-auto py-2 bg-slate-100 p-4 rounded-xl flex justify-center">
                        <div 
                          id={`printable-acta-citizen-tab-${activeCase.id}`}
                          className="bg-white border shadow-md p-6 font-serif text-slate-900 text-[10px] leading-relaxed w-full max-w-[720px] min-w-[580px] border-double border-4 border-slate-700 bg-cover bg-center relative text-left"
                          style={{
                            backgroundImage: "linear-gradient(rgba(255,255,255,0.97), rgba(255,255,255,0.97)), url('/public/escudo_peru.png')",
                            backgroundSize: "220px 220px",
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "center 280px"
                          }}
                        >
                          {/* Header */}
                          <div className="flex items-center justify-between border-b pb-3 mb-4">
                            <div className="text-left font-bold uppercase tracking-wider text-[7.5px] leading-tight font-sans">
                              <p>Ministerio del Interior</p>
                              <p>Policía Nacional del Perú</p>
                              <p className="text-slate-800">Región Policial {activeCase.ubicacion?.direccion?.includes("Arequipa") ? "Arequipa" : activeCase.ubicacion?.direccion?.includes("Cusco") ? "Cusco" : activeCase.ubicacion?.direccion?.includes("La Libertad") ? "La Libertad" : "Lima"}</p>
                              <p className="text-slate-500 font-normal lowercase">{getComisaria(activeCase.ubicacion?.direccion || "").toLowerCase()}</p>
                            </div>
                            
                            <div className="flex flex-col items-center">
                              <svg viewBox="0 0 100 100" className="h-8.5 w-8.5 text-slate-700">
                                <path d="M50 5 L85 20 V50 C85 75 50 95 50 95 C50 95 15 75 15 50 V20 L50 5 Z" fill="none" stroke="currentColor" strokeWidth="3" />
                                <path d="M50 15 L75 27 V50 C75 68 50 83 50 83 C50 83 25 68 25 50 V27 L50 15 Z" fill="currentColor" opacity="0.2" />
                                <circle cx="50" cy="50" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M50 35 V65 M35 50 H65" stroke="currentColor" strokeWidth="1.5" />
                              </svg>
                              <span className="text-[6px] font-sans font-bold text-slate-650 mt-0.5">PATRIA - LEY - HONOR</span>
                            </div>
                            
                            <div className="text-right font-mono text-[8.5px] leading-tight">
                              <p className="font-bold">EXPEDIENTE N°:</p>
                              <p className="text-xs font-bold text-police-green">{activeCase.expediente}</p>
                              <p className="text-slate-400 mt-0.5 uppercase">SISTEMA SIDECI</p>
                            </div>
                          </div>

                          {/* Document Title */}
                          <div className="text-center mb-5 relative">
                            {activeCase.archivado && (
                              <div className="absolute top-0 right-2 border-2 border-red-600 text-red-650 font-extrabold uppercase tracking-wider text-[8px] px-2 py-0.5 rounded rotate-[12deg] select-none bg-white shadow-xs z-10">
                                Archivado
                              </div>
                            )}
                            <h2 className="text-xs font-bold underline uppercase tracking-widest font-sans">
                              {activeCase.reniecValidado 
                                ? "CERTIFICADO DE REGISTRO DE DENUNCIA POLICIAL DIGITAL"
                                : "BORRADOR DE REGISTRO DE DENUNCIA POLICIAL DIGITAL"}
                            </h2>
                            <p className="text-[8px] text-slate-600 font-sans mt-0.5">
                              Emitido de conformidad con la Ley N° 32332 - Registro de Denuncias por Delitos contra el Patrimonio
                            </p>
                          </div>

                          {/* Sections */}
                          <div className="space-y-4">
                            
                            {/* Seccion 1 */}
                            <div>
                              <h3 className="font-bold uppercase border-b pb-0.5 mb-1.5 text-[8.5px] font-sans text-slate-800">I. DATOS DE LA EMISIÓN Y REGISTRO</h3>
                              <table className="w-full text-left text-[9px]">
                                <tbody>
                                  <tr>
                                    <td className="w-1/4 font-bold py-0.5">Fecha de Registro:</td>
                                    <td className="py-0.5">{activeCase.fechaHecho ? activeCase.fechaHecho.split(" ")[0] : new Date().toLocaleDateString("es-PE")}</td>
                                    <td className="w-1/4 font-bold py-0.5">Código de Firma:</td>
                                    <td className="py-0.5 font-mono text-police-green font-bold">
                                      {activeCase.firmaDigitalCode || `FIRM-DIG-PNP-${activeCase.expediente}`}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="font-bold py-0.5">Estado del Acta:</td>
                                    <td className="py-0.5">
                                      {activeCase.archivado ? (
                                        <span className="font-bold text-red-600 uppercase">
                                          ARCHIVADO PROVISIONALMENTE
                                        </span>
                                      ) : (
                                        <span className="font-bold text-police-green">
                                          {activeCase.reniecValidado ? "ACTA OFICIAL DIGITAL FIRMADA" : "ACTA EN BORRADOR / PROCESO"}
                                        </span>
                                      )}
                                    </td>
                                    <td className="font-bold py-0.5">Validez Jurídica:</td>
                                    <td className="py-0.5">
                                      {activeCase.reniecValidado ? "Verificación Biométrica ID Perú (RENIEC)" : "Falta validación biométrica"}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>

                            {/* Seccion 2 */}
                            <div>
                              <h3 className="font-bold uppercase border-b pb-0.5 mb-1.5 text-[8.5px] font-sans text-slate-800">II. DATOS DEL DENUNCIANTE</h3>
                              <table className="w-full text-left text-[9px]">
                                <tbody>
                                  <tr>
                                    <td className="w-1/4 font-bold py-0.5">Documento Nacional (DNI):</td>
                                    <td className="py-0.5 font-mono">{activeCase.dni}</td>
                                    <td className="w-1/4 font-bold py-0.5">Nacionalidad:</td>
                                    <td className="py-0.5">Peruana</td>
                                  </tr>
                                  <tr>
                                    <td className="font-bold py-0.5">Condición del Ciudadano:</td>
                                    <td className="py-0.5">Víctima / Denunciante</td>
                                    <td className="font-bold py-0.5">Firma Electrónica ID:</td>
                                    <td className="py-0.5 font-mono text-[8.5px]">{activeCase.reniecValidado ? `ID-PE-${activeCase.dni}-SECURE` : "Firma pendiente"}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>

                            {/* Seccion 3 */}
                            <div>
                              <h3 className="font-bold uppercase border-b pb-0.5 mb-1.5 text-[8.5px] font-sans text-slate-800">III. HECHO DE DELITO CONTRA EL PATRIMONIO</h3>
                              <table className="w-full text-left text-[9px]">
                                <tbody>
                                  <tr>
                                    <td className="w-1/4 font-bold py-0.5">Presunto Delito:</td>
                                    <td className="py-0.5 font-bold text-slate-800 uppercase">
                                      {activeCase.agravantes && activeCase.agravantes.length > 0 ? "Robo Agravado" : "Hurto Simple"}
                                    </td>
                                    <td className="w-1/4 font-bold py-0.5">Calificación Legal:</td>
                                    <td className="py-0.5">
                                      {activeCase.agravantes && activeCase.agravantes.length > 0 ? "Artículo 189 del Código Penal" : "Artículo 185 del Código Penal"}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="font-bold py-0.5">Bien Afectado:</td>
                                    <td className="py-0.5 capitalize">{activeCase.tipo}</td>
                                    <td className="font-bold py-0.5">Identificador Técnico:</td>
                                    <td className="py-0.5 font-mono">
                                      {activeCase.tipo === "celular" ? `IMEI: ${activeCase.imei || "—"}` : activeCase.tipo === "vehiculo" ? `Placa: ${activeCase.placa || "—"}` : "No Aplica"}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="font-bold py-0.5">Dirección del Suceso:</td>
                                    <td className="py-0.5" colSpan={3}>{activeCase.ubicacion?.direccion || "—"}</td>
                                  </tr>
                                  <tr>
                                    <td className="font-bold py-0.5">Fecha y Hora Declarada:</td>
                                    <td className="py-0.5" colSpan={3}>{activeCase.fechaHecho || "—"}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>

                            {/* Seccion 4 */}
                            <div>
                              <h3 className="font-bold uppercase border-b pb-0.5 mb-1.5 text-[8.5px] font-sans text-slate-800">IV. NARRATIVA DE LOS HECHOS (TRANSCRIPCIÓN ASISTIDA POR IA)</h3>
                              <div className="bg-slate-50 border border-slate-200 p-2.5 rounded text-[10px] leading-relaxed italic whitespace-pre-wrap font-sans text-slate-850">
                                {activeCase.relatoEstructurado || activeCase.relato || "Narración de hechos no estructurada."}
                              </div>
                            </div>

                            {/* Seccion 5 */}
                            {activeCase.agravantes && activeCase.agravantes.length > 0 && (
                              <div>
                                <h3 className="font-bold uppercase border-b pb-0.5 mb-1.5 text-[8.5px] font-sans text-slate-800">V. CIRCUNSTANCIAS AGRAVANTES ESPECIFICADAS</h3>
                                <div className="flex flex-wrap gap-1.5 mt-1 font-sans">
                                  {activeCase.agravantes.map((a) => (
                                    <Badge key={a} variant="outline" className="bg-slate-100 text-slate-800 text-[8px] font-bold py-0.5 px-1.5 rounded-sm border-slate-200">
                                      • {a}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Seccion 6 */}
                            {((activeCase.testigos && activeCase.testigos.length > 0) || (activeCase.evidencias && activeCase.evidencias.length > 0)) && (
                              <div>
                                <h3 className="font-bold uppercase border-b pb-0.5 mb-1.5 text-[8.5px] font-sans text-slate-800">VI. TESTIGOS Y EVIDENCIAS REGISTRADAS</h3>
                                <table className="w-full text-left text-[9px] font-sans">
                                  <tbody>
                                    {activeCase.testigos && activeCase.testigos.length > 0 && (
                                      <tr className="border-b border-slate-150">
                                        <td className="w-1/4 font-bold py-1.5 align-top">Testigos:</td>
                                        <td className="py-1.5 text-slate-700" colSpan={3}>
                                          {activeCase.testigos.map((t, idx) => (
                                            <div key={idx} className="text-[9px]">• {t.nombre} (Tel: {t.contacto})</div>
                                          ))}
                                        </td>
                                      </tr>
                                    )}
                                    {activeCase.evidencias && activeCase.evidencias.length > 0 && (
                                      <tr>
                                        <td className="w-1/4 font-bold py-1.5 align-top">Evidencias Digitales:</td>
                                        <td className="py-1.5" colSpan={3}>
                                          <div className="flex flex-wrap gap-2 mt-1">
                                            {activeCase.evidencias.map((e) => (
                                              <div key={e.id} className="flex items-center gap-1 border border-slate-200 bg-slate-50/50 p-1 px-1.5 rounded text-[8.5px] text-slate-650 max-w-[200px] truncate">
                                                <Paperclip className="h-3 w-3 text-slate-400" />
                                                <span className="truncate font-semibold">{e.nombre}</span>
                                                <span className="text-[7px] text-slate-400">({e.tipo})</span>
                                              </div>
                                            ))}
                                          </div>
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            )}

                            {/* VII. Disposición de Archivamiento (Transparencia) */}
                            {activeCase.archivado && (
                              <div className="border border-red-200 bg-red-50/35 p-3 rounded-lg mt-3 text-[10px]">
                                <h3 className="font-bold uppercase border-b border-red-200 pb-0.5 mb-1.5 text-[8.5px] font-sans text-red-800">
                                  VII. DISPOSICIÓN DE ARCHIVAMIENTO PROVISIONAL
                                </h3>
                                <p className="font-sans text-slate-800">
                                  <strong>Resolución:</strong> ARCHIVADO PROVISIONALMENTE (Conforme al Art. 334 inciso 1 del NCPP).
                                </p>
                                <p className="font-sans text-slate-700 mt-1 italic leading-relaxed">
                                  <strong>Fundamentación del Fiscal/PNP:</strong> "{archiveReasonNote || "Archivado por falta de elementos de convicción o presunto autor no identificado."}"
                                </p>
                                <p className="font-sans text-slate-400 text-[7.5px] mt-1 leading-snug">
                                  Nota: Este archivamiento tiene carácter provisional. El denunciante cuenta con el plazo legal de 5 días hábiles para presentar observaciones o aportar nuevos elementos probatorios que permitan reabrir el caso.
                                </p>
                              </div>
                            )}

                            {/* VII. Firmas y Validaciones */}
                            <div className="pt-6 mt-6 grid grid-cols-3 text-center text-[8.5px] border-t border-slate-350 items-center font-sans">
                              <div className="flex flex-col items-center">
                                {activeCase.reniecValidado ? (
                                  <>
                                    <div className="border border-police-green bg-police-green-soft/40 text-police-green px-1.5 py-0.5 rounded text-[7px] font-mono mb-1 inline-block uppercase font-bold select-none">
                                      ✔ FIRMADO CON ID PERÚ
                                    </div>
                                    <p className="font-bold text-slate-700">EL DENUNCIANTE</p>
                                    <p className="text-slate-500 font-semibold">DNI: {activeCase.dni}</p>
                                    <p className="text-[6px] text-slate-450 leading-tight">Verificación Biométrica RENIEC</p>
                                  </>
                                ) : (
                                  <>
                                    <div className="w-20 h-0.5 bg-slate-300 mb-1" />
                                    <p className="font-bold text-slate-650">EL DENUNCIANTE</p>
                                    <p className="text-slate-500">DNI: {activeCase.dni}</p>
                                    <p className="text-slate-400 text-[6.5px] leading-tight">Firma Digital Biométrica Pendiente</p>
                                  </>
                                )}
                              </div>
                              
                              <div className="flex flex-col items-center">
                                <img 
                                  src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=https://sideci.mininter.gob.pe/seguimiento?expediente=${activeCase.expediente}`} 
                                  alt="Verification QR"
                                  className="h-14 w-14 border p-0.5 bg-white shadow-xs select-none" 
                                />
                                <p className="text-[5.5px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Verificación SIDECI</p>
                              </div>
                              
                              <div className="flex flex-col items-center">
                                <div className={`border ${activeCase.reniecValidado ? "border-police-green text-police-green" : "border-slate-400 text-slate-600"} px-1.5 py-0.5 rounded text-[6.5px] font-mono mb-1 inline-block uppercase leading-tight bg-slate-50/50`}>
                                  <p className="font-bold text-[7.5px]">SISTEMA DIGITAL SIDECI</p>
                                  <p>{activeCase.reniecValidado ? "ACTA DIGITAL FIRMADA" : "REGISTRO DE BORRADOR"}</p>
                                  <p className="font-bold">PNP - PERÚ</p>
                                </div>
                                <p className="font-bold text-slate-700">MINISTERIO DEL INTERIOR</p>
                                <p className="text-slate-500 text-[7px]">Dirección de Investigación Criminal</p>
                              </div>
                            </div>

                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Column 3: Notifications & Details */}
            <div className="space-y-4">
              
              {/* Acta Oficial Certificada (NEW: View & Download) */}
              <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
                <CardHeader className="pb-3 border-b bg-slate-50/50">
                  <CardTitle className="flex items-center gap-2 text-sm text-primary-deep font-bold">
                    <FileText className="h-4 w-4 text-primary" /> Documento Certificado
                  </CardTitle>
                  <CardDescription className="text-[10px]">
                    Descargue el acta policial con firma biométrica ID Perú de RENIEC.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 space-y-2.5">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-police-green hover:bg-police-green/90 text-white font-bold text-xs py-5">
                        <Eye className="mr-1.5 h-4 w-4" /> Ver Acta Policial (PDF)
                      </Button>
                    </DialogTrigger>
                    
                    {/* A4 Dialog Modal */}
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-100 p-6">
                      <div className="flex justify-between items-center mb-4 shrink-0">
                        <h3 className="font-bold text-slate-800 text-lg">Acta Digital Certificada - Exp N° {activeCase.expediente}</h3>
                        <Button 
                          size="sm" 
                          onClick={() => handlePrint(`printable-acta-citizen-${activeCase.id}`, `Acta de Denuncia - ${activeCase.expediente}`)} 
                          className="bg-primary text-white hover:bg-primary-deep font-bold"
                        >
                          <Printer className="mr-1.5 h-4 w-4" /> Imprimir / Guardar PDF
                        </Button>
                      </div>

                      {/* A4 Sheet Container */}
                      <div className="w-full overflow-x-auto py-2 bg-slate-100 p-4 rounded-xl flex justify-center">
                        <div 
                          id={`printable-acta-citizen-${activeCase.id}`}
                          className="bg-white border shadow-md p-6 font-serif text-slate-900 text-[10px] leading-relaxed w-full max-w-[720px] min-w-[580px] border-double border-4 border-slate-700 bg-cover bg-center relative text-left"
                          style={{
                            backgroundImage: "linear-gradient(rgba(255,255,255,0.97), rgba(255,255,255,0.97)), url('/public/escudo_peru.png')",
                            backgroundSize: "220px 220px",
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "center 280px"
                          }}
                        >
                          {/* Header */}
                          <div className="flex items-center justify-between border-b pb-3 mb-4">
                            <div className="text-left font-bold uppercase tracking-wider text-[7.5px] leading-tight font-sans">
                              <p>Ministerio del Interior</p>
                              <p>Policía Nacional del Perú</p>
                              <p className="text-slate-800">Región Policial {activeCase.ubicacion?.direccion?.includes("Arequipa") ? "Arequipa" : activeCase.ubicacion?.direccion?.includes("Cusco") ? "Cusco" : activeCase.ubicacion?.direccion?.includes("La Libertad") ? "La Libertad" : "Lima"}</p>
                              <p className="text-slate-500 font-normal lowercase">{getComisaria(activeCase.ubicacion?.direccion || "").toLowerCase()}</p>
                            </div>
                            
                            <div className="flex flex-col items-center">
                              <svg viewBox="0 0 100 100" className="h-8.5 w-8.5 text-slate-700">
                                <path d="M50 5 L85 20 V50 C85 75 50 95 50 95 C50 95 15 75 15 50 V20 L50 5 Z" fill="none" stroke="currentColor" strokeWidth="3" />
                                <path d="M50 15 L75 27 V50 C75 68 50 83 50 83 C50 83 25 68 25 50 V27 L50 15 Z" fill="currentColor" opacity="0.2" />
                                <circle cx="50" cy="50" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M50 35 V65 M35 50 H65" stroke="currentColor" strokeWidth="1.5" />
                              </svg>
                              <span className="text-[6px] font-sans font-bold text-slate-650 mt-0.5">PATRIA - LEY - HONOR</span>
                            </div>
                            
                            <div className="text-right font-mono text-[8.5px] leading-tight">
                              <p className="font-bold">EXPEDIENTE N°:</p>
                              <p className="text-xs font-bold text-police-green">{activeCase.expediente}</p>
                              <p className="text-slate-400 mt-0.5 uppercase">SISTEMA SIDECI</p>
                            </div>
                          </div>

                          {/* Document Title */}
                          <div className="text-center mb-5 relative">
                            {activeCase.archivado && (
                              <div className="absolute top-0 right-2 border-2 border-red-650 text-red-650 font-extrabold uppercase tracking-wider text-[8px] px-2 py-0.5 rounded rotate-[12deg] select-none bg-white shadow-xs z-10">
                                Archivado
                              </div>
                            )}
                            <h2 className="text-xs font-bold underline uppercase tracking-widest font-sans">
                              {activeCase.reniecValidado 
                                ? "CERTIFICADO DE REGISTRO DE DENUNCIA POLICIAL DIGITAL"
                                : "BORRADOR DE REGISTRO DE DENUNCIA POLICIAL DIGITAL"}
                            </h2>
                            <p className="text-[8px] text-slate-600 font-sans mt-0.5">
                              Emitido de conformidad con la Ley N° 32332 - Registro de Denuncias por Delitos contra el Patrimonio
                            </p>
                          </div>

                          {/* Sections */}
                          <div className="space-y-4">
                            
                            {/* Seccion 1 */}
                            <div>
                              <h3 className="font-bold uppercase border-b pb-0.5 mb-1.5 text-[8.5px] font-sans text-slate-800">I. DATOS DE LA EMISIÓN Y REGISTRO</h3>
                              <table className="w-full text-left text-[9px]">
                                <tbody>
                                  <tr>
                                    <td className="w-1/4 font-bold py-0.5">Fecha de Registro:</td>
                                    <td className="py-0.5">{activeCase.fechaHecho ? activeCase.fechaHecho.split(" ")[0] : new Date().toLocaleDateString("es-PE")}</td>
                                    <td className="w-1/4 font-bold py-0.5">Código de Firma:</td>
                                    <td className="py-0.5 font-mono text-police-green font-bold">
                                      {activeCase.firmaDigitalCode || `FIRM-DIG-PNP-${activeCase.expediente}`}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="font-bold py-0.5">Estado del Acta:</td>
                                    <td className="py-0.5">
                                      {activeCase.archivado ? (
                                        <span className="font-bold text-red-655 uppercase">
                                          ARCHIVADO PROVISIONALMENTE
                                        </span>
                                      ) : (
                                        <span className="font-bold text-police-green">
                                          {activeCase.reniecValidado ? "ACTA OFICIAL DIGITAL FIRMADA" : "ACTA EN BORRADOR / PROCESO"}
                                        </span>
                                      )}
                                    </td>
                                    <td className="font-bold py-0.5">Validez Jurídica:</td>
                                    <td className="py-0.5">
                                      {activeCase.reniecValidado ? "Verificación Biométrica ID Perú (RENIEC)" : "Falta validación biométrica"}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>

                            {/* Seccion 2 */}
                            <div>
                              <h3 className="font-bold uppercase border-b pb-0.5 mb-1.5 text-[8.5px] font-sans text-slate-800">II. DATOS DEL DENUNCIANTE</h3>
                              <table className="w-full text-left text-[9px]">
                                <tbody>
                                  <tr>
                                    <td className="w-1/4 font-bold py-0.5">Documento Nacional (DNI):</td>
                                    <td className="py-0.5 font-mono">{activeCase.dni}</td>
                                    <td className="w-1/4 font-bold py-0.5">Nacionalidad:</td>
                                    <td className="py-0.5">Peruana</td>
                                  </tr>
                                  <tr>
                                    <td className="font-bold py-0.5">Condición del Ciudadano:</td>
                                    <td className="py-0.5">Víctima / Denunciante</td>
                                    <td className="font-bold py-0.5">Firma Electrónica ID:</td>
                                    <td className="py-0.5 font-mono text-[8.5px]">{activeCase.reniecValidado ? `ID-PE-${activeCase.dni}-SECURE` : "Firma pendiente"}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>

                            {/* Seccion 3 */}
                            <div>
                              <h3 className="font-bold uppercase border-b pb-0.5 mb-1.5 text-[8.5px] font-sans text-slate-800">III. HECHO DE DELITO CONTRA EL PATRIMONIO</h3>
                              <table className="w-full text-left text-[9px]">
                                <tbody>
                                  <tr>
                                    <td className="w-1/4 font-bold py-0.5">Presunto Delito:</td>
                                    <td className="py-0.5 font-bold text-slate-800 uppercase">
                                      {activeCase.agravantes && activeCase.agravantes.length > 0 ? "Robo Agravado" : "Hurto Simple"}
                                    </td>
                                    <td className="w-1/4 font-bold py-0.5">Calificación Legal:</td>
                                    <td className="py-0.5">
                                      {activeCase.agravantes && activeCase.agravantes.length > 0 ? "Artículo 189 del Código Penal" : "Artículo 185 del Código Penal"}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="font-bold py-0.5">Bien Afectado:</td>
                                    <td className="py-0.5 capitalize">{activeCase.tipo}</td>
                                    <td className="font-bold py-0.5">Identificador Técnico:</td>
                                    <td className="py-0.5 font-mono">
                                      {activeCase.tipo === "celular" ? `IMEI: ${activeCase.imei || "—"}` : activeCase.tipo === "vehiculo" ? `Placa: ${activeCase.placa || "—"}` : "No Aplica"}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="font-bold py-0.5">Dirección del Suceso:</td>
                                    <td className="py-0.5" colSpan={3}>{activeCase.ubicacion?.direccion || "—"}</td>
                                  </tr>
                                  <tr>
                                    <td className="font-bold py-0.5">Fecha y Hora Declarada:</td>
                                    <td className="py-0.5" colSpan={3}>{activeCase.fechaHecho || "—"}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>

                            {/* Seccion 4 */}
                            <div>
                              <h3 className="font-bold uppercase border-b pb-0.5 mb-1.5 text-[8.5px] font-sans text-slate-800">IV. NARRATIVA DE LOS HECHOS (TRANSCRIPCIÓN ASISTIDA POR IA)</h3>
                              <div className="bg-slate-50 border border-slate-200 p-2.5 rounded text-[10px] leading-relaxed italic whitespace-pre-wrap font-sans text-slate-850">
                                {activeCase.relatoEstructurado || activeCase.relato || "Narración de hechos no estructurada."}
                              </div>
                            </div>

                            {/* Seccion 5 */}
                            {activeCase.agravantes && activeCase.agravantes.length > 0 && (
                              <div>
                                <h3 className="font-bold uppercase border-b pb-0.5 mb-1.5 text-[8.5px] font-sans text-slate-800">V. CIRCUNSTANCIAS AGRAVANTES ESPECIFICADAS</h3>
                                <div className="flex flex-wrap gap-1.5 mt-1 font-sans">
                                  {activeCase.agravantes.map((a) => (
                                    <Badge key={a} variant="outline" className="bg-slate-100 text-slate-800 text-[8px] font-bold py-0.5 px-1.5 rounded-sm border-slate-200">
                                      • {a}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Seccion 6 */}
                            {((activeCase.testigos && activeCase.testigos.length > 0) || (activeCase.evidencias && activeCase.evidencias.length > 0)) && (
                              <div>
                                <h3 className="font-bold uppercase border-b pb-0.5 mb-1.5 text-[8.5px] font-sans text-slate-800">VI. TESTIGOS Y EVIDENCIAS REGISTRADAS</h3>
                                <table className="w-full text-left text-[9px] font-sans">
                                  <tbody>
                                    {activeCase.testigos && activeCase.testigos.length > 0 && (
                                      <tr className="border-b border-slate-150">
                                        <td className="w-1/4 font-bold py-1.5 align-top">Testigos:</td>
                                        <td className="py-1.5 text-slate-700" colSpan={3}>
                                          {activeCase.testigos.map((t, idx) => (
                                            <div key={idx} className="text-[9px]">• {t.nombre} (Tel: {t.contacto})</div>
                                          ))}
                                        </td>
                                      </tr>
                                    )}
                                    {activeCase.evidencias && activeCase.evidencias.length > 0 && (
                                      <tr>
                                        <td className="w-1/4 font-bold py-1.5 align-top">Evidencias Digitales:</td>
                                        <td className="py-1.5" colSpan={3}>
                                          <div className="flex flex-wrap gap-2 mt-1">
                                            {activeCase.evidencias.map((e) => (
                                              <div key={e.id} className="flex items-center gap-1 border border-slate-200 bg-slate-50/50 p-1 px-1.5 rounded text-[8.5px] text-slate-650 max-w-[200px] truncate">
                                                <Paperclip className="h-3 w-3 text-slate-400" />
                                                <span className="truncate font-semibold">{e.nombre}</span>
                                                <span className="text-[7px] text-slate-400">({e.tipo})</span>
                                              </div>
                                            ))}
                                          </div>
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            )}

                            {/* VII. Disposición de Archivamiento (Transparencia) */}
                            {activeCase.archivado && (
                              <div className="border border-red-200 bg-red-50/35 p-3 rounded-lg mt-3 text-[10px]">
                                <h3 className="font-bold uppercase border-b border-red-200 pb-0.5 mb-1.5 text-[8.5px] font-sans text-red-800">
                                  VII. DISPOSICIÓN DE ARCHIVAMIENTO PROVISIONAL
                                </h3>
                                <p className="font-sans text-slate-800">
                                  <strong>Resolución:</strong> ARCHIVADO PROVISIONALMENTE (Conforme al Art. 334 inciso 1 del NCPP).
                                </p>
                                <p className="font-sans text-slate-700 mt-1 italic leading-relaxed">
                                  <strong>Fundamentación del Fiscal/PNP:</strong> "{archiveReasonNote || "Archivado por falta de elementos de convicción o presunto autor no identificado."}"
                                </p>
                                <p className="font-sans text-slate-400 text-[7.5px] mt-1 leading-snug">
                                  Nota: Este archivamiento tiene carácter provisional. El denunciante cuenta con el plazo legal de 5 días hábiles para presentar observaciones o aportar nuevos elementos probatorios que permitan reabrir el caso.
                                </p>
                              </div>
                            )}

                            {/* VII. Firmas y Validaciones */}
                            <div className="pt-6 mt-6 grid grid-cols-3 text-center text-[8.5px] border-t border-slate-350 items-center font-sans">
                              <div className="flex flex-col items-center">
                                {activeCase.reniecValidado ? (
                                  <>
                                    <div className="border border-police-green bg-police-green-soft/40 text-police-green px-1.5 py-0.5 rounded text-[7px] font-mono mb-1 inline-block uppercase font-bold select-none">
                                      ✔ FIRMADO CON ID PERÚ
                                    </div>
                                    <p className="font-bold text-slate-700">EL DENUNCIANTE</p>
                                    <p className="text-slate-500 font-semibold">DNI: {activeCase.dni}</p>
                                    <p className="text-[6px] text-slate-450 leading-tight">Verificación Biométrica RENIEC</p>
                                  </>
                                ) : (
                                  <>
                                    <div className="w-20 h-0.5 bg-slate-300 mb-1" />
                                    <p className="font-bold text-slate-650">EL DENUNCIANTE</p>
                                    <p className="text-slate-500">DNI: {activeCase.dni}</p>
                                    <p className="text-slate-400 text-[6.5px] leading-tight">Firma Digital Biométrica Pendiente</p>
                                  </>
                                )}
                              </div>
                              
                              <div className="flex flex-col items-center">
                                <img 
                                  src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=https://sideci.mininter.gob.pe/seguimiento?expediente=${activeCase.expediente}`} 
                                  alt="Verification QR"
                                  className="h-14 w-14 border p-0.5 bg-white shadow-xs select-none" 
                                />
                                <p className="text-[5.5px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Verificación SIDECI</p>
                              </div>
                              
                              <div className="flex flex-col items-center">
                                <div className={`border ${activeCase.reniecValidado ? "border-police-green text-police-green" : "border-slate-400 text-slate-600"} px-1.5 py-0.5 rounded text-[6.5px] font-mono mb-1 inline-block uppercase leading-tight bg-slate-50/50`}>
                                  <p className="font-bold text-[7.5px]">SISTEMA DIGITAL SIDECI</p>
                                  <p>{activeCase.reniecValidado ? "ACTA DIGITAL FIRMADA" : "REGISTRO DE BORRADOR"}</p>
                                  <p className="font-bold">PNP - PERÚ</p>
                                </div>
                                <p className="font-bold text-slate-700">MINISTERIO DEL INTERIOR</p>
                                <p className="text-slate-500 text-[7px]">Dirección de Investigación Criminal</p>
                              </div>
                            </div>

                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>

              {/* Citizen Notifications */}
              <Card className="border-slate-200 bg-white shadow-sm">
                <CardHeader className="pb-2 bg-slate-50/20 border-b">
                  <CardTitle className="flex items-center gap-2 text-sm text-primary-deep font-bold">
                    <Bell className="h-4 w-4 text-primary" /> Notificaciones del Caso
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-3">
                  {activeCase.mensajes.slice(-5).reverse().map((m) => (
                    <div key={m.id} className="rounded-lg border bg-slate-50 p-2.5 text-xs">
                      <div className="mb-1 flex items-center justify-between">
                        <Badge variant="outline" className="text-[8px] uppercase tracking-wide px-1.5 bg-white">
                          {m.autor}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground font-medium">{m.fecha}</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{m.texto}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* National Guarantees Card */}
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
                  {!activeCase.archivado && (
                    <Button variant="outline" className="w-full text-xs" onClick={() => archivar("Archivado provisionalmente por falta de pruebas físicas suficientes.")}>
                      <AlertTriangle className="mr-1.5 h-3.5 w-3.5" /> Simular Archivamiento
                    </Button>
                  )}
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