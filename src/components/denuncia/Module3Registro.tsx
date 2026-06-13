import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Image as ImageIcon, Video, AudioLines, FileText, MapPin, UserPlus, Trash2, ArrowRight, CheckCircle2 } from "lucide-react";
import { useDenuncia } from "@/lib/denuncia-store";
import { toast } from "sonner";

export function Module3Registro() {
  const { denuncia, updateDenuncia, addEvidencia, setActiveModule } = useDenuncia();
  const [tipo, setTipo] = useState("celular");
  const [dni, setDni] = useState(denuncia.dni);
  const [imei, setImei] = useState(denuncia.imei ?? "");
  const [placa, setPlaca] = useState(denuncia.placa ?? "");
  const [direccion, setDireccion] = useState(denuncia.ubicacion.direccion);
  const [marker, setMarker] = useState({ x: 50, y: 55 });
  const [testigos, setTestigos] = useState(denuncia.testigos);

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

          <section>
            <Label className="mb-2 block">Evidencias adjuntas</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { i: ImageIcon, l: "Foto", t: "foto" as const },
                { i: Video, l: "Video", t: "video" as const },
                { i: AudioLines, l: "Audio", t: "audio" as const },
                { i: FileText, l: "Doc.", t: "documento" as const },
              ].map((x) => (
                <Button key={x.l} variant="outline" className="h-auto flex-col gap-1 py-4" onClick={() => { addEvidencia({ tipo: x.t, nombre: `${x.l}_${Date.now()}` }); toast.success(`${x.l} adjuntada`); }}>
                  <x.i className="h-5 w-5 text-primary" />
                  <span className="text-xs">{x.l}</span>
                </Button>
              ))}
            </div>
            {denuncia.evidencias.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {denuncia.evidencias.map((e) => (
                  <Badge key={e.id} variant="secondary" className="gap-1">
                    <FileText className="h-3 w-3" /> {e.nombre}
                  </Badge>
                ))}
              </div>
            )}
          </section>

          <section>
            <Label className="mb-2 flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Ubicación del hecho</Label>
            <Input value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Dirección" />
            <div
              className="relative mt-2 h-56 cursor-crosshair overflow-hidden rounded-lg border bg-[linear-gradient(135deg,#dbeafe_0%,#e0f2fe_100%)]"
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
          <Button
            className="mt-4 w-full"
            disabled={!formOk}
            onClick={() => { updateDenuncia({ dni, imei, placa, ubicacion: { ...denuncia.ubicacion, direccion }, testigos: testigos.filter((t) => t.nombre) }); setActiveModule("confirmacion"); toast.success("Denuncia registrada"); }}
          >
            Confirmar y registrar <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
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