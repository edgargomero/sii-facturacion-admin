import * as React from "react";
import {
  Building2,
  ShieldCheck,
  FolderKey,
  FileText,
  CheckCircle2,
  ChevronRight,
  X,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  details: string[];
}

const steps: OnboardingStep[] = [
  {
    id: 1,
    title: "Crear Empresa",
    description: "Registra los datos de tu empresa emisora",
    icon: Building2,
    href: "/admin/empresas/nueva",
    details: [
      "RUT, Razon Social y Giro",
      "Direccion completa",
      "Numero de Resolucion SII (0 para certificacion)",
      "Seleccionar ambiente: Certificacion o Produccion",
    ],
  },
  {
    id: 2,
    title: "Cargar Certificado Digital",
    description: "Sube tu certificado .pfx o .p12",
    icon: ShieldCheck,
    href: "/admin/empresas",
    details: [
      "Archivo .pfx o .p12 vigente",
      "Contrasena del certificado",
      "Debe corresponder al representante legal",
    ],
  },
  {
    id: 3,
    title: "Cargar Folios (CAF)",
    description: "Sube los archivos CAF del SII",
    icon: FolderKey,
    href: "/admin/caf/cargar",
    details: [
      "Descargar CAF desde portal SII",
      "Un CAF por tipo de documento",
      "Tipos: Factura (33), Boleta (39), etc.",
    ],
  },
  {
    id: 4,
    title: "Emitir Documentos",
    description: "Ya puedes generar DTEs",
    icon: FileText,
    href: "/admin/dte/factura",
    details: [
      "Facturas electronicas (tipo 33)",
      "Boletas electronicas (tipo 39)",
      "Notas de credito/debito",
    ],
  },
];

const STORAGE_KEY = "sii-onboarding-dismissed";

export function OnboardingGuide() {
  const [dismissed, setDismissed] = React.useState(true);
  const [currentStep, setCurrentStep] = React.useState(1);

  React.useEffect(() => {
    const isDismissed = localStorage.getItem(STORAGE_KEY);
    setDismissed(isDismissed === "true");
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setDismissed(true);
  };

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setDismissed(false);
    setCurrentStep(1);
  };

  if (dismissed) {
    return (
      <button
        onClick={handleReset}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <HelpCircle className="h-4 w-4" />
        <span>Ver guia de inicio</span>
      </button>
    );
  }

  const activeStep = steps.find((s) => s.id === currentStep) || steps[0];

  return (
    <div className="rounded-xl border bg-gradient-to-br from-primary/5 to-primary/10 p-6 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Guia de Configuracion Inicial
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Sigue estos pasos para comenzar a emitir documentos electronicos
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Cerrar guia"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-6">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <button
              onClick={() => setCurrentStep(step.id)}
              className={`flex items-center justify-center h-8 w-8 rounded-full text-sm font-medium transition-colors ${
                currentStep === step.id
                  ? "bg-primary text-primary-foreground"
                  : currentStep > step.id
                    ? "bg-green-500 text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {currentStep > step.id ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                step.id
              )}
            </button>
            {index < steps.length - 1 && (
              <div
                className={`h-0.5 flex-1 ${
                  currentStep > step.id ? "bg-green-500" : "bg-muted"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Active step content */}
      <div className="bg-background/50 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <activeStep.icon className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-lg">{activeStep.title}</h4>
            <p className="text-sm text-muted-foreground mb-3">
              {activeStep.description}
            </p>
            <ul className="space-y-1.5">
              {activeStep.details.map((detail, i) => (
                <li
                  key={i}
                  className="text-sm text-muted-foreground flex items-center gap-2"
                >
                  <ChevronRight className="h-3 w-3 text-primary" />
                  {detail}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentStep(Math.min(steps.length, currentStep + 1))
            }
            disabled={currentStep === steps.length}
          >
            Siguiente
          </Button>
        </div>
        <a href={activeStep.href}>
          <Button size="sm">
            Ir a {activeStep.title}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </a>
      </div>
    </div>
  );
}
