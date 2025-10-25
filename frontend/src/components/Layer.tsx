import React from 'react';
import { Rnd } from 'react-rnd';


function cssToReactStyle(styles: Record<string,string>) {
const out: React.CSSProperties = {};
Object.entries(styles || {}).forEach(([k,v]) => {
if (!v) return;
const camel = k.replace(/-([a-z])/g, g => g[1].toUpperCase());
try { (out as any)[camel] = v; } catch(e) {}
});
return out;
}


export default function Layer({ node, index }: { node: any, index: number }) {
const { bbox, styles, html, text, tag, src } = node;


const initial = { x: bbox.x, y: bbox.y, width: bbox.width || 100, height: b