import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CitizenApp } from "@/components/denuncia/CitizenApp";
import { OperatorView } from "@/components/denuncia/OperatorView";
import { useDenuncia } from "@/lib/denuncia-store";
import { useEffect } from "react";

export const Route = createFileRoute("/denuncias")({
  component: DenunciasRoute,
});

function DenunciasRoute() {
  const { isLoggedIn, role, setActiveModule } = useDenuncia();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate({ to: "/login" });
    } else {
      setActiveModule("preparacion");
    }
  }, [isLoggedIn, navigate, setActiveModule]);

  if (!isLoggedIn) return null;

  return role === "ciudadano" ? <CitizenApp /> : <OperatorView />;
}
