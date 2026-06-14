import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Send, Sparkles, AlertCircle, Eye, ShieldCheck, Car, Scale, Clock } from "lucide-react";
import { useDenuncia, type ChatMessage } from "@/lib/denuncia-store";
import { answerSupportQuestion } from "@/lib/api/openai.functions";
import { toast } from "sonner";

export function Module6Soporte() {
  const { openaiApiKey, denuncias, selectDenuncia, setActiveModule } = useDenuncia();
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      role: "assistant",
      content: "¡Hola! Soy LaIA, su asistente virtual oficial. Tengo acceso a sus expedientes registrados en SIDECI. Puede preguntarme por el estado de sus denuncias, la asignación de comisarías, o solicitarme ir a cualquier sección del portal (como iniciar un caso o ver su trazabilidad). ¿En qué le puedo asistir?"
    }
  ]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Format complaints list as structured context for the AI prompt
  const denunciasContext = denuncias
    .map((d, idx) => (
      `${idx + 1}. Expediente N° ${d.expediente}: Tipo de delito: "${d.tipo}". Fecha: ${d.fechaHecho}. Estado actual: "${
        d.timeline.find(t => t.status === "en_proceso")?.label || "Completado"
      }". Dirección del suceso: ${d.ubicacion.direccion}.`
    ))
    .join("\n");

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || loading) return;

    const userText = text;
    setText("");
    
    // Add user message to UI
    const updatedMessages = [...messages, { role: "user" as const, content: userText }];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const response = await answerSupportQuestion({
        data: {
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          customApiKey: openaiApiKey,
          context: denunciasContext
        }
      });

      // Add assistant response to UI
      setMessages(prev => [...prev, { role: "assistant" as const, content: response.text }]);

      // Perform dynamic routing if returned by the AI
      if (response.action) {
        setTimeout(() => {
          setActiveModule(response.action);
          toast.info(`Asistencia LaIA: Redireccionando a ${
            response.action === "preparacion" ? "Inicio" :
            response.action === "narrador" ? "Asistente de Voz" :
            response.action === "registro" ? "Formulario de Registro" :
            response.action === "confirmacion" ? "Confirmación" :
            "Seguimiento de Casos"
          }...`);
        }, 1200);
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Error al conectar con LaIA. Verifique su API Key.");
      setMessages(prev => [
        ...prev,
        {
          role: "assistant" as const,
          content: "Disculpe, he experimentado una interrupción al conectarme. Por favor, configure su API Key de OpenAI para habilitar las respuestas en tiempo real."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Helper to resolve badge classes for complaint cards
  const getActiveStatus = (timeline: any[]) => {
    const active = timeline.find(t => t.status === "en_proceso");
    if (active) return { label: active.label, color: "bg-amber-50 text-amber-700 border-amber-100" };
    const lastCompleted = [...timeline].reverse().find(t => t.status === "completado");
    if (lastCompleted) return { label: lastCompleted.label, color: "bg-emerald-50 text-emerald-700 border-emerald-100" };
    return { label: "Pendiente", color: "bg-slate-50 text-slate-500 border-slate-100" };
  };

  // Helper to select icon based on type
  const getDenunciaIcon = (tipo: string) => {
    const lower = tipo.toLowerCase();
    if (lower.includes("celular")) return ShieldCheck;
    if (lower.includes("vehículo") || lower.includes("auto") || lower.includes("carro")) return Car;
    return Scale;
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in py-2">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: AI Assistant Chat (Minimalist) */}
        <div className="lg:col-span-8 flex flex-col">
          <Card className="border-slate-200 bg-white shadow-lg overflow-hidden flex flex-col h-[calc(100vh-170px)] min-h-[500px] rounded-2xl">
            {/* Chat Header */}
            <CardHeader className="border-b bg-slate-50/50 py-3.5 px-5 flex flex-row items-center justify-between space-y-0 shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-8.5 w-8.5 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-sm font-extrabold text-primary-deep tracking-tight flex items-center gap-1.5 leading-none">
                    LaIA Consultas
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  </CardTitle>
                  <CardDescription className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-1 block">
                    Orientador de Navegación & Normativas
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="text-[9px] border-slate-200 text-slate-500 font-bold uppercase tracking-wider bg-white py-0.5 px-2">
                Asistente Virtual
              </Badge>
            </CardHeader>

            {/* Chat Messages */}
            <CardContent className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-50/15 scroll-smooth" ref={scrollRef}>
              {messages.map((m, idx) => {
                const isUser = m.role === "user";
                return (
                  <div key={idx} className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs ${
                      isUser 
                        ? "bg-primary text-white rounded-br-none" 
                        : "bg-white border border-slate-200 text-slate-800 rounded-bl-none"
                    }`}>
                      <span className="block text-[8px] font-bold uppercase tracking-wider opacity-60 mb-1">
                        {isUser ? "Ciudadano" : "LaIA · Guía de SIDECI"}
                      </span>
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="flex justify-start animate-pulse">
                  <div className="bg-white border border-slate-200 text-slate-500 rounded-2xl rounded-bl-none px-4 py-3 max-w-[80%] text-xs shadow-xs">
                    <span className="block text-[8px] font-bold uppercase tracking-wider opacity-60 mb-1">LaIA · Guía de SIDECI</span>
                    <div className="flex items-center gap-1.5 py-1">
                      <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>

            {/* Input Form */}
            <div className="p-3 border-t bg-white shrink-0">
              <form className="flex gap-2" onSubmit={handleSendMessage}>
                <Input 
                  value={text} 
                  onChange={(e) => setText(e.target.value)} 
                  placeholder="Consulte sobre sus expedientes o pídale a LaIA que le redirija..." 
                  disabled={loading}
                  className="bg-slate-50 border-slate-200 focus-visible:ring-primary text-xs py-5 px-3.5"
                />
                <Button 
                  type="submit" 
                  disabled={loading || !text.trim()}
                  className="bg-primary hover:bg-primary-deep text-white px-4 shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
              <div className="flex items-center gap-1.5 justify-center mt-2.5 text-[9px] text-slate-400 font-medium">
                <AlertCircle className="h-3.5 w-3.5 text-slate-300" />
                <span>LaIA puede guiarle y enrutarle de forma automática a cualquier página del portal.</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Complaints List Panel (Cards) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="px-1.5">
            <h3 className="text-sm font-extrabold text-slate-800 tracking-tight leading-none">Mis Expedientes en SIDECI</h3>
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-1.5 block">
              Historial de denuncias simuladas
            </span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-235px)] min-h-[440px] pr-1 scroll-thin">
            {denuncias.length === 0 ? (
              <div className="border border-dashed rounded-2xl p-6 text-center text-xs text-muted-foreground bg-slate-50/50">
                No se registran denuncias vinculadas a su DNI.
              </div>
            ) : (
              denuncias.map((d) => {
                const statusInfo = getActiveStatus(d.timeline);
                const IconComponent = getDenunciaIcon(d.tipo);
                return (
                  <Card key={d.id} className="border-slate-200 bg-white hover:border-slate-300 transition-all shadow-xs rounded-xl overflow-hidden">
                    <CardContent className="p-4 space-y-3">
                      {/* Card Header Info */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-600 shrink-0">
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs text-slate-800 truncate leading-tight">{d.tipo}</h4>
                            <span className="text-[9px] font-mono text-slate-400 block mt-0.5">Expediente: N° {d.expediente}</span>
                          </div>
                        </div>
                        <Badge variant="outline" className={`text-[8px] font-bold px-1.5 py-0.5 border select-none shrink-0 ${statusInfo.color}`}>
                          {statusInfo.label}
                        </Badge>
                      </div>

                      {/* Timeline status info snippet */}
                      <div className="text-[10px] text-slate-500 leading-normal flex items-start gap-1.5 bg-slate-50 border border-slate-100 p-2.5 rounded-lg">
                        <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block text-slate-600">Última actualización:</span>
                          <span className="block mt-0.5 text-slate-500">
                            {d.timeline.find(t => t.status === "en_proceso")?.detalle || 
                             d.timeline.find(t => t.status === "completado" && t.detalle)?.detalle || 
                             "Denuncia registrada en el portal estatal."}
                          </span>
                        </div>
                      </div>

                      {/* Card Action Button */}
                      <Button
                        onClick={() => {
                          selectDenuncia(d.id);
                          setActiveModule("seguimiento");
                          toast.success(`Cargando trazabilidad para el Expediente N° ${d.expediente}`);
                        }}
                        variant="outline"
                        size="sm"
                        className="w-full text-[10px] font-bold py-1.5 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-primary flex items-center justify-center gap-1.5"
                      >
                        <Eye className="h-3.5 w-3.5 text-slate-500" />
                        Ver Trazabilidad
                      </Button>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}