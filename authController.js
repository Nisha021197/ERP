const pool = require('./db');

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    // Find employee by email
    const [employees] = await pool.query(
      'SELECT * FROM employees WHERE email = ? AND status = "active"', [email]
    );
    if (employees.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const employee = employees[0];

    // Find app_user for this employee
    const [users] = await pool.query(
      'SELECT * FROM app_users WHERE employee_id = ? AND status = "active"', [employee.id]
    );
    if (users.length === 0) return res.status(401).json({ error: 'No active user account found' });

    const user = users[0];

    // Check password (plain text for now)
    if (user.password !== password) return res.status(401).json({ error: 'Invalid credentials' });

    // Get allowed pages for this role
    const [pages] = await pool.query(
      'SELECT page_path FROM role_page_rights WHERE role_name = ?', [user.role]
    );

    res.json({
      success: true,
      user: {
        id: user.id,
        employee_id: employee.id,
        name: employee.name,
        email: employee.email,
        role: user.role,
        department: employee.department,
        designation: employee.designation,
      },
      allowed_pages: pages.map(p => p.page_path)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { user_id, old_password, new_password } = req.body;
    const [users] = await pool.query('SELECT * FROM app_users WHERE id = ?', [user_id]);
    if (users.length === 0) return res.status(404).json({ error: 'User not found' });

    if (users[0].password !== old_password) return res.status(401).json({ error: 'Old password incorrect' });

    await pool.query('UPDATE app_users SET password = ? WHERE id = ?', [new_password, user_id]);
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

