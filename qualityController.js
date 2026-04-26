const db = require('./db');

exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT qc.*, po.order_number, p.name as product_name
      FROM quality_checks qc
      JOIN production_orders po ON qc.production_order_id = po.id
      JOIN products p ON po.product_id = p.id
      ORDER BY qc.check_date DESC
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const { production_order_id, inspector, result, defects_found, actions_taken, approved_qty, rejected_qty, notes } = req.body;
    const [ins] = await db.query(
      'INSERT INTO quality_checks (production_order_id,inspector,result,defects_found,actions_taken,approved_qty,rejected_qty,notes) VALUES (?,?,?,?,?,?,?,?)',
      [production_order_id, inspector, result, defects_found, actions_taken, approved_qty || 0, rejected_qty || 0, notes]
    );
    res.status(201).json({ id: ins.insertId, message: 'Quality check recorded' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getStats = async (req, res) => {
  try {
    const [[stats]] = await db.query(`
      SELECT 
        COUNT(*) as total_checks,
        SUM(CASE WHEN result='pass' THEN 1 ELSE 0 END) as passed,
        SUM(CASE WHEN result='fail' THEN 1 ELSE 0 END) as failed,
        SUM(CASE WHEN result='rework' THEN 1 ELSE 0 END) as rework,
        SUM(approved_qty) as total_approved,
        SUM(rejected_qty) as total_rejected
      FROM quality_checks
    `);
    res.json(stats);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

