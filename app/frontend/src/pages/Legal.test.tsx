import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { installFakeApi, renderApp } from '../test/fakeApi';

beforeEach(() => {
  installFakeApi();
});

describe('Ticket #103: Impressum', () => {
  it.each([
    ['de', 'Impressum', 'Deutschland'],
    ['en', 'Legal notice', 'Germany'],
  ])('öffnet die %s-Fassung über den Footer per Tastatur und zeigt die freigegebenen Daten', async (lang, title, country) => {
    const user = userEvent.setup();
    const { router } = renderApp(`/${lang}/datenschutz`);
    const footer = screen.getByRole('contentinfo');
    const link = within(footer).getByRole('link', { name: title });
    expect(link).toHaveAttribute('href', `/${lang}/impressum`);

    within(footer).getByRole('link', { name: 'Blog' }).focus();
    await user.tab();
    expect(link).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(router.state.location.pathname).toBe(`/${lang}/impressum`);

    const main = within(screen.getByRole('main'));
    expect(await main.findByRole('heading', { level: 1, name: title })).toHaveFocus();
    expect(main.getByRole('link', { name: '+49 175 1964719' })).toHaveAttribute('href', 'tel:+491751964719');
    expect(main.getByRole('link', { name: 'mail@marvinjakob.de' })).toHaveAttribute('href', 'mailto:mail@marvinjakob.de');
    expect(main.getAllByText(new RegExp(`^Marvin Jakob Danzigerstr\\. 2 65527 Niedernhausen ${country}$`))).toHaveLength(2);
    expect(screen.getByRole('main')).not.toHaveTextContent(/Platzhalter|Placeholder|cimt|\[Name|\[Adresse/);
  });
});
