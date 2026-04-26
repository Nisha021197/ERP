const pool = require('./db');

const PAGES = [
  { path: '/suppliers', label: 'Suppliers' },
  { path: '/materials', label: 'Raw Materials' },
  { path: '/purchase-orders', label: 'Purchase Orders' },
  { path: '/products', label: 'Product Design' },
  { path: '/production', label: 'Production Orders' },
  { path: '/quality', label: 'Quality Check' },
  { path: '/shipments', label: 'Packing & Distribution' },
  { path: '/employees', label: 'Employees' },
  { path: '/user-rights', label: 'User Rights' },
];

exports.getRights = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM role_page_rights');
    res.json({ pages: PAGES, rights: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateRights = async (req, res) => {
  try {
    const { role_name, page_path, allowed } = req.body;
    
    if (allowed) {
      await pool.query(
        'INSERT IGNORE INTO role_page_rights (role_name, page_path) VALUES (?,?)',
        [role_name, page_path]
      );
    } else {
      await pool.query(
        'DELETE FROM role_page_rights WHERE role=? AND page_path=?',
        [role_name, page_path]
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.resetDefaults = async (req, res) => {
  try {
    await pool.query('DELETE FROM role_page_rights');
    const defaults = [
      ['admin', '/suppliers'], ['admin', '/materials'], ['admin', '/purchase-orders'],
      ['admin', '/products'], ['admin', '/production'], ['admin', '/quality'],
      ['admin', '/shipments'], ['admin', '/employees'], ['admin', '/user-rights'],
      ['purchase', '/suppliers'], ['purchase', '/materials'], ['purchase', '/purchase-orders'],
      ['production', '/products'], ['production', '/production'], ['production', '/quality'],
      ['production', '/shipments'],
    ];
    for (const [role_name, page_path] of defaults) {
      await pool.query('INSERT INTO role_page_rights (role_name, page_path) VALUES (?,?)', [role_name, page_path]);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


