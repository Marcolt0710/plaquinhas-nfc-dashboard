import { useMemo, useState } from "react";
import { Modal } from "../Modal";
import { classesBotaoPrimario, classesBotaoSecundario, classesCampo, classesLabel } from "../formClasses";
import { useAppStore } from "../../store/useAppStore";
import { CATEGORIAS_LEAD, type CategoriaLead } from "../../types";

interface ModalNovoLeadProps {
  onFechar: () => void;
  onCriado: (leadId: string) => void;
}

export function ModalNovoLead({ onFechar, onCriado }: ModalNovoLeadProps) {
  const addLead = useAppStore((state) => state.addLead);
  const leads = useAppStore((state) => state.leads);

  const ruasConhecidas = useMemo(
    () => Array.from(new Set(leads.map((lead) => lead.rua))).sort(),
    [leads],
  );

  const [nomeEstabelecimento, setNomeEstabelecimento] = useState("");
  const [endereco, setEndereco] = useState("");
  const [rua, setRua] = useState("");
  const [categoria, setCategoria] = useState<CategoriaLead>("outros");
  const [notaGoogle, setNotaGoogle] = useState("");
  const [numeroAvaliacoes, setNumeroAvaliacoes] = useState("");
  const [observacoes, setObservacoes] = useState("");

  function aoSalvar() {
    if (!nomeEstabelecimento.trim() || !rua.trim()) return;
    const id = addLead({
      nomeEstabelecimento: nomeEstabelecimento.trim(),
      endereco: endereco.trim(),
      rua: rua.trim(),
      categoria,
      notaGoogle: notaGoogle ? Number(notaGoogle) : null,
      numeroAvaliacoes: numeroAvaliacoes ? Number(numeroAvaliacoes) : null,
      vizinhoReferencia: null,
      situacao: "a_visitar",
      dataVisita: null,
      atendidoPor: null,
      eraDono: null,
      motivoDescarte: null,
      dataRetorno: null,
      observacoes: observacoes.trim(),
    });
    onCriado(id);
  }

  return (
    <Modal titulo="Novo lead" onFechar={onFechar}>
      <div className="flex flex-col gap-4">
        <div>
          <label className={classesLabel} htmlFor="nome-estabelecimento">
            Nome do estabelecimento
          </label>
          <input
            id="nome-estabelecimento"
            className={classesCampo}
            value={nomeEstabelecimento}
            onChange={(e) => setNomeEstabelecimento(e.target.value)}
            placeholder="Ex.: Barbearia Vintage"
            autoFocus
          />
        </div>

        <div>
          <label className={classesLabel} htmlFor="endereco">
            Endereço
          </label>
          <input
            id="endereco"
            className={classesCampo}
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
            placeholder="Ex.: Av. JBSQJ, 450"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={classesLabel} htmlFor="rua">
              Rua
            </label>
            <input
              id="rua"
              className={classesCampo}
              value={rua}
              onChange={(e) => setRua(e.target.value)}
              placeholder="Ex.: R. dos Alecrins"
              list="ruas-conhecidas"
            />
            <datalist id="ruas-conhecidas">
              {ruasConhecidas.map((r) => (
                <option key={r} value={r} />
              ))}
            </datalist>
          </div>
          <div>
            <label className={classesLabel} htmlFor="categoria">
              Categoria
            </label>
            <select
              id="categoria"
              className={classesCampo}
              value={categoria}
              onChange={(e) => setCategoria(e.target.value as CategoriaLead)}
            >
              {CATEGORIAS_LEAD.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={classesLabel} htmlFor="nota-google">
              Nota no Google
            </label>
            <input
              id="nota-google"
              type="number"
              min={0}
              max={5}
              step={0.1}
              className={`${classesCampo} font-mono`}
              value={notaGoogle}
              onChange={(e) => setNotaGoogle(e.target.value)}
              placeholder="Ex.: 4.5"
            />
          </div>
          <div>
            <label className={classesLabel} htmlFor="numero-avaliacoes">
              Número de avaliações
            </label>
            <input
              id="numero-avaliacoes"
              type="number"
              min={0}
              className={`${classesCampo} font-mono`}
              value={numeroAvaliacoes}
              onChange={(e) => setNumeroAvaliacoes(e.target.value)}
              placeholder="Ex.: 120"
            />
          </div>
        </div>

        <div>
          <label className={classesLabel} htmlFor="observacoes">
            Observações
          </label>
          <textarea
            id="observacoes"
            className={`${classesCampo} min-h-20 resize-y`}
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="O que vale lembrar antes de visitar"
          />
        </div>

        <div className="mt-2 flex justify-end gap-3">
          <button type="button" className={classesBotaoSecundario} onClick={onFechar}>
            Cancelar
          </button>
          <button
            type="button"
            className={classesBotaoPrimario}
            disabled={!nomeEstabelecimento.trim() || !rua.trim()}
            onClick={aoSalvar}
          >
            Salvar lead
          </button>
        </div>
      </div>
    </Modal>
  );
}
