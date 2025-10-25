import React from 'react';
import { generateHtmlForNode, generateCssForNode } from '../utils/generators';

export default function Inspector({
  node,
  onCopyHtml,
  onCopyCss,
  onExportCrop
}: {
  node: any | null,
  onCopyHtml: (s: string) => void,
  onCopyCss: (s: string) => void,
  onExportCrop: () => void
}) {
  if (!node) {
    return (
      <div style={{ padding: 12 }}>
        <h3>Inspector</h3>
        <div>Kies een element om details te zien</div>
      </div>
    );
  }

  const html = generateHtmlForNode(node);
  const css = generateCssForNode(node);

  return (
    <div style={{ padding: 12 }}>
      <h3>Inspector</h3>
      <div style={{ marginBottom: 8 }}>
        <strong>Tag:</strong> {node.tag} <br />
        <strong>Classes:</strong> {node.class || '-'} <br />
        <strong>Text:</strong> {node.text ? node.text.slice(0,120) : '-'}
      </div>

      <div style={{ marginBottom: 8 }}>
        <button onClick={() => onCopyHtml(html)} style={{ marginRight: 6 }}>Copy HTML</button>
        <button onClick={() => onCopyCss(css)} style={{ marginRight: 6 }}>Copy CSS</button>
        <button onClick={() => onExportCrop()}>Export Crop</button>
      </div>

      <details>
        <summary>Raw node JSON</summary>
        <pre style={{ maxHeight: 240, overflow: 'auto' }}>{JSON.stringify(node, null, 2)}</pre>
      </details>
    </div>
  );
}
