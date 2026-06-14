import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useDenuncia, type Role } from "@/lib/denuncia-store";
import { Shield, User, Landmark, Key, Fingerprint, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { MininterLogo } from "./MininterLogo";

export function LoginPage() {
  const { setRole, setIsLoggedIn, updateDenuncia } = useDenuncia();
  const [activeTab, setActiveTab] = useState<Role>("ciudadano");
  const [dni, setDni] = useState("");
  const [cip, setCip] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === "ciudadano") {
      if (dni.length !== 8 || isNaN(Number(dni))) {
        toast.error("El DNI debe tener exactamente 8 dígitos numéricos");
        return;
      }
      if (!password) {
        toast.error("Por favor, ingrese su contraseña o código SMS");
        return;
      }
    } else if (activeTab === "operador") {
      if (cip.length !== 6 || isNaN(Number(cip))) {
        toast.error("El CIP (Carné de Identidad Policial) debe tener exactamente 6 dígitos");
        return;
      }
      if (!password) {
        toast.error("Por favor, ingrese su Token Digital");
        return;
      }
    } else if (activeTab === "fiscal") {
      if (!cip) {
        toast.error("Por favor, ingrese su Registro Fiscal");
        return;
      }
      if (!password) {
        toast.error("Por favor, ingrese su firma digital");
        return;
      }
    }

    setLoading(true);

    // Simulate official authentication network delay
    setTimeout(() => {
      setLoading(false);
      setRole(activeTab);
      setIsLoggedIn(true);

      // Seed current user data based on login details
      if (activeTab === "ciudadano") {
        updateDenuncia({ dni: dni });
        toast.success("Autenticado con éxito ante el Portal del Ciudadano.");
      } else if (activeTab === "operador") {
        toast.success("Acceso policial validado. Conectado al sistema SIDECI.");
      } else {
        toast.success("Acceso de fiscalización concedido. Conectado al Ministerio Público.");
      }
    }, 1800);
  };

  return (
    <div 
      className="relative min-h-[90vh] flex items-center justify-center bg-slate-50 p-4 overflow-hidden"
      style={{
        backgroundImage: "url('/institutional_login_bg.png')",
        backgroundRepeat: "repeat",
        backgroundSize: "400px 400px"
      }}
    >
      {/* Decorative National Solid Header Line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-primary z-10" />

      {/* Main Glassmorphic Login Container (Light Theme) */}
      <Card className="w-full max-w-md border-slate-200 bg-white/95 backdrop-blur-md shadow-2xl text-slate-800 relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-10 w-10 text-police-green animate-spin" />
            <div className="text-center space-y-1">
              <span className="block text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                {activeTab === "ciudadano" ? "Validando ante RENIEC..." : activeTab === "operador" ? "Autenticando CIP y Token..." : "Verificando Firma Digital..."}
              </span>
              <span className="text-[10px] text-muted-foreground block font-medium">
                Conexión segura cifrada SSL/TLS
              </span>
            </div>
          </div>
        )}

        <CardHeader className="text-center border-b border-slate-100 pb-6 bg-slate-50/50">
          {/* Logo Oficial Gob.pe / MININTER */}
          <MininterLogo height="h-10" className="mx-auto mb-3" />
          <CardTitle className="text-2xl font-extrabold text-primary-deep tracking-tight uppercase">
            SIDECI
          </CardTitle>
          <CardDescription className="text-slate-500 text-xs mt-1 font-semibold uppercase tracking-wider">
            Plataforma Unificada del Ministerio del Interior
          </CardDescription>
        </CardHeader>

        {/* Custom Light Tab Selector */}
        <div className="grid grid-cols-3 p-1 bg-slate-100/80 border-b border-slate-200 text-xs">
          {[
            { id: "ciudadano" as Role, label: "Ciudadano", icon: User },
            { id: "operador" as Role, label: "Policía PNP", icon: Shield },
            { id: "fiscal" as Role, label: "Fiscalía", icon: Landmark }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setPassword("");
                }}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-2.5 rounded transition-all font-bold ${
                  active
                    ? "bg-white text-slate-900 border border-slate-200/50 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <CardContent className="pt-6">
          <form onSubmit={handleLogin} className="space-y-4">
            {activeTab === "ciudadano" && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="dni" className="text-xs text-slate-600 font-bold uppercase tracking-wider">
                    Número de DNI
                  </Label>
                  <div className="relative">
                    <Input
                      id="dni"
                      placeholder="Ingrese los 8 dígitos"
                      maxLength={8}
                      value={dni}
                      onChange={(e) => setDni(e.target.value.replace(/\D/g, ""))}
                      className="bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-primary pr-9"
                    />
                    <Fingerprint className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="pass-c" className="text-xs text-slate-600 font-bold uppercase tracking-wider">
                    Contraseña / Clave Única
                  </Label>
                  <div className="relative">
                    <Input
                      id="pass-c"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-primary"
                    />
                  </div>
                </div>
              </>
            )}

            {activeTab === "operador" && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="cip" className="text-xs text-slate-600 font-bold uppercase tracking-wider">
                    Carné de Identidad Policial (CIP)
                  </Label>
                  <div className="relative">
                    <Input
                      id="cip"
                      placeholder="Ingrese los 6 dígitos"
                      maxLength={6}
                      value={cip}
                      onChange={(e) => setCip(e.target.value.replace(/\D/g, ""))}
                      className="bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-police-green pr-9"
                    />
                    <Shield className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="pass-p" className="text-xs text-slate-600 font-bold uppercase tracking-wider">
                    Token Digital / Clave de Acceso
                  </Label>
                  <div className="relative">
                    <Input
                      id="pass-p"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-police-green"
                    />
                  </div>
                </div>
              </>
            )}

            {activeTab === "fiscal" && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="reg" className="text-xs text-slate-600 font-bold uppercase tracking-wider">
                    Registro de Fiscalía de la Nación
                  </Label>
                  <div className="relative">
                    <Input
                      id="reg"
                      placeholder="Código de Registro MP"
                      value={cip}
                      onChange={(e) => setCip(e.target.value)}
                      className="bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-600 pr-9"
                    />
                    <Landmark className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="pass-f" className="text-xs text-slate-600 font-bold uppercase tracking-wider">
                    Clave de Firma Digital (Firma.pe)
                  </Label>
                  <div className="relative">
                    <Input
                      id="pass-f"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-600"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Simulated legal context text */}
            <p className="text-[10px] text-slate-500 leading-normal text-center bg-slate-50 border border-slate-150 p-2.5 rounded">
              Usted está ingresando a un sistema estatal protegido. La suplantación de identidad o declaraciones falsas en este portal se penalizan de acuerdo a las leyes de la República del Perú.
            </p>

            <Button
              type="submit"
              className={`w-full py-5 font-bold text-xs rounded-lg text-white shadow-sm flex items-center justify-center gap-1.5 mt-2 transition-all ${
                activeTab === "ciudadano" 
                  ? "bg-primary hover:bg-primary-deep" 
                  : activeTab === "operador" 
                  ? "bg-police-green hover:bg-police-green/90" 
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              Autenticar e Ingresar
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
