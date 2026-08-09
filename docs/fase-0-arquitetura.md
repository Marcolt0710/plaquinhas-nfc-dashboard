# Fase 0 — Contexto e arquitetura

> Documento de referência. As fases seguintes (design, telas, módulos) devem
> se manter consistentes com o modelo descrito aqui. Qualquer mudança de
> modelo feita numa fase posterior deve voltar e atualizar este documento.

## 1. Modelo de dados

Sete entidades cobrem o negócio: **Lead**, **Cliente**, **Pedido**,
**EtiquetaNFC**, **ItemEstoque** (+ **MovimentoEstoque**), **Pacote** e
**Configuracao**. O financeiro não é uma entidade própria — é uma leitura
calculada em cima de Pedido e MovimentoEstoque, para não duplicar dado nem
correr o risco de a dashboard "inventar" um número que diverge do pedido
real.

### 1.1 Lead (Prospecção)

Representa um comércio mapeado no roteiro de porta fria, antes de virar
cliente.

| Campo | Tipo | Observação |
|---|---|---|
| `id` | string | UUID |
| `nomeEstabelecimento` | string | |
| `endereco` | string | Endereço completo |
| `rua` | string | Usado para agrupar o roteiro. É a rua "pura", sem número — permite agrupar todos os leads de "R. dos Alecrins" juntos |
| `categoria` | enum `CategoriaLead` | Ver lista abaixo |
| `notaGoogle` | number \| null | 0–5. `null` = ainda não coletada |
| `numeroAvaliacoes` | number \| null | |
| `vizinhoReferencia` | `{ nome: string; notaGoogle: number; numeroAvaliacoes: number } \| null` | Comparação com o concorrente/vizinho, opcional |
| `situacao` | enum `SituacaoLead` | `a_visitar` \| `visitado` \| `interessado` \| `vendido` \| `descartado` |
| `dataVisita` | string (ISO) \| null | Data da última visita registrada |
| `atendidoPor` | string \| null | Nome de quem atendeu na loja |
|- `eraDono` | boolean \| null | Se quem atendeu era o dono/decisor |
| `motivoDescarte` | string \| null | Preenchido só quando `situacao = descartado` |
| `dataRetorno` | string (ISO) \| null | Próxima data para voltar |
| `observacoes` | string | Texto livre |
| `historicoVisitas` | `VisitaLead[]` | Cada visita registrada, não sobrescreve a anterior |
| `clienteId` | string \| null | Preenchido quando o lead vira venda |
| `criadoEm`, `atualizadoEm` | string (ISO) | |

`VisitaLead`: `{ id, data, resultado (mesmo enum de SituacaoLead), atendidoPor, eraDono, proximaAcao, dataRetorno, observacoes }`. Guardamos histórico completo — cada clique em "Registrar visita" cria uma entrada nova, nunca edita a anterior, porque o sócio que voltar à rua depois precisa ver a sequência real de contatos.

`CategoriaLead`: barbearia, salão de beleza, pet shop, lanchonete, padaria, estética, oficina, ótica, açaí, hamburgueria, odontologia, restaurante, outros. (Une a lista curta da Fase 3 com a lista do anexo — a lista curta era claramente incompleta.)

**Alertas de negócio** (calculados, não guardados): nota < 3,5 → aviso "não vender"; mais de 500 avaliações → aviso "dor não existe". Ver Fase 3.

### 1.2 Cliente

Um lead convertido, ou um cliente que veio direto por indicação (não passou pelo funil de prospecção).

| Campo | Tipo | Observação |
|---|---|---|
| `id` | string | |
| `nomeEstabelecimento` | string | |
| `nomeResponsavel` | string | |
| `telefoneResponsavel` | string | Formato `(12) 91234-5678` |
| `endereco` | string | |
| `linkAvaliacaoGoogle` | string (URL) | Link "de verdade" do Google, para onde o link encurtado aponta |
| `linkEncurtado` | string (URL) | O link que efetivamente vai gravado na etiqueta |
| `dataPrimeiroPedido` | string (ISO) \| null | |
| `indicadoPorClienteId` | string \| null | Autorreferência — cliente que indicou |
| `leadOrigemId` | string \| null | Rastreia de qual lead esse cliente veio, se veio |
| `observacoes` | string | |
| `criadoEm`, `atualizadoEm` | string (ISO) | |

Pedidos não ficam embutidos no cliente — são uma lista à parte filtrada por `clienteId`, para não duplicar estado.

### 1.3 Pedido

O núcleo operacional. Uma venda gera **um** pedido, que pode conter 1, 2 ou 4 placas (uma etiqueta NFC por placa).

| Campo | Tipo | Observação |
|---|---|---|
| `id` | string | |
| `codigo` | string | Sequencial amigável, ex. `PED-0007` |
| `clienteId` | string | |
| `pacoteId` | string | Referência ao pacote em Configurações **no momento da venda** |
| `numeroPlacas` | number | Copiado do pacote no momento da venda (não muda se o pacote for editado depois) |
| `valorCobrado` | number | Em reais. Pode divergir do preço padrão do pacote se houve negociação |
| `custoUnitarioSnapshot` | number | Custo por placa **congelado** no momento em que o pedido é criado — puxa de Configurações, mas depois de gravado nunca muda, mesmo que o custo padrão mude |
| `custoTotal` | number | `custoUnitarioSnapshot × numeroPlacas`, calculado |
| `lucro` | number | `valorCobrado − custoTotal`, calculado |
| `margemPercentual` | number | Calculado |
| `dataVenda` | string (ISO) | |
| `dataPrometidaEntrega` | string (ISO) | `dataVenda + prazoPadraoEntregaDias` (Configurações), editável |
| `etapa` | enum `EtapaPedido` | `vendido → link_criado → arte_pronta → impresso → nfc_gravado → testado → entregue → pago` |
| `historicoEtapas` | `{ etapa, data }[]` | Um registro por transição, para dar tempo médio de produção depois |
| `etiquetasIds` | string[] | Uma etiqueta por placa; populado conforme etiquetas vão sendo associadas |
| `dataRetorno30Dias` | string (ISO) \| null | `dataEntregaReal + diasRetornoAcompanhamento` (Configurações). Só existe depois que o pedido é entregue |
| `retornoFeito` | boolean | |
| `pago` | boolean | |
| `dataPagamento` | string (ISO) \| null | |
| `leadOrigemId` | string \| null | |
| `observacoes` | string | |
| `criadoEm`, `atualizadoEm` | string (ISO) | |

**Regras de negócio** (ver Fase 4 para o detalhe de UI):
- Não avança para `entregue` se alguma etiqueta associada não estiver com `resultadoTeste = aprovado`.
- `dataPrometidaEntrega` a menos de 24h → destaque amarelo; vencida e pedido não entregue → vermelho.
- Mudar `pago` para `true` é o único gatilho que faz o pedido contar no financeiro como receita realizada (antes disso ele já soma em "a receber").
- Custo nunca é recalculado num pedido existente quando Configurações muda — só pedidos novos usam o custo atualizado.

### 1.4 EtiquetaNFC

O registro mais sensível do sistema: se o link gravado se perder, não há suporte possível depois.

| Campo | Tipo | Observação |
|---|---|---|
| `id` | string | |
| `codigoInterno` | string | Sequencial, ex. `NFC-0142` |
| `uid` | string \| null | UID físico do chip, preenchido quando lido/gravado |
| `situacao` | enum `SituacaoEtiqueta` | `em_estoque` \| `gravada` \| `entregue` \| `com_defeito` |
| `pedidoId` | string \| null | |
| `linkGravado` | string (URL) \| null | |
| `dataGravacao` | string (ISO) \| null | |
| `gravadoPor` | string \| null | |
| `resultadoTeste` | enum \| null | `aprovado` \| `reprovado` \| `nao_testado` |
| `aparelhoTeste` | string \| null | |
| `dataTeste` | string (ISO) \| null | |
| `historicoRegravacoes` | `{ id, data, linkAnterior, motivo }[]` | Regravar **acrescenta** aqui, nunca apaga o link antigo |
| `criadoEm` | string (ISO) | |

### 1.5 ItemEstoque + MovimentoEstoque

| Campo (`ItemEstoque`) | Tipo |
|---|---|
| `id` | string |
| `nome` | string |
| `tipo` | enum: `etiqueta_nfc`, `adesivo_vinil`, `papel_qr`, `filamento_petg`, `embalagem` |
| `unidade` | `un` \| `g` |
| `quantidadeAtual` | number |
| `quantidadeMinima` | number |
| `custoUnitario` | number |
| `fornecedor` | string |
| `prazoReposicaoDias` | number |

`MovimentoEstoque`: `{ id, itemId, data, tipo: 'entrada' | 'saida' | 'perda', quantidade, motivo, pedidoId? }`. Toda entrada/saída/perda gera um movimento — o `quantidadeAtual` do item é a soma desses movimentos, não um número editado à mão (exceto o ajuste inicial). Isso dá rastreabilidade: dá pra responder "por que sobrou menos filamento do que eu esperava".

### 1.6 Pacote e Configuracao

`Pacote`: `{ id, nome, numeroPlacas, preco, ativo }` — vive dentro de `Configuracao`, mas tem `id` próprio porque `Pedido.pacoteId` referencia um pacote específico.

`Configuracao` (documento único, sem lista):
```
custosUnitarios: {
  filamentoPorPlaca, etiquetaNfc, adesivoBase,
  etiquetaQr, energiaPorImpressao, embalagem,
  taxaPerdaPercentual
}
pacotes: Pacote[]
marca: {
  nome,
  socios: { nome, telefone, email }[],
  prazoPadraoEntregaDias,
  diasRetornoAcompanhamento
}
```
`custoTotalPorPlaca` não é guardado — é sempre `(soma dos custos unitários) × (1 + taxaPerdaPercentual/100)`, recalculado ao vivo. É esse valor que vira `custoUnitarioSnapshot` num pedido novo.

### 1.7 Relacionamentos

```
Lead 1 ──── 0..1 Cliente        (lead pode virar cliente; nem todo cliente vem de lead)
Cliente 1 ──── N Pedido
Cliente 0..1 ──── N Cliente      (indicadoPorClienteId, autorreferência)
Pedido N ──── 1 Pacote           (dentro de Configuracao)
Pedido 1 ──── N EtiquetaNFC      (uma por placa)
Pedido 1 ──── N MovimentoEstoque (consumo automático por etapa)
ItemEstoque 1 ──── N MovimentoEstoque
```

Financeiro, Estoque (visão) e Início são **leituras derivadas**, não entidades — evita que dois lugares guardem o mesmo número e divirjam.

## 2. Mapa de telas e navegação

```
/                    Início (dashboard do dia)
/prospeccao          Lista de leads (agrupável por rua) + painel lateral de ficha
/clientes            Lista de clientes
/clientes/:id        Ficha do cliente (painel lateral ou tela cheia no mobile)
/pedidos             Quadro kanban (padrão) com alternância para tabela
/pedidos/novo        Formulário de novo pedido
/pedidos/:id         Ficha do pedido
/etiquetas           Lista de etiquetas NFC + busca por link
/etiquetas/gravar     Fluxo de gravação passo a passo
/estoque             Itens de estoque
/financeiro          Indicadores e gráficos
/configuracoes       Custos, pacotes, dados da marca
```

**Navegação desktop**: menu lateral fixo com as 8 seções. Item ativo destacado com o verde de destaque (Fase 1).

**Navegação mobile**: barra inferior fixa com Início, Pedidos, Prospecção, Clientes (as quatro ações mais usadas na rua). Um quinto item "Mais" abre uma folha (`sheet`) com Etiquetas NFC, Estoque, Financeiro e Configurações.

**Painéis laterais vs. telas cheias**: fichas de lead/cliente/pedido abrem em painel lateral (`drawer`) no desktop, e em tela cheia com botão "voltar" no mobile — mesma rota, layout responsivo.

## 3. Decisões que ainda precisam ser tomadas

Na ordem em que import mais:

1. **Sincronização entre os dois sócios.** Esta v1 guarda tudo em `localStorage`, por tela/navegador. Isso quer dizer que **o celular de um sócio não vê o que o outro cadastrou**. Para uso na rua com dois sócios ao mesmo tempo, isso é uma limitação real, não só teórica — se um vende uma placa, o outro só vê depois que sincronizarem manualmente (ex. exportar/importar CSV, fase 10). Antes de operar os dois em paralelo, decidir: (a) usar só um dispositivo por enquanto, (b) migrar cedo para um backend simples (ex. Supabase), ou (c) sincronizar manualmente todo fim de dia. Recomendo decidir isso antes da fase 4, porque muda a arquitetura de estado.
2. **Formato definitivo do código sequencial** de pedido (`PED-0001`) e etiqueta (`NFC-0001`). Uma vez impresso/gravado em produção real, mudar o formato quebra rastreabilidade.
3. **Lead → Cliente é automático ou manual?** Hoje modelei como manual (um botão "Converter em cliente" ao marcar `vendido`), para o sócio poder revisar/completar os dados de contato antes. Confirmar se é isso mesmo.
4. **Autoria dentro do sistema.** "Quem atendeu", "quem gravou" são campos de texto livre hoje. Se quiser relatório por sócio de forma confiável, vale um seletor fixo (os dois nomes cadastrados em Configurações) em vez de texto livre.
5. **Retorno de 30 dias conta a partir de quê?** Modelei como `data de entrega real + dias configurável`, não da venda — confirmar que faz sentido (a plaquinha só começa a gerar avaliação depois de instalada).
6. **Versionamento de pacote.** Se o preço de um pacote mudar em Configurações, pedidos antigos mantêm seu `valorCobrado` (isso já está garantido). Mas se um pacote for **removido**, pedidos antigos que o referenciam continuam mostrando o nome antigo? Modelei pacotes como "inativados", nunca apagados, por causa disso.
7. **O que entra como "perda" no estoque** além de impressão falha e adesivo estragado — vale ter uma lista fechada de motivos ou texto livre? Modelei como texto livre por simplicidade agora.

Se algo aqui foi esquecido: não modelei nota fiscal/recibo, nem cobrança automática (o pagamento é só um campo marcado manualmente) — pelo que foi descrito, a cobrança acontece pessoalmente na entrega, então isso parece correto, mas vale confirmar.
