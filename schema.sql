-- ============================================================
--  Manufacturing ERP - Complete Database Schema
--  Compatible with: MySQL 5.7+ / WAMP
-- ============================================================

CREATE DATABASE IF NOT EXISTS manufacturing_erp;
USE manufacturing_erp;

-- ─────────────────────────────────────────────
-- 1. SUPPLIERS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS suppliers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  contact_person VARCHAR(150),
  email VARCHAR(150),
  phone VARCHAR(30),
  address TEXT,
  status ENUM('active','inactive') DEFAULT 'active',
  rating TINYINT DEFAULT 5 COMMENT '1-5 star rating',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────
-- 2. RAW MATERIALS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS raw_materials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  sku VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(100),
  unit VARCHAR(50) NOT NULL COMMENT 'kg, litre, piece, etc.',
  current_stock DECIMAL(12,3) DEFAULT 0,
  min_stock_level DECIMAL(12,3) DEFAULT 0,
  unit_cost DECIMAL(12,2) DEFAULT 0,
  supplier_id INT,
  description TEXT,
  status ENUM('available','low_stock','out_of_stock') DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
);

-- ─────────────────────────────────────────────
-- 3. PURCHASE ORDERS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS purchase_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  po_number VARCHAR(100) UNIQUE NOT NULL,
  supplier_id INT NOT NULL,
  status ENUM('draft','sent','confirmed','received','cancelled') DEFAULT 'draft',
  order_date DATE NOT NULL,
  expected_delivery DATE,
  actual_delivery DATE,
  total_amount DECIMAL(14,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);

CREATE TABLE IF NOT EXISTS purchase_order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  po_id INT NOT NULL,
  material_id INT NOT NULL,
  quantity DECIMAL(12,3) NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL,
  received_qty DECIMAL(12,3) DEFAULT 0,
  subtotal DECIMAL(14,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  FOREIGN KEY (po_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (material_id) REFERENCES raw_materials(id)
);

-- ─────────────────────────────────────────────
-- 4. PRODUCTS (Finished Goods)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  sku VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(100),
  description TEXT,
  unit_price DECIMAL(12,2) DEFAULT 0,
  current_stock INT DEFAULT 0,
  status ENUM('active','discontinued') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bill of Materials
CREATE TABLE IF NOT EXISTS bill_of_materials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  material_id INT NOT NULL,
  quantity_required DECIMAL(12,3) NOT NULL,
  unit VARCHAR(50),
  notes TEXT,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (material_id) REFERENCES raw_materials(id),
  UNIQUE KEY uq_product_material (product_id, material_id)
);

-- ─────────────────────────────────────────────
-- 5. PRODUCTION ORDERS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS production_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(100) UNIQUE NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  status ENUM('planned','material_check','in_progress','assembly','quality_check','packing','completed','cancelled') DEFAULT 'planned',
  priority ENUM('low','medium','high','urgent') DEFAULT 'medium',
  planned_start DATE,
  planned_end DATE,
  actual_start DATETIME,
  actual_end DATETIME,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Production Stage Logs
CREATE TABLE IF NOT EXISTS production_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  production_order_id INT NOT NULL,
  stage ENUM('planned','material_check','in_progress','assembly','quality_check','packing','completed','cancelled'),
  notes TEXT,
  operator VARCHAR(150),
  logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (production_order_id) REFERENCES production_orders(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────
-- 6. QUALITY CHECKS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quality_checks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  production_order_id INT NOT NULL,
  inspector VARCHAR(150),
  check_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  result ENUM('pass','fail','rework') NOT NULL,
  defects_found TEXT,
  actions_taken TEXT,
  approved_qty INT DEFAULT 0,
  rejected_qty INT DEFAULT 0,
  notes TEXT,
  FOREIGN KEY (production_order_id) REFERENCES production_orders(id)
);

-- ─────────────────────────────────────────────
-- 7. PACKING & DISTRIBUTION
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shipments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  shipment_number VARCHAR(100) UNIQUE NOT NULL,
  production_order_id INT,
  customer_name VARCHAR(200),
  customer_address TEXT,
  quantity INT NOT NULL,
  carrier VARCHAR(150),
  tracking_number VARCHAR(200),
  status ENUM('packing','ready','dispatched','in_transit','delivered','returned') DEFAULT 'packing',
  packed_at DATETIME,
  dispatched_at DATETIME,
  delivered_at DATETIME,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (production_order_id) REFERENCES production_orders(id)
);

-- ─────────────────────────────────────────────
-- 8. STOCK TRANSACTIONS (Audit Trail)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stock_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  material_id INT NOT NULL,
  type ENUM('purchase','consumption','adjustment','return') NOT NULL,
  quantity DECIMAL(12,3) NOT NULL,
  reference_id INT COMMENT 'PO id or Production order id',
  reference_type VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (material_id) REFERENCES raw_materials(id)
);

-- ─────────────────────────────────────────────
-- SEED DATA
-- ─────────────────────────────────────────────

INSERT INTO suppliers (name, contact_person, email, phone, address, rating) VALUES
('Tata Steel Ltd', 'Ramesh Kumar', 'ramesh@tatasteel.com', '+91-9876543210', 'Mumbai, Maharashtra', 5),
('Reliance Polymers', 'Priya Sharma', 'priya@rpolymers.com', '+91-9123456789', 'Jamnagar, Gujarat', 4),
('Global Chemicals Co', 'Arun Nair', 'arun@globalchem.in', '+91-9988776655', 'Pune, Maharashtra', 3),
('Bharat Electronics', 'Sunita Reddy', 'sunita@bharatelec.in', '+91-9871234560', 'Bengaluru, Karnataka', 5);

INSERT INTO raw_materials (name, sku, category, unit, current_stock, min_stock_level, unit_cost, supplier_id) VALUES
('Steel Rods 10mm', 'RM-STL-001', 'Metal', 'kg', 5000, 1000, 85.00, 1),
('Aluminium Sheets', 'RM-ALU-002', 'Metal', 'kg', 1200, 500, 210.00, 1),
('ABS Plastic Granules', 'RM-PLA-003', 'Polymer', 'kg', 800, 300, 120.00, 2),
('Industrial Lubricant', 'RM-LUB-004', 'Chemical', 'litre', 150, 50, 350.00, 3),
('Circuit Boards', 'RM-PCB-005', 'Electronics', 'piece', 200, 50, 1200.00, 4),
('Copper Wire 2mm', 'RM-COP-006', 'Metal', 'metre', 3000, 500, 45.00, 1),
('Rubber Gaskets', 'RM-RUB-007', 'Polymer', 'piece', 500, 100, 25.00, 2),
('Paint - Industrial Blue', 'RM-PNT-008', 'Chemical', 'litre', 80, 20, 450.00, 3);

INSERT INTO products (name, sku, category, description, unit_price) VALUES
('Industrial Motor Mk2', 'FG-MOT-001', 'Machinery', 'Heavy duty 3-phase industrial motor', 45000.00),
('Control Panel Unit', 'FG-CPU-002', 'Electronics', 'Modular control panel with PLC integration', 28000.00),
('Pump Assembly A3', 'FG-PMP-003', 'Machinery', 'High-pressure centrifugal pump assembly', 18500.00);

INSERT INTO bill_of_materials (product_id, material_id, quantity_required, unit) VALUES
(1, 1, 25.0, 'kg'), (1, 2, 10.0, 'kg'), (1, 4, 2.0, 'litre'), (1, 6, 50.0, 'metre'), (1, 7, 8, 'piece'),
(2, 5, 3, 'piece'), (2, 3, 5.0, 'kg'), (2, 6, 30.0, 'metre'),
(3, 1, 15.0, 'kg'), (3, 4, 1.5, 'litre'), (3, 7, 12, 'piece');

INSERT INTO purchase_orders (po_number, supplier_id, status, order_date, expected_delivery, total_amount) VALUES
('PO-2026-001', 1, 'confirmed', '2026-04-01', '2026-04-15', 850000.00),
('PO-2026-002', 2, 'received', '2026-03-20', '2026-04-05', 120000.00),
('PO-2026-003', 4, 'sent', '2026-04-20', '2026-05-01', 240000.00);

INSERT INTO production_orders (order_number, product_id, quantity, status, priority, planned_start, planned_end) VALUES
('PRD-2026-001', 1, 10, 'in_progress', 'high', '2026-04-10', '2026-04-25'),
('PRD-2026-002', 2, 5, 'assembly', 'medium', '2026-04-15', '2026-04-28'),
('PRD-2026-003', 3, 8, 'quality_check', 'urgent', '2026-04-08', '2026-04-22'),
('PRD-2026-004', 1, 3, 'planned', 'low', '2026-05-01', '2026-05-15');

INSERT INTO quality_checks (production_order_id, inspector, result, approved_qty, rejected_qty, notes) VALUES
(3, 'Vikram Singh', 'pass', 7, 1, 'One unit had minor surface defect - sent for rework');

INSERT INTO shipments (shipment_number, production_order_id, customer_name, customer_address, quantity, carrier, status) VALUES
('SHP-2026-001', 3, 'Infosys Ltd', 'Electronic City, Bengaluru', 6, 'Blue Dart', 'dispatched'),
('SHP-2026-002', 2, 'Wipro Technologies', 'Sarjapur Road, Bengaluru', 4, 'DTDC', 'packing');
