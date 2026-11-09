import { Fragment } from 'react';
import type { RichText } from '../i18n/home';

/** Gibt Fließtext mit Inline-Code aus (siehe RichText). */
export function Rich({ text }: { text: RichText }) {
  return text.map((part, i) => <Fragment key={i}>{typeof part === 'string' ? part : <code>{part.code}</code>}</Fragment>);
}
