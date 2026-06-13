import { Shield, UserCog, User } from "lucide-react";
import { useDenuncia } from "@/lib/denuncia-store";
import { Button } from "@/components/ui/button";

export function Header() {
  const { role, setRole } = useDenuncia();
  return (
    <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Shield className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold text-primary-deep sm:text-lg">Denuncia360</h1>
            <p className="hidden text-xs text-muted-foreground sm:block">Plataforma ciudadana de denuncias · Perú</p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full border bg-secondary p-1">
          <span className="hidden px-2 text-xs font-medium text-muted-foreground md:inline">Modo DEV:</span>
          <Button
            size="sm"
            variant={role === "ciudadano" ? "default" : "ghost"}
            className={role === "ciudadano" ? "rounded-full" : "rounded-full text-muted-foreground"}
            onClick={() => setRole("ciudadano")}
          >
            <User className="mr-1 h-4 w-4" /> Ciudadano
          </Button>
          <Button
            size="sm"
            variant={role === "operador" ? "default" : "ghost"}
            className={role === "operador" ? "rounded-full bg-police-green text-white hover:bg-police-green/90" : "rounded-full text-muted-foreground"}
            onClick={() => setRole("operador")}
          >
            <UserCog className="mr-1 h-4 w-4" /> Operador
          </Button>
        </div>
      </div>
    </header>
  );
}