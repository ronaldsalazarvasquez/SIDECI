import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useDenuncia, type EstadoKey, type EstadoStatus, type Denuncia } from "@/lib/denuncia-store";
import { 
  ShieldCheck, 
  Activity, 
  Database, 
  Archive, 
  Eye, 
  Sparkles, 
  Landmark, 
  Scale, 
  Send, 
  Search, 
  MapPin, 
  FileText, 
  Printer, 
  Calendar, 
  User, 
  Copy,
  Clock,
  ExternalLink,
  ChevronRight,
  Shield,
  FileImage,
  Video,
  AudioLines,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from "lucide-react";
import { toast } from "sonner";

const STATUSES: EstadoStatus[] = ["pendiente", "en_proceso", "completado", "archivado"];

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

const statusBadge = (s: EstadoStatus) =>
  s === "completado"
    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
    : s === "en_proceso"
    ? "bg-police-green/10 text-police-green border border-police-green/20 font-bold"
    : s === "archivado"
    ? "bg-slate-100 text-slate-600 border border-slate-200"
    : "bg-amber-50 text-amber-700 border border-amber-200";

const statusIcon = (s: EstadoStatus) =>
  s === "completado" ? (
    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
  ) : s === "en_proceso" ? (
    <Activity className="h-4.5 w-4.5 text-police-green shrink-0 animate-pulse" />
  ) : s === "archivado" ? (
    <AlertCircle className="h-4.5 w-4.5 text-slate-400 shrink-0" />
  ) : (
    <HelpCircle className="h-4.5 w-4.5 text-amber-500 shrink-0" />
  );

export function OperatorView() {
  const { 
    denuncia, 
    denuncias, 
    setEstado, 
    archivar, 
    setRole, 
    setActiveModule, 
    addMensaje, 
    role, 
    selectDenuncia 
  } = useDenuncia();
  
  const isFiscal = role === "fiscal";

  // Filter States
  const [comisariaFilter, setComisariaFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Archiving Reason States
  const [showArchiveReasonInput, setShowArchiveReasonInput] = useState(false);
  const [archiveReason, setArchiveReason] = useState("");

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [comisariaFilter, statusFilter, searchQuery]);

  const handleDeriveToCourt = () => {
    setEstado("resultado", "completado", "Caso judicializado y derivado al Juzgado Penal de Turno de Lima.");
    addMensaje({
      autor: "legal",
      texto: "El Ministerio Público ha concluido la calificación penal del caso y procedió a formular denuncia fiscal ante el Juzgado Penal de Turno de Lima."
    });
    toast.success("Denuncia derivada con éxito al Juzgado Penal de Turno.");
  };

  const handleCopyExpediente = (exp: string) => {
    navigator.clipboard.writeText(exp);
    toast.success(`N° de Expediente ${exp} copiado.`);
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

  // Filter Logic
  const filteredDenuncias = denuncias.filter((d) => {
    const matchesComisaria =
      comisariaFilter === "todos" ||
      getComisaria(d.ubicacion.direccion).toLowerCase() === comisariaFilter.toLowerCase();

    const completados = d.timeline.filter((t) => t.status === "completado");
    const current =
      d.timeline.find((t) => t.status === "en_proceso") ??
      completados[completados.length - 1] ??
      d.timeline[0];
    const matchesStatus = statusFilter === "todos" || current.status === statusFilter;

    const matchesSearch =
      searchQuery === "" ||
      d.expediente.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.dni.includes(searchQuery) ||
      d.tipo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.relatoEstructurado && d.relatoEstructurado.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesComisaria && matchesStatus && matchesSearch;
  });

  // Active Selected Complaint
  const activeDenuncia = filteredDenuncias.find((d) => d.id === denuncia.id) || filteredDenuncias[0] || null;

  // Pagination Logic
  const totalPages = Math.ceil(filteredDenuncias.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDenuncias = filteredDenuncias.slice(startIndex, endIndex);

  // Dynamic stats calculation based on filtered complaints
  const totalCount = filteredDenuncias.length;
  const enProcesoCount = filteredDenuncias.filter((d) => {
    const completados = d.timeline.filter((t) => t.status === "completado");
    const current =
      d.timeline.find((t) => t.status === "en_proceso") ??
      completados[completados.length - 1] ??
      d.timeline[0];
    return current.status === "en_proceso";
  }).length;
  
  const completadosCount = filteredDenuncias.filter((d) => {
    const completados = d.timeline.filter((t) => t.status === "completado");
    const current =
      d.timeline.find((t) => t.status === "en_proceso") ??
      completados[completados.length - 1] ??
      d.timeline[0];
    return current.status === "completado";
  }).length;

  const archivadasCount = filteredDenuncias.filter((d) => d.archivado).length;

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-4">
      
      {/* Header (Very Minimalist) */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            {isFiscal ? <Landmark className="h-5 w-5 text-indigo-600" /> : <Shield className="h-5 w-5 text-police-green" />}
            {isFiscal ? "Bandeja Fiscal de Calificación" : "Bandeja Operativa PNP"}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isFiscal ? "Fiscalía de la Nación · Calificación y Calidad Penal" : "PNP · Asignación y Control Geocercado Nacional"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded ${isFiscal ? "bg-indigo-50 text-indigo-700 border-indigo-150" : "bg-police-green/10 text-police-green border border-police-green/20"}`}>
            {isFiscal ? "Ministerio Público" : "Mesa de Partes PNP"}
          </Badge>
        </div>
      </div>

      {/* Dynamic Statistics Cards (Minimalist & Compact) */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Database} label="Casos Filtrados" value={totalCount.toString()} color={isFiscal ? "text-indigo-600" : "text-police-green"} />
        <StatCard icon={Activity} label="En Trámite" value={enProcesoCount.toString()} color="text-amber-600" />
        <StatCard icon={ShieldCheck} label="Aprobados" value={completadosCount.toString()} color="text-emerald-600" />
        <StatCard icon={Archive} label="Archivados" value={archivadasCount.toString()} color="text-slate-400" />
      </div>

      {/* Spacious, Minimalist Filter & Search Bar */}
      <div className="grid gap-3 md:grid-cols-4 bg-white border border-slate-100 p-3 rounded-xl shadow-xs">
        <div className="relative">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
          <Input 
            placeholder="Buscar por expediente, DNI o delito..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 bg-slate-50/50 border-slate-200 h-8 text-[11px] placeholder:text-slate-400 rounded-lg focus:bg-white transition-colors"
          />
        </div>
        <div>
          <Select value={comisariaFilter} onValueChange={setComisariaFilter}>
            <SelectTrigger className="bg-slate-50/50 text-[11px] border-slate-200 h-8 rounded-lg">
              <SelectValue placeholder="Jurisdicción / Comisaría" />
            </SelectTrigger>
            <SelectContent className="text-[11px]">
              <SelectItem value="todos">Todas las Jurisdicciones</SelectItem>
              <SelectItem value="Comisaría Lince">Comisaría Lince</SelectItem>
              <SelectItem value="Comisaría Jesús María">Comisaría Jesús María</SelectItem>
              <SelectItem value="Comisaría San Isidro">Comisaría San Isidro</SelectItem>
              <SelectItem value="Comisaría de Arequipa">Comisaría de Arequipa</SelectItem>
              <SelectItem value="Comisaría Cusco Centro">Comisaría Cusco Centro</SelectItem>
              <SelectItem value="Comisaría de Ayacucho (Trujillo)">Comisaría de Ayacucho (Trujillo)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-slate-50/50 text-[11px] border-slate-200 h-8 rounded-lg">
              <SelectValue placeholder="Progreso de Hito" />
            </SelectTrigger>
            <SelectContent className="text-[11px]">
              <SelectItem value="todos">Todos los estados</SelectItem>
              <SelectItem value="pendiente">Pendientes</SelectItem>
              <SelectItem value="en_proceso">En proceso</SelectItem>
              <SelectItem value="completado">Completados</SelectItem>
              <SelectItem value="archivado">Archivados</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between gap-2">
          <Badge className="bg-slate-100 hover:bg-slate-100 text-slate-600 text-[10px] py-1 border rounded w-full justify-center">
            GPS Activo: Nacional
          </Badge>
          {(comisariaFilter !== "todos" || statusFilter !== "todos" || searchQuery !== "") && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => { setComisariaFilter("todos"); setStatusFilter("todos"); setSearchQuery(""); }} 
              className="text-[10px] h-8 text-slate-500 font-semibold"
            >
              Resetear
            </Button>
          )}
        </div>
      </div>

      {/* Spacious, Minimalist Complaint Inbox Table */}
      <Card className="border-slate-100 shadow-xs rounded-xl overflow-hidden bg-white">
        <CardContent className="p-0 overflow-x-auto">
          {filteredDenuncias.length > 0 ? (
            <>
              <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="font-bold text-[11px] text-slate-500 py-3 pl-4">Expediente</TableHead>
                  <TableHead className="font-bold text-[11px] text-slate-500 py-3">DNI Ciudadano</TableHead>
                  <TableHead className="font-bold text-[11px] text-slate-500 py-3">Delito / Tipo</TableHead>
                  <TableHead className="font-bold text-[11px] text-slate-500 py-3">Comisaría (Geocerca GPS)</TableHead>
                  <TableHead className="font-bold text-[11px] text-slate-500 py-3">Evidencias</TableHead>
                  <TableHead className="font-bold text-[11px] text-slate-500 py-3">Progreso Hito</TableHead>
                  <TableHead className="text-right font-bold text-[11px] text-slate-500 py-3 pr-6">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedDenuncias.map((d) => {
                  const isSelected = activeDenuncia?.id === d.id;
                  const completados = d.timeline.filter((t) => t.status === "completado");
                  const current =
                    d.timeline.find((t) => t.status === "en_proceso") ??
                    completados[completados.length - 1] ??
                    d.timeline[0];
                  const comisariaName = getComisaria(d.ubicacion.direccion);

                  return (
                    <TableRow 
                      key={d.id} 
                      onClick={() => selectDenuncia(d.id)}
                      className={`hover:bg-slate-50/50 transition-colors border-b border-slate-100 ${
                        isSelected ? "bg-slate-50/70 border-l-4 border-l-police-green" : ""
                      }`}
                    >
                      <TableCell className="font-mono text-primary-deep font-bold text-[11px] py-3.5 pl-4">
                        <div className="flex items-center gap-1.5">
                          <span>{d.expediente}</span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleCopyExpediente(d.expediente); }} 
                            className="p-1 hover:bg-slate-200 rounded text-slate-355 hover:text-slate-500 transition-colors"
                            title="Copiar Expediente"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      </TableCell>
                      <TableCell className="text-[11px] font-semibold text-slate-650">{d.dni}</TableCell>
                      <TableCell className="text-[11px] font-medium text-slate-700">{d.tipo}</TableCell>
                      <TableCell className="text-[11px] text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-police-green/75 shrink-0" />
                          <span className="font-medium text-slate-650">{comisariaName}</span>
                          <span className="text-[9px] text-slate-400 bg-slate-100 px-1 rounded font-mono">GPS</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-[11px]">
                        <Badge variant="outline" className="bg-slate-50 text-slate-600 border border-slate-200 text-[9px] px-1 rounded-sm">
                          {d.evidencias.length} archivos
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusBadge(current.status)} text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider`}>
                          {current.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant={isSelected ? "default" : "outline"} 
                            className={`h-7 text-[10px] font-bold ${
                              isSelected ? "bg-police-green hover:bg-police-green/90 text-white" : "border-slate-200 hover:bg-slate-50"
                            }`}
                            onClick={() => selectDenuncia(d.id)}
                          >
                            <Eye className="mr-1 h-3 w-3" /> 
                            {isSelected ? "Inspeccionando" : "Ver Acta"}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-[10px] font-semibold text-primary"
                            onClick={() => {
                              selectDenuncia(d.id);
                              setRole(isFiscal ? "fiscal" : "ciudadano");
                              setActiveModule("seguimiento");
                            }}
                          >
                            Trazar <ChevronRight className="ml-0.5 h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {/* Pagination Controls */}
            <div className="py-2.5 px-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="text-[11px] text-slate-500 font-medium">
                Mostrando {totalCount === 0 ? 0 : startIndex + 1} - {Math.min(endIndex, totalCount)} de {totalCount} expedientes
              </span>
              <div className="flex items-center gap-1.5">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="h-7 text-[10.5px] px-2.5 font-bold border-slate-200 disabled:opacity-40"
                >
                  Anterior
                </Button>
                <span className="text-[10.5px] font-bold text-slate-650 px-1 select-none font-sans">
                  Página {currentPage} de {totalPages || 1}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="h-7 text-[10.5px] px-2.5 font-bold border-slate-200 disabled:opacity-40"
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </>
          ) : (
            <div className="text-center py-10 text-slate-400 text-xs italic">
              No hay denuncias que coincidan con la búsqueda.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Connected Workspace: A4 Document & Progress Control (Clean, Spacious Split Screen) */}
      {activeDenuncia ? (
        <div className="space-y-4 pt-3 border-t border-slate-100">
          
          {/* Informative routing banner for the Hackathon jury */}
          <div className="flex flex-col gap-2 p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl text-xs sm:flex-row sm:items-center sm:justify-between text-police-green">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-police-green" />
              <span>
                <strong>Trazabilidad Nacional (Geocerca GPS):</strong> Este caso fue geolocalizado en la dirección <em>"{activeDenuncia.ubicacion.direccion}"</em> (Lat: {activeDenuncia.ubicacion.lat.toFixed(4)}, Lng: {activeDenuncia.ubicacion.lng.toFixed(4)}), asignándose automáticamente en tiempo real a la <strong>{getComisaria(activeDenuncia.ubicacion.direccion)}</strong>.
              </span>
            </div>
            <Badge className="bg-emerald-600 text-white hover:bg-emerald-600 text-[9px] w-fit font-bold shrink-0">Geomapeo Activo</Badge>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            
            {/* LEFT SIDE: The exact A4 document from Module4Confirmacion.tsx (7 cols) */}
            <div className="xl:col-span-7 space-y-3">
              <div className="flex items-center justify-between bg-slate-100 border p-2.5 rounded-lg">
                <div className="flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-slate-600" />
                  <span className="text-[11px] font-bold text-slate-700">
                    {activeDenuncia.reniecValidado ? "Acta Oficial de Denuncia Policial" : "Borrador de Denuncia Policial"}
                  </span>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handlePrint(`acta-policial-documento-operator-${activeDenuncia.id}`, `Acta de Denuncia Policial - ${activeDenuncia.expediente}`)}
                  className="bg-white border-slate-200 h-8 text-[11px] font-bold hover:bg-slate-50 shadow-xs flex items-center gap-1"
                >
                  <Printer className="h-3.5 w-3.5 text-slate-600" />
                  Imprimir / Descargar PDF
                </Button>
              </div>

              {/* Exact replication of printable document sheet */}
              <div className="w-full overflow-x-auto py-2 bg-slate-100 border p-4 rounded-xl flex justify-center">
                <div 
                  id={`acta-policial-documento-operator-${activeDenuncia.id}`}
                  className="bg-white border shadow-md p-6 font-serif text-slate-900 text-[10px] leading-relaxed w-full max-w-[720px] min-w-[580px] border-double border-4 border-slate-700 bg-cover bg-center relative"
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
                      <p className="text-slate-800">Región Policial {activeDenuncia.ubicacion.direccion.includes("Arequipa") ? "Arequipa" : activeDenuncia.ubicacion.direccion.includes("Cusco") ? "Cusco" : activeDenuncia.ubicacion.direccion.includes("La Libertad") ? "La Libertad" : "Lima"}</p>
                      <p className="text-slate-500 font-normal lowercase">{getComisaria(activeDenuncia.ubicacion.direccion).toLowerCase()}</p>
                    </div>
                    
                    <div className="flex flex-col items-center select-none">
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
                      <p className="text-xs font-bold text-police-green">{activeDenuncia.expediente}</p>
                      <p className="text-slate-400 mt-0.5 uppercase">SISTEMA SIDECI</p>
                    </div>
                  </div>

                  {/* Document Title */}
                  <div className="text-center mb-5 relative">
                    {activeDenuncia.archivado && (
                      <div className="absolute top-0 right-2 border-2 border-red-600 text-red-650 font-extrabold uppercase tracking-wider text-[8px] px-2 py-0.5 rounded rotate-[12deg] select-none bg-white shadow-xs z-10">
                        Archivado
                      </div>
                    )}
                    <h2 className="text-xs font-bold underline uppercase tracking-widest font-sans">
                      {activeDenuncia.reniecValidado 
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
                            <td className="py-0.5">{activeDenuncia.fechaHecho ? activeDenuncia.fechaHecho.split(" ")[0] : new Date().toLocaleDateString("es-PE")}</td>
                            <td className="w-1/4 font-bold py-0.5">Código de Firma:</td>
                            <td className="py-0.5 font-mono text-police-green font-bold">
                              {activeDenuncia.firmaDigitalCode || `FIRM-DIG-PNP-${activeDenuncia.expediente}`}
                            </td>
                          </tr>
                          <tr>
                            <td className="font-bold py-0.5">Estado del Acta:</td>
                            <td className="py-0.5">
                              {activeDenuncia.archivado ? (
                                <span className="font-bold text-red-650">
                                  ARCHIVADO PROVISIONALMENTE
                                </span>
                              ) : (
                                <span className="font-bold text-police-green">
                                  {activeDenuncia.reniecValidado ? "ACTA OFICIAL DIGITAL FIRMADA" : "ACTA EN BORRADOR / PROCESO"}
                                </span>
                              )}
                            </td>
                            <td className="font-bold py-0.5">Validez Jurídica:</td>
                            <td className="py-0.5">
                              {activeDenuncia.reniecValidado ? "Verificación Biométrica ID Perú (RENIEC)" : "Falta validación biométrica"}
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
                            <td className="py-0.5 font-mono">{activeDenuncia.dni}</td>
                            <td className="w-1/4 font-bold py-0.5">Nacionalidad:</td>
                            <td className="py-0.5">Peruana</td>
                          </tr>
                          <tr>
                            <td className="font-bold py-0.5">Condición del Ciudadano:</td>
                            <td className="py-0.5">Víctima / Denunciante</td>
                            <td className="font-bold py-0.5">Firma Electrónica ID:</td>
                            <td className="py-0.5 font-mono text-[8.5px]">{activeDenuncia.reniecValidado ? `ID-PE-${activeDenuncia.dni}-SECURE` : "Firma pendiente"}</td>
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
                              {activeDenuncia.agravantes && activeDenuncia.agravantes.length > 0 ? "Robo Agravado" : "Hurto Simple"}
                            </td>
                            <td className="w-1/4 font-bold py-0.5">Calificación Legal:</td>
                            <td className="py-0.5">
                              {activeDenuncia.agravantes && activeDenuncia.agravantes.length > 0 ? "Artículo 189 del Código Penal" : "Artículo 185 del Código Penal"}
                            </td>
                          </tr>
                          <tr>
                            <td className="font-bold py-0.5">Bien Afectado:</td>
                            <td className="py-0.5 capitalize">{activeDenuncia.tipo}</td>
                            <td className="font-bold py-0.5">Identificador Técnico:</td>
                            <td className="py-0.5 font-mono">
                              {activeDenuncia.tipo === "celular" ? `IMEI: ${activeDenuncia.imei || "—"}` : activeDenuncia.tipo === "vehiculo" ? `Placa: ${activeDenuncia.placa || "—"}` : "No Aplica"}
                            </td>
                          </tr>
                          <tr>
                            <td className="font-bold py-0.5">Dirección del Suceso:</td>
                            <td className="py-0.5" colSpan={3}>{activeDenuncia.ubicacion?.direccion || "—"}</td>
                          </tr>
                          <tr>
                            <td className="font-bold py-0.5">Fecha y Hora Declarada:</td>
                            <td className="py-0.5" colSpan={3}>{activeDenuncia.fechaHecho || "—"}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Seccion 4 */}
                    <div>
                      <h3 className="font-bold uppercase border-b pb-0.5 mb-1.5 text-[8.5px] font-sans text-slate-800">IV. NARRATIVA DE LOS HECHOS (TRANSCRIPCIÓN ASISTIDA POR IA)</h3>
                      <div className="bg-slate-50 border border-slate-200 p-2.5 rounded text-[10px] leading-relaxed italic whitespace-pre-wrap font-sans text-slate-850">
                        {activeDenuncia.relatoEstructurado || activeDenuncia.relato || "Narración de hechos no estructurada."}
                      </div>
                    </div>

                    {/* Seccion 5 */}
                    {activeDenuncia.agravantes && activeDenuncia.agravantes.length > 0 && (
                      <div>
                        <h3 className="font-bold uppercase border-b pb-0.5 mb-1.5 text-[8.5px] font-sans text-slate-800">V. CIRCUNSTANCIAS AGRAVANTES ESPECIFICADAS</h3>
                        <div className="flex flex-wrap gap-1.5 mt-1 font-sans">
                          {activeDenuncia.agravantes.map((a) => (
                            <Badge key={a} variant="outline" className="bg-slate-100 text-slate-800 text-[8px] font-bold py-0.5 px-1.5 rounded-sm border-slate-200">
                              • {a}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Seccion 6 */}
                    {((activeDenuncia.testigos && activeDenuncia.testigos.length > 0) || (activeDenuncia.evidencias && activeDenuncia.evidencias.length > 0)) && (
                      <div>
                        <h3 className="font-bold uppercase border-b pb-0.5 mb-1.5 text-[8.5px] font-sans text-slate-800">VI. TESTIGOS Y EVIDENCIAS REGISTRADAS</h3>
                        <table className="w-full text-left text-[9px] font-sans">
                          <tbody>
                            {activeDenuncia.testigos && activeDenuncia.testigos.length > 0 && (
                              <tr className="border-b border-slate-150">
                                <td className="w-1/4 font-bold py-1.5 align-top">Testigos:</td>
                                <td className="py-1.5 text-slate-700" colSpan={3}>
                                  {activeDenuncia.testigos.map((t, idx) => (
                                    <div key={idx} className="text-[9px]">• {t.nombre} (Tel: {t.contacto})</div>
                                  ))}
                                </td>
                              </tr>
                            )}
                            {activeDenuncia.evidencias && activeDenuncia.evidencias.length > 0 && (
                              <tr>
                                <td className="w-1/4 font-bold py-1.5 align-top">Evidencias Digitales:</td>
                                <td className="py-1.5" colSpan={3}>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {activeDenuncia.evidencias.map((e) => (
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
                    {activeDenuncia.archivado && (
                      <div className="border border-red-200 bg-red-50/35 p-3 rounded-lg mt-3 text-[10px]">
                        <h3 className="font-bold uppercase border-b border-red-200 pb-0.5 mb-1.5 text-[8.5px] font-sans text-red-800">
                          VII. DISPOSICIÓN DE ARCHIVAMIENTO PROVISIONAL
                        </h3>
                        <p className="font-sans text-slate-800">
                          <strong>Resolución:</strong> ARCHIVADO PROVISIONALMENTE (Conforme al Art. 334 inciso 1 del NCPP).
                        </p>
                        <p className="font-sans text-slate-700 mt-1 italic leading-relaxed">
                          <strong>Fundamentación del Fiscal/PNP:</strong> "{activeDenuncia.timeline.find(t => t.key === "resultado")?.detalle || "Archivado por falta de elementos de convicción o presunto autor no identificado."}"
                        </p>
                        <p className="font-sans text-slate-400 text-[7.5px] mt-1 leading-snug">
                          Nota: Este archivamiento tiene carácter provisional. El denunciante cuenta con el plazo legal de 5 días hábiles para presentar observaciones o aportar nuevos elementos probatorios que permitan reabrir el caso.
                        </p>
                      </div>
                    )}

                    {/* VII. Firmas y Validaciones */}
                    <div className="pt-6 mt-6 grid grid-cols-3 text-center text-[8.5px] border-t border-slate-350 items-center font-sans">
                      <div className="flex flex-col items-center">
                        {activeDenuncia.reniecValidado ? (
                          <>
                            <div className="border border-police-green bg-police-green-soft/40 text-police-green px-1.5 py-0.5 rounded text-[7px] font-mono mb-1 inline-block uppercase font-bold select-none">
                              ✔ FIRMADO CON ID PERÚ
                            </div>
                            <p className="font-bold text-slate-700">EL DENUNCIANTE</p>
                            <p className="text-slate-500 font-semibold">DNI: {activeDenuncia.dni}</p>
                            <p className="text-[6px] text-slate-450 leading-tight">Verificación Biométrica RENIEC</p>
                          </>
                        ) : (
                          <>
                            <div className="w-20 h-0.5 bg-slate-300 mb-1" />
                            <p className="font-bold text-slate-600">EL DENUNCIANTE</p>
                            <p className="text-slate-500">DNI: {activeDenuncia.dni}</p>
                            <p className="text-slate-400 text-[6.5px] leading-tight">Firma Digital Biométrica Pendiente</p>
                          </>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-center">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=https://sideci.mininter.gob.pe/seguimiento?expediente=${activeDenuncia.expediente}`} 
                          alt="Verification QR"
                          className="h-14 w-14 border p-0.5 bg-white shadow-xs select-none" 
                        />
                        <p className="text-[5.5px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Verificación SIDECI</p>
                      </div>
                      
                      <div className="flex flex-col items-center">
                        <div className={`border ${activeDenuncia.reniecValidado ? "border-police-green text-police-green" : "border-slate-400 text-slate-600"} px-1.5 py-0.5 rounded text-[6.5px] font-mono mb-1 inline-block uppercase leading-tight bg-slate-50/50`}>
                          <p className="font-bold text-[7.5px]">SISTEMA DIGITAL SIDECI</p>
                          <p>{activeDenuncia.reniecValidado ? "ACTA DIGITAL FIRMADA" : "REGISTRO DE BORRADOR"}</p>
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

            {/* RIGHT SIDE: Vertical Timeline Progress Flow Tracker + Conversational Transcript Logs (5 cols) */}
            <div className="xl:col-span-5 space-y-4">
              
              {/* Stepper Flow Tracker */}
              <Card className="border-slate-100 shadow-xs rounded-xl overflow-hidden bg-white">
                <CardHeader className="py-3.5 border-b border-slate-100 bg-slate-50/20">
                  <CardTitle className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-slate-500" />
                    Trazabilidad de Hitos (Seguimiento Nacional)
                  </CardTitle>
                  <CardDescription className="text-[11px] text-muted-foreground mt-0.5">
                    Actualice el progreso del expediente. Los cambios se notifican al ciudadano.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  
                  {/* Vertical Stepper Container */}
                  <div className="relative border-l border-slate-200 pl-5 ml-2.5 space-y-4">
                    {activeDenuncia.timeline.map((t, idx) => {
                      const isActive = t.status === "en_proceso" || t.status === "completado";
                      return (
                        <div key={t.key} className="relative group">
                          {/* Node Bullet Icon */}
                          <div className={`absolute -left-[30px] top-0.5 rounded-full bg-white p-0.5 border-2 transition-all ${
                            t.status === "completado" ? "border-emerald-600" :
                            t.status === "en_proceso" ? "border-police-green ring-4 ring-police-green/10" :
                            t.status === "archivado" ? "border-slate-400" : "border-slate-200"
                          }`}>
                            {statusIcon(t.status)}
                          </div>

                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center justify-between gap-1">
                              <span className={`text-[11.5px] font-bold ${isActive ? "text-slate-800" : "text-slate-400"}`}>
                                {t.label}
                              </span>
                              
                              {/* Edit Select */}
                              <Select 
                                value={t.status} 
                                onValueChange={(v) => { 
                                  setEstado(t.key as EstadoKey, v as EstadoStatus); 
                                  toast.success(`Hito "${t.label}" cambiado a: ${v}`); 
                                }}
                              >
                                <SelectTrigger className="h-6.5 text-[9.5px] w-24 bg-white border-slate-200 font-semibold focus:ring-0">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="text-[10px]">
                                  {STATUSES.map((s) => (
                                    <SelectItem key={s} value={s} className="text-[10px]">{s}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="flex items-start gap-1 px-1 justify-between">
                              <p className="text-[9.5px] text-slate-500 max-w-[200px] leading-tight">
                                {t.detalle || "Hito procesal pendiente de detalles."}
                              </p>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-5 text-[8.5px] text-slate-400 hover:text-primary p-1 flex items-center gap-0.5" 
                                onClick={() => { 
                                  addMensaje({ 
                                    autor: isFiscal ? "legal" : "pnp", 
                                    texto: isFiscal 
                                      ? `Actualización del hito fiscal: "${t.label}".`
                                      : `Notificación PNP: Avance en hito "${t.label}".` 
                                  }); 
                                  toast.success("Notificación enviada al buzón ciudadano"); 
                                }}
                              >
                                <Send className="h-2.5 w-2.5" /> Notificar
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-col gap-2 pt-3 border-t border-slate-100 font-sans">
                    {showArchiveReasonInput ? (
                      <div className="flex flex-col gap-2 p-2.5 bg-red-50/40 border border-red-100 rounded-lg w-full">
                        <label className="text-[10px] font-extrabold text-red-750 uppercase">Motivo del archivamiento provisional</label>
                        <Input 
                          placeholder="Ej: Falta de elementos suficientes de convicción o autor no identificado..." 
                          value={archiveReason}
                          onChange={(e) => setArchiveReason(e.target.value)}
                          className="text-[11px] bg-white h-8 border-red-200 focus:border-red-400"
                        />
                        <div className="flex gap-2 mt-1">
                          <Button 
                            size="sm" 
                            className="bg-red-650 hover:bg-red-755 text-white text-[10px] font-bold h-7 flex-1"
                            onClick={() => {
                              if (!archiveReason.trim()) {
                                toast.error("Por favor, ingrese un motivo de archivamiento.");
                                return;
                              }
                              archivar(archiveReason);
                              toast.warning("Caso archivado provisionalmente y ciudadano notificado.");
                              setArchiveReason("");
                              setShowArchiveReasonInput(false);
                            }}
                          >
                            Confirmar Archivamiento
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-[10px] font-bold h-7 border-slate-200"
                            onClick={() => {
                              setShowArchiveReasonInput(false);
                              setArchiveReason("");
                            }}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2 w-full">
                        {isFiscal ? (
                          <>
                            <Button 
                              onClick={handleDeriveToCourt}
                              className="bg-indigo-650 hover:bg-indigo-755 text-white text-[10.5px] font-bold flex-grow rounded-lg py-4 shadow-sm"
                              size="sm"
                            >
                              <Scale className="mr-1.5 h-3.5 w-3.5" /> 
                              Derivar a Juzgado Penal
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              className="text-[10.5px] font-bold flex-grow rounded-lg py-4"
                              onClick={() => { 
                                setShowArchiveReasonInput(true);
                              }}
                            >
                              <Archive className="mr-1.5 h-3.5 w-3.5" /> 
                              Archivar Caso
                            </Button>
                          </>
                        ) : (
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="text-[10.5px] font-bold w-full rounded-lg py-4"
                            onClick={() => { 
                              setShowArchiveReasonInput(true);
                            }}
                          >
                            <Archive className="mr-1.5 h-3.5 w-3.5" /> 
                            Archivar Denuncia Provisionalmente
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Conversational transcript logs */}
              <Card className="border-slate-100 shadow-xs rounded-xl overflow-hidden bg-white flex flex-col h-[340px]">
                <CardHeader className="py-3 border-b border-slate-100 bg-slate-50/20 shrink-0">
                  <CardTitle className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className={`h-4 w-4 ${isFiscal ? "text-indigo-600" : "text-police-green"}`} />
                    Interrogatorio de Voz Transcrito (Evidencia IA)
                  </CardTitle>
                  <CardDescription className="text-[11px] text-muted-foreground mt-0.5">
                    Historial de la conversación en lenguaje natural entre el denunciante y el asistente LaIA.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-3.5 space-y-2.5 bg-slate-50/40">
                  {activeDenuncia.narradorChat && activeDenuncia.narradorChat.length > 0 ? (
                    activeDenuncia.narradorChat.map((m, i) => (
                      <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <span className="text-[8.5px] uppercase font-bold text-slate-400 mb-0.5">
                          {m.role === 'user' ? 'Ciudadano' : 'Asistente LaIA'}
                        </span>
                        <div className={`max-w-[85%] rounded-xl px-3 py-1.5 text-[11px] shadow-xs leading-normal ${
                          m.role === 'user' 
                            ? 'bg-primary text-primary-foreground rounded-tr-none font-medium' 
                            : 'bg-white border border-slate-150 text-slate-850 rounded-tl-none font-sans'
                        }`}>
                          {m.content}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex h-full items-center justify-center text-center text-[11px] text-slate-400 italic">
                      No hay transcripción de conversación por voz registrada para este expediente.
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>

          </div>
        </div>
      ) : null}

      {/* Audit Modular Block (Extremely Clean) */}
      <Card className="border-slate-100 shadow-xs rounded-xl overflow-hidden bg-white">
        <CardHeader className="py-3 border-b border-slate-100 bg-slate-50/20">
          <CardTitle className="text-xs font-bold text-slate-700">Auditoría del Modelo de Datos Modular (Hackathon Track)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 grid-cols-2 md:grid-cols-4 p-3.5">
          {[
            { t: "expedientes_en_lista", n: filteredDenuncias.length, c: "Denuncias bajo filtros de búsqueda" },
            { t: "adjuntos_evidencia", n: activeDenuncia?.evidencias.length || 0, c: "Archivos digitales en expediente activo" },
            { t: "estados_timeline", n: activeDenuncia?.timeline.length || 0, c: "Hitos y transiciones registradas" },
            { t: "notificaciones_bitacora", n: activeDenuncia?.mensajes.length || 0, c: "Mensajes y alertas enviados" },
          ].map((x) => (
            <div key={x.t} className="rounded-lg border bg-slate-50/30 p-2.5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-650 text-[10px] uppercase tracking-wider">{x.t}</span>
                <Badge variant="outline" className="font-bold text-[10px] bg-white border-slate-200">{x.n}</Badge>
              </div>
              <p className="mt-0.5 text-[9.5px] text-slate-400">{x.c}</p>
            </div>
          ))}
        </CardContent>
      </Card>

    </main>
  );
}

// Stats Card Component (Minimalist & Compact)
function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ComponentType<{ className?: string }>; 
  label: string; 
  value: string; 
  color: string;
}) {
  return (
    <Card className="border-slate-100 shadow-xs bg-white overflow-hidden rounded-xl">
      <CardContent className="flex items-center gap-3 p-3">
        <div className="grid h-8.5 w-8.5 place-items-center rounded-lg bg-slate-50 border border-slate-100 shrink-0">
          <Icon className={`h-4.5 w-4.5 ${color}`} />
        </div>
        <div>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none">{label}</p>
          <p className="text-base font-extrabold text-slate-800 tracking-tight mt-1 leading-none">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}