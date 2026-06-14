import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useDenuncia } from "@/lib/denuncia-store";
import {
  Smartphone,
  Car,
  Home,
  ShieldAlert,
  ArrowRight,
  Play,
  ShieldCheck,
  FileText,
  Search,
  MessageSquare,
  BookOpen,
  Scale,
  Clock
} from "lucide-react";
import { toast } from "sonner";

const videos = [
  {
    id: "NaCuGaTZUHg",
    title: "Denuncia Policial Digital: Guía Paso a Paso",
    description: "Conoce el procedimiento oficial para registrar denuncias de forma digital en el Perú, su validez y cómo agilizar el trámite en comisaría."
  },
  {
    id: "pkHIqOZbeEs",
    title: "Derechos Ciudadanos y Garantías PNP",
    description: "Aprende cuáles son tus derechos durante una intervención policial, detención o auxilio ante un asalto y hurto."
  },
  {
    id: "sdW08XLH5kA",
    title: "Transparencia y lucha contra la corrupción policial",
    description: "Cómo la trazabilidad digital del expediente impide cajoneos o archivamientos indebidos en las investigaciones."
  },
  {
    id: "HY8ay0wueSM",
    title: "Asesoría Legal y Orientación al Denunciante",
    description: "Requisitos legales, cómo adjuntar evidencias y el soporte continuo de la PNP durante todo el desarrollo de tu caso."
  }
];

export function Module1Preparacion() {
  const { setActiveModule, setPrepared, updateDenuncia, denuncia } = useDenuncia();
  const [tipo, setTipo] = useState<string>("celular");
  const [activeVideoIdx, setActiveVideoIdx] = useState(0);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const handleStartDenuncia = () => {
    const labelMap: Record<string, string> = {
      celular: "Robo / hurto de celular",
      vehiculo: "Robo de vehículo",
      vivienda: "Robo en vivienda / local",
      otro: "Otro tipo de incidente"
    };
    const label = labelMap[tipo] || "incidente";

    // Initialize chat with personalized greeting
    updateDenuncia({
      tipo: label,
      narradorChat: [
        {
          role: "assistant",
          content: `Hola. Soy el asistente de denuncias de la PNP (LaIA). Entiendo que necesitas registrar un caso de ${label.toLowerCase()}. Estoy aquí para escucharte y guiarte de forma segura en la redacción de tu acta de denuncia. Para comenzar, por favor cuéntame en tus propias palabras: ¿cómo y cuándo sucedieron los hechos?`
        }
      ],
      relato: "",
      relatoEstructurado: "",
      agravantes: [],
      imei: "",
      placa: "",
      ubicacion: { lat: -12.0931, lng: -77.0465, direccion: "" },
      fechaHecho: "",
      evidencias: [],
      testigos: []
    });

    setPrepared(true);
    setActiveModule("narrador");
    toast.success(`Iniciando asistente LaIA para: ${label}`);
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary-soft text-primary-deep hover:bg-primary-soft">Home Portal</Badge>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Servicio Digital Unificado</span>
            </div>
            <h1 className="text-3xl font-extrabold text-primary-deep tracking-tight md:text-4xl">
              SIDECI
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground leading-relaxed">
              Plataforma nacional de transparencia y asistencia legal. Acceda a educación cívica, realice el seguimiento en tiempo real de sus expedientes y redacte denuncias policiales con validez jurídica asistidas por Inteligencia Artificial.
            </p>
          </div>
          <div className="flex items-center gap-3 self-start md:self-auto">
            <ShieldCheck className="h-10 w-10 text-police-green" />
            <div className="text-left">
              <span className="block text-xs font-bold text-police-green uppercase tracking-wide">PNP DIGITAL</span>
              <span className="text-xs text-muted-foreground">Seguridad y Garantía</span>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas de Impacto y Trazabilidad (Insight 1: Demostrar Utilidad y Reducir Fricción) */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
        <div className="flex items-center gap-2.5 p-3 rounded-xl border bg-white shadow-xs">
          <div className="p-2 rounded-lg bg-police-green-soft text-police-green shrink-0">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <span className="block text-[8px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">Espera Promedio</span>
            <span className="block text-xs font-extrabold text-slate-800">8 Minutos</span>
            <span className="block text-[10px] text-muted-foreground font-normal mt-0.5">(vs. 3 hrs en comisaría)</span>
          </div>
        </div>
        <div className="flex items-center gap-2.5 p-3 rounded-xl border bg-white shadow-xs">
          <div className="p-2 rounded-lg bg-primary-soft text-primary-deep shrink-0">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <span className="block text-[8px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">Tasa de Registro</span>
            <span className="block text-xs font-extrabold text-slate-800">98.4%</span>
            <span className="block text-[10px] text-muted-foreground font-normal mt-0.5">(vs. 50% tradicional)</span>
          </div>
        </div>
        <div className="flex items-center gap-2.5 p-3 rounded-xl border bg-white shadow-xs">
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
            <Scale className="h-4 w-4" />
          </div>
          <div>
            <span className="block text-[8px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">Trazabilidad</span>
            <span className="block text-xs font-extrabold text-slate-800">100% Digital</span>
            <span className="block text-[10px] text-muted-foreground font-normal mt-0.5">(Portal SIDECI)</span>
          </div>
        </div>
      </div>

      {/* Grid de Servicios Clave (3 Columnas) */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Servicio 1: Generar Denuncia */}
        <Card className="border-slate-200 bg-white shadow-sm relative flex flex-col justify-between overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Badge className="bg-primary text-white">Servicio Oficial</Badge>
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg text-primary-deep mt-2">Generar Denuncia Policial</CardTitle>
            <CardDescription className="text-xs">
              Registre actas oficiales PNP asistido por voz con nuestro oficial virtual LaIA.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-grow flex flex-col justify-between">
            {/* Crime Type Selectors */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-primary-deep uppercase tracking-wider block">
                Tipo de Delito
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: "celular", label: "Celular", icon: Smartphone },
                  { id: "vehiculo", label: "Vehículo", icon: Car },
                  { id: "vivienda", label: "Vivienda", icon: Home },
                  { id: "otro", label: "Otros", icon: ShieldAlert }
                ].map((item) => {
                  const Icon = item.icon;
                  const selected = tipo === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setTipo(item.id)}
                      className={`flex items-center gap-1.5 p-2 rounded-lg border text-left text-xs transition-all ${
                        selected
                          ? "border-primary bg-primary-soft/60 font-semibold"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <Icon className={`h-3.5 w-3.5 ${selected ? "text-primary" : "text-slate-400"}`} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Checkbox de Privacidad Ley N° 29733 */}
            <div className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border text-[10px] text-slate-600 leading-tight">
              <Checkbox 
                id="privacy" 
                checked={privacyAccepted} 
                onCheckedChange={(v) => setPrivacyAccepted(!!v)}
                className="mt-0.5"
              />
              <label htmlFor="privacy" className="cursor-pointer select-none leading-normal">
                Acepto el tratamiento de mis datos de acuerdo a la <strong>Ley de Protección de Datos Personales (Ley N° 29733)</strong>.
              </label>
            </div>

            {/* Start Button */}
            <div className="pt-2">
              <Button
                onClick={handleStartDenuncia}
                disabled={!privacyAccepted}
                className="w-full text-xs font-semibold rounded-lg bg-primary hover:bg-primary-deep text-white shadow flex items-center justify-center gap-1.5 group"
              >
                Iniciar Denuncia con LaIA
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Servicio 2: Seguimiento de Casos */}
        <Card className="border-border bg-white shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-slate-500">Expedientes</Badge>
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <CardTitle className="text-lg text-primary-deep mt-2">Seguimiento de Expediente</CardTitle>
            <CardDescription className="text-xs">
              Consulte el estado, asignación de comisarías y estado fiscal de sus trámites en vivo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-grow flex flex-col justify-between">
            {/* Quick Preview Area */}
            <div className="rounded-lg bg-slate-50 p-3 border border-slate-100 flex items-center justify-between text-xs">
              <div className="space-y-1">
                <span className="block text-[10px] text-muted-foreground uppercase font-semibold">Último Trámite</span>
                <span className="font-bold text-slate-700">Caso: N° {denuncia.expediente}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-police-green animate-pulse" />
                <span className="font-semibold text-police-green text-[10px]">En proceso</span>
              </div>
            </div>

            {/* Link Button */}
            <div className="pt-2">
              <Button
                variant="outline"
                onClick={() => setActiveModule("seguimiento")}
                className="w-full text-xs font-semibold rounded-lg border-slate-200 hover:bg-slate-50 hover:text-primary-deep flex items-center justify-center gap-1.5"
              >
                Acceder a Seguimiento
                <Search className="h-3.5 w-3.5 text-slate-500" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Servicio 3: Soporte Legal */}
        <Card className="border-border bg-white shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Badge className="bg-police-green-soft text-police-green border-police-green/30 hover:bg-police-green-soft">Asesoría 24/7</Badge>
              <MessageSquare className="h-5 w-5 text-police-green" />
            </div>
            <CardTitle className="text-lg text-primary-deep mt-2">Soporte y Orientación Legal</CardTitle>
            <CardDescription className="text-xs">
              Chatee con asesores jurídicos de la PNP y resuelva sus inquietudes sobre procesos penales.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-grow flex flex-col justify-between">
            {/* Quick Support Badge Info */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <Scale className="h-4 w-4 text-police-green shrink-0" />
                <span>Asistencia jurídica gratuita ante robos.</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Clock className="h-4 w-4 text-police-green shrink-0" />
                <span>Canal activo las 24 horas del día.</span>
              </div>
            </div>

            {/* Link Button */}
            <div className="pt-2">
              <Button
                variant="outline"
                onClick={() => setActiveModule("soporte")}
                className="w-full text-xs font-semibold rounded-lg border-slate-200 hover:bg-slate-50 hover:text-primary-deep flex items-center justify-center gap-1.5"
              >
                Contactar Soporte 24/7
                <MessageSquare className="h-3.5 w-3.5 text-police-green" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portal de Educación Cívica (YouTube) */}
      <Card className="overflow-hidden border-border bg-white shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg text-primary-deep">Portal de Educación Cívica y Entrenamiento</CardTitle>
          </div>
          <CardDescription>
            Infórmese sobre sus derechos fundamentales frente a robos y detenciones policiales.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Left Column: Embed Player */}
            <div className="lg:col-span-8 relative aspect-video w-full overflow-hidden rounded-xl border border-muted bg-black shadow-inner">
              <iframe
                className="absolute inset-0 h-full w-full"
                src={`https://www.youtube.com/embed/${videos[activeVideoIdx].id}`}
                title={videos[activeVideoIdx].title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>

            {/* Right Column: Interactive Tabs and Info */}
            <div className="lg:col-span-4 flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-primary-deep uppercase tracking-wider block">Temas de Entrenamiento</span>
                <div className="flex flex-col gap-2">
                  {videos.map((vid, idx) => (
                    <button
                      key={vid.id}
                      onClick={() => setActiveVideoIdx(idx)}
                      className={`text-left p-3 rounded-lg border text-xs transition-all ${
                        activeVideoIdx === idx
                          ? "border-primary bg-primary-soft/40 font-semibold text-primary-deep shadow-sm"
                          : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                      }`}
                    >
                      <span className="uppercase text-[9px] tracking-wider text-muted-foreground mb-1 block">TEMA 0{idx + 1}</span>
                      <span className="line-clamp-1 leading-tight">{vid.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Topic Description */}
              <div className="rounded-lg bg-slate-50 p-4 border border-slate-100 flex-grow lg:flex-grow-0">
                <h4 className="font-bold text-xs text-primary-deep flex items-center gap-1.5">
                  <Play className="h-3.5 w-3.5 fill-primary text-primary" />
                  {videos[activeVideoIdx].title}
                </h4>
                <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                  {videos[activeVideoIdx].description}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}