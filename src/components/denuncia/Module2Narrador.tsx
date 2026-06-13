import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Mic, Square, Sparkles, Image as ImageIcon, Video, AudioLines, ArrowRight, Loader2, AlertTriangle } from "lucide-react";
import { useDenuncia } from "@/lib/denuncia-store";
import { toast } from "sonner";

export function Module2Narrador() {
  const { updateDenuncia, setActiveModule, denuncia, addEvidencia } = useDenuncia();
  const [relato, setRelato] = useState("");
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [structured, setStructured] = useState("");
  const [agravantes, setAgravantes] = useState<string[]>([]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  const toggleRec = () => {
    if (!recording) {
      setRecording(true); setSeconds(0);
      timer.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else {
      setRecording(false);
      if (timer.current) clearInterval(timer.current);
      const sample = "Hoy en la noche en Lince dos tipos me asaltaron con un cuchillo y me quitaron el celular fue como a las nueve y media.";
      setRelato((r) => r ? r : sample);
      toast.success("Audio transcrito");
    }
  };

  const procesarIA = () => {
    if (!relato.trim()) { toast.error("Ingrese o grabe un relato"); return; }
    setProcessing(true);
    setTimeout(() => {
      const det: string[] = [];
      if (/noche|nocturn/i.test(relato)) det.push("Nocturnidad");
      if (/dos|tres|varios|tipos|sujetos/i.test(relato)) det.push("Pluralidad de agentes");
      if (/cuchillo|arma|pistola|navaja/i.test(relato)) det.push("Uso de arma");
      setAgravantes(det);
      setStructured(
        `El día de hoy, aproximadamente a las 21:30 hrs, en el distrito de Lince, dos (02) sujetos desconocidos, mediante amenaza con arma blanca, sustrajeron al denunciante un (01) teléfono celular. Hechos presuntamente tipificados en el Art. 189 del Código Penal (Hurto agravado).`,
      );
      setProcessing(false);
    }, 1400);
  };

  const continuar = () => {
    updateDenuncia({ relato, relatoEstructurado: structured || denuncia.relatoEstructurado, agravantes: agravantes.length ? agravantes : denuncia.agravantes });
    setActiveModule("registro");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <Badge className="w-fit bg-primary-soft text-primary-deep hover:bg-primary-soft">Módulo 2</Badge>
          <CardTitle className="text-xl text-primary-deep">Cuéntenos qué pasó</CardTitle>
          <p className="text-sm text-muted-foreground">Hable o escriba con sus propias palabras. La IA estructurará su relato.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed bg-secondary/50 p-6">
            <button
              onClick={toggleRec}
              className={`grid h-20 w-20 place-items-center rounded-full text-white transition ${recording ? "animate-pulse bg-destructive" : "bg-primary hover:bg-primary-deep"}`}
              aria-label="Grabar"
            >
              {recording ? <Square className="h-7 w-7" /> : <Mic className="h-8 w-8" />}
            </button>
            <p className="text-sm font-medium">
              {recording ? `Grabando… ${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}` : "Pulse para grabar su relato"}
            </p>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">O escriba aquí:</p>
            <Textarea rows={5} placeholder="Ej: Esta noche en Lince dos personas me robaron el celular con un cuchillo…" value={relato} onChange={(e) => setRelato(e.target.value)} />
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Adjunte evidencias rápidas:</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { i: ImageIcon, l: "Foto", t: "foto" as const },
                { i: Video, l: "Video", t: "video" as const },
                { i: AudioLines, l: "Audio", t: "audio" as const },
              ].map((x) => (
                <Button key={x.l} variant="outline" className="h-auto flex-col gap-1 py-3" onClick={() => { addEvidencia({ tipo: x.t, nombre: `${x.l.toLowerCase()}_${Date.now()}.${x.t === "foto" ? "jpg" : x.t === "video" ? "mp4" : "m4a"}` }); toast.success(`${x.l} adjuntada`); }}>
                  <x.i className="h-5 w-5 text-primary" />
                  <span className="text-xs">{x.l}</span>
                </Button>
              ))}
            </div>
          </div>

          <Button onClick={procesarIA} disabled={processing} className="w-full bg-police-green text-white hover:bg-police-green/90">
            {processing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando con IA…</> : <><Sparkles className="mr-2 h-4 w-4" /> Estructurar con IA</>}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-gradient-to-br from-white to-primary-soft/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-primary-deep">
            <Sparkles className="h-5 w-5 text-police-green" /> Declaración estructurada
          </CardTitle>
          <p className="text-sm text-muted-foreground">Versión clara y formal lista para validación.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="min-h-[140px] rounded-lg border bg-white p-4 text-sm leading-relaxed">
            {processing ? (
              <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> La IA está transformando su relato…</div>
            ) : structured ? (
              <p>{structured}</p>
            ) : (
              <p className="text-muted-foreground italic">Aquí aparecerá su relato estructurado…</p>
            )}
          </div>

          {agravantes.length > 0 && (
            <div className="rounded-lg border border-warning/30 bg-warning/10 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-warning-foreground">
                <AlertTriangle className="h-4 w-4" /> Sugerencias inteligentes (Art. 189 CP)
              </div>
              <p className="mb-2 text-xs text-muted-foreground">Se detectaron posibles agravantes en su relato:</p>
              <div className="flex flex-wrap gap-2">
                {agravantes.map((a) => <Badge key={a} variant="outline" className="border-warning text-warning-foreground">{a}</Badge>)}
              </div>
            </div>
          )}

          <Button onClick={continuar} disabled={!structured} className="w-full">
            Continuar al registro <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}