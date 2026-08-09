// Classes Tailwind compartilhadas por todos os formulários — mantém os
// campos consistentes com os tokens da Fase 1 sem repetir a string
// inteira em cada componente.

// O anel de foco é explícito aqui, com focus-visible. Antes esta string
// tinha "focus:outline-none" apostando na regra global de
// src/index.css, mas ".classe:focus" vence "input:focus-visible" em
// especificidade — o resultado era campo de formulário sem nenhum
// indicador de foco para quem navega por teclado.
const anelFoco =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-page";

export const classesCampo =
  `w-full rounded-sm border border-border bg-input px-3 py-2.5 text-base text-primary placeholder:text-secondary focus:border-accent disabled:opacity-50 ${anelFoco}`;

// Windows renderiza <select> nativo com as cores do sistema no modo
// escuro; sem estas duas explícitas, o campo sai branco no meio da
// interface escura.
export const classesSelect = `${classesCampo} bg-input text-primary`;

export const classesLabel = "mb-1.5 block text-sm text-secondary";

export const classesBotaoPrimario =
  `rounded-md bg-accent px-4 py-2.5 text-base font-medium text-accent-ink hover:bg-accent-strong disabled:opacity-40 disabled:pointer-events-none ${anelFoco}`;

export const classesBotaoSecundario =
  `rounded-md border border-border px-4 py-2.5 text-base font-medium text-primary hover:border-border-strong hover:bg-card-hover ${anelFoco}`;

export const classesBotaoPerigo =
  `rounded-md border border-alert/40 px-4 py-2.5 text-base font-medium text-alert hover:bg-alert-tint ${anelFoco}`;
