import {
  Home,
  Footprints,
  Users,
  ClipboardList,
  Nfc,
  Boxes,
  Wallet,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  /** Aparece na barra inferior no celular. */
  emMobile: boolean;
}

// Ordem do menu lateral (desktop) — segue a ordem pedida na Fase 2.
export const NAV_ITEMS: NavItem[] = [
  { path: "/", label: "Início", icon: Home, emMobile: true },
  { path: "/prospeccao", label: "Prospecção", icon: Footprints, emMobile: true },
  { path: "/clientes", label: "Clientes", icon: Users, emMobile: true },
  { path: "/pedidos", label: "Pedidos", icon: ClipboardList, emMobile: true },
  { path: "/etiquetas", label: "Etiquetas NFC", icon: Nfc, emMobile: false },
  { path: "/estoque", label: "Estoque", icon: Boxes, emMobile: false },
  { path: "/financeiro", label: "Financeiro", icon: Wallet, emMobile: false },
  { path: "/configuracoes", label: "Configurações", icon: Settings, emMobile: false },
];

// Ordem da barra inferior no celular — pedida explicitamente na Fase 2:
// Início, Pedidos, Prospecção, Clientes, e "Mais" com o resto.
export const MOBILE_PRIMARY_PATHS = ["/", "/pedidos", "/prospeccao", "/clientes"];

export const MOBILE_PRIMARY_ITEMS = MOBILE_PRIMARY_PATHS.map(
  (path) => NAV_ITEMS.find((item) => item.path === path)!,
);

export const MOBILE_MAIS_ITEMS = NAV_ITEMS.filter(
  (item) => !MOBILE_PRIMARY_PATHS.includes(item.path),
);

export interface TelaConfig {
  titulo: string;
}

// Título de topo por rota. O botão de ação primária da Topbar é
// registrado por cada página via usePrimaryAction (src/lib/usePrimaryAction.ts),
// porque só a página sabe o que "Novo pedido" deve de fato abrir.
export const TELAS: Record<string, TelaConfig> = {
  "/": { titulo: "Início" },
  "/prospeccao": { titulo: "Prospecção" },
  "/clientes": { titulo: "Clientes" },
  "/pedidos": { titulo: "Pedidos" },
  "/etiquetas": { titulo: "Etiquetas NFC" },
  "/estoque": { titulo: "Estoque" },
  "/financeiro": { titulo: "Financeiro" },
  "/configuracoes": { titulo: "Configurações" },
};
