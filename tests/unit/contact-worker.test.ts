import { describe, expect, it, vi } from 'vitest';
// @ts-expect-error The worker is plain JavaScript, outside the site.
import { handle } from '../../worker/index.mjs';

const env = {
  TO_EMAIL: 'yo@example.com',
  ALLOWED_ORIGINS: 'https://site.example,http://localhost:4321',
  RESEND_API_KEY: 'key',
};
const ok = () => vi.fn(async () => new Response('{}', { status: 200 }));

const post = (body: object, origin: string | null = 'https://site.example') =>
  new Request('https://worker.example/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(origin ? { Origin: origin } : {}) },
    body: JSON.stringify(body),
  });
const message = { name: 'Ana', email: 'ana@example.com', message: 'Hola' };

describe('contact worker', () => {
  it('sends the message to my inbox and lets me reply to the sender', async () => {
    const send = ok();
    const response = await handle(post(message), env, send);
    expect(await response.json()).toEqual({ success: 'true' });
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://site.example');
    const [url, init] = send.mock.calls[0];
    expect(url).toBe('https://api.resend.com/emails');
    expect(init.headers.Authorization).toBe('Bearer key');
    const sent = JSON.parse(init.body);
    expect(sent.to).toEqual(['yo@example.com']);
    expect(sent.reply_to).toBe('ana@example.com');
    expect(sent.text).toContain('Hola');
  });

  it('refuses a request from a site that is not mine, without sending anything', async () => {
    const send = ok();
    expect((await handle(post(message, 'https://other.example'), env, send)).status).toBe(403);
    expect((await handle(post(message, null), env, send)).status).toBe(403);
    expect(send).not.toHaveBeenCalled();
  });

  it('answers the preflight only for my sites', async () => {
    const preflight = (origin: string) => new Request('https://worker.example/', { method: 'OPTIONS', headers: { Origin: origin } });
    expect((await handle(preflight('https://site.example'), env)).status).toBe(204);
    expect((await handle(preflight('https://other.example'), env)).status).toBe(403);
  });

  it('rejects incomplete, invalid or too long messages', async () => {
    const send = ok();
    for (const bad of [
      { ...message, name: '' },
      { ...message, email: 'no-es-un-mail' },
      { ...message, message: '   ' },
      { ...message, message: 'x'.repeat(5001) },
    ]) {
      const response = await handle(post(bad), env, send);
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ success: 'false' });
    }
    expect(send).not.toHaveBeenCalled();
  });

  it('pretends it worked for a bot that fills the hidden field, and sends nothing', async () => {
    const send = ok();
    const response = await handle(post({ ...message, website: 'http://spam.example' }), env, send);
    expect(await response.json()).toEqual({ success: 'true' });
    expect(send).not.toHaveBeenCalled();
  });

  it('says it failed when Resend does', async () => {
    const send = vi.fn(async () => new Response('{}', { status: 500 }));
    const response = await handle(post(message), env, send);
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ success: 'false' });
  });

  it('sends a plain form post back to the page, only to my sites', async () => {
    const form = (next: string) => {
      const body = new URLSearchParams({ ...message, next });
      return new Request('https://worker.example/', { method: 'POST', headers: { Origin: 'https://site.example' }, body });
    };
    const send = ok();
    expect((await handle(form('https://site.example/portfolio/en/'), env, send)).headers.get('Location')).toBe('https://site.example/portfolio/en/');
    expect((await handle(form('https://evil.example/'), env, send)).headers.get('Location')).toBe('https://site.example');
  });
});
