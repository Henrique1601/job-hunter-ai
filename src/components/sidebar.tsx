"use client";

import {
  BriefcaseBusiness,
  ChartNoAxesCombined,
  FileText,
  Radar,
  Settings,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { href: "/", label: "Visão geral", icon: ChartNoAxesCombined },
  { href: "/vagas", label: "Vagas", icon: Radar, badge: "28" },
  { href: "/candidaturas", label: "Candidaturas", icon: BriefcaseBusiness },
  { href: "/curriculos", label: "Currículos", icon: FileText },
  { href: "/perfil", label: "Meu perfil", icon: UserRound },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <Link href="/" className="brand" aria-label="Job Hunter AI — início">
        <span className="brand-mark"><Radar size={21} /></span>
        <span><strong>Job Hunter</strong><small>AI command center</small></span>
      </Link>

      <nav className="primary-nav" aria-label="Navegação principal">
        <p className="nav-label">Operação</p>
        {navigation.map(({ href, label, icon: Icon, badge }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
          <Link key={href} href={href} className={`nav-item${isActive ? " active" : ""}`}>
            <Icon size={18} strokeWidth={1.8} />
            <span>{label}</span>
            {badge ? <b>{badge}</b> : null}
          </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <Link
          href="/configuracoes"
          className={`nav-item${pathname.startsWith("/configuracoes") ? " active" : ""}`}
        >
          <Settings size={18} strokeWidth={1.8} />
          <span>Configurações</span>
        </Link>
        <div className="profile-chip">
          <span className="avatar">HS</span>
          <span><strong>Henrique Silva</strong><small>Plano individual</small></span>
        </div>
      </div>
    </aside>
  );
}
