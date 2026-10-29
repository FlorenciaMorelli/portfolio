// Work calendar of Experiencia: one square per day, darker when two jobs overlap. Pure functions,
// used at build time and in the browser (to draw other years).
//
// Rules given by Florencia: Diagnóstico Maipú from Monday to Saturday (10/05/2020 to 01/12/2024),
// SMG from Monday to Friday (from 02/12/2024), and the days with commits for Enivel7 and Guia
// (src/data/work-days.json, written by scripts/work-days.mjs).

export type Job = 'maipu' | 'smg' | 'enivel7' | 'guia';
export const JOBS: Job[] = ['maipu', 'smg', 'enivel7', 'guia'];

export interface WorkDays {
  enivel7: string[];
  guia: string[];
}

/** Monday 0 … Sunday 6 */
const weekday = (date: Date) => (date.getUTCDay() + 6) % 7;
export const iso = (date: Date) => date.toISOString().slice(0, 10);
export const parse = (day: string) => new Date(`${day}T00:00:00Z`);
const addDays = (date: Date, n: number) => new Date(date.getTime() + n * 86_400_000);

/** The jobs of one day (YYYY-MM-DD), as of `today`. */
export function jobsOn(day: string, today: string, work: WorkDays): Job[] {
  if (day > today) return [];
  const wd = weekday(parse(day));
  const jobs: Job[] = [];
  if (day >= '2020-05-10' && day <= '2024-12-01' && wd <= 5) jobs.push('maipu');
  if (day >= '2024-12-02' && wd <= 4) jobs.push('smg');
  if (work.enivel7.includes(day)) jobs.push('enivel7');
  if (work.guia.includes(day)) jobs.push('guia');
  return jobs;
}

/** 0 without work, 2 with one job, 4 with two or more (the contribuciones/* tokens). */
export const level = (jobs: Job[]) => (jobs.length === 0 ? 0 : jobs.length === 1 ? 2 : 4);

export interface Cell {
  day: string;
  /** False for the days of the first and last weeks that fall outside the range. */
  inRange: boolean;
}

/** Weeks (Monday to Sunday) covering `from` to `to`, both included. */
export function weeks(from: string, to: string): Cell[][] {
  const start = addDays(parse(from), -weekday(parse(from)));
  const out: Cell[][] = [];
  for (let monday = start; iso(monday) <= to; monday = addDays(monday, 7)) {
    out.push(
      Array.from({ length: 7 }, (_, i) => {
        const day = iso(addDays(monday, i));
        return { day, inRange: day >= from && day <= to };
      }),
    );
  }
  return out;
}

/** Index of the week where each month starts, for the labels above the grid. */
export function monthStarts(grid: Cell[][]): { month: number; week: number }[] {
  const out: { month: number; week: number }[] = [];
  grid.forEach((week, w) => {
    const first = week.find((cell) => cell.inRange && cell.day.endsWith('-01'));
    if (first) out.push({ month: Number(first.day.slice(5, 7)) - 1, week: w });
  });
  return out;
}

/** The last six months up to `today`, from the first day of the month five months back. */
export function lastSixMonths(today: string): { from: string; to: string } {
  const d = parse(today);
  const first = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - 5, 1));
  return { from: iso(first), to: today };
}

export interface GridLabels {
  months: string[];
  /** Letters for Monday, Wednesday and Friday (L, X, V). */
  letters: [string, string, string];
}

/**
 * Markup of one grid: month labels, day letters and one column per week. Each week is a scroll
 * step (data-step, --from) so the weeks appear left to right. Used at build time and in the
 * browser, so both draw the same thing.
 */
export function gridHtml(from: string, to: string, today: string, work: WorkDays, labels: GridLabels): string {
  const grid = weeks(from, to);
  const months = monthStarts(grid)
    .map(({ month, week }) => `<span style="grid-column: ${week + 1}">${labels.months[month]}</span>`)
    .join('');
  const letters = labels.letters.map((l, i) => `<span style="grid-row: ${i * 2 + 1}">${l}</span>`).join('');
  const columns = grid
    .map((week, w) => {
      const days = week
        .map((cell) => {
          if (!cell.inRange) return '<span class="cal__day cal__day--out"></span>';
          const jobs = jobsOn(cell.day, today, work);
          return `<span class="cal__day" data-l="${level(jobs)}" data-d="${cell.day}"${jobs.length ? ` data-j="${jobs.join(' ')}"` : ''}></span>`;
        })
        .join('');
      return `<span class="cal__week" data-step style="--from: ${w}">${days}</span>`;
    })
    .join('');
  return `<div class="cal__grid" style="--weeks: ${grid.length}; --steps: ${grid.length}"><div class="cal__months">${months}</div><div class="cal__letters">${letters}</div><div class="cal__weeks">${columns}</div></div>`;
}
