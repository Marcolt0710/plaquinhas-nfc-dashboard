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
