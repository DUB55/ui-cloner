import React, { useState } from 'react';
import axios from 'axios';
import Canvas from './components/Canvas';


export default function App() {
const [url, setUrl] = useState('https://example.com');
const [loading, setLoading] = useState(false);
const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
const [nodes, setNodes] = useState<any[]>([]);
const [error, setError] = useState<string | null>(null);


async function handleRender() {
setError(null);
setLoading(true);
try {
const res = await axios.post('/api/render', { url });
setScreenshotUrl(res.data.screenshotUrl);
setNodes(res.data.nodes || []);
} catch (err: any) {
console.error(err);
setError(err?.response?.data?.error || err.message || 'Unknown error');
} finally {
setLoading(false);
}
}


return (
<div className="app-root">
<header className="topbar">
<h1>ui-cloner — Phase 1</h1>
<div className="url-form">
<input value={url} onChange={e => setUrl(e.target.value)} style={{ width: 600 }} />
<button onClick={handleRender} disabled={loading}>{loading ? 'Rendering...' : 'Render'}</button>
</div>
</header>


<main className="main">
{error && <div className="error">Error: {error}</div>}
<Canvas screenshotUrl={screenshotUrl} nodes={nodes} />
</main>
</div>
)
}