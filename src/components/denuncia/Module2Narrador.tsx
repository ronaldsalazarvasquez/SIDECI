import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Mic,
  Square,
  Sparkles,
  ArrowRight,
  Loader2,
  AlertTriangle,
  Settings,
  Volume2,
  VolumeX,
  Keyboard,
  Send,
  CheckCircle,
  HelpCircle,
  FileText,
  MapPin,
  Calendar,
  AlertOctagon,
  KeyRound,
  RotateCcw,
  UploadCloud,
  Trash2,
  Image as ImageIcon,
  Video,
  AudioLines
} from "lucide-react";
import { useDenuncia, type ChatMessage } from "@/lib/denuncia-store";
import { transcribeAudio, analyzeReport, synthesizeSpeech } from "@/lib/api/openai.functions";
import { toast } from "sonner";

export function Module2Narrador() {
  const { updateDenuncia, setActiveModule, denuncia, openaiApiKey, setOpenaiApiKey } = useDenuncia();
  const [relato, setRelato] = useState("");
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(openaiApiKey);
  const [voiceSynthesisEnabled, setVoiceSynthesisEnabled] = useState(true);
  const [premiumVoice, setPremiumVoice] = useState(false);
  const [openaiVoice, setOpenaiVoice] = useState("nova");
  const [speaking, setSpeaking] = useState(false);
  const [textMode, setTextMode] = useState(false);
  const [textMessage, setTextMessage] = useState("");
  const [speechTranscript, setSpeechTranscript] = useState("");
  const speechTranscriptRef = useRef("");

  const chatEndRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize synthesis voices
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  // Update local API key input when context state changes
  useEffect(() => {
    setApiKeyInput(openaiApiKey);
  }, [openaiApiKey]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [denuncia.narradorChat, processing]);

  // Timer for recording duration
  useEffect(() => {
    if (recording) {
      setSeconds(0);
      timer.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (timer.current) {
        clearInterval(timer.current);
        timer.current = null;
      }
    }
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [recording]);

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (activeAudioRef.current) {
      try {
        activeAudioRef.current.pause();
        activeAudioRef.current.src = "";
      } catch (e) {}
      activeAudioRef.current = null;
    }
    setSpeaking(false);
  };

  // Browser Text to Speech Synthesis
  const speakText = async (text: string) => {
    if (!voiceSynthesisEnabled) return;

    stopSpeaking();

    const keyToUse = apiKeyInput.trim() || openaiApiKey;

    // 1. Premium voice using OpenAI TTS if premium mode is enabled
    if (premiumVoice) {
      try {
        let audioUrl = "";
        if (keyToUse) {
          // Direct client call to OpenAI TTS API to save time and reduce overhead (zero latency)
          const response = await fetch("https://api.openai.com/v1/audio/speech", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${keyToUse}`,
            },
            body: JSON.stringify({
              model: "tts-1",
              input: text,
              voice: openaiVoice,
            }),
          });
          if (!response.ok) throw new Error("Client TTS failed");
          const blob = await response.blob();
          audioUrl = URL.createObjectURL(blob);
        } else {
          // Fallback to server function using the .env API key
          const res = await synthesizeSpeech({
            data: {
              text,
              voice: openaiVoice,
              customApiKey: keyToUse,
            },
          });
          audioUrl = "data:audio/mp3;base64," + res.audioBase64;
        }

        const audio = new Audio(audioUrl);
        activeAudioRef.current = audio;

        setSpeaking(true);
        audio.onended = () => setSpeaking(false);
        audio.onpause = () => setSpeaking(false);
        audio.onerror = () => setSpeaking(false);

        audio.play();
        return;
      } catch (err) {
        console.warn("Fallo en voz premium, recurriendo a voz local del navegador:", err);
      }
    }

    // 2. Fallback to Local browser TTS voice
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "es-PE"; // Prefer Peruvian locale

      let voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) {
        voices = window.speechSynthesis.getVoices();
      }

      const spanishVoices = voices.filter((v) => v.lang.toLowerCase().startsWith("es"));

      // Prioritize Latin American female voices
      const isLatinAmerican = (v: SpeechSynthesisVoice) => {
        const lang = v.lang.toLowerCase();
        return (
          !lang.includes("es-es") &&
          (lang.includes("es-pe") ||
            lang.includes("es-mx") ||
            lang.includes("es-co") ||
            lang.includes("es-ar") ||
            lang.includes("es-cl") ||
            lang.includes("es-us") ||
            lang.includes("es-419"))
        );
      };

      const isFemaleName = (name: string) => {
        const lower = name.toLowerCase();
        return (
          lower.includes("paulina") ||
          lower.includes("sonia") ||
          lower.includes("angelica") ||
          lower.includes("sabina") ||
          lower.includes("marisol") ||
          lower.includes("soledad") ||
          lower.includes("francisca") ||
          lower.includes("luciana") ||
          lower.includes("elena") ||
          lower.includes("siri") ||
          lower.includes("monica") ||
          lower.includes("google") ||
          lower.includes("helena") ||
          lower.includes("zira")
        );
      };

      const sortedVoices = [...spanishVoices].sort((a, b) => {
        const aLat = isLatinAmerican(a);
        const bLat = isLatinAmerican(b);
        const aFem = isFemaleName(a.name);
        const bFem = isFemaleName(b.name);

        if (aLat && aFem && !(bLat && bFem)) return -1;
        if (!(aLat && aFem) && bLat && bFem) return 1;
        if (aLat && !bLat) return -1;
        if (!aLat && bLat) return 1;
        if (aFem && !bFem) return -1;
        if (!aFem && bFem) return 1;
        return 0;
      });

      if (sortedVoices.length > 0) {
        utterance.voice = sortedVoices[0];
      }
      utterance.rate = 1.05;

      setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  // Start Mic Recording
  const startRecording = async () => {
    stopSpeaking();
    audioChunksRef.current = [];
    setSpeechTranscript("");
    speechTranscriptRef.current = "";

    try {
      // Request clean microphone stream with active voice filtering
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      let selectedMimeType = "";
      if (typeof MediaRecorder !== "undefined") {
        if (MediaRecorder.isTypeSupported("audio/webm")) {
          selectedMimeType = "audio/webm";
        } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
          selectedMimeType = "audio/mp4";
        } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
          selectedMimeType = "audio/ogg";
        } else if (MediaRecorder.isTypeSupported("audio/wav")) {
          selectedMimeType = "audio/wav";
        }
      }

      const mediaRecorder = new MediaRecorder(
        stream,
        selectedMimeType ? { mimeType: selectedMimeType } : undefined
      );
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Turn off the microphone hardware recording light
        stream.getTracks().forEach((track) => track.stop());

        // Stop browser SpeechRecognition if running
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch (e) {
            console.warn("Error al detener reconocimiento de voz nativo:", e);
          }
        }
        
        // If we got native speech recognition transcription, process it immediately!
        const nativeText = speechTranscriptRef.current.trim();
        if (nativeText) {
          toast.success("Dictado de voz completado");
          setProcessing(true);
          try {
            await processUserMessage(nativeText);
          } finally {
            setProcessing(false);
          }
          return;
        }

        // Fallback: use Whisper
        const mimeTypeUsed = mediaRecorderRef.current?.mimeType || "audio/webm";
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeTypeUsed });
        
        if (audioBlob.size === 0) {
          toast.error("El audio grabado está vacío. Intente de nuevo.");
          return;
        }

        // Convert audio to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          await handleSendVoice(base64Audio, mimeTypeUsed);
        };
      };

      // Start browser native speech recognition if supported
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "es-PE"; // Peruvian Spanish

        recognition.onresult = (event: any) => {
          let interimTranscript = "";
          let finalTranscript = "";
          for (let i = 0; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
          const text = finalTranscript + interimTranscript;
          speechTranscriptRef.current = text;
          setSpeechTranscript(text);
        };

        recognition.onerror = (e: any) => {
          console.error("Error en Speech Recognition nativo:", e);
        };

        recognitionRef.current = recognition;
        recognition.start();
      }

      // Start recording with 250ms timeslice (essential for proper chunking in macOS Chrome)
      mediaRecorder.start(250);
      setRecording(true);
      toast.info("Escuchando... Cuéntame qué sucedió con naturalidad.");
    } catch (err: any) {
      console.error(err);
      toast.error("No se pudo acceder al micrófono. Verifica los permisos de tu navegador.");
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn("Error al detener reconocimiento nativo:", e);
      }
    }
  };

  // Send voice base64 data to server
  const handleSendVoice = async (base64Audio: string, mimeTypeUsed?: string) => {
    setProcessing(true);
    const keyToUse = apiKeyInput.trim() || openaiApiKey;
    try {
      toast.loading("Transcribiendo tu voz...", { id: "whisper-status" });
      const res = await transcribeAudio({ 
        data: { 
          audioBase64: base64Audio, 
          mimeType: mimeTypeUsed,
          customApiKey: keyToUse 
        } 
      });
      toast.dismiss("whisper-status");

      const userText = res.text;
      if (!userText.trim()) {
        toast.error("No se pudo detectar ninguna palabra clara. Intenta hablar más cerca del micrófono.");
        return;
      }

      toast.success("Transcripción Whisper completada");
      await processUserMessage(userText);
    } catch (err: any) {
      toast.dismiss("whisper-status");
      console.error(err);
      toast.error(err.message || "Error al transcribir el audio.");
    } finally {
      setProcessing(false);
    }
  };

  // Handle Text Submission
  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textMessage.trim() || processing) return;
    const msg = textMessage.trim();
    setTextMessage("");
    stopSpeaking();
    setProcessing(true);
    try {
      await processUserMessage(msg);
    } finally {
      setProcessing(false);
    }
  };

  // Process message and talk to OpenAI
  const processUserMessage = async (text: string) => {
    const keyToUse = apiKeyInput.trim() || openaiApiKey;
    const newUserMessage: ChatMessage = { role: "user", content: text };
    const currentChat = denuncia.narradorChat || [];
    const updatedChat = [...currentChat, newUserMessage];

    // Update frontend chat immediately
    updateDenuncia({ narradorChat: updatedChat });

    try {
      const res = await analyzeReport({
        data: {
          messages: updatedChat.map((m) => ({ role: m.role, content: m.content })),
          customApiKey: keyToUse,
          currentData: {
            tipo: denuncia.tipo,
            imei: denuncia.imei,
            placa: denuncia.placa,
            ubicacion: denuncia.ubicacion?.direccion,
            fechaHecho: denuncia.fechaHecho,
            agravantes: denuncia.agravantes,
            testigos: denuncia.testigos
          }
        }
      });

      const aiMessage: ChatMessage = { role: "assistant", content: res.response };
      const finalChat = [...updatedChat, aiMessage];
      const ext = res.extractedData || {};

      // Structure update logic
      updateDenuncia({
        narradorChat: finalChat,
        relato: text,
        relatoEstructurado: ext.relatoEstructurado || "",
        agravantes: ext.agravantes || [],
        tipo: ext.tipoBien || "",
        imei: ext.imei || "",
        placa: ext.placa || "",
        ubicacion: ext.ubicacion ? { ...denuncia.ubicacion, direccion: ext.ubicacion } : { lat: -12.0931, lng: -77.0465, direccion: "" },
        fechaHecho: ext.fechaHecho || "",
        testigos: ext.testigos || []
      });

      if (ext.complete) {
        toast.success("¡Información Completa! Todo listo para formalizar la denuncia.", { duration: 6000 });
      }

      if (voiceSynthesisEnabled) {
        speakText(res.response);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error al procesar el mensaje con la IA.");
    }
  };

  // Reset conversation
  const resetConversation = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (activeAudioRef.current) {
      try {
        activeAudioRef.current.pause();
        activeAudioRef.current.src = "";
      } catch (e) {}
      activeAudioRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }
    setSpeechTranscript("");
    speechTranscriptRef.current = "";
    
    const currentTipo = denuncia.tipo || "incidente";
    const greeting = currentTipo && currentTipo !== "incidente"
      ? `Hola. Soy el asistente de denuncias de la PNP (LaIA). Entiendo que necesitas registrar un caso de ${currentTipo.toLowerCase()}. Estoy aquí para escucharte y guiarte de forma segura en la redacción de tu acta de denuncia. Para comenzar, por favor cuéntame en tus propias palabras: ¿cómo y cuándo sucedieron los hechos?`
      : "Hola. Soy el asistente de denuncias de la PNP. Estoy aquí para escucharte y ayudarte a preparar tu denuncia de forma rápida. Cuéntame con tus palabras, ¿qué sucedió?";

    updateDenuncia({
      narradorChat: [
        {
          role: "assistant",
          content: greeting
        }
      ],
      relato: "",
      relatoEstructurado: "",
      agravantes: [],
      tipo: currentTipo,
      imei: "",
      placa: "",
      ubicacion: { lat: -12.0931, lng: -77.0465, direccion: "" },
      fechaHecho: "",
      testigos: []
    });
    toast.info("Conversación y datos policiales reiniciados. Puedes iniciar tu reporte.");
  };

  // API Key handling
  const handleSaveApiKey = () => {
    setOpenaiApiKey(apiKeyInput);
    toast.success("API Key guardada localmente.");
    setShowSettings(false);
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
      const newEv = {
        id: `e-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        tipo,
        nombre: file.name,
        url: fileUrl
      };

      updateDenuncia({
        evidencias: [...(denuncia.evidencias || []), newEv]
      });

      toast.success(`Evidencia adjuntada: ${file.name}`);
    });
  };

  // Calculate completeness progress
  const calculateProgress = () => {
    let pts = 0;
    const items: { label: string; ok: boolean; pct: number }[] = [
      { label: "Tipo de Bien", ok: !!denuncia.tipo, pct: 15 },
      { label: "Relato Estructurado", ok: !!denuncia.relatoEstructurado && denuncia.relatoEstructurado.length > 20, pct: 30 },
      { label: "Ubicación del Hecho", ok: !!denuncia.ubicacion?.direccion && denuncia.ubicacion.direccion !== "Av. Arequipa 2500, Lince, Lima" && denuncia.ubicacion.direccion.length > 5, pct: 20 },
      { label: "Fecha y Hora", ok: !!denuncia.fechaHecho && denuncia.fechaHecho.length > 5, pct: 15 },
      { label: "Detalle del Bien (IMEI/Placa)", ok: denuncia.tipo === "celular" ? /^\d{15}$/.test(denuncia.imei || "") : denuncia.tipo === "vehiculo" ? !!denuncia.placa : true, pct: 20 }
    ];

    items.forEach((it) => {
      if (it.ok) pts += it.pct;
    });

    return { total: Math.min(pts, 100), items };
  };

  const { total: progressPct, items: progressItems } = calculateProgress();
  const chatMessages = denuncia.narradorChat || [];

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* LEFT COLUMN: Conversational Console (3 cols) */}
      <Card className="flex flex-col h-[740px] lg:col-span-3 border-primary/20 bg-card overflow-hidden shadow-md">
        <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30 py-3 px-4 shrink-0">
          <div className="flex items-center gap-2">
            <CardTitle className="text-xs sm:text-sm font-bold text-primary-deep flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-police-green" /> Asistente Conversacional IA
            </CardTitle>
            {speaking && (
              <Badge className="bg-police-green-soft text-police-green border-police-green/20 animate-pulse text-[9px] flex items-center gap-1">
                <span className="flex gap-0.5 h-1.5 items-end">
                  <span className="w-0.5 bg-police-green h-1 animate-bounce" />
                  <span className="w-0.5 bg-police-green h-2 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-0.5 bg-police-green h-1 animate-bounce [animation-delay:0.4s]" />
                </span>
                Hablando...
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              title="Locución de Voz"
              onClick={() => {
                setVoiceSynthesisEnabled(!voiceSynthesisEnabled);
                if (voiceSynthesisEnabled) {
                  if (typeof window !== "undefined" && window.speechSynthesis) {
                    window.speechSynthesis.cancel();
                  }
                  if (activeAudioRef.current) {
                    try {
                      activeAudioRef.current.pause();
                      activeAudioRef.current.src = "";
                    } catch (e) {}
                    activeAudioRef.current = null;
                  }
                }
              }}
              className="h-8 w-8 text-muted-foreground"
            >
              {voiceSynthesisEnabled ? <Volume2 className="h-4.5 w-4.5 text-police-green" /> : <VolumeX className="h-4.5 w-4.5" />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              title="Reiniciar conversación"
              onClick={resetConversation}
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
            >
              <RotateCcw className="h-4.5 w-4.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              title="Ajustes de API"
              onClick={() => setShowSettings(!showSettings)}
              className={`h-8 w-8 text-muted-foreground ${showSettings ? "bg-accent text-accent-foreground" : ""}`}
            >
              <Settings className="h-4.5 w-4.5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col flex-1 p-0 overflow-hidden relative">
          {/* API Key Modal/Settings Banner */}
          {showSettings && (
            <div className="absolute inset-x-0 top-0 z-20 border-b bg-white p-4 shadow-md transition-all duration-300">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary-deep">
                  <KeyRound className="h-4 w-4 text-police-green" /> Ajustes del Narrador
                </div>
                
                <div className="flex items-center justify-between border-t pt-2.5 mt-1 border-slate-100">
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-700">Voz Premium Realista (OpenAI)</span>
                    <span className="text-[10px] text-muted-foreground">Usa síntesis de voz humana hiper-realista.</span>
                  </div>
                  <Switch 
                    checked={premiumVoice} 
                    onCheckedChange={setPremiumVoice} 
                    className="data-[state=checked]:bg-police-green"
                  />
                </div>

                {premiumVoice && (
                  <div className="flex items-center justify-between border-t pt-2.5 mt-1 border-slate-100">
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-semibold text-slate-700">Tono y Calidez de Voz</span>
                      <span className="text-[10px] text-muted-foreground">Elige el estilo de voz de la IA.</span>
                    </div>
                    <Select value={openaiVoice} onValueChange={setOpenaiVoice}>
                      <SelectTrigger className="w-44 h-8 text-xs font-medium">
                        <SelectValue placeholder="Seleccionar voz" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="shimmer" className="text-xs">Shimmer (Suave y Amable)</SelectItem>
                        <SelectItem value="nova" className="text-xs">Nova (Alegre y Expresiva)</SelectItem>
                        <SelectItem value="alloy" className="text-xs">Alloy (Neutra y Calma)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Chat Bubble Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {chatMessages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-white border rounded-bl-none text-foreground"
                  }`}
                >
                  <p>{msg.content}</p>
                </div>
              </div>
            ))}
            {processing && (
              <div className="flex justify-start">
                <div className="bg-white border rounded-2xl rounded-bl-none px-4 py-2.5 shadow-sm text-sm text-muted-foreground flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-police-green" />
                  <span>La IA está analizando tu relato...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Console Footer: Recording Wave & Voice Actions */}
          <div className="border-t bg-white p-4 shrink-0">
            {recording ? (
              <div className="flex flex-col items-center gap-3 py-2 w-full max-w-md mx-auto">
                {/* Voice equalizer waves */}
                <div className="flex items-center gap-1.5 h-10 justify-center">
                  <div className="w-1.5 bg-destructive rounded-full animate-pulse h-6" />
                  <div className="w-1.5 bg-destructive rounded-full animate-bounce h-10" />
                  <div className="w-1.5 bg-destructive rounded-full animate-pulse h-14" />
                  <div className="w-1.5 bg-destructive rounded-full animate-bounce h-8" />
                  <div className="w-1.5 bg-destructive rounded-full animate-pulse h-4" />
                </div>
                <div className="flex flex-col items-center gap-2.5 w-full px-4 text-center">
                  <span className="text-xs font-semibold text-destructive animate-pulse">
                    Grabando... {String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}
                  </span>
                  {speechTranscript && (
                    <div className="w-full bg-destructive/5 border border-destructive/10 rounded-lg p-2.5 my-1">
                      <p className="text-[9px] uppercase tracking-wider font-bold text-destructive/70 mb-0.5">Texto detectado en tiempo real:</p>
                      <p className="text-xs italic text-destructive/90 line-clamp-3">"{speechTranscript}"</p>
                    </div>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={stopRecording}
                    className="rounded-full h-8 px-4 flex items-center gap-1.5 font-medium shadow-sm hover:bg-destructive/90 transition-colors"
                  >
                    <Square className="h-3.5 w-3.5 fill-white" /> Detener y Transcribir
                  </Button>
                </div>
              </div>
            ) : textMode ? (
              <form onSubmit={handleTextSubmit} className="flex gap-2 items-end">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  title="Modo Voz"
                  onClick={() => setTextMode(false)}
                  className="h-10 w-10 shrink-0 text-primary border-primary/30 mb-0.5"
                >
                  <Mic className="h-5 w-5" />
                </Button>
                <Textarea
                  value={textMessage}
                  onChange={(e) => setTextMessage(e.target.value)}
                  placeholder="Describe lo sucedido o responde a la pregunta..."
                  disabled={processing}
                  className="min-h-[40px] max-h-[120px] resize-none py-2 text-xs"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!textMessage.trim() || processing}
                  className="h-10 w-10 shrink-0 bg-police-green text-white hover:bg-police-green/90 mb-0.5"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <button
                    onClick={startRecording}
                    disabled={processing}
                    className={`grid h-16 w-16 place-items-center rounded-full text-white transition-all shadow-lg hover:scale-105 ${
                      processing
                        ? "bg-slate-300 cursor-not-allowed"
                        : "bg-police-green hover:bg-police-green/90 ring-4 ring-police-green/10"
                    }`}
                    aria-label="Iniciar grabación por voz"
                  >
                    <Mic className="h-7 w-7" />
                  </button>
                  <div className="absolute -inset-2 rounded-full border border-police-green/20 animate-ping pointer-events-none opacity-40" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-primary-deep">Pulsa para hablar sobre lo ocurrido</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">La IA escuchará tu relato en español y estructurará el acta.</p>
                </div>
                <div className="w-full flex justify-center border-t pt-3 mt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTextMode(true)}
                    className="text-xs text-muted-foreground h-7 flex items-center gap-1.5"
                  >
                    <Keyboard className="h-3.5 w-3.5" /> Cambiar a modo teclado
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* RIGHT COLUMN: AI structured report & status items (2 cols) */}
      <div className="lg:col-span-2 space-y-4 flex flex-col h-[740px]">
        {/* Progress Card */}
        <Card className="border-primary/10">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-semibold text-primary-deep flex justify-between items-center">
              <span>Ficha Policial Asistida</span>
              <span className="text-xs font-bold text-police-green bg-police-green-soft px-2 py-0.5 rounded-full">
                {progressPct}% Completada
              </span>
            </CardTitle>
            <Progress value={progressPct} className="h-2 mt-2 bg-slate-100 [&>div]:bg-police-green" />
          </CardHeader>
          <CardContent className="py-2 px-4 space-y-2">
            {progressItems.map((item) => (
              <div key={item.label} className="flex items-center justify-between text-xs border-b pb-1.5 last:border-b-0">
                <span className="text-muted-foreground">{item.label}</span>
                {item.ok ? (
                  <Badge className="bg-success-soft text-success hover:bg-success-soft flex gap-1 items-center px-1.5 py-0.5">
                    <CheckCircle className="h-3 w-3" /> Capturado
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground border-slate-200 flex gap-1 items-center px-1.5 py-0.5">
                    <HelpCircle className="h-3 w-3 text-slate-400" /> Pendiente
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Structured report preview */}
        <Card className="border-primary/20 bg-gradient-to-br from-white to-primary-soft/20 flex flex-col flex-1 overflow-hidden shadow-sm">
          <CardHeader className="py-3 px-4 shrink-0 border-b">
            <CardTitle className="text-sm font-semibold text-primary-deep flex items-center gap-2">
              <FileText className="h-4 w-4 text-police-green" /> Declaración Formal Estructurada
            </CardTitle>
            <p className="text-[11px] text-muted-foreground">La IA redacta esto formalmente para la fiscalía y comisaría.</p>
          </CardHeader>
          <CardContent className="p-4 flex-1 overflow-y-auto space-y-3">
            <div className="bg-white border rounded-lg p-3 text-xs leading-relaxed text-slate-800 min-h-[120px] shadow-sm font-sans">
              {denuncia.relatoEstructurado ? (
                <p className="whitespace-pre-wrap">{denuncia.relatoEstructurado}</p>
              ) : (
                <p className="text-muted-foreground italic">El acta estructurada se irá redactando automáticamente a medida que nos cuentes tu caso en el chat conversacional...</p>
              )}
            </div>

            {/* Quick Metadata Box */}
            <div className="space-y-1.5 bg-white border rounded-lg p-2.5 text-[11px] shadow-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium flex items-center gap-1"><MapPin className="h-3 w-3" /> Lugar:</span>
                <span className="text-right truncate max-w-[150px] font-semibold">{denuncia.ubicacion?.direccion || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium flex items-center gap-1"><Calendar className="h-3 w-3" /> Fecha/Hora:</span>
                <span className="text-right font-semibold">{denuncia.fechaHecho || "—"}</span>
              </div>
              {denuncia.tipo === "celular" && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">IMEI:</span>
                  <span className="text-right font-mono font-semibold">{denuncia.imei || "—"}</span>
                </div>
              )}
              {denuncia.tipo === "vehiculo" && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">Placa:</span>
                  <span className="text-right font-semibold uppercase">{denuncia.placa || "—"}</span>
                </div>
              )}
            </div>

            {/* Penal classification alert */}
            {denuncia.agravantes && denuncia.agravantes.length > 0 ? (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 flex gap-2">
                <AlertOctagon className="h-5 w-5 text-destructive shrink-0" />
                <div className="text-xs">
                  <p className="font-bold text-destructive">Agravantes Penales Detectados (Art. 189 CP):</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
                    Se detectaron posibles agravantes: <b>{denuncia.agravantes.join(", ")}</b>. Esto califica legalmente la conducta como delito agravado. El expediente policial incorporará automáticamente esta clasificación jurídica.
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-2.5 flex gap-2">
                <AlertTriangle className="h-4.5 w-4.5 text-amber-500 shrink-0" />
                <div className="text-[10px] text-amber-800 leading-snug">
                  Menciona si fue de noche, si hubo más de un asaltante, o si usaron armas, para clasificar agravantes legales en tu acta.
                </div>
              </div>
            )}
          </CardContent>
          
          <div className="p-3 bg-muted/20 border-t shrink-0">
            <Button
              onClick={() => setActiveModule("registro")}
              className="w-full bg-police-green text-white hover:bg-police-green/90 h-10 flex items-center justify-center font-bold text-sm shadow-sm"
            >
              Continuar al Formulario Oficial <ArrowRight className="ml-1.5 h-4.5 w-4.5" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}