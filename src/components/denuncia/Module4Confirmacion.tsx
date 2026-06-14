import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Download, Share2, FileText, ArrowRight, Printer, Image as ImageIcon, Video, AudioLines } from "lucide-react";
import { useDenuncia } from "@/lib/denuncia-store";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function Module4Confirmacion() {
  const { denuncia, setActiveModule } = useDenuncia();

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

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}${window.location.pathname}?expediente=${denuncia.expediente}`
    : "";

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-police-green/40">
        <div className="bg-gradient-to-r from-police-green to-primary-deep px-6 py-8 text-white">
          <div className="flex flex-col items-center text-center">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-white/20 ring-8 ring-white/10">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <h2 className="mt-4 text-2xl font-bold">¡Denuncia registrada con éxito!</h2>
            <p className="mt-1 text-sm text-white/90">Evidencia inmediata para el ciudadano · Validez legal SIDECI</p>
          </div>
        </div>
        <CardContent className="space-y-5 p-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">N° de Expediente</p>
            <p className="font-mono text-3xl font-bold text-primary-deep sm:text-4xl">N° {denuncia.expediente}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-[1fr_auto] items-stretch">
            <Card className="border-primary/20 bg-primary-soft/30 flex-grow">
              <CardContent className="space-y-2 p-4 text-sm h-full flex flex-col justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2 font-semibold text-primary-deep">
                    <FileText className="h-4 w-4" /> Ficha técnica
                  </div>
                  <Field k="Tipo" v={denuncia.tipo} />
                  <Field k="Denunciante (DNI)" v={denuncia.dni} />
                  <Field k="Lugar" v={denuncia.ubicacion.direccion} />
                  <Field k="Fecha del hecho" v={denuncia.fechaHecho} />
                  <Field k="Evidencias" v={`${denuncia.evidencias.length} archivos`} />
                  <Field k="Agravantes detectados" v={denuncia.agravantes.join(", ") || "—"} />
                  <Field k="Firma Digital" v={denuncia.firmaDigitalCode || "FIRM-DIG-PNP-" + denuncia.expediente} />
                  <Field k="Validación Biométrica" v={denuncia.reniecValidado ? "Autenticado (RENIEC - ID Perú)" : "Verificación Local"} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-xs p-5 flex flex-col items-center justify-center gap-2.5 w-full md:w-56 shrink-0 rounded-xl">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`}
                alt="Código QR del expediente"
                className="h-32 w-32 rounded-lg border bg-white p-1.5 shadow-sm"
              />
              <Badge variant="outline" className="border-police-green text-police-green text-[10px] uppercase font-bold tracking-wider">Código QR Oficial</Badge>
              <p className="max-w-[11rem] text-center text-[10px] text-muted-foreground leading-normal">
                Escanee este código para verificar la autenticidad del acta policial.
              </p>
            </Card>
          </div>

          <div className="flex flex-wrap gap-2.5 pt-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-police-green text-white hover:bg-police-green/90">
                    <FileText className="mr-2 h-4 w-4" /> Ver Acta Oficial (PDF / Imprimir)
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-100 p-6">
                  <div className="flex justify-between items-center mb-4 shrink-0">
                    <h3 className="font-bold text-slate-800 text-lg">Acta de Denuncia Policial SIDECI</h3>
                    <Button size="sm" onClick={() => handlePrint("acta-policial-documento", "Acta de Denuncia Policial SIDECI")} className="bg-primary text-white hover:bg-primary-deep">
                      <Printer className="mr-1.5 h-4 w-4" /> Imprimir / Guardar PDF
                    </Button>
                  </div>
                  
                  {/* Printable Document Sheet */}
                  <div className="w-full overflow-x-auto py-2">
                    <div id="acta-policial-documento" className="bg-white border shadow-md p-4 sm:p-8 font-serif text-slate-900 mx-auto text-xs leading-relaxed max-w-[800px] min-w-[620px] sm:min-w-0 border-double border-4 border-slate-700">
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
                        <p className="text-sm font-bold text-primary-deep">{denuncia.expediente}</p>
                        <p className="text-slate-400 mt-0.5">SISTEMA SIDECI-DIGITAL</p>
                      </div>
                    </div>

                    <div className="text-center mb-6">
                      <h2 className="text-sm font-bold underline uppercase tracking-widest">
                        CERTIFICADO DE REGISTRO DE DENUNCIA POLICIAL DIGITAL
                      </h2>
                      <p className="text-[9px] text-slate-600 font-sans mt-0.5">
                        Emitido de conformidad con la Ley N° 32332 - Registro de Denuncias por Delitos contra el Patrimonio
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
                                {denuncia.firmaDigitalCode || `FIRM-DIG-PNP-${denuncia.expediente}`}
                              </td>
                            </tr>
                            <tr>
                              <td className="font-bold py-1">Estado de Denuncia:</td>
                              <td className="py-1">
                                <span className="font-bold text-police-green">
                                  {denuncia.reniecValidado ? "ACTA OFICIAL FIRMADA DIGITALMENTE" : "REGISTRADA EN SIDECI"}
                                </span>
                              </td>
                              <td className="font-bold py-1">Validez:</td>
                              <td className="py-1">
                                {denuncia.reniecValidado ? "Verificación Biométrica ID Perú (RENIEC) - Plena Validez Legal" : "Verificación por Código QR o Web PNP"}
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
                              <td className="py-1 font-mono">{denuncia.dni}</td>
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
                              <td className="py-1 capitalize">{denuncia.tipo}</td>
                              <td className="font-bold py-1">Identificador Técnico:</td>
                              <td className="py-1 font-mono">
                                {denuncia.tipo === "celular" ? `IMEI: ${denuncia.imei}` : denuncia.tipo === "vehiculo" ? `Placa: ${denuncia.placa}` : "No Aplica"}
                              </td>
                            </tr>
                            <tr>
                              <td className="font-bold py-1">Ubicación del Hecho:</td>
                              <td className="py-1" colSpan={3}>{denuncia.ubicacion?.direccion || "—"}</td>
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
                        <h3 className="font-bold uppercase border-b pb-0.5 mb-1.5 text-[9px]">IV. CIRCUNSTANCIAS DE LOS HECHOS (DECLARACIÓN FORMAL DE VOZ EXTRAÍDA POR IA)</h3>
                        <div className="bg-slate-50 border p-3 rounded text-[11px] leading-relaxed italic whitespace-pre-wrap font-sans text-slate-800">
                          {denuncia.relatoEstructurado || "—"}
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
                          <p className="text-[8px] text-slate-500 mt-1 leading-snug">
                            Nota legal: Las circunstancias descritas encuadran preliminarmente en el tipo penal agravado, lo cual da inicio a la investigación fiscal de forma prioritaria.
                          </p>
                        </div>
                      )}

                      {/* Seccion 6 */}
                      {((denuncia.testigos && denuncia.testigos.length > 0) || (denuncia.evidencias && denuncia.evidencias.length > 0)) && (
                        <div>
                          <h3 className="font-bold uppercase border-b pb-0.5 mb-1.5 text-[9px]">VI. TESTIGOS Y EVIDENCIAS REGISTRADAS</h3>
                          <table className="w-full text-left">
                            <tbody>
                              {denuncia.testigos && denuncia.testigos.length > 0 && (
                                <tr className="border-b border-slate-100">
                                  <td className="w-1/4 font-bold py-2 align-top">Testigos:</td>
                                  <td className="py-2" colSpan={3}>
                                    {denuncia.testigos.map((t, idx) => (
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
                      <div className="pt-10 mt-8 grid grid-cols-3 text-center text-[9px] border-t items-center">
                        <div className="flex flex-col items-center">
                          {denuncia.reniecValidado ? (
                            <>
                              <div className="border border-police-green bg-police-green-soft/30 text-police-green px-2.5 py-0.5 rounded text-[8px] font-mono mb-1 inline-block uppercase font-bold">
                                ✔ FIRMADO CON ID PERÚ
                              </div>
                              <p className="font-bold">CIUDADANO DENUNCIANTE</p>
                              <p className="text-slate-500 font-semibold">DNI: {denuncia.dni}</p>
                              <p className="text-[6px] text-slate-400">Autenticado Biométricamente - RENIEC</p>
                            </>
                          ) : (
                            <>
                              <div className="w-24 h-0.5 bg-slate-400 mb-1" />
                              <p className="font-bold">CIUDADANO DENUNCIANTE</p>
                              <p className="text-slate-500">DNI: {denuncia.dni}</p>
                              <p className="text-slate-400 text-[7px] leading-tight">Firma y huella digital en línea (Ley N° 29733)</p>
                            </>
                          )}
                        </div>
                        <div className="flex flex-col items-center">
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(shareUrl)}`} 
                            alt="Código QR de verificación"
                            className="h-16 w-16 border p-0.5 bg-white shadow-sm" 
                          />
                          <p className="text-[6px] font-sans font-bold text-slate-500 mt-1 uppercase tracking-wider">Escanear para Validar</p>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className={`border ${denuncia.reniecValidado ? "border-police-green text-police-green" : "border-slate-600 text-slate-700"} px-2.5 py-0.5 rounded text-[7px] font-mono mb-1 inline-block uppercase leading-tight bg-slate-50/50`}>
                            <p className="font-bold text-[8px]">SISTEMA DIGITAL SIDECI</p>
                            <p>{denuncia.reniecValidado ? "FIRMA BIOMÉTRICA RENIEC" : "FIRMADO DIGITALMENTE"}</p>
                            <p className="font-bold">PNP - PERÚ</p>
                          </div>
                          <p className="font-bold">MINISTERIO DEL INTERIOR</p>
                          <p className="text-slate-500">Plataforma Denuncia Digital PNP</p>
                        </div>
                      </div>
                  </div>
                </div>
              </div>
            </DialogContent>
              </Dialog>
              <Button variant="outline" onClick={() => {
                navigator.clipboard.writeText(shareUrl);
                toast.success("Enlace de seguimiento copiado al portapapeles");
              }}>
                <Share2 className="mr-2 h-4 w-4" /> Compartir Enlace
              </Button>
              <Button variant="ghost" onClick={() => setActiveModule("seguimiento")}>
                Ver seguimiento <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
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