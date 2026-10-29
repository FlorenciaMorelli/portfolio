import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { jobsOn, level, weeks, monthStarts, lastSixMonths } from '../../src/lib/work-calendar';
import caseStudies from '../../src/data/case-studies.json';

const work = { enivel7: ['2023-08-26'], guia: ['2026-09-28', '2026-10-03'] };
const today = '2026-10-28';

describe('jobsOn', () => {
  it('follows the rules of each job', () => {
    expect(jobsOn('2020-05-09', today, work)).toEqual([]); // before Maipú
    expect(jobsOn('2020-05-11', today, work)).toEqual(['maipu']); // Monday
    expect(jobsOn('2020-05-16', today, work)).toEqual(['maipu']); // Saturday
    expect(jobsOn('2020-05-17', today, work)).toEqual([]); // Sunday
    expect(jobsOn('2024-12-02', today, work)).toEqual(['smg']);
    expect(jobsOn('2024-12-07', today, work)).toEqual([]); // SMG does not work on Saturdays
    expect(jobsOn('2023-08-26', today, work)).toEqual(['maipu', 'enivel7']); // a Saturday with both
    expect(jobsOn('2026-09-28', today, work)).toEqual(['smg', 'guia']);
    expect(jobsOn('2026-10-03', today, work)).toEqual(['guia']); // Saturday: only Guia
  });

  it('never paints a day after today', () => {
    expect(jobsOn('2026-10-29', today, work)).toEqual([]);
  });
});

describe('level', () => {
  it('is 0, 2 or 4', () => {
    expect([level([]), level(['smg']), level(['smg', 'guia'])]).toEqual([0, 2, 4]);
  });
});

describe('weeks', () => {
  it('goes from Monday to Sunday and marks the days out of range', () => {
    const grid = weeks('2026-01-01', '2026-12-31');
    expect(grid[0][0]).toEqual({ day: '2025-12-29', inRange: false });
    expect(grid[0][3]).toEqual({ day: '2026-01-01', inRange: true });
    expect(grid.flat().filter((c) => c.inRange)).toHaveLength(365);
    expect(grid.at(-1)?.at(-1)?.day).toBe('2027-01-03');
  });

  it('labels each month where it starts', () => {
    const starts = monthStarts(weeks('2026-01-01', '2026-12-31'));
    expect(starts).toHaveLength(12);
    expect(starts[8]).toEqual({ month: 8, week: 35 });
  });
});

describe('lastSixMonths', () => {
  it('starts on the first day of the month five months back', () => {
    expect(lastSixMonths('2026-10-28')).toEqual({ from: '2026-05-01', to: '2026-10-28' });
  });
});

describe('the data', () => {
  it('has only days, and the first Audenpass commit matches the case study text', () => {
    const data = JSON.parse(readFileSync('src/data/work-days.json', 'utf8'));
    for (const days of Object.values<string[]>(data.days)) for (const d of days) expect(d).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const first = caseStudies.audenpass.firstCommit;
    const [y, m, d] = first.split('-');
    expect(JSON.stringify(caseStudies.audenpass.sections)).toContain(`${d}/${m}/${y}`);
    expect(data.days.guia[0]).toBe(first);
  });
});
