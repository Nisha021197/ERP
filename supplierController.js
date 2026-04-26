const db = require('./db');

exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM suppliers ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getOne = async (req, res) => {
  try {
    const [[row]] = await db.query('SELECT * FROM suppliers WHERE id=?', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const { name, contact_person, email, phone, address, rating } = req.body;
    const [result] = await db.query(
      'INSERT INTO suppliers (name,contact_person,email,phone,address,rating) VALUES (?,?,?,?,?,?)',
      [name, contact_person, email, phone, address, rating || 5]
    );
    res.status(201).json({ id: result.insertId, message: 'Supplier created' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const { name, contact_person, email, phone, address, status, rating } = req.body;
    await db.query(
      'UPDATE suppliers SET name=?,contact_person=?,email=?,phone=?,address=?,status=?,rating=? WHERE id=?',
      [name, contact_person, email, phone, address, status, rating, req.params.id]
    );
    res.json({ message: 'Updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.remove = async (req, res) => {
  try {
    await db.query('DELETE FROM suppliers WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
