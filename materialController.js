const db = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT rm.*, s.name as supplier_name 
      FROM raw_materials rm 
      LEFT JOIN suppliers s ON rm.supplier_id = s.id 
      ORDER BY rm.created_at DESC
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getOne = async (req, res) => {
  try {
    const [[row]] = await db.query(`
      SELECT rm.*, s.name as supplier_name 
      FROM raw_materials rm 
      LEFT JOIN suppliers s ON rm.supplier_id = s.id 
      WHERE rm.id=?`, [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Not found' });
    const [txns] = await db.query('SELECT * FROM stock_transactions WHERE material_id=? ORDER BY created_at DESC LIMIT 10', [req.params.id]);
    res.json({ ...row, transactions: txns });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const { name, sku, category, unit, current_stock, min_stock_level, unit_cost, supplier_id, description } = req.body;
    const status = current_stock <= 0 ? 'out_of_stock' : current_stock <= min_stock_level ? 'low_stock' : 'available';
    const [result] = await db.query(
      'INSERT INTO raw_materials (name,sku,category,unit,current_stock,min_stock_level,unit_cost,supplier_id,description,status) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [name, sku, category, unit, current_stock || 0, min_stock_level || 0, unit_cost || 0, supplier_id, description, status]
    );
    res.status(201).json({ id: result.insertId, message: 'Material created' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const { name, sku, category, unit, current_stock, min_stock_level, unit_cost, supplier_id, description } = req.body;
    const status = current_stock <= 0 ? 'out_of_stock' : current_stock <= min_stock_level ? 'low_stock' : 'available';
    await db.query(
      'UPDATE raw_materials SET name=?,sku=?,category=?,unit=?,current_stock=?,min_stock_level=?,unit_cost=?,supplier_id=?,description=?,status=? WHERE id=?',
      [name, sku, category, unit, current_stock, min_stock_level, unit_cost, supplier_id, description, status, req.params.id]
    );
    res.json({ message: 'Updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.adjustStock = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const { quantity, type, notes } = req.body; // type: adjustment|return
    const [[mat]] = await conn.query('SELECT * FROM raw_materials WHERE id=?', [req.params.id]);
    if (!mat) { await conn.rollback(); return res.status(404).json({ error: 'Not found' }); }
    const newStock = parseFloat(mat.current_stock) + parseFloat(quantity);
    if (newStock < 0) { await conn.rollback(); return res.status(400).json({ error: 'Insufficient stock' }); }
    const newStatus = newStock <= 0 ? 'out_of_stock' : newStock <= mat.min_stock_level ? 'low_stock' : 'available';
    await conn.query('UPDATE raw_materials SET current_stock=?, status=? WHERE id=?', [newStock, newStatus, req.params.id]);
    await conn.query('INSERT INTO stock_transactions (material_id,type,quantity,notes) VALUES (?,?,?,?)', [req.params.id, type || 'adjustment', quantity, notes]);
    await conn.commit();
    res.json({ message: 'Stock adjusted', new_stock: newStock });
  } catch (err) { await conn.rollback(); res.status(500).json({ error: err.message }); }
  finally { conn.release(); }
};

exports.remove = async (req, res) => {
  try {
    await db.query('DELETE FROM raw_materials WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
