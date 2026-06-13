import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { DenunciaProvider, useDenuncia } from "@/lib/denuncia-store";
import { Header } from "@/components/denuncia/Header";
import { CitizenApp } from "@/components/denuncia/CitizenApp";
import { OperatorView } from "@/components/denuncia/OperatorView";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Denuncia360 · Plataforma ciudadana de denuncias" },
      { name: "description", content: "Registre, siga y reciba acompañamiento sobre denuncias por robo y hurto en Perú con apoyo de IA." },
      { property: "og:title", content: "Denuncia360" },
      { property: "og:description", content: "Plataforma digital de denuncias ciudadanas asistidas por IA." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <DenunciaProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <RoleSwitcher />
        <Toaster richColors position="top-right" />
      </div>
    </DenunciaProvider>
  );
}

function RoleSwitcher() {
  const { role } = useDenuncia();
  return role === "ciudadano" ? <CitizenApp /> : <OperatorView />;
}
