import { useDenuncia, type ModuleKey } from "@/lib/denuncia-store";
import { ClipboardCheck, Mic, FileText, BadgeCheck, Activity, MessagesSquare, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const steps: { key: ModuleKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "narrador", label: "Narrador IA", icon: Mic },
  { key: "registro", label: "Registro", icon: FileText },
  { key: "confirmacion", label: "Confirmación", icon: BadgeCheck },
];

export function ModuleNav() {
  const { activeModule, setActiveModule } = useDenuncia();
  const activeIdx = steps.findIndex((s) => s.key === activeModule);
  return (
    <nav className="border-b bg-primary-soft/40">
      <div className="mx-auto max-w-7xl overflow-x-auto px-2 py-3">
        <ol className="flex min-w-max items-center gap-1">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const done = i < activeIdx;
            const active = i === activeIdx;
            return (
              <li key={s.key} className="flex items-center">
                <button
                  onClick={() => setActiveModule(s.key)}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition",
                    active && "bg-primary text-primary-foreground shadow-sm",
                    done && "bg-police-green-soft text-police-green",
                    !active && !done && "text-muted-foreground hover:bg-white",
                  )}
                >
                  <span className={cn("grid h-6 w-6 place-items-center rounded-full text-xs", active ? "bg-white/20" : done ? "bg-police-green text-white" : "bg-white border")}>
                    {done ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                  </span>
                  <span className="whitespace-nowrap">{i + 1}. {s.label}</span>
                </button>
                {i < steps.length - 1 && <span className="mx-1 h-px w-4 bg-border" />}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}