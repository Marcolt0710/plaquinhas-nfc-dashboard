# Fase 1 — Sistema de design

Referência: dashboards fintech escuras no estilo AbacatePay — fundo quase
preto, cartões discretamente mais claros, um único verde vivo reservado
para o que realmente importa. Não consegui abrir o CSS de produção do
AbacatePay para extrair hex exatos (é uma landing page de marketing, o
dashboard fica atrás de login), então os valores abaixo foram compostos a
partir da descrição pedida — fundo quase preto, cartão levemente mais
claro, borda 1px discreta, um verde vivo só — e calibrados para contraste
de leitura em ambiente externo (a rua, sol, tela de celular).

Tudo abaixo já está implementado em `tailwind.config.js` e
`src/index.css`, pronto para as próximas fases.

## 1. Paleta

| Token | Hex | Uso |
|---|---|---|
| `--bg-page` | `#0A0C0E` | Fundo da página, quase preto |
| `--bg-card` | `#15181B` | Fundo de cartão, tabela, painel lateral |
| `--bg-card-hover` | `#1B1F23` | Cartão/linha ao passar o mouse ou tocar |
| `--bg-input` | `#101316` | Fundo de campo de texto — um degrau mais escuro que o cartão, para o campo "afundar" visualmente |
| `--border` | `#24282D` | Borda 1px padrão, discreta |
| `--border-strong` | `#33383E` | Borda em foco/hover, ainda discreta |
| `--text-primary` | `#F2F4F5` | Texto principal — quase branco, não branco puro (menos cansaço visual em uso prolongado ao sol) |
| `--text-secondary` | `#8B939B` | Texto secundário, rótulos, texto de apoio |
| `--text-disabled` | `#4B5157` | Texto desabilitado |
| `--accent-green` | `#22D37A` | **O único destaque.** Ação principal, valor positivo, item ativo do menu, status "Pago" |
| `--accent-green-strong` | `#1AAE64` | Hover/pressed do verde |
| `--accent-green-tint` | `rgba(34, 211, 122, 0.12)` | Fundo de crachá/alerta em tom de verde |
| `--red-alert` | `#F0554A` | Atraso, estoque zerado, etiqueta com defeito, exclusão |
| `--red-alert-tint` | `rgba(240, 85, 74, 0.12)` | Fundo de crachá/alerta vermelho |
| `--yellow-attention` | `#F0B23D` | Prazo próximo, estoque baixo (não zerado), retorno vencendo |
| `--yellow-attention-tint` | `rgba(240, 178, 61, 0.12)` | Fundo de crachá/alerta amarelo |

Só existem duas cores "de sinal" além do verde — vermelho e amarelo — e
nenhuma outra. Não há azul, roxo ou cor extra para diferenciar categorias:
onde antes se pensaria em "uma cor por status de produção", este sistema
usa cinza neutro com progressão textual (ver §5), porque cor demais dilui
o significado do verde.

## 2. Tipografia

- **Interface**: [Inter](https://fonts.google.com/specimen/Inter) — sem serifa, ótima legibilidade em tamanho pequeno, suporte completo a acentuação do português. Hospedada localmente via `@fontsource/inter` (sem depender de internet em campo).
- **Números e códigos**: [JetBrains Mono](https://www.jetbrains.com/lp/mono/) — para valores em reais, códigos de pedido (`PED-0007`), UID de etiqueta NFC, links. Hospedada via `@fontsource/jetbrains-mono`.

```css
--font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
--font-mono: "JetBrains Mono", ui-monospace, "SFMono-Regular", Menlo, monospace;
```

### Escala

| Token | Tamanho / altura de linha | Peso | Uso |
|---|---|---|---|
| `text-xs` | 11px / 16px | 500 | Cabeçalho de tabela (maiúsculo, letter-spacing), rótulo de crachá |
| `text-sm` | 13px / 20px | 400 | Texto secundário, célula de tabela, legenda |
| `text-base` | 14px / 20px | 400 | Corpo padrão — densidade alta sem apertar |
| `text-md` | 16px / 24px | 400–500 | Valor de campo, texto de destaque no corpo |
| `text-lg` | 18px / 26px | 600 | Título de cartão, título de painel lateral |
| `text-xl` | 22px / 28px | 600 | Título de seção/página |
| `text-2xl` | 28px / 34px | 700 | Título da tela inicial |
| `text-3xl` | 36px / 40px | 700 | Número grande de KPI (Fase 8) |

Peso 700 (bold) é reservado a números grandes de indicador — em texto
corrido, o peso máximo é 600. Isso mantém o "grito visual" só onde o dado
merece.

## 3. Espaçamento e raio

Escala de espaçamento (base 4px, a mesma do Tailwind — sem token
customizado extra, só documentando o uso):

| Token Tailwind | Valor | Uso típico |
|---|---|---|
| `1` | 4px | Espaço entre ícone e texto |
| `2` | 8px | Espaço interno de crachá |
| `3` | 12px | Espaço entre campos de formulário |
| `4` | 16px | Padding de célula de tabela, gap entre cartões pequenos |
| `5` | 20px | Padding padrão de cartão |
| `6` | 24px | Gap entre seções, padding de painel lateral |
| `8` | 32px | Margem entre blocos grandes da página |
| `10`–`12` | 40–48px | Respiro de topo de página |

Raio de borda:

| Token | Valor | Uso |
|---|---|---|
| `rounded-sm` | 6px | Campo de texto, crachá pequeno |
| `rounded-md` | 10px | Botão |
| `rounded-lg` | 14px | Cartão, painel, modal |
| `rounded-full` | 9999px | Crachá de status, avatar, indicador de progresso |

## 4. Componentes base

### Botão primário
- Fundo `--accent-green`, texto `#08120D` (quase preto — texto escuro sobre verde vivo lê melhor que branco)
- `rounded-md`, padding `10px 16px`, `text-base` peso 500
- Hover: fundo `--accent-green-strong`
- Pressed: mesmo tom, `scale(0.98)`
- Foco: anel de 2px na cor `--accent-green` com 2px de offset do fundo da página
- Desabilitado: opacidade 40%, cursor não permitido, sem hover

### Botão secundário
- Fundo transparente, borda 1px `--border`, texto `--text-primary`
- Hover: fundo `--bg-card-hover`, borda `--border-strong`
- Pressed: fundo levemente mais escuro que o hover
- Foco: mesmo anel verde do primário
- Desabilitado: opacidade 40%

### Campo de texto
- Fundo `--bg-input`, borda 1px `--border`, `rounded-sm`, padding `10px 12px`, `text-base`
- Placeholder em `--text-secondary`
- Foco: borda `--accent-green` + anel de 2px `--accent-green-tint`
- Erro: borda `--red-alert`, texto de ajuda abaixo em `--red-alert`, `text-xs`
- Desabilitado: opacidade 50%, fundo `--bg-page`

### Cartão
- Fundo `--bg-card`, borda 1px `--border`, `rounded-lg`, padding `20px`
- Sem sombra. Se for clicável: hover troca borda para `--border-strong` e fundo para `--bg-card-hover` — nunca sombra, nunca elevação com blur

### Tabela
- Cabeçalho: `text-xs` maiúsculo, `--text-secondary`, `letter-spacing` leve, sem fundo próprio, borda inferior `--border`
- Linha: borda inferior 1px `--border` (linha fina, sem zebra), hover `--bg-card-hover`
- Coluna numérica (valor, quantidade): alinhada à direita, `font-mono`
- Coluna de código/link/UID: `font-mono`, `--text-secondary` a menos que seja o dado principal da coluna

### Crachá de status (badge)
- `rounded-full`, padding `4px 10px`, `text-xs` peso 500
- Fundo = cor do status a 12% de opacidade (`*-tint`), texto = cor do status a 100%
- Nunca fundo sólido forte — o crachá precisa continuar discreto mesmo quando é vermelho

## 5. Cores por status

### Etapas do pedido (Fase 4)
As seis etapas de produção (vendido → link criado → arte pronta →
impresso → NFC gravado → testado) usam **a mesma cor neutra** — um cinza
levemente azulado sobre `--bg-card-hover`, com o texto em
`--text-secondary`. A diferença entre elas é comunicada por **posição
numa barra de progresso**, não por matiz: se cada etapa tivesse sua
própria cor, o quadro kanban viraria um arco-íris e nenhuma cor mais
chamaria atenção de verdade — inclusive o verde, que é o ponto principal
deste sistema.

| Etapa | Cor do crachá | Por quê |
|---|---|---|
| Vendido … Testado | Cinza neutro (`--bg-card-hover` / `--text-secondary`) | Etapa intermediária, sem juízo de valor — só onde está no processo |
| Entregue | Verde suave (`--accent-green-tint` / `--accent-green`, peso 500) | Sinaliza avanço quase concluído, mas sem ser o destaque máximo |
| Pago | Verde cheio (`--accent-green` sólido, texto `#08120D`) | É o estado final de sucesso — dinheiro em caixa. Único crachá com fundo sólido, de propósito, para se destacar dos demais |

Além da etapa, o **prazo de entrega** tem seu próprio indicador,
independente do crachá de etapa:
- Faltando menos de 24h e ainda não entregue: `--yellow-attention`
- Prazo vencido e ainda não entregue: `--red-alert`

### Situação do lead (Fase 3)
| Situação | Cor | Por quê |
|---|---|---|
| A visitar | Cinza neutro | Ainda não aconteceu nada |
| Visitado | Cinza neutro, levemente mais claro | Contato feito, sem resultado definido |
| Interessado | `--yellow-attention` | Precisa de ação sua — fechar antes que esfrie |
| Vendido | `--accent-green` | Conversão — o único "sucesso" de verdade neste módulo |
| Descartado | `--red-alert`, com opacidade reduzida no texto | Fechado sem venda. Vermelho aqui não é "urgente", é "encerrado sem sucesso" — por isso mais discreto que o vermelho de alerta ativo |

### Etiqueta NFC (Fase 5)
Em estoque: cinza. Gravada: `--yellow-attention` (etapa intermediária que
precisa de atenção — falta testar). Entregue: `--accent-green`. Com
defeito: `--red-alert` sólido no ícone, porque isso exige ação imediata
(descartar/trocar), diferente do "descartado" de lead, que é só histórico.

## 6. Arquivos gerados nesta fase

- `tailwind.config.js` — cores, fontes, raios e tamanhos de fonte como tokens do Tailwind, lendo das variáveis CSS
- `src/index.css` — declaração de `:root` com todas as variáveis, import das fontes locais, reset base
