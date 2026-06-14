import { Shield, User, Landmark, LogOut } from "lucide-react";
import { useDenuncia } from "@/lib/denuncia-store";
import { Button } from "@/components/ui/button";
import { MininterLogo } from "./MininterLogo";

export function Header() {
  const { role, isLoggedIn, setIsLoggedIn, setActiveModule, denuncia } = useDenuncia();

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveModule("preparacion");
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur shadow-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5">
        {/* Clickable Brand Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => {
            if (isLoggedIn) {
              setActiveModule("preparacion");
            }
          }}
        >
          {/* Logo Oficial Gob.pe / MININTER */}
          <MininterLogo height="h-8" />

          {/* Separator and App Title */}
          <div className="hidden sm:block h-6 w-px bg-slate-200 shrink-0" />
          
          <div className="min-w-0">
            <h1 className="text-sm font-black text-primary sm:text-base tracking-tight leading-none">SIDECI</h1>
            <span className="text-[7px] text-muted-foreground font-bold tracking-wider uppercase block">Portal Ciudadano</span>
          </div>
        </div>

        {/* User Session Info / Logout */}
        {isLoggedIn ? (
          <div className="flex items-center gap-3">
            {role === "ciudadano" && (
              <div className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border bg-slate-50 text-xs font-semibold text-slate-700">
                <User className="h-3.5 w-3.5 text-primary" />
                <span className="hidden sm:inline">Ciudadano:</span>
                <span className="hidden sm:inline font-mono">DNI {denuncia.dni || "70123456"}</span>
              </div>
            )}
            {role === "operador" && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-police-green-soft text-xs font-semibold text-police-green">
                <Shield className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Instructor:</span> Comisario Torres
              </div>
            )}
            {role === "fiscal" && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-indigo-50 text-xs font-semibold text-indigo-700">
                <Landmark className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Supervisor:</span> Fiscalía Lince
              </div>
            )}

            <Button
              size="sm"
              variant="ghost"
              onClick={handleLogout}
              className="text-slate-500 hover:text-slate-900 rounded-full hover:bg-slate-100 flex items-center gap-1"
              title="Cerrar Sesión"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline text-xs font-bold">Salir</span>
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-slate-50 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            Portal Oficial de Acceso
          </div>
        )}
      </div>
    </header>
  );
}