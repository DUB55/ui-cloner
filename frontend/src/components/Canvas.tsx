import React, { useState, useEffect, useRef } from 'react';
import Layer from './Layer';
import Inspector from './Inspector';

export default function Canvas({ screenshotUrl, nodes }: { screenshotUrl: string | null, nodes: any[] }) {
  const [localNodes, setLocalNodes] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [scale, setScale] = useState({ x: 1, y: 1 });

  useEffect(() => {
    setLocalNodes(nodes || []);
    setSelectedIndex(null);
  }, [nodes]);

  // compute scale after image loads
  function onImageLoad() {
    if (!imgRef.current) return;
    const img = imgRef.current;
    const naturalW = img.naturalWidth || img.width;
    const naturalH = img.naturalHeight || img.height;
    const displayedW = img.getBoundingClientRect().width;
    const displayedH = img.getBoundingClientRect().height;
    setScale({ x: displayedW / (naturalW || 1), y: displayedH / (naturalH || 1) });
  }

  function updateNode(index: number, partial: Partial<any>) {
    setLocalNodes(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...partial };
      return copy;
    });
  }

  function handleSelect(index: number | null) {
    setSelectedIndex(index);
  }

  async function exportCrop() {
    if (selectedIndex === null) {
      alert('Selecteer eerst een element om te exporteren.');
      return;
    }
    const node = localNodes[selectedIndex];
    if (!node || !screenshotUrl) return;

    try {
      const res = await fetch('/api/crop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ screenshotUrl, bbox: node.bbox })
      });
      if (!res.ok) {
        const err = await res.json().catch(()=>null);
        throw new Error(err?.error || 'Crop request failed');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'crop.png';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Crop failed: ' + (err?.message || err));
    }
  }

  return (
    <div className="editor-layout">
      <div className="editor-canvas">
        {!screenshotUrl && <div className="placeholder">No screenshot yet — render a URL to begin.</div>}
        {screenshotUrl && (
          <div className="canvas-stage" style={{ position: 'relative' }}>
            <div style={{ position: 'relative' }}>
              <img ref={imgRef} src={screenshotUrl} alt="screenshot" onLoad={onImageLoad} style={{ width: '100%', display: 'block', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', left: 0, top: 0 }}>
                {localNodes.map((n, i) => {
                  // compute scaled bbox
                  const sx = scale.x || 1;
                  const sy = scale.y || 1;
                  const scaled = {
                    bbox: {
                      x: Math.round((n.bbox?.x || 0) * sx),
                      y: Math.round((n.bbox?.y || 0) * sy),
                      width: Math.max(1, Math.round((n.bbox?.width || 1) * sx)),
                      height: Math.max(1, Math.round((n.bbox?.height || 1) * sy))
                    },
                    ...n
                  };
                  return (
                    <Layer
                      key={i}
                      node={scaled}
                      index={i}
                      onChange={(partial: Partial<any>) => {
                        // when user drags/resizes we must map back to unscaled bbox for export operations
                        if (partial.bbox) {
                          const unscaled = {
                            x: Math.round((partial.bbox.x || 0) / (sx || 1)),
                            y: Math.round((partial.bbox.y || 0) / (sy || 1)),
                            width: Math.round((partial.bbox.width || 0) / (sx || 1)),
                            height: Math.round((partial.bbox.height || 0) / (sy || 1))
                          };
                          updateNode(i, { bbox: unscaled });
                        } else {
                          updateNode(i, partial);
                        }
                      }}
                      onSelect={() => handleSelect(i)}
                      isSelected={selectedIndex === i}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <aside className="editor-inspector">
        <div style={{ position: 'sticky', top: 12 }}>
          <Inspector
            node={selectedIndex !== null ? localNodes[selectedIndex] : null}
            onCopyHtml={(html) => { navigator.clipboard.writeText(html); alert('HTML gekopieerd'); }}
            onCopyCss={(css) => { navigator.clipboard.writeText(css); alert('CSS gekopieerd'); }}
            onExportCrop={exportCrop}
          />
        </div>
      </aside>
    </div>
  );
}
