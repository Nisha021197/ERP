const express = require('express');
const router = express.Router();

const dashboardController = require('./dashboardController');
const supplierController = require('./supplierController');
const materialController = require('./materialController');
const purchaseController = require('./purchaseController');
const productController = require('./productController');
const productionController = require('./productionController');
const qualityController = require('./qualityController');
const shipmentController = require('./shipmentController');
const authController = require('./authController');
const employeeController = require('./employeeController');
const userRightsController = require('./userRightsController');

// Auth
router.post('/auth/login', authController.login);
router.post('/auth/change-password', authController.changePassword);

// Dashboard
router.get('/dashboard', dashboardController.getSummary);

// Suppliers
router.get('/suppliers', supplierController.getAll);
router.get('/suppliers/:id', supplierController.getOne);
router.post('/suppliers', supplierController.create);
router.put('/suppliers/:id', supplierController.update);
router.delete('/suppliers/:id', supplierController.remove);

// Materials
router.get('/materials', materialController.getAll);
router.get('/materials/:id', materialController.getOne);
router.post('/materials', materialController.create);
router.put('/materials/:id', materialController.update);
router.post('/materials/:id/adjust-stock', materialController.adjustStock);
router.delete('/materials/:id', materialController.remove);

// Purchase Orders
router.get('/purchase-orders', purchaseController.getAll);
router.get('/purchase-orders/:id', purchaseController.getOne);
router.post('/purchase-orders', purchaseController.create);
router.patch('/purchase-orders/:id/status', purchaseController.updateStatus);
router.delete('/purchase-orders/:id', purchaseController.remove);

// Products
router.get('/products', productController.getAll);
router.get('/products/:id', productController.getOne);
router.post('/products', productController.create);
router.put('/products/:id', productController.update);
router.delete('/products/:id', productController.remove);

// Production Orders
router.get('/production-orders', productionController.getAll);
router.get('/production-orders/:id', productionController.getOne);
router.post('/production-orders', productionController.create);
router.patch('/production-orders/:id/advance', productionController.advanceStage);
router.delete('/production-orders/:id', productionController.remove);

// Quality
router.get('/quality-checks', qualityController.getAll);
router.get('/quality-checks/stats', qualityController.getStats);
router.post('/quality-checks', qualityController.create);

// Shipments
router.get('/shipments', shipmentController.getAll);
router.get('/shipments/:id', shipmentController.getOne);
router.post('/shipments', shipmentController.create);
router.patch('/shipments/:id/status', shipmentController.updateStatus);

// Employees
router.get('/employees', employeeController.getAll);
router.post('/employees', employeeController.create);
router.put('/employees/:id', employeeController.update);
router.delete('/employees/:id', employeeController.remove);

// User Rights
router.get('/user-rights', userRightsController.getRights);
router.post('/user-rights/update', userRightsController.updateRights);
router.post('/user-rights/reset', userRightsController.resetDefaults);

module.exports = router;


