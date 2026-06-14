import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CitizenApp } from "@/components/denuncia/CitizenApp";
import { useDenuncia } from "@/lib/denuncia-store";
import { useEffect } from "react";

export const Route = createFileRoute("/soporte")({
  component: SoporteRoute,
});

function SoporteRoute() {
  const { isLoggedIn, setActiveModule } = useDenuncia();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate({ to: "/login" });
    } else {
      setActiveModule("soporte");
    }
  }, [isLoggedIn, navigate, setActiveModule]);

  if (!isLoggedIn) return null;

  return <CitizenApp />;
}
