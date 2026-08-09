import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppShell } from "./layout/AppShell";
import Inicio from "./pages/Inicio";
import Prospeccao from "./pages/Prospeccao";
import Clientes from "./pages/Clientes";
import Pedidos from "./pages/Pedidos";
import Etiquetas from "./pages/Etiquetas";
import Estoque from "./pages/Estoque";
import Configuracoes from "./pages/Configuracoes";

// recharts é pesado (~200kB gzip) e só é usado aqui — carrega sob
// demanda para não pesar o primeiro acesso ao app na rua, com dados
// móveis instáveis (ver docs/fase-0-arquitetura.md).
const Financeiro = lazy(() => import("./pages/Financeiro"));

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Inicio />} />
          <Route path="/prospeccao" element={<Prospeccao />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/pedidos" element={<Pedidos />} />
          <Route path="/etiquetas" element={<Etiquetas />} />
          <Route path="/estoque" element={<Estoque />} />
          <Route
            path="/financeiro"
            element={
              <Suspense
                fallback={<p className="py-16 text-center text-sm text-secondary">Carregando…</p>}
              >
                <Financeiro />
              </Suspense>
            }
          />
          <Route path="/configuracoes" element={<Configuracoes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
