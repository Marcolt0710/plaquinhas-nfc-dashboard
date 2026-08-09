export function agoraISO(): string {
  return new Date().toISOString();
}

export function somarDias(iso: string, dias: number): string {
  const data = new Date(iso);
  data.setDate(data.getDate() + dias);
  return data.toISOString();
}

export function diferencaEmHoras(iso: string): number {
  return (new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60);
}

export function diferencaEmDias(iso: string): number {
  return Math.floor(diferencaEmHoras(iso) / 24);
}

export function estaVencido(iso: string | null | undefined): boolean {
  if (!iso) return false;
  return new Date(iso).getTime() < Date.now();
}

export function faltamMenosDe24h(iso: string | null | undefined): boolean {
  if (!iso) return false;
  const horas = diferencaEmHoras(iso);
  return horas >= 0 && horas < 24;
}

/** Chave "AAAA-MM" do mês de uma data — útil para agrupar por mês. */
export function chaveDoMes(iso: string): string {
  const data = new Date(iso);
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;
}

export function chaveDoMesAnterior(chaveMes: string): string {
  const [ano, mes] = chaveMes.split("-").map(Number);
  const data = new Date(ano, mes - 2, 1);
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;
}

/** Início (00:00) do dia de N semanas atrás, para agrupar séries semanais. */
export function inicioDaSemana(iso: string): string {
  const data = new Date(iso);
  const diaDaSemana = data.getDay();
  data.setDate(data.getDate() - diaDaSemana);
  data.setHours(0, 0, 0, 0);
  return data.toISOString();
}

/**
 * Verdadeiro se a data é hoje ou já passou, comparando por dia (não por
 * hora exata) — diferente de `estaVencido`, que compara o instante
 * exato. Usado na Início para "o que precisa de atenção hoje": um prazo
 * marcado para hoje às 18h deve aparecer na lista mesmo às 9h da manhã.
 */
export function ehHojeOuAntes(iso: string | null | undefined): boolean {
  if (!iso) return false;
  const alvo = new Date(iso);
  alvo.setHours(0, 0, 0, 0);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return alvo.getTime() <= hoje.getTime();
}
