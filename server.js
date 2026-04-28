// Node.js + Express backend
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API: track click events
app.post('/api/track', (req, res) => {
  const log = { ...req.body, ip: req.ip, ua: req.get('user-agent') };
  console.log('[TRACK]', log);
  // Append to events.log
  fs.appendFile(
    path.join(__dirname, 'events.log'),
    JSON.stringify(log) + '\n',
    () => {}
  );
  res.json({ ok: true });
});

// API: contact form (example)
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  console.log('[CONTACT]', { name, email, message });
  res.json({ ok: true, message: 'Thanks for contacting us!' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.listen(PORT, () => {
  console.log(`✓ Server running at http://localhost:${PORT}`);
});
