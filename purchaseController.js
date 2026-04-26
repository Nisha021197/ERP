const db = require('./db');

exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT po.*, s.name as supplier_name, COUNT(poi.id) as item_count
      FROM purchase_orders po
      JOIN suppliers s ON po.supplier_id = s.id
      LEFT JOIN purchase_order_items poi ON po.id = poi.po_id
      GROUP BY po.id ORDER BY po.created_at DESC
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getOne = async (req, res) => {
  try {
    const [[po]] = await db.query(`
      SELECT po.*, s.name as supplier_name, s.email as supplier_email, s.phone as supplier_phone
      FROM purchase_orders po JOIN suppliers s ON po.supplier_id = s.id WHERE po.id=?`, [req.params.id]);
    if (!po) return res.status(404).json({ error: 'Not found' });
    const [items] = await db.query(`
      SELECT poi.*, rm.name as material_name, rm.unit, rm.sku
      FROM purchase_order_items poi JOIN raw_materials rm ON poi.material_id = rm.id WHERE poi.po_id=?`, [req.params.id]);
    res.json({ ...po, items });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.create = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const { supplier_id, order_date, expected_delivery, notes, items } = req.body;
    const po_number = 'PO-' + Date.now();
    const total_amount = items.reduce((s, i) => s + (i.quantity * i.unit_price), 0);
    const [result] = await conn.query(
      'INSERT INTO purchase_orders (po_number,supplier_id,order_date,expected_delivery,total_amount,notes) VALUES (?,?,?,?,?,?)',
      [po_number, supplier_id, order_date, expected_delivery, total_amount, notes]
    );
    const poId = result.insertId;
    for (const item of items) {
      await conn.query('INSERT INTO purchase_order_items (po_id,material_id,quantity,unit_price) VALUES (?,?,?,?)',
        [poId, item.material_id, item.quantity, item.unit_price]);
    }
    await conn.commit();
    res.status(201).json({ id: poId, po_number, message: 'Purchase order created' });
  } catch (err) { await conn.rollback(); res.status(500).json({ error: err.message }); }
  finally { conn.release(); }
};

exports.updateStatus = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const { status, actual_delivery } = req.body;
    await conn.query('UPDATE purchase_orders SET status=?, actual_delivery=? WHERE id=?',
      [status, actual_delivery || null, req.params.id]);

    if (status === 'received') {
      const [items] = await conn.query('SELECT * FROM purchase_order_items WHERE po_id=?', [req.params.id]);
      for (const item of items) {
        await conn.query('UPDATE raw_materials SET current_stock = current_stock + ?, status = CASE WHEN current_stock + ? > min_stock_level THEN "available" ELSE status END WHERE id=?',
          [item.quantity, item.quantity, item.material_id]);
        await conn.query('INSERT INTO stock_transactions (material_id,type,quantity,reference_id,reference_type,notes) VALUES (?,?,?,?,?,?)',
          [item.material_id, 'purchase', item.quantity, req.params.id, 'purchase_order', 'Auto-received from PO']);
        await conn.query('UPDATE purchase_order_items SET received_qty=quantity WHERE po_id=?', [req.params.id]);
      }
    }
    await conn.commit();
    res.json({ message: 'Status updated' });
  } catch (err) { await conn.rollback(); res.status(500).json({ error: err.message }); }
  finally { conn.release(); }
};

exports.remove = async (req, res) => {
  try {
    await db.query('DELETE FROM purchase_orders WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
