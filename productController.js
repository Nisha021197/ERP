const db = require('./db');

exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getOne = async (req, res) => {
  try {
    const [[product]] = await db.query('SELECT * FROM products WHERE id=?', [req.params.id]);
    if (!product) return res.status(404).json({ error: 'Not found' });
    const [bom] = await db.query(`
      SELECT bom.*, rm.name as material_name, rm.sku, rm.unit as material_unit, rm.current_stock, rm.unit_cost
      FROM bill_of_materials bom 
      JOIN raw_materials rm ON bom.material_id = rm.id 
      WHERE bom.product_id=?`, [req.params.id]);
    res.json({ ...product, bom });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.create = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const { name, sku, category, description, unit_price, bom } = req.body;
    const [result] = await conn.query(
      'INSERT INTO products (name,sku,category,description,unit_price) VALUES (?,?,?,?,?)',
      [name, sku, category, description, unit_price || 0]
    );
    const productId = result.insertId;
    if (bom && bom.length > 0) {
      for (const b of bom) {
        await conn.query('INSERT INTO bill_of_materials (product_id,material_id,quantity_required,unit,notes) VALUES (?,?,?,?,?)',
          [productId, b.material_id, b.quantity_required, b.unit, b.notes || '']);
      }
    }
    await conn.commit();
    res.status(201).json({ id: productId, message: 'Product created' });
  } catch (err) { await conn.rollback(); res.status(500).json({ error: err.message }); }
  finally { conn.release(); }
};

exports.update = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const { name, sku, category, description, unit_price, status, bom } = req.body;
    await conn.query('UPDATE products SET name=?,sku=?,category=?,description=?,unit_price=?,status=? WHERE id=?',
      [name, sku, category, description, unit_price, status, req.params.id]);
    if (bom) {
      await conn.query('DELETE FROM bill_of_materials WHERE product_id=?', [req.params.id]);
      for (const b of bom) {
        await conn.query('INSERT INTO bill_of_materials (product_id,material_id,quantity_required,unit,notes) VALUES (?,?,?,?,?)',
          [req.params.id, b.material_id, b.quantity_required, b.unit, b.notes || '']);
      }
    }
    await conn.commit();
    res.json({ message: 'Updated' });
  } catch (err) { await conn.rollback(); res.status(500).json({ error: err.message }); }
  finally { conn.release(); }
};

exports.checkFeasibility = async (req, res) => {
  try {
    const { product_id, quantity } = req.query;
    const [bom] = await db.query(`
      SELECT bom.*, rm.name, rm.current_stock, rm.unit
      FROM bill_of_materials bom JOIN raw_materials rm ON bom.material_id = rm.id
      WHERE bom.product_id=?`, [product_id]);
    const feasibility = bom.map(b => ({
      material: b.name,
      required: b.quantity_required * quantity,
      available: b.current_stock,
      sufficient: b.current_stock >= b.quantity_required * quantity,
      unit: b.unit,
    }));
    const feasible = feasibility.every(f => f.sufficient);
    res.json({ feasible, details: feasibility });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.remove = async (req, res) => {
  try {
    await db.query('DELETE FROM products WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
