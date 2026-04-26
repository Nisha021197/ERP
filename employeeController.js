const pool = require('./db');

exports.getAll = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT e.*, u.role, u.status as account_status, u.id as user_id
      FROM employees e
      LEFT JOIN app_users u ON u.employee_id = e.id
      ORDER BY e.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { emp_code, name, email, phone, department, designation, role, password } = req.body;
    
    // Create employee
    const [empResult] = await pool.query(
      'INSERT INTO employees (emp_code, name, email, phone, department, designation, status) VALUES (?,?,?,?,?,?,"active")',
      [emp_code, name, email, phone, department, designation]
    );
    
    // Create app_user
    await pool.query(
      'INSERT INTO app_users (employee_id, role, password, status) VALUES (?,?,?,"active")',
      [empResult.insertId, role, password]
    );

    res.json({ success: true, message: 'Employee created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, department, designation, status, role } = req.body;
    
    await pool.query(
      'UPDATE employees SET name=?, email=?, phone=?, department=?, designation=?, status=? WHERE id=?',
      [name, email, phone, department, designation, status, id]
    );

    if (role) {
      await pool.query('UPDATE app_users SET role=? WHERE employee_id=?', [role, id]);
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE app_users SET status="inactive" WHERE employee_id=?', [id]);
    await pool.query('UPDATE employees SET status="inactive" WHERE id=?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
