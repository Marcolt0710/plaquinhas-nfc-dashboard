import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppShell } from "./layout/AppShell";
import Inicio from "./pages/Inicio";
import Prospeccao from "./pages/Prospeccao";
import Clientes from "./pages/Clientes";
import Pedidos from "./pages/Pedidos";
import Etiquetas from "./pages/Etiquetas";
import Estoque from "./pages/Estoque";
import Financeiro from "./pages/Financeiro";
import Configuracoes from "./pages/Configuracoes";

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
          <Route path="/financeiro" element={<Financeiro />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
