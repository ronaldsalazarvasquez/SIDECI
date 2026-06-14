import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LoginPage } from "@/components/denuncia/LoginPage";
import { useDenuncia } from "@/lib/denuncia-store";
import { useEffect } from "react";

export const Route = createFileRoute("/login")({
  component: LoginRoute,
});

function LoginRoute() {
  const { isLoggedIn } = useDenuncia();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      navigate({ to: "/denuncias" });
    }
  }, [isLoggedIn, navigate]);

  return <LoginPage />;
}
