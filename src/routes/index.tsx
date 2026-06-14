import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useDenuncia } from "@/lib/denuncia-store";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SIDECI · Sistema de Denuncias Ciudadanas" },
      { name: "description", content: "Registre, siga y reciba acompañamiento sobre denuncias por robo y hurto en Perú con apoyo de IA." },
      { property: "og:title", content: "SIDECI · Sistema de Denuncias Ciudadanas" },
      { property: "og:description", content: "Plataforma digital de denuncias ciudadanas asistidas por IA." },
    ],
  }),
  component: Index,
});

function Index() {
  const { isLoggedIn } = useDenuncia();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      navigate({ to: "/denuncias" });
    } else {
      navigate({ to: "/login" });
    }
  }, [isLoggedIn, navigate]);

  return null;
}
