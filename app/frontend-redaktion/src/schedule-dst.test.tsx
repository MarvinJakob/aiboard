// Ticket #32: Termine bei der Zeitumstellung. Die Zeitzone Europe/Berlin setzt vite.config.ts (test.env.TZ).

import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { EditorPost } from './api/posts';
import { formatWithZone, resolveLocalInput } from './components/PostParts';
import { EDITOR, fakeBackend, json, renderAt, type Handler } from './test/fakeApi';

afterEach(() => vi.unstubAllGlobals());

describe('Ticket #32: Umrechnung der Ortszeit', () => {
  it('läuft in Europe/Berlin', () => {
    expect(new Date('2027-01-15T12:00:00Z').getTimezoneOffset()).toBe(-60);
    expect(new Date('2027-07-15T12:00:00Z').getTimezoneOffset()).toBe(-120);
  });

  it('rechnet gewöhnliche Uhrzeiten eindeutig um', () => {
    expect(resolveLocalInput('2027-01-15T09:30')).toEqual({ kind: 'ok', iso: '2027-01-15T08:30:00.000Z' });
    expect(resolveLocalInput('2027-07-15T09:30')).toEqual({ kind: 'ok', iso: '2027-07-15T07:30:00.000Z' });
    // Kurz vor und nach den Umstellungen
    expect(resolveLocalInput('2027-03-28T01:59')).toEqual({ kind: 'ok', iso: '2027-03-28T00:59:00.000Z' });
    expect(resolveLocalInput('2027-03-28T03:00')).toEqual({ kind: 'ok', iso: '2027-03-28T01:00:00.000Z' });
    expect(resolveLocalInput('2027-10-31T03:00')).toEqual({ kind: 'ok', iso: '2027-10-31T02:00:00.000Z' });
  });

  it('erkennt die beim Beginn der Sommerzeit fehlende Stunde', () => {
    for (const v of ['2027-03-28T02:00', '2027-03-28T02:30', '2027-03-28T02:59']) {
      expect(resolveLocalInput(v)).toEqual({ kind: 'nonexistent' });
    }
  });

  it('erkennt die am Ende der Sommerzeit doppelte Stunde mit beiden Zeitpunkten', () => {
    expect(resolveLocalInput('2027-10-31T02:30')).toEqual({
      kind: 'ambiguous',
      options: ['2027-10-31T00:30:00.000Z', '2027-10-31T01:30:00.000Z'],
    });
    expect(formatWithZone('2027-10-31T00:30:00.000Z')).toBe('31.10.2027, 02:30 MESZ (00:30 UTC)');
    expect(formatWithZone('2027-10-31T01:30:00.000Z')).toBe('31.10.2027, 02:30 MEZ (01:30 UTC)');
  });

  it('meldet leere und unvollständige Eingaben als leer', () => {
    expect(resolveLocalInput('')).toEqual({ kind: 'empty' });
    expect(resolveLocalInput('2027-10-31')).toEqual({ kind: 'empty' });
  });
});

describe('Ticket #32: Editor', () => {
  const DRAFT: EditorPost = {
    id: 7,
    slug: 'entwurf',
    status: 'draft',
    featured: false,
    topics: [],
    texts: [{ lang: 'de', title: 'Entwurf', summary: 'Kurz', bodyMarkdown: 'Text' }],
    updatedAt: '2026-11-05T09:00:00Z',
  };

  function backend() {
    const post = structuredClone(DRAFT);
    const saved: string[] = [];
    const handler: Handler = (r) => {
      if (r.path === '/api/topics') return json(200, { items: [] });
      if (r.path === '/api/admin/posts/7' && r.method === 'GET') return json(200, post);
      if (r.path === '/api/admin/posts/7/schedule' && r.method === 'PUT') {
        const at = (r.body as { publishAt: string }).publishAt;
        saved.push(at);
        post.scheduledAt = at;
        return json(200, post);
      }
      return undefined;
    };
    return { handler, saved, post };
  }
  const toolbar = () => screen.getByRole('toolbar', { name: 'Beitrag' });
  const field = () => screen.findByLabelText('Datum und Uhrzeit');

  it('lehnt eine nicht existierende Uhrzeit mit verständlicher Meldung ab', async () => {
    const { handler, saved } = backend();
    fakeBackend(EDITOR, handler);
    const user = userEvent.setup();
    renderAt('/beitraege/7');
    fireEvent.change(await field(), { target: { value: '2027-03-28T02:30' } });
    // Schon vor dem Speichern sichtbar
    expect(screen.getByText(/gibt es an diesem Tag wegen der Umstellung auf Sommerzeit nicht/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Zeitpunkt speichern' }));
    expect(await within(toolbar()).findByRole('alert')).toHaveTextContent('Umstellung auf Sommerzeit');
    expect(saved).toEqual([]);
  });

  it('zeigt bei doppelter Uhrzeit beide Zeitpunkte und speichert genau den gewählten', async () => {
    const { handler, saved } = backend();
    fakeBackend(EDITOR, handler);
    const user = userEvent.setup();
    renderAt('/beitraege/7');
    fireEvent.change(await field(), { target: { value: '2027-10-31T02:30' } });
    const choice = screen.getByRole('group', { name: /gibt es wegen der Zeitumstellung zweimal/ });
    const first = within(choice).getByRole('radio', { name: /02:30 MESZ \(00:30 UTC\)/ });
    const second = within(choice).getByRole('radio', { name: /02:30 MEZ \(01:30 UTC\)/ });

    // Ohne Auswahl wird nichts gespeichert.
    await user.click(screen.getByRole('button', { name: 'Zeitpunkt speichern' }));
    expect(await within(toolbar()).findByRole('alert')).toHaveTextContent('Bitte wählen Sie, welche gemeint ist');
    expect(saved).toEqual([]);

    await user.click(second);
    expect(second).toBeChecked();
    expect(first).not.toBeChecked();
    await user.click(screen.getByRole('button', { name: 'Zeitpunkt speichern' }));
    await waitFor(() => expect(saved).toEqual(['2027-10-31T01:30:00.000Z']));
    // Bestätigt wird derselbe Zeitpunkt, der gespeichert ist.
    expect(await within(toolbar()).findByText(/02:30 MEZ \(01:30 UTC\)/)).toBeInTheDocument();
    expect(screen.getByText(/Geplant für 31\.10\.2027, 02:30 MEZ \(01:30 UTC\)/)).toBeInTheDocument();
  });

  it('nennt bei gewöhnlicher Uhrzeit vor dem Speichern Zeitzone und UTC', async () => {
    const { handler, saved } = backend();
    fakeBackend(EDITOR, handler);
    const user = userEvent.setup();
    renderAt('/beitraege/7');
    fireEvent.change(await field(), { target: { value: '2027-01-15T09:30' } });
    expect(screen.getByText('Gilt: 15.01.2027, 09:30 MEZ (08:30 UTC)')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Zeitpunkt speichern' }));
    await waitFor(() => expect(saved).toEqual(['2027-01-15T08:30:00.000Z']));
  });
});
