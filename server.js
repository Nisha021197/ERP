require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./index');

const app = express();

app.use(cors({ 
  origin: process.env.CLIENT_URL || 'http://localhost:3000', 
  credentials: true 
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`ERP Backend running on http://localhost:${PORT}`));