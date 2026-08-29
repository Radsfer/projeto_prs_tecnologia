// Helpers de data (calendário) usados nas validações de metas e apontamentos.

// Data de hoje no formato ISO (YYYY-MM-DD), em UTC.
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

// Valida se a string é uma data de calendário ISO válida (YYYY-MM-DD).
export function isValidISODate(s: string): boolean {
  const d = new Date(`${s}T00:00:00Z`);
  return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

// Converte "YYYY-MM-DD" em Date (meia-noite UTC) para colunas @db.Date.
export function toDate(s: string): Date {
  return new Date(`${s}T00:00:00Z`);
}
