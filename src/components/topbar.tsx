import { Bell, Command, Search } from "lucide-react";

export function Topbar() {
  return (
    <header className="topbar">
      <label className="global-search">
        <Search size={17} />
        <input aria-label="Buscar vagas e empresas" placeholder="Buscar vagas, empresas ou tecnologias" />
        <span><Command size={12} /> K</span>
      </label>
      <div className="topbar-actions">
        <span className="agent-status"><i /> Agente ativo</span>
        <button className="icon-button" aria-label="Notificações"><Bell size={18} /></button>
      </div>
    </header>
  );
}
