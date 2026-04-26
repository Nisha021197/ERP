const db = require('./db');

const STAGE_ORDER = ['planned','material_check','in_progress','assembly','quality_check','packing','completed'];

exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT po.*, p.name as product_name, p.sku as product_sku
      FROM production_orders po JOIN products p ON po.product_id = p.id
      ORDER BY FIELD(po.priority,'urgent','high','medium','low'), po.created_at DESC
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getOne = async (req, res) => {
  try {
    const [[order]] = await db.query(`
      SELECT po.*, p.name as product_name, p.sku as product_sku
      FROM production_orders po JOIN products p ON po.product_id = p.id WHERE po.id=?`, [req.params.id]);
    if (!order) return res.status(404).json({ error: 'Not found' });
    const [logs] = await db.query('SELECT * FROM production_logs WHERE production_order_id=? ORDER BY logged_at DESC', [req.params.id]);
    const [qc] = await db.query('SELECT * FROM quality_checks WHERE production_order_id=? ORDER BY check_date DESC', [req.params.id]);
    const [shipment] = await db.query('SELECT * FROM shipments WHERE production_order_id=? LIMIT 1', [req.params.id]);
    res.json({ ...order, logs, quality_checks: qc, shipment: shipment[0] || null });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.create = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const { product_id, quantity, priority, planned_start, planned_end, notes } = req.body;
    const order_number = 'PRD-' + Date.now();
    const [result] = await conn.query(
      'INSERT INTO production_orders (order_number,product_id,quantity,priority,planned_start,planned_end,notes) VALUES (?,?,?,?,?,?,?)',
      [order_number, product_id, quantity, priority || 'medium', planned_start, planned_end, notes]
    );
    await conn.query('INSERT INTO production_logs (production_order_id,stage,notes,operator) VALUES (?,?,?,?)',
      [result.insertId, 'planned', 'Production order created', 'System']);
    await conn.commit();
    res.status(201).json({ id: result.insertId, order_number, message: 'Production order created' });
  } catch (err) { await conn.rollback(); res.status(500).json({ error: err.message }); }
  finally { conn.release(); }
};

exports.advanceStage = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const { notes, operator } = req.body;
    const [[order]] = await conn.query('SELECT * FROM production_orders WHERE id=?', [req.params.id]);
    if (!order) { await conn.rollback(); return res.status(404).json({ error: 'Not found' }); }

    const currentIdx = STAGE_ORDER.indexOf(order.status);
    if (currentIdx === -1 || currentIdx >= STAGE_ORDER.length - 1) {
      await conn.rollback();
      return res.status(400).json({ error: 'Cannot advance stage' });
    }

    const nextStage = STAGE_ORDER[currentIdx + 1];
    const updates = { status: nextStage };
    if (nextStage === 'in_progress') updates.actual_start = new Date();
    if (nextStage === 'completed') updates.actual_end = new Date();

    // Deduct materials when moving to in_progress
    if (nextStage === 'in_progress') {
      const [bom] = await conn.query('SELECT * FROM bill_of_materials WHERE product_id=?', [order.product_id]);
      for (const b of bom) {
        const needed = b.quantity_required * order.quantity;
        const [[mat]] = await conn.query('SELECT current_stock FROM raw_materials WHERE id=?', [b.material_id]);
        if (mat.current_stock < needed) {
          await conn.rollback();
          return res.status(400).json({ error: `Insufficient stock for material ID ${b.material_id}` });
        }
        const newStock = mat.current_stock - needed;
        const newStatus = newStock <= 0 ? 'out_of_stock' : 'available';
        await conn.query('UPDATE raw_materials SET current_stock=?, status=? WHERE id=?', [newStock, newStatus, b.material_id]);
        await conn.query('INSERT INTO stock_transactions (material_id,type,quantity,reference_id,reference_type,notes) VALUES (?,?,?,?,?,?)',
          [b.material_id, 'consumption', -needed, order.id, 'production_order', `Used in ${order.order_number}`]);
      }
    }

    // Update product stock on completion
    if (nextStage === 'completed') {
      await conn.query('UPDATE products SET current_stock = current_stock + ? WHERE id=?', [order.quantity, order.product_id]);
    }

    await conn.query('UPDATE production_orders SET status=?, actual_start=COALESCE(actual_start, ?), actual_end=? WHERE id=?',
      [nextStage, updates.actual_start || order.actual_start, updates.actual_end || null, req.params.id]);
    await conn.query('INSERT INTO production_logs (production_order_id,stage,notes,operator) VALUES (?,?,?,?)',
      [req.params.id, nextStage, notes || `Advanced to ${nextStage}`, operator || 'System']);
    await conn.commit();
    res.json({ message: `Advanced to ${nextStage}`, stage: nextStage });
  } catch (err) { await conn.rollback(); res.status(500).json({ error: err.message }); }
  finally { conn.release(); }
};

exports.remove = async (req, res) => {
  try {
    await db.query('UPDATE production_orders SET status="cancelled" WHERE id=?', [req.params.id]);
    res.json({ message: 'Cancelled' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

