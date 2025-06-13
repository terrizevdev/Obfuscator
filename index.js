const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint for obfuscation (optional)
app.post('/api/obfuscate', express.json(), (req, res) => {
  // This would be used if you want server-side obfuscation
  // Currently using client-side obfuscation
  res.status(501).json({ error: "Server-side obfuscation not implemented" });
});

// All other routes serve the index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});