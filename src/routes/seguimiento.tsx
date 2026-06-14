import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CitizenApp } from "@/components/denuncia/CitizenApp";
import { useDenuncia } from "@/lib/denuncia-store";
import { useEffect } from "react";

export const Route = createFileRoute("/seguimiento")({
  component: SeguimientoRoute,
});

function SeguimientoRoute() {
  const { isLoggedIn, setActiveModule } = useDenuncia();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate({ to: "/login" });
    } else {
      setActiveModule("seguimiento");
    }
  }, [isLoggedIn, navigate, setActiveModule]);

  if (!isLoggedIn) return null;

  return <CitizenApp />;
}
