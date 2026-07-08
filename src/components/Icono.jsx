import {
  AcademicCapIcon,
  CalculatorIcon,
  DocumentTextIcon,
  BuildingLibraryIcon,
  CurrencyDollarIcon,
  ScaleIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  BriefcaseIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

// Mapa nombre -> componente Heroicon. Fallback a ChatBubble si no existe.
const MAPA = {
  AcademicCap: AcademicCapIcon,
  Calculator: CalculatorIcon,
  DocumentText: DocumentTextIcon,
  BuildingLibrary: BuildingLibraryIcon,
  CurrencyDollar: CurrencyDollarIcon,
  Scale: ScaleIcon,
  Users: UsersIcon,
  ClipboardDocumentList: ClipboardDocumentListIcon,
  Briefcase: BriefcaseIcon,
  ShieldCheck: ShieldCheckIcon,
};

export default function Icono({ nombre, className = 'h-6 w-6' }) {
  const Componente = MAPA[nombre] || ChatBubbleLeftRightIcon;
  return <Componente className={className} aria-hidden="true" />;
}
