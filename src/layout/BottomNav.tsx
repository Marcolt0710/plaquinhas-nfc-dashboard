import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";
import { MOBILE_MAIS_ITEMS, MOBILE_PRIMARY_ITEMS } from "../lib/nav";
import { MaisSheet } from "./MaisSheet";

// Barra inferior fixa no celular, com os quatro itens mais usados na
// rua + "Mais" para o resto (Fase 2).
export function BottomNav() {
  const [maisAberto, setMaisAberto] = useState(false);
  const { pathname } = useLocation();
  const algumItemMaisAtivo = MOBILE_MAIS_ITEMS.some((item) => item.path === pathname);

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-card pb-[env(safe-area-inset-bottom)] md:hidden">
        {MOBILE_PRIMARY_ITEMS.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/"}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-2.5 text-xs ${
                isActive ? "text-accent" : "text-secondary"
              }`
            }
          >
            <Icon size={20} strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
        <button
          type="button"
          onClick={() => setMaisAberto(true)}
          className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-xs ${
            algumItemMaisAtivo ? "text-accent" : "text-secondary"
          }`}
        >
          <MoreHorizontal size={20} strokeWidth={1.75} />
          Mais
        </button>
      </nav>
      <MaisSheet aberto={maisAberto} onFechar={() => setMaisAberto(false)} />
    </>
  );
}
