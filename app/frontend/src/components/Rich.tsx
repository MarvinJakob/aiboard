import { Fragment } from 'react';
import type { RichText } from '../i18n/home';

/** Gibt Fließtext mit Inline-Code und Hervorhebungen aus (siehe RichText). */
export function Rich({ text }: { text: RichText }) {
  return text.map((part, i) => (
    <Fragment key={i}>{typeof part === 'string' ? part : 'code' in part ? <code>{part.code}</code> : <em>{part.em}</em>}</Fragment>
  ));
}
