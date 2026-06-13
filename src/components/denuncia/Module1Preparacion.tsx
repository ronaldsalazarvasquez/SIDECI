import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { useDenuncia } from "@/lib/denuncia-store";
import { Clock, ShieldCheck, ListChecks, ArrowRight, Info } from "lucide-react";

const checklist = [
  "DNI del denunciante",
  "Datos del bien sustraído (marca, modelo, serie/IMEI/placa)",
  "Fotografías o videos del lugar (si tiene)",
  "Comprobante de compra (si dispone)",
  "Datos de posibles testigos",
];

export function Module1Preparacion() {
  const { setActiveModule, setPrepared, prepared } = useDenuncia();
  const [tipo, setTipo] = useState<string>("celular");
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const allOk = Object.values(checked).filter(Boolean).length >= 3;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge className="bg-primary-soft text-primary-deep hover:bg-primary-soft">Módulo 1</Badge>
              <span className="text-xs text-muted-foreground">Preparación inteligente</span>
            </div>
            <CardTitle className="text-2xl text-primary-deep">Bienvenido. Vamos a preparar su denuncia</CardTitle>
            <p className="text-sm text-muted-foreground">
              Antes de iniciar, realizaremos un breve diagnóstico para indicarle exactamente qué necesita y cuánto tiempo le tomará.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h3 className="mb-3 text-sm font-semibold text-primary-deep">Diagnóstico del caso</h3>
              <RadioGroup value={tipo} onValueChange={setTipo} className="grid gap-2 sm:grid-cols-2">
                {[
                  { v: "celular", l: "Robo / hurto de celular" },
                  { v: "vehiculo", l: "Robo de vehículo" },
                  { v: "vivienda", l: "Robo en vivienda / local" },
                  { v: "otro", l: "Otro tipo" },
                ].map((o) => (
                  <Label key={o.v} htmlFor={o.v} className="flex cursor-pointer items-center gap-3 rounded-lg border bg-white p-3 hover:border-primary">
                    <RadioGroupItem id={o.v} value={o.v} />
                    <span className="text-sm">{o.l}</span>
                  </Label>
                ))}
              </RadioGroup>
            </section>

            <section>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary-deep">
                <ListChecks className="h-4 w-4" /> Checklist personalizado
              </h3>
              <div className="space-y-2">
                {checklist.map((item) => (
                  <label key={item} className="flex items-start gap-3 rounded-md border bg-white p-3 text-sm">
                    <Checkbox checked={!!checked[item]} onCheckedChange={(v) => setChecked((s) => ({ ...s, [item]: !!v }))} />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </section>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preguntas frecuentes</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              <AccordionItem value="q1"><AccordionTrigger>¿La denuncia tiene validez legal?</AccordionTrigger>
                <AccordionContent>Sí. Su expediente se integra al SIDPOL de la PNP y tiene la misma validez que una denuncia presencial.</AccordionContent></AccordionItem>
              <AccordionItem value="q2"><AccordionTrigger>¿Cuánto demora todo el proceso?</AccordionTrigger>
                <AccordionContent>El registro toma entre 8 y 12 minutos. El seguimiento del caso es en tiempo real.</AccordionContent></AccordionItem>
              <AccordionItem value="q3"><AccordionTrigger>¿Qué pasa si mi caso es archivado?</AccordionTrigger>
                <AccordionContent>Tendrá 5 días hábiles para presentar observaciones. La plataforma le ayudará a generar el escrito automáticamente.</AccordionContent></AccordionItem>
              <AccordionItem value="q4"><AccordionTrigger>¿Es gratuito?</AccordionTrigger>
                <AccordionContent>Sí, todo el proceso es completamente gratuito.</AccordionContent></AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card className="border-primary/30 bg-primary-soft/40">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-primary-deep"><Info className="h-4 w-4" /> Información del proceso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /><span>Tiempo estimado: <b>8–12 min</b></span></div>
            <p className="text-muted-foreground">Su declaración será asistida por IA para garantizar claridad y validez legal.</p>
          </CardContent>
        </Card>

        <Card className={prepared ? "border-police-green/40 bg-police-green-soft" : ""}>
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className={prepared ? "h-5 w-5 text-police-green" : "h-5 w-5 text-muted-foreground"} />
              <span className="text-sm font-medium">
                {prepared ? "Ciudadano preparado para denunciar" : "Complete al menos 3 ítems del checklist"}
              </span>
            </div>
            <Button
              className="w-full"
              disabled={!allOk}
              onClick={() => { setPrepared(true); setActiveModule("narrador"); }}
            >
              Continuar al Narrador IA <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}