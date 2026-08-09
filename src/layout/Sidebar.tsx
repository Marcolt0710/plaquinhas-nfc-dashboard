import { NavLink } from "react-router-dom";
import { NAV_ITEMS } from "../lib/nav";

// Menu lateral fixo, só em telas médias/grandes (ver BottomNav para o celular).
export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card md:flex">
      <div className="px-5 py-6">
        <span className="text-lg font-semibold text-primary">Plaquinhas NFC</span>
        <p className="mt-0.5 text-xs text-secondary">Dashboard de gestão</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2.5 text-base transition-colors ${
                isActive
                  ? "bg-accent-tint text-accent"
                  : "text-secondary hover:bg-card-hover hover:text-primary"
              }`
            }
          >
            <Icon size={18} strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
