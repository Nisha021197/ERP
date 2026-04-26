const db = require('./db');

exports.getSummary = async (req, res) => {
  try {
    const [[matRow]] = await db.query('SELECT COUNT(*) as total, SUM(current_stock * unit_cost) as value FROM raw_materials');
    const [[poRow]] = await db.query("SELECT COUNT(*) as total FROM purchase_orders WHERE status NOT IN ('cancelled')");
    const [[prodRow]] = await db.query("SELECT COUNT(*) as total FROM production_orders WHERE status NOT IN ('completed','cancelled')");
    const [[qcRow]] = await db.query("SELECT COUNT(*) as pass, SUM(rejected_qty) as rejected FROM quality_checks WHERE result='pass'");
    const [[shipRow]] = await db.query("SELECT COUNT(*) as total FROM shipments WHERE status='dispatched' OR status='in_transit'");
    const [lowStock] = await db.query('SELECT * FROM raw_materials WHERE current_stock <= min_stock_level ORDER BY current_stock ASC LIMIT 5');
    const [recentProd] = await db.query(`
      SELECT po.order_number, p.name as product, po.quantity, po.status, po.priority, po.updated_at
      FROM production_orders po JOIN products p ON po.product_id = p.id
      ORDER BY po.updated_at DESC LIMIT 5
    `);

    res.json({
      materials: { total: matRow.total, inventory_value: matRow.value || 0 },
      purchase_orders: { active: poRow.total },
      production: { active: prodRow.total },
      quality: { pass_count: qcRow.pass || 0, rejected: qcRow.rejected || 0 },
      shipments: { in_transit: shipRow.total },
      low_stock_alerts: lowStock,
      recent_production: recentProd,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
