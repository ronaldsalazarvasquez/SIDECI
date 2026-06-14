import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Image as ImageIcon, Video, AudioLines, FileText, MapPin, UserPlus, Trash2, ArrowRight, CheckCircle2, UploadCloud, Printer, Fingerprint, Loader2, ShieldCheck, Smartphone, Check } from "lucide-react";
import { useDenuncia } from "@/lib/denuncia-store";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function Module3Registro() {
  const { denuncia, updateDenuncia, addEvidencia, setActiveModule } = useDenuncia();
  const [tipo, setTipo] = useState(denuncia.tipo || "celular");
  const [dni, setDni] = useState(denuncia.dni);
  const [imei, setImei] = useState(denuncia.imei ?? "");
  const [placa, setPlaca] = useState(denuncia.placa ?? "");
  const [direccion, setDireccion] = useState(denuncia.ubicacion.direccion);
  const [marker, setMarker] = useState({ x: 50, y: 55 });
  const [testigos, setTestigos] = useState(denuncia.testigos);
  const [narrativa, setNarrativa] = useState(denuncia.relatoEstructurado || "");
  const [showMap, setShowMap] = useState(false);
  const [declarationOk, setDeclarationOk] = useState(false);

  // RENIEC - ID Perú Biometric validation simulation states
  const [reniecValidated, setReniecValidated] = useState(denuncia.reniecValidado || false);
  const [isBiometricValidating, setIsBiometricValidating] = useState(false);
  const [biometricStep, setBiometricStep] = useState<"idle" | "connecting" | "scanning" | "verifying" | "completed">("idle");
  const [firmaDigitalCode, setFirmaDigitalCode] = useState(denuncia.firmaDigitalCode || "");


  // Sync if type changes reactively
  useEffect(() => {
    if (denuncia.tipo) {
      setTipo(denuncia.tipo);
    }
  }, [denuncia.tipo]);

  const startBiometricValidation = () => {
    setIsBiometricValidating(true);
    setBiometricStep("connecting");
    
    setTimeout(() => {
      setBiometricStep("scanning");
      setTimeout(() => {
        setBiometricStep("verifying");
        setTimeout(() => {
          const code = `FIRM-RENIEC-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
          setFirmaDigitalCode(code);
          setBiometricStep("completed");
          setReniecValidated(true);
          setIsBiometricValidating(false);
          toast.success("Autenticación biométrica exitosa con ID Perú - RENIEC");
        }, 1500);
      }, 2000);
    }, 1500);
  };

  const handlePrint = (elementId: string, title: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Por favor, permita las ventanas emergentes para imprimir");
      return;
    }
    
    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body {
              background-color: white !important;
              color: black !important;
              padding: 40px !important;
              font-family: Georgia, Cambria, "Times New Roman", Times, serif;
            }
            #${elementId} {
              border: double 4px #334155 !important;
              box-shadow: none !important;
              padding: 32px !important;
              margin: 0 auto !important;
              max-width: 800px !important;
            }
          </style>
        </head>
        <body>
          ${element.outerHTML}
        </body>
      </html>
    `);
    
    // Copy all style tags and stylesheets
    document.querySelectorAll('style, link[rel="stylesheet"]').forEach((style) => {
      printWindow.document.head.appendChild(style.cloneNode(true));
    });
    
    printWindow.document.close();
    
    // Trigger print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 350);
    };
  };


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    files.forEach((file) => {
      let tipo: "foto" | "video" | "audio" | "documento" = "documento";
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext && ["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) {
        tipo = "foto";
      } else if (ext && ["mp4", "mov", "avi", "mkv", "3gp"].includes(ext)) {
        tipo = "video";
      } else if (ext && ["mp3", "wav", "m4a", "ogg", "aac"].includes(ext)) {
        tipo = "audio";
      }

      const fileUrl = tipo === "foto" ? URL.createObjectURL(file) : undefined;

      addEvidencia({
        tipo,
        nombre: file.name,
        url: fileUrl
      });
      toast.success(`Evidencia subida: ${file.name}`);
    });
  };

  const dniOk = /^\d{8}$/.test(dni);
  const imeiOk = tipo !== "celular" || /^\d{15}$/.test(imei);
  const placaOk = tipo !== "vehiculo" || /^[A-Z0-9]{6,7}$/.test(placa.toUpperCase());
  const formOk = dniOk && imeiOk && placaOk && direccion.length > 5;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <Badge className="w-fit bg-primary-soft text-primary-deep hover:bg-primary-soft">Módulo 3</Badge>
          <CardTitle className="text-xl text-primary-deep">Registro guiado</CardTitle>
          <p className="text-sm text-muted-foreground">Complete los datos técnicos. Validamos en tiempo real.</p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Tipo de bien afectado</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="celular">Celular</SelectItem>
                  <SelectItem value="vehiculo">Vehículo</SelectItem>
                  <SelectItem value="objeto">Otro objeto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <ValidatedField label="DNI del denunciante" value={dni} onChange={setDni} ok={dniOk} hint="8 dígitos" />
            {tipo === "celular" && <ValidatedField label="IMEI del celular" value={imei} onChange={setImei} ok={imeiOk} hint="15 dígitos" />}
            {tipo === "vehiculo" && <ValidatedField label="Placa del vehículo" value={placa.toUpperCase()} onChange={(v) => setPlaca(v.toUpperCase())} ok={placaOk} hint="Ej. ABC-123" />}
          </div>

          <div className="space-y-2">
            <Label>Declaración de los hechos estructurada por IA (Revisión/Edición)</Label>
            <Textarea
              rows={6}
              value={narrativa}
              onChange={(e) => setNarrativa(e.target.value)}
              placeholder="La IA redactará tu relato estructurado aquí..."
              className="text-xs leading-relaxed font-mono bg-slate-50/50"
            />
            <p className="text-[10px] text-muted-foreground">
              Este texto formal fue compilado por el asistente de voz IA. Puedes modificarlo directamente si encuentras algún error o deseas añadir precisión antes de registrar.
            </p>
          </div>

          <section className="space-y-2.5">
            <Label className="block text-sm font-semibold text-primary-deep">Carga de Evidencias Digitales</Label>
            <div
              onClick={() => document.getElementById("file-upload-input-m3")?.click()}
              className="border border-dashed border-slate-200 rounded-lg p-3 text-center cursor-pointer hover:bg-slate-50 hover:border-primary/50 transition-all flex items-center justify-center gap-2 group"
            >
              <UploadCloud className="h-4.5 w-4.5 text-slate-400 group-hover:text-primary transition-colors" />
              <span className="text-xs font-semibold text-slate-700">Cargar fotos o evidencias digitales (Max 10MB)</span>
              <input
                id="file-upload-input-m3"
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* List of uploaded files with real image preview */}
            {denuncia.evidencias && denuncia.evidencias.length > 0 && (
              <div className="grid gap-2.5 grid-cols-2 sm:grid-cols-3 mt-1">
                {denuncia.evidencias.map((e) => (
                  <div key={e.id} className="relative flex flex-col border border-slate-200 rounded-lg p-1 bg-slate-50/50 hover:border-slate-300 transition-all text-xs group">
                    <div className="w-full h-14 bg-slate-100 border rounded flex items-center justify-center relative overflow-hidden select-none mb-1">
                      {e.tipo === "foto" ? (
                        e.url ? (
                          <img src={e.url} className="absolute inset-0 w-full h-full object-cover animate-fade-in" alt={e.nombre} />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 text-slate-500">
                            <ImageIcon className="h-4.5 w-4.5" />
                          </div>
                        )
                      ) : e.tipo === "video" ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 text-slate-500">
                          <Video className="h-4.5 w-4.5" />
                        </div>
                      ) : e.tipo === "audio" ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 text-slate-500">
                          <AudioLines className="h-4.5 w-4.5" />
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 text-slate-500">
                          <FileText className="h-4.5 w-4.5" />
                        </div>
                      )}

                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={(evt) => {
                          evt.stopPropagation();
                          updateDenuncia({
                            evidencias: denuncia.evidencias.filter((x) => x.id !== e.id)
                          });
                          toast.success("Evidencia eliminada");
                        }}
                        className="absolute top-1 right-1 h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-2.5 w-2.5 text-white" />
                      </Button>
                    </div>
                    <span className="truncate font-medium text-slate-700 text-[10px] px-0.5" title={e.nombre}>{e.nombre}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-2">
            <Label className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Ubicación del hecho</Label>
            <div className="flex gap-2">
              <Input
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Dirección o referencia exacta"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowMap(!showMap)}
                className={`text-xs h-10 border-slate-200 shrink-0 ${showMap ? "bg-slate-100 text-slate-800 font-semibold" : ""}`}
              >
                <MapPin className="mr-1 h-3.5 w-3.5 text-primary" />
                {showMap ? "Ocultar Mapa" : "Ver Mapa"}
              </Button>
            </div>
            {showMap && (
              <div
                className="relative h-44 cursor-crosshair overflow-hidden rounded-lg border bg-[linear-gradient(135deg,#dbeafe_0%,#e0f2fe_100%)] animate-fade-in"
                onClick={(e) => {
                  const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  setMarker({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
                }}
              >
                <svg className="absolute inset-0 h-full w-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <g key={i}>
                      <line x1={i * 10} y1="0" x2={i * 10} y2="100" stroke="#1e40af" strokeWidth="0.2" />
                      <line x1="0" y1={i * 10} x2="100" y2={i * 10} stroke="#1e40af" strokeWidth="0.2" />
                    </g>
                  ))}
                </svg>
                <div className="pointer-events-none absolute" style={{ left: `${marker.x}%`, top: `${marker.y}%`, transform: "translate(-50%, -100%)" }}>
                  <MapPin className="h-8 w-8 fill-destructive text-destructive drop-shadow" />
                </div>
                <div className="pointer-events-none absolute bottom-2 left-2 rounded bg-white/90 px-2 py-1 text-xs">Click para marcar el punto exacto</div>
              </div>
            )}
          </section>

          <section>
            <div className="mb-2 flex items-center justify-between">
              <Label>Testigos (opcional)</Label>
              <Button size="sm" variant="ghost" onClick={() => setTestigos([...testigos, { nombre: "", contacto: "" }])}>
                <UserPlus className="mr-1 h-4 w-4" /> Agregar
              </Button>
            </div>
            <div className="space-y-2">
              {testigos.map((t, i) => (
                <div key={i} className="flex gap-2">
                  <Input placeholder="Nombre completo" value={t.nombre} onChange={(e) => setTestigos(testigos.map((x, j) => j === i ? { ...x, nombre: e.target.value } : x))} />
                  <Input placeholder="Contacto" value={t.contacto} onChange={(e) => setTestigos(testigos.map((x, j) => j === i ? { ...x, contacto: e.target.value } : x))} />
                  <Button size="icon" variant="ghost" onClick={() => setTestigos(testigos.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              ))}
              {testigos.length === 0 && <p className="text-xs text-muted-foreground">Sin testigos registrados.</p>}
            </div>
          </section>
        </CardContent>
      </Card>

      <Card className="h-fit">
        <CardHeader><CardTitle className="text-base">Resumen</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <Row label="Tipo" v={tipo} />
          <Row label="DNI" v={dni || "—"} ok={dniOk} />
          {tipo === "celular" && <Row label="IMEI" v={imei || "—"} ok={imeiOk} />}
          {tipo === "vehiculo" && <Row label="Placa" v={placa || "—"} ok={placaOk} />}
          <Row label="Ubicación" v={direccion} />
          <Row label="Evidencias" v={`${denuncia.evidencias.length}`} />
          <Row label="Testigos" v={`${testigos.length}`} />
          <div className="pt-3 space-y-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full flex items-center justify-center gap-1.5 text-xs h-9 border-police-green text-police-green hover:bg-police-green-soft">
                  <FileText className="h-4 w-4" /> Vista Previa de Acta (PDF)
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-100 p-6">
                <div className="flex justify-between items-center mb-4 shrink-0">
                  <h3 className="font-bold text-slate-800 text-lg">Borrador de Acta Policial (Vista Previa)</h3>
                  <Button size="sm" onClick={() => handlePrint("acta-policial-preview", "Borrador de Acta Policial (Vista Previa)")} className="bg-primary text-white hover:bg-primary-deep">
                    <Printer className="mr-1.5 h-4 w-4" /> Imprimir / Guardar PDF
                  </Button>
                </div>

                {/* Printable Document Sheet */}
                <div className="w-full overflow-x-auto py-2">
                  <div id="acta-policial-preview" className="bg-white border shadow-md p-4 sm:p-8 font-serif text-slate-900 mx-auto text-xs leading-relaxed max-w-[800px] min-w-[620px] sm:min-w-0 border-double border-4 border-slate-700">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b pb-4 mb-6">
                    <div className="text-left font-bold uppercase tracking-wider text-[8px] leading-tight">
                      <p>Ministerio del Interior</p>
                      <p>Policía Nacional del Perú</p>
                      <p>Región Policial Lima</p>
                      <p className="text-slate-500">División de Denuncias Digitales</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <svg viewBox="0 0 100 100" className="h-10 w-10 text-slate-700">
                        <path d="M50 5 L85 20 V50 C85 75 50 95 50 95 C50 95 15 75 15 50 V20 L50 5 Z" fill="none" stroke="currentColor" strokeWidth="3" />
                        <path d="M50 15 L75 27 V50 C75 68 50 83 50 83 C50 83 25 68 25 50 V27 L50 15 Z" fill="currentColor" opacity="0.2" />
                        <circle cx="50" cy="50" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M50 35 V65 M35 50 H65" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                      <span className="text-[7px] font-sans font-bold text-slate-600 mt-1">PATRIA - LEY - HONOR</span>
                    </div>
                    <div className="text-right font-mono text-[9px] leading-tight">
                      <p className="font-bold">EXPEDIENTE N°:</p>
                      <p className="text-sm font-bold text-primary-deep">{denuncia.expediente} (BORRADOR)</p>
                      <p className="text-slate-400 mt-0.5">SISTEMA SIDECI-DIGITAL</p>
                    </div>
                  </div>

                  <div className="text-center mb-6">
                    <h2 className="text-sm font-bold underline uppercase tracking-widest">
                      BORRADOR DE CERTIFICADO DE DENUNCIA DIGITAL
                    </h2>
                    <p className="text-[9px] text-slate-600 font-sans mt-0.5">
                      Vista previa del acta redactada por IA - Edición en curso
                    </p>
                  </div>

                  {/* Body Content */}
                  <div className="space-y-4">
                    {/* Seccion 1 */}
                    <div>
                      <h3 className="font-bold uppercase border-b pb-0.5 mb-1.5 text-[9px]">I. DATOS DE LA EMISIÓN Y REGISTRO</h3>
                      <table className="w-full text-left">
                        <tbody>
                          <tr>
                            <td className="w-1/4 font-bold py-1">Fecha de Registro:</td>
                            <td className="py-1">{new Date().toLocaleDateString("es-PE")} a las {new Date().toLocaleTimeString("es-PE")}</td>
                            <td className="w-1/4 font-bold py-1">Código de Firma:</td>
                            <td className="py-1 font-mono text-[10px] text-police-green font-bold">
                              {reniecValidated ? firmaDigitalCode : "PENDIENTE DE FIRMA BIOMÉTRICA"}
                            </td>
                          </tr>
                          <tr>
                            <td className="font-bold py-1">Estado de Denuncia:</td>
                            <td className="py-1">
                              <span className={`font-bold ${reniecValidated ? "text-police-green" : "text-amber-600"}`}>
                                {reniecValidated ? "BORRADOR AUTENTICADO Y FIRMADO" : "EN EDICIÓN CIUDADANA"}
                              </span>
                            </td>
                            <td className="font-bold py-1">Validez:</td>
                            <td className="py-1">
                              {reniecValidated ? "Firma verificada mediante ID Perú - RENIEC" : "Requiere validación biométrica ID Perú"}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Seccion 2 */}
                    <div>
                      <h3 className="font-bold uppercase border-b pb-0.5 mb-1.5 text-[9px]">II. DATOS DEL DENUNCIANTE</h3>
                      <table className="w-full text-left">
                        <tbody>
                          <tr>
                            <td className="w-1/4 font-bold py-1">Documento Nacional (DNI):</td>
                            <td className="py-1 font-mono">{dni || "—"}</td>
                            <td className="w-1/4 font-bold py-1">Nacionalidad:</td>
                            <td className="py-1">Peruana</td>
                          </tr>
                          <tr>
                            <td className="font-bold py-1">Condición:</td>
                            <td className="py-1">Víctima / Agraviado</td>
                            <td className="font-bold py-1">Domicilio Legal:</td>
                            <td className="py-1">Lima Metropolitana, Perú</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Seccion 3 */}
                    <div>
                      <h3 className="font-bold uppercase border-b pb-0.5 mb-1.5 text-[9px]">III. HECHO DE DELITO CONTRA EL PATRIMONIO</h3>
                      <table className="w-full text-left">
                        <tbody>
                          <tr>
                            <td className="w-1/4 font-bold py-1">Presunto Delito:</td>
                            <td className="py-1 font-bold text-slate-800 uppercase">
                              {denuncia.agravantes && denuncia.agravantes.length > 0 ? "Robo Agravado" : "Hurto Simple"}
                            </td>
                            <td className="w-1/4 font-bold py-1">Base Legal:</td>
                            <td className="py-1 font-sans">
                              {denuncia.agravantes && denuncia.agravantes.length > 0 ? "Artículo 189 del Código Penal" : "Artículo 185 del Código Penal"}
                            </td>
                          </tr>
                          <tr>
                            <td className="font-bold py-1">Bien Afectado:</td>
                            <td className="py-1 capitalize">{tipo}</td>
                            <td className="font-bold py-1">Identificador Técnico:</td>
                            <td className="py-1 font-mono">
                              {tipo === "celular" ? `IMEI: ${imei}` : tipo === "vehiculo" ? `Placa: ${placa}` : "No Aplica"}
                            </td>
                          </tr>
                          <tr>
                            <td className="font-bold py-1">Ubicación del Hecho:</td>
                            <td className="py-1" colSpan={3}>{direccion || "—"}</td>
                          </tr>
                          <tr>
                            <td className="font-bold py-1">Fecha/Hora del Hecho:</td>
                            <td className="py-1" colSpan={3}>{denuncia.fechaHecho || "—"}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Seccion 4 */}
                    <div>
                      <h3 className="font-bold uppercase border-b pb-0.5 mb-1.5 text-[9px]">IV. CIRCUNSTANCIAS DE LOS HECHOS (DECLARACIÓN FORMAL EN REVISIÓN)</h3>
                      <div className="bg-slate-50 border p-3 rounded text-[11px] leading-relaxed italic whitespace-pre-wrap font-sans text-slate-800">
                        {narrativa || "—"}
                      </div>
                    </div>

                    {/* Seccion 5 */}
                    {denuncia.agravantes && denuncia.agravantes.length > 0 && (
                      <div>
                        <h3 className="font-bold uppercase border-b pb-0.5 mb-1.5 text-[9px]">V. CIRCUNSTANCIAS AGRAVANTES ESPECIFICADAS</h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {denuncia.agravantes.map((a) => (
                            <span key={a} className="bg-slate-100 border text-slate-800 px-2 py-0.5 rounded text-[9px] font-sans font-bold">
                              • {a}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Seccion 6 */}
                    {((testigos && testigos.length > 0) || (denuncia.evidencias && denuncia.evidencias.length > 0)) && (
                      <div>
                        <h3 className="font-bold uppercase border-b pb-0.5 mb-1.5 text-[9px]">VI. TESTIGOS Y EVIDENCIAS</h3>
                        <table className="w-full text-left">
                          <tbody>
                            {testigos && testigos.length > 0 && (
                              <tr className="border-b border-slate-100">
                                <td className="w-1/4 font-bold py-2 align-top">Testigos:</td>
                                <td className="py-2" colSpan={3}>
                                  {testigos.map((t, idx) => (
                                    <div key={idx} className="font-sans text-[10px] text-slate-700">• {t.nombre} ({t.contacto})</div>
                                  ))}
                                </td>
                              </tr>
                            )}
                            {denuncia.evidencias && denuncia.evidencias.length > 0 && (
                              <tr>
                                <td className="w-1/4 font-bold py-2 align-top">Archivos Adjuntos:</td>
                                <td className="py-2 animate-fade-in" colSpan={3}>
                                  <div className="grid grid-cols-2 gap-3 mt-1.5">
                                    {denuncia.evidencias.map((e) => (
                                      <div key={e.id} className="flex flex-col border border-slate-200 rounded p-2 bg-slate-50/50 max-w-[280px] shadow-sm hover:border-slate-300 transition-all">
                                        {/* Mock Thumbnail Preview */}
                                        <div className="w-full h-20 bg-slate-100 border rounded mb-1 flex items-center justify-center relative overflow-hidden select-none">
                                          {e.tipo === "foto" ? (
                                            e.url ? (
                                              <img src={e.url} className="absolute inset-0 w-full h-full object-cover" alt={e.nombre} />
                                            ) : (
                                              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 text-slate-500">
                                                <ImageIcon className="h-7 w-7 text-slate-400 mb-0.5" />
                                                <span className="text-[7px] text-slate-500 font-sans font-bold tracking-wider uppercase">EVIDENCIA FOTOGRÁFICA</span>
                                                <span className="absolute bottom-1 right-1 text-[5px] bg-slate-700 text-white font-mono px-1 rounded">IMAGEN</span>
                                              </div>
                                            )
                                          ) : e.tipo === "video" ? (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 text-slate-500">
                                              <Video className="h-7 w-7 text-slate-400 mb-0.5" />
                                              <span className="text-[7px] text-slate-500 font-sans font-bold tracking-wider uppercase">REGISTRO DE VIDEO</span>
                                              <span className="absolute bottom-1 right-1 text-[5px] bg-slate-700 text-white font-mono px-1 rounded font-semibold">MULTIMEDIA</span>
                                            </div>
                                          ) : e.tipo === "audio" ? (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 text-slate-500">
                                              <AudioLines className="h-7 w-7 text-slate-400 mb-0.5" />
                                              <div className="flex items-center gap-0.5 h-2.5 mt-0.5">
                                                <div className="w-0.5 bg-slate-400 h-1.5 rounded-full" />
                                                <div className="w-0.5 bg-slate-400 h-2.5 rounded-full" />
                                                <div className="w-0.5 bg-slate-400 h-1 rounded-full" />
                                                <div className="w-0.5 bg-slate-400 h-2 rounded-full" />
                                                <div className="w-0.5 bg-slate-400 h-3 rounded-full animate-bounce" />
                                              </div>
                                              <span className="absolute bottom-1 right-1 text-[5px] bg-slate-700 text-white font-mono px-1 rounded">GRABACIÓN</span>
                                            </div>
                                          ) : (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 text-slate-500">
                                              <FileText className="h-7 w-7 text-slate-400 mb-0.5" />
                                              <span className="text-[7px] text-slate-500 font-sans font-bold tracking-wider uppercase">CONSTANCIA DIGITAL</span>
                                              <span className="absolute bottom-1 right-1 text-[5px] bg-slate-700 text-white font-mono px-1 rounded">DOCUMENTO</span>
                                            </div>
                                          )}
                                          <div className="absolute top-1 left-1 border border-police-green/30 bg-police-green-soft/50 text-police-green text-[5px] font-sans font-bold px-1 rounded">
                                            PNP EVIDENCIA
                                          </div>
                                        </div>
                                        <div className="text-[9px] font-sans truncate text-slate-700 font-semibold leading-tight">{e.nombre}</div>
                                        <div className="text-[6px] font-mono text-slate-400 mt-0.5 flex justify-between uppercase">
                                          <span>Código: {e.id.substring(0, 8)}</span>
                                          <span className="text-police-green font-bold">INTEGRIDAD: OK</span>
                                        </div>
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

                    {/* Seals and signatures */}
                    <div className="pt-10 mt-8 grid grid-cols-2 text-center text-[9px] border-t">
                      <div className="flex flex-col items-center">
                        {reniecValidated ? (
                          <>
                            <div className="border border-police-green bg-police-green-soft/30 text-police-green px-2.5 py-0.5 rounded text-[8px] font-mono mb-1 inline-block uppercase font-bold">
                              ✔ FIRMADO CON ID PERÚ
                            </div>
                            <p className="font-bold">CIUDADANO DENUNCIANTE</p>
                            <p className="text-slate-500 font-semibold">DNI: {dni || "—"}</p>
                            <p className="text-slate-400 text-[6px] leading-tight">Autenticado Biométricamente - RENIEC</p>
                          </>
                        ) : (
                          <>
                            <div className="w-24 h-0.5 bg-slate-400 mb-1" />
                            <p className="font-bold">CIUDADANO DENUNCIANTE</p>
                            <p className="text-slate-500">DNI: {dni || "—"}</p>
                            <p className="text-slate-400 text-[7px] leading-tight">Firma y huella digital en línea (Ley N° 29733)</p>
                          </>
                        )}
                      </div>
                      <div className="flex flex-col items-center font-mono text-slate-700">
                        <div className={`border ${reniecValidated ? "border-police-green text-police-green" : "border-slate-600 text-slate-700"} px-2.5 py-0.5 rounded text-[7px] mb-1 inline-block uppercase leading-tight bg-slate-50/50`}>
                          <p className="font-bold text-[8px]">SIDECI DIGITAL</p>
                          <p>{reniecValidated ? "AUTENTICACIÓN RENIEC" : "PREVIO DE DOCUMENTO"}</p>
                          <p className="font-bold">PNP - PERÚ</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
            </Dialog>

            {/* Sworn Declaration Checkbox */}
            <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50/40 p-3.5 text-xs text-amber-900 shadow-sm">
              <Checkbox
                id="declaration"
                checked={declarationOk}
                onCheckedChange={(v) => setDeclarationOk(!!v)}
                className="mt-0.5 border-amber-400 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
              />
              <label htmlFor="declaration" className="cursor-pointer leading-relaxed select-none">
                <strong>Declaración Jurada de Veracidad:</strong> Declaro bajo juramento que los hechos expuestos son verídicos, asumiendo la responsabilidad legal conforme al Art. 411 del Código Penal (Falsa declaración en procedimiento administrativo) y la Ley N° 32332.
              </label>
            </div>

            {/* Biometric Validation ID Perú - RENIEC */}
            {formOk && declarationOk && (
              <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 space-y-3 shadow-inner">
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-1.5 font-semibold text-primary-deep text-xs uppercase tracking-wider">
                    <ShieldCheck className="h-4 w-4 text-police-green" /> Firma Digital ID Perú
                  </div>
                  <Badge variant="outline" className="text-[9px] bg-white text-slate-500 border-slate-300">RENIEC</Badge>
                </div>

                {!reniecValidated ? (
                  <div className="space-y-3">
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      Para dar plena validez legal a su acta y firmar digitalmente, valide su identidad mediante el app oficial **ID Perú** utilizando biometría facial en su teléfono celular.
                    </p>
                    
                    {isBiometricValidating ? (
                      <div className="rounded border border-primary/10 bg-primary-soft/20 p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-primary-deep" />
                          <span className="text-xs font-medium text-primary-deep">
                            {biometricStep === "connecting" && "Conectando con plataforma ID Perú..."}
                            {biometricStep === "scanning" && "Esperando validación facial en el móvil..."}
                            {biometricStep === "verifying" && "Verificando biometría en RENIEC..."}
                          </span>
                        </div>
                        <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary-deep transition-all duration-1000"
                            style={{ 
                              width: biometricStep === "connecting" ? "30%" : biometricStep === "scanning" ? "70%" : "95%" 
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2.5">
                        <div className="flex items-center gap-3 bg-white p-2.5 border rounded-lg shadow-sm">
                          <img 
                            src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https%3A%2F%2Fwww.gob.pe%2Freniec" 
                            alt="Código QR de ID Perú"
                            className="h-12 w-12 border rounded p-0.5 bg-white shadow-xs shrink-0 select-none"
                          />
                          <div className="text-[10px] leading-snug">
                            <span className="font-bold text-slate-700 block">Vincular dispositivo móvil</span>
                            <span className="text-slate-500">Escanee este código con el aplicativo ID Perú - RENIEC o pulse el botón inferior.</span>
                          </div>
                        </div>
                        <Button 
                          type="button" 
                          onClick={startBiometricValidation}
                          className="w-full text-xs h-9 bg-police-green text-white hover:bg-police-green/90"
                        >
                          <Fingerprint className="mr-1.5 h-4 w-4" /> Validar con App ID Perú - RENIEC
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded border border-success/30 bg-success-soft/20 p-3 space-y-2 animate-fade-in">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-success">
                      <CheckCircle2 className="h-4.5 w-4.5" /> AUTENTICACIÓN EXITOSA - RENIEC
                    </div>
                    <div className="font-sans text-[10px] text-slate-700 space-y-1">
                      <div><span className="font-semibold">Plataforma:</span> ID Perú - RENIEC</div>
                      <div><span className="font-semibold">Validación:</span> Biometría DNI {dni} (Rostro OK)</div>
                      <div><span className="font-semibold">Firma Digital:</span> <span className="font-mono">{firmaDigitalCode}</span></div>
                    </div>
                    <p className="text-[9px] text-success/80 italic">Acta firmada digitalmente con plena autenticidad.</p>
                  </div>
                )}
              </div>
            )}

            <Button
              className="w-full"
              disabled={!formOk || !declarationOk || !reniecValidated}
              onClick={() => {
                updateDenuncia({
                  tipo,
                  dni,
                  imei: tipo === "celular" ? imei : "",
                  placa: tipo === "vehiculo" ? placa : "",
                  relatoEstructurado: narrativa,
                  ubicacion: { ...denuncia.ubicacion, direccion },
                  testigos: testigos.filter((t) => t.nombre),
                  reniecValidado: true,
                  firmaDigitalCode: firmaDigitalCode,
                  estadoActa: "firmado"
                });
                setActiveModule("confirmacion");
                toast.success("Denuncia firmada y registrada correctamente");
              }}
            >
              Firmar y Registrar Denuncia <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ValidatedField({ label, value, onChange, ok, hint }: { label: string; value: string; onChange: (v: string) => void; ok: boolean; hint: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="relative">
        <Input value={value} onChange={(e) => onChange(e.target.value)} className={value ? (ok ? "border-success pr-9" : "border-destructive pr-9") : ""} />
        {value && ok && <CheckCircle2 className="absolute right-2 top-2.5 h-5 w-5 text-success" />}
      </div>
      <p className={`mt-1 text-xs ${value && !ok ? "text-destructive" : "text-muted-foreground"}`}>{value && !ok ? `Formato inválido (${hint})` : hint}</p>
    </div>
  );
}

function Row({ label, v, ok }: { label: string; v: string; ok?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b py-1.5 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className={`truncate font-medium ${ok === false ? "text-destructive" : ""}`}>{v}</span>
    </div>
  );
}