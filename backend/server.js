// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

require('dotenv').config();

const PORT = process.env.PORT || 3000;
const TIMEOUT_MS = parseInt(process.env.TIMEOUT_MS || '30000', 10);

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(cors());

const TMP_DIR = path.join(__dirname, 'tmp');
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

// Simple health
app.get('/api/health', (req, res) => res.json({ ok: true }));

// POST /api/render { url }
app.post('/api/render', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'missing url' });

  let browser;
  try {
    browser = await chromium.launch({ args: ['--no-sandbox'] });
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();

    await page.goto(url, { waitUntil: 'networkidle', timeout: TIMEOUT_MS });

    // Full page screenshot
    const filename = `screenshot-${Date.now()}.png`;
    const filepath = path.join(TMP_DIR, filename);
    const screenshotBuffer = await page.screenshot({ fullPage: true });
    fs.writeFileSync(filepath, screenshotBuffer);

    // Serialize visible nodes (limit)
    const nodes = await page.evaluate(() => {
      function serialize(el) {
        const r = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        const props = ['display','position','width','height','color','backgroundColor','fontSize','fontFamily','fontWeight','lineHeight','textAlign','overflow','border','borderRadius'];
        const picked = {};
        props.forEach(p => { try { picked[p] = style.getPropertyValue(p); } catch(e) { picked[p]=null; } });
        return {
          tag: el.tagName.toLowerCase(),
          id: el.id || null,
          class: el.className || null,
          text: el.innerText ? el.innerText.slice(0, 300) : null,
          html: (el.tagName.toLowerCase() === 'img') ? null : el.innerHTML,
          bbox: { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) },
          styles: picked,
          src: el.tagName.toLowerCase() === 'img' ? (el.currentSrc || el.src) : null
        };
      }

      const all = Array.from(document.querySelectorAll('*'));
      const visible = all.filter(e => {
        try {
          const s = window.getComputedStyle(e);
          const r = e.getBoundingClientRect();
          return s && s.display !== 'none' && s.visibility !== 'hidden' && r.width > 0 && r.height > 0;
        } catch (err) { return false; }
      }).slice(0, 500);

      return visible.map(serialize);
    });

    await browser.close();

    const host = req.get('host');
    const protocol = req.protocol;
    const screenshotUrl = `${protocol}://${host}/tmp/${filename}`;

    res.json({ screenshotUrl, nodes, sourceUrl: url });
  } catch (err) {
    if (browser) await browser.close();
    console.error('Render error:', err);
    res.status(500).json({ error: String(err) });
  }
});

// Static serve tmp files
app.use('/tmp', express.static(TMP_DIR));

app.listen(PORT, () => console.log(`ui-cloner backend listening on http://localhost:${PORT}`));
