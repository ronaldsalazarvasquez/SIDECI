import { useDenuncia } from "@/lib/denuncia-store";
import { ModuleNav } from "./ModuleNav";
import { Module1Preparacion } from "./Module1Preparacion";
import { Module2Narrador } from "./Module2Narrador";
import { Module3Registro } from "./Module3Registro";
import { Module4Confirmacion } from "./Module4Confirmacion";
import { Module5Seguimiento } from "./Module5Seguimiento";
import { Module6Soporte } from "./Module6Soporte";

export function CitizenApp() {
  const { activeModule } = useDenuncia();
  return (
    <>
      <ModuleNav />
      <main className="mx-auto max-w-7xl px-4 py-6">
        {activeModule === "preparacion" && <Module1Preparacion />}
        {activeModule === "narrador" && <Module2Narrador />}
        {activeModule === "registro" && <Module3Registro />}
        {activeModule === "confirmacion" && <Module4Confirmacion />}
        {activeModule === "seguimiento" && <Module5Seguimiento />}
        {activeModule === "soporte" && <Module6Soporte />}
      </main>
    </>
  );
}