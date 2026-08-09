# Plaquinhas NFC — Dashboard de gestão

Dashboard de gestão para um negócio de plaquinhas de balcão com NFC e QR Code,
que levam o cliente direto para a página de avaliação do estabelecimento no
Google. Feito para dois sócios que prospectam porta a porta em São José dos
Campos (SP) — por isso a interface é escura, densa e funciona bem no celular,
que é onde ela é usada de verdade: na rua.

## O que a dashboard resolve

1. Saber em que etapa está cada pedido, para nenhum atrasar
2. Guardar o link gravado em cada etiqueta NFC — sem esse registro, não há
   como dar suporte ao cliente depois
3. Controlar o estoque de etiquetas, adesivos e filamento
4. Acompanhar a prospecção: quem já foi visitado, o que respondeu, quando voltar
5. Ver quanto entrou, quanto custou e quanto sobrou
6. Lembrar dos retornos de 30 dias

## Como rodar

```bash
npm install
npm run dev      # http://localhost:5173
```

Outros comandos: `npm run build` (produção), `npm run preview` (serve o build),
`npm run lint`.

O app já abre populado com dados de demonstração que usam os números reais do
negócio (custos por placa, preços dos pacotes, ruas do roteiro), para dar para
testar tudo antes da primeira operação real. Todo registro pode ser editado ou
apagado.

## Módulos

| Tela | O que faz |
|---|---|
| **Início** | O que precisa de atenção hoje: alertas, 4 indicadores, entregas e retornos do dia, últimos pedidos, atalhos |
| **Prospecção** | CRM de porta fria — leads agrupados por rua, registro de visita, alertas de nota baixa e de excesso de avaliações, conversão em cliente |
| **Clientes** | Cadastro, links de avaliação e histórico de pedidos de cada cliente |
| **Pedidos** | Quadro arrastável com as 8 etapas de produção (ou tabela), ficha com custo, lucro e prazo |
| **Etiquetas NFC** | Gravação passo a passo, busca por link, histórico de regravação, controle de defeito |
| **Estoque** | Nível de cada item, entrada de compra, registro de perda, consumo automático por etapa do pedido |
| **Financeiro** | Faturamento, custo, lucro, margem, a receber, ticket médio e gráficos por semana/pacote/clientes |
| **Configurações** | Custos unitários, pacotes e dados da marca — alimentam os cálculos do resto |

## Regras de negócio que o sistema garante

Estas regras vivem na store (`src/store/useAppStore.ts`), não na interface —
então valem independentemente de por qual tela a ação passou:

- **O custo de um pedido é congelado no momento da venda.** Mudar os custos em
  Configurações afeta só os próximos pedidos; um pedido já fechado mantém para
  sempre o custo que tinha quando foi vendido.
- **Pedido não avança para "Entregue" com etiqueta sem teste aprovado.**
- **Regravar uma etiqueta nunca sobrescreve o link anterior** — ele vai para o
  histórico de regravações, com data e motivo.
- **O estoque é descontado automaticamente** conforme o pedido avança:
  filamento e papel do QR ao imprimir; adesivo e embalagem ao entregar.
- **Pacote nunca é excluído, só inativado** — some do formulário de novo pedido,
  mas pedidos antigos continuam mostrando o nome dele.

## Atalhos de teclado

| Tecla | Ação |
|---|---|
| `/` | Foca a busca da barra superior |
| `n` | Dispara a ação principal da tela atual (o botão verde) |
| `Esc` | Fecha o modal ou painel aberto |

Desativados enquanto você estiver digitando num campo.

## Stack

React + TypeScript + Vite, Tailwind CSS, Zustand (estado + persistência),
react-router, dnd-kit (quadro arrastável), recharts (gráficos), lucide-react
(ícones). Fontes Inter e JetBrains Mono hospedadas localmente, para o app não
depender de internet em campo.

## Onde os dados ficam — e a limitação que isso traz

Esta primeira versão **não tem backend**: tudo é guardado no `localStorage` do
navegador, por dispositivo. Isso foi proposital, para dar para testar o produto
antes de decidir o banco.

A consequência prática, que importa antes de os dois sócios usarem em paralelo:
**o celular de um não enxerga o que o outro cadastrou.** Se um fechar uma venda
na rua, o outro só vai ver depois de alguma sincronização manual. Enquanto isso
não for resolvido, as opções são usar um dispositivo só, exportar/importar CSV
no fim do dia, ou migrar para um backend simples.

A exportação em CSV está em todas as telas de listagem, também para o caso de
querer levar os dados para outro sistema depois.

## Documentação

- [`docs/fase-0-arquitetura.md`](docs/fase-0-arquitetura.md) — modelo de dados,
  entidades, relacionamentos, mapa de telas e as decisões que ainda estão em
  aberto
- [`docs/fase-1-design-system.md`](docs/fase-1-design-system.md) — paleta,
  tipografia, espaçamento, estados dos componentes e a regra de uso do verde
  de destaque
