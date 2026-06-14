import { useDenuncia } from "@/lib/denuncia-store";
import { ModuleNav } from "./ModuleNav";
import { Module1Preparacion } from "./Module1Preparacion";
import { Module2Narrador } from "./Module2Narrador";
import { Module3Registro } from "./Module3Registro";
import { Module4Confirmacion } from "./Module4Confirmacion";
import { Module5Seguimiento } from "./Module5Seguimiento";
import { Module6Soporte } from "./Module6Soporte";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function CitizenApp() {
  const { activeModule, setActiveModule } = useDenuncia();

  const showWizardNav = ["narrador", "registro", "confirmacion"].includes(activeModule);
  const showBackButton = ["seguimiento", "soporte"].includes(activeModule);

  return (
    <>
      {showWizardNav && <ModuleNav />}
      <main className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        {showBackButton && (
          <div className="flex items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveModule("preparacion")}
              className="flex items-center gap-2 border-slate-200 hover:bg-slate-50 text-slate-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al Panel de Inicio
            </Button>
          </div>
        )}
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