import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type Role = "ciudadano" | "operador";
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
});

interface Ctx {
  role: Role;
  setRole: (r: Role) => void;
  activeModule: ModuleKey;
  setActiveModule: (m: ModuleKey) => void;
  prepared: boolean;
  setPrepared: (b: boolean) => void;
  denuncia: Denuncia;
  updateDenuncia: (patch: Partial<Denuncia>) => void;
  setEstado: (k: EstadoKey, status: EstadoStatus, detalle?: string) => void;
  archivar: () => void;
  addMensaje: (m: Omit<Mensaje, "id" | "fecha">) => void;
  addEvidencia: (e: Omit<Evidencia, "id">) => void;
  denuncias: Denuncia[];
}

const DenunciaCtx = createContext<Ctx | null>(null);

export function DenunciaProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("ciudadano");
  const [activeModule, setActiveModule] = useState<ModuleKey>("preparacion");
  const [prepared, setPrepared] = useState(false);
  const [denuncia, setDenuncia] = useState<Denuncia>(() => seedDenuncia());

  const updateDenuncia = (patch: Partial<Denuncia>) => setDenuncia((d) => ({ ...d, ...patch }));

  const setEstado: Ctx["setEstado"] = (k, status, detalle) =>
    setDenuncia((d) => ({
      ...d,
      timeline: d.timeline.map((t) =>
        t.key === k
          ? { ...t, status, fecha: status === "pendiente" ? undefined : new Date().toLocaleString("es-PE", { hour: "2-digit", minute: "2-digit" }), detalle: detalle ?? t.detalle }
          : t,
      ),
    }));

  const archivar = () =>
    setDenuncia((d) => ({
      ...d,
      archivado: true,
      diasParaApelar: 5,
      timeline: d.timeline.map((t) => (t.key === "resultado" ? { ...t, status: "archivado", fecha: new Date().toLocaleString("es-PE"), detalle: "Archivado provisionalmente" } : t)),
      mensajes: [
        ...d.mensajes,
        { id: `m-${Date.now()}`, autor: "sistema", texto: "Su caso fue archivado provisionalmente. Tiene 5 días para presentar observaciones.", fecha: "Ahora" },
      ],
    }));

  const addMensaje: Ctx["addMensaje"] = (m) =>
    setDenuncia((d) => ({
      ...d,
      mensajes: [...d.mensajes, { ...m, id: `m-${Date.now()}`, fecha: new Date().toLocaleString("es-PE", { hour: "2-digit", minute: "2-digit" }) }],
    }));

  const addEvidencia: Ctx["addEvidencia"] = (e) =>
    setDenuncia((d) => ({ ...d, evidencias: [...d.evidencias, { ...e, id: `e-${Date.now()}` }] }));

  const denuncias = useMemo<Denuncia[]>(
    () => [
      denuncia,
      { ...seedDenuncia(), id: "d-2026-001244", expediente: "2026-001244", tipo: "Robo de vehículo", ubicacion: { ...seedDenuncia().ubicacion, direccion: "Av. Brasil 1500, Jesús María" } },
      { ...seedDenuncia(), id: "d-2026-001243", expediente: "2026-001243", tipo: "Hurto en vía pública" },
    ],
    [denuncia],
  );

  return (
    <DenunciaCtx.Provider
      value={{ role, setRole, activeModule, setActiveModule, prepared, setPrepared, denuncia, updateDenuncia, setEstado, archivar, addMensaje, addEvidencia, denuncias }}
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