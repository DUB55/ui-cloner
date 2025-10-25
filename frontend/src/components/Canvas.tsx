import React, { useState } from 'react';
import Layer from './Layer';


export default function Canvas({ screenshotUrl, nodes }: { screenshotUrl: string | null, nodes: any[] }) {
const [localNodes, setLocalNodes] = useState(nodes);


// update local nodes when new nodes prop arrives
React.useEffect(() => {
setLocalNodes(nodes);
}, [nodes]);


return (
<div className="canvas-root">
{!screenshotUrl && <div className="placeholder">No screenshot yet — render a URL to begin.</div>}
{screenshotUrl && (
<div className="canvas-stage" style={{ position: 'relative' }}>
<img src={screenshotUrl} alt="screenshot" style={{ width: '100%', display: 'block', pointerEvents: 'none' }} />
<div style={{ position: 'absolute', left: 0, top: 0 }}>
{localNodes.map((n, i) => (
<Layer key={i} node={n} index={i} />
))}
</div>
</div>
)}
</div>
)
}