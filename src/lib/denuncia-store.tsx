import { createContext, useContext, useMemo, useState, useEffect, type ReactNode } from "react";
import mockDenunciasData from "./mock-denuncias.json";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export type Role = "ciudadano" | "operador" | "fiscal";
export type ModuleKey = "preparacion" | "narrador" | "registro" | "confirmacion" | "seguimiento" | "soporte";

export type EstadoKey = "registro" | "validacion" | "asignacion" | "revision" | "investigacion" | "resultado";
export type EstadoStatus = "completado" | "en_proceso" | "pendiente" | "archivado";

export interface EstadoTimeline {
  key: EstadoKey;
  label: string;
  status: EstadoStatus;
  fecha?: string;
  detalle?: string;
}

export interface Evidencia {
  id: string;
  tipo: "foto" | "video" | "audio" | "documento";
  nombre: string;
  url?: string;
}

export interface Mensaje {
  id: string;
  autor: "ciudadano" | "pnp" | "sistema" | "legal";
  texto: string;
  fecha: string;
}

export interface Denuncia {
  id: string;
  expediente: string;
  tipo: string;
  relato: string;
  relatoEstructurado: string;
  agravantes: string[];
  dni: string;
  imei?: string;
  placa?: string;
  ubicacion: { lat: number; lng: number; direccion: string };
  fechaHecho: string;
  evidencias: Evidencia[];
  testigos: { nombre: string; contacto: string }[];
  timeline: EstadoTimeline[];
  mensajes: Mensaje[];
  archivado?: boolean;
  diasParaApelar?: number;
  narradorChat?: ChatMessage[];
}

const defaultTimeline = (): EstadoTimeline[] => [
  { key: "registro", label: "Registro", status: "completado", fecha: "Hoy 10:12", detalle: "Denuncia recibida en el sistema." },
  { key: "validacion", label: "Validación", status: "completado", fecha: "Hoy 10:18", detalle: "Datos validados por operador." },
  { key: "asignacion", label: "Asignación", status: "en_proceso", fecha: "Hoy 10:25", detalle: "Asignando a comisaría jurisdiccional." },
  { key: "revision", label: "En revisión", status: "pendiente" },
  { key: "investigacion", label: "Investigación", status: "pendiente" },
  { key: "resultado", label: "Resultado final", status: "pendiente" },
];

const seedDenuncia = (): Denuncia => ({
  id: "d-2026-001245",
  expediente: "2026-001245",
  tipo: "Hurto agravado de celular",
  relato: "",
  relatoEstructurado:
    "El día de hoy, aproximadamente a las 21:30 hrs, en la Av. Arequipa cuadra 25, dos sujetos desconocidos se acercaron al denunciante y mediante amenaza con arma blanca le sustrajeron su teléfono celular marca Samsung.",
  agravantes: ["Nocturnidad", "Pluralidad de agentes", "Uso de arma blanca"],
  dni: "70123456",
  imei: "356938035643809",
  placa: undefined,
  ubicacion: { lat: -12.0931, lng: -77.0465, direccion: "Av. Arequipa 2500, Lince, Lima" },
  fechaHecho: "2026-03-14 21:30",
  evidencias: [
    { id: "e1", tipo: "foto", nombre: "lugar_hechos.jpg" },
    { id: "e2", tipo: "documento", nombre: "factura_celular.pdf" },
  ],
  testigos: [{ nombre: "María López", contacto: "+51 987 654 321" }],
  timeline: defaultTimeline(),
  mensajes: [
    { id: "m1", autor: "sistema", texto: "Denuncia registrada correctamente.", fecha: "Hoy 10:12" },
    { id: "m2", autor: "pnp", texto: "Su caso ha sido recibido. En breve será asignado.", fecha: "Hoy 10:20" },
  ],
  narradorChat: [
    {
      role: "assistant",
      content: "Hola. Soy el asistente de denuncias de la PNP. Estoy aquí para escucharte y ayudarte a preparar tu denuncia de forma rápida. Cuéntame con tus palabras, ¿qué sucedió?",
    },
  ],
});

interface Ctx {
  role: Role;
  setRole: (r: Role) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (b: boolean) => void;
  activeModule: ModuleKey;
  setActiveModule: (m: ModuleKey) => void;
  prepared: boolean;
  setPrepared: (b: boolean) => void;
  denuncia: Denuncia;
  updateDenuncia: (patch: Partial<Denuncia>) => void;
  selectDenuncia: (id: string) => void;
  setEstado: (k: EstadoKey, status: EstadoStatus, detalle?: string) => void;
  archivar: () => void;
  addMensaje: (m: Omit<Mensaje, "id" | "fecha">) => void;
  addEvidencia: (e: Omit<Evidencia, "id">) => void;
  denuncias: Denuncia[];
  openaiApiKey: string;
  setOpenaiApiKey: (key: string) => void;
}

const DenunciaCtx = createContext<Ctx | null>(null);

export function DenunciaProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  const [role, setRole] = useState<Role>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sideci_role");
      return (saved as Role) || "ciudadano";
    }
    return "ciudadano";
  });
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sideci_isLoggedIn") === "true";
    }
    return false;
  });
  const [activeModule, setActiveModule] = useState<ModuleKey>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("expediente") || params.get("denunciaId")) {
        return "seguimiento";
      }
      const saved = localStorage.getItem("sideci_activeModule");
      return (saved as ModuleKey) || "preparacion";
    }
    return "preparacion";
  });
  const [prepared, setPrepared] = useState(false);
  const [denuncias, setDenuncias] = useState<Denuncia[]>(() => mockDenunciasData as Denuncia[]);
  const [denuncia, setDenuncia] = useState<Denuncia>(() => (mockDenunciasData[0] as Denuncia) || seedDenuncia());
  const [openaiApiKey, setOpenaiApiKeyInternal] = useState<string>("");

  // Persist state to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sideci_role", role);
    }
  }, [role]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sideci_isLoggedIn", String(isLoggedIn));
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sideci_activeModule", activeModule);
    }
  }, [activeModule]);

  // Synchronize state changes with router paths
  useEffect(() => {
    if (isLoggedIn) {
      if (activeModule === "preparacion") {
        navigate({ to: "/denuncias" });
      } else {
        navigate({ to: `/${activeModule}` });
      }
    } else {
      navigate({ to: "/login" });
    }
  }, [activeModule, isLoggedIn, navigate]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("denuncia360_openai_key");
      if (stored) {
        setOpenaiApiKeyInternal(stored);
      }
    }
  }, []);

  // Handle deep-linking from shared URLs or QR codes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const expediente = params.get("expediente");
      const denunciaId = params.get("denunciaId");

      if (expediente || denunciaId) {
        const found = denuncias.find((d) => d.expediente === expediente || d.id === denunciaId);
        if (found) {
          setIsLoggedIn(true);
          setRole("ciudadano");
          setDenuncia(found);
          setActiveModule("seguimiento");
          toast.success(`Expediente N° ${found.expediente} cargado para seguimiento.`);
        } else {
          // If not in the pre-loaded list, seed a custom tracker for this code so it works gracefully
          const newMock: Denuncia = {
            ...seedDenuncia(),
            id: denunciaId || `d-${expediente || Date.now()}`,
            expediente: expediente || "2026-001245",
            tipo: "Denuncia Consultada por Enlace",
            timeline: defaultTimeline(),
          };
          setIsLoggedIn(true);
          setRole("ciudadano");
          setDenuncia(newMock);
          setDenuncias((list) => [newMock, ...list]);
          setActiveModule("seguimiento");
          toast.success(`Expediente N° ${newMock.expediente} cargado.`);
        }
      }
    }
  }, [denuncias]);

  const setOpenaiApiKey = (key: string) => {
    setOpenaiApiKeyInternal(key);
    if (typeof window !== "undefined") {
      localStorage.setItem("denuncia360_openai_key", key);
    }
  };

  const updateDenuncia = (patch: Partial<Denuncia>) => {
    setDenuncia((d) => {
      const updated = { ...d, ...patch };
      setDenuncias((list) => list.map(item => item.id === d.id ? updated : item));
      return updated;
    });
  };

  const selectDenuncia = (id: string) => {
    const found = denuncias.find(item => item.id === id);
    if (found) {
      setDenuncia(found);
    }
  };

  const setEstado: Ctx["setEstado"] = (k, status, detalle) =>
    setDenuncia((d) => {
      const updated = {
        ...d,
        timeline: d.timeline.map((t) =>
          t.key === k
            ? { ...t, status, fecha: status === "pendiente" ? undefined : new Date().toLocaleString("es-PE", { hour: "2-digit", minute: "2-digit" }), detalle: detalle ?? t.detalle }
            : t,
        ),
      };
      setDenuncias((list) => list.map(item => item.id === d.id ? updated : item));
      return updated;
    });

  const archivar = () =>
    setDenuncia((d) => {
      const updated = {
        ...d,
        archivado: true,
        diasParaApelar: 5,
        timeline: d.timeline.map((t) => (t.key === "resultado" ? { ...t, status: "archivado" as EstadoStatus, fecha: new Date().toLocaleString("es-PE"), detalle: "Archivado provisionalmente" } : t)),
        mensajes: [
          ...d.mensajes,
          { id: `m-${Date.now()}`, autor: "sistema" as const, texto: "Su caso fue archivado provisionalmente. Tiene 5 días para presentar observaciones.", fecha: "Ahora" },
        ],
      };
      setDenuncias((list) => list.map(item => item.id === d.id ? updated : item));
      return updated;
    });

  const addMensaje: Ctx["addMensaje"] = (m) =>
    setDenuncia((d) => {
      const updated = {
        ...d,
        mensajes: [...d.mensajes, { ...m, id: `m-${Date.now()}`, fecha: new Date().toLocaleString("es-PE", { hour: "2-digit", minute: "2-digit" }) }],
      };
      setDenuncias((list) => list.map(item => item.id === d.id ? updated : item));
      return updated;
    });

  const addEvidencia: Ctx["addEvidencia"] = (e) =>
    setDenuncia((d) => {
      const updated = { ...d, evidencias: [...d.evidencias, { ...e, id: `e-${Date.now()}` }] };
      setDenuncias((list) => list.map(item => item.id === d.id ? updated : item));
      return updated;
    });

  return (
    <DenunciaCtx.Provider
      value={{
        role,
        setRole,
        isLoggedIn,
        setIsLoggedIn,
        activeModule,
        setActiveModule,
        prepared,
        setPrepared,
        denuncia,
        updateDenuncia,
        selectDenuncia,
        setEstado,
        archivar,
        addMensaje,
        addEvidencia,
        denuncias,
        openaiApiKey,
        setOpenaiApiKey,
      }}
    >
      {children}
    </DenunciaCtx.Provider>
  );
}

export function useDenuncia() {
  const v = useContext(DenunciaCtx);
  if (!v) throw new Error("useDenuncia must be used within DenunciaProvider");
  return v;
}