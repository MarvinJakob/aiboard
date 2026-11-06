import type { Image } from '../api/client';
import { artBackground, topicStyle } from '../lib/topicStyle';
import { Icon } from './Icon';

interface Props {
  topic?: string;
  seed?: number;
  /** Echtes Titelbild, sofern vorhanden. Sonst erscheint die Themengrafik. */
  image?: Image;
  sizes?: string;
  eager?: boolean;
  className?: string;
}

/** Themengrafik oder Titelbild. Rein dekorativ, solange kein Bild mit Alternativtext vorliegt. */
export function Art({ topic, seed = 0, image, sizes = '100vw', eager = false, className }: Props) {
  const cls = ['art', className].filter(Boolean).join(' ');
  if (image) {
    return (
      <div className={cls}>
        <img
          className="art-img"
          src={image.src}
          srcSet={image.srcset}
          sizes={sizes}
          width={image.width}
          height={image.height}
          alt={image.alt}
          lang={image.altLang}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
        />
      </div>
    );
  }
  return (
    <div className={cls} style={artBackground(topic, seed)} aria-hidden="true">
      <span className="art-icon">
        <Icon name={topicStyle(topic).icon} strokeWidth={1.1} />
      </span>
    </div>
  );
}
