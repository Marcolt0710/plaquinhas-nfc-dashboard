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
  acaoPrimaria: { rotulo: string } | null;
}

// Título de topo e rótulo do botão de ação primária por tela.
// A ação em si (onClick/rota do formulário) é ligada módulo a módulo,
// nas fases seguintes — aqui só a casca.
export const TELAS: Record<string, TelaConfig> = {
  "/": { titulo: "Início", acaoPrimaria: null },
  "/prospeccao": { titulo: "Prospecção", acaoPrimaria: { rotulo: "Novo lead" } },
  "/clientes": { titulo: "Clientes", acaoPrimaria: { rotulo: "Novo cliente" } },
  "/pedidos": { titulo: "Pedidos", acaoPrimaria: { rotulo: "Novo pedido" } },
  "/etiquetas": { titulo: "Etiquetas NFC", acaoPrimaria: { rotulo: "Gravar etiqueta" } },
  "/estoque": { titulo: "Estoque", acaoPrimaria: { rotulo: "Nova entrada" } },
  "/financeiro": { titulo: "Financeiro", acaoPrimaria: null },
  "/configuracoes": { titulo: "Configurações", acaoPrimaria: null },
};
