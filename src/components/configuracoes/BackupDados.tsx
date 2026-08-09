import { useRef, useState } from "react";
import { Download, TriangleAlert, Upload } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { mostrarToast } from "../../store/useUiStore";
import { baixarBackup, validarBackup, type ResumoMesclagem } from "../../lib/backup";
import { classesBotaoSecundario } from "../formClasses";

export function BackupDados() {
  const estado = useAppStore();
  const mesclarBackup = useAppStore((s) => s.mesclarBackup);
  const inputRef = useRef<HTMLInputElement>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [resumo, setResumo] = useState<ResumoMesclagem | null>(null);

  function exportar() {
    baixarBackup({
      leads: estado.leads,
      clientes: estado.clientes,
      pedidos: estado.pedidos,
      etiquetas: estado.etiquetas,
      itensEstoque: estado.itensEstoque,
      movimentosEstoque: estado.movimentosEstoque,
      configuracao: estado.configuracao,
    });
    mostrarToast("Backup baixado.");
  }

  async function importar(arquivo: File) {
    setErro(null);
    setResumo(null);
    let bruto: unknown;
    try {
      bruto = JSON.parse(await arquivo.text());
    } catch {
      setErro("Não foi possível ler o arquivo: ele não é um JSON válido. Confira se enviou o arquivo certo.");
      return;
    }
    const validacao = validarBackup(bruto);
    if (!validacao.ok) {
      setErro(validacao.erro);
      return;
    }
    const r = mesclarBackup(validacao.dados);
    setResumo(r);
    mostrarToast("Backup importado.");
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
      <div>
        <h2 className="text-lg text-primary">Backup dos dados</h2>
        <p className="mt-1 max-w-2xl text-sm text-secondary">
          Os dados ficam guardados só neste navegador. Baixe um backup para não depender dele — e
          use o mesmo arquivo para passar o que você cadastrou para o aparelho do sócio, enquanto o
          sistema não tem servidor próprio.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button type="button" onClick={exportar} className={`${classesBotaoSecundario} flex items-center justify-center gap-2`}>
          <Download size={16} aria-hidden="true" /> Baixar backup
        </button>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`${classesBotaoSecundario} flex items-center justify-center gap-2`}
        >
          <Upload size={16} aria-hidden="true" /> Importar backup
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const arquivo = e.target.files?.[0];
            if (arquivo) importar(arquivo);
            e.target.value = "";
          }}
        />
      </div>

      <p className="text-xs text-secondary">
        Importar <strong className="font-medium text-primary">soma</strong> ao que já existe, nunca
        apaga: registro novo entra, registro repetido fica com a versão mais recente. Custos e
        pacotes não são importados — eles são iguais nos dois aparelhos, e sobrescrevê-los poderia
        desfazer um reajuste sem aviso.
      </p>

      {erro && (
        <p className="flex items-start gap-2 rounded-md border border-alert/30 bg-alert-tint p-3 text-sm text-alert">
          <TriangleAlert size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          {erro}
        </p>
      )}

      {resumo && (
        <p className="rounded-md border border-border bg-card-hover p-3 text-sm text-secondary">
          <span className="num font-mono text-primary">{resumo.adicionados}</span> registros
          adicionados,{" "}
          <span className="num font-mono text-primary">{resumo.atualizados}</span> atualizados e{" "}
          <span className="num font-mono text-primary">{resumo.mantidos}</span> mantidos como
          estavam.
        </p>
      )}
    </div>
  );
}
