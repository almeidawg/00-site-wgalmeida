import { Building2, Cpu, Hammer, Landmark, Leaf, Ruler, ShieldCheck } from 'lucide-react';
import { getEditorialTheme } from '@/data/editorialThemes';

const ICON_MAP = {
  arquitetura: Ruler,
  'construcao-obra': Building2,
  'cacamba-residuos': Leaf,
  marcenaria: Hammer,
  'projetos-engenharia': Landmark,
  'consultoria-planejamento': ShieldCheck,
  'automacao-tecnologia': Cpu,
  transversal: ShieldCheck,
};

export default function EditorialThemeBadge({ article, className = '' }) {
  const theme = getEditorialTheme(article);
  const Icon = ICON_MAP[theme.id] || ShieldCheck;

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-light uppercase tracking-[0.14em] ${theme.tagClass} ${className}`.trim()}>
      <Icon size={12} />
      {theme.label}
    </span>
  );
}

