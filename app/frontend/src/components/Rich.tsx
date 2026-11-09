import { Fragment } from 'react';
import type { RichText } from '../i18n/sources';
import { Footnote } from './Footnote';

/** Gibt Fließtext mit Quellenverweisen und Inline-Code aus (siehe RichText). */
export function Rich({ text }: { text: RichText }) {
  return text.map((part, i) => (
    <Fragment key={i}>
      {typeof part === 'string' ? part : typeof part === 'number' ? <Footnote n={part} /> : <code>{part.code}</code>}
    </Fragment>
  ));
}
