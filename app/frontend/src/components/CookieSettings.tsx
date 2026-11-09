import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { hasOptionalPurposes, setConsent, useConsent, type ConsentMode } from '../lib/consent';
import { href, useLang } from '../lib/lang';

/** Prüft, ob eine Redaktionssitzung besteht. Die Sitzung wird dabei nicht verändert. */
async function hasEditorialSession(): Promise<boolean> {
  try {
    const res = await fetch('/api/auth/me', { credentials: 'same-origin' });
    return res.ok;
  } catch {
    return false;
  }
}

const FOCUSABLE = 'button, a[href], input, [tabindex]:not([tabindex="-1"])';

/** Fußzeilen-Schaltfläche und Auswahldialog. Ohne optionale Zwecke öffnet er sich nie von selbst. */
export function CookieSettings() {
  const { lang, t } = useLang();
  const consent = useConsent();
  const needsDecision = hasOptionalPurposes() && !consent;
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const visible = open || needsDecision;

  useEffect(() => {
    if (!visible) return;
    dialog.current?.querySelector<HTMLElement>('button')?.focus();
  }, [visible]);

  const close = () => {
    setOpen(false);
    opener.current?.focus();
  };

  const choose = (mode: ConsentMode) => {
    setConsent(mode);
    setSession(false);
    if (mode === 'none') void hasEditorialSession().then(setSession);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && open) {
      e.preventDefault();
      close();
      return;
    }
    if (e.key !== 'Tab') return;
    const items = Array.from(dialog.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const options: { mode: ConsentMode; label: string }[] = [
    { mode: 'none', label: t('cookies.none') },
    { mode: 'necessary', label: t('cookies.necessary') },
  ];
  if (hasOptionalPurposes()) options.push({ mode: 'all', label: t('cookies.all') });

  return (
    <>
      <button type="button" ref={opener} className="link-button" onClick={() => setOpen(true)}>
        {t('cookies.open')}
      </button>
      {visible && (
        <div className="consent-backdrop">
          <div
            ref={dialog}
            className="consent glass"
            role="dialog"
            aria-modal="true"
            aria-labelledby="consent-title"
            aria-describedby="consent-intro"
            onKeyDown={onKeyDown}
          >
            <h2 id="consent-title">{t('cookies.title')}</h2>
            <p id="consent-intro">{t(hasOptionalPurposes() ? 'cookies.introOptional' : 'cookies.introNone')}</p>
            <h3>{t('cookies.inventoryTitle')}</h3>
            <ul className="consent-inventory">
              <li>{t('cookies.lang')}</li>
              <li>{t('cookies.theme')}</li>
              <li>{t('cookies.consent')}</li>
              <li>{t('cookies.session')}</li>
            </ul>
            <p>{t('cookies.revoke')}</p>
            <p>
              <Link to={href(lang, '/datenschutz')} onClick={close}>
                {t('cookies.details')}
              </Link>
            </p>
            <div className="consent-options" role="group" aria-label={t('cookies.title')}>
              {options.map((o) => (
                <button
                  key={o.mode}
                  type="button"
                  className="btn btn-secondary"
                  aria-pressed={consent?.mode === o.mode}
                  onClick={() => choose(o.mode)}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <div aria-live="polite">
              {consent && (
                <p className="consent-status">
                  {t(`cookies.saved.${consent.mode}`)}
                  {consent.mode === 'none' && ` ${t('cookies.noneHint')}`}
                </p>
              )}
              {consent?.mode === 'none' && session && (
                <p className="consent-status">
                  {t('cookies.sessionHint')} <a href="/redaktion/anmelden">{t('cookies.sessionLink')}</a>
                </p>
              )}
            </div>
            {!needsDecision && (
              <button type="button" className="btn btn-primary" onClick={close}>
                {t('cookies.close')}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
