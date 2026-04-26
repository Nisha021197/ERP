const db = require('./db');

exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.*, po.order_number, p.name as product_name
      FROM shipments s
      LEFT JOIN production_orders po ON s.production_order_id = po.id
      LEFT JOIN products p ON po.product_id = p.id
      ORDER BY s.created_at DESC
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getOne = async (req, res) => {
  try {
    const [[row]] = await db.query(`
      SELECT s.*, po.order_number, p.name as product_name
      FROM shipments s
      LEFT JOIN production_orders po ON s.production_order_id = po.id
      LEFT JOIN products p ON po.product_id = p.id
      WHERE s.id=?`, [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const { production_order_id, customer_name, customer_address, quantity, carrier, notes } = req.body;
    const shipment_number = 'SHP-' + Date.now();
    const [result] = await db.query(
      'INSERT INTO shipments (shipment_number,production_order_id,customer_name,customer_address,quantity,carrier,notes) VALUES (?,?,?,?,?,?,?)',
      [shipment_number, production_order_id, customer_name, customer_address, quantity, carrier, notes]
    );
    res.status(201).json({ id: result.insertId, shipment_number, message: 'Shipment created' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status, tracking_number } = req.body;
    const timestamps = {};
    if (status === 'ready') timestamps.packed_at = new Date();
    if (status === 'dispatched') timestamps.dispatched_at = new Date();
    if (status === 'delivered') timestamps.delivered_at = new Date();
    await db.query('UPDATE shipments SET status=?, tracking_number=COALESCE(?,tracking_number), packed_at=COALESCE(?,packed_at), dispatched_at=COALESCE(?,dispatched_at), delivered_at=COALESCE(?,delivered_at) WHERE id=?',
      [status, tracking_number || null, timestamps.packed_at || null, timestamps.dispatched_at || null, timestamps.delivered_at || null, req.params.id]);
    res.json({ message: 'Status updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
