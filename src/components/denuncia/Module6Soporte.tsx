import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Send, MessageCircle, Mail, Bell, BookOpen, Scale } from "lucide-react";
import { useDenuncia } from "@/lib/denuncia-store";

export function Module6Soporte() {
  const { denuncia, addMensaje } = useDenuncia();
  const [text, setText] = useState("");
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <Badge className="w-fit bg-primary-soft text-primary-deep hover:bg-primary-soft">Módulo 6</Badge>
          <CardTitle className="text-xl text-primary-deep">Chat seguro con la PNP / asistencia legal</CardTitle>
          <p className="text-sm text-muted-foreground">Acompañamiento continuo sobre su expediente N° {denuncia.expediente}</p>
        </CardHeader>
        <CardContent>
          <div className="mb-3 flex h-96 flex-col gap-3 overflow-y-auto rounded-lg border bg-secondary/30 p-3">
            {denuncia.mensajes.map((m) => {
              const mine = m.autor === "ciudadano";
              return (
                <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm shadow-sm ${mine ? "bg-primary text-primary-foreground" : m.autor === "pnp" ? "border bg-white" : m.autor === "legal" ? "border bg-police-green-soft" : "border bg-warning/20"}`}>
                    <div className="mb-0.5 flex items-center gap-2 text-[10px] uppercase opacity-75">
                      <span>{m.autor}</span><span>·</span><span>{m.fecha}</span>
                    </div>
                    <p>{m.texto}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!text.trim()) return;
              addMensaje({ autor: "ciudadano", texto: text });
              setText("");
              setTimeout(() => addMensaje({ autor: "pnp", texto: "Recibido. Un agente revisará su consulta en breve." }), 800);
            }}
          >
            <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Escriba su consulta…" />
            <Button type="submit"><Send className="h-4 w-4" /></Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Canales de atención</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-3 gap-2">
            {[
              { i: MessageCircle, l: "WhatsApp", c: "text-police-green" },
              { i: Mail, l: "Correo", c: "text-primary" },
              { i: Bell, l: "Alertas", c: "text-warning-foreground" },
            ].map((x) => (
              <button key={x.l} className="flex flex-col items-center gap-1 rounded-lg border bg-white p-3 hover:border-primary">
                <x.i className={`h-5 w-5 ${x.c}`} />
                <span className="text-xs">{x.l}</span>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><BookOpen className="h-4 w-4 text-primary" /> Información y ayuda</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="rounded border bg-secondary/40 p-2">📌 Recordatorio: conserve su número de expediente y QR.</p>
            <p className="rounded border bg-secondary/40 p-2">⚖️ Asesoría legal gratuita disponible 24/7.</p>
            <p className="rounded border bg-secondary/40 p-2">🔔 Activaremos alertas si su caso es derivado a Fiscalía.</p>
          </CardContent>
        </Card>

        <Card className="border-police-green/30 bg-police-green-soft">
          <CardContent className="flex items-center gap-3 p-4">
            <Scale className="h-5 w-5 text-police-green" />
            <p className="text-sm">Acompañamiento continuo desde la denuncia hasta el resultado final.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}