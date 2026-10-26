require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const app = express();
const PORT = Number(process.env.PORT || 3000);
app.use(cors({ origin: ['http://localhost:4200', 'http://127.0.0.1:4200'] }));
app.use(express.json({ limit: '1mb' }));
let pool;

async function initDatabase() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    waitForConnections: true, connectionLimit: 10, queueLimit: 0
  };
  const dbName = (process.env.DB_NAME || 'ngo_db').replace(/[^a-zA-Z0-9_]/g, '');
  const connection = await mysql.createConnection(config);
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
  await connection.end();
  pool = mysql.createPool({ ...config, database: dbName });
  await pool.query(`CREATE TABLE IF NOT EXISTS volunteers (
    id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(120) NOT NULL,
    email VARCHAR(190) NOT NULL, interest VARCHAR(100) NOT NULL DEFAULT 'Community support',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(120) NOT NULL,
    email VARCHAR(190) NOT NULL, message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
}
function requiredString(value, field, max = 5000) {
  if (typeof value !== 'string' || !value.trim()) {
    const e = new Error(`${field} is required`); e.status = 400; throw e;
  }
  const result = value.trim();
  if (result.length > max) { const e = new Error(`${field} is too long`); e.status = 400; throw e; }
  return result;
}
function validEmail(value) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }

app.get('/api/health', async (_req, res) => {
  try { await pool.query('SELECT 1'); res.json({status:'ok', app:'HopeHands API', database:'connected'}); }
  catch { res.status(500).json({status:'error', message:'Database connection failed'}); }
});
app.post('/api/volunteers', async (req, res, next) => {
  try {
    const name = requiredString(req.body.name, 'Name', 120);
    const email = requiredString(req.body.email, 'Email', 190);
    const interest = requiredString(req.body.interest || 'Community support', 'Interest', 100);
    if (!validEmail(email)) return res.status(400).json({message:'Please provide a valid email address.'});
    const [result] = await pool.execute('INSERT INTO volunteers (name,email,interest) VALUES (?,?,?)',[name,email,interest]);
    res.status(201).json({message:'Volunteer registration received.',id:result.insertId});
  } catch (e) { next(e); }
});
app.post('/api/messages', async (req, res, next) => {
  try {
    const name = requiredString(req.body.name, 'Name', 120);
    const email = requiredString(req.body.email, 'Email', 190);
    const message = requiredString(req.body.message, 'Message', 5000);
    if (!validEmail(email)) return res.status(400).json({message:'Please provide a valid email address.'});
    const [result] = await pool.execute('INSERT INTO messages (name,email,message) VALUES (?,?,?)',[name,email,message]);
    res.status(201).json({message:'Your message has been received.',id:result.insertId});
  } catch (e) { next(e); }
});
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({message:err.status ? err.message : 'Server error. Check backend and database settings.'});
});
initDatabase().then(() => app.listen(PORT, () => console.log(`HopeHands API running at http://localhost:${PORT}`)))
.catch(err => { console.error('Could not start API. Check MySQL settings in .env:', err.message); process.exit(1); });
