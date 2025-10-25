export function generateHtmlForNode(node: any) {
  if (!node) return '';
  const tag = node.tag || 'div';
  const classes = node.class ? ` class="${node.class}"` : '';
  const id = node.id ? ` id="${node.id}"` : '';
  if (tag === 'img') {
    const src = node.src ? node.src : '';
    return `<img src="${src}"${id}${classes} />`;
  }
  const inner = node.html ? node.html : (node.text ? escapeHtml(node.text) : '');
  return `<${tag}${id}${classes}>${inner}</${tag}>`;
}

export function generateCssForNode(node: any) {
  if (!node) return '';
  const styles = node.styles || {};
  const cssLines: string[] = [];
  Object.entries(styles).forEach(([k,v]) => {
    if (!v) return;
    cssLines.push(`${k}: ${v};`);
  });
  return cssLines.join('\n');
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'} as any)[m]; });
}
