#!/usr/bin/env node
// Generates ATS-friendly resumes (single column, real selectable text, standard
// headings) in Spanish and English from src/data/cv.json, using Playwright's
// page.pdf(). Run on demand with `npm run cv`; the PDFs are committed as assets.

import { chromium } from '@playwright/test';
import { readFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = resolve(__dirname, '../src/data/cv.json');
const OUT_DIR = resolve(__dirname, '../public/assets/documents');

const cv = JSON.parse(await readFile(DATA, 'utf8'));

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function buildHtml(locale) {
  const S = cv.sections[locale];
  const techLabel = locale === 'es' ? 'Tecnologías' : 'Technologies';
  const c = cv.contact;
  const contactLine = [c.phone, c.email, c.linkedin, c.github, c.portfolio, c.location]
    .map(esc)
    .join('  ·  ');

  const skills = cv.skills[locale]
    .map((g) => `<p class="skill"><strong>${esc(g.cat)}:</strong> ${esc(g.items.join(', '))}</p>`)
    .join('');

  const experience = cv.experience[locale]
    .map(
      (job) => `
      <div class="job">
        <div class="job-head">
          <span class="job-role">${esc(job.role)}</span>
          <span class="job-period">${esc(job.period)}</span>
        </div>
        <div class="job-org">${esc(job.org)}</div>
        ${job.note ? `<div class="job-note">${esc(job.note)}</div>` : ''}
        ${job.tech ? `<div class="job-tech">${esc(techLabel)}: ${esc(job.tech)}</div>` : ''}
        <ul>${job.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
      </div>`,
    )
    .join('');

  const education = cv.education[locale].map((e) => `<li>${esc(e)}</li>`).join('');
  const projects = cv.projects[locale]
    .map((p) => `<li><strong>${esc(p.name)}</strong> — ${esc(p.desc)}</li>`)
    .join('');
  const languages = cv.languages[locale].map(esc).join('  ·  ');

  return `<!doctype html>
<html lang="${locale}">
<head>
<meta charset="utf-8" />
<style>
  * { margin: 0; box-sizing: border-box; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    color: #1a1a1a;
    font-size: 10.5px;
    line-height: 1.42;
  }
  h1 { font-size: 22px; letter-spacing: 0.5px; }
  .title { font-size: 12px; color: #007788; font-weight: bold; margin-top: 2px; }
  .contact { font-size: 9.5px; color: #333; margin-top: 6px; }
  h2 {
    font-size: 11.5px; text-transform: uppercase; letter-spacing: 1px;
    color: #000033; border-bottom: 1.5px solid #007788;
    padding-bottom: 3px; margin: 16px 0 8px;
  }
  p { margin: 0 0 4px; }
  .skill { margin: 0 0 3px; }
  ul { margin: 4px 0 0; padding-left: 16px; }
  li { margin: 0 0 2px; }
  .job { margin-bottom: 11px; }
  .job-head { display: flex; justify-content: space-between; align-items: baseline; }
  .job-role { font-weight: bold; font-size: 11px; }
  .job-period { font-size: 9.5px; color: #555; white-space: nowrap; }
  .job-org { font-size: 10px; color: #333; }
  .job-note { font-size: 9.5px; font-style: italic; color: #555; margin-top: 1px; }
  .job-tech { font-size: 9.5px; color: #007788; margin-top: 2px; }
</style>
</head>
<body>
  <header>
    <h1>${esc(cv.name)}</h1>
    <div class="title">${esc(cv.title[locale])}</div>
    <div class="contact">${contactLine}</div>
  </header>

  <h2>${esc(S.summary)}</h2>
  <p>${esc(cv.summary[locale])}</p>

  <h2>${esc(S.skills)}</h2>
  ${skills}

  <h2>${esc(S.experience)}</h2>
  ${experience}

  <h2>${esc(S.projects)}</h2>
  <ul>${projects}</ul>

  <h2>${esc(S.education)}</h2>
  <ul>${education}</ul>

  <h2>${esc(S.languages)}</h2>
  <p>${languages}</p>
</body>
</html>`;
}

const targets = [
  { locale: 'es', file: 'resume-es.pdf' },
  { locale: 'en', file: 'resume-en.pdf' },
];

await mkdir(OUT_DIR, { recursive: true });
const browser = await chromium.launch();
try {
  for (const { locale, file } of targets) {
    const page = await browser.newPage();
    await page.setContent(buildHtml(locale), { waitUntil: 'load' });
    await page.pdf({
      path: resolve(OUT_DIR, file),
      format: 'A4',
      printBackground: false,
      margin: { top: '14mm', bottom: '14mm', left: '16mm', right: '16mm' },
    });
    await page.close();
    console.log(`[cv] Wrote ${file}`);
  }
} finally {
  await browser.close();
}
