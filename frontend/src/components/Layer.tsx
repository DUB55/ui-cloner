import React from 'react';
import { Rnd } from 'react-rnd';

function cssToReactStyle(styles: Record<string,string> | undefined) {
  const out: React.CSSProperties = {};
  if (!styles) return out;
  Object.entries(styles).forEach(([k,v]) => {
    if (!v) return;
    // convert kebab-case to camelCase
    const camel = k.replace(/-([a-z])/g, (_m, p1) => p1.toUpperCase());
    try { (out as any)[camel] = v; } catch(e) {}
  });
  return out;
}

export default function Layer({ node, index }: { node: any, index: number }) {
  const { bbox, styles, html, text, tag, src } = node || {};

  // defensive defaults if bbox is missing
  const x = (bbox && typeof bbox.x === 'number') ? bbox.x : 0;
  const y = (bbox && typeof bbox.y === 'number') ? bbox.y : 0;
  const width = (bbox && typeof bbox.width === 'number' && bbox.width > 0) ? bbox.width : 100;
  const height = (bbox && typeof bbox.height === 'number' && bbox.height > 0) ? bbox.height : 40;

  const initial = { x, y, width, height };

  return (
    <Rnd
      default={initial}
      bounds="parent"
      enableResizing
      style={{ border: '1px dashed rgba(0,0,0,0.15)', background: 'transparent', pointerEvents: 'auto' }}
    >
      <div style={{ width: '100%', height: '100%', overflow: 'hidden', ...cssToReactStyle(styles) }}>
        {tag === 'img' ? (
          <img src={src || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="layer-img" />
        ) : (
          <div dangerouslySetInnerHTML={{ __html: html || text || '' }} />
        )}
      </div>
    </Rnd>
  );
}
