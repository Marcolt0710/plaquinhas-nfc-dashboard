// Vitrine temporária dos tokens de design (Fase 1).
// Substituída pela casca real da aplicação na Fase 2.

function Badge({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "neutral" | "green" | "green-solid" | "yellow" | "red";
}) {
  const toneClasses: Record<typeof tone, string> = {
    neutral: "bg-card-hover text-secondary",
    green: "bg-accent-tint text-accent",
    "green-solid": "bg-accent text-accent-ink",
    yellow: "bg-attention-tint text-attention",
    red: "bg-alert-tint text-alert",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-page px-6 py-10 text-primary">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <header>
          <h1 className="text-2xl">Sistema de design — Fase 1</h1>
          <p className="mt-1 text-sm text-secondary">
            Vitrine dos tokens. Esta tela é substituída pela navegação real na Fase 2.
          </p>
        </header>

        <section className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-lg">Botões</h2>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button className="rounded-md bg-accent px-4 py-2.5 text-base font-medium text-accent-ink hover:bg-accent-strong">
              Salvar pedido
            </button>
            <button className="rounded-md border border-border px-4 py-2.5 text-base font-medium text-primary hover:border-border-strong hover:bg-card-hover">
              Cancelar
            </button>
            <button
              disabled
              className="rounded-md bg-accent px-4 py-2.5 text-base font-medium text-accent-ink opacity-40"
            >
              Desabilitado
            </button>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-lg">Campo de texto</h2>
          <div className="mt-4 flex flex-col gap-3 sm:max-w-sm">
            <input
              className="rounded-sm border border-border bg-input px-3 py-2.5 text-base text-primary placeholder:text-secondary focus:border-accent focus:outline-none"
              placeholder="Nome do estabelecimento"
            />
            <div>
              <input
                className="w-full rounded-sm border border-alert bg-input px-3 py-2.5 text-base text-primary focus:outline-none"
                defaultValue="link-invalido"
              />
              <p className="mt-1 text-xs text-alert">
                Esse link não parece válido. Confira e tente novamente.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-lg">Crachás de status</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge tone="neutral">Impresso</Badge>
            <Badge tone="green">Entregue</Badge>
            <Badge tone="green-solid">Pago</Badge>
            <Badge tone="yellow">Interessado</Badge>
            <Badge tone="red">Com defeito</Badge>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-lg">Tabela</h2>
          <table className="mt-4 w-full text-left">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-secondary">
                <th className="pb-2 font-medium">Pedido</th>
                <th className="pb-2 font-medium">Cliente</th>
                <th className="pb-2 text-right font-medium">Valor</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border hover:bg-card-hover">
                <td className="py-2.5 font-mono text-sm text-secondary">PED-0007</td>
                <td className="py-2.5 text-base">Barbearia Vintage</td>
                <td className="py-2.5 text-right font-mono text-base text-accent">
                  R$ 129,00
                </td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}

export default App;
