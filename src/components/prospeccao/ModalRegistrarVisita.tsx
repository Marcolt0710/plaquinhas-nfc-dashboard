import { useState } from "react";
import { Modal } from "../Modal";
import { classesBotaoPrimario, classesBotaoSecundario, classesCampo, classesLabel } from "../formClasses";
import { useAppStore } from "../../store/useAppStore";
import { mostrarToast } from "../../store/useUiStore";
import type { Lead, SituacaoLead } from "../../types";
import { SITUACOES_LEAD } from "../../types";
import { agoraISO } from "../../lib/date";

interface ModalRegistrarVisitaProps {
  lead: Lead;
  onFechar: () => void;
  onRegistrado: () => void;
}

export function ModalRegistrarVisita({ lead, onFechar, onRegistrado }: ModalRegistrarVisitaProps) {
  const registrarVisitaLead = useAppStore((state) => state.registrarVisitaLead);
  const converterLeadEmCliente = useAppStore((state) => state.converterLeadEmCliente);

  const [resultado, setResultado] = useState<SituacaoLead>("visitado");
  const [atendidoPor, setAtendidoPor] = useState(lead.atendidoPor ?? "");
  const [eraDono, setEraDono] = useState(lead.eraDono ?? false);
  const [proximaAcao, setProximaAcao] = useState("");
  const [dataRetorno, setDataRetorno] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const [converterEmCliente, setConverterEmCliente] = useState(true);
  const [nomeResponsavel, setNomeResponsavel] = useState("");
  const [telefoneResponsavel, setTelefoneResponsavel] = useState("");
  const [linkAvaliacaoGoogle, setLinkAvaliacaoGoogle] = useState("");
  const [linkEncurtado, setLinkEncurtado] = useState("");

  const precisaDataRetorno = resultado === "interessado" || resultado === "visitado";

  function aoSalvar() {
    registrarVisitaLead(lead.id, {
      data: agoraISO(),
      resultado,
      atendidoPor: atendidoPor.trim() || null,
      eraDono,
      proximaAcao: proximaAcao.trim() || null,
      dataRetorno: dataRetorno ? new Date(dataRetorno).toISOString() : null,
      observacoes: observacoes.trim(),
    });

    if (resultado === "vendido" && converterEmCliente && nomeResponsavel.trim()) {
      converterLeadEmCliente(lead.id, {
        nomeEstabelecimento: lead.nomeEstabelecimento,
        nomeResponsavel: nomeResponsavel.trim(),
        telefoneResponsavel: telefoneResponsavel.trim(),
        endereco: lead.endereco,
        linkAvaliacaoGoogle: linkAvaliacaoGoogle.trim(),
        linkEncurtado: linkEncurtado.trim(),
        dataPrimeiroPedido: null,
        indicadoPorClienteId: null,
        observacoes: "",
      });
      mostrarToast("Visita registrada e cliente cadastrado.");
    } else {
      mostrarToast("Visita registrada.");
    }

    onRegistrado();
  }

  return (
    <Modal titulo={`Registrar visita — ${lead.nomeEstabelecimento}`} onFechar={onFechar}>
      <div className="flex flex-col gap-4">
        <div>
          <span className={classesLabel}>Resultado da visita</span>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {SITUACOES_LEAD.filter((s) => s.value !== "a_visitar").map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setResultado(s.value)}
                className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                  resultado === s.value
                    ? "border-accent bg-accent-tint text-accent"
                    : "border-border text-secondary hover:border-border-strong hover:text-primary"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={classesLabel} htmlFor="atendido-por">
              Quem atendeu
            </label>
            <input
              id="atendido-por"
              className={classesCampo}
              value={atendidoPor}
              onChange={(e) => setAtendidoPor(e.target.value)}
              placeholder="Ex.: Marco"
            />
          </div>
          <label className="flex items-end gap-2 pb-2.5 text-sm text-secondary">
            <input
              type="checkbox"
              checked={eraDono}
              onChange={(e) => setEraDono(e.target.checked)}
              className="h-4 w-4 rounded border-border accent-accent-strong"
            />
            Era o dono / decisor
          </label>
        </div>

        {resultado === "descartado" ? (
          <div>
            <label className={classesLabel} htmlFor="motivo-descarte">
              Motivo do descarte
            </label>
            <textarea
              id="motivo-descarte"
              className={`${classesCampo} min-h-16 resize-y`}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Por que este lead não vai seguir"
            />
          </div>
        ) : (
          <>
            <div>
              <label className={classesLabel} htmlFor="proxima-acao">
                Próxima ação
              </label>
              <input
                id="proxima-acao"
                className={classesCampo}
                value={proximaAcao}
                onChange={(e) => setProximaAcao(e.target.value)}
                placeholder="Ex.: Voltar e falar com o dono"
              />
            </div>

            {precisaDataRetorno && (
              <div>
                <label className={classesLabel} htmlFor="data-retorno">
                  Data para voltar
                </label>
                <input
                  id="data-retorno"
                  type="date"
                  className={classesCampo}
                  value={dataRetorno}
                  onChange={(e) => setDataRetorno(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className={classesLabel} htmlFor="observacoes-visita">
                Observações
              </label>
              <textarea
                id="observacoes-visita"
                className={`${classesCampo} min-h-16 resize-y`}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
              />
            </div>
          </>
        )}

        {resultado === "vendido" && (
          <div className="rounded-md border border-accent/30 bg-accent-tint/40 p-4">
            <label className="flex items-center gap-2 text-sm font-medium text-primary">
              <input
                type="checkbox"
                checked={converterEmCliente}
                onChange={(e) => setConverterEmCliente(e.target.checked)}
                className="h-4 w-4 rounded border-border accent-accent-strong"
              />
              Converter em cliente agora
            </label>
            {converterEmCliente && (
              <div className="mt-3 flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={classesLabel} htmlFor="nome-responsavel">
                      Nome do responsável
                    </label>
                    <input
                      id="nome-responsavel"
                      className={classesCampo}
                      value={nomeResponsavel}
                      onChange={(e) => setNomeResponsavel(e.target.value)}
                      placeholder="Ex.: Carlos Eduardo"
                    />
                  </div>
                  <div>
                    <label className={classesLabel} htmlFor="telefone-responsavel">
                      Telefone
                    </label>
                    <input
                      id="telefone-responsavel"
                      className={`${classesCampo} font-mono`}
                      value={telefoneResponsavel}
                      onChange={(e) => setTelefoneResponsavel(e.target.value)}
                      placeholder="(12) 90000-0000"
                    />
                  </div>
                </div>
                <div>
                  <label className={classesLabel} htmlFor="link-avaliacao">
                    Link de avaliação do Google
                  </label>
                  <input
                    id="link-avaliacao"
                    className={`${classesCampo} font-mono`}
                    value={linkAvaliacaoGoogle}
                    onChange={(e) => setLinkAvaliacaoGoogle(e.target.value)}
                    placeholder="https://g.page/r/..."
                  />
                </div>
                <div>
                  <label className={classesLabel} htmlFor="link-encurtado">
                    Link encurtado
                  </label>
                  <input
                    id="link-encurtado"
                    className={`${classesCampo} font-mono`}
                    value={linkEncurtado}
                    onChange={(e) => setLinkEncurtado(e.target.value)}
                    placeholder="https://avalia.link/..."
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-2 flex justify-end gap-3">
          <button type="button" className={classesBotaoSecundario} onClick={onFechar}>
            Cancelar
          </button>
          <button type="button" className={classesBotaoPrimario} onClick={aoSalvar}>
            Registrar visita
          </button>
        </div>
      </div>
    </Modal>
  );
}
