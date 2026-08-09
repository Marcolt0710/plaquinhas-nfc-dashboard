import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { BottomNav } from "./BottomNav";
import { Toast } from "../components/Toast";
import { useAtalhosTeclado } from "../lib/useAtalhosTeclado";

export function AppShell() {
  useAtalhosTeclado();

  return (
    <div className="flex min-h-screen bg-page">
      <Sidebar />
      <Toast />
      {/*
        min-w-0 é necessário aqui: sem isso, um filho com min-width fixo em
        algum ponto da árvore (ex. tabela com min-w-[720px] dentro de
        overflow-x-auto) força esta coluna flex a crescer além da tela no
        celular, porque o mínimo padrão de um item flex é "auto" (baseado no
        conteúdo), não 0. Ver commit da Fase 5 para o diagnóstico completo.
      */}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex min-w-0 flex-1 flex-col px-4 pb-24 pt-4 md:px-8 md:pb-8 md:pt-6">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
