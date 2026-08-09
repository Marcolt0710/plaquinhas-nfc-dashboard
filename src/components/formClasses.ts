// Classes Tailwind compartilhadas por todos os formulários — mantém os
// campos consistentes com os tokens da Fase 1 sem repetir a string
// inteira em cada componente.
export const classesCampo =
  "w-full rounded-sm border border-border bg-input px-3 py-2.5 text-base text-primary placeholder:text-secondary focus:border-accent focus:outline-none disabled:opacity-50";

export const classesLabel = "mb-1.5 block text-sm text-secondary";

export const classesBotaoPrimario =
  "rounded-md bg-accent px-4 py-2.5 text-base font-medium text-accent-ink hover:bg-accent-strong disabled:opacity-40 disabled:pointer-events-none";

export const classesBotaoSecundario =
  "rounded-md border border-border px-4 py-2.5 text-base font-medium text-primary hover:border-border-strong hover:bg-card-hover";

export const classesBotaoPerigo =
  "rounded-md border border-alert/40 px-4 py-2.5 text-base font-medium text-alert hover:bg-alert-tint";
